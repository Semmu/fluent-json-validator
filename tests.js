import { is } from './is.js';

// this is the huge array containing all the testcases
const testCases = [
    {
        description: 'values are required by default',
        result: false === is.String().validate() &&
                false === is.Number().validate() &&
                false === is.Boolean().validate() &&
                false === is.Object().validate()
    },
    {
        description: 'optionals accept undefined',
        result:  true === is.optional().String().validate() &&
                 true === is.optional().Number().validate() &&
                 true === is.optional().Boolean().validate() &&
                 true === is.optional().Object().validate()
    },
    {
        description: 'types only accept correct inputs',
        result: false === is.String().validate() &&
                 true === is.String().validate('string') &&
                false === is.String().validate(42) &&
                false === is.String().validate(true) &&
                false === is.String().validate({}) &&

                false === is.Number().validate() &&
                false === is.Number().validate('string') &&
                 true === is.Number().validate(42) &&
                false === is.Number().validate(true) &&
                false === is.Number().validate({}) &&

                false === is.Boolean().validate() &&
                false === is.Boolean().validate('string') &&
                false === is.Boolean().validate(42) &&
                 true === is.Boolean().validate(true) &&
                false === is.Boolean().validate({}) &&

                false === is.Object().validate() &&
                false === is.Object().validate('string') &&
                false === is.Object().validate(42) &&
                false === is.Object().validate(true) &&
                 true === is.Object().validate({})
    },
    {
        description: 'validating unknown type fails',
        result: false === is.Where(x => true).validate() &&
                false === is.optional().Where(x => true).validate('anything')
    },
    {
        description: 'functional requirements work',
        result:  true === is.String().Where(str => str.length > 5).validate('more than 5 chars') &&
                false === is.String().Where(str => str.length > 5).validate('less') &&

                 true === is.Number().Where(num => num > 42).validate(50) &&
                false === is.Number().Where(num => num > 42).validate(0) &&

                 true === is.Boolean().Where(bln => bln).validate(true) &&
                false === is.Boolean().Where(bln => bln).validate(false) &&

                 true === is.Object().Where(obj => 'key1' in obj ? 'key2' in obj : true).validate({}) &&
                false === is.Object().Where(obj => 'key1' in obj ? 'key2' in obj : true).validate({key1: 'value1'}) &&
                 true === is.Object().Where(obj => 'key1' in obj ? 'key2' in obj : true).validate({key1: 'value1', key2: 'value2'})
    },
    {
        description: 'multiple simultaneous functional requirements work',
        result:  true === is.Number().Where(num => num > 5).Where(num => num < 10).validate(8) &&
                false === is.Number().Where(num => num > 5).Where(num => num < 10).validate(4) &&
                false === is.Number().Where(num => num > 5).Where(num => num < 10).validate(11)
    },
    {
        description: 'ArrayOf does not accept non-arrays',
        result: false === is.ArrayOf(is.String()).validate('not an array') &&
                false === is.ArrayOf(is.Number()).validate(42)
    },
    {
        description: 'ArrayOf accepts the correct values',
        result:  true === is.ArrayOf(is.String()).validate(['array', 'of', 'strings']) &&
                false === is.ArrayOf(is.String()).validate(['array', 'of', 42]) &&
                false === is.ArrayOf(is.String()).validate(['array', 'of', undefined]) &&

                 true === is.ArrayOf(is.optional().String()).validate(['array', 'of', undefined])
    },
    {
        description: 'functional requirements of arrays and their elements work correctly',
        result:  true === is.ArrayOf(is.String()).Where(arr => arr.length == 3).validate(['array', 'of', 'strings']) &&
                false === is.ArrayOf(is.String()).Where(arr => arr.length == 3).validate(['array', 'of', 'more', 'strings']) &&
                 true === is.ArrayOf(is.String().Where(str => str == 'a')).validate(['a', 'a', 'a']) &&
                false === is.ArrayOf(is.String().Where(str => str == 'a')).validate(['a', 'a', 'B!']) &&

                 true === is.ArrayOf(is.String().Where(str => str == 'a')).Where(arr => arr.length == 3).validate(['a', 'a', 'a']) &&
                false === is.ArrayOf(is.String().Where(str => str == 'a')).Where(arr => arr.length == 3).validate(['a', 'a', 'a', 'a'])
    },
    {
        description: 'optional ArrayOf works correctly',
        result:  true === is.optional().ArrayOf(is.String()).validate() &&
                 true === is.optional().ArrayOf(is.String()).validate(['array', 'of', 'strings']) &&
                false === is.optional().ArrayOf(is.String()).validate(['array', 'of', 42]) &&
                 true === is.optional().ArrayOf(is.optional().String()).validate(['array', 'of', undefined]) &&
                false === is.optional().ArrayOf(is.optional().String()).validate(['array', 'of', 42])
    },
    {
        description: 'OneOf works correctly',
        result: false === is.OneOf([is.String()]).validate() &&
                 true === is.OneOf([is.String()]).validate('string') &&
                false === is.OneOf([is.String()]).validate(42) &&

                 true === is.OneOf([is.String(), is.Number()]).validate('string') &&
                 true === is.OneOf([is.String(), is.Number()]).validate(42) &&
                false === is.OneOf([is.String(), is.Number()]).validate({}) &&
                 true === is.OneOf([is.Object(), is.Number()]).validate({}) &&
                false === is.OneOf([is.String(), is.Number()]).validate()
    },
    {
        description: 'optional OneOf works correctly',
        result:  true === is.optional().OneOf([is.Number(), is.String()]).validate() &&
                 true === is.optional().OneOf([is.Number(), is.String()]).validate(42) &&
                 true === is.optional().OneOf([is.Number(), is.String()]).validate('string') &&
                false === is.optional().OneOf([is.Number(), is.String()]).validate({})
    },
    {
        description: 'OneOf mixed with optional types works correctly',
        result:  true === is.OneOf([is.optional().String()]).validate() &&
                 true === is.OneOf([is.optional().String()]).validate('string') &&
                false === is.OneOf([is.optional().String()]).validate(42) &&

                 true === is.OneOf([is.String(), is.optional().Number()]).validate() &&
                 true === is.OneOf([is.String(), is.optional().Number()]).validate('string') &&
                 true === is.OneOf([is.String(), is.optional().Number()]).validate(42) &&
                false === is.OneOf([is.String(), is.optional().Number()]).validate({})
    },
    {
        description: 'ArrayOf OneOf works correctly',
        result:  true === is.ArrayOf(is.OneOf([is.String()])).validate(['array', 'of', 'strings']) &&
                false === is.ArrayOf(is.OneOf([is.String()])).validate(['array', undefined, 'string']) &&

                 true === is.ArrayOf(is.OneOf([is.optional().String()])).validate(['array', undefined, 'string']) &&

                 true === is.ArrayOf(is.OneOf([is.String(), is.Number()])).validate(['string', 42]) &&
                false === is.ArrayOf(is.OneOf([is.String(), is.Number()])).validate(['string', 42, undefined]) &&
                false === is.ArrayOf(is.OneOf([is.String(), is.Number()])).validate(['string', 42, {}]) &&

                 true === is.ArrayOf(is.OneOf([is.String(), is.optional().Number()])).validate(['string', 42, undefined]) &&
                 true === is.ArrayOf(is.OneOf([is.optional().String(), is.Number()])).validate(['string', 42, undefined]) &&
                false === is.ArrayOf(is.OneOf([is.String(), is.optional().Number()])).validate(['string', 42, {}])
    },
    {
        description: 'simple Object validation works',
        result:  true === is.Object({
                            str: is.String(),
                            num: is.Number(),
                            bln: is.Boolean(),
                            obj: is.Object()
                        }).validate({
                            str: 'string',
                            num: 42,
                            bln: false,
                            obj: {}
                        }) &&
                false === is.Object({
                            str: is.String(),
                            num: is.Number(),
                        }).validate({
                            str: 'string',
                        })
    },
    {
        description: 'Object validation with optional properties works',
        result: false === is.Object({
                            str: is.String(),
                            num: is.Number(),
                        }).validate({
                            str: 'string',
                        }) &&
                 true === is.Object({
                            str: is.String(),
                            num: is.optional().Number(),
                        }).validate({
                            str: 'string',
                        })
    },
    {
        description: 'Object having ArrayOf works',
        result:  true === is.Object({
                            nums: is.ArrayOf(is.Number())
                        }).validate({
                            nums: [1, 2, 3]
                        }) &&
                 true === is.Object({
                            nums: is.ArrayOf(is.optional().Number())
                        }).validate({
                            nums: [1, 2, undefined]
                        }) &&
                 true === is.Object({
                            nums: is.ArrayOf(is.optional().Number())
                        }).validate({
                            nums: [undefined]
                        }) &&
                 true === is.Object({
                            nums: is.ArrayOf(is.Number())
                        }).validate({
                            nums: []
                        }) &&
                 true === is.Object({
                            nums: is.ArrayOf(is.Number())
                        }).validate({
                            nums: []
                        }) &&
                false === is.Object({
                            nums: is.ArrayOf(is.Number())
                        }).validate({
                            nums: undefined
                        }) &&
                false === is.Object({
                            nums: is.ArrayOf(is.Number())
                        }).validate({
                            nums: [undefined]
                        }) &&
                false === is.Object({
                            nums: is.ArrayOf(is.Number())
                        }).validate({
                            // actually empty object
                        }) &&
                 true === is.Object({
                            nums: is.optional().ArrayOf(is.Number())
                        }).validate({
                            // actually empty object
                        }) &&
                false === is.Object({
                            nums: is.optional().ArrayOf(is.Number())
                        }).validate({
                            nums: 'it exists, but not an array of numbers'
                        })
    },
    {
        description: 'Object having OneOf works',
        result:  true === is.Object({
                            oneof: is.OneOf([is.String(), is.Number()])
                        }).validate({
                            oneof: 'string'
                        }) &&
                 true === is.Object({
                            oneof: is.OneOf([is.String(), is.Number()])
                        }).validate({
                            oneof: 42
                        }) &&
                false === is.Object({
                            oneof: is.OneOf([is.String(), is.Number()])
                        }).validate({
                            oneof: {}
                        }) &&
                false === is.Object({
                            oneof: is.OneOf([is.String(), is.Number()])
                        }).validate({
                            // actually empty object
                        }) &&
                 true === is.Object({
                            oneof: is.optional().OneOf([is.String(), is.Number()])
                        }).validate({
                            // actually empty object
                        }) &&
                false === is.Object({
                            oneof: is.optional().OneOf([is.String(), is.Number()])
                        }).validate({
                            oneof: []
                        })
    }
];

