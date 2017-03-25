import { DocumentNode, FieldNode } from 'graphql';
import { FragmentMap } from './getFromAST';
export declare type Resolver = (fieldName: string, rootValue: any, args: any, context: any, info: ExecInfo) => any;
export declare type VariableMap = {
    [name: string]: any;
};
export declare type ResultMapper = (values: {
    [fieldName: string]: any;
}, rootValue: any) => any;
export declare type FragmentMatcher = (rootValue: any, typeCondition: string, context: any) => boolean | Promise<boolean>;
export declare type ExecContext = {
    fragmentMap: FragmentMap;
    contextValue: any;
    variableValues: VariableMap;
    resultMapper: ResultMapper;
    resolver: Resolver;
    fragmentMatcher: FragmentMatcher;
};
export declare type ExecInfo = {
    isLeaf: boolean;
    resultKey: string;
    fieldNode: FieldNode;
};
export declare type ExecOptions = {
    resultMapper?: ResultMapper;
    fragmentMatcher?: FragmentMatcher;
};
export declare function graphql(resolver: Resolver, document: DocumentNode, rootValue?: any, contextValue?: any, variableValues?: VariableMap, execOptions?: ExecOptions): any;
