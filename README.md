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
[![Greenkeeper badge](https://badges.greenkeeper.io/brysgo/graphql-gun.svg)](https://greenkeeper.io/)

Augmented query interface for the graph universal database http://gun.js.org/

`npm install graphql-gun`

# Without React

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

Use the live directive to subscribe via an promise/iterator combo.


```
const myQuery = gql`{
  fish {
    red @live {
      name
    }
  }
}`;

const { next } = graphqlGun(myQuery, gun);

console.log(await next());
```

Will print...

```
{
  fish: {
    red: {
      name: 'Frank' // the name you set on the red fish
    }
  }
}
```

Then try:

```
gun.get('fish').get('red').put({name: 'bob'});

console.log(await next());
```

And you will get...

```
{
  fish: {
    red: {
      name: 'bob' // the updated name
    }
  }
}
```

Take a look at the tests to learn more.



# With React


Use the high order component for a Relay inspired API directly into your Gun DB.

```
const gql = require("graphql-tag");
const Gun = require("gun");
const graphqlGun = require("graphql-gun");
const React = require("react");
const ReactDOM = require("react-dom");
const gun = Gun();
const { createContainer } = require('graphql-gun/react')({React, gun});

const Color = ({color, palette}) => (
  // palette will be passed in by the container with all the data you asked for
  // component will also redraw when your subscriptions update
  <div style={{color}}>{JSON.stringify(palette, null, 2)}</div>
)

const ColorContainer = createContainer(Color, {
  fragments: {
    palette: gql`{
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
    }`
  }
});

ReactDOM.render(
  <ColorContainer color={'blue'} />,
  document.getElementById('root')
);

```

# Credits

Special thanks to @amark for creating Gun and answering all my noob questions.

Shout out to @stubailo for putting up with my late night `graphql-anywhere` PRs.

Also a shout out to everyone on the Gun [gitter](https://gitter.im/amark/gun) chat for talking through things.
