var roomMgr = require("./roommgr");
var userMgr = require("../../usermgr");
var db = require("../../../utils/db");
var crypto = require("../../../utils/crypto");
var def = require("./cmd_define");
var bydhUtil = require('./bydhUtil');



var games = {};             // 进程中维护的所有房间

function getFishById(fishId, game) {
    if (game.aliveFish.hasOwnProperty(fishId)) {
        return game.aliveFish[fishId];
    }
    return null;
};

function getBulletById(bulletId, game) {
    if (game.aliveBullet.hasOwnProperty(bulletId)) {
        return game.aliveBullet[bulletId];
    }
    return null;
};

function getGameByUserID(userId){
    var roomId = roomMgr.getUserRoom(userId);
    if(roomId == null){
        return null;
    }
    var game = games[roomId];
    return game;
};

exports.setReady = function (userId, callback) {
    var roomId = roomMgr.getUserRoom(userId);
    if (roomId == null) {
        return;
    }
    var roomInfo = roomMgr.getRoom(roomId);
    if (roomInfo == null) {
        return;
    }

    roomMgr.setReady(userId, true);

    var game = games[roomId];
    if (game == null) {
        // 只要有玩家进入 就直接开始
        exports.begin(roomId);
    }
    else {
        // TODO：游戏场景中的数据
        var data = {
           // 冷冻结束时间倒计时
            frozenEndTime: game.frozenEndTime,
            // 鱼阵倒计时
            formationEndTime: game.formationEndTime,
            // 房间倍率
            roomBaseScore: roomInfo.conf.gamebasescore
        };

        data.seats = [];
        var seatData = null;
        for (var i = 0; i < 4; ++i) {
            var sd = roomInfo.seats[i];

            var seatUserId = sd.userId;
            var online = false;
            if(seatUserId > 0){
                online = userMgr.isOnline(seatUserId)
            }
            // 查一下有多少钱
            var s = {
                userId: seatUserId,
                // 是否在线
                online: online,
                // 座位号
                seatIndex: i,
                // 金币数量
                score: sd.score,
                // vip
                vip: sd.vip,
                // 正在使用哪种炮
                cannonKind: sd.cannonKind,
                // 锁定哪条鱼
                lockFishId: sd.lockFishId,
                // 能量值
                power: sd.power,
            };
            data.seats.push(s);
         }

        //同步整个信息给客户端
        userMgr.sendMsg(userId, 'game_sync_push', data);
        // sendOperations(game, seatData, game.chuPai);
    }
};

exports.startGame = function (roomId) {
    var game = games[roomId];
    if (game == null) {
        // 只要有玩家进入 就直接开始
        exports.begin(roomId);
    }
}

//开始新的一局
exports.begin = function(roomId) {

    var roomInfo = roomMgr.getRoom(roomId);
    if(roomInfo == null){
        return;
    }
    var seats = roomInfo.seats;

    var game = {
        conf:roomInfo.conf,
        roomInfo:roomInfo,
        gameIndex:roomInfo.numOfGames,      // 游戏房间数量

        gameSeats:new Array(4),             // 所有玩家
        game_satus:def.GAME_STATUS.GAME_STATUS_FREE,

        aliveFish: [],          // 房间内存活的鱼
        aliveBullet: [],        // 房间内存货的子弹
        timer_1: {},            // 出鱼定时器
        timer_2: {},            // 鱼阵定时器
        timer_3: {},            // 超时定时器
    };

    // 本房间的算法库
    game.bydhUtil = new bydhUtil.bydhUtil();

    roomInfo.numOfGames++;      // 房间内的游戏数量， 这里只会有一个

    for(var i = 0; i < 4; ++i){
        var data = game.gameSeats[i] = {};
        data.game = game;
        data.seatIndex = i;
        data.userId = seats[i].userId;
    }
    games[roomId] = game;

    // 开始产生鱼
    game.bydhUtil.buildFishTrace();

    // 启动计时器开始出鱼
    start_timer_1(1 * 1000, game);
    // 开始鱼阵
    start_timer_2(5 * 60 * 1000, game);
    // 开始超时检测
    start_timer_3(60 * 1000, game);
};

function start_timer_1(interval, game) {
    // 出鱼
    game.timer_1 = setInterval(function () {
        //
        buildFishTrace(game);
    }, interval);
};
function start_timer_2(interval, game) {
    // 鱼群， TODO：屏幕冷冻不能影响鱼群出现频率
    game.timer_2 = setInterval(function () {

        if (game.game_satus != def.GAME_STATUS.GAME_STATUS_FREE) {
            return;
        }
        clearAliveFish(game);
        game.bydhUtil.stopBuildFish();
        buildFormation(game);

    }, interval);
};

