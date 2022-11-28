'use strict';



/***************************      PACKAGES & EXPRESS BOILERPLATE           ***************************/ 

require('dotenv').config();
const express = require('express');
const server = express();
// let isDev = (process.env.ENVIRONMENT == "Development");
/** Safer path of the folder when app runs from another directory */
let folder = (path)=>__dirname+"/"+path;
// vercel supports only the old command (runs the express app from another directory!)

// grab post/put variables, json objects and send static files
server.use(express.urlencoded({extended: false})); 
server.use(express.json());
server.use(express.static(__dirname + '/public'));     
// vercel supports only the old command (runs the express app from another directory!)


// handlebars config
const { create } = require ('express-handlebars');
const handlebarsConfig = { /* config */
    extname: '.hbs',    // extension for layouts 
    layoutsDir: __dirname + '/views',
    defaultLayout: 'main',
    helpers: __dirname + '/views',
    partialsDir: __dirname + '/views',
};
server.engine('hbs', create(handlebarsConfig).engine);       // πρακτικά, create({obj})=engine()
server.set('view engine', 'hbs');
server.set('views', __dirname + '/views');


// Database and models
const { db, databaseConnectionTest } = require('./database');
const { clearObject } = require('./models/typeConversion');
const Models = require('./models/models');


// Authentication, Authorization 
const { auth, requiresAuth } = require('express-openid-connect');
const { auth0config, userinfo } = require('./auth');
// auth router attaches /login, /logout, and /callback routes to the baseURL
server.use(auth(auth0config));

/** Requires authentication before visiting the page */
let authentication = requiresAuth;
/*
let authentication;
if (isDev){
    authentication = () => (req,res,next)=>{next()};
} else {
    authentication = requiresAuth;
}
*/


// MIDDLEWARE
let { pagetitle } = require('./views/pagetitles');







/*******************             ROUTES             ***********************/ 

// homepage
server.get('/', pagetitle, userinfo, (req,res)=>res.render('index'));

// after login, goto updateprofile
server.get('/login', (req,res) => res.oidc.login({ returnTo:'/updateprofile' }));

// update user profile on database after login
server.get('/updateprofile', authentication(), (req, res) => {
    res.redirect('/');      // redirect to index.html
    let user = req.oidc.user;
    const userInfo = Models.User.upsert({       // upsert: create or update if already exists!
        id:user.sub,
        name:user.name,
        entity:user.entity,
        roles:JSON.stringify(user.positions)
    });      
});

// send ID token, used only for testing now
server.get('/profile', userinfo, (req, res) => {
    res.send(JSON.stringify(res.locals.user));  // IdToken
});



// access to form (only  authenticated users)
server.get('/dataentryform*', pagetitle, authentication(), userinfo, async (req,res)=>{
    if (/*isDev ||*/ req.oidc.isAuthenticated()) {       // if user has logged in
        res.render('dataentryform');
    } else {
        res.status(403).sendFile(__dirname + '/public/403.html');
    }
});

// submit data (only authenticated users)
server.post('/submitdata', authentication(), async (req,res)=>{
    let dataRecieved = clearObject(req.body);
    dataRecieved.author = req?.oidc?.user?.sub ?? "testUser";
    // console.log(dataRecieved);
    let record = await Models.Case.create(dataRecieved);
    res.redirect("/viewcase?case="+record.id);
});



// access to form (only authenticated users)
server.get('/viewcase*', pagetitle, authentication(), async (req,res)=>{
    if (/*isDev ||*/ req.oidc.isAuthenticated()) {       // if user has logged in
        res.render('viewcase');
    } else {
        res.status(403).sendFile(__dirname + '/public/403.html');
    }
});

// check patient id for duplicates data (only authenticated users)
server.get('/checkforduplicate/:patientid', authentication(), async (req,res)=>{
    Models.Case.findOne({where:{patientId:req.params.patientid}}).then((found)=>{
        res.send(!!found);
    });
});

// get case by id
server.get('/getcase/:id', authentication(), async (req,res)=>{
    let reqId = req.params.id;
    let userEntity = req?.oidc?.user?.entity;
    let [sqlSelect,metadata] = await db.query(`SELECT * FROM eukardia.casesview WHERE id="${reqId}" AND entity="${userEntity}"`);
    let requestedCase = sqlSelect[0];
    // let requestedCase = await Models.Case.findOne({where:{id:req.params.id},include:{model:Models.User,as:'user',where:{entity:userEntity}}});
    // delete requestedCase.author;
    res.send(JSON.stringify(requestedCase));
});
// get cases by patientid
server.get('/getpatient/:patientid', authentication(), async (req,res)=>{
    let requestedCases = await Models.Case.findAll({where:{patientid:req.params.patientid}});   // TODO: Only same entity
    res.send(JSON.stringify(requestedCases));
});


// search cases by id or patientId
server.get('/searchcase', pagetitle, authentication(), async (req,res)=>{
    res.render('searchcase');
});

// access to form (only authenticated users)
server.get('/editcase*', pagetitle, authentication(), async (req,res)=>{
        let caseId = '';
        res.render('dataentryform');
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
}).finally(()=>{
    // startWebServer(server,port,listeningURL);
});
