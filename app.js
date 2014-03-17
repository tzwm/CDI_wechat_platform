var PORT = 80; // wechat require 80 port
var TOKEN = 'cdi';  

var restify = require('restify'); // REST web service
var crypto = require('crypto'); // SHA1
var xml2js = require('xml2js'); // XML parser
var fs = require('fs'); // about filesystem

var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());

var io = require('socket.io').listen(server);


server.get('/wechat', auth);  // http://mp.weixin.qq.com/wiki/index.php?title=%E9%AA%8C%E8%AF%81%E6%B6%88%E6%81%AF%E7%9C%9F%E5%AE%9E%E6%80%A7
server.post('/wechat', receiveMsg); // http://mp.weixin.qq.com/wiki/index.php?title=%E6%8E%A5%E6%94%B6%E6%99%AE%E9%80%9A%E6%B6%88%E6%81%AF

server.get('/index', index); // render index.html for testing 


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

