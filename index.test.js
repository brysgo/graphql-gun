/* global describe, it, expect */
const gql = require('graphql-tag');
const Gun = require('gun/gun');
const graphqlGun = require('./');

const gun = Gun();

describe("graphqlGun", () => {
  it("can do the basics", async () => {
    gun.get('foo').put({'bar': 'baz'});
    
    expect(await graphqlGun(gql`{
      foo {
        bar {
          baz
        }
      }
    }`, gun)).toMatchSnapshot();
  })
  
  
  it("lets you grab the chain at any point", async () => {
    gun.get('foo').put({bar: 'pop'});
    
    const results = await graphqlGun(gql`{
      foo {
        bar {
          _chain
          hello
        }
      }
    }`, gun);
    
    expect(results).toMatchSnapshot();
    
    await (new Promise((resolve) => {
      results.foo.bar._chain.on((value, key) => {
        expect(key).toEqual('bar')
        expect(value).toEqual('pop')
        resolve()
      }, {changed: true})
    
      gun.get('foo').get('bar').put({some: 'stuff'});
    }));
  });
  
  it('iterates over sets', async () => {
    await new Promise((resolve) => {
      const thing1 = gun.get('thing1');
      thing1.put({stuff: 'b', more: 'ok'});
      gun.get('things').set(thing1, resolve)
    });
    await new Promise((resolve) => {
      const thing2 = gun.get('thing2');
      thing2.put({stuff: 'c', more: 'ok'});
      gun.get('things').set(thing2, resolve)
    });
    
    const results = await graphqlGun(gql`{
      things(type: Set) {
        stuff
      }
    }`, gun);
    
    expect(results).toEqual({ things: [ {stuff: 'b'}, {stuff: 'c'} ] });
    
  });
});