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
 * Can validate **any arbitrary JSON object structure**, just mix'n'match the needed validators!
 * Schemas are **reusable and composable** for validating complex data structures painlessly!
 * Can be used for **formal**<sup>1</sup> and **functional**<sup>1</sup> validation as well! (`is.Which`)

<sup>1</sup>: I may be using slightly incorrect words, but by formal validation I mean _the data has valid structure_, and by functional validation I mean _the data/value itself satisfies additional arbitrary requirements if needed_.


## Installation

```bash
npm i fluent-json-validator
```


## Usage & Examples

I will write some examples here, but in the meantime check out [the countless tests](./tests.js) for inspiration, especially the [complex ones](./tests.js#L285) at the end!


## API docs

In the [`docs/`](docs/) folder and also on https://semmu.github.io/fluent-json-validator.


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
