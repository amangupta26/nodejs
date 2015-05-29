var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');


var app = express();

mongoose.connect(config.database,function(err){
	if(err)
		console.log(err);
	else
		console.log("Connected to the database");
});

/*
 * body-parser is a piece of express middleware that 
 *   reads a form's input and stores it as a javascript
 *   object accessible through `req.body` 

 *  body-parser will be used for all the routes coming to this app
 *    
 */


////////////Global Middleware/////////////
app.use(bodyParser.urlencoded({extended : true}));    //extended : false means only String can be parsed in the encoded url
app.use(bodyParser.json());
app.use(morgan('dev'));

var api = require('./app/routes/api')(app,express);
app.use('/api',api);												// /api is the prefix used before each APIs

app.get('*',function(req,res){
	res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(config.port,function(err){
	if(err){
		console.log(err);
	}
		
	else{
		console.log("Listening");
	}
});