const personSchema = is.Object({
    name:     is.String(),
    nickname: is.optional().String(),
    hometown: is.String(),
    age:      is.Number().Where(age => age > 5),
    hobbies:  is.optional().ArrayOf(is.String().Where(str => str !== 'illegal activites')),
    favoriteNumberOrColor: is.optional().OneOf([is.String(), is.Number()]),
});

const locationSchema = is.Object({
    name:        is.String(),
    coordinates: is.ArrayOf(is.Number()),
    population:  is.optional().Number(),
});

const everythingSchema = is.Object({
    people:    is.ArrayOf(personSchema),
    locations: is.ArrayOf(locationSchema)
}).Where(everything => (
    // this is a functional way to say that the hometown of each person
    // exists in locations, a.k.a. no one has a hometown which is not
    // defined in locations.
    everything.people.filter(person => (
        everything.locations.filter(locations => locations.name == person.hometown).length == 0
    )).length == 0
)).Where(everything => (
    // this is a super complicated but functional way to say that there are no location duplicates based on their name...
    // (why js doesn't have `unique`?)
    everything.locations.map(location => location.name).filter((location, i, array) => array.indexOf(location) == i).length == everything.locations.length
));

testCases.push(
    {
        description: 'complex test: person validation works',
        result:  true === personSchema.validate({
                            name: 'John Doe',
                            nickname: 'johnny',
                            hometown: 'Budapest',
                            age: 42,
                        }) &&
                 true === personSchema.validate({
                            name: 'John Doe',
                            hometown: 'Budapest',
                            age: 42,
                            hobbies: ['eating', 'coding', 'sleeping']
                        }) &&
                 true === personSchema.validate({
                            name: 'John Doe',
                            hometown: 'Budapest',
                            age: 42,
                            hobbies: ['eating', 'coding', 'sleeping'],
                            favoriteNumberOrColor: 42
                        }) &&
                false === personSchema.validate({
                            name: 'John Doe',
                            hometown: 'Budapest',
                            age: 42,
                            hobbies: ['eating', 'coding', 'sleeping'],
                            favoriteNumberOrColor: ['you', 'dont', 'tell', 'me', 'what', 'to', 'do']
                        }) &&
                false === personSchema.validate({
                            name: 'John Doe',
                            hometown: 'Budapest',
                            age:  42,
                            hobbies: ['eating', 'illegal activites', 'sleeping']
                        }) &&
                false === personSchema.validate({
                            name: 'John Doe Jr.',
                            hometown: 'Budapest',
                            age: 2
                        }) &&
                false === personSchema.validate({
                            hometown: 'Budapest',
                            age: 42
                        })
    },
    {
        description: 'complex test: location validation works',
        result:  true === locationSchema.validate({
                            name: 'Budapest',
                            coordinates: [47.49, 19.04],
                            population: 1
                          }) &&
                 true === locationSchema.validate({
                            name: 'Budapest',
                            coordinates: [47.49, 19.04],
                          }) &&
                false === locationSchema.validate({
                            name: 'Budapest',
                            population: 42
                          }) &&
                false === locationSchema.validate({
                            coordinates: [47.49, 19.04],
                            population: 42
                          })
    },
    {
        description: 'complex test: composite schema for people and location validation works, with cross-referencing functional validation',
        result:  true === everythingSchema.validate({
                            people: [{
                                name: 'John Doe',
                                hometown: 'Budapest',
                                age: 42,
                                hobbies: ['eating', 'coding', 'sleeping']
                            }],
                            locations: [{
                                name: 'Budapest',
                                coordinates: [47.49, 19.04],
                                population: 1
                            }]
                        }) &&
                false === everythingSchema.validate({
                            people: [{
                                name: 'John Doe',
                                hometown: 'Budapest',
                                age: 42,
                                hobbies: ['eating', 'coding', 'sleeping']
                            }],
                            locations: []
                        }) &&
                false === everythingSchema.validate({
                            people: [{
                                name: 'John Doe',
                                hometown: 'Budapest',
                                age: 42,
                                hobbies: ['eating', 'coding', 'sleeping']
                            }],
                            locations: [{
                                name: 'Not Budapest',
                                coordinates: [47.49, 19.04],
                                population: 1
                            }]
                        }) &&
                 true === everythingSchema.validate({
                            people: [{
                                name: 'Johnny Bravo',
                                hometown: 'Aron City',
                                age: 42,
                                hobbies: ['looking good', 'dating girls', 'flexing']
                            }, {
                                name: 'John Doe',
                                hometown: 'Budapest',
                                age: 42,
                                hobbies: ['eating', 'coding', 'sleeping']
                            }, {
                                name: 'Ms. Janet Doe',
                                hometown: 'Budapest',
                                age: 40,
                                hobbies: ['eating', 'coding', 'sleeping']
                            }],
                            locations: [{
                                name: 'Budapest',
                                coordinates: [47.49, 19.04],
                                population: 1
                            }, {
                                name: 'Aron City',
                                coordinates: [34.05, 118.24],
                            }]
                        }) &&
                false === everythingSchema.validate({
                            people: [{
                                name: 'John Doe',
                                hometown: 'Budapest',
                                age: 42,
                                hobbies: ['eating', 'coding', 'sleeping']
                            }],
                            locations: [{
                                name: 'Budapest',
                                coordinates: [47.49, 19.04],
                                population: 1
                            }, {
                                name: 'Budapest',
                                coordinates: [47.49, 19.04],
                                population: 1
                            }]
                        })
    }
);

// struct to hold output coloring special chars
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
};

// boolean to sign if we had any test failures
let __hadErrors = false;

// check and print testcase results
const check = (result, description) => {
    if ((result) === true) { // result could be any expression and we want to be as strict as possible
        console.log(`${c.bold}${c.green}[+]${c.reset} ${description}`);
    } else {
        console.log(`${c.bold}${c.red}[-]${c.reset} ${description}`);
        __hadErrors = true;
    };
};

// we're starting the testing
console.log(`${c.bold}[i] Running tests...${c.reset}`);

// iterate over all the testcases and check them
testCases.forEach(testCase => check(testCase.result, testCase.description));

// just an empty line after the testcases
console.log('');

// print testing verdict
if (!__hadErrors) {
    // if we had no errors, we celebrate
    console.log(`${c.bold}${c.green}ALL TESTS PASSED!${c.reset}`);
} else {
    // if we had errors, we make sure it's visible
    console.log(`${c.bold}${c.red}SOME TESTS FAILED!${c.reset}`);
    
    // we set the exit code to 1 to signal failure
    process.exit(1);
}