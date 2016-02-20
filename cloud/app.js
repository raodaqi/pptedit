//leanengine配置
var AV = require('leanengine');

// var APP_ID = process.env.LC_APP_ID || 'gwkliimurk7yyumspmmkn9k9z0k8vpxrwxq6yze6iyeosqra'; // your app id
// var APP_KEY = process.env.LC_APP_KEY || 'sox4hy7oi0ar0rxv9dxs78whkmc7iv9w2mmf23pdu7rwd10l'; // your app key
// var MASTER_KEY = process.env.LC_APP_MASTER_KEY || ''; // your app master key
var APP_ID = 'Jjl6Ng23zlVKWIBAuPQlnNXa'; // your app id
var APP_KEY = '9sv3nSd5wUFTjFF5JTC9kCOq'; // your app key
var MASTER_KEY = ''; // your app master key

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);

// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.get('/', function(req, res) {
  var user = req.AV.user;
  res.render('index',{user:user});
});

app.get('/index', function(req, res) {
  res.redirect('/');
});

app.get('/market', function(req, res) {
  var user = req.AV.user;
  AV.Query.doCloudQuery('select * from Source', {
	  success: function(result){
	    //results 是查询返回的结果，AV.Object 列表
	    results = result.results;
	    // console.log(results[0].attributes.type);
	    res.render('market',{user:user,Source:results});
	    //do something with results...
	  },
	  error: function(error){
	    //查询失败，查看 error
	    res.render('market',{user:user,Source:"error"});
	    console.dir(error);
	  }
	});
  
  
});

app.post('/test', function(req, res) {
	// var user = req.AV.user;
	var pptData = req.body.pptData;
	var userName = req.body.userName;
	console.log(pptData);
	var ppt = AV.Object.extend("PptData");
  	var ppt = new ppt();
  	ppt.set('userName', userName);
	ppt.set('pptData', pptData);
	ppt.save().then(function(post) {
	  // 成功保存之后，执行其他逻辑.
	  res.send(post);
	}, function(err) {
	  // 失败之后执行其他逻辑
	  // error 是 AV.Error 的实例，包含有错误码和描述信息.
	 res.send(err);
	});
});

app.get('/test', function(req, res) {
	var user = req.AV.user;
	var query = new AV.Query("PptData");
	query.equalTo("userName","test");
  	query.find({
  		success:function(result){
  			console.log(result[0].attributes.pptData);
  			var data = eval("("+result[0].attributes.pptData+")");
  			// data = JSON.stringify(data);
  			console.log(JSON.stringify(data));
  			// var result = [{
  			// 	"code": 200,
    	// 		"data":data
  			// }];
  			console.log(result);
  			// res.render('test',{result:result[0].attributes.pptData});
  			res.render('test',{result:data});
  		},
  		error:function(error){
  			var result = [{
  				"code": 200,
    			"data":"没有数据"
  			}];
  			console.log(result);
  			res.render('test',{result:result});
  		}
  	});
	
});

app.post('/', function(req, res) {
	var user = req.AV.user;
	console.log(user);
	res.render('index',{user:user});
});

app.get('/signin', function(req, res) {
  if (req.AV.user) {
        res.redirect('../users/info');
    } else {
        res.render('signin');
    }
});

app.get('/logout', function(req, res) {
  // AV.Cloud.CookieSession 将自动清除登录 cookie 信息
  AV.User.logOut();
  res.redirect('/signin');
});

app.post('/signin', function(req, res) {
  var username = req.body.email;
  var password = req.body.password;
  AV.User.logIn(username, password, {
	  success: function(user) {
	    // 成功了，现在可以做其他事情了.
	    res.send(user);
	  },
	  error: function(user, error) {
	    // 失败了.
	    res.send(error);
	  }
	});
});

app.get('/trends', function(req, res) {
  res.render('trends');
});

app.get('/app', function(req, res) {
  res.redirect('../market');
});

