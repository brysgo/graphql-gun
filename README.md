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

const myQuery = gql`{
  fish {
    red {
      name
    }
    
    blue {
      _chain
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
      name: // the name you set on the red fish
    },
    blue: {
      _chain: // reference to gun chain at blue node
    }
  }
}
```

Take a look at the test, it is pretty simple so far.
