import {input, output, map, TData, type, Adapter, Type, IAdapterConstructor, setPath} from "../src/Adapter";

class Int extends Type {
    cast(v: any): number {
        return parseInt(v);
    }
}

enum ESchema {
    DATABASE = 'db',
    API1 = 'api1',
    API2 = 'api2'
}

class AdapterSpec extends Adapter {
    @map(ESchema.DATABASE, 'name_first')
    @map(ESchema.API1, 'fname')
    first_name: TData<string>;

    @map(ESchema.DATABASE, 'name_last')
    @map(ESchema.API1, 'lname')
    last_name: TData<string>;

    @input(ESchema.API2, 'name', ['first_name', 'last_name'])
    async splitName(name: string) {
        const parts = name.split(' ');
        return [parts.shift(), parts.join(' ')];
    }

    @output(ESchema.API2, ['first_name', 'last_name'], 'name')
    async joinName(firstName: string, lastName: string) {
        return `${firstName} ${lastName}`;
    }
}


describe('Adapter', () => {
    it('should set path values correctly', () => {
        const data: any = {};
        setPath(data, 'test.and.stuff', 42);
        expect(data.test.and.stuff).toBe(42);
        setPath(data, 'testing', 43);
        expect(data.testing).toBe(43);
    });

    it("should work with from and to different schemas", async function () {
        const adapta = new AdapterSpec();
        await adapta.from(ESchema.API2, {
            name: 'Bob Lewis'
        });

        expect(adapta.first_name).toBe('Bob');
        expect(adapta.last_name).toBe('Lewis');

        const dbData = await adapta.to(ESchema.DATABASE);
        expect(dbData.name_first).toBe('Bob');
        expect(dbData.name_last).toBe('Lewis');

        const api1Data = await adapta.to(ESchema.API1);
        expect(api1Data.fname).toBe('Bob');
        expect(api1Data.lname).toBe('Lewis');

        const api2Data = await adapta.to(ESchema.API2);
        expect(api2Data.name).toBe('Bob Lewis');
    });
});