app.get('/app/:id', function(req, res) {
  var id = req.params.id;
  var query = new AV.Query("Source");
  var user = req.AV.user;

  query.equalTo("appid",id);
  query.find({
  	success:function(result){
  		console.log(result);
  		// res.render('app',{result:result});
  		var query = new AV.Query("SourceDetial");
  		query.equalTo("relativeId",id);
  		query.find({
  			success:function(resultDetail){
  				var query = new AV.Query("Comment");
		  		query.equalTo("relativeId",id);
		  		query.find({
		  			success:function(comment){
		  				if(user){
		  					var query = new AV.Query("Like");
					  		query.equalTo("relativeId",id);
					  		query.equalTo("userName",user.attributes.username);
					  		query.find({
					  			success:function(like){
					  				console.log(like.length);
					  				res.render('app',{result:result,resultDetail:resultDetail,comment:comment,user:user,like:like});
					  				
					  			},
					  			error:function(error){
					  				console.log(error);
					  			}
					  		})
		  				}else{
		  					res.render('app',{result:result,resultDetail:resultDetail,comment:comment,user:user,like:''});
		  				}
		  				
		  			},
		  			error:function(error){
		  				console.log(error);
		  			}
		  		})
  			},
  			error:function(error){
  				console.log(error);
  			}
  		})
  	},
  	error:function(error){
  		console.log(error);
  		// res.render('app',{result:error});
  	}	
  })
});
app.get('/users/', function(req, res) {
	res.redirect("/users");
});
app.get('/users', function(req, res) {
	var user = req.AV.user;
	if (user) {
		var query = new AV.Query("UserInfo");
		query.equalTo("userName",user.attributes.username);
		query.find({
			success:function(userInfo){
			// console.log(userInfo);
			// res.render('info',{userInfo:userInfo,apps:result});
				res.render('edit',{userInfo:userInfo});
			},
			error:function(error){
				console.log(error);
			  	// res.send({message:"错误",apps:"error"});
			}
		});
    } else {
        res.redirect('../signin');
    }
});

