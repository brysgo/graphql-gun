/* global describe, it, expect */
const gql = require("graphql-tag");
const Gun = require("gun/gun");
const graphqlGun = require("./");

const gun = Gun();

describe("graphqlGun", () => {
  it("can do the basics", async () => {
    gun.get("gGcdtb").put({ bar: "baz" });

    const { next } = graphqlGun(
      gql`
        {
          gGcdtb {
            bar
          }
        }
      `,
      gun
    );
    await next();
    expect(await next()).toMatchSnapshot();
  });

  it("lets you grab the chain at any point", async () => {
    gun.get("gGlygtcaap").put({ bar: "pop" });

    const results = await graphqlGun(
      gql`
        {
          gGlygtcaap {
            bar {
              _chain
              hello
            }
          }
        }
      `,
      gun
    );

    expect(results).toMatchSnapshot();

    await new Promise(resolve => {
      results.gGlygtcaap.bar._chain.on(
        (value, key) => {
          expect(key).toEqual("bar");
          expect(value).toEqual("pop");
          resolve();
        },
        { changed: true }
      );

      gun
        .get("gGlygtcaap")
        .get("bar")
        .put({ some: "stuff" });
    });
  });

  it("iterates over sets", async () => {
    const chain = gun.get("gGios");
    await new Promise(resolve => {
      const thing1 = chain.get("thing1");
      thing1.put({ stuff: "b", more: "ok" });
      chain.get("things").set(thing1, resolve);
    });
    await new Promise(resolve => {
      const thing2 = chain.get("thing2");
      thing2.put({ stuff: "c", more: "ok" });
      chain.get("things").set(thing2, resolve);
    });

    const { next } = graphqlGun(
      gql`
        {
          gGios {
            things(type: Set) {
              stuff
            }
          }
        }
      `,
      gun
    );

    await next();

    expect(await next()).toEqual({
      gGios: { things: [{ stuff: "b" }, { stuff: "c" }] }
    });
  });

  it("lets you subscribe to updates", async () => {
    const chain = gun.get("gGlystu");
    const thing1 = chain.get("thing1");
    const thing2 = chain.get("thing2");
    thing1.put({ stuff: "b", more: "ok" });
    thing2.put({ stuff: "c", more: "ok" });
    chain.get("things").set(thing1);
    chain.get("things").set(thing2);

    let { next } = graphqlGun(
      gql`
        {
          gGlystu {
            things(type: Set) {
              stuff @live
            }
          }
        }
      `,
      gun
    );

    expect(await next()).toEqual({
      gGlystu: { things: [{ stuff: "b" }, { stuff: "c" }] }
    });

    chain.get("thing1").put({ stuff: "changed" });

    expect(await next()).toEqual({
      gGlystu: {
        things: [{ stuff: "changed" }, { stuff: "c" }]
      }
    });
  });

  it("supports mad nesting", async () => {
    const chain = gun.get("Ggsmn");
    const thing1 = chain.get("thing1");
    const thing2 = chain.get("thing2");
    const moreThings1 = chain.get("moreThing1");
    const moreThings2 = chain.get("moreThing2");
    const moreThings3 = chain.get("moreThing3");
    const moreThings4 = chain.get("moreThing4");
    moreThings1.put({ otherStuff: "one fish" });
    moreThings2.put({ otherStuff: "two fish" });
    moreThings3.put({ otherStuff: "red fish" });
    moreThings4.put({ otherStuff: "blue fish" });
    thing1.put({ stuff: "b", more: "ok" });
    thing2.put({ stuff: "c", more: "ok" });
    thing1.get("moreThings").set(moreThings1);
    thing1.get("moreThings").set(moreThings2);
    thing2.get("moreThings").set(moreThings3);
    thing2.get("moreThings").set(moreThings4);
    chain.get("things").set(thing1);
    chain.get("things").set(thing2);

    let { next } = graphqlGun(
      gql`
        {
          things(type: Set) {
            stuff
            moreThings(type: Set) {
              otherStuff
            }
          }
        }
      `,
      chain
    );

    expect(await next()).toEqual({
      things: [
        {
          stuff: "b",
          moreThings: [{ otherStuff: "one fish" }, { otherStuff: "two fish" }]
        },
        {
          stuff: "c",
          moreThings: [{ otherStuff: "red fish" }, { otherStuff: "blue fish" }]
        }
      ]
    });
  });

  it("supports mad nesting with subscriptions", async () => {
    const chain = gun.get("gGsmnws");
    const thing1 = chain.get("thing1");
    const thing2 = chain.get("thing2");
    const moreThings1 = chain.get("moreThing1");
    const moreThings2 = chain.get("moreThing2");
    const moreThings3 = chain.get("moreThing3");
    const moreThings4 = chain.get("moreThing4");
    moreThings1.put({ otherStuff: "one fish" });
    moreThings2.put({ otherStuff: "two fish" });
    moreThings3.put({ otherStuff: "red fish" });
    moreThings4.put({ otherStuff: "blue fish" });
    thing1.put({ stuff: "b", more: "ok" });
    thing2.put({ stuff: "c", more: "ok" });
    thing1.get("moreThings").set(moreThings1);
    thing1.get("moreThings").set(moreThings2);
    thing2.get("moreThings").set(moreThings3);
    thing2.get("moreThings").set(moreThings4);
    chain.get("things").set(thing1);
    chain.get("things").set(thing2);

    let { next } = graphqlGun(
      gql`
        {
          things(type: Set) @live {
            stuff
            moreThings(type: Set) {
              otherStuff
            }
          }
        }
      `,
      chain
    );

    expect(await next()).toEqual({
      things: [
        {
          stuff: "b",
          moreThings: [{ otherStuff: "one fish" }, { otherStuff: "two fish" }]
        },
        {
          stuff: "c",
          moreThings: [{ otherStuff: "red fish" }, { otherStuff: "blue fish" }]
        }
      ]
    });

    const thing3 = chain.get("thing3");
    thing3.put({ stuff: "d", more: "just added" });
    thing2.put({ stuff: "cc" });
    chain.get("things").set(thing3);
    const thing4 = chain.get("thing4");
    thing4.put({ stuff: "e" });
    chain.get("things").set(thing4);

    expect(await next()).toEqual({
      things: [
        {
          stuff: "b",
          moreThings: [{ otherStuff: "one fish" }, { otherStuff: "two fish" }]
        },
        {
          stuff: "cc",
          moreThings: [{ otherStuff: "red fish" }, { otherStuff: "blue fish" }]
        },
        {
          moreThings: [],
          stuff: "d"
        },
        {
          moreThings: [],
          stuff: "e"
        }
      ]
    });
  });

  it("works with a simple case of two properties and a promise interface", async () => {
    const thing = gun.get("thing");
    const fish = thing.get("fish");
    fish.put({ color: "red", fins: 2 });

    const result = await graphqlGun(
      gql`
        {
          thing {
            fish {
              color
              fins
            }
          }
        }
      `,
      gun
    );

    expect(result).toEqual({
      thing: {
        fish: {
          color: "red",
          fins: 2
        }
      }
    });
  });
});
