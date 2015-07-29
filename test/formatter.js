var restify = require('restify'),
    request = require('request'),
    restifyValidator = require('../'),
    should = require('should');

describe('Formatter', function () {
    var server;
    before(function (done) {
        server = restify.createServer({
            name: 'test'
        });

        server.use(restify.queryParser());
        server.use(restify.bodyParser());

        server.use(restifyValidator({
            formatter: function (body) {
                return {
                    message: 'formatted from options'
                };
            }
        }));

        server.get({
            url: '/test01',
            validate: {
                params: {
                    field: { required: true }
                }
            }
        }, function (req, res, next) {res.send(200);});

        server.get({
            url: '/test02',
            validate: {
                params: {
                    field: { required: true }
                },
                formatter: function (body) {
                    return {
                        message: 'formatted from route'
                    };
                }
            }
        }, function (req, res, next) {res.send(200);});

        server.listen(5555, done);
    });

    it('should use the options formatter', function (done) {
        request({
            uri: 'http://localhost:5555/test01',
            method: "GET",
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body.message);
            body.message.should.be.eql('formatted from options');
            done();
        });
    });

    it('should use the route formatter', function (done) {
        request({
            uri: 'http://localhost:5555/test02',
            method: "GET",
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body.message);
            body.message.should.be.eql('formatted from route');
            done();
        });
    });

});
