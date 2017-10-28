/* global describe, it, expect */
const gql = require("graphql-tag");
const Gun = require("gun/gun");
const graphqlGun = require("./");

const gun = Gun();

describe("graphqlGun", () => {
  it("can do the basics", async () => {
    gun.get("foo").put({ bar: "baz" });

    const { next } = graphqlGun(
      gql`{
          foo {
            bar
          }
        }`,
      gun
    );
    await next();
    expect(await next()).toMatchSnapshot();
  });

  it("lets you grab the chain at any point", async () => {
    gun.get("foo").put({ bar: "pop" });

    const results = await graphqlGun(
      gql`{
        foo {
          bar {
            _chain
            hello
          }
        }
      }`,
      gun
    );

    expect(results).toMatchSnapshot();

    await new Promise(resolve => {
      results.foo.bar._chain.on(
        (value, key) => {
          expect(key).toEqual("bar");
          expect(value).toEqual("pop");
          resolve();
        },
        { changed: true }
      );

      gun.get("foo").get("bar").put({ some: "stuff" });
    });
  });

  it("iterates over sets", async () => {
    await new Promise(resolve => {
      const thing1 = gun.get("thing1");
      thing1.put({ stuff: "b", more: "ok" });
      gun.get("things").set(thing1, resolve);
    });
    await new Promise(resolve => {
      const thing2 = gun.get("thing2");
      thing2.put({ stuff: "c", more: "ok" });
      gun.get("things").set(thing2, resolve);
    });

    const { next } = graphqlGun(
      gql`{
        things(type: Set) {
          stuff
        }
      }`,
      gun
    );

    await next();

    expect(await next()).toEqual({ things: [{ stuff: "b" }, { stuff: "c" }] });
  });

  it("lets you subscribe to updates", async () => {
    const thing1 = gun.get("thing1");
    const thing2 = gun.get("thing2");
    thing1.put({ stuff: "b", more: "ok" });
    thing2.put({ stuff: "c", more: "ok" });
    gun.get("things").set(thing1);
    gun.get("things").set(thing2);

    let { next } = graphqlGun(
      gql`{
        things(type: Set) {
          stuff @live
        }
      }`,
      gun
    );

    expect(await next()).toEqual({ things: [{ stuff: "b" }, { stuff: "c" }] });

    gun.get("thing1").put({ stuff: "changed" });

    expect(await next()).toEqual({
      things: [{ stuff: "changed" }, { stuff: "c" }]
    });
  });

  it("supports mad nesting", async () => {
    const thing1 = gun.get("thing1");
    const thing2 = gun.get("thing2");
    const moreThings1 = gun.get("moreThing1");
    const moreThings2 = gun.get("moreThing2");
    const moreThings3 = gun.get("moreThing3");
    const moreThings4 = gun.get("moreThing4");
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
    gun.get("things").set(thing1);
    gun.get("things").set(thing2);

    let { next } = graphqlGun(
      gql`{
        things(type: Set) {
          stuff
          moreThings(type: Set) {
            otherStuff
          }
        }
      }`,
      gun
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
    const thing1 = gun.get("thing1");
    const thing2 = gun.get("thing2");
    const moreThings1 = gun.get("moreThing1");
    const moreThings2 = gun.get("moreThing2");
    const moreThings3 = gun.get("moreThing3");
    const moreThings4 = gun.get("moreThing4");
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
    gun.get("things").set(thing1);
    gun.get("things").set(thing2);

    let { next } = graphqlGun(
      gql`{
        things(type: Set) @live {
          stuff
          moreThings(type: Set) {
            otherStuff
          }
        }
      }`,
      gun
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

    const thing3 = gun.get("thing3");
    thing3.put({ stuff: "d", more: "just added" });
    thing2.put({ stuff: "cc" });
    gun.get("things").set(thing3);

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

    const thing4 = gun.get("thing4");
    thing4.put({ stuff: "e" });
    gun.get("things").set(thing4);
  });

  it("works with a simple case of two properties and a promise interface", async () => {
    const thing = gun.get("thing");
    const fish = thing.get("fish");
    fish.put({"color": "red", "fins": 2});

    const result = await graphqlGun(
      gql`{
        thing {
          fish {
            color
            fins
          }
        }
      }`,
      gun
    );

    expect(result).toEqual({
      thing: {
        fish: {
          color: 'red',
          fins: 2
        }
      }
    })
  });
});
