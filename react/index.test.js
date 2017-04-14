/* global describe, it, expect */
const gql = require("graphql-tag");
const Gun = require("gun/gun");
const React = require("react");
const gun = Gun();
const { createContainer, graphqlGun } = require("./")({ React, gun });

const renderer = require("react-test-renderer");

const Color = (props) => {
  return React.createElement(
    "div",
    { style: { color: props.color } },
    JSON.stringify(props, null, 2)
  );
};

describe("react", () => {
  describe("createContainer", () => {
    it("renders the fragment in the container", async () => {
      gun
        .get("color")
        .put({ hue: 255, saturation: 255, value: 255, other: "foo" });
  
      const ColorContainer = createContainer(Color, {
        fragments: {
          palette: gql`{
            color {
              hue
              saturation
              value
            }
          }`
        }
      });
  
      let containerInstance;
      const colorContainerElement = React.createElement(ColorContainer, {
        color: "blue",
        ref: container => containerInstance = container
      });
      const component = renderer.create(colorContainerElement);
  
      await containerInstance.promise;
  
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  
    it("reloads your component when new data comes", async () => {
      gun.get("thing").put({
        stuff: {
          one: "hello",
          two: "world"
        }
      });
  
      const ColorContainer = createContainer(Color, {
        fragments: {
          palette: gql`{
            thing {
              stuff @live {
                one
                two
              }
            }
          }`
        }
      });
  
      let containerInstance;
      const colorContainerElement = React.createElement(ColorContainer, {
        color: "red",
        ref: container => containerInstance = container
      });
      const component = renderer.create(colorContainerElement);
  
      const next = await containerInstance.promise;
  
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
  
      gun.get("thing").put({ stuff: { one: "new" } });
  
      await next();
  
      tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
  
  describe("graphqlGun", () => {
    it("provides apollo client syntax for container", async () => {
      gun
        .get("color")
        .put({ hue: 255, saturation: 255, value: 255, other: "foo" });
  
      const ColorContainer = graphqlGun(gql`{
            color {
              hue
              saturation
              value
            }
          }`)(Color);
  
      let containerInstance;
      const colorContainerElement = React.createElement(ColorContainer, {
        color: "blue",
        ref: container => containerInstance = container
      });
      const component = renderer.create(colorContainerElement);
  
      await containerInstance.promise;
  
      let tree = component.toJSON();
      expect(tree).toMatchSnapshot();
    });
  
  });
});