# microblog简介
1. 使用_connect-mongo_用来缓存session信息
2. 使用_mongoose_用来配合mongodb存取数据
3. 使用ejs模板来产出html
4. 参照express案例，使用了_res.locals.message_来代替flash，存储一次性消息

## 基本运行逻辑
* 代码从app.js开始，加载相关module，做相关configure设置（使用router，模板引擎，端口等）
* 下面代码，是为了处理一次性显示的信息（比如当登录时，密码输入错误，会继续跳转到登录页，并在头部提示密码输入错误）

````
  app.use(function(req, res, next){
      // instead falsh
      var err = req.session.error,
          success = req.session.success;
      delete req.session.error;
      delete req.session.success;
      res.locals.message = '';
      if (err) res.locals.message = '<div class="alert alert-error">' + err + '</div>';
      if (success) res.locals.message = '<div class="alert alert-success">' + success + '</div>';
      next();
  });
````
* server启动后，访问相关url地址，会被router接受，并处理。为了权限控制，大部门的页面需要检查用户登录状态，再进行数据获取，html产出，传递到网页。

* model使用了mongoose的schema来保证在数据库上存储的正确性。