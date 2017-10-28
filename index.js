const Gun = require("gun/gun");
const { visit } = require("graphql/language")
const graphql = require("graphql-anywhere").default
const tryGet = require("try-get");
const {
  thunkish,
  deferrableOrImmediate,
  arrayOrDeferrable
} = require("./async");

module.exports = function graphqlGun(query, gun) {
  gun = gun || Gun();
  let resultValue = {};
  let subscriptions = {};

  const thunk = thunkish(function(triggerUpdate) {
    // this visit call is a lightweight replacement for graphql anywhere
    visit(query, {
      Field: {
        enter(node, astKey, astParent, astPath, ancestors) {
          const resultKey = tryGet(node,"name.value");
          const ancestorFields = ancestors.filter((a) => tryGet(a, 'kind') === "Field" )
          const parent = ancestorFields[ancestorFields.length-1] || {};
          const path = ancestorFields.map((a) => tryGet(a, 'name.value'));
          const args =  node.arguments.reduce(function(acc, argument) {
            acc[tryGet(argument, "name.value")] = tryGet(argument, "value.value");
            return acc;
          }, {});
          const ref = parent.resultValue || resultValue;
          const chain = path.reduce(function(acc, cur) {
            return acc.get(cur);
          }, gun)
          const isLeaf = node.selectionSet === null
          const directives = node.directives.map(function(n){return n.name.value})

          node.subscribed =
            (parent.subscribed || directives.includes("live")) &&
            !directives.includes("unlive");

          if (isLeaf) {
            if (resultKey === "_chain") {
              ref[resultKey] = chain;
            } else {
              const updater = val => {
                if (!!val && val[resultKey]) {
                  ref[resultKey] = val[resultKey];
                } else {
                  ref[resultKey] = val;
                }
                triggerUpdate(resultValue);
              };
              const stringPath = [...path, resultKey].join(".");
              if (node.subscribed && subscriptions[stringPath] === undefined) {
                subscriptions[stringPath] = chain.get(resultKey).on(updater, true);
              } else {
                // FIXME: make this work with val
                chain.get(resultKey).on(updater).off();
              }
            }
          } else {
            ref[resultKey] = ref[resultKey] || {};
          }

          node.resultValue = ref[resultKey];
        },
      }
    })

    triggerUpdate(resultValue);
  });
  const result = thunk.toPromiseFactory()();
  result.next = thunk.toPromiseFactory();
  result[Symbol.iterator] = function() {
    const factory = thunk.toPromiseFactory();
    return {
      next: () =>
        factory().then(value => ({
          value,
          done: false
        }))
    };
  };
  return result;
};
