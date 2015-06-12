var validator = require('validator');

function checkScope (validate, scope) {

    var errors = [];

    for (var fieldName in validate) {

        var fieldError = checkField(validate[fieldName], scope[fieldName], fieldName);
        if (fieldError) {
            errors.push({
                message: fieldError,
                field: fieldName,
                given: scope[fieldName]
            });
        }

    }
    return errors;
}

function checkField (checks, field, fieldName) {

    var params = [];

    if (!checks.required && !validator.required(field)) {
        return null;
    }

    for (var key in checks) {

        params = checks[key].params ? checks[key].params.slice() : [];
        params.unshift(field);
        if (!validator[key].apply(validator, params)) {
            if (checks[key].message) {
                return checks[key].msg;
            }
            return 'The parameter `' + fieldName + '` did not pass the `' + key + ' test';
        }

    }

    return null;
}

module.exports = function (options) {

    validator.extend('required', function (field) {
        return !!field && field !== '';
    });

    for (var key in options.customValidators) {
        validator[key] = options.customValidators[key].bind(validator);
    }

    return function (req, res, next) {

        var scopes = options.scopes || ['params', 'body'];

        req.body = req.body || {};
        var errors  = [];
        if (req.route && req.route.validate) {

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

        if (errors.length) {
            res.send(400, {
                status: 'error',
                errors: errors
            });
        } else {
            next();
        }
    };
};