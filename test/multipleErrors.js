var restify = require('restify'),
    request = require('request'),
    restifyValidator = require('../'),
    should = require('should');

describe('restify-validation-engine module', function () {
    var server;
    before(function (done) {
        server = restify.createServer({
            name: 'test'
        });

        server.use(restify.queryParser());
        server.use(restify.bodyParser());

        server.use(restifyValidator({
            multipleErrors: true
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

        server.listen(6666, done);
    });
    it ('should return 3 errors', function (done) {
        request({
            uri: 'http://localhost:6666/test01',
            method: "POST",
            json: true
        }, function (error, response, body) {
            should.not.exist(error);
            should.exist(body.errors);
            body.errors.should.lengthOf(3);
            done();
        });
    });
});
