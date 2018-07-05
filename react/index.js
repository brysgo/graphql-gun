const graphqlGunUtil = require("../");
const tryGet = require("try-get");

module.exports = function({ React, gun }) {
  function createContainer(Component, { fragments }) {
    class Container extends React.Component {
      constructor() {
        super();
        this.state = {};
        this.resetPromise();
      }

      resetPromise() {
        let resolve;
        this.promise = new Promise(res => resolve = res);
        if (this.resolve) this.resolve(() => this.promise);
        this.resolve = resolve;
      }

      reloadFragmentOnResolve(fragment, asyncIterator) {
        return asyncIterator.next().then(iter => {
          this.setState({ data: { [fragment]: iter.value } });
          this.resetPromise(); // for testing
          this.reloadFragmentOnResolve(fragment, asyncIterator);
        });
      }

      componentDidMount() {
        return Object.keys(fragments).map(fragment => {
          const asyncIterator = graphqlGunUtil(fragments[fragment], gun)[
            Symbol.iterator
          ]();
          this.reloadFragmentOnResolve(fragment, asyncIterator);
          return asyncIterator;
        });
      }

      render() {
        return React.createElement(
          Component,
          Object.assign({}, this.state.data, this.props)
        );
      }
    }
    Container.displayName = `${Component.displayName}DataContainer`;
    return Container;
  }

  function graphqlGun(data) {
    return function wrap(Component) {
      return createContainer(Component, { fragments: { data } });
    };
  }

  return {
    createContainer,
    graphqlGun
  };
};
