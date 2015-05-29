var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config')

var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');

function createToken(user){
	var token = jsonwebtoken.sign({
		id : user._id,
		name : user.name,
		username : user.username
	},secretKey,{
		expiresInMinute : 1440
	});

	return token;
}

module.exports = function(app,express){
	var api = express.Router();

	api.post('/signup',function(req,res){
		var user = new User({
			name : req.body.name,
			username : req.body.username,				//body is the bodyparser
			password : req.body.password
		});

		user.save(function(err){
			if(err){
				res.send(err);
				return;
			}
			res.json({message : "User is created"});
		});
	});

	api.get('/users',function(req,res){
		User.find({},function(err,users){
			if(err){
				res.send(err);
				return;
			}
			res.json(users);
		});
	});

	api.post('/login',function(req,res){
		User.findOne({
			username : req.body.username
		}).select('password').exec(function(err,user){
			if(err) throw err;
			if(!user){
				res.send({message : "User does not exist"});
			}else if(user){
				var validPassword = user.comparePassword(req.body.password);
				if(!validPassword)
					res.send({message : "Invalid password!"});
				else{

						var token = createToken(user);
						res.json({
							success : true,
							message : "successful login",
							token : token
						});

				}
			}
		});
	});

	////////////////API Middleware starts///////////////////////////

	api.use(function(req,res,next){																	//middleware after login i.e. when client gets token. All the request after login has to contain token and will pass this custom  middleware		
		console.log("somebody came");
		var token = req.headers['x-access-token'];
		if(token){
			jsonwebtoken.verify(token,secretKey,function(err,decoded){
				if(err)
					res.status(403).send({success: false,message: "invalid token"});
				else{
					req.decoded = decoded;                                             			//token is encoded using _id,name,username(see create_token) and decoded conatins object which contains above info
					next();
				}
			});
		}

		else{
			res.status(403).send({success : false,message:"no token provided"});
		}
 	});

 	///////////////API Middleware ends/////////////////////////////

 	///////////Destination B - to reach here should have legitimate token////////////////////////////////////
 	////Chaining allows multiple HTTP method on a single route
 	api.route('/')
 		.post(function(req,res){
 			var story = new Story({
 				creator : req.decoded.id,
 				content : req.body.content,
 			});

 			story.save(function(err){
 				if(err){
 					res.send(err);
 					return;
 				}
 				res.json({message : "New story created"});
 			});
 		})

 		.get(function(req,res){
 			Story.find({creator : req.decoded.id},function(err,stories){
 				if(err){
 					res.send(err);
 					return;
 				}

 				res.json(stories);
 			});
 		});


 	api.get('/me',function(req,res){
 		res.json(req.decoded);
 	});

	return api;
}
