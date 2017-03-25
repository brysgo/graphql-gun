```
██████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗ ██████╗ ██╗            ██████╗ ██╗   ██╗███╗   ██╗
██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║██╔═══██╗██║           ██╔════╝ ██║   ██║████╗  ██║
██║  ███╗██████╔╝███████║██████╔╝███████║██║   ██║██║     █████╗██║  ███╗██║   ██║██╔██╗ ██║
██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║██║▄▄ ██║██║     ╚════╝██║   ██║██║   ██║██║╚██╗██║
╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║╚██████╔╝███████╗      ╚██████╔╝╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚══▀▀═╝ ╚══════╝       ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝
```

[![CircleCI](https://circleci.com/gh/brysgo/graphql-gun/tree/master.svg?style=shield)](https://circleci.com/gh/brysgo/graphql-gun/tree/master)
[![daviddm](https://david-dm.org/brysgo/thoughtnet.svg)](https://david-dm.org/brysgo/graphql-gun)

Augmented query interface for the graph universal database http://gun.js.org/

`npm install graphql-gun`

Then use it like so:

```
const graphqlGun = require('graphql-gun');
const Gun = require('gun');
const gql = require('graphql-tag')

const gun = Gun();

const fish = gun.get('fish');
fish.put({red: {name: 'Frank'}});
fish.put({blue: {name: 'John'}});
const friends = fish.get('friends');
const dori = fish.get('dori')
const martin = fish.get('martin')
const nemo = fish.get('nemo')
dori.put({ name: 'Dori', favoriteColor: 'blue' });
martin.put({ name: 'Martin', favoriteColor: 'orange' });
nemo.put({ name: 'Nemo', favoriteColor: 'gold' });
friends.set(dori);
friends.set(martin);
friends.set(nemo);

const myQuery = gql`{
  fish {
    red {
      name
    }
    
    blue {
      _chain
    }
    
    friends(type: Set) {
      name
      favoriteColor
    }
  }
}`;

graphqlGun(myQuery, gun).then(function(results) {
  console.log('results: ', results);
});
```

and it will print...

```
{
  fish: {
    red: {
      name: 'Frank' // the name you set on the red fish
    },
    blue: {
      _chain: <Gun.chain> // reference to gun chain at blue node
    },
    friends: [
      { name: 'Dori', favoriteColor: 'blue' },
      { name: 'Martin', favoriteColor: 'orange' },
      { name: 'Nemo', favoriteColor: 'gold' }
    ]
  }
}
```

Take a look at the tests to learn more.
