"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var src_1 = require("../src");
var graphql_tag_1 = require("graphql-tag");
describe('directives', function () {
    it('skips a field that has the skip directive', function () {
        var resolver = function () { throw new Error('should not be called'); };
        var query = (_a = ["\n      {\n        a @skip(if: true)\n      }\n    "], _a.raw = ["\n      {\n        a @skip(if: true)\n      }\n    "], graphql_tag_1.default(_a));
        var result = src_1.default(resolver, query);
        chai_1.assert.deepEqual(result, {});
        var _a;
    });
    it('includes info about arbitrary directives', function () {
        var resolver = function (fieldName, root, args, context, info) {
            var doSomethingDifferent = info.directives.doSomethingDifferent;
            var data = root[info.resultKey];
            if (doSomethingDifferent) {
                if (doSomethingDifferent.but === 'notTooCrazy') {
                    return data;
                }
                return undefined;
            }
            return data;
        };
        var input = {
            a: 'something',
            b: 'hidden',
        };
        var query = (_a = ["\n      {\n        a @doSomethingDifferent(but: notTooCrazy)\n        b @doSomethingDifferent(but: nope)\n      }\n    "], _a.raw = ["\n      {\n        a @doSomethingDifferent(but: notTooCrazy)\n        b @doSomethingDifferent(but: nope)\n      }\n    "], graphql_tag_1.default(_a));
        var result = src_1.default(resolver, query, input);
        chai_1.assert.deepEqual(result, { a: 'something' });
        var _a;
    });
});
//# sourceMappingURL=directives.js.map