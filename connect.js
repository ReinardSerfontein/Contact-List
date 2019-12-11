var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var personal;


var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'password',
	database : 'timetable'
});

connection.query('SELECT * FROM personal',
function(error, rows){
if(error)
	throw (error);
	console.log(rows);
	if(rows.length > 0){
		personal = rows;
	}else{
		personal = null;
	}
	
})

module.exports = app;

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');



//ALL THE GET METHODS IS IN HERE

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/choose', function(request, response) {

    response.sendFile(path.join(__dirname + '/choose.html'));
});

app.get('/business.html', function(request, response) {
	response.sendFile(path.join(__dirname + '/business.html'));
});

app.get('/signup.html', function(request, response) {
	response.sendFile(path.join(__dirname + '/signup.html'));
});

app.get('/personal.html', function(request, response) {
	response.sendFile(path.join(__dirname + '/personal.html'));
});

app.get('/personal/delete/:userId',(request, response) => {
	const userId = request.params.userId;
	let sql = `DELETE from personal WHERE id = ${userId}`;
	let query = connection.query(sql, (error, results) => {
		if(error) throw error;
		response.redirect('/personaldeletedone');
	});
});

app.get('/business/delete/:userId',(request, response) => {
	const userId = request.params.userId;
	let sql = `DELETE from business WHERE id = ${userId}`;
	let query = connection.query(sql, (error, results) => {
		if(error) throw error;
		response.redirect('/businessdeletedone');
	});
});

app.get('/login.html', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.get('/personalall.ejs',function(req,res)
{res.render('personalall.ejs');});

app.get('/personaldeletedone',function(req,res)
{res.render('personaldeletedone.html');});

app.get('/businessdeletedone',function(req,res)
{res.render('businessdeletedone.html');});

app.get('/personaledit.html',function(req,res)
{res.render('personalall.html');});

app.get('/personal/edit/:userId', (request, response) =>{
	const userId = request.params.userId;
	let sql = `SELECT * FROM personal WHERE id = ${userId}`;
	let query = connection.query(sql, (error, results) => {
		if(error) throw error;
		response.render('personaledit.ejs', {
			user : results[0]
		});
	});
});

app.get('/business/edit/:userId', (request, response) =>{
	const userId = request.params.userId;
	let sql = `SELECT * FROM business WHERE id = ${userId}`;
	let query = connection.query(sql, (error, results) => {
		if(error) throw error;
		response.render('businessedit.ejs', {
			user : results[0]
		});
	});
});

app.get('/personalall.html', (request, response) => {
	let sql = "SELECT * FROM personal";
	let query = connection.query(sql, (error, rows) => {
		if(error) throw error;
		response.render('personalall.ejs', {
			personal : rows
		});
	});
});

app.get('/businessall.html', (request, response) => {
	let sql = "SELECT * FROM business";
	let query = connection.query(sql, (error, rows) => {
		if(error) throw error;
		response.render('businessall.ejs', {
			personal : rows
		});
	});
});

//ALL THE POST METHODS IS IN HERE

//Verifying if the user is in the system method.
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
                response.redirect('/choose');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

//****Encrypting the password for the users.
//const bcrypt = require('bcrypt');
//const saltRounds = 10;

app.post('/signup', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
    var email = request.body.email;
	//bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
		queryString = "INSERT INTO accounts (username, password, email) VALUES (?,?,?)"
        connection.query(queryString,[username,password,email],(error,rows,fields)=>{
            if(error){
                console.log("failed to insert classes"+ error)
                response.sendStatus(500)
                return
            }
                response.send("successfully added user to system")
		})
	  //});
		
		console.log("The user was created succsesfuly.");
});

//Adding the personal contacts to the server using SQL queries*****
app.post('/personal', function(request, response) {
	var phonenumber = request.body.phonenumber;
	var address = request.body.address;
	var email = request.body.email;
	var birthday = request.body.birthday;
    
        queryString = "INSERT INTO personal (phonenumber, email, address, birthday) VALUES (?,?,?,?)"
        connection.query(queryString,[phonenumber,email,address,birthday],(error,rows,fields)=>{
            if(error){
                console.log("failed to insert contact"+ error)
                response.sendStatus(500)
                return
            }
                response.send("successfully added personal contact info")
		})
		console.log("The record is inserted.");
});

app.post('/business', function(request, response) {
	var phonenumber = request.body.phonenumber;
	var physicaladdress = request.body.physicaladdress;
	var email = request.body.email;
	var postaladdress = request.body.postaladdress;
	var vatnumber = request.body.vatnumber;
    
        queryString = "INSERT INTO business (phonenumber, email, physicaladdress, postaladdress,vatnumber) VALUES (?,?,?,?,?)"
        connection.query(queryString,[phonenumber,email,physicaladdress,postaladdress,vatnumber],(error,rows,fields)=>{
            if(error){
                console.log("failed to insert classes"+ error)
                response.sendStatus(500)
                return
            }
                response.send("successfully added business contact info")
		})
		console.log("The record is inserted.");
	
});

app.post('/personal/update', (request,response) => {
	const userId = request.body.id;
	let sql = "UPDATE personal SET phonenumber='"+request.body.phonenumber+"',email = '"+request.body.email+"', address = '"+request.body.address+"', birthday = '"+request.body.birthday+"' WHERE id = "+userId;
	let query = connection.query(sql, (error, results) => {
		if(error) throw error;
		response.redirect('/personalall.html');
	});
});

app.post('/business/update', (request,response) => {
	const userId = request.body.id;
	let sql = "UPDATE personal SET phonenumber='"+request.body.phonenumber+"',email = '"+request.body.email+"', physicaladdress = '"+request.body.physicaladdress+"', postaladdress = '"+request.body.postaladdress+"' , vatnumber = '"+request.body.vatnumber+"' WHERE id = "+userId;
	let query = connection.query(sql, (error, results) => {
		if(error) throw error;
		response.redirect('/businessall.html');
	});
});
app.listen(3000);
console.log("Server is up at 3000");