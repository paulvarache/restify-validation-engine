# restify-validation-engine ![build badge](https://img.shields.io/jenkins/s/http/ci.paulvarache.ninja/restify-validation-engine.svg)
--------------------------------------
[![NPM](https://nodei.co/npm/restify-validation-engine.png)](https://npmjs.org/package/restify-validation-engine)

Validation middleware for [restify](https://github.com/restify/node-restify) powered by [validator](https://github.com/chriso/validator.js).

## Get it

This module is available on npm under the name of `restify-validation-engine`.

```shell
npm install restify-validation-engine
```

## Load it

Then you can load it as a simple middleware.
  * You can add your own validators in the `customValidators` key of the options.
  * You can specify if you want a list of error or just one with `multipleErrors`.
  * You can change the way the error looks with the `formatter`.

```js
var restify = require('restify'),
    restifyValidator = require('restify-validation-engine');


var server = restify.createServer({
    name: 'myServer'
});

server.use(restifyValidator({
    customValidators: {
        myValidator: function (value) {
            // Here put your custom validation and return true for valid or false
        },
        multipleErrors: false // True if you want a list as result
        formatter: function (errors) {
            // errors can be an array or an object depending on `multipleErrors`
            if (!Array.isArray(errors)) {
                return errors;
            }
            return {
                status: 'error',
                errors: errors
            };
        }
    }
}));

```

## Use it

Now you can use the module in the definitions of your routes e.g.

```js
server.get({
    url: '/my-url',
    validate: { // Entry point of the module
        params: { // Which scope
            myParam: { // The field to validate
                required: true // A validator
            }
        }
    }
});
```

You can also add a `formatter` to the validate object for a route specific format. This will override the default formatter

```js
server.get({
    url: '/my-url',
    validate: { // Entry point of the module
        params: { // Which scope
            ...
        },
        formatter: function (errors) {
            return {
                name: 'my custom format',
                errors: errors
            }
        }
    }
});
```

In the validate key of the route you can define your fields in the `params` or `body` key.
Each field can have a set of validators. The validators available are the `required` validator,
every validator from the (validator)[https://github.com/chriso/validator.js] module and your custom ones.
A validator can be set to:
  * true/false
  * a custom error message
  * an Error object
  * an object with:
    * `msg` a custom error message
    * `params` when the validator need some

```js
server.post({
    url: '/platypuses',
    validate: { // Entry point of the module
        params: { // Which scope
            filter: {
                isIn: {
                    // A custom error message
                    msg: 'The filter param must be one of these values: small, normal, big',
                    // A list of params to give to isIn
                    params: [['small', 'normal', 'big']]
                }
            }
        },
        body: {
            email: { // The field to validate
                required: true, // A validator
                isEmail: "The mail is required" // This string will be used as a custom error message
            },
            password: {
                required: new restify.BadRequestError('Password is required')
            }
        }
    }
});
```

In this example, the `filter` param doesn't have a `required` validator but have a `isIn` validator.
In this case, if the field isn't given, the module will not check the other validators.

`isIn` is defined as :

**isIn(str, values)** - check if the string is in a array of allowed values.

The `str` param is provided by restify-validation-engine, but it will need the values param.
You can give this param by putting it in the `params` option.

Another example could be:

**isLength(str, min [, max])** - check if the string's length falls in a range. Note: this function takes into account surrogate pairs.

In this case, if you want to validate your field being between 4 and 24 characters long you will set the `params` options to `[4, 24]`.

## Love it

Now that your validation engine is in place, you will get a response like this when a field fails the validation:

```json
{
        "message": "The filter param must be one of these values: small, normal, big",
        "field": "filter",
        "scope": "params",
        "given": ""
}
```

Now in your middleware, you can be sure that your fields are valid.

## Make it better

Please give me some feedback about it. And if you have some idea, make a pull request.
