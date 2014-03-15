var PORT = 80;
var TOKEN = 'cdi';

var restify = require('restify');
var crypto = require('crypto');
var xml2js = require('xml2js');
var fs = require('fs');

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());

var io = require('socket.io').listen(server);


server.get('/wechat', auth);
server.post('/wechat', receiveMsg);

server.get('/index', index);


function auth(req, res, next) {
    var signature = req.params.signature;
    var timestamp = req.params.timestamp;
    var nonce = req.params.nonce;

    var tmpArr = new Array(TOKEN, timestamp, nonce);
    tmpArr = tmpArr.sort();
    var tmpStr = tmpArr.join("");
    var shasum = crypto.createHash('sha1');
    shasum.update(tmpStr);
    tmpStr = shasum.digest('hex');
    
    res.setHeader('content-type', 'text/plain');
    if(tmpStr == req.params.signature) {
        res.send(200, req.params.echostr);
        console.log('success');
    } else {
        res.send(200, 'error');
        console.log('error');
    }

    return next();
}

function receiveMsg(req, res, next) {
    var parser = new xml2js.Parser();
    parser.parseString(req.body, function(err, result) {
        console.dir(result);

        io.sockets.emit('msg-text', {FromUserName: result.xml.FromUserName, Content: result.xml.Content});
    });

    res.setHeader('content-type', 'text/plain');
    res.send(200, '');
    return next();
}

function index(req, res, next) {
    res.writeHead(200, {'content-type': 'text/html'});
    fs.readFile('./index.html', 'utf-8', function(err, text){
        res.write(text);
        res.end();
    });

    return next();
}


server.listen(PORT, function() {
      console.log('%s listening at %s', server.name, server.url);
});

