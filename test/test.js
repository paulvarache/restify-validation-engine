var restify = require('restify'),
    request = require('request'),
    restifyValidator = require('../'),
    should = require('should'),
    server;

describe('Default options', function () {
    it('should not crash when no options is given', function () {
        restifyValidator();
    });
    it('should not crash when no customValidator is given', function () {
        restifyValidator({});
    });
});

describe('restify-validation-engine module', function () {
    before(function (done) {
        server = restify.createServer({
            name: 'test'
        });

        server.use(restify.queryParser());
        server.use(restify.bodyParser());

        server.use(restifyValidator({
            customValidators: {
                myTrueValidator: function (input) {
                    return true;
                },
                myFalseValidator: function (input) {
                    return false;
                }
            }
        }));

        server.post({
                url: '/test01',
                validate: {
                    params: {
                        filter: {
                            required: "Filter is required",
                            isIn: {
                                params: [['filter1', 'filter2']]
                            }
                        }
                    },
                    body: {
                        login: {
                            required: "Login is required"
                        },
                        password: {
                            required: "Password is required"
                        }
                    }
                }
            }, function (req, res) {
                res.send('OK');
            });

            server.post({
                    url: '/test02',
                    validate: {
                        params: {
                            filter: {
                                required: true
                            }
                        }
                    }
                }, function (req, res) {
                    res.send('OK');
                });

            server.post({
                    url: '/test03',
                    validate: {
                        params: {
                            filter: {
                                myTrueValidator: true
                            },
                            email: {
                                isEmail: "The email address must be valid"
                            }
                        }
                    }
                }, function (req, res) {
                    res.send('OK');
                });

                server.get('/test04', function (req, res) {
                    res.send('OK');
                });

        server.listen(4444, done);
    });
    it ('should return 3 errors', function (done) {
        request({
            uri: 'http://localhost:4444/test01',
            method: "POST",
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body.errors);
            body.errors.should.lengthOf(3);
            console.log(body);
            done();
        });
    });
    it ('should return no error', function (done) {
        request({
            uri: 'http://localhost:4444/test01?filter=filter1',
            method: "POST",
            body: {
                login: 'test',
                password: 'test'
            },
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            body.should.be.eql('OK');
            done();
        });
    });
    it ('should return 1 error with custom message', function (done) {
        request({
            uri: 'http://localhost:4444/test01?filter=filter1',
            method: 'POST',
            body: {
                login: 'test'
            },
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body.errors);
            body.errors.should.lengthOf(1);
            body.errors[0].scope.should.be.eql('body');
            body.errors[0].field.should.be.eql('password');
            body.errors[0].message.should.be.eql('Password is required');
            done();
        });
    });
    it ('should return 1 error with default message', function (done) {
        request({
            uri: 'http://localhost:4444/test02',
            method: 'POST',
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body.errors);
            body.errors.should.lengthOf(1);
            body.errors[0].message.should.be.eql('The parameter `filter` did not pass the `required` test');
            done();
        });
    });
    it('should return 1 error about the email being not valid', function (done) {
        request({
            uri: 'http://localhost:4444/test03?email=notvalid',
            method: 'POST',
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body.errors);
            body.errors.should.lengthOf(1);
            body.errors[0].scope.should.be.eql('params');
            body.errors[0].field.should.be.eql('email');
            body.errors[0].message.should.be.eql('The email address must be valid');
            done();
        });
    });
    it('should not have errors about the email', function (done) {
        request({
            uri: 'http://localhost:4444/test03',
            method: 'POST'
        }, function (error, response, body) {
            should.not.exist(error);
            body.should.be.eql('"OK"');
            done();
        });
    });
    it('should not be ok', function (done) {
        request({
            uri: 'http://localhost:4444/test04',
            method: 'GET'
        }, function (error, response, body) {
            should.not.exist(error);
            body.should.be.eql('"OK"');
            done();
        });
    });
});