function start_timer_3(interval, game) {
    // 清理超时的鱼群， 一分钟为基准
    game.timer_3 = setInterval(function(){
        // 获取超时的鱼，应该都已经又出屏幕了
        var canDelFish = [];
        for(var key in game.aliveFish){
            if(Date.now() - game.aliveFish[key].activeTime > 60 * 1000){
                canDelFish.push(key);
            }
        }

        // 清理超时的鱼
        for(let i=0; i<canDelFish.length; i++){
            fishDie(canDelFish[i],game);
        }

    }, interval);
};

function clear_timer(timer) {
    clearInterval(timer);
};

exports.clearAllTimer = function (roomId) {
    var game = games[roomId];
    if(!game){
        return;
    }
    clear_timer(game.timer_1);
    clear_timer(game.timer_2);
    clear_timer(game.timer_3);
    game.bydhUtil.stopBuildFish();
};

function set_game_status(status, game) {
    game.game_satus = status;
}
function get_game_status(game) {
    return game.game_satus;
}

// 某个游戏出鱼
function buildFishTrace(game) {
    // 屏幕冷冻 / 正在出鱼群就暂停出鱼
    if (game.game_satus != def.GAME_STATUS.GAME_STATUS_FREE) {
        return;
    }
    // 已经生成的鱼
    var fishInfo = game.bydhUtil.getActiveFish();

    var tempArray = [];
    // 出的鱼要放在aliveSifh
    for(let i=0; i < fishInfo.length; i++){
        var fish = fishInfo[i];
        if(game.aliveFish.hasOwnProperty(fish.fishId)){
            continue;
        }
        tempArray.push(fish);
        game.aliveFish[fish.fishId] = fish;
    }

    // 出的这条鱼通知给前端
    userMgr.broacastInRoom2('build_fish_reply', tempArray, game.roomInfo.id);
};

// 鱼游动出屏幕
fishDie = function(fishes, game) {
    if (!game) {
        return;
    }
    for (let i = 0; i < fishes.length; i++) {
        var fishId = fishes[i];
        if (game.aliveFish.hasOwnProperty(fishId)) {
            delete game.aliveFish[fishId];
        }
    }
};

function clearAliveFish(game) {
    // 清理所有的存活的鱼
    fishDie(Object.keys(game.aliveFish),game);
    // tempMap = null;
};

function buildFormation(game) {
    // 屏幕冷冻 / 正在出鱼群就暂停出鱼
    if (game.game_satus != def.GAME_STATUS.GAME_STATUS_FREE) {
        return;
    }
    game.game_satus = def.GAME_STATUS.GAME_STATUS_FORMATION;

    var fishArrayData = game.bydhUtil.buildFishArray();
    // 保存在alive数组
    for(let i = 0; i < fishArrayData.fishArray.length; i++){
        // 二维数组
        let tempArray = fishArrayData.fishArray[i];
        for(let j = 0; j < tempArray.length; j++) {
            game.aliveFish[tempArray[j].fishId] = tempArray[j];
        }
    }

    game.fromationEndTime = fishArrayData.endTime;

    var cutdown = fishArrayData.endTime - new Date().getTime();

    // 开始服务器倒计时
    setTimeout(()=>{
        if(!game || !game.bydhUtil){
            return;
        }
        game.game_satus = def.GAME_STATUS.GAME_STATUS_FREE;
        game.fromationEndTime = 0;
        game.bydhUtil.buildFishTrace();
    }, cutdown);

    // 出的这条鱼通知给前端
    userMgr.broacastInRoom2('build_fishArray_reply', fishArrayData, game.roomInfo.id);

};


