function toPromiseFactory(consumer) {
  const results = [];
  const resolves = [];
  consumer(function(result) {
    if (resolves.length > 0) {
      resolves.shift()(result);
    } else {
      results.push(result);
    }
  });

  return function() {
    if (results.length > 0) {
      return Promise.resolve(results.shift());
    } else {
      return new Promise(resolve => resolves.push(resolve));
    }
  };
}

function thunkish(cb) {
  const subscribers = [];
  const results = [];

  cb(function(updatedObj) {
    results.push(updatedObj);
    subscribers.forEach(sub => sub(updatedObj));
  });

  const result = function(subscriber) {
    results.forEach(res => subscriber(res));
    subscribers.push(subscriber);
  };
  result.toPromiseFactory = toPromiseFactory.bind(null, result);
  result.isThunk = true;
  return result;
}

module.exports = {
  thunkish,
  deferrableOrImmediate(obj, fn) {
    if (obj && obj.isThunk) {
      return thunkish(function(sendUpdate) {
        obj(function(updatedObj) {
          fn(updatedObj);
          sendUpdate(updatedObj);
        });
      });
    } else {
      return fn(obj);
    }
  },
  arrayOrDeferrable(arr) {
    const thunks = [];
    const thunkResults = {};
    const result = arr.map(function(obj, i) {
      if (obj && obj.isThunk) {
        thunks.push({ obj, i });
        return undefined;
      } else {
        return obj;
      }
    });
    if (thunks.length === 0) {
      return result;
    } else {
      return thunkish(function(updateArray) {
        thunks.forEach(({ obj: t, i }) => {
          t(function(obj) {
            thunkResults[i] = obj;
            result[i] = obj;

            if (Object.values(thunkResults).length === thunks.length) {
              updateArray(result);
            }
          });
        });
      });
    }
  }
};
