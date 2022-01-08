export declare type TData<T> = T | undefined;
export declare type TTransform = string | string[];
export declare enum ETransformDirection {
    INPUT = 0,
    OUTPUT = 1
}
export declare function access<T = any>(data: any, accessor: string): T | null;
export declare class Transform {
    readonly direction: ETransformDirection;
    readonly func: string;
    readonly schema: string;
    readonly from: string[];
    readonly to: string[];
    constructor(direction: ETransformDirection, func: string, schema: string, from: TTransform, to: TTransform);
}
export declare class Map {
    readonly key: string;
    readonly schema: string;
    readonly accessor: string;
    constructor(key: string, schema: string, accessor: string);
}
export interface IType<T> {
    cast(value: any): T;
    value: T;
}
export interface ITypeConstructor<T = any> {
    new (value: any): IType<T>;
}
export declare class Type<T = any> implements IType<T> {
    readonly value: T;
    constructor(value: any);
    cast(value: any): T;
}
export declare function type(t: ITypeConstructor): (target: Adapter, key: string) => void;
export declare function map(schema: string, accessor: string): (target: Adapter, key: string) => void;
export declare function input(schema: string, from: TTransform, to: TTransform): (target: Adapter, func: string) => void;
export declare function output(schema: string, from: TTransform, to: TTransform): (target: Adapter, func: string) => void;
export declare class Schema {
    readonly accessors: string[];
    protected transforms: Transform[];
    protected _maps: Map[];
    addAccessor(accessor: string): void;
    addTransform(transform: Transform): void;
    addMap(map: Map): void;
    getTransforms(direction: ETransformDirection): Transform[];
    get inputs(): Transform[];
    get outputs(): Transform[];
    get maps(): Map[];
}
export declare abstract class Adapter {
    protected schemas: {
        [key: string]: Schema;
    };
    protected types: {
        [key: string]: ITypeConstructor;
    };
    from(schema: string, inputData: any): Promise<void>;
    to(schema: string): Promise<any>;
    addTransform(transform: Transform): void;
    addMap(map: Map): void;
    addType(prop: string, t: ITypeConstructor): void;
    schema(schema: string): Schema;
}
