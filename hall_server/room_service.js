var crypto = require('../utils/crypto');
var express = require('express');
var db = require('../utils/db');
var http = require('../utils/http');
var app = express();

var hallIp = null;
var config = null;
var rooms = {};
var serverMap = {};
var roomIdOfUsers = {};

//设置跨域访问
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
});
//注册游戏服务器
app.get('/register_gs',function(req,res){
	
	var ip = req.ip;
    var clientip = req.query.clientip;
    var clientport = req.query.clientport;
    var httpPort = req.query.httpPort;
    var load = req.query.load;//人数负载
    var id = clientip + ":" + clientport;//每个游戏服务都是唯一的

	if(serverMap[id]){
		var info = serverMap[id];
		if(info.clientport != clientport
			|| info.httpPort != httpPort
			|| info.ip != ip
		){
			console.log("duplicate gsid:" + id + ",addr:" + ip + "(" + httpPort + ")");
			http.send(res,1,"duplicate gsid:" + id);
			return;
		}
		info.load = load;
		http.send(res,0,"ok",{ip:ip});
		return;
	}
	serverMap[id] = {
		ip:ip,
		id:id,
		clientip:clientip,
		clientport:clientport,
		httpPort:httpPort,
		load:load
	};
	http.send(res,0,"ok",{ip:ip});
	console.log("game server registered.\n\tid:" + id + "\n\taddr:" + ip + "\n\thttp port:" + httpPort + "\n\tsocket clientport:" + clientport);

	var reqdata = {
		serverid:id,
		sign:crypto.md5(id+config.ROOM_PRI_KEY)
	};
	//获取服务器信息
	http.get(ip,httpPort,"/get_server_info",reqdata,function(ret,data){
		if(ret && data.errcode == 0){
			for(var i = 0; i < data.userroominfo.length; i += 2){
				var userId = data.userroominfo[i];
				var roomId = data.userroominfo[i+1];
			}
		}
		else{
			console.log(data.errmsg);
		}
	});
});
//选择游戏服务器
function chooseServer(){
	var serverinfo = null;
	for(var s in serverMap){
		var info = serverMap[s];
		if(serverinfo == null){
			serverinfo = info;			
		}
		else{
			if(serverinfo.load > info.load){
				serverinfo = info;
			}
		}
	}	
	return serverinfo;
}
//导出函数 创建私人房间，私人桌
exports.createRoom = function(account,userId,roomConf,fnCallback){
	var serverinfo = chooseServer();
	if(serverinfo == null){
		fnCallback(101,null);
		return;
	}
	
	db.get_gems(account,function(data){
		if(data != null){
			//2、请求创建房间
			var reqdata = {
				userid:userId,
				gems:data.gems,
				conf:roomConf
			};
			reqdata.sign = crypto.md5(userId + roomConf + data.gems + config.ROOM_PRI_KEY);
			// 到游戏服务器 serverinfo中创建房间
			http.get(serverinfo.ip,serverinfo.httpPort,"/create_room",reqdata,function(ret,data){
				//console.log(data);
				if(ret){
					if(data.errcode == 0){
						fnCallback(0,data.roomid);
					}
					else{
						fnCallback(data.errcode,null);		
					}
					return;
				}
				fnCallback(102,null);
			});	
		}
		else{
			fnCallback(103,null);
		}
	});
};
//导出函数 创建公共房间，公共桌
exports.createPublicRoom = function(account,userId,roomConf,fnCallback){
    var serverinfo = chooseServer();
    if(serverinfo == null){
        fnCallback(101,null);
        return;
    }

    // 创建公共房间不需要花费资源
    //2、请求创建房间
    var reqdata = {
        userid: userId,
        conf: roomConf
    };
    reqdata.sign = crypto.md5(parseInt(userId) + roomConf + config.ROOM_PRI_KEY);
    http.get(serverinfo.ip, serverinfo.httpPort, "/create_public_room", reqdata, function (ret, data) {
        //console.log(data);
        if (ret) {
            if (data.errcode == 0) {
                fnCallback(0, data.roomid);
            }
            else {
                fnCallback(data.errcode, null);
            }
            return;
        }
        fnCallback(102, null);
    });
};

