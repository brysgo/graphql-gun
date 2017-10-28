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
  const resultValue = {};

  function loadSetQuery(ref, node, resultKey, chain) {
    ref[resultKey] = ref[resultKey] || [];
    const listRef = ref[resultKey];
    const keyValueSet = {};
    const resultSet = {};

    const updater = function(data, _key, at) {
      var gunRef = this; // also `at.gun`
      Gun.obj.map(data, function(val, field) {
        // or a for in
        if (field === "_") return;
        keyValueSet[field] = keyValueSet[field] || {};
        resultSet[field] = [
          keyValueSet[field],
          gunRef.get(field),
        ];
      });
      listRef.splice(0, listRef.length, ...Object.values(keyValueSet));
      tryGet(node, "childSubscriptions", []).forEach(function(rerunChild) {
        Object.values(resultSet).forEach(function(r) {
          rerunChild(r[0], r[1]);
        });
      });
    };
    if (!node.subscriptionHandle) {
      node.subscriptionHandle = chain.get(resultKey).on(updater, true);
    }
  }

  const thunk = thunkish(function(triggerUpdate) {
    // this visit call is a lightweight replacement for graphql anywhere
    visit(query, {
      Field: {
        enter(node, astKey, astParent, astPath, ancestors) {
          node.resultKey = tryGet(node,"name.value");
          const ancestorFields = ancestors.filter((a) => tryGet(a, 'kind') === "Field" )
          node.parent = ancestorFields[ancestorFields.length-1] || { childSubscriptions: [] };
          node.path = ancestorFields.map((a) => tryGet(a, 'name.value'));
          node.args =  node.arguments.reduce(function(acc, argument) {
            acc[tryGet(argument, "name.value")] = tryGet(argument, "value.value");
            return acc;
          }, {});
          const isLeaf = node.selectionSet === null
          const directives = node.directives.map(function(n){return n.name.value})

          node.childSubscriptions = [];
          node.subscribed =
            (node.parent.subscribed || directives.includes("live")) &&
            !directives.includes("unlive");

          node.parent.childSubscriptions.push(function(refArg, chainArg) {
            const ref = (refArg) ? refArg : node.parent.resultValue || resultValue;
            const chain = (chainArg) ? chainArg : node.path.reduce(function(acc, cur) {
              return acc.get(cur);
            }, gun)

            if (Array.isArray(ref)) {
              throw new TypeError("Expected result reference to be an object not an array!");
            }

            if (isLeaf) {
              if (node.resultKey === "_chain") {
                ref[node.resultKey] = chain;
              } else {
                const updater = val => {
                  if (!!val && val[node.resultKey]) {
                    ref[node.resultKey] = val[node.resultKey];
                  } else {
                    ref[node.resultKey] = val;
                  }
                  triggerUpdate(resultValue);
                };
                if (!node.subscriptionHandle) {
                  node.subscriptionHandle = chain.get(node.resultKey).on(updater, true);
                }
              }
            } else {
              if (node.args.type === "Set") {
                loadSetQuery(ref, node, node.resultKey, chain);
              } else {
                ref[node.resultKey] = ref[node.resultKey] || {};
              }
            }

            if (!node.subscribed && node.subscriptionHandle) {
              // FIXME: make this work with val
              node.subscriptionHandle.off();
            }

            node.resultValue = ref[node.resultKey];
          });
          if (tryGet(node.parent,"args.type") !== "Set") {
            node.parent.childSubscriptions[node.parent.childSubscriptions.length-1]();
          }
        },
        leave(node) {
          const ref = node.parent.resultValue || resultValue;
          const chain = node.path.reduce(function(acc, cur) {
              return acc.get(cur);
            }, gun)
          if (tryGet(node,"args.type") !== "Set" && node.childSubscriptions.length > 0) {
            loadSetQuery(ref, node, node.resultKey, chain);
          }
        }
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
