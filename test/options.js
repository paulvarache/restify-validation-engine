var restify = require('restify'),
    request = require('request'),
    restifyValidator = require('../'),
    should = require('should');

describe('Default options', function () {
    it('should not crash when no options is given', function () {
        restifyValidator();
        restifyValidator({});
    });
});
