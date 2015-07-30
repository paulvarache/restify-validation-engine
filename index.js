var validator = require('validator');

function checkScope (validate, scope) {

    var errors = [];

    // Lopp through fields
    for (var fieldName in validate) {

        // Check the validity of the field
        var fieldError = checkField(validate[fieldName], scope[fieldName], fieldName);
        if (fieldError) {
            if (fieldError instanceof Error) {
                errors.push(fieldError);
            } else {
                errors.push({
                    message: fieldError,
                    field: fieldName,
                    given: scope[fieldName]
                });
            }
        }

    }
    return errors;
}

function checkField (checks, field, fieldName) {

    var params = [];

    // Stop the check if the field is not required and not here
    if (!checks.required && !validator.required(field)) {
        return null;
    }

    // Loop through the checks
    for (var key in checks) {

        // Extract the params (if defined)
        params = checks[key].params ? checks[key].params.slice() : [];
        // Add the field as the first param
        params.unshift(field);

        // Run the validation with the params and if it fails
        if (!validator[key].apply(validator, params)) {
            // The message is the value of the fields check
            if (typeof checks[key] === 'string' || checks[key] instanceof Error) {
                return checks[key];
            }
            // We return a generic error
            return 'The parameter `' + fieldName + '` did not pass the `' + key + '` test';
        }
    }
    return null;
}

module.exports = function (options) {
    options = options || {};
    options.customValidators = options.customValidators || {};
    options.formatter = options.formatter || function (errors) {
        if (Array.isArray(errors)) {
            return { errors: errors };
        }
        return errors;
    };

    // Add a `required` validator
    validator.extend('required', function (field) {
        return !!field && field !== '';
    });

    // Add all the custom validators
    for (var key in options.customValidators) {
        validator[key] = options.customValidators[key].bind(validator);
    }

    var scopes = options.scopes || ['params', 'body'];

    return function (req, res, next) {

        req.body = req.body || {};
        var errors  = [];
        if (req.route && req.route.validate) {

            // Chek every scope
            scopes.forEach(function (scope) {
                if (req.route.validate[scope]) {
                    var scopeErrors = checkScope(req.route.validate[scope], req[scope]).map(function (scopeError) {
                        scopeError.scope = scope;
                        return scopeError;
                    });
                    errors = errors.concat(scopeErrors);
                }
            });

        }

        // Return the errors if any otherwise go to the next middleware
        if (errors.length) {
            var formatter = req.route.validate.formatter || options.formatter;
            var body = options.multipleErrors ? errors : errors[0];
            if (!body.length && body instanceof Error) {
                return next(body);
            }
            return res.send(400, formatter(body));
        } else {
            return next();
        }
    };
};
