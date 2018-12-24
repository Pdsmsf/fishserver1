var roomMgr = {};
//用户与服务端socket的映射
var userList = {};
var userOnline = 0;

// 确定游戏的userMgr
exports.initWithRoomMgr = function (path) {
    roomMgr = require('./game_modules/' + path + '/roommgr');
}

//把服务端的socket 与userid 一一绑定起来
exports.bind = function(userId,socket){
    userList[userId] = socket;
    userOnline++;
};
//
exports.del = function(userId,socket){
    if(userList.hasOwnProperty(userId)){
        delete userList[userId];
        userOnline--;
    }
};

//解除用户和socket的绑定
exports.delSocketByUserID = function(userId,socket){
    delete userList[userId];
    userOnline--;
};
//获取服务端与用户绑定的socket
exports.get = function(userId){
    return userList[userId];
};

//获取服务端与用户绑定的socket  wmh add
exports.getSocketByUserID = function(userId){
    return userList[userId];
};
//玩家是否在线
exports.isOnline = function(userId){
    var data = userList[userId];
    if(data != null){
        return true;
    }
    return false;
};
//获取在线人数
exports.getOnlineCount = function(){
    return userOnline;
}

//剔除房间的所有人
exports.kickAllInRoom = function(roomId){
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }

    for(var i = 0; i < roomInfo.seats.length; ++i){
        var rs = roomInfo.seats[i];

        //如果不需要发给发送方，则跳过
        if(rs.userId > 0){
            var socket = userList[rs.userId];
            if(socket != null){
                exports.del(rs.userId);
                socket.disconnect();
            }
        }
    }
};

//给玩家发送事件消息
exports.sendMsg = function(userId,event,msgdata){
    console.log(event + msgdata);
    var userInfo = userList[userId];
    if(userInfo == null){
        return;
    }
    var socket = userInfo;
    if(socket == null){
        return;
    }

    socket.emit(event,msgdata);
};

//在房间广播消息
exports.broacastInRoom = function(event,data,sender,includingSender){
    var roomId = roomMgr.getUserRoom(sender);
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }

    for(var i = 0; i < roomInfo.seats.length; ++i){
        var rs = roomInfo.seats[i];

        //如果不需要发给发送方，则跳过
        if(rs.userId == sender && includingSender != true){
            continue;
        }
        var socket = userList[rs.userId];
        if(socket != null){
            socket.emit(event,data);
        }
    }
};

// 广播2
exports.broacastInRoom2 = function(event,data,roomId){
    if(roomId == null){
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }

    for(var i = 0; i < roomInfo.seats.length; ++i){
        var rs = roomInfo.seats[i];

        var socket = userList[rs.userId];
        if(socket != null){
            socket.emit(event,data);
        }
    }
};