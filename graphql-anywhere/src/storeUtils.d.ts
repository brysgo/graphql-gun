import { FieldNode, InlineFragmentNode, SelectionNode, ExecutionResult } from 'graphql';
export declare function argumentsObjectFromField(field: FieldNode, variables: Object): Object;
export declare function resultKeyNameFromField(field: FieldNode): string;
export declare function isField(selection: SelectionNode): selection is FieldNode;
export declare function isInlineFragment(selection: SelectionNode): selection is InlineFragmentNode;
export declare function graphQLResultHasError(result: ExecutionResult): number;