app.post('/users/photo',multipartMiddleware, function(req, resp) {
	// var photo = req.body.userHead;
	var user = req.AV.user;
	var file = req.files.userHead;
	var name = req.files.userHead.name;
	// var file = new AV.File(name, file);
	if(file.size !== 0){
      fs.readFile(file.path, function(err, data){
        if(err) {
          return res.send('读取文件失败');
        }
        var base64Data = data.toString('base64');
        var theFile = new AV.File(name, {base64: base64Data});
        theFile.save().then(function(theFile){
          var query = new AV.Query("UserInfo");
		  query.equalTo("userName", user.attributes.username);
		  query.find({
			  success: function(results) {
			  	var objectId = results[0].id;
			  	var userHeadOld = results[0].attributes.userHead;
			      console.log(objectId);
			      var userHead = theFile.url();

		          var UserInfo = AV.Object.extend("UserInfo");
		          var query = new AV.Query(UserInfo);

				  query.get(objectId, {
				    success: function(post) {
				      // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
				      post.set('userHead', userHead);
				      post.save(null, {
						  success: function(post) {
						    // 成功保存之后，执行其他逻辑.
						    var query = new AV.Query("_File");
		  					query.equalTo("url", userHeadOld);
		  					query.find({
							   success: function(result){
							      // 成功删除 query 命中的所有实例.
							      console.log(result[0].id);
							      console.log("更换成功");
								  resp.send(theFile.url());
							      // var file = AV.File(result[0].id);
							  //     var file = AV.Object.extend("_File");
									// var query = new AV.Query(file);

									// // 这个 id 是要修改条目的 objectId，你在生成这个实例并成功保存时可以获取到，请看前面的文档
									// query.get(result[0].id, {
									//     success: function(file) {
									//       // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
									//      file.destroy({
									// 	  success: function(myObject) {
									// 	    // 对象的实例已经被删除了.
									// 	    console.log("删除成功");
									// 	  },
									// 	  error: function(myObject, error) {
									// 	    // 出错了.
									// 	    console.log(error);
									// 	  }
									// 	});

									//     },
									//     error: function(object, error) {
									//       // 失败了.
									//       console.log(object);
									//     }
									// });
							      // console.log(file);
						   //  	  file.destroy().then({
									//    success: function(){
									//       // 成功删除 query 命中的所有实例.
									//       console.log("保存成功");
								 //    	  resp.send(theFile.url());
									//    },
									//    error: function(err){
									//       // 失败了.
									//       console.log(err);
									//    }
									// });
							   },
							   error: function(err){
							      // 失败了.
							      console.log("更换失败");
							   }
							});
						  },
						  error: function(post, error) {
						    // 失败之后执行其他逻辑
						    // error 是 AV.Error 的实例，包含有错误码和描述信息.
						    console.log("保存失败");
						  }
						});
				    },
				    error: function(object, error) {
				      // 失败了.
				      console.log("查询失败");
				    }
				});
			  },
			  error: function(error) {
			  	console.log("查询失败");
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
          
        });
      });
    }
});

app.post('/edit', function(req, res) {
	var user = req.AV.user;
	// console.log(user);
	var password = req.body.password;

	user.setPassword(password);
	user.save().then(function(){
	  //验证成功
	  AV.User.logOut();
	  res.send("1");
	}, function(err){
	  //验证失败
	  console.log(err);
	  res.send("0");
	});

});

app.post('/app/comment', function(req, res) {
	var user = req.AV.user;
	var commentText = req.body.commentText;
	var appid = req.body.appid;
	if(user){
		var query = new AV.Query("UserInfo");
  		query.equalTo("userName",user.attributes.username);
  		query.find({
  			success:function(userInfo){
  				
  				if(userInfo){
	  				var Comment = AV.Object.extend("Comment");
	  				var comment = new Comment();
	  				comment.set("userName",userInfo[0].attributes.userName);
	  				comment.set("userHead",userInfo[0].attributes.userHead);
	  				comment.set("content",commentText);
	  				comment.set("relativeId",appid);
	  				comment.save(null, {
					  success: function(comment) {
					    // 成功保存之后，执行其他逻辑.
					    res.send(comment);
					    console.log(comment);
					    // alert('New object created with objectId: ' + post.id);
					  },
					  error: function(error) {
					    // 失败之后执行其他逻辑
					    // error 是 AV.Error 的实例，包含有错误码和描述信息.
					    res.send("保存失败");
					    // alert('Failed to create new object, with error message: ' + error.message);
					  }
					});
  				}else{
  					res.send("{message:'没有这个用户的信息',code:'403'}");
  				}
  			},
  			error:function(){
  				res.send("{message:'用户查询失败',code:'402'}");
  			}
  		})
	}else{
		res.send("{message:'用户没有登陆',code:'401'}");
	}

});

app.post('/app/like', function(req, res) {
	var user = req.AV.user;
	var appid = req.body.appid;
	var objectId = req.body.objectId;
	console.log(appid);
	if(user){
		var query = new AV.Query("Like");
		query.equalTo("relativeId",appid);
		query.equalTo("userName",user.attributes.username);
  		query.find({
  			success:function(likeResult){
  				console.log(likeResult);
  				if(likeResult.length > 0){
	  				var Source = AV.Object.extend("Source");
	  				var source = new Source();
	  				source.set("objectId", objectId);
	  				source.increment("likeNum",-1);

	  				source.save(null, {
					  success: function(result) {
					    // 成功保存之后，执行其他逻辑.
					    query.destroyAll({
						   success: function(){
						      // 成功删除 query 命中的所有实例.
						      res.send("取消赞");
					    	  console.log(result);
						   },
						   error: function(err){
						      // 失败了.
						      res.send("删除失败");
						   }
						 });
					    
					    // alert('New object created with objectId: ' + post.id);
					  },
					  error: function(error) {
					    // 失败之后执行其他逻辑
					    // error 是 AV.Error 的实例，包含有错误码和描述信息.
					    res.send("保存失败");
					    // alert('Failed to create new object, with error message: ' + error.message);
					  }
					});
  				}else{
  					var Source = AV.Object.extend("Source");
	  				var source = new Source();
	  				source.set("objectId", objectId);
	  				source.increment("likeNum");

	  				source.save(null, {
					  success: function(result) {
					    // 成功保存之后，执行其他逻辑.
					    var query = new AV.Query("UserInfo");
						query.equalTo("userName",user.attributes.username);
					  	query.find({
						  	success:function(userInfo){
						  		var like = AV.Object.extend("Like");
						  		var like = new like();
						  		like.set("userName",user.attributes.username);
						  		like.set("userHead",userInfo[0].attributes.userHead);
						  		like.set("relativeId",appid);
						  		like.save(null, {
								  success: function(post) {
								    // 成功保存之后，执行其他逻辑.
								    res.send("赞");
					    			console.log(result);
								  },
								  error: function(error) {
								    // 失败之后执行其他逻辑
								    // error 是 AV.Error 的实例，包含有错误码和描述信息.
								    res.send("保存失败");
								  }
								});
						  	},
						  	error:function(error){
						  		res.send("查找失败");
				  				// res.send({message:"错误",apps:"error"});
						  	}
						  });
					    // alert('New object created with objectId: ' + post.id);
					  },
					  error: function(error) {
					    // 失败之后执行其他逻辑
					    // error 是 AV.Error 的实例，包含有错误码和描述信息.
					    res.send("增加失败");
					    // alert('Failed to create new object, with error message: ' + error.message);
					  }
					});
  				}
  			},
  			error:function(){
  				res.send("{message:'用户查询失败',code:'402'}");
  			}
  		})
	}else{
		res.send("{message:'用户没有登陆',code:'401'}");
	}

});

app.get('/users/signup', function(req, res) {
  res.render('signup');
});

app.get('/users/info', function(req, res) {
	var user = req.AV.user;
	if (user) {
		var email = user.attributes.email;
		var img = Array();
		var query = new AV.Query("Source");
		query.equalTo("uploader",email);
	  	query.find({
		  	success:function(result){
		  		var query = new AV.Query("UserInfo");
				query.equalTo("userName",user.attributes.username);
			  	query.find({
				  	success:function(userInfo){
				  		console.log(userInfo);
				  		res.render('info',{userInfo:userInfo,apps:result});
				  	},
				  	error:function(error){
				  		console.log(error);
		  				// res.send({message:"错误",apps:"error"});
				  	}
				  });
		  	},
		  	error:function(error){
		  		console.log(error);
		  		res.render('info',{user:user,apps:"error"});
		  		// res.render('app',{result:error});
		  	}	
		 })
    } else {
        res.redirect('../signin');
    }
});

app.get('/users/activatemail', function(req, res) {
  res.render('activatemail');
});

app.get('/setverifysent', function(req, res) {
  res.render('setverifysent');
});


app.post('/send',multipartMiddleware, function(req, res) {
  var file = req.files;
  console.log(file);
});

app.get('/send', function(req, res) {
  var type = req.query.type; 
  res.render('send',{type:type});
});

app.post('/users/info', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var user = new AV.User();
  user.set("email", email);
  user.set("password", password);
  user.set("username", email);

  user.signUp(null, {
		success: function(user) {
		    // 注册成功，可以使用了.
		    if(user){
		    	res.send(user);
		    	// res.render('/setverifysent', { user: user });
		    }
		},
		error: function(user, error) {
		    // 失败了
		    console.log("Error: " + error.code + " " + error.message);;
		    res.send("Error: " + error.code + " " + error.message);;
		}
	});
});

app.post('/market', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  AV.User.logIn(email, password, {
	  success: function(user) {
	    // 成功了，现在可以做其他事情了.
	    res.send(user);
	  },
	  error: function(user, error) {
	    // 失败了.
	    res.send(error);
	  }
	});
});


// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();