/**
 * Created by Administrator on 2017/9/7.
 */

var def = require("./cmd_define");


function bydhUtil() {

    this.canActiveFish = [];     // 可以是生成的鱼
    this.activeFish = [];        // 实际生成的鱼

    this.fishTime1 = null;
    this.fishTime2 = null;
    this.fishTime3 = null;
    this.fishTime4 = null;
    this.fishTime5 = null;
    this.fishTime6 = null;
};


// 出鱼的算法，启动定时器
bydhUtil.prototype.buildFishTrace = function () {
    var self = this;
    // 测试阶段先每次调用
    // 直线:        200 - 253
    // 二阶曲线:    1 - 47
    // 三阶曲线:    101 - 120
    var buildTrace = function () {
        // 线路随机生成
        var traceId = 101;
        var tarceRandom = Math.floor(Math.random() * 1000) + 1;
        var traceKind = Math.floor(tarceRandom / 300) + 1;
        console.log('traceKind: ' + traceKind)
        traceKind = 3;
        switch (traceKind) {
            case 1: // 直线 201-217
                traceId = Math.floor(tarceRandom % 17) + 201;
                break;
            case 2: // 二阶曲线 1-10
                traceId = Math.floor(tarceRandom % 10) + 1;
                break;
            case 3: // 三阶曲线 101 -110
                traceId = Math.floor(tarceRandom % 10) + 101;
                break;
        }
        return traceId;
    };


    var addFish = function (fishkind, trace, fishId) {
        // 鱼的游动速度 1-6
        var speed = 6;
        if (fishId >= 35) {
            speed = 3;
        } else if (fishId >= 30) {
            speed = 4;
        } else if (fishId >= 20) {
            speed = 5;
        }
        var data = {};
        data.fishKind = fishkind;
        data.trace = trace;     // 线路的点,由服务端告诉客户端
        data.speed = speed;
        data.fishId = fishId;
        data.activeTime = Date.now();

        self.canActiveFish.push(data);
    };

    // 随机生成鱼
    // 1-14
    if (!this.fishTime1) {
        this.fishTime1 = setInterval(function () {

            var random1 = Math.floor(Math.random() * 1000) + 1;
            var traceKind = buildTrace();
            var fishKind = Math.floor(random1 % 15) + 1;

            var traces = def.getPathMap(traceKind);
            for(let i=0; i<traces.length; i++){
                var fishId = '1' + i + (new Date().getTime()) % 600000;
                addFish(fishKind, traces[i], fishId);
            }

        }, 2 * 1000);
    }

    // 15-20
    if (!this.fishTime2) {
        this.fishTime2 = setInterval(function () {
            //
            var random1 = Math.floor(Math.random() * 1000) + 1;
            var fishKind = Math.floor(random1 % 10) + 11;
            var fishId = '2' + (new Date().getTime()) % 600000;
            var traceKind = buildTrace();
            var traces = def.getPathMap(traceKind);
            addFish(fishKind, traces[0], fishId);
        }, 10 * 1000 + 100);
    }

    // 21-34
    if (!this.fishTime3) {
        this.fishTime3 = setInterval(function () {
            //
            var random1 = Math.floor(Math.random() * 1000) + 1;
            var fishKind = Math.floor(random1 % 14) + 21;
            var fishId = '3' + (new Date().getTime()) % 600000;
            var traceKind = buildTrace();
            var traces = def.getPathMap(traceKind);
            addFish(fishKind, traces[1], fishId);
        }, 30* 1000 + 200);
    }

    // 35 渔王
    if (!this.fishTime4) {
        this.fishTime4 = setInterval(function () {
            //
            var fishKind = 35;
            var traceKind = Math.floor(Math.random() * 100) % 10 + 101;// buildTrace();
            var fishId = '5' + (new Date().getTime()) % 600000;
            var traces = def.getPathMap(traceKind);
            addFish(fishKind, traces[1], fishId);
        }, 3 * 60 * 1000);
    }
};

// 停止所有定时器
bydhUtil.prototype.stopBuildFish = function () {
    if (this.fishTime1) {
        clearInterval(this.fishTime1);
        this.fishTime1 = null;
    }
    if (this.fishTime2) {
        clearInterval(this.fishTime2);
        this.fishTime2 = null;
    }
    if (this.fishTime3) {
        clearInterval(this.fishTime3);
        this.fishTime3 = null;
    }
    if (this.fishTime4) {
        clearInterval(this.fishTime4);
        this.fishTime4 = null;
    }
    if (this.fishTime5) {
        clearInterval(this.fishTime5);
        this.fishTime5 = null;
    }
    if (this.fishTime6) {
        clearInterval(this.fishTime6);
        this.fishTime6 = null;
    }
};

// 激活这些鱼
bydhUtil.prototype.getActiveFish = function () {
    // TODO:不一定要全部激活
    this.activeFish.splice(0, this.activeFish.length);

    this.activeFish = this.canActiveFish.slice(0);

    this.canActiveFish.splice(0, this.canActiveFish.length);

    return this.activeFish;
};

