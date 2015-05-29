var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');					//password should be decrypted before storing in DB

var Schema  = mongoose.Schema; 


var UserSchema = new Schema({
	name : String,
	username : {type : String, required : true, index :{unique : true}},
	password : {type : String, required : true, select: false}
});

UserSchema.pre('save',function(next){									//pre-processing before storing in database
	var user = this;
	if(!user.isModified('password')) return next();						//if user's password in not modified go to next matching route

	bcrypt.hash(user.password,null,null,function(err,hash){
		if(err) return next(err);
		user.password = hash;
		return next();
	});
});

UserSchema.methods.comparePassword = function(password){			//custom method which compares password given by user with password on DB
	var user = this;
	return bcrypt.compareSync(password,user.password);
};				

module.exports = mongoose.model('User',UserSchema);