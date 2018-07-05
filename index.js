const Gun = require("gun/gun");
const graphql = require("graphql-anywhere-async").default;
const {
  thunkish,
  deferrableOrImmediate,
  arrayOrDeferrable
} = require("./async");
const tryGet = require("try-get");

module.exports = function graphqlGun(query, gun) {
  gun = gun || Gun();
  let resultValue = {};
  let subscriptions = {};
  const resolver = (fieldName, container, args, context, info) => {
    let key = info.resultKey;
    const {
      subscribe: parentSubscribed,
      index: indexInList,
      ref: parentRef,
      path,
      chain
    } = container;
    let ref = parentRef;
    let subscribe =
      (parentSubscribed || "live" in tryGet(info, "directives", {})) &&
      !("unlive" in tryGet(info, "directives", {}));

    if (info.isLeaf) {
      if (key === "_chain") {
        ref[key] = chain;
        return chain;
      } else {
        return thunkish(resolve => {
          const updater = val => {
            if (!!val && val[key]) {
              ref[key] = val[key];
              resolve(val[key]);
            } else {
              ref[key] = val;
              resolve(val);
            }
          };
          const stringPath = [...path, key].join(".");
          if (subscribe && subscriptions[stringPath] === undefined) {
            subscriptions[stringPath] = chain.get(key).on(updater, true);
          } else {
            chain.get(key).once(updater);
          }
        });
      }
    } else if (args && args.type === "Set") {
      ref[key] = ref[key] || [];
      ref = ref[key];
      const keyValueSet = {};
      const resultSet = {};

      const t = thunkish(function(rerunChild) {
        const updater = function(data, _key, at) {
          var gunRef = this; // also `at.gun`
          Gun.obj.map(data, function(val, field) {
            // or a for in
            if (field === "_") return;
            keyValueSet[field] = keyValueSet[field] || {};
            resultSet[field] = {
              chain: gunRef.get(field),
              subscribe,
              ref: keyValueSet[field],
              path: [...path, key, field]
            };
          });
          ref.splice(0, ref.length, ...Object.values(keyValueSet));
          rerunChild(Object.values(resultSet));
        };
        chain.get(key).on(updater, true);
      });
      return t;
    } else {
      ref[key] = ref[key] || {};
      return {
        chain: chain.get(key),
        subscribe,
        path: [...path, key],
        ref: ref[key]
      };
    }
  };

  const graphqlOut = graphql(
    resolver,
    query,
    { path: [], ref: resultValue, chain: gun },
    null,
    null,
    {
      deferrableOrImmediate,
      arrayOrDeferrable
    }
  );
  const thunk = thunkish(function(triggerUpdate) {
    triggerUpdate(resultValue);
    if (graphqlOut.isThunk) {
      graphqlOut(function(actualRes) {
        triggerUpdate(resultValue); // TODO: Figure out how to use actualRes instead of tracking resultValue
      });
    }
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
