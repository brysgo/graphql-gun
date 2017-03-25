import { DocumentNode, OperationDefinitionNode, FragmentDefinitionNode } from 'graphql';
export declare function getFragmentDefinitions(doc: DocumentNode): FragmentDefinitionNode[];
export interface FragmentMap {
    [fragmentName: string]: FragmentDefinitionNode;
}
export declare function createFragmentMap(fragments?: FragmentDefinitionNode[]): FragmentMap;
export declare function getMainDefinition(queryDoc: DocumentNode): OperationDefinitionNode | FragmentDefinitionNode;