// 用户开火
exports.userFire = function (userId, data) {
    // 哪个玩家朝哪个方向 打了什么样的子弹

    // var userId = data.userId;
    // var chairId = data.chairId;
    var bulletkind = data.bulletKind;
    var bulletId = data.bulletId;
    // var angle = data.angle;
    // var lockfishId = data.lockFishId;

    var userData = roomMgr.getUserData(userId);
    var roomId = roomMgr.getUserRoom(userId)
    var roomInfo = roomMgr.getRoom(roomId);

    if(bulletkind == 22){
        // 发射的是激光炮，不需要减金币 +能量值
        userMgr.broacastInRoom('user_fire_Reply', data, userId, false);
        userData.power = 0;
        return;
    }

    // 一个存活的子弹
    var game = getGameByUserID(userId);
    if(!game){
        return;
    }
    game.aliveBullet[bulletId] = data;

    // 通知其他客户端
    userMgr.broacastInRoom('user_fire_Reply', data, userId, false);

    // 根据倍数 减去金币,记在内存就行

    if (userData && roomInfo) {
        var bulletMulletbydh = game.bydhUtil.getBulletMultiById(bulletkind);

        // 更新分数
        var baseScore = parseFloat(roomInfo.conf.gamebasescore / 1000);
        var total = parseFloat(userData.score) - parseFloat(baseScore * bulletMulletbydh);
        userData.score = parseFloat(total).toFixed(3);
        // 更新能量值
        if(userData.power < 1) {
            var addProgress = bulletMulletbydh / 3000;
            userData.power += addProgress;
            // console.log(bulletMulletbydh + " => " + userData.power);
        }else{
            userData.power = 1;
        }
    }
};

// 击中鱼
exports.catchFish = function (data) {
    var game = getGameByUserID(data.userId);
    if(!game){
        return;
    }
    // 有效的子弹击中有效的鱼
    var fishId = data.fishId;
    var bulletId = data.bulletId;
    if (!game.aliveFish.hasOwnProperty(fishId) || !game.aliveBullet.hasOwnProperty(bulletId)) {
        // 一旦碰撞，子弹必然消失
        if(game.aliveBullet.hasOwnProperty(bulletId)){
            delete game.aliveBullet[bulletId]
        }
        return;
    }

    // 子弹/鱼 有效，进行命中判断
    var fish = game.aliveFish[fishId];
    var bullet = game.aliveBullet[bulletId];

    // 计算命中
    var hit = game.bydhUtil.isHit(fish, bullet);
    if (hit) {
        var userData = roomMgr.getUserData(data.userId);
        var roomInfo = game.roomInfo;

        var killedFishes = [];
        killedFishes.push(fishId);

        if(fish.fishKind == def.FISH_KIND.FISH_KIND_30){
            // 全屏炸弹
            killedFishes = killedFishes.concat(game.bydhUtil.getBombFish(fishId, game));
        }else if(fish.fishKind >= def.FISH_KIND.FISH_KIND_23 && fish.fishKind <= def.FISH_KIND.FISH_KIND_26){
            // 一网打尽
            killedFishes = killedFishes.concat(game.bydhUtil.getAllInOne(fishId, game));
        }
        else if(fish.fishKind >= def.FISH_KIND.FISH_KIND_31 && fish.fishKind <= def.FISH_KIND.FISH_KIND_33) {
            // 同类炸弹
            killedFishes = killedFishes.concat(game.bydhUtil.getSameFish(fishId, game, fish.fishKind));
        }

        // 给玩家加钱
        var addscore = 0;
        for(let i=0; i<killedFishes.length; i++){
            let id = killedFishes[i];
            var tempFish = game.aliveFish[id];
            addscore += game.bydhUtil.getFishMultiById(tempFish.fishKind) * game.bydhUtil.getBulletMultiById(bullet.bulletKind) * roomInfo.conf.gamebasescore / 1000;
        }

        // 最大100倍
        if(addscore >= roomInfo.conf.gamebasescore * 100){
            addscore = roomInfo.conf.gamebasescore * 100;
        }
        addscore = parseFloat(addscore)
        if (userData && roomInfo) {

            var total = parseFloat(userData.score) + addscore;
            userData.score = parseFloat(total).toFixed(3);
        }

        // 有一定概率获得道具
        var itemId = null;
        if(Math.random() < 0.01){
            // 1%概率获得道具
            itemId = 'ice';
            db.set_ice_of_property(data.userId, 1, (data)=>{});
        }

        var fishes = killedFishes.join(',')
        // 通知前端(广播)
        var catchResult = {
            userId : data.userId,
            chairId: data.chairId,
            bulletId: data.bulletId,
            fishId: fishes,
            addScore: addscore,
            item: itemId
        };

        // 通知前端
        userMgr.broacastInRoom2('catch_fish_reply', catchResult, roomMgr.getUserRoom(data.userId));

        //    清除鱼
        fishDie(killedFishes,game);
    } else {
        // 未命中，暂不做处理

    }

    // 清除子弹
    delete game.aliveBullet[bulletId];
};

