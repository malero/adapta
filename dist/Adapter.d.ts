export declare type TData<T> = T | undefined;
export declare type TTransform = string | string[];
export declare enum ETransformDirection {
    INPUT = 0,
    OUTPUT = 1
}
export declare function access<T = any>(data: any, accessor: string): T | null;
export declare function pathContainer<T = any>(data: any, accessor: string): T | null;
export declare function setPath<T = any>(data: any, accessor: string, value: any): void;
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
export declare function type(t: ITypeConstructor): (target: any, key: string) => void;
export declare function map(schema: string, accessor: string): (target: any, key: string) => void;
export declare function input(schema: string, from: TTransform, to: TTransform): (target: any, func: string) => void;
export declare function output(schema: string, from: TTransform, to: TTransform): (target: any, func: string) => void;
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
export interface IAdapter<T> {
}
export interface IAdapterConstructor<T = any> {
    new (): IAdapter<T>;
    schemas: {
        [key: string]: Schema;
    };
    types: {
        [key: string]: ITypeConstructor;
    };
    addType(prop: string, t: ITypeConstructor): void;
    addMap(map: Map): void;
    addTransform(transform: Transform): void;
}
export declare abstract class Adapter<T = any> implements IAdapter<T> {
    protected static schemas: {
        [key: string]: Schema;
    };
    protected static types: {
        [key: string]: ITypeConstructor;
    };
    schema(schema: string): Schema | null;
    type(t: string): ITypeConstructor<any> | null;
    from(schema: string, inputData: any): Promise<void>;
    to(schema: string): Promise<any>;
    static addTransform(transform: Transform): void;
    static addMap(map: Map): void;
    static addType(prop: string, t: ITypeConstructor): void;
    static schema(schema: string): Schema;
}
