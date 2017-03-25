"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function checkDocument(doc) {
    if (doc.kind !== 'Document') {
        throw new Error("Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql");
    }
    var numOpDefinitions = doc.definitions.filter(function (definition) {
        return definition.kind === 'OperationDefinition';
    }).length;
    if (numOpDefinitions > 1) {
        throw new Error('Queries must have exactly one operation definition.');
    }
}
function getFragmentDefinitions(doc) {
    var fragmentDefinitions = doc.definitions.filter(function (definition) {
        if (definition.kind === 'FragmentDefinition') {
            return true;
        }
        else {
            return false;
        }
    });
    return fragmentDefinitions;
}
exports.getFragmentDefinitions = getFragmentDefinitions;
function createFragmentMap(fragments) {
    if (fragments === void 0) { fragments = []; }
    var symTable = {};
    fragments.forEach(function (fragment) {
        symTable[fragment.name.value] = fragment;
    });
    return symTable;
}
exports.createFragmentMap = createFragmentMap;
function getMainDefinition(queryDoc) {
    checkDocument(queryDoc);
    var fragmentDefinition;
    for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
        var definition = _a[_i];
        if (definition.kind === 'OperationDefinition') {
            var operation = definition.operation;
            if (operation === 'query' || operation === 'mutation' || operation === 'subscription') {
                return definition;
            }
        }
        if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
            fragmentDefinition = definition;
        }
    }
    if (fragmentDefinition) {
        return fragmentDefinition;
    }
    throw new Error('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.');
}
exports.getMainDefinition = getMainDefinition;
//# sourceMappingURL=getFromAST.js.map