import ResultCollector from "./ResultCollector";
const Gun = require("gun/gun");
const { visit } = require("graphql/language");
const graphql = require("graphql-anywhere").default;
const tryGet = require("try-get");
const {
  thunkish,
  deferrableOrImmediate,
  arrayOrDeferrable
} = require("./async");

function gunOnOnce(chain, updater, resultCollector) {
  const subscriptionHandle = resultCollector.getMeta("subscriptionHandle");
  if (!subscriptionHandle) {
    resultCollector.setMeta("subscriptionHandle", chain.on(updater, true));
  }
}

module.exports = function graphqlGun(query, gun) {
  gun = gun || Gun();
  const resultCollector = new ResultCollector("root", null, true);
  resultCollector.chain = gun;

  function loadSetQuery(ref, node, resultKey, chain) {}

  const thunk = thunkish(function(triggerUpdate) {
    // this visit call is a lightweight replacement for graphql anywhere
    visit(query, {
      Field: {
        enter(node, astKey, astParent, astPath, ancestors) {
          const resultKey = tryGet(node, "name.value");
          const ancestorFields = ancestors.filter(
            a => tryGet(a, "kind") === "Field"
          );
          const path = ancestorFields.map(a => tryGet(a, "name.value"));
          const args = node.arguments.reduce(function(acc, argument) {
            acc[tryGet(argument, "name.value")] = tryGet(
              argument,
              "value.value"
            );
            return acc;
          }, {});
          const isLeaf = node.selectionSet === null;
          const directives = node.directives.map(function(n) {
            return n.name.value;
          });

          node.parent = ancestorFields[ancestorFields.length - 1] || {
            childSubscriptions: [],
            path: [],
            resultCollector
          };
          const parentCollector = node.parent.resultCollector;

          parentCollector.map(resultKey, function(newResultCollector) {
            const subscribed =
              (parentCollector.getMeta("subscribed") ||
                directives.includes("live")) &&
              !directives.includes("unlive");
            newResultCollector.setMeta("subscribed", subscribed);

            const chain = parentCollector.chain;

            if (isLeaf) {
              if (resultKey === "_chain") {
                newResultCollector.value = chain;
              } else {
                const updater = val => {
                  if (!!val && val[resultKey]) {
                    newResultCollector.value = val[resultKey];
                  } else {
                    newResultCollector.value = val;
                  }
                  triggerUpdate(resultCollector);
                };

                gunOnOnce(chain, updater, newResultCollector);
              }
            } else {
              if (args.type === "Set") {
                ref[resultKey] = ref[resultKey] || [];
                const keyList = [];

                const updater = function(data, _key, at) {
                  var gunRef = this; // also `at.gun`
                  Gun.obj.map(data, function(val, field) {
                    // or a for in
                    if (field === "_") return;
                    keyValueSet[field] = keyValueSet[field] || {};
                    resultSet[field] = [keyValueSet[field], gunRef.get(field)];
                  });
                  listRef.splice(
                    0,
                    listRef.length,
                    ...Object.values(keyValueSet)
                  );
                  tryGet(node, "childSubscriptions", []).forEach(function(
                    rerunChild
                  ) {
                    Object.values(resultSet).forEach(function(r) {
                      rerunChild(r[0], r[1]);
                    });
                  });
                };
                gunOnOnce(chain, updater, newResultCollector);
              } else {
                node.resultCollector = node.parent.resultCollector.child(
                  resultKey
                );
              }
            }

            if (!node.subscribed && node.subscriptionHandle) {
              // FIXME: make this work with val
              node.subscriptionHandle.off();
            }
          });
        }
      }
    });

    triggerUpdate(resultCollector);
  });
  const result = thunk.toPromiseFactory()();
  result.next = thunk.toPromiseFactory();
  result[Symbol.iterator] = function() {
    const factory = thunk.toPromiseFactory();
    return { next: () => factory().then(value => ({ value, done: false })) };
  };
  return result;
};
