const graphql = require('graphql-anywhere').default;
const { traverse } = require('traverse-async');

const whenTraverse = function(tree) {
  return new Promise(function(resolve) {
    traverse(tree, function(node, next){
      if (this.isRoot) return next();
      const { parent, key } = this;
      Promise.resolve(node).then((res) => {
        parent[key] = res;
        next();
      })
    }, (result) => {
      resolve(result);
    });
  })
}

module.exports = function(query, gun) {
  const resolver = (
    fieldName,
    chain,
    args,
    context,
    info
  ) => {
    let key = info.resultKey;
    if (info.isLeaf) {
      if (key === '_chain') {
        return Promise.resolve(chain);
      } else {
        return new Promise((resolve) => {
          chain.val((val) => {
            resolve(val);
          });
        })
      }
    } else {
      return chain.get(key);
    }
  };
  
  return whenTraverse(graphql(resolver, query, gun));
}