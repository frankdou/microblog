var db = require('./db');
var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    userName : String,
    post : String,
    time : {type: Date, default: Date.now}
});
var Post = db.model('Post', schema);

var Posts = function (username,post,time){
    // 用于存储post信息
    this.username=username;
    this.post=post;
    this.time=time;
}
// 发表留言
exports.postSave = function (posts,callback){
    var newPost = new Post({
            userName : posts.user.name,
            post : posts.post
        });
    
    newPost.save(function(err){
        if(err){
            return callback(err);
        }
        callback(null);
    })
};
// 单个用户留言查询
exports.userPostFind = function (userName,callback){
    Post.find({ userName : userName }, function (err, data) {
        if(err){
            return callback(err,null);
        }
        callback(null, data);
    })
};
// 全部留言
exports.allPostFind = function (callback){
    Post.find(function(err, data){
        if(err){
            return callback(err, null);
        }
        callback(null, data);
    })
};