// 激光击中鱼
exports.laserCatchFish = function (data) {
    // var data = {
    //     userId: userId,
    //     chairId: chairId,
    //     fishes: fishes.join('-')
    // };
    var game = getGameByUserID(data.userId);
    if(!game){
        return;
    }
    var userId = data.userId;
    var killedFishes = data.fishes.split('-');

    var userData = roomMgr.getUserData(data.userId);
    var roomInfo = game.roomInfo;

    // 给玩家加钱
    var addscore = 0;
    for(let i=0; i<killedFishes.length; i++){
        let id = killedFishes[i];
        var tempFish = game.aliveFish[id];
        if(!tempFish){
            continue;
        }
        addscore += game.bydhUtil.getFishMultiById(tempFish.fishKind) * game.bydhUtil.getBulletMultiById(def.BULLET_KIND.BULLET_KIND_laser) * roomInfo.conf.gamebasescore / 1000;
    }
    // 最大100倍
    if(addscore >= roomInfo.conf.gamebasescore * 100){
        addscore = roomInfo.conf.gamebasescore * 100;
    }
    addscore = parseFloat(addscore);

    if (userData && roomInfo) {

        var total = parseFloat(userData.score) + addscore;
        userData.score = parseFloat(total).toFixed(3);
    }

    var fishes = killedFishes.join(',')
    // 通知前端(广播)
    var catchResult = {
        userId : data.userId,
        chairId: data.chairId,
        fishId: fishes,
        addScore: addscore,
        isLaser: true
    };

    // 通知前端
    userMgr.broacastInRoom2('catch_fish_reply', catchResult, roomMgr.getUserRoom(userId));

    //    清除鱼
    fishDie(killedFishes,game);
};

// 锁定鱼
exports.lockFish = function (data) {
    //
    var userId = data.userId;
    // var chairId = data.chairId;
    // var fishId = data.fishId;

    userMgr.broacastInRoom('lock_fish_reply', data, userId, false);
};

// 解锁鱼
exports.unlockFish = function (data) {
    //

};

// 冷冻屏幕(某一个玩家使用冷冻道具)
exports.frozenScene = function (data) {
    var game = getGameByUserID(data.userId);

    if(game.frozenEndTime > 0){
        return;
    }
    if(game.frozenEndTime > 0){
        return;
    }
    // TODO:判断使用道具玩家的道具数量

    // 足够的话就减去道具数量

    // 暂停出鱼
    game.game_satus = def.GAME_STATUS.GAME_STATUS_FROZEN;
    game.bydhUtil.stopBuildFish();

    var totalFrozenTime = 10 * 1000;
    // 像客户端发送冷冻屏幕消息
    var userId = data.userId;
    var endTime = data.startTime + totalFrozenTime;   // 10秒
    var cutdown = endTime - new Date().getTime();
    // 记录到游戏数据
    game.frozenEndTime = endTime;

    var replyData = {
        // 结束的倒计时
        cutDownTime : cutdown,
    };
    userMgr.broacastInRoom('user_frozen_reply', replyData, userId, false);

    // 开始服务器倒计时
    setTimeout(()=>{
        if(!game || !game.bydhUtil){
            return;
        }
        game.game_satus = def.GAME_STATUS.GAME_STATUS_FREE;
        game.frozenEndTime = 0;
        game.bydhUtil.buildFishTrace();
    }, cutdown);
};

// 解冻屏幕（以服务器时间为准）
exports.unFrozenScene = function (data) {
    // 时间到了就重新开始出鱼

    // 向客户端发送解冻消息

};

exports.changeCannon = function (data) {
    // var game = getGameByUserID(data.userId);

    var userId = data.userId;
    var chairId = data.chairId;
    var kind = data.cannonKind;
    // TODO:更新该userId的状态

    // 更新seats数据
    var userData = roomMgr.getUserData(userId);
    if(userData){
        // 激光炮要判断power
        if(kind == def.BULLET_KIND.BULLET_KIND_laser){
            if(userData.power < 1){
                return;
            }
        }
        userData.cannonKind = kind;
    }

    // 通知其他客户端
    var replyData = {
        userId: userId,
        chairId: chairId,
        cannonKind: kind,
    };
    userMgr.broacastInRoom('user_change_cannon_reply', replyData, userId, false);

};
//

exports.destroyGameById = function(roomId){
    var roomInfo = roomMgr.getRoom(roomId);
    if(!roomInfo){
        return;
    }
    roomInfo.numOfGames--;
    if(!games[roomId]){
        return;
    }
    exports.clearAllTimer(roomId);
    games[roomId].bydhUtil.stopBuildFish();
    delete games[roomId].bydhUtil;
    delete games[roomId];
};





