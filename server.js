var restify = require('restify'),
    restifyValidator = require('./index.js');

var server = restify.createServer({
    name: 'test'
});


server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(restifyValidator({

}));

server.get({
        url: '/test01',
        validate: {
            params: {
                filter: {
                    required: "Filter is required"
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
        res.send('HOT');
    });

server.listen(4444, function () {
    request('http://localhost:4444', function (error, response, body) {
        console.log(error, response, body);
    });
});
