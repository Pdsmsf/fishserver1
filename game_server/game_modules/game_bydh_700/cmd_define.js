/**
 * Created by apple on 2017/8/14.
 */

var fs = require('fs');

/*
 // 座位号
 -------------
 0   1   2
 7               3
 6   5   4
 -------------
 */
exports.swithSceneTimer = 60 * 5;    // 5分钟切一次场景


//游戏状态
exports.GAME_STATUS = {
    GAME_STATUS_FREE: 0,									// 空闲状态
    GAME_STATUS_PLAY: 100,									// 游戏状态
    GAME_STATUS_FORMATION: 200,							    // 鱼群状态
    GAME_STATUS_FROZEN: 300                                 // 冷冻状态
};

//鱼阵场景
exports.SCENE_KIND = {
    SCENE_KIND_1: 0,
    SCENE_KIND_2: 1,
    SCENE_KIND_3: 2,
    SCENE_KIND_4: 3,
    SCENE_KIND_5: 4,
    SCENE_KIND_6: 5,
    SCENE_KIND_7: 6,
    SCENE_KIND_8: 7
}
//鱼的种类
exports.FISH_KIND = {
    FISH_KIND_1: 1,
    FISH_KIND_2: 2,
    FISH_KIND_3: 3,
    FISH_KIND_4: 4,
    FISH_KIND_5: 5,
    FISH_KIND_6: 6,
    FISH_KIND_7: 7,
    FISH_KIND_8: 8,
    FISH_KIND_9: 9,
    FISH_KIND_10: 10,
    FISH_KIND_11: 11,
    FISH_KIND_12: 12,
    FISH_KIND_13: 13,
    FISH_KIND_14: 14,
    FISH_KIND_15: 15,
    FISH_KIND_16: 16,
    FISH_KIND_17: 17,
    FISH_KIND_18: 18,
    FISH_KIND_19: 19,
    FISH_KIND_20: 20,
    FISH_KIND_21: 21,
    FISH_KIND_22: 22,
    FISH_KIND_23: 23,// 一网打尽
    FISH_KIND_24: 24,// 一网打尽
    FISH_KIND_25: 25,// 一网打尽
    FISH_KIND_26: 26,// 一网打尽
    FISH_KIND_27: 27,
    FISH_KIND_28: 28,
    FISH_KIND_29: 29,
    FISH_KIND_30: 30, // 全屏炸弹
    FISH_KIND_31: 31, // 同类炸弹
    FISH_KIND_32: 32, // 同类炸弹
    FISH_KIND_33: 33, // 同类炸弹
    FISH_KIND_34: 34,
    FISH_KIND_35: 35,
};

// 鱼的倍数
exports.FishMulti = {
    1: 2,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 5,
    7: 6,
    8: 7,
    9: 8,
    10: 9,
    11: 10,
    12: 11,
    13: 12,
    14: 18,
    15: 25,
    16: 30,
    17: 35,
    18: 40,
    19: 45,
    20: 50,
    21: 80,
    22: 100,
    23: 45,//45-150, // 一网打尽
    24: 45,//45-150, // 一网打尽
    25: 45,//45-150, // 一网打尽
    26: 45,//45-150, // 一网打尽
    27: 50,
    28: 60,
    29: 70,
    30: 100,   // 全屏炸弹
    31: 110,   // 同类炸弹
    32: 110,   // 同类炸弹
    33: 110,   // 同类炸弹
    34: 120,
    35: 200
};

// exports.FishMulti = {
//     FISH_KIND_1:2,
//     FISH_KIND_2:2,
//     FISH_KIND_3:3,
//     FISH_KIND_4:4,
//     FISH_KIND_5:5,
//     FISH_KIND_6:5,
//     FISH_KIND_7:6,
//     FISH_KIND_8:7,
//     FISH_KIND_9:7,
//     FISH_KIND_10:9,
//     FISH_KIND_11:10,
//     FISH_KIND_12:14,
//     FISH_KIND_13:12,
//     FISH_KIND_14:13,
//     FISH_KIND_15:25,
//     FISH_KIND_16:30,
//     FISH_KIND_17:35,
//     FISH_KIND_18:40,
//     FISH_KIND_19:45,
//     FISH_KIND_20:50,
//     FISH_KIND_21:80,
//     FISH_KIND_22:100,
//     FISH_KIND_23:45,//45-150, // 一网打尽
//     FISH_KIND_24:45,//45-150, // 一网打尽
//     FISH_KIND_25:45,//45-150, // 一网打尽
//     FISH_KIND_26:45,//45-150, // 一网打尽
//     FISH_KIND_27:50,
//     FISH_KIND_28:60,
//     FISH_KIND_29:70,
//     FISH_KIND_30:110,   // 同类炸弹
//     FISH_KIND_31:110,   // 全屏炸弹
//     FISH_KIND_32:110,   // 同类炸弹
//     FISH_KIND_33:110,   // 同类炸弹
//     FISH_KIND_34:120,
//     FISH_KIND_35:200
// };
//炮弹种类
exports.BULLET_KIND = {
    BULLET_KIND_NORMAL_1 : 0,
    BULLET_KIND_NORMAL_2 : 1,
    BULLET_KIND_NORMAL_3 : 2,
    BULLET_KIND_vip1_1 : 3,
    BULLET_KIND_vip1_2 : 4,
    BULLET_KIND_vip1_3 : 5,
    BULLET_KIND_vip2_1 : 6,
    BULLET_KIND_vip2_2 : 7,
    BULLET_KIND_vip2_3 : 8,
    BULLET_KIND_vip3_1 : 9,
    BULLET_KIND_vip3_2 : 10,
    BULLET_KIND_vip3_3 : 11,
    BULLET_KIND_vip4_1 : 12,
    BULLET_KIND_vip4_2 : 13,
    BULLET_KIND_vip4_3 : 14,
    BULLET_KIND_vip5_1 : 15,
    BULLET_KIND_vip5_2 : 16,
    BULLET_KIND_vip5_3 : 17,
    BULLET_KIND_vip6_1 : 19,
    BULLET_KIND_vip6_2 : 20,
    BULLET_KIND_vip6_3 : 21,
    BULLET_KIND_laser : 22,
};

