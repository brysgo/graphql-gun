export default class ResultCollector {
  constructor(key, listItemKeys, debug) {
    this._debug = debug;
    if (debug) {
      this.constructor.counter = this.constructor.counter || 0;
      this._uniqId = this.constructor.counter;
      this.constructor.counter++;
    }
    this._key = key;
    this._children = {};
    this._meta = {};
    this._value = null;
    this._listItemKeys = listItemKeys;
  }

  child(key, listItemKeys) {
    if (listItemKeys && !Array.isArray(listItemKeys)) {
      throw new TypeError("Expecting list items keys to be an array");
    }
    const result = this._children[key] || new ResultCollector(key, listItemKeys, this._debug);
    this._children[key] = result;
    result.chain = this.chain.get(key);
    return result;
  }

  map(key, fn) {
    if (this._listItemKeys) {
      return this._listItemKeys.map((childKey) => {
        return fn(this.child(childKey).child(key));
      });
    } else {
      return fn(this.child(key));
    }
  }

  setMeta(key, value) {
    this._meta[key] = value;
  }

  getMeta(key) {
    return this._meta[key];
  }

  get chain() {
    return this._chain;
  }

  set chain(val) {
    this._chain = val;
  }

  get value() {
    return this._value;
  }

  set value(val) {
    this._value = val;
  }
}
