var crypto = require('../../../utils/crypto');
var db = require('../../../utils/db');
var util = require('util');
var tokenMgr = require('../../tokenmgr');
var roomMgr = require('./roommgr');
var userMgr = require('../../usermgr');
var def = require("./cmd_define");
var io = null;

/*
 *
 * socket.emit('action');表示发送了一个action命令，命令是字符串的，在另一端接收时，可以这么写： socket.on('action',function(){...});
 socket.emit('action',data);表示发送了一个action命令，还有data数据，在另一端接收时，可以这么写： socket.on('action',function(data){...});
 socket.emit(action,arg1,arg2); 表示发送了一个action命令，还有两个数据，在另一端接收时，可以这么写： socket.on('action',function(arg1,arg2){...});
 在emit方法中包含回调函数，例如：
 socket.emit('action',data, function(arg1,arg2){...} );那么这里面有一个回调函数可以在另一端调用，另一端可以这么写：socket.on('action',function(data,fn){   fn('a','b') ;  });
 上面的data数据可以有0个或者多个，相应的在另一端改变function中参数的个数即可，function中的参数个数和顺序应该和发送时一致
 上面的fn表示另一个端传递过来的参数，是个函数，写fn('a','b') ;会回调函数执行。一次发送不应该写多个回调，否则只有最后一个起效，回调应作为最后一个参数。
 *
 * */

