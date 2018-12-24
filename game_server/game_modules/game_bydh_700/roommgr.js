var db = require('../../../utils/db');
//这里的房间 实际上是桌子概念
var rooms = {};
var creatingRooms = {};
//
var userLocation = {};
var totalRooms = 0;

//生成房间号码
function generateRoomId(){
    var roomId = "";
    for(var i = 0; i < 6; ++i){
        roomId += Math.floor(Math.random()*10);
    }
    return roomId;
}
//通过数据库构建房间
function constructRoomFromDb(dbdata){
    var roomInfo = {
        uuid:dbdata.uuid,
        id:dbdata.id,
        createTime:dbdata.create_time,
        nextButton:dbdata.next_button,
        seats:new Array(4),
        conf:JSON.parse(dbdata.base_info),
        frozenEndTime: 0,
        fromationEndTime: 0,
    };


    if(roomInfo.conf.type == "bydh"){
        roomInfo.gameMgr = require("./gamemgr_bydh");
    }
    else
    {
        console.log(roomInfo.conf.type + ' not defined');
    }
    var roomId = roomInfo.id;

    for(var i = 0; i < 4; ++i){



        // 从数据库获取金币数量
        db.get_userinfo_by_userId(dbdata["user_id" + i], function (info) {

            //根据vip确定炮
            var vipa = info.vip;
            var cannonKindVip = {
                    '0': 1,
                    '1': 4,
                    '2': 7,
                    '3': 10,
                    '4': 13,
                    '5': 16,
                    '6': 19,
                }[vipa] || 1;

            var s = roomInfo.seats[i] = {};
            s.userId = dbdata["user_id" + i];
            s.score = info.gems;
            s.name = dbdata["user_name" + i];
            s.ready = false;
            s.seatIndex = i;
            s.vip = info.vip;
            s.cannonKind = cannonKindVip;       // 使用哪种炮
            s.power = parseFloat(info.power) / 100;
            console.log("======roommgr="+s.vip+"==="+gem.vip+"==");

            if(s.userId > 0){
                userLocation[s.userId] = {
                    roomId:roomId,
                    seatIndex:i
                };
            }
        });
        // get_vip_by_userId(dbdata["user_id" + i], function (gem) {
        //
        //
        // });
    }
    rooms[roomId] = roomInfo;
    totalRooms++;
    return roomInfo;
}

exports.createRoom = function(creator,roomConf,ip,port,callback){

    //参数校验
    if( roomConf.type == null ||
        roomConf.gamebasescore == null ||
        roomConf.minhavescore == null ||
        roomConf.maxhavescore == null ||
        roomConf.taxratio == null
    ){
        callback(1,null);
        return;
    }

    var fnCreate = function(){
        var roomId = generateRoomId();
        if(rooms[roomId] != null || creatingRooms[roomId] != null)
        {
            // 重复创建的房间
            fnCreate();
        }
        else{
            creatingRooms[roomId] = true;
            db.is_room_exist(roomId, function(ret) {

                if(ret){	// 有重名的房间号/重新创建
                    delete creatingRooms[roomId];
                    fnCreate();
                }
                else{		// 创建房间
                    var createTime = Math.ceil(Date.now()/1000);
                    var roomInfo = {
                        uuid:"",
                        id:roomId,
                        // numOfGames:0,
                        createTime:createTime,
                        frozenEndTime: 0,
                        fromationEndTime: 0,
                        nextButton:0,
                        seats:[],
                        conf:{
                            type:roomConf.type,
                            // gamebasescore: roomConf.gamebasescore,
                            gamebasescore: roomConf.baseScore,
                            minhavescore: roomConf.minhavescore,
                            maxhavescore: roomConf.maxhavescore,
                            taxratio: roomConf.taxratio,
                            creator:creator,
                        }
                    };

                    roomInfo.gameMgr = require("./gamemgr_bydh");
                    console.log(roomInfo.conf);

                    for(var i = 0; i < 4; ++i){
                        roomInfo.seats.push({
                            userId:0,
                            score:0,
                            name:"",
                            ready:false,
                            seatIndex:i,
                            vip: 1,              // TODO： vip/能量值/炮型 需要写数据库
                            cannonKind: 1,       // 使用哪种炮
                            power: 0             // 能量值
                        });
                    }


                    //写入数据库
                    var conf = roomInfo.conf;
                    db.create_room(roomInfo.id,roomInfo.conf,ip,port,createTime,function(uuid){
                        delete creatingRooms[roomId];
                        if(uuid != null){
                            roomInfo.uuid = uuid;
                            console.log(uuid);
                            rooms[roomId] = roomInfo;           // 内存里也搞一份
                            totalRooms++;
                            callback(0,roomId);
                        }
                        else{
                            callback(3,null);
                        }
                    });
                }
            });
        }
    };

    fnCreate();
};

