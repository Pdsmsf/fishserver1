var db = require('../utils/db');
var configs = require(process.argv[2]);

//init db pool.
db.init(configs.mysql());

//获取账号服务器信息，开启账号服务器
var config = configs.account_server();
var as = require('./account_server');
as.start(config);

var dapi = require('./dealer_api');
dapi.start(config);