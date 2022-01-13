
export type TData<T> = T | undefined;
export type TTransform = string | string[];

export enum ETransformDirection {
    INPUT,
    OUTPUT
}

export function access<T = any>(data: any, accessor: string): T | null {
    if ([null, undefined].indexOf(data) > -1) return null;
    const parts: string[] = accessor.split('.');
    const current: string | undefined = parts.shift();
    const value = current === undefined ? null : data[current];

    if (parts.length > 0)
        return typeof value === 'object' ? access(value, parts.join('.')) : null;

    return value;
}

export function pathContainer<T = any>(data: any, accessor: string): T | null {
    if ([null, undefined].indexOf(data) > -1)
        data = {};

    const parts: string[] = accessor.split('.');

    const current: string | undefined = parts.shift();
    if (current === undefined)
        return null;

    if (data[current] === undefined)
        data[current] = {}

    if (parts.length === 1)
        return data[current];

    return pathContainer(data[current], parts.join('.'));
}

export function setPath<T = any>(data: any, accessor: string, value: any) {
    if ([null, undefined].indexOf(data) > -1)
        return;

    const parts: string[] = accessor.split('.');

    const current: string | undefined = parts.shift();
    if (current === undefined)
        return;

    if (parts.length > 0 && data[current] === undefined)
        data[current] = {}

    if (parts.length === 0) {
        data[current] = value;
        return;
    }

    setPath(data[current], parts.join('.'), value);
}

export class Transform {
    public readonly from: string[];
    public readonly to: string[];

    constructor(
        public readonly direction: ETransformDirection,
        public readonly func: string,
        public readonly schema: string,
        from: TTransform,
        to: TTransform,
    ) {
        this.from = from instanceof Array ? from : [from];
        this.to = to instanceof Array ? to : [to];
    }
}

export class Map {
    constructor(
        public readonly key: string,
        public readonly schema: string,
        public readonly accessor: string
    ) {}
}

export interface IType<T> {
    cast(value: any): T;
    value: T;
}

export interface ITypeConstructor<T = any> {
    new(value: any): IType<T>;
}

export class Type<T = any> implements IType<T> {
    public readonly value: T;
    constructor(value: any) {
        this.value = this.cast(value);
    }

    cast(value: any): T {
        return value;
    }
}

export function type(t: ITypeConstructor) {
    return function(target: any, key: string) {
        target.constructor.addType(key, t);
    }
}

export function map(schema: string, accessor: string) {
    return function(target: any, key: string) {
        target.constructor.addMap(new Map(key, schema, accessor));
    }
}

export function input(schema: string, from: TTransform, to: TTransform) {
    return function(target: any, func: string) {
        target.constructor.addTransform(new Transform(ETransformDirection.INPUT, func, schema, from, to));
    }
}

export function output(schema: string, from: TTransform, to: TTransform) {
    return function(target: any, func: string) {
        target.constructor.addTransform(new Transform(ETransformDirection.OUTPUT, func, schema, from, to));
    }
}

export class Schema {
    public readonly accessors: string[] = [];
    protected transforms: Transform[] = [];
    protected _maps: Map[] = [];

    addAccessor(accessor: string) {
        if (this.accessors.indexOf(accessor) === -1)
            this.accessors.push(accessor);
    }

    addTransform(transform: Transform) {
        this.transforms.push(transform);
    }

    addMap(map: Map) {
        this._maps.push(map);
        this.addAccessor(map.accessor);
    }

    getTransforms(direction: ETransformDirection): Transform[] {
        return this.transforms.filter((transform) => transform.direction === direction);
    }

    get inputs(): Transform[] {
        return this.getTransforms(ETransformDirection.INPUT);
    }

    get outputs(): Transform[] {
        return this.getTransforms(ETransformDirection.OUTPUT);
    }

    get maps(): Map[] {
        return this._maps;
    }
}

export interface IAdapter<T> {

}

export interface IAdapterConstructor<T = any> {
    new(): IAdapter<T>;

    schemas: {[key: string]: Schema};
    types: {[key: string]: ITypeConstructor};
    addType(prop: string, t: ITypeConstructor): void;
    addMap(map: Map): void;
    addTransform(transform: Transform): void;
}

export abstract class Adapter<T = any> implements IAdapter<T> {
    protected static schemas: {[key: string]: Schema};
    protected static types: {[key: string]: ITypeConstructor};

    public schema(schema: string) {
        return (this.constructor as IAdapterConstructor).schemas ? (this.constructor as IAdapterConstructor).schemas[schema] : null;
    }

    public type(t: string) {
        return (this.constructor as IAdapterConstructor).types ? (this.constructor as IAdapterConstructor).types[t] : null;
    }

    public async from(schema: string, inputData: any) {
        const _schema = this.schema(schema);
        if (!_schema)
            return;

        for (const map of _schema.maps) {
            const t: ITypeConstructor = this.type(map.key) || Type;
            (this as any)[map.key] = new t(access(inputData, map.accessor)).value
        }

        for (const input of _schema.inputs) {
            const inputValues: any[] = [];

            for (const t of input.from) {
                inputValues.push(access(inputData, t));
            }
            const out: any = await (this as any)[input.func](...inputValues);
            if (input.to.length === 1) {
                (this as any)[input.to[0]] = out;
            } else {
                for (let i = 0; i < input.to.length; i++) {
                    (this as any)[input.to[i]] = out[i];
                }
            }
        }
    }

    public async to(schema: string) {
        const _schema = this.schema(schema);
        const data: any = {};

        if (!_schema)
            return data;

        for (const map of _schema.maps) {
            const value: any = access(this, map.key);
            if (value === undefined) // Don't add undefined properties
                continue;
            setPath(data, map.accessor, value);
        }

        for (const output of _schema.outputs) {
            const outputValues: any[] = [];

            for (const t of output.from) {
                outputValues.push(access(this, t));
            }

            const out: any = await (this as any)[output.func](...outputValues);
            if (output.to.length === 1) {
                setPath(data, output.to[0], out);
            } else {
                for (let i = 0; i < output.to.length; i++) {
                    setPath(data, output.to[i], out[i]);
                }
            }
        }

        return data;
    }

    public static addTransform(transform: Transform) {
        this.schema(transform.schema).addTransform(transform)
    }

    public static addMap(map: Map) {
        this.schema(map.schema).addMap(map)
    }

    public static addType(prop: string, t: ITypeConstructor) {
        if (!this.types)
            this.types = {};

        this.types[prop] = t;
    }

    public static schema(schema: string): Schema {
        if (!this.schemas)
            this.schemas = {};

        if (!this.schemas[schema])
            this.schemas[schema] = new Schema();

        return this.schemas[schema];
    }
}