//创建公共桌子
exports.createPublicRoom = function(creator,roomConf,ip,port,callback){

    //参数校验
    if(!roomConf.gamebasescore ||
        !roomConf.minhavescore ||
        !roomConf.maxhavescore ||
        !roomConf.taxratio)
    {
        callback(1,null);
        return;
    }

    var fnCreate = function(){
        var roomId = generateRoomId();
        if(rooms[roomId] != null || creatingRooms[roomId] != null){
            fnCreate();
        }
        else{
            creatingRooms[roomId] = true;
            db.is_room_exist(roomId, function(ret) {

                if(ret){
                    delete creatingRooms[roomId];
                    fnCreate();
                }
                else{
                    var createTime = Math.ceil(Date.now()/1000);
                    var roomInfo = {
                        uuid:"",
                        id:roomId,
                        numOfGames:0,
                        createTime:createTime,
                        nextButton:0,				// 这是啥？？？？
                        frozenEndTime: 0,
                        fromationEndTime: 0,
                        seats:[],
                        conf:{
                            type: 'bydh',
                            // gamebasescore: roomConf.gamebasescore,
                            gamebasescore: roomConf.baseScore,
                            minhavescore: roomConf.minhavescore,
                            maxhavescore: roomConf.maxhavescore,
                            creator: creator,
                        }
                    };

                    if(roomConf.type == "bydh"){
                        roomInfo.gameMgr = require("./gamemgr_bydh");
                    }
                    else{
                        console.log(roomInfo.conf);
                    }

                    for(var i = 0; i < 4; ++i){
                        roomInfo.seats.push({
                            userId:0,
                            score:0,
                            name:"",
                            ready:false,
                            seatIndex:i,
                            vip: 1,              // TODO： vip/能量值/炮型 需要写数据库
                            cannonKind: 1,       // 使用哪种炮
                            power: 0             // 能量值
                        });
                    }


                    //写入数据库
                    var conf = roomInfo.conf;
                    db.create_room(roomInfo.id,roomInfo.conf,ip,port,createTime,function(uuid){
                        delete creatingRooms[roomId];
                        if(uuid != null){
                            roomInfo.uuid = uuid;
                            console.log(uuid);
                            rooms[roomId] = roomInfo;
                            totalRooms++;
                            callback(0,roomId);
                        }
                        else{
                            callback(3,null);
                        }
                    });
                }
            });
        }
    };

    fnCreate();
};

exports.destroy = function(roomId){
    var roomInfo = rooms[roomId];
    if(!roomInfo){
        db.delete_room(roomId);
    }else{
        for(var i = 0; i < 4; ++i){
            var userId = roomInfo.seats[i].userId;
            if(userId > 0){
                delete userLocation[userId];
                db.set_room_id_of_user(userId,null);
            }
        }
        roomInfo.gameMgr.destroyGameById(roomId);

        delete rooms[roomId];
        totalRooms--;
        db.delete_room(roomId);
    }
};

//获取总房间数目，总桌子数目
exports.getTotalRooms = function(){
    return totalRooms;
};

exports.getRoom = function(roomId){
    return rooms[roomId];
};

