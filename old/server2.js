'use strict';




/***************************      PACKAGES & EXPRESS BOILERPLATE           ***************************/ 

require('dotenv').config();
const express = require('express');
const server = express();

// grab post/put variables, json objects and send static files
server.use(express.urlencoded({extended: false})); 
server.use(express.json());
// server.use(express.static('public'));
server.use(express.static(__dirname + '/public'));      // vercel supports only the old command

// Database
const { db, databaseConnectionTest } = require("./database");

// Authentication, Authorization 
const { auth, requiresAuth } = require('express-openid-connect');
const { auth0config, appRoles, validateRoleUsingToken, validateRoleUsingDB } = require("./auth");
// auth router attaches /login, /logout, and /callback routes to the baseURL
server.use( auth(auth0config) );






/***************************           ROUTES            ***************************/ 

server.get('/profile', (req, res) => {
    // console.log(JSON.stringify(req.oidc.user))
    res.send(req.oidc.isAuthenticated() ? JSON.stringify(req.oidc.user) : {"guest:": "true"});  // IdToken
});

// dataentry page
server.get('/dataentryform', requiresAuth(), validateRoleUsingDB(appRoles.dataentryform), (req,res)=>{
    console.log(req.originalUrl)
    if (req.oidc.isAuthenticated()) {       // if user has logged in
        res.sendFile(__dirname + '/public/dataentryform.html');
    } else {
        // res.status(403).send('<h1>You are not authorized to access this page</h1>');
        res.status(403).sendFile(__dirname + '/public/403.html');
    }
});

server.post('/submitdata', requiresAuth(), validateRoleUsingDB(appRoles.submitdata),(req,res)=>{
    console.log(req.body);
    // res.status(403).sendFile(__dirname + '/public/403.html');
    res.status(200).send(`
        <h1>Προς το παρόν, δεν είναι δυνατή η καταχώριση στοιχείων</h1>
        <p>Στείλατε επιτυχώς τα παρακάτω στοιχεία στον web server, αλλά δεν καταχωρήθηκαν στη βάση:</p>
        <p>${JSON.stringify(req.body)}<p>
    `);
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


// module.exports = server; // for testing purposes only
