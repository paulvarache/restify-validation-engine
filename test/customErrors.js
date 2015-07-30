var restify = require('restify'),
    request = require('request'),
    restifyValidator = require('../'),
    should = require('should'),
    util = require('util');

describe('custom errors', function () {
    var server;

    function LoginError () {
        this.message = "Login is required";
        this.statusCode = 418;
        Error.apply(this, arguments);
    }
    util.inherits(LoginError, Error);

    before(function (done) {
        server = restify.createServer({
            name: 'test'
        });

        server.use(restify.queryParser());
        server.use(restify.bodyParser());

        server.use(restifyValidator());

        server.post({
                url: '/test01',
                validate: {
                    params: {
                        filter: {
                            required: new Error("Filter is required")
                        }
                    },
                    body: {
                        login: {
                            required: new LoginError()
                        }
                    }
                }
            }, function (req, res) {
                res.send('OK');
            });

        server.listen(7777, done);
    });
    it ('should return a custom error', function (done) {
        request({
            uri: 'http://localhost:7777/test01',
            method: "POST",
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            response.statusCode.should.be.eql(500);
            body.message.should.be.eql('Filter is required');
            done();
        });
    });
    it ('should return a custom login error', function (done) {
        request({
            uri: 'http://localhost:7777/test01?filter=f',
            method: "POST",
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            response.statusCode.should.be.eql(418);
            body.message.should.be.eql('Login is required');
            done();
        });
    });
});
