const Gun = require('gun/gun');
const graphql = require('graphql-anywhere').default;

module.exports = function graphqlGun(query, gun) {
  gun = gun || Gun();
  let nextResolve, result, resultValue = {};
  const iterableObj = () => {
    const nextPromise = new Promise((resolve) => nextResolve = resolve);
    return { value: resultValue, next: (() => nextPromise) };
  };
  const triggerUpdate = () => {
    if (nextResolve) {
      nextResolve(iterableObj())
    }
  }
  
  const resolver = (
    fieldName,
    chain,
    args,
    context,
    info
  ) => {
  
    let key = info.resultKey;
    const { path: parentPath, index: indexInList } = chain.__graphQLContext;
    const path = Array.from(parentPath)
    path.push(key);
    const withContext = (chain, index) => {
      chain.__graphQLContext = { path, index };
      return chain;
    }
    let subscribe = info.fieldNode.directives.some((directive) => {
      const target = { kind: 'Name', value: 'live' };
      for(var key in target) {
        if(target[key] !== directive.name[key]) {
            return false;
        }
      }
      return true;
    });
    
    if (info.isLeaf) {
      if (key === '_chain') {
        return Promise.resolve(chain);
      } else {
        return new Promise((resolve) => {
          chain.val((val) => {
            if (val[key]) {
              resolve(val[key]);
            } else {
              resolve(val);
            }
          });
          if (subscribe) {
            chain.on((val) => {
              const newPath = Array.from(parentPath);
              if (indexInList !== undefined) newPath.push(indexInList);
              const ref = newPath.reduce((acc, curr) => {
                return acc[curr]
              }, resultValue);
              if (val[key]) {
                ref[key] = val[key];
              } else {
                ref[key] = val;
              }
              triggerUpdate();
            }, true);
          }
        })
      }
    } else if (args && args.type === 'Set') {
      return new Promise((resolve) => {
        const array = [];
        gun.get(key).val(function(data, key, at){
          var ref = this; // also `at.gun`
          Gun.obj.map(data, function(val, field){ // or a for in
            if (field === '_') return;
            array.push(withContext(ref.get(field), array.length))
          });
          resolve(array);
        });
      });
    } else {
      return Promise.resolve(withContext(chain.get(key)));
    }
  };
  
  gun.__graphQLContext = { path: [] };
  result = graphql(resolver, query, gun);
  result = result.then((value) => {
    Object.assign(resultValue, value);
    triggerUpdate();
    return value;
  });
  result[Symbol.iterator] = function() {
    return iterableObj();
  };
  return result;
}