"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var src_1 = require("../src");
var graphql_tag_1 = require("graphql-tag");
describe('fragment matcher', function () {
    it('does basic things', function () {
        var resolver = function (fieldName) { return fieldName; };
        var query = (_a = ["\n      {\n        a {\n          b\n          ...yesFrag\n          ...noFrag\n          ... on Yes {\n            e\n          }\n          ... on No {\n            f\n          }\n        }\n      }\n\n      fragment yesFrag on Yes {\n        c\n      }\n\n      fragment noFrag on No {\n        d\n      }\n    "], _a.raw = ["\n      {\n        a {\n          b\n          ...yesFrag\n          ...noFrag\n          ... on Yes {\n            e\n          }\n          ... on No {\n            f\n          }\n        }\n      }\n\n      fragment yesFrag on Yes {\n        c\n      }\n\n      fragment noFrag on No {\n        d\n      }\n    "], graphql_tag_1.default(_a));
        var fragmentMatcher = function (_, typeCondition) { return typeCondition === 'Yes'; };
        var resultWithMatcher = src_1.default(resolver, query, '', null, null, { fragmentMatcher: fragmentMatcher });
        chai_1.assert.deepEqual(resultWithMatcher, {
            a: {
                b: 'b',
                c: 'c',
                e: 'e',
            },
        });
        var resultNoMatcher = src_1.default(resolver, query, '', null, null);
        chai_1.assert.deepEqual(resultNoMatcher, {
            a: {
                b: 'b',
                c: 'c',
                d: 'd',
                e: 'e',
                f: 'f',
            },
        });
        var _a;
    });
});
//# sourceMappingURL=matcher.js.map