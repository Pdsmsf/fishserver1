var http = require('http');
var https = require('https');
var qs = require('querystring');
var net = require('net');
String.prototype.format = function(args) {
	var result = this;
	if (arguments.length > 0) {
		if (arguments.length == 1 && typeof (args) == "object") {
			for (var key in args) {
				if(args[key]!=undefined){
					var reg = new RegExp("({" + key + "})", "g");
					result = result.replace(reg, args[key]);
				}
			}
		}
		else {
			for (var i = 0; i < arguments.length; i++) {
				if (arguments[i] != undefined) {
					//var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
					var reg = new RegExp("({)" + i + "(})", "g");
					result = result.replace(reg, arguments[i]);
				}
			}
		}
	}
	return result;
};

exports.post = function (host,port,path,data,callback) {
	
	var content = qs.stringify(data);  
	var options = {  
		hostname: host,  
		port: port,  
		path: path + '?' + content,  
		method:'GET'
	};  
	  
	var req = http.request(options, function (res) {  
		console.log('STATUS: ' + res.statusCode);  
		console.log('HEADERS: ' + JSON.stringify(res.headers));  
		res.setEncoding('utf8');  
		res.on('data', function (chunk) {  
			//console.log('BODY: ' + chunk);
			callback(chunk);
		});  
	});
	  
	req.on('error', function (e) {  
		console.log('problem with request: ' + e.message);  
	});  
	  
	req.end(); 
};

exports.get2 = function (url,data,callback,safe) {
	var content = qs.stringify(data);
	var url = url + '?' + content;
	var proto = http;
	if(safe){
		proto = https;
	}
	var req = proto.get(url, function (res) {  
		//console.log('STATUS: ' + res.statusCode);  
		//console.log('HEADERS: ' + JSON.stringify(res.headers));  
		res.setEncoding('utf8');  
		res.on('data', function (chunk) {  
			//console.log('BODY: ' + chunk);
			var json = JSON.parse(chunk);
			callback(true,json);
		});  
	});
	  
	req.on('error', function (e) {  
		console.log('problem with request: ' + e.message);
		callback(false,e);
	});  
	  
	req.end(); 
};

exports.get = function (host,port,path,data,callback,safe) {
	var content = qs.stringify(data);  
	var options = {  
		hostname: host,  
		path: path + '?' + content,  
		method:'GET'
	};
	if(port){
		options.port = port;
	}
	var proto = http;
	if(safe){
		proto = https;
	}
	var req = proto.request(options, function (res) {  
		//console.log('STATUS: ' + res.statusCode);  
		//console.log('HEADERS: ' + JSON.stringify(res.headers));  
		res.setEncoding('utf8');  
		res.on('data', function (chunk) {  
			//console.log('BODY: ' + chunk);
			var json = JSON.parse(chunk);
			callback(true,json);
		});  
	});
	  
	req.on('error', function (e) {  
		console.log('problem with request: ' + e.message);
		callback(false,e);
	});  
	  
	req.end(); 
};

exports.send = function(res,errcode,errmsg,data){
	if(data == null){
		data = {};
	}
	data.errcode = errcode;
	data.errmsg = errmsg;
	var jsonstr = JSON.stringify(data);
	res.send(jsonstr);
};

// 检测端口是否被占用
exports.is_port_occupied=function(port){
    // 创建服务并监听该端口
    var server = net.createServer().listen(port);

    server.on('listening', function () { // 执行这块代码说明端口未被占用
        server.close();// 关闭服务
        console.log('The port【' + port + '】 is available.') ;// 控制台输出信息
		return true;
    });
    server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') { // 端口已经被使用
            console.log('The port【' + port + '】 is occupied, please change other port.');
			return true;
        }
    });
};

// exports.is_port_occupied=function(port, callback){
//     // 创建服务并监听该端口
//     var server = net.createServer().listen(port);
//
//     var callbackOnce= false;
//     var timeoutRef = setTimeout(function(){
//     	callbackOnce = true;
//     	callback(false, port);
// 	}, 1000)
// 	timeoutRef.unref();
//
//     var connected = false;
//
//     server.on('listening', function () { // 执行这块代码说明端口未被占用
//         clearTimeout(timeoutRef);
//         if(server)
//         	server.close();// 关闭服务
//         console.log('The port【' + port + '】 is available.') ;// 控制台输出信息
//
// 		if(!callbackOnce){
// 			callbackOnce = true;
// 			callback(true, port);
// 		}
//     });
//     server.on('error', function (err) {
//         clearTimeout(timeoutRef);
//
//         var result = true;
//         if(err.code === 'EADDRINUSE'){
//             console.log('The port【' + port + '】 is occupied, please change other port.');
//         	result = false;
// 		}
//
// 		if(!callback){
//         	callbackOnce = true;
//         	callback(result,port);
// 		}
//     });
// };