const Gun = require("gun/gun");
const graphql = require("graphql-anywhere").default;
const {
  thunkish,
  deferrableOrImmediate,
  arrayOrDeferrable
} = require("./async");

module.exports = function graphqlGun(query, gun) {
  gun = gun || Gun();
  let resultValue = {};
  let subscriptions = {};
  const resolver = (fieldName, chain, args, context, info) => {
    let key = info.resultKey;
    const {
      subscribe: parentSubscribed,
      index: indexInList,
      ref: parentRef,
      path
    } = chain.__graphQLContext;
    let ref = parentRef;
    const withContext = (chain, opts) => {
      chain.__graphQLContext = Object.assign({}, opts);
      return chain;
    };
    let subscribe =
      (parentSubscribed || !!info.directives["live"]) &&
      !info.directives["unlive"];

    if (info.isLeaf) {
      if (key === "_chain") {
        ref[key] = chain;
        return chain;
      } else {
        return thunkish(resolve => {
          const updater = val => {
            if (val[key]) {
              ref[key] = val[key];
            } else {
              ref[key] = val;
            }
            resolve(resultValue);
          };
          const stringPath = [...path, key].join(".");
          if (subscribe && subscriptions[stringPath] === undefined) {
            subscriptions[stringPath] = chain.get(key).on(updater, true);
          } else {
            chain.get(key).val(updater);
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
            resultSet[field] = withContext(gunRef.get(field), {
              subscribe,
              ref: keyValueSet[field],
              path: [...path, key, field]
            });
          });
          ref.splice(0, ref.length, ...Object.values(keyValueSet));
          rerunChild(Object.values(resultSet));
        };
        chain.get(key).on(updater, true);
      });
      return t;
    } else {
      ref[key] = ref[key] || {};
      return withContext(chain.get(key), {
        subscribe,
        path: [...path, key],
        ref: ref[key]
      });
    }
  };

  gun.__graphQLContext = { path: [], ref: resultValue };
  const graphqlOut = graphql(resolver, query, gun, null, null, {
    deferrableOrImmediate,
    arrayOrDeferrable
  });
  const thunk = thunkish(function(triggerUpdate) {
    triggerUpdate(resultValue);
    if (graphqlOut.isThunk) {
      graphqlOut(function() {
        triggerUpdate(resultValue);
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
