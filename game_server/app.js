var http_service = require("./http_service");
var userMgr = require('./usermgr');

//从配置文件获取服务器信息
var configs = require(process.argv[2]);
var gameid =process.argv[3];
var configid=process.argv[4];
var serverport=process.argv[5];
var config = configs.game_server(gameid,configid,serverport);

//加载游戏服务模块
var path="./game_modules/"+config.GAME_TOKEN+"/socket_service";
var socket_service = require(path);
//加载和初始化数据库
var db = require('../utils/db');
db.init(configs.mysql());

var roomPath= config.GAME_TOKEN;
//开启HTTP服务
http_service.initWithRoomMgr(roomPath);
http_service.start(config);

//开启外网SOCKET服务
// 先确定使用哪个roomManager
userMgr.initWithRoomMgr(roomPath);
socket_service.start(config);

//require('./gamemgr');