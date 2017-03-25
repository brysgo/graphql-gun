const Gun = require('gun/gun');
const graphql = require('graphql-anywhere').default;

module.exports = function(query, gun) {
  gun = gun || Gun();
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
            if (val[key]) {
              resolve(val[key]);
            } else {
              resolve(val);
            }
          });
        })
      }
    } else if (args && args.type === 'Set') {
      return new Promise((resolve) => {
        const array = [];
        gun.get(key).val(function(data, key, at){
          var ref = this; // also `at.gun`
          Gun.obj.map(data, function(val, field){ // or a for in
            if (field === '_') return;
            array.push(ref.get(field))
          });
          resolve(array);
        });
      });
    } else {
      return Promise.resolve(chain.get(key));
    }
  };
  
  return graphql(resolver, query, gun);
}