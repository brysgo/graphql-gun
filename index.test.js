/* global describe, it, expect */
const gql = require('graphql-tag');
const Gun = require('gun');
const graphqlGun = require('./');

const gun = Gun();

describe("graphqlGun", () => {
  it("can get things down the gun chain", async () => {
    gun.get('foo').put({bar: 'baz'});
    gun.get('foo').get('bar').put({hello: 'world'});
        
    const results = await graphqlGun(gql`{
      foo {
        bar {
          hello
        }
      }
    }`, gun);
    
    expect(results.foo.bar.hello).toEqual('baz');
    expect(results).toMatchSnapshot();
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
    
  })
});