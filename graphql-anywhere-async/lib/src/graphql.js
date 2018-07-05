"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getFromAST_1 = require("./getFromAST");
var directives_1 = require("./directives");
var storeUtils_1 = require("./storeUtils");
function graphql(resolver, document, rootValue, contextValue, variableValues, execOptions) {
    if (execOptions === void 0) { execOptions = {}; }
    var mainDefinition = getFromAST_1.getMainDefinition(document);
    var fragments = getFromAST_1.getFragmentDefinitions(document);
    var fragmentMap = getFromAST_1.createFragmentMap(fragments);
    var resultMapper = execOptions.resultMapper;
    var fragmentMatcher = execOptions.fragmentMatcher || (function () { return true; });
    var deferrableOrImmediate = execOptions.deferrableOrImmediate || promiseOrImmediate;
    var arrayOrDeferrable = execOptions.arrayOrDeferrable || arrayOrPromise;
    var execContext = {
        fragmentMap: fragmentMap,
        contextValue: contextValue,
        variableValues: variableValues,
        resultMapper: resultMapper,
        resolver: resolver,
        fragmentMatcher: fragmentMatcher,
        deferrableOrImmediate: deferrableOrImmediate,
        arrayOrDeferrable: arrayOrDeferrable,
    };
    return executeSelectionSet(mainDefinition.selectionSet, rootValue, execContext);
}
exports.graphql = graphql;
function executeSelectionSet(selectionSet, rootValue, execContext) {
    var fragmentMap = execContext.fragmentMap, contextValue = execContext.contextValue, variables = execContext.variableValues, deferrableOrImmediate = execContext.deferrableOrImmediate, arrayOrDeferrable = execContext.arrayOrDeferrable;
    var result = {};
    return deferrableOrImmediate(arrayOrDeferrable(selectionSet.selections.map(function (selection) {
        if (!directives_1.shouldInclude(selection, variables)) {
            return;
        }
        if (storeUtils_1.isField(selection)) {
            var fieldResultOrDeferrable = executeField(selection, rootValue, execContext);
            return deferrableOrImmediate(fieldResultOrDeferrable, function (fieldResult) {
                var resultFieldKey = storeUtils_1.resultKeyNameFromField(selection);
                if (fieldResult !== undefined) {
                    if (result[resultFieldKey] === undefined) {
                        result[resultFieldKey] = fieldResult;
                    }
                    else {
                        merge(result[resultFieldKey], fieldResult);
                    }
                }
            });
        }
        else {
            var fragment_1;
            if (storeUtils_1.isInlineFragment(selection)) {
                fragment_1 = selection;
            }
            else {
                fragment_1 = fragmentMap[selection.name.value];
                if (!fragment_1) {
                    throw new Error("No fragment named " + selection.name.value);
                }
            }
            var typeCondition = fragment_1.typeCondition.name.value;
            return deferrableOrImmediate(execContext.fragmentMatcher(rootValue, typeCondition, contextValue), function (fragmentMatcherResult) {
                if (fragmentMatcherResult) {
                    var fragmentResultOrDeferrable = executeSelectionSet(fragment_1.selectionSet, rootValue, execContext);
                    return deferrableOrImmediate(fragmentResultOrDeferrable, function (fragmentResult) {
                        merge(result, fragmentResult);
                    });
                }
            });
        }
    })), function () {
        if (execContext.resultMapper) {
            return execContext.resultMapper(result, rootValue);
        }
        return result;
    });
}
function executeField(field, rootValue, execContext) {
    var variables = execContext.variableValues, contextValue = execContext.contextValue, resolver = execContext.resolver, deferrableOrImmediate = execContext.deferrableOrImmediate;
    var fieldName = field.name.value;
    var args = storeUtils_1.argumentsObjectFromField(field, variables);
    var info = {
        isLeaf: !field.selectionSet,
        resultKey: storeUtils_1.resultKeyNameFromField(field),
        directives: directives_1.getDirectiveInfoFromField(field, variables),
    };
    var resultOrDeferrable = resolver(fieldName, rootValue, args, contextValue, info);
    return deferrableOrImmediate(resultOrDeferrable, function (result) {
        if (!field.selectionSet) {
            return result;
        }
        if (result == null) {
            return result;
        }
        if (Array.isArray(result)) {
            return executeSubSelectedArray(field, result, execContext);
        }
        return executeSelectionSet(field.selectionSet, result, execContext);
    });
}
function executeSubSelectedArray(field, result, execContext) {
    return execContext.arrayOrDeferrable(result.map(function (item) {
        if (item === null) {
            return null;
        }
        if (Array.isArray(item)) {
            return executeSubSelectedArray(field, item, execContext);
        }
        return executeSelectionSet(field.selectionSet, item, execContext);
    }));
}
function merge(dest, src) {
    if (src === null ||
        typeof src !== 'object' ||
        src.constructor.name === "Gun") {
        return src;
    }
    Object.keys(dest).forEach(function (destKey) {
        if (src.hasOwnProperty(destKey)) {
            merge(dest[destKey], src[destKey]);
        }
    });
    Object.keys(src).forEach(function (srcKey) {
        if (!dest.hasOwnProperty(srcKey)) {
            dest[srcKey] = src[srcKey];
        }
    });
}
function isPromise(obj) {
    return obj && typeof obj === 'object' && typeof obj.then === 'function';
}
function promiseOrImmediate(obj, fn) {
    if (isPromise(obj)) {
        return obj.then(fn);
    }
    else {
        return fn(obj);
    }
}
function arrayOrPromise(arr) {
    if (arr.some(isPromise)) {
        return Promise.all(arr);
    }
    else {
        return arr;
    }
}
//# sourceMappingURL=graphql.js.map