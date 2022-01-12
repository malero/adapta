# Simple Typescript Data Adapter

Transform your data from one schema to another with Adapta.

```
class Person extends Adapter {
    @map(ESchema.SALESFORCE, 'Name_First__c')
    @map(ESchema.STOREFRONT, 'fname')
    first_name: TData<string>;

    @map(ESchema.SALESFORCE, 'Name_Last__c')
    @map(ESchema.STOREFRONT, 'lname')
    last_name: TData<string>;

    @input(ESchema.DEALER, 'name', ['first_name', 'last_name'])
    async splitName(name: string) {
        const parts = name.split(' ');
        return [parts.shift(), parts.join(' ')];
    }

    @output(ESchema.DEALER, ['first_name', 'last_name'], 'name')
    async joinName(firstName: string, lastName: string) {
        return `${firstName} ${lastName}`;
    }
}

const person = new Person();
await person.from(ESchema.DEALER, {
    name: 'Bob Lewis'
});
const sfdata = await person.to(ESchema.SALESFORCE);
```

`sfdata` will now be:

```
{
    "Name_First__c": "Bob",
    "Name_Last__c": "Lewis"
}
```
