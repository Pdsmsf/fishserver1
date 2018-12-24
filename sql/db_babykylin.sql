/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50556
Source Host           : localhost:3306
Source Database       : db_babykylin

Target Server Type    : MYSQL
Target Server Version : 50556
File Encoding         : 65001

Date: 2017-09-20 13:52:39
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `t_accounts`
-- ----------------------------
DROP TABLE IF EXISTS `t_accounts`;
CREATE TABLE `t_accounts` (
  `account` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_accounts
-- ----------------------------

-- ----------------------------
-- Table structure for `t_games`
-- ----------------------------
DROP TABLE IF EXISTS `t_games`;
CREATE TABLE `t_games` (
  `room_uuid` char(20) NOT NULL,
  `game_index` smallint(6) NOT NULL,
  `base_info` varchar(1024) NOT NULL,
  `create_time` int(11) NOT NULL,
  `snapshots` char(255) DEFAULT NULL,
  `action_records` varchar(2048) DEFAULT NULL,
  `result` char(255) DEFAULT NULL,
  PRIMARY KEY (`room_uuid`,`game_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_games
-- ----------------------------

-- ----------------------------
-- Table structure for `t_games_archive`
-- ----------------------------
DROP TABLE IF EXISTS `t_games_archive`;
CREATE TABLE `t_games_archive` (
  `room_uuid` char(20) NOT NULL,
  `game_index` smallint(6) NOT NULL,
  `base_info` varchar(1024) NOT NULL,
  `create_time` int(11) NOT NULL,
  `snapshots` char(255) DEFAULT NULL,
  `action_records` varchar(2048) DEFAULT NULL,
  `result` char(255) DEFAULT NULL,
  PRIMARY KEY (`room_uuid`,`game_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_games_archive
-- ----------------------------

-- ----------------------------
-- Table structure for `t_guests`
-- ----------------------------
DROP TABLE IF EXISTS `t_guests`;
CREATE TABLE `t_guests` (
  `guest_account` varchar(255) NOT NULL,
  PRIMARY KEY (`guest_account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_guests
-- ----------------------------

-- ----------------------------
-- Table structure for `t_message`
-- ----------------------------
DROP TABLE IF EXISTS `t_message`;
CREATE TABLE `t_message` (
  `type` varchar(32) NOT NULL,
  `msg` varchar(1024) NOT NULL,
  `version` varchar(32) NOT NULL,
  PRIMARY KEY (`type`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_message
-- ----------------------------
INSERT INTO `t_message` VALUES ('notice', '华软品质，值得信赖', '20161128');
INSERT INTO `t_message` VALUES ('fkgm', '华软品质，值得信赖', '20161128');

-- ----------------------------
-- Table structure for `t_property`
-- ----------------------------
DROP TABLE IF EXISTS `t_property`;
CREATE TABLE `t_property` (
  `propId` int(11) NOT NULL AUTO_INCREMENT,
  `userid` int(11) DEFAULT NULL,
  `ice` int(11) DEFAULT NULL,
  PRIMARY KEY (`propId`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_property
-- ----------------------------
INSERT INTO `t_property` VALUES ('1', '24', '5');
INSERT INTO `t_property` VALUES ('2', '25', '5');
INSERT INTO `t_property` VALUES ('3', '60', '9');
INSERT INTO `t_property` VALUES ('4', '61', '5');
INSERT INTO `t_property` VALUES ('5', '22', '66');
INSERT INTO `t_property` VALUES ('6', '62', '5');
INSERT INTO `t_property` VALUES ('7', '63', '5');
INSERT INTO `t_property` VALUES ('8', '64', '5');
INSERT INTO `t_property` VALUES ('9', '65', '5');
INSERT INTO `t_property` VALUES ('10', '66', '7');
INSERT INTO `t_property` VALUES ('11', '67', '5');
INSERT INTO `t_property` VALUES ('12', '68', '6');
INSERT INTO `t_property` VALUES ('13', '69', '5');
INSERT INTO `t_property` VALUES ('14', '70', '5');
INSERT INTO `t_property` VALUES ('15', '71', '5');
INSERT INTO `t_property` VALUES ('16', '72', '5');
INSERT INTO `t_property` VALUES ('17', '73', '6');
INSERT INTO `t_property` VALUES ('18', '74', '5');
INSERT INTO `t_property` VALUES ('19', '75', '5');
INSERT INTO `t_property` VALUES ('20', '77', '6');
INSERT INTO `t_property` VALUES ('21', '79', '6');
INSERT INTO `t_property` VALUES ('22', '80', '5');
INSERT INTO `t_property` VALUES ('23', '81', '5');
INSERT INTO `t_property` VALUES ('24', '82', '5');
INSERT INTO `t_property` VALUES ('25', '83', '5');
INSERT INTO `t_property` VALUES ('26', '84', '5');
INSERT INTO `t_property` VALUES ('27', '85', '5');
INSERT INTO `t_property` VALUES ('28', '86', '5');
INSERT INTO `t_property` VALUES ('30', '89', '5');
INSERT INTO `t_property` VALUES ('31', '90', '5');
INSERT INTO `t_property` VALUES ('32', '91', '6');
INSERT INTO `t_property` VALUES ('33', '92', '5');
INSERT INTO `t_property` VALUES ('34', '93', '5');
INSERT INTO `t_property` VALUES ('35', '94', '5');
INSERT INTO `t_property` VALUES ('36', '95', '5');

-- ----------------------------
-- Table structure for `t_rooms`
-- ----------------------------
DROP TABLE IF EXISTS `t_rooms`;
CREATE TABLE `t_rooms` (
  `uuid` char(20) NOT NULL,
  `id` char(8) NOT NULL,
  `base_info` varchar(256) NOT NULL DEFAULT '0',
  `create_time` int(11) NOT NULL,
  `num_of_turns` int(11) NOT NULL DEFAULT '0',
  `next_button` int(11) NOT NULL DEFAULT '0',
  `user_id0` int(11) NOT NULL DEFAULT '0',
  `user_icon0` varchar(128) NOT NULL DEFAULT '',
  `user_name0` varchar(32) NOT NULL DEFAULT '',
  `user_score0` int(11) NOT NULL DEFAULT '0',
  `user_id1` int(11) NOT NULL DEFAULT '0',
  `user_icon1` varchar(128) NOT NULL DEFAULT '',
  `user_name1` varchar(32) NOT NULL DEFAULT '',
  `user_score1` int(11) NOT NULL DEFAULT '0',
  `user_id2` int(11) NOT NULL DEFAULT '0',
  `user_icon2` varchar(128) NOT NULL DEFAULT '',
  `user_name2` varchar(32) NOT NULL DEFAULT '',
  `user_score2` int(11) NOT NULL DEFAULT '0',
  `user_id3` int(11) NOT NULL DEFAULT '0',
  `user_icon3` varchar(128) NOT NULL DEFAULT '',
  `user_name3` varchar(32) NOT NULL DEFAULT '',
  `user_score3` int(11) NOT NULL DEFAULT '0',
  `ip` varchar(16) DEFAULT NULL,
  `port` int(11) DEFAULT '0',
  `baseScore` int(11) DEFAULT NULL,
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_rooms
-- ----------------------------

-- ----------------------------
-- Table structure for `t_users`
-- ----------------------------
DROP TABLE IF EXISTS `t_users`;
CREATE TABLE `t_users` (
  `userid` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `account` varchar(64) NOT NULL DEFAULT '' COMMENT '账号',
  `name` varchar(32) DEFAULT NULL COMMENT '用户昵称',
  `sex` int(1) DEFAULT NULL,
  `headimg` varchar(256) DEFAULT NULL,
  `lv` smallint(6) DEFAULT '1' COMMENT '用户等级',
  `exp` int(11) DEFAULT '0' COMMENT '用户经验',
  `coins` int(11) DEFAULT '0' COMMENT '用户金币',
  `vip` int(6) DEFAULT '0',
  `money` int(12) DEFAULT NULL,
  `gems` int(11) DEFAULT '0' COMMENT '用户宝石',
  `roomid` varchar(8) DEFAULT NULL,
  `history` varchar(4096) NOT NULL DEFAULT '',
  `power` int(11) DEFAULT NULL,
  `RenameCount` int(11) DEFAULT NULL,
  `ReHeadCount` int(11) DEFAULT NULL,
  `propId` int(11) DEFAULT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `account` (`account`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of t_users
-- ----------------------------
INSERT INTO `t_users` VALUES ('95', 'guest_1505713452506', 'MTM1NQ==', '0', '1', '1', '0', '10000', '0', null, '10000', null, '', '0', '0', '0', null);
