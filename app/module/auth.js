/**
 * Created by egret on 16/2/25.
 */
var Auth = module.exports;

var Global = require('../../libs/global/global.js');
var Utils = require('../../libs/util/utils.js');
var UserSessionService = require('../../libs/session/userSessionService.js');
var DbUserModel = require('../model/dbUser.js');
var UserModel = require('../model/user.js');
var DataService = require('../data/dataService.js');
var UserDao = require('../dao/userDao.js');
var Proto = require('../proto/gameProto.js');
var Log = require('../../libs/log/log.js');
var MyDate = require('../../libs/date/date.js');
var UserCache = require('../cache/userCache.js');
var BackMessage = require('../message/backMessage.js');


Auth.login = function(userSession, account) {
    UserCache.getUserByName(account, function(cacheDbUser){
        if(cacheDbUser){
            Auth.loginSuccess(userSession, cacheDbUser);
            Log.debug('存在缓存')
        } else {
            UserDao.getUserByName(account, function(err, dbUser){
                if (err){
                    Log.error(err);
                } else {
                    if (dbUser) {
                        Auth.loginSuccess(userSession, dbUser);
                    } else{
                        Auth.create(userSession, account);
                    }
                }
            })
        }
    });
}

Auth.create = function(userSession, account) {
    var dbUser = new DbUserModel();
    dbUser.name = account;
    dbUser.money = Math.ceil(Math.random() * 10000);
    UserDao.createUser(dbUser, function(err, dbUser){
        if (err){
            Log.error(err);
        } else {
            Auth.loginSuccess(userSession, dbUser);
        }
    })
}

Auth.loginSuccess = function(userSession, dbUser){
    //在Redis中缓存用户数据
    dbUser.last_login_time = MyDate.unix();
    UserCache.setUser(dbUser);

    //在内存中缓存用户数据
    var user = new UserModel();
    user.id = dbUser.id;
    user.name = dbUser.name;
    DataService.addUser(user, userSession);
    UserSessionService.addSession(userSession);

    //设置用户在线
    UserCache.setOnline(dbUser.id);
    userSession.addCloseCallBack(function(){
        //设置用户下线
        UserCache.setOffline(dbUser.id);
    });

    //返回客户端消息
    var sendMsg = new Proto.user_login_s2c();
    sendMsg.user.userId = dbUser.id;
    sendMsg.user.userName = dbUser.name;
    sendMsg.user.money = dbUser.money;
    sendMsg.user.create_time = dbUser.create_time;
    sendMsg.user.task = [1, 2, 3, 8, 9];
    BackMessage.sendToGate(userSession, sendMsg);
}
