```
██████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗ ██████╗ ██╗            ██████╗ ██╗   ██╗███╗   ██╗
██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║██╔═══██╗██║           ██╔════╝ ██║   ██║████╗  ██║
██║  ███╗██████╔╝███████║██████╔╝███████║██║   ██║██║     █████╗██║  ███╗██║   ██║██╔██╗ ██║
██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║██║▄▄ ██║██║     ╚════╝██║   ██║██║   ██║██║╚██╗██║
╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║╚██████╔╝███████╗      ╚██████╔╝╚██████╔╝██║ ╚████║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝ ╚══▀▀═╝ ╚══════╝       ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝
```

[![CircleCI](https://circleci.com/gh/brysgo/graphql-gun/tree/master.svg?style=shield)](https://circleci.com/gh/brysgo/graphql-gun/tree/master)
[![daviddm](https://david-dm.org/brysgo/graphql-gun/status.svg)](https://david-dm.org/brysgo/graphql-gun)
[![Greenkeeper badge](https://badges.greenkeeper.io/brysgo/graphql-gun.svg)](https://greenkeeper.io/)

Augmented query interface for the graph universal database http://gun.js.org/

`npm install graphql-gun`

## With React

Say you want to attach offline first, realtime data to the Color component.
```javascript
const gql = require("graphql-tag");
const Gun = require("gun");
const React = require("react");
const ReactDOM = require("react-dom");
const gun = Gun();
const { createContainer, graphqlGun } = require('graphql-gun/react')({React, gun});

const Color = ({color, data}) => (
  // data will be passed in by the container with all the data you asked for
  // component will also redraw when your subscriptions update
  <div style={{color}}>{JSON.stringify(data, null, 2)}</div>
)
```

You can use a relay inspired high order component to decorate it with live data:


```javascript
let ColorContainer = createContainer(Color, {
  fragments: {
    data: gql`{
      fish @live {
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
```

...or if you prefer apollo client:

```javascript
ColorContainer = graphqlGun(gql`{
  fish @live {
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
}`)(Color);
```

Then just render like normal.

```javascript
ReactDOM.render(
  <ColorContainer color={'blue'} />,
  document.getElementById('root')
);

```

## Without React

Not using react?

You can use `graphqlGun` with a more traditional imperative approach:

```javascript
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

```javascript
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


```javascript
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

```javascript
{
  fish: {
    red: {
      name: 'Frank' // the name you set on the red fish
    }
  }
}
```

Then try:

```javascript
gun.get('fish').get('red').put({name: 'bob'});

console.log(await next());
```

And you will get...

```javascript
{
  fish: {
    red: {
      name: 'bob' // the updated name
    }
  }
}
```

Take a look at the tests to learn more.


## Credits

Special thanks to [@amark](https://github.com/amark/) for creating [Gun](https://github.com/amark/gun) and answering all my noob questions.

Shout out to [@stubailo](https://github.com/stubailo/) for putting up with my late night [graphql-anywhere](https://github.com/amark/) PRs.

Also a shout out to everyone on the Gun [gitter](https://gitter.im/amark/gun) chat for talking through things.
