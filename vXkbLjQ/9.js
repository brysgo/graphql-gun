const Gun = require("gun/gun");
const traverse = require("traverse-async").traverse;

module.exports = function graphqlGun(query, gun) {
  gun = gun || Gun();
  let nextResolve, result, resultValue = {}, refMap = {};
  const iterableObj = () => {
    const nextPromise = new Promise(resolve => nextResolve = resolve);
    return { value: resultValue, next: () => nextPromise };
  };
  const triggerUpdate = () => {
    if (nextResolve) {
      nextResolve(iterableObj());
    }
  };

  let waitCounter = 0;
  let traversed;
  let iter = iterableObj();
  result = iter.next();
  traverse(
    query,
    function(node, next) {
      if (node && typeof node === "object") {
        node.chainPath = Array.from(
          (this.parent && this.parent.chainPath) || []
        );
        node.chain = (this.parent && this.parent.chain) || gun;
        node.refMap = (this.parent && this.parent.refMap) || refMap;
        node.ref = (this.parent && this.parent.ref) || resultValue;
        node.__graphqlContext = (this.parent &&
          this.parent.__graphqlContext) || {};
      }
      if (node && node.kind === "Field") {
        const keyName = node.name.value;
        node.chainPath.push(keyName); // used for debugging
        const parentChain = node.chain;
        node.chain = node.chain.get(keyName);
        const isLeaf = node.selectionSet === null;

        if (isLeaf) {
          if (keyName === "_chain") {
            node.ref[keyName] = parentChain;
          } else {
            if (node.__graphqlContext.isSet) {
              const localMap = {};
              node.chain.on(
                (result, key, chain) => {
                  const prev = chain.via || chain.back;
                  let id = prev.get;
                  if (typeof id === "function") {
                    prev.get(function(ack) {
                      id = ack.get;
                    });
                  }
                  node.refMap[id] = node.refMap[id] || {};
                  node.refMap[id][keyName] = result;
                  node.ref.splice(
                    0,
                    node.ref.length,
                    ...Object.values(node.refMap)
                  );
                  if (traversed && waitCounter <= 0) {
                    triggerUpdate();
                  }
                },
                true
              );
            } else {
              waitCounter++;
              node.chain.on(function(result) {
                waitCounter--;
                node.ref[keyName] = result;
                if (traversed && waitCounter <= 0) {
                  triggerUpdate();
                }
              });
            }
          }
        } else {
          const isSet = node.arguments.some(
            arg => arg.value.kind === "EnumValue" && arg.value.value === "Set"
          );
          if (isSet) {
            node.chain = node.chain.map();
            node.refMap[keyName] = {};
            node.ref[keyName] = [];
            node.chainPath.push("[]"); // for debugging
            node.__graphqlContext.isSet = true;
          } else {
            node.ref[keyName] = {};
          }
          node.ref = node.ref[keyName];
          node.refMap = node.refMap[keyName];
        }
      }
      next();
    },
    function(newObj) {
      traversed = true;
      if (waitCounter === 0) triggerUpdate();
    }
  );
  result = result.then(({ value }) => {
    return value;
  });
  result.next = () => iter.next().then(r => r.value);
  result[Symbol.iterator] = function() {
    return iter;
  };
  return result;
};
