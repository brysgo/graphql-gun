"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var src_1 = require("../src");
var graphql_tag_1 = require("graphql-tag");
var react_1 = require("react");
var server_1 = require("react-dom/server");
describe('result mapper', function () {
    it('can deal with promises', function () {
        var resolver = function (_, root) {
            return new Promise(function (res) {
                setTimeout(function () {
                    Promise.resolve(root).then(function (val) { return res(val + 'fake'); });
                }, 10);
            });
        };
        function promiseForObject(object) {
            var keys = Object.keys(object);
            var valuesAndPromises = keys.map(function (name) { return object[name]; });
            return Promise.all(valuesAndPromises).then(function (values) { return values.reduce(function (resolvedObject, value, i) {
                resolvedObject[keys[i]] = value;
                return resolvedObject;
            }, Object.create(null)); });
        }
        var query = (_a = ["\n      {\n        a {\n          b\n          c\n        }\n      }\n    "], _a.raw = ["\n      {\n        a {\n          b\n          c\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var result = src_1.default(resolver, query, '', null, null, { resultMapper: promiseForObject });
        return result.then(function (value) {
            chai_1.assert.deepEqual(value, {
                a: {
                    b: 'fakefake',
                    c: 'fakefake',
                },
            });
        });
        var _a;
    });
    it('can construct React elements', function () {
        var resolver = function (fieldName, root, args) {
            if (fieldName === 'text') {
                return args.value;
            }
            return react_1.createElement(fieldName, args);
        };
        var reactMapper = function (childObj, root) {
            var reactChildren = Object.keys(childObj).map(function (key) { return childObj[key]; });
            if (root) {
                return react_1.cloneElement.apply(void 0, [root, root.props].concat(reactChildren));
            }
            return reactChildren[0];
        };
        function gqlToReact(query) {
            return src_1.default(resolver, query, '', null, null, { resultMapper: reactMapper });
        }
        var query = (_a = ["\n      {\n        div {\n          s1: span(id: \"my-id\") {\n            text(value: \"This is text\")\n          }\n          s2: span\n        }\n      }\n    "], _a.raw = ["\n      {\n        div {\n          s1: span(id: \"my-id\") {\n            text(value: \"This is text\")\n          }\n          s2: span\n        }\n      }\n    "], graphql_tag_1.default(_a));
        chai_1.assert.equal(server_1.renderToStaticMarkup(gqlToReact(query)), '<div><span id="my-id">This is text</span><span></span></div>');
        var _a;
    });
});
//# sourceMappingURL=mapper.js.map