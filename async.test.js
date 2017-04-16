import { thunkish } from "./async";
describe("async", () => {
  describe("thunkish", () => {
    it("starts with a producer and can have many consumers", () => {
      let producer;
      const consumeA = jest.fn();
      const consumeB = jest.fn();
      const consumer = thunkish(function(produce) {
        producer = produce;
      });
      producer("foo");
      producer("bar");
      consumer(consumeA);
      expect(consumeA).toHaveBeenCalledTimes(2);
      producer("baz");
      expect(consumeA).toHaveBeenCalledTimes(3);
      expect(consumeB).not.toHaveBeenCalled();
      consumer(consumeB);
      expect(consumeB).toHaveBeenCalledTimes(3);
      producer("done");
      expect(consumeA).toHaveBeenCalledTimes(4);
      expect(consumeB).toHaveBeenCalledTimes(4);
    });
    describe("toPromiseFactory", () => {
      it("makes the thunkish behave like a promise factory", async () => {
        let producer;
        const consumer = thunkish(function(produce) {
          producer = produce;
        });
        const next = consumer.toPromiseFactory();
        producer("testing promise factory");
        expect(await next()).toEqual("testing promise factory");
      });
    });
  });
});