exports.BULLET_MULTI = {
    1: 1,
    2: 2,
    3: 3,
    4: 1,
    5: 3,
    6: 5,
    7: 1,
    8: 3,
    9: 5,
    10: 1,
    11: 3,
    12: 5,
    13: 1,
    14: 3,
    15: 5,
    16: 1,
    17: 3,
    18: 5,
    19: 1,
    20: 3,
    21: 5,
    22: 1       // 激光炮
};


exports.SUB_S_GAME_CONFIG = 'SUB_S_GAME_CONFIG';
exports.SUB_S_FISH_TRACE = 'SUB_S_FISH_TRACE';
exports.SUB_S_EXCHANGE_FISHSCORE = 'SUB_S_FISH_TRACE';
exports.SUB_S_USER_FIRE = 'SUB_S_FISH_TRACE';
exports.SUB_S_CATCH_FISH = 'SUB_S_FISH_TRACE';
exports.SUB_S_BULLET_ION_TIMEOUT = 'SUB_S_BULLET_ION_TIMEOUT';
exports.SUB_S_LOCK_TIMEOUT = 'SUB_S_LOCK_TIMEOUT';
exports.SUB_S_CATCH_SWEEP_FISH = 'SUB_S_CATCH_SWEEP_FISH';
exports.SUB_S_CATCH_SWEEP_FISH_RESULT = 'SUB_S_CATCH_SWEEP_FISH_RESULT';
exports.SUB_S_HIT_FISH_LK = 'SUB_S_HIT_FISH_LK';
exports.SUB_S_SWITCH_SCENE = 'SUB_S_SWITCH_SCENE';
exports.SUB_S_STOCK_OPERATE_RESULT = 111;
exports.SUB_S_SCENE_END = 112;
exports.SUB_S_CATCH_FISHRESULT = 113;
exports.SUB_S_SETTLE_FISHSCORE = 114;
exports.SUB_S_SWIM_SCENE = 115;
exports.SUB_S_SPECIAL_PRICE1 = 116;
exports.SUB_S_ADD_PRICE1_SCORE = 117;
exports.SUB_S_END_SPECIAL1 = 118;
exports.SUB_S_SPECIAL_PRICE2 = 119;
exports.SUB_S_UPDATE_POS = 120;
exports.SUB_S_END_SPECIAL2 = 121;
exports.SUB_S_SPECIAL_PRICE3 = 122;
exports.SUB_S_END_SPECIAL3 = 123;
exports.SUB_S_LOCK_FISH = 124;
exports.SUB_S_BLACK_LIST = 125;
exports.SUB_S_WHITE_LIST = 126;
exports.SUB_S_BIGFISH_LIST = 127;
exports.SUB_S_LINE_TRACE = 128;
exports.SUB_S_SHOAL_TRACE = 129;

var pathMap = {};
var loadTraceFile = function(file) {
    file = './game_server/game_modules/game_bydh_700/data/' + file;
    fs.readFile(file,{flag:'r+',encoding:'utf8'}, function (err, data) {
        if(err){

        }else{
           var list = JSON.parse(data.toString());

            for (let key in list) {
                var paths = [];
                var _paths = list[key];              // 线路数组
                for(let i=0; i<_paths.length; i++){
                    // 一条线
                    var path = [];
                    var _path = _paths[i];
                    for (let j = 0; j < _path.length; j++) {
                        // 一个点
                        var poss = _path[j];
                        var point = [poss[0], poss[1]];

                        path.push(point);
                    }
                    paths.push(path);
                }
                pathMap[key] = paths;
            }
        }
    });
};

var getPathMap = function (id) {
    return pathMap[id];
};

module.exports.loadTraceFile = loadTraceFile;
module.exports.getPathMap = getPathMap;