exports.start = function (config, mgr) {

    // 启动游戏先加载线路图
    def.loadTraceFile('traces.json', function (list) {
        console.log(list);
    });

    io = require('socket.io')(config.CLIENT_PORT);//
    //当客户端与服务器端建立连接时,触发socket.io服务的connection事件,回调函数中的socket参数是服务器端与客户端建立连接的socket端口对象.
    io.sockets.on('connection', function (socket) {


        ////////////////////游戏服务通信/////////////////////////////////////////
        socket.on('login', function (data) {
            console.log('login: ' + data);
            data = JSON.parse(data);
            if (socket.userId != null) {
                //已经登陆过的就忽略
                return;
            }
            var token = data.token;
            var roomId = data.roomId;
            var time = data.time;
            var sign = data.sign;

            //检查参数合法性
            if (token == null || roomId == null || sign == null || time == null) {
                socket.emit('login_result', {errcode: 1, errmsg: "invalid parameters"});
                return;
            }

            //检查参数是否被篡改
            var md5 = crypto.md5(roomId + token + time + config.ROOM_PRI_KEY);
            if (md5 != sign) {
                socket.emit('login_result', {errcode: 2, errmsg: "login failed. invalid sign!"});
                return;
            }

            //检查token是否有效 Administrator
            if (tokenMgr.isTokenValid(token) == false) {
                socket.emit('login_result', {errcode: 3, errmsg: "token out of time."});
                return;
            }

            //检查房间合法性
            var userId = tokenMgr.getUserID(token);
            var roomId = roomMgr.getUserRoom(userId);
            //将用户与socket绑定
            userMgr.bind(userId, socket);
            socket.userId = userId;

            //返回房间信息
            var roomInfo = roomMgr.getRoom(roomId);
            var seatIndex = roomMgr.getUserSeat(userId);
            roomInfo.seats[seatIndex].ip = socket.handshake.address;

            var userData = null;
            var seats = [];
            for (var i = 0; i < roomInfo.seats.length; ++i) {
                var rs = roomInfo.seats[i];
                var online = false;
                if (rs.userId > 0) {
                    online = userMgr.isOnline(rs.userId);
                }
                //根据vip确定炮型
                var vipa = rs.vip;
                var cannonKindVip = {
                        '0': 1,
                        '1': 4,
                        '2': 7,
                        '3': 10,
                        '4': 13,
                        '5': 16,
                        '6': 19,
                    }[vipa] || 1;
                seats.push({
                    userId: rs.userId,
                    ip: rs.ip,
                    score: rs.score,
                    name: rs.name,
                    vip: rs.vip,
                    online: online,
                    ready: rs.ready,
                    seatIndex: i,

                    // 正在使用哪种炮
                    cannonKind: cannonKindVip,
                    // 能量值
                    power: 0
                });

                if (userId == rs.userId) {
                    userData = seats[i];
                }
            }

            //通知前端
            var ret = {
                errcode: 0,
                errmsg: "ok",
                data: {
                    roomId: roomInfo.id,
                    conf: roomInfo.conf,
                    numofgames: roomInfo.numOfGames,
                    seats: seats
                }
            };
            socket.emit('login_result', ret);

            // 通知其它客户端
            userMgr.broacastInRoom('new_user_comes_push', userData, userId, false);
            socket.gameMgr = roomInfo.gameMgr;

            socket.emit('login_finished');

            // 至此登录结束，游戏正式开始
            socket.gameMgr.startGame(roomInfo.id);

        });

        // 客户端切换场景为按成后才能请求场景信息
        // 可兼容C++ GameOperation功能
        socket.on('ready', function (data) {
            console.log('ready: ' + data);
            data = JSON.parse(data);
            var userId = data.userId;
            if (userId == null) {
                return;
            }
            socket.gameMgr.setReady(userId);

            // userMgr.broacastInRoom('user_ready_push',{userid:userId,ready:true},userId,true);
        });

        // 开火
        // var data = {
        //    userId: cc.yqs.userMgr.userId,
        //    chairId: cc.yqs.userMgr.chairId,
        //    bulletKind:this.CannonKind,
        //    bulletId: bulletId,
        //    angle: this.angle,
        //    lockFishId: lockfishId
        // };
        socket.on('user_fire', function (data) {
            console.log('user_fire: ' + data);
            data = JSON.parse(data);
            var userId = socket.userId;
            if (!userId) {
                return;
            }
            var sign = data.sign;
            var md5 = crypto.md5(data.userId + data.chairId + data.bulletKind + data.bulletId + data.angle + data.lockFishId + config.ROOM_PRI_KEY);
            if(sign != md5){
                return;
            }
            // 有玩家开火
            socket.gameMgr.userFire(data.userId, data);
        });

        // 逮鱼
        // var data = {
        //    userId : cc.yqs.userMgr.userId,
        //    chairId: cc.yqs.userMgr.chairId,
        //    bulletId: bullet.id,
        //    fishId: self.id
        // };
        socket.on('catch_fish', function (data) {
            console.log('catch_fish: ' + data);
            data = JSON.parse(data);
            var sign = data.sign;
            var md5 = crypto.md5(data.userId + data.chairId  + data.bulletId + data.fishId + config.ROOM_PRI_KEY);
            if(sign != md5){
                return;
            }
            // 传给gameMgr做命中判断
            socket.gameMgr.catchFish(data);
        });

        socket.on('laser_catch_fish', function (data) {
            console.log('laser_catch_fish' + data);
            data = JSON.parse(data);
            var sign = data.sign;
            var md5 = crypto.md5(data.userId + data.chairId + data.fishes + config.ROOM_PRI_KEY);
            if(sign != md5){
                return;
            }
            // 传给gameMgr做命中判断
            socket.gameMgr.laserCatchFish(data);

        })

        // 玩家锁定鱼
        // var data = {
        //    userId: cc.yqs.userMgr.userId,
        //    chairId: this.chairId,
        //    fishId: fishId,
        // };
        // cc.yqs.net.send('user_lock_fish', data);
        socket.on('user_lock_fish', function (data) {
            console.log('lock_fish: ' + data);
            // 有用户锁定鱼
            data = JSON.parse(data);
            // 通知房间里的其他玩家
            socket.gameMgr.lockFish(data);
        });

        socket.on('user_frozen', function (data) {
            console.log('frozen: ' + data);
            // 有用户冷冻场景
            data = JSON.parse(data);
            // 通知房间内的其他玩家
            data.startTime = new Date().getTime();
            socket.gameMgr.frozenScene(data);
        });

        // var data = {
        //     userId: cc.yqs.userMgr.userId,
        //     chairId: cc.yqs.userMgr.chairId,
        //     cannonKind: kind,
        // };
        socket.on('user_change_cannon', function (data) {
            console.log('change_cannon: ' + data);
            data = JSON.parse(data);
            var userId = socket.userId;
            if (!userId || userId != data.userId) {
                return;
            }

            //
            socket.gameMgr.changeCannon(data);
        });

        //退出房间
        socket.on('exit', function (data) {
            console.log('exit: ' + data);
            var userId = socket.userId;
            if (userId == null) {
                return;
            }

            var roomId = roomMgr.getUserRoom(userId);
            if (roomId == null) {
                return;
            }

            //通知其它玩家，有人退出了房间
            userMgr.broacastInRoom('exit_notify_push', userId, userId, false);

            roomMgr.exitRoom(userId);
            userMgr.del(userId);

            socket.emit('exit_result');
            socket.disconnect();
        });

        //解散房间
        socket.on('dispress', function (data) {
            console.log('dispress: ' + data);
            var userId = socket.userId;
            if (userId == null) {
                return;
            }

            var roomId = roomMgr.getUserRoom(userId);
            if (roomId == null) {
                return;
            }

            //如果游戏已经开始，则不可以
            if (socket.gameMgr.hasBegan(roomId)) {
                return;
            }

            //如果不是房主，则不能解散房间
            if (roomMgr.isCreator(roomId, userId) == false) {
                return;
            }

            userMgr.broacastInRoom('dispress_push', {}, userId, true);
            userMgr.kickAllInRoom(roomId);
            roomMgr.destroy(roomId);
            socket.disconnect();
        });

        //断开链接
        socket.on('disconnect', function (data) {
            console.log('disconnect: ' + data);

            var userId = socket.userId;
            if (!userId) {
                return;
            }
            var data = {
                userid: userId,
                online: false
            };

            // 给此玩家结算
            var userData = roomMgr.getUserData(userId);
            if(userData){
                var score = parseFloat(userData.score).toFixed(3) * 1000;
                // db.update_seat_infoupdate_seat_info(roomMgr.id,userData.seatIndex,userId,score,userData.name, function () {});
                db.refush_gems(userId, score, function(){});
                // 同步能量值
                var power = Math.round(userData.power * 100);
                db.refush_power(userId, power, function () {});
            }

            //通知房间内其它玩家
            userMgr.broacastInRoom('user_state_push', data, userId);

            //从房间内清除
            userMgr.del(userId);
            socket.userId = null;
            roomMgr.exitRoom(userId);


        });

        socket.on('game_ping', function (data) {
            console.log('game_ping');
            var userId = socket.userId;
            if (!userId) {
                return;
            }

            socket.emit('game_pong');
        });

    });

    console.log("game server is listening on " + config.CLIENT_PORT);
};