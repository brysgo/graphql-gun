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
          this.parent.__graphqlContext) || { sets: [] };
      }
      if (node && node.kind === "Field") {
        const keyName = node.name.value;
        node.chainPath.push(keyName);
        const parentChain = node.chain;
        node.chain = node.chain.get(keyName);
        const noSelectionSet = node.selectionSet === null;

        if (noSelectionSet) {
          if (keyName === "_chain") {
            node.ref[keyName] = parentChain;
          } else {
            waitCounter++;
            let lastBefore = node.chain;
            let pathBefore = [node.chain._.get];
            while (this.back(-1) !== last.back(1)) {
              last = last.back(1);
              pathBefore.unshift(last._.get);
            }
            console.log({pathBefore});
            node.chain.on(function(result, key, itemChain) {
              let last = this;
              let path = [this._.get];
              while (this.back(-1) !== last.back(1)) {
                last = last.back(1);
                path.unshift(last._.get);
              }
              console.log(path);
              waitCounter--;
              if (traversed && waitCounter <= 0) {
                triggerUpdate();
              }
            });
          }
        } else {
          const isSet = node.arguments.some(
            arg => arg.value.kind === "EnumValue" && arg.value.value === "Set"
          );
          if (isSet) {
            node.chain = node.chain.map();
            node.refMap[keyName] = {};
            node.ref[keyName] = [];
          } else {
            node.ref[keyName] = {};
          }
          node.ref = node.ref[keyName];
          node.refMap = node.refMap[keyName];
          node.__graphqlContext.sets.push({
            refMap: node.refMap,
            ref: node.ref
          });
        }
      }
      next();
    },
    function(newObj) {
      traversed = true;
      console.log("traversed! ", waitCounter);
      if (waitCounter <= 0) triggerUpdate();
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
