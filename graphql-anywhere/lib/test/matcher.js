"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
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
    it('can return a promise', function () { return __awaiter(_this, void 0, void 0, function () {
        var resolver, query, fragmentMatcher, resultWithMatcher, resultNoMatcher, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    resolver = function (fieldName) { return fieldName; };
                    query = (_a = ["\n      {\n        a {\n          b\n          ...trueFrag\n          ...falseFrag\n          ... on True {\n            e\n          }\n          ... on False {\n            f\n          }\n        }\n      }\n\n      fragment trueFrag on True {\n        c\n      }\n\n      fragment falseFrag on False {\n        d\n      }\n    "], _a.raw = ["\n      {\n        a {\n          b\n          ...trueFrag\n          ...falseFrag\n          ... on True {\n            e\n          }\n          ... on False {\n            f\n          }\n        }\n      }\n\n      fragment trueFrag on True {\n        c\n      }\n\n      fragment falseFrag on False {\n        d\n      }\n    "], graphql_tag_1.default(_a));
                    fragmentMatcher = function (_, typeCondition) { return Promise.resolve(typeCondition === 'True'); };
                    return [4 /*yield*/, src_1.default(resolver, query, '', null, null, { fragmentMatcher: fragmentMatcher })];
                case 1:
                    resultWithMatcher = _b.sent();
                    chai_1.assert.deepEqual(resultWithMatcher, {
                        a: {
                            b: 'b',
                            c: 'c',
                            e: 'e',
                        },
                    });
                    resultNoMatcher = src_1.default(resolver, query, '', null, null);
                    chai_1.assert.deepEqual(resultNoMatcher, {
                        a: {
                            b: 'b',
                            c: 'c',
                            d: 'd',
                            e: 'e',
                            f: 'f',
                        },
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=matcher.js.map