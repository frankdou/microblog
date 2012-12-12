var db = require('./db');
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
        name : String,
        password : String
    });
var User = db.model('User', schema);
exports.userSave = function(user,callback){
    var newUser = new User({
            name : user.name,
            password : user.password
        });
    
    newUser.save(function(err){
        if(err){
           return callback(err);
        }
        callback(null);
    })
};
exports.userFind = function(userName,callback){
    User.findOne({ name : userName },function(err,user){
        if(err){
            return callback(err,null);
        }
        // 用户名如果已经存在,传递给相关函数
        callback(null,user);
    })

};