const cors = require('cors')
const httpRequest = require('xmlhttprequest').XMLHttpRequest;
let cfValue;

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('certs/server.key', 'utf8');
var certificate = fs.readFileSync('certs/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

app.get('/', function(req,res){
    res.send('200');
    var json = JSON.parse(req.query.data);
    console.log("The cf value is " + json.cfValue);
  });
//   app.listen(8443,function(){
//       console.log("Received request");
//   });  

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);

// var express =  require('express');
// var app = express();
// app.use(cors());
// app.get('/', function(req,res){
//   res.send('200');
//   var json = JSON.parse(req.query.data);
//   console.log("The cf value is " + json.cfValue);
// });
// app.listen(8080,function(){
//     console.log("Received request");
// });

sendData(2500);

async function sendData(value)
{
    var data = {"cfValue": value};
    var json = JSON.stringify(data);
      
    const Http = new httpRequest();
    var url=`https://localhost:8443`;
    var postUrl = url + "?data=" + encodeURIComponent(json);

    Http.open("GET", postUrl, true);
    Http.setRequestHeader('Content-type','application/json; charset=utf-8');
    Http.send();

    Http.onreadystatechange=(e)=> { 
        console.log(Http.responseText)
    }
// const Http = new httpRequest();
// const url='http://localhost:8080/cfValue/100';
// Http.open("GET", url);
// Http.send();
// Http.onreadystatechange=(e)=>{
// console.log(Http.responseText)
}