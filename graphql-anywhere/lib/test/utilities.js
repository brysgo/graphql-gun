"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var graphql_tag_1 = require("graphql-tag");
var utilities_1 = require("../src/utilities");
describe('utilities', function () {
    describe('with a single query', function () {
        var doc = (_a = ["\n      {\n        alias: name\n        height(unit: METERS)\n        avatar {\n          square\n        }\n      }\n    "], _a.raw = ["\n      {\n        alias: name\n        height(unit: METERS)\n        avatar {\n          square\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            alias: 'Bob',
            name: 'Wrong',
            height: 1.89,
            avatar: {
                square: 'abc',
                circle: 'def',
                triangle: 'qwe',
            },
        };
        var filteredData = {
            alias: 'Bob',
            height: 1.89,
            avatar: {
                square: 'abc',
            },
        };
        it('can filter data', function () {
            assert.deepEqual(utilities_1.filter(doc, data), filteredData);
        });
        it('can check matching data', function () {
            utilities_1.check(doc, filteredData);
        });
        it('can check overspecified data', function () {
            utilities_1.check(doc, data);
        });
        it('throws when checking underspecified data', function () {
            assert.throws(function () {
                utilities_1.check(doc, {
                    name: 'Wrong',
                });
            });
            assert.throws(function () {
                utilities_1.check(doc, {
                    alias: 'Bob',
                    height: 1.89,
                });
            });
        });
        var _a;
    });
    describe('with a single fragment', function () {
        var doc = (_a = ["\n      fragment PersonDetails on Person {\n        alias: name\n        height(unit: METERS)\n        avatar {\n          square\n        }\n      }\n    "], _a.raw = ["\n      fragment PersonDetails on Person {\n        alias: name\n        height(unit: METERS)\n        avatar {\n          square\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            alias: 'Bob',
            name: 'Wrong',
            height: 1.89,
            avatar: {
                square: 'abc',
                circle: 'def',
                triangle: 'qwe',
            },
        };
        var filteredData = {
            alias: 'Bob',
            height: 1.89,
            avatar: {
                square: 'abc',
            },
        };
        it('can filter data', function () {
            assert.deepEqual(utilities_1.filter(doc, data), filteredData);
        });
        it('can check matching data', function () {
            utilities_1.check(doc, filteredData);
        });
        it('can check overspecified data', function () {
            utilities_1.check(doc, data);
        });
        it('throws when checking underspecified data', function () {
            assert.throws(function () {
                utilities_1.check(doc, {
                    name: 'Wrong',
                });
            });
            assert.throws(function () {
                utilities_1.check(doc, {
                    alias: 'Bob',
                    height: 1.89,
                });
            });
        });
        var _a;
    });
    describe('with a single fragment', function () {
        var doc = (_a = ["\n      fragment PersonDetails on Person {\n        alias: name\n        height(unit: METERS)\n        avatar {\n          square\n        }\n      }\n    "], _a.raw = ["\n      fragment PersonDetails on Person {\n        alias: name\n        height(unit: METERS)\n        avatar {\n          square\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            alias: 'Bob',
            name: 'Wrong',
            height: 1.89,
            avatar: {
                square: 'abc',
                circle: 'def',
                triangle: 'qwe',
            },
        };
        var filteredData = {
            alias: 'Bob',
            height: 1.89,
            avatar: {
                square: 'abc',
            },
        };
        it('can filter data', function () {
            assert.deepEqual(utilities_1.filter(doc, data), filteredData);
        });
        it('can check matching data', function () {
            utilities_1.check(doc, filteredData);
        });
        it('can check overspecified data', function () {
            utilities_1.check(doc, data);
        });
        it('throws when checking underspecified data', function () {
            assert.throws(function () {
                utilities_1.check(doc, {
                    name: 'Wrong',
                });
            });
            assert.throws(function () {
                utilities_1.check(doc, {
                    alias: 'Bob',
                    height: 1.89,
                });
            });
        });
        var _a;
    });
    describe('with nested fragments', function () {
        var doc = (_a = ["\n      fragment PersonDetails on Person {\n        alias: name\n        height(unit: METERS)\n        avatar {\n          square\n          ... on Avatar {\n            circle\n          }\n        }\n      }\n    "], _a.raw = ["\n      fragment PersonDetails on Person {\n        alias: name\n        height(unit: METERS)\n        avatar {\n          square\n          ... on Avatar {\n            circle\n          }\n        }\n      }\n    "], graphql_tag_1.default(_a));
        var data = {
            alias: 'Bob',
            name: 'Wrong',
            height: 1.89,
            avatar: {
                square: 'abc',
                circle: 'def',
                triangle: 'qwe',
            },
        };
        var filteredData = {
            alias: 'Bob',
            height: 1.89,
            avatar: {
                square: 'abc',
                circle: 'def',
            },
        };
        it('can filter data', function () {
            assert.deepEqual(utilities_1.filter(doc, data), filteredData);
        });
        it('can check matching data', function () {
            utilities_1.check(doc, filteredData);
        });
        it('can check overspecified data', function () {
            utilities_1.check(doc, data);
        });
        it('throws when checking underspecified data', function () {
            assert.throws(function () {
                utilities_1.check(doc, {
                    name: 'Wrong',
                });
            });
            assert.throws(function () {
                utilities_1.check(doc, {
                    alias: 'Bob',
                    height: 1.89,
                });
            });
            assert.throws(function () {
                utilities_1.check(doc, {
                    alias: 'Bob',
                    height: 1.89,
                    avatar: {
                        triangle: 'qwe',
                    },
                });
            });
        });
        describe('if the nested fragment has not matched', function () {
            it('can filter data', function () {
                var filtered = utilities_1.filter(doc, {
                    alias: 'Bob',
                    name: 'Wrong',
                    height: 1.89,
                    avatar: {
                        square: 'abc',
                        triangle: 'qwe',
                    },
                });
                assert.deepEqual(filtered, {
                    alias: 'Bob',
                    height: 1.89,
                    avatar: {
                        square: 'abc',
                    },
                });
            });
            it('does not throw when checking', function () {
                utilities_1.check(doc, {
                    alias: 'Wrong',
                    height: 1.89,
                    avatar: {
                        square: 'abc',
                    },
                });
            });
        });
        var _a;
    });
});
//# sourceMappingURL=utilities.js.map