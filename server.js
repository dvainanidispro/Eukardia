'use strict';



/***************************      PACKAGES & EXPRESS BOILERPLATE           ***************************/ 

require('dotenv').config();
const express = require('express');
const server = express();


// grab post/put variables, json objects and send static files
server.use(express.urlencoded({extended: false})); 
server.use(express.json());
server.use(express.static(__dirname + '/public'));      // vercel supports only the old command


// Database and models
const { db, databaseConnectionTest } = require('./database');
const {clearObject} = require('./models/typeConversion');
const Models = require('./models/models')


// Authentication, Authorization 
const { auth, requiresAuth } = require('express-openid-connect');
const { auth0config } = require('./auth');
// auth router attaches /login, /logout, and /callback routes to the baseURL
server.use(auth(auth0config));

let isDev = (process.env.ENVIRONMENT == "Development");
let authentication;
if (isDev){
    authentication = () => (req,res,next)=>{next()};
} else {
    authentication = requiresAuth;
}






/*******************             ROUTES             ***********************/ 

server.get('/profile', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? JSON.stringify(req.oidc.user) : {"guest:": "true"});  // IdToken
});

server.get('/dataentryform', authentication(), async (req,res)=>{
    if (isDev || req.oidc.isAuthenticated()) {       // if user has logged in
        // TODO: Add db record with user info
        res.sendFile(__dirname + '/public/dataentryform.html');
    } else {
        // res.status(403).send('<h1>You are not authorized to access this page</h1>');
        res.status(403).sendFile(__dirname + '/public/403.html');
    }
});

server.post('/submitdata', authentication(), async (req,res)=>{
    let dataRecieved = clearObject(req.body);
    let record;
    // console.log(dataRecieved);
    dataRecieved.author = req?.oidc?.user?.sub ?? "testUser";
    record = await Models.Case.create(dataRecieved);
    // console.log(record);    // returns the data submitted to database, so they are correct
    res.send(JSON.stringify(record));
});




/***************************         START WEB SERVER         ***************************/ 

const startWebServer = (server,port,listeningURL="http://localhost") => {
    server.listen(port, () => {
        let presentTime = new Date().toLocaleString('el-GR',{hour12: false});
        console.log(`\x1b[35m Server is listening at \x1b[4m ${listeningURL}:${port} \x1b[0m\x1b[35m. Started at: ${presentTime} \x1b[0m`);
    });
}

const port = process.env.PORT || 80;
const listeningURL = process.env.LISTENINGURL;

databaseConnectionTest(db)           // top level await is not supported everywhere... 
.then(()=>{
    startWebServer(server,port,listeningURL);
})
.catch(()=>{
    console.error(`\x1b[31m Server initiation aborted!`);
});
