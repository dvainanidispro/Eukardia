'use strict';



/***************************      PACKAGES & EXPRESS BOILERPLATE           ***************************/ 

require('dotenv').config();
const express = require('express');
const server = express();
// let isDev = (process.env.ENVIRONMENT == "Development");


// grab post/put variables, json objects and send static files
server.use(express.urlencoded({extended: false})); 
server.use(express.json());
server.use(express.static(__dirname + '/public'));      // vercel supports only the old command


// Database and models
const { db, databaseConnectionTest } = require('./database');
const { clearObject } = require('./models/typeConversion');
const Models = require('./models/models');


// Authentication, Authorization 
const { auth, requiresAuth } = require('express-openid-connect');
const { auth0config } = require('./auth');
// auth router attaches /login, /logout, and /callback routes to the baseURL
server.use(auth(auth0config));
let authentication = requiresAuth;
/*
let authentication;
if (isDev){
    authentication = () => (req,res,next)=>{next()};
} else {
    authentication = requiresAuth;
}
*/






/*******************             ROUTES             ***********************/ 


// after login, goto updateprofile
server.get('/login', (req, res) => res.oidc.login({ returnTo: '/updateprofile' }));

// update user profile on database after login
server.get('/updateprofile', authentication(), (req, res) => {
    res.redirect('/');      // redirect to index.html
    // console.log(req.oidc.user);
    let user = req.oidc.user;
    const userInfo = Models.User.upsert({       // upsert: create or update if already exists!
        id:user.sub,
        name:user.name,
        entity:user.entity,
        roles:JSON.stringify(user.positions)
    });      
    // userInfo.save();
    // res.send(req.oidc.isAuthenticated() ? JSON.stringify(req.oidc.user) : {"guest:": "true"});  // IdToken
});

// send ID token
server.get('/profile', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? JSON.stringify(req.oidc.user) : {"guest:": "true"});  // IdToken
});



// access to dataentryform only to authenticated users
server.get('/dataentryform*', authentication(), async (req,res)=>{
    if (/*isDev ||*/ req.oidc.isAuthenticated()) {       // if user has logged in
        res.sendFile(__dirname + '/public/dataentryform.html');
    } else {
        // res.status(403).send('<h1>You are not authorized to access this page</h1>');
        res.status(403).sendFile(__dirname + '/public/403.html');
    }
});


// submit data (only authenticated users)
server.post('/submitdata', authentication(), async (req,res)=>{
    let dataRecieved = clearObject(req.body);
    dataRecieved.author = req?.oidc?.user?.sub ?? "testUser";
    // console.log(dataRecieved);
    let record = await Models.Case.create(dataRecieved);
    // let answer = await Models.Case.findOne({where:{id:record.id}});
    // console.log(record);    // returns the data submitted to database, so they are correct
    // res.send(JSON.stringify(answer));
    res.redirect("/viewcase.html?case="+record.id);
});



// check patient id for duplicates data (only authenticated users)
server.get('/checkforduplicate/:patientid', authentication(), async (req,res)=>{
    Models.Case.findOne({where:{patientId:req.params.patientid}}).then((found)=>{
        res.send(!!found);
    });
});

// search cases by id or by patintid
server.get('/getcase/:id',authentication(), async (req,res)=>{
    let requestedCase = await Models.Case.findOne({where:{id:req.params.id}});
    delete requestedCase.author;
    res.send(JSON.stringify(requestedCase));
});
server.get('/getpatient/:patientid',authentication(), async (req,res)=>{
    let requestedCases = await Models.Case.findAll({where:{patientid:req.params.patientid}});
    res.send(JSON.stringify(requestedCases));
});










/***************************         START WEB SERVER         ***************************/ 

const startWebServer = (server,port,listeningURL="http://localhost") => {
    server.listen(port, () => {
        let presentTime = new Date().toLocaleString('el-GR',{hour12: false});
        console.log(`\x1b[35m Server is listening at \x1b[4m ${listeningURL}:${port} \x1b[0m\x1b[35m. Started at: ${presentTime}. \x1b[0m`);
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
