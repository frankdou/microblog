/*
 * GET home page.
 */
var crypto=require('crypto');
var User=require('../models/user.js');
var Post=require('../models/post.js');
var checkLogin = function (req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录');
            return res.redirect('/login');

        }
        next();
    };
var checkNotLogin = function (req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录');
            return res.redirect('/');
        }
        next();
    };

module.exports = function(app) {
    app.get('/', function(req, res) {
        Post.allPostFind(function(err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '首页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    // 查看是否登录，未登录导向登录页面。 如果已登录，先检查是否有相关用户，没有返回主页，有则查找相关信息
    app.get('/u/:user', checkLogin);
    app.get('/u/:user', function(req, res) {
        User.userFind(req.params.user, function(err, user) {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/');
            }
            Post.userPostFind(user.name, function(err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });
    //发表微博,如未登录则导向登录页面
    app.post('/post', checkLogin);
    app.post('/post', function(req, res) {
        var post = {
            user: req.session.user,
            post: req.body.post
        };
        Post.postSave(post, function(err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发表成功');
            res.redirect('/u/' + post.user.name);
        });
    });
    app.get('/reg', checkNotLogin);
    // 头部显示信息条件提供，注册失败信息提示
    app.get('/reg', function(req, res) {
        res.render('reg', {
            title: '用户注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    //用户注册, 检查登录状态,如果已经登录，直接跳转到首页
    app.post('/reg', checkNotLogin);
    app.post('/reg', function(req, res) {
        if (!req.body['username']) {
            req.flash('error', '用户名不能空');
            return res.redirect('/reg');
        }
        if (!req.body['password']) {
            req.flash('error', '密码不能空');
            return res.redirect('/reg');
        }

        if (req.body['password-repeat'] != req.body['password']) {
            req.flash('error', '输入的密码不一致');
            return res.redirect('/reg');
        }

        //md加密
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        var newUser = {
            name: req.body.username,
            password: password
        };

        //用户检测，是否已经存在
        User.userFind(newUser.name, function(err, user) {
            if (user) {
                err = '用户名已经被注册！';
            }
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }
            User.userSave(newUser, function(err) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/reg');
                }
                req.session.user = newUser;

                req.flash('success', '注册成功');
                res.redirect('/');
            });
        });
    });
    //防止已登录状态下，手动到该页
    app.get('/login', checkNotLogin);
    // 头部显示信息条件提供，登录成功失败信息提示
    app.get('/login', function(req, res) {
        res.render('login', {
            title: '用户登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/login', checkNotLogin);
    // 登录验证
    app.post('/login', function(req, res) {
        //生成口令的散列值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');

        User.userFind(req.body.username, function(err, user) {
            if (!user) {
                req.flash('error', '用户不存在');
                return res.redirect('/login');
            }
            if (user.password !== password) {
                req.flash('error', '用户密码错误');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登录成功');
            res.redirect('/');
        });
    });
    app.get('/logout', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');
    });
}