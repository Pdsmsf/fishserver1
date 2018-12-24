//开始模式
exports.start_mode = function(){
    return {
        //所有准备
        START_MODE_ALL_READY:0x00,
        //满人开始
        START_MODE_FULL_READY:0x01,
        //配对开始
        START_MODE_PAIR_READY:0x02,
        //时间控制
        START_MODE_TIME_CONTROL:0x03,
        //管理控制
        START_MODE_MASTER_CONTROL:0x04,
    };
};
