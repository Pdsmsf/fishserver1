var HALL_IP = "dev1.luckygame.mobi";
// var HALL_IP = "127.0.0.1";
var HALL_CLIENT_PORT = 9001;
var HALL_ROOM_PORT = 9002;

var ACCOUNT_PRI_KEY = "^&*#$%()@";
var ROOM_PRI_KEY = "~!@#$(*&^%$&";

var LOCAL_IP = '172.19.131.120';
// var LOCAL_IP = '127.0.0.1';

exports.mysql = function(){
	return {
		HOST: 'dev1.luckygame.mobi',
		USER: 'root',
		PSWD: 'LuckyGame1234!',
		DB: 'db_babykylin',
		PORT: 3306,
	}
}

//账号服配置
exports.account_server = function(){
	return {
		CLIENT_PORT:9000,
		HALL_IP:HALL_IP,
		HALL_CLIENT_PORT:HALL_CLIENT_PORT,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		
		//
		DEALDER_API_IP:LOCAL_IP,
		DEALDER_API_PORT:12581,
		VERSION:'20161227',
		APP_WEB:'http://fir.im/2f',
	};
};

//大厅服配置
exports.hall_server = function(){
	return {
		HALL_IP:HALL_IP,
		CLEINT_PORT:HALL_CLIENT_PORT,
		FOR_ROOM_IP:LOCAL_IP,
		ROOM_PORT:HALL_ROOM_PORT,
		ACCOUNT_PRI_KEY:ACCOUNT_PRI_KEY,
		ROOM_PRI_KEY:ROOM_PRI_KEY
	};
};

//游戏服进程配置
exports.game_server = function(gameid,configid,servertport){
    ///////////////////////////////////////////////////
	//game_bydh_700捕鱼大亨，房间进程1配置
	if(gameid==700&&configid==1)
	{
        return {
            //配置标识  相同配置标识说明游戏的配置是一样的（除了服务端口不一样）
            CONFIG_ID: 1,
            //服务编号默认和端口号一样
            SERVER_ID:HALL_IP+':'+servertport,
            //游戏编号，每个游戏都是唯一的编号
            //服务类型（金币类型GOLD，私人场类型PRIVATE，比赛类型MATCH）
            SERVER_TYPE:"GOLD",
            GAME_ID: 700,
            //游戏标记，用于定位游戏模块目录
            GAME_TOKEN: "game_bydh_700",

            //基础分值，底分
            GAME_BASE_SCORE: 1,
            //最小携带金币
            MIN_HAVE_SCORE: 1,
            //最大携带金币
            MAX_HAVE_SCORE: 100,
            //抽水比例，千分比，5代表千分之5
            TAX_RATIO: 5,

           //暴露给客户端的接口
            CLIENT_IP: HALL_IP,
            CLIENT_PORT: servertport,
            //暴露给大厅服的HTTP端口号
            HTTP_PORT: 9003,
            //HTTP TICK的间隔时间，用于向大厅服汇报情况
            HTTP_TICK_TIME: 5000,
            //大厅服IP
            HALL_IP: LOCAL_IP,
            FOR_HALL_IP: LOCAL_IP,
            //大厅服端口
            HALL_CLIENT_PORT: HALL_CLIENT_PORT,
            HALL_PORT: HALL_ROOM_PORT,
            //与大厅服协商好的通信加密KEY
            ROOM_PRI_KEY: ROOM_PRI_KEY,

        };
    }

    ///////////////////////////////////////////////////
    //game_scmj_100四川麻将，房间进程1配置
    if(gameid==100&&configid==1)
    {
        return {

            //配置类型，配置号相同不管开启多少进程，配置都是一样的
            CONFIG_ID: 1,
            //服务编号默认和端口号一样
            SERVER_ID:servertport,
            //服务类型（金币类型GOLD，私人场类型PRIVATE，比赛类型MATCH）
            SERVER_TYPE:"PRIVATE",
            //游戏编号，每个游戏都是唯一的编号
            GAME_ID: 100,
            //游戏标记，用于定位游戏模块目录
            GAME_TOKEN: "game_scmj_100",
            //基础分值，底分
            GAME_BASE_SCORE: 1,
            //最小携带金币
            MIN_HAVE_SCORE: 1,
            //最大携带金币
            MAX_HAVE_SCORE: 100,
            //抽水比例，千分比，5代表千分之5
            TAX_RATIO: 5,

            //暴露给客户端的接口
            CLIENT_IP: HALL_IP,
            CLIENT_PORT: servertport,
            //暴露给大厅服的HTTP端口号
            HTTP_PORT: 9003,
            //HTTP TICK的间隔时间，用于向大厅服汇报情况
            HTTP_TICK_TIME: 5000,
            //大厅服IP
            HALL_IP: LOCAL_IP,
            FOR_HALL_IP: LOCAL_IP,
            //大厅服端口
            HALL_PORT: HALL_ROOM_PORT,
            //与大厅服协商好的通信加密KEY
            ROOM_PRI_KEY: ROOM_PRI_KEY,
            //

        };
    }
};