exports.isCreator = function(roomId,userId){
    var roomInfo = rooms[roomId];
    if(roomInfo == null){
        return false;
    }
    return roomInfo.conf.creator == userId;
};
//进入房间
exports.enterRoom = function(roomId,userId,userName,callback){
    var fnTakeSeat = function(room){
        if(exports.getUserRoom(userId) == roomId){
            //已存在
            return 0;
        }

        for(var i = 0; i < 4; ++i){
            var seat = room.seats[i];
            // 找个空位坐下,记录到room.seats
            if(seat.userId <= 0){

                seat.userId = userId;
                seat.name = userName;
                db.get_userinfo_by_userId(seat.userId, function (info) {
                    seat.score = parseFloat(info.gems / 1000).toFixed(3);
                    seat.vip = info.vip;
                    var cannonKindVip = {
                            '0': 1,
                            '1': 4,
                            '2': 7,
                            '3': 10,
                            '4': 13,
                            '5': 16,
                            '6': 19,
                        }[seat.vip ] || 1;
                    seat.cannonKind = cannonKindVip;
                    seat.power = parseFloat(info.power) / 100;
                    // seat.ready = true;
                    // seat.seatIndex = i;

                    // 将gems保存为房间的coin
                    db.update_seat_info(roomId,i,seat.userId,seat.score,seat.name);
                });
                userLocation[userId] = {
                    roomId:roomId,
                    seatIndex:i
                };
                //正常
                return 0;
            }
        }
        //房间已满
        return 1;
    }
    var room = rooms[roomId];
    if(room){
        var ret = fnTakeSeat(room);
        callback(ret);
    }
    else{
        db.get_room_data(roomId,function(dbdata){
            if(dbdata == null){
                //找不到房间
                callback(2);
            }
            else{
                // 数据库里有房间 就删除房间
                exports.destroy(roomId);
                db.set_room_id_of_user(userId,null);
                // 新创建一个
                // http.get(config.HALL_IP,config.HALL_CLIENT_PORT,"/enter_public_room",{},function(ret,data){
                //
                // });
            }
        });
    }
};
//设置准备状态
exports.setReady = function(userId,value){
    var roomId = exports.getUserRoom(userId);
    if(roomId == null){
        return;
    }

    var room = exports.getRoom(roomId);
    if(room == null){
        return;
    }

    var seatIndex = exports.getUserSeat(userId);
    if(seatIndex == null){
        return;
    }

    var s = room.seats[seatIndex];
    s.ready = value;
};

exports.isReady = function(userId){
    var roomId = exports.getUserRoom(userId);
    if(roomId == null){
        return;
    }

    var room = exports.getRoom(roomId);
    if(room == null){
        return;
    }

    var seatIndex = exports.getUserSeat(userId);
    if(seatIndex == null){
        return;
    }

    var s = room.seats[seatIndex];
    return s.ready;
}


exports.getUserRoom = function(userId){
    var location = userLocation[userId];
    if(location != null){
        return location.roomId;
    }
    return null;
};

exports.getUserSeat = function(userId){
    var location = userLocation[userId];
    //console.log(userLocation[userId]);
    if(location != null){
        return location.seatIndex;
    }
    return null;
};

exports.getUserData = function(userId){

    exports.getUserRoom(userId);
    var location = userLocation[userId];
    if(location == null){
        return null;
    }
    var seatId = location.seatIndex;
    var roomId = location.roomId;
    if(!rooms.hasOwnProperty(roomId)){
        return null;
    }
    var roomInfo = rooms[roomId];
    return roomInfo.seats[seatId];
};

exports.getUserLocations = function(){
    return userLocation;
};

exports.exitRoom = function(userId){
    var location = userLocation[userId];
    if(location == null)
        return;

    var roomId = location.roomId;
    var seatIndex = location.seatIndex;
    var room = rooms[roomId];

    if(room == null || seatIndex == null) {
        return;
    }

    var seat = room.seats[seatIndex];
    // 结算
    if(seat){
        var score = parseFloat(seat.score).toFixed(3);
        // db.update_seat_infoupdate_seat_info(roomMgr.id,userData.seatIndex,userId,score,userData.name, function () {});
        score = (score * 1000);
        db.refush_gems(userId, score, function(){});
        // 同步能量值
        var power = Math.round(seat.power * 100);
        db.refush_power(userId, power, function () {});
    }
    seat.userId = 0;
    seat.name = "";

    delete userLocation[userId];

    var numOfPlayers = 0;
    for(var i = 0; i < room.seats.length; ++i){
        if(room.seats[i].userId > 0){
            numOfPlayers++;
        }
    }

    db.set_room_id_of_user(userId,null);

    if(numOfPlayers == 0){
        // if(room.gameMgr) {
        //     room.gameMgr.clearAllTimer(roomId);
        // }
        exports.destroy(roomId);
    }
};