// // 数据库中有遗留的房间，重新创建房间
// app.get('/reCreate_room',function(req,res) {
//     var userId = req.userId;
//     var name = req.name;
//     var roomId = 0;
//     var accunt = req.account;
//     var account = req.baseParam;
//     exports.enterRoom();
// });
/*
*
*	roomId：		要进入的房间号： 若为0 则进入公共房间，房间号由服务器分配
*	account:   账户： 公共房间若没有多余的房间就要创建一个
*	baseParam: 多余参数： 进入公共房间时作为房间配置（捕鱼的为该房间发炮基数）
 */
exports.enterRoom = function(userId,name,roomId,account,baseParam,fnCallback){

	var reqdata = {};

	var checkRoomIsRuning = function(serverinfo,roomId,callback){
		var sign = crypto.md5(roomId + config.ROOM_PRI_KEY);
		http.get(serverinfo.ip,serverinfo.httpPort,"/is_room_runing",{roomid:roomId,sign:sign},function(ret,data){
			if(ret){
				if(data.errcode == 0 && data.runing == true){
					callback(true);
				}
				else{
					callback(false);
				}
			}
			else{
				callback(false);
			}
		});
	}

	var enterRoomReq = function(serverinfo){
		http.get(serverinfo.ip,serverinfo.httpPort,"/enter_room",reqdata,function(ret,data){
			console.log(data);
			if(ret){
				if(data.errcode == 0){
					db.set_room_id_of_user(userId,roomId,function(ret){
						fnCallback(0,{
							ip:serverinfo.clientip,
							port:serverinfo.clientport,
							token:data.token,
							roomId: roomId
						});
					});
				}
				else{
					console.log(data.errmsg);
					fnCallback(data.errcode,null);
				}
			}
			else{
				fnCallback(-1,null);
			}
		});
	};

	var chooseServerAndEnter = function(serverinfo){
		serverinfo = chooseServer();
		if(serverinfo != null){
			enterRoomReq(serverinfo);
		}
		else{
			fnCallback(-1,null);					
		}
	};

	var getRoomAddr = function (roomId) {

        db.get_room_addr(roomId, function (ret, ip, port) {
            if (ret) {
                var id = ip + ":" + port;
                var serverinfo = serverMap[id];
                if (serverinfo != null) {
                    checkRoomIsRuning(serverinfo, roomId, function (isRuning) {
                        if (isRuning) {
                            enterRoomReq(serverinfo);
                        }
                        else {
                            chooseServerAndEnter(serverinfo);
                        }
                    });
                }
                else {
                    chooseServerAndEnter(serverinfo);
                }
            }
            else {
                fnCallback(-2, null);
            }
        });

        reqdata = {
            userid:userId,
            name:name,
            roomid:roomId
        };
        //后期绑定
        reqdata.sign = crypto.md5(userId + name + roomId + config.ROOM_PRI_KEY);
    }

    // 如果roomId为0，则进入公共房间， 房间号自动分配
    if(roomId == 0){
        db.get_empty_room(baseParam, function(row){
            if(row == null){
                // 如果没有空闲就创建一个房间
                console.log('没有空房间');
                exports.createPublicRoom(account, userId, baseParam, function(err,tempId) {
                    if (err == 0 && tempId != null) {
                        roomId = tempId;
                        getRoomAddr(roomId);
                    }
                });
            }else{
                roomId = row.id;
                getRoomAddr(roomId);
            }
        });
    }else{
        getRoomAddr(roomId);
    }
};

exports.isServerOnline = function(ip,port,callback){
	var id = ip + ":" + port;
	var serverInfo = serverMap[id];
	if(!serverInfo){
		callback(false);
		return;
	}
	var sign = crypto.md5(config.ROOM_PRI_KEY);
	http.get(serverInfo.ip,serverInfo.httpPort,"/ping",{sign:sign},function(ret,data){
		if(ret){
			callback(true);
		}
		else{
			callback(false);
		}
	});
};

exports.start = function($config){
	config = $config;
	app.listen(config.ROOM_PORT,config.FOR_ROOM_IP);
	console.log("room service is listening on " + config.FOR_ROOM_IP + ":" + config.ROOM_PORT);
};