import { FieldNode, SelectionNode } from 'graphql';
export declare type DirectiveInfo = {
    [fieldName: string]: {
        [argName: string]: any;
    };
};
export declare function getDirectiveInfoFromField(field: FieldNode, variables: Object): DirectiveInfo;
export declare function shouldInclude(selection: SelectionNode, variables?: {
    [name: string]: any;
}): Boolean;
