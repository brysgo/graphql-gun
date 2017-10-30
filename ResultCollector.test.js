import ResultCollector from "./ResultCollector";

describe("ResultCollector", () => {
  describe("map", () => {
    it("returns a result collector if there is no list", () => {
      const resultCollector = new ResultCollector("root", null, true);

      const callback = jest.fn(newCollector => {
        expect(newCollector).not.toEqual(resultCollector);
      });

      resultCollector.map("aChildKey", callback);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("iterates over the result collectors for a key", () => {
      const resultCollector = new ResultCollector("root", null, true);

      const callback = jest.fn(newCollector => {
        expect(newCollector).not.toEqual(resultCollector);
      });

      resultCollector.map("aChildKey", callback);

      expect(callback).toHaveBeenCalled();
    });
  });

  describe("child", () => {
    it("creates a new child result collector if none exists", () => {
      const resultCollector = new ResultCollector("root", null, true);
      expect(resultCollector.constructor).toBe(ResultCollector);
      const newResultCollector = resultCollector.child("aChildKey");

      expect(newResultCollector.constructor).toBe(ResultCollector);
      expect(newResultCollector).not.toBe(resultCollector);

      const sameResultCollector = resultCollector.child("aChildKey");
      expect(sameResultCollector).toBe(newResultCollector);

      const differentResultCollector = resultCollector.child("aChildKey2");
      expect(differentResultCollector).not.toBe(newResultCollector);
    });

    it("can take an array of child list keys as a second argument", () => {
      const resultCollector = new ResultCollector("root", null, true);
      expect(resultCollector.constructor).toBe(ResultCollector);
      const newResultCollector = resultCollector.child("aChildKey", ["child1","child2"]);

      expect(newResultCollector.constructor).toBe(ResultCollector);
      expect(newResultCollector).not.toBe(resultCollector);

      const sameResultCollector = resultCollector.child("aChildKey");
      expect(sameResultCollector).toBe(newResultCollector);

      let lastCollector;
      const callback = jest.fn(newCollector => {
        expect(newCollector).not.toEqual(resultCollector);
        expect(newCollector).not.toEqual(lastCollector);
        lastCollector = newCollector;
      });
      sameResultCollector.map("aChildKey", callback);

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });
});
