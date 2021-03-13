# Fluent JSON validator

 * [**GitHub repository**](https://github.com/Semmu/fluent-json-validator)
 * [**Online API docs**](https://semmu.github.io/fluent-json-validator)
 * [**NPM package site**](https://www.npmjs.com/package/fluent-json-validator)

An easy-to-use, expressive, and composable JSON object validator, with a fluent builder pattern interface!

```javascript
// this is what you want to validate:
// coming from the user, read from a file, sent back by some API, etc.
const person = {
    name: 'John Doe',
    age: 42,
    hobbies: ['eating', 'coding', 'sleeping'],
    favoriteNumberOrColor: 'green'
};

// this is the structure you want your data to have:
const personSchema = is.Object({
    name: is.String(),
    nickname: is.optional().String(),
    // ^ nickname may be missing, but if not, it must be a string.
    age: is.Number().Which(
        age => age > 10
        // ^ age must be more than 10.
    ),
    hobbies: is.ArrayOf(
        is.String().Which(
            hobby => hobby !== 'illegal activities'
            // ^ hobbies can't include illegal activities!
        )
    ),
    favoriteNumberOrColor: is.OneOf([is.Number(), is.String()])
});

// and this is how you check if it matches or not:
personSchema.validate(person); // == true
```


## Features

 * Lightweight, since it has **no dependencies!**
 * Has a **small and simple API**, only a handful of methods.
 * Can validate **primitive types, arrays** (`is.ArrayOf`) and even **variable types** (`is.OneOf`)!
 * Can validate **any arbitrary JSON object structure**, just mix'n'match the needed validators (`is.Object`)!
 * Schemas are **reusable and composable** for validating complex data structures painlessly!
 * Can be used for **formal**<sup>1</sup> and **functional**<sup>1</sup> validation as well (`is.Which`)!

<sup>1</sup>: I may be using slightly incorrect words, but by formal validation I mean _the subject has the desired structure_, and by functional validation I mean _the subject itself also satisfies additional arbitrary requirements_.


## Installation

```bash
npm install fluent-json-validator
```


## Usage / how-to / tutorial

First, of course you need to import the library itself:

```javascript
import { is } from 'fluent-json-validator'
```

Then you can create validators like this:

```javascript
const stringValidator = is.String();
```

These validators can then validate objects passed to them like this:

```javascript
stringValidator.validate('some string') // true
stringValidator.validate(42)            // false
```

Of course this whole expression can be written on one single line if you prefer compact solutions:

```javascript
is.String().validate('some string') // still true
is.String().validate(42)            // still false
```

If some data may not be present, you can use optional validators, which accept missing/undefined data:

```javascript
const isOptionalNumber = is.optional().Number() // or is.Number().optional()

isOptionalNumber.validate(42)    // true
isOptionalNumber.validate()      // true
isOptionalNumber.validate('NaN') // false
```

As for primitive data types, we have validators for strings, numbers and booleans:

```javascript
const stringValidator = is.String()
const numberValidator = is.Number()
const boolValidator   = is.Boolean()

stringValidator.validate('more string') // true
numberValidator.validate(42)            // true
boolValidator.validate(true)            // true
```

And for complex/compound data types, i.e. objects, we have the object validator:

```javascript
const objectValidator = is.Object({
    someKey: is.String()
})
```

This object validator needs a parameter which describes the desired schema of the subject. It must contain the same properties as the subject you want to validate, and it must be made up of other validators.

Using this is very similar to the primitive data type validators:

```javascript
const someObject = {
    someKey: 'this is some string'
}

objectValidator.validate(someObject) // true

const otherObject = {
    someKey: 42
}

objectValidator.validate(otherObject) // false
```

(Of course the above expressions can be written on one line as well. Excercise left for the reader.)

For arrays, you can use the array validator:

```javascript
const arrayValidator = is.ArrayOf(is.Number())
```

This one also needs a parameter: a validator, which is going to check all the elements of the array, like this:

```javascript
arrayValidator.validate([1, 2, 3])          // true
arrayValidator.validate(['some', 'string']) // false
arrayValidator.validate([1, 2, 'impostor']) // false
```

If you happen to have some data which could have different types, you can validate that as well:

```javascript
const variableValidator = is.OneOf([is.String(), is.Number()])
```

This validator needs an array of validators, and the subject will need to match against at least one of them.

```javascript
variableValidator.validate('some string') // true
variableValidator.validate(42)            // also true
variableValidator.validate(true)          // false
```

Lastly, if you need to check for functional requirements, you can do that too:

```javascript
const ageValidator = is.Number().Which(value => value >= 18)
```

It needs a lambda/function as a parameter, which will receive the subject to validate, and must return a boolean.

Using it does not require anything special:

```javascript
ageValidator.validate(18) // true
ageValidator.validate(5)  // false
```

And if you need to validate complex data structures, you can compose big validators from smaller ones, like:

```javascript
const isPerson = is.Object({
    name:   is.String(),
    gender: is.optional().String(),
    age:    is.Number()
})

const isLocation = is.Object({
    longitude: is.Number(),
    latitude:  is.Number()
})

// the compound validator.
const isCompany = is.Object({
    owner:     isPerson,
    employees: is.ArrayOf(isPerson),
    location:  isLocation
})

isCompany.validate({
    owner: {
        name:   'John Doe',
        gender: 'male',
        age:    42
    },
    employees: [
        {
            name: 'Some Dude',
            // note: gender is missing!
            age:  18
        }, {
            name:   'Another Individual',
            gender: 'mystery',
            age:    99
        }
    ],
    location: {
        longitude: 42,
        latitude:  3.14
    }
}) // true
```

This is actually a very simple example compared to what you can do with this library.

For example you can have an array of values, in which all of them must meet a functional requirement:

```javascript
const diceRolls = is.ArrayOf(is.Number().Which(value => value > 0 && value < 7))

diceRolls.validate([1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1]) // true
diceRolls.validate([1, 6, 3])                         // true
diceRolls.validate([9])                               // false
diceRolls.validate(['over 9000'])                     // false
```

And also you can have a functional requirement which ensures e.g. cross-referencing in complex schemas:

```javascript
const isFood = is.Object({
    name: is.String(),
    calories: is.Number()
})

const validator = is.Object({
    foods: is.ArrayOf(isFood),
    favoriteFoodName: is.String()
}).Which(obj => obj.foods.filter(food => food.name == obj.favoriteFoodName).length == 1)
         // ^ == there exists one and only one food which has the name of favoriteFoodName.

console.log(validator.validate({
    foods: [
        {
            name: 'apple',
            calories: 52
        },
        {
            name: 'pizza',
            calories: 266
        }
    ],
    favoriteFoodName: 'apple'
})) // true
```

In this example above we have a list of foods (with names and calories), and a favorite food, which must exist in the said foods array.

Also don't forget to check the [countless tests](./tests.js) for inspiration, especially the [complex ones](./tests.js#L285) at the end!


## API docs

In the [`docs/`](docs/) folder and also hosted on [GitHub Pages](https://semmu.github.io/fluent-json-validator). (Don't forget to check the right sidebar of the site!)


## Testing

Testcases are listed in [`tests.js`](./tests.js). Run them with
```bash
npm test
```


## Note about code quality (?)

This project most probably does not follow the current Javascript standards and coding style embraced by the global community, thus some people may find the source code weird and/or outright hideous. As I'm not primarily a Javascript developer (and I don't intend to become one) the current implementation is a solution that I could come up with, which works and has the API that I dreamed of.

If you have ideas how to improve the library internals (without breaking the public API) feel free to open an issue or PR to discuss it! I'm open for improvements and constructive criticism.


## But why?

Because there is no other JSON object validator with a builder pattern interface like this one. Okay, there is actually [Superstruct](https://www.npmjs.com/package/superstruct), but I didn't know about it when I started developing this, and also it is much-much bigger with many features I personally don't need.

So I created this library as a smaller alternative.


## License

MIT