// 启动鱼阵
bydhUtil.prototype.buildFishArray = function () {

    var fishArray = [];     // 鱼群以数组的形式存储
    var duration = 0;
    // 鱼阵1
    var buildFormation1 = function () {
        duration = 60 * 1000;
        // 直线的多个数组
        fishArray[0] = [];
        fishArray[1] = [];

        var kind = 14;
        // 10/ 11/ 13 每样10个
        for (let i = 1; i <= 30; i++) {
            var id_1 = '1_1_' + i;
            var id_2 = '1_2_' + i;

            kind = Math.floor((i - 1) / 3) + 10;

            var data = {
                fishKind: kind,
                traceKind: 0,
                fishId: id_1,
                speed: 0
            };
            fishArray[0].push(data);
            var data1 = {
                fishKind: kind,
                traceKind: 0,
                fishId: id_2,
                speed: 0
            };
            fishArray[1].push(data1);
        }

    };
    // 鱼阵2
    var buildFormation2 = function () {
        duration = 60 * 1000;
        // 多个环形数组
        var fishNum = 20;
        var kind = 1;
        for (let i = 0; i < 10; i++) {
            kind = kind + 2;
            fishArray[i] = [];
            // if(i>20) fishNum = 10;
            for (let j = 0; j < fishNum; j++) {
                var fishId = '2_' + (i + 1) + '_' + (j + 1);
                var data = {
                    fishKind: kind,
                    traceKind: 0,
                    fishId: fishId,
                    speed: 0
                };
                fishArray[i].push(data);
            }
        }
    };
    // 鱼阵3
    var buildFormation3 = function () {
        duration = 60 * 1000;
        // 两个螺旋形数组
        fishArray[0] = [];
        fishArray[1] = [];

        var kind = 1;
        // 5 / 10 / 15 每样10个
        for (let i = 1; i <= 30; i++) {
            var id_1 = '3_1_' + i;
            var id_2 = '3_2_' + i;

            kind = (Math.floor((i - 1) / 10) + 1) * 5;

            var data = {
                fishKind: kind,
                traceKind: 0,
                fishId: id_1,
                speed: 0
            };
            fishArray[0].push(data);
            var data1 = {
                fishKind: kind,
                traceKind: 0,
                fishId: id_2,
                speed: 0
            };
            fishArray[1].push(data1);
        }
    };

    // 哪种鱼阵
    var formationKind = Math.floor(Math.random() * 3 + 1);
    switch (formationKind) {
        case 1:
            buildFormation1();
            break;
        case 2:
            buildFormation2();
            break;
        case 3:
            buildFormation3();
            break;
    }
    ;

    var startTime = new Date().getTime();
    var endTime = startTime + duration;
    var data = {
        formationKind: formationKind,   // 鱼阵类型
        fishArray: fishArray,           // 鱼群数组
        endTime: endTime,               // 鱼阵结束时间
    };
    return data;
};

// 是否命中
bydhUtil.prototype.isHit = function (fish, bullet) {
    // 暂时按照鱼的分数计算

    var baseValue = Math.random();
    var value = 1 / this.getFishMultiById(fish.fishKind);
    return baseValue <= value;

    // return true;
};

// 炸弹，获取20个kind15以下的鱼
bydhUtil.prototype.getBombFish = function(fishId, game){
    var killFishes = [];

    let i = 1;
    for(let key in game.aliveFish) {
        var tempFish = game.aliveFish[key];
        if (tempFish.fishKind < def.FISH_KIND.FISH_KIND_11) {
            killFishes.push(tempFish.fishId);

        }
        if(++i > 20){
            break;
        }
    }

    return killFishes;
};

// 一网打尽， 23 - 26
bydhUtil.prototype.getAllInOne = function (fishId, game) {
    var killFishes = [];
    for(let key in game.aliveFish) {
        var tempFish = game.aliveFish[key];
        if (tempFish.fishKind >= def.FISH_KIND.FISH_KIND_23 && tempFish.fishKind <= def.FISH_KIND.FISH_KIND_26) {
            if (tempFish.fishId == fishId) {
                continue;
            }
            killFishes.push(tempFish.fishId);

        }
    }
    return killFishes;
};

// 同类炸弹， 31-33
bydhUtil.prototype.getSameFish = function (fishId, game, fishKind) {
    var killFishes = [];
    if(!game.aliveFish.hasOwnProperty(fishId)){
        return killFishes;
    }
    var kind = parseInt(fishKind);

    switch(kind){
        case def.FISH_KIND.FISH_KIND_31:
        {
            for (let key in game.aliveFish) {
                var tempFish = game.aliveFish[key];
                if (tempFish.fishId == fishId) {
                    continue;
                }
                if (tempFish.fishKind == def.FISH_KIND.FISH_KIND_31 || tempFish.fishKind == def.FISH_KIND.FISH_KIND_12) {
                    killFishes.push(tempFish.fishId);
                }
            }
        }break;
        case def.FISH_KIND.FISH_KIND_32:
        {
            for (let key in game.aliveFish) {
                var tempFish = game.aliveFish[key];
                if (tempFish.fishId == fishId) {
                    continue;
                }
                if (tempFish.fishKind == def.FISH_KIND.FISH_KIND_32 || tempFish.fishKind == def.FISH_KIND.FISH_KIND_1) {
                    killFishes.push(tempFish.fishId);
                }
            }
        }break;
        case def.FISH_KIND.FISH_KIND_33:
        {
            for (let key in game.aliveFish) {
                var tempFish = game.aliveFish[key];
                if (tempFish.fishId == fishId) {
                    continue;
                }
                if (tempFish.fishKind == def.FISH_KIND.FISH_KIND_33 || tempFish.fishKind == def.FISH_KIND.FISH_KIND_7) {
                    killFishes.push(tempFish.fishId);
                }
            }
        }break;
        default:
            break;
    }

    return killFishes;
};


// 根据id取得鱼的倍数
bydhUtil.prototype.getFishMultiById = function (id) {

    if (def.FishMulti.hasOwnProperty(id)) {
        return def.FishMulti[id];
    } else {
        return 2;
    }

};

// 根据id取得子弹的倍数
bydhUtil.prototype.getBulletMultiById = function (bulletKind) {

    if (def.BULLET_MULTI.hasOwnProperty(bulletKind)) {
        return def.BULLET_MULTI[bulletKind];
    } else {
        return 1;
    }

};

exports.bydhUtil = bydhUtil;