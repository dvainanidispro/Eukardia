/* jshint strict:global , esversion: 11 */
'use strict';



//***************************      PACKAGES & EXPRESS BOILERPLATE           ***************************// 

require('dotenv').config();
const express = require('express');
const server = express();
// let isDev = (process.env.ENVIRONMENT == "Development");
/** Safer path of the folder when app runs from another directory */
// let folder = (subfolder)=>__dirname+"/"+subfolder;
// vercel supports only the old command (runs the express app from another directory!)
// __dirname: directory of server.js - static(folder): directory that runs the "node server.js" command

// grab post/put variables, json objects and send static files
server.use(express.urlencoded({extended: false})); 
server.use(express.json());
server.use(express.static(__dirname + '/public'));     
// vercel supports only the old command (runs the express app from another directory!)


//Dimitris standard security  
server.use(require('./security.js'));

// Handlebars config
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
const { auth0config, userinfo, lmr } = require('./auth');
// auth router attaches /login, /logout, and /callback routes to the baseURL
server.use(auth(auth0config));

/** Requires authentication before visiting the page. If not, redirect to login */
let authentication = requiresAuth;



// MIDDLEWARE
let { pageinfo } = require('./views/pageinfo');

/** Helper function to shorten the longer function: (req,res) => res.render('view') */
let render = (view,params={}) => (req,res) => res.render(view,params);







//*******************             ROUTES             ***********************// 

// homepage
server.get('/', pageinfo, userinfo, render('index'));

// after login, goto updateprofile (custom function istead of default auth0's /login)
server.get('/login', (req,res) => res.oidc.login({ returnTo:'/updateprofile' }));

// update user profile on database after login
server.get('/updateprofile', authentication(), async (req,res) => {
    res.redirect('/');      // redirect to index.html
    let user = req.oidc.user;
    const [record,created] = await Models.User.upsert({       // upsert: create or update if already exists! needs await!
        id:user.sub,
        name:user.name,
        entity:user.entity,
        roles:JSON.stringify(user.positions)
    });
    // Ενώ το create επιστρέφει την εγγραφή, ενώ το upsert επστρέφει array [εγγραφή,ανδημιουργήθηκε]...   
});

// send ID token, used only for testing now, because it doesn't need statics or views
server.get('/profile', userinfo, (req,res) => {
    res.send(JSON.stringify(res.locals.user));  // IdToken
});



// access to "submit" form (only authenticated users)
server.get(['/dataentryform*','/newcase*'], pageinfo, authentication(), userinfo, lmr, render('dataentryform'));

// access to "update" form (only authenticated users)
server.get('/editcase*', pageinfo, authentication(), userinfo, lmr, render('dataentryform'));


// submit data (only authenticated users)
// * todo maybe: split into 2: post (create) and put (update)...maybe not!
server.post('/submitdata', authentication(), async (req,res)=>{
    let dataRecieved = clearObject(req.body);
    let recordId = dataRecieved?.id ?? null;
    dataRecieved.author = req?.oidc?.user?.sub ?? "testUser";
    // console.log(dataRecieved);

    let statusCode = 200; // 201 created or 200/204 OK
    if (!recordId){ // new record
        let record = await Models.Case.create(dataRecieved);        
        recordId = record.id;
        statusCode = 201;
    }  else if (recordId) {       // update record
        let userEntity = req?.oidc?.user?.entity;
        // First, check if user is allowed to update
        let [sqlSelect,metadata] = await db.query(`SELECT * FROM eukardia.casesview WHERE id="${recordId}" AND entity="${userEntity}"`);
        let modifiedCase = sqlSelect[0];    // when no results: sqlSelect is an empty array [] and sqlSelect[0] is undefined
        if (modifiedCase?.id==recordId) {            // recordId always valid here. modifiedCase?.id = "undefined without error" when not allowed. 
            if (!dataRecieved.testPatient) {dataRecieved.testPatient=0}     // Τα checkboxes δεν στέλνονται αν είναι unchecked! Ενώ θα θέλαμε να έρχεται 0. 
            let [record,created] = await Models.Case.upsert(dataRecieved,{returning:true});     
            // update needs "where" - upsert just updates! (trick για συντομότερο κώδικα)
            statusCode = 204;
        } else {
            res.status(403).render('403');
            return; 
        }
    }
    res.redirect("/viewcase?case="+recordId);
    // res.redirect(statusCode, "/viewcase?case="+recordId);    // Αν το redirect δεν έχει 3xx, ο browser αρνείται να το ακολουθήσει. 
});



// access to cases (only authenticated users)
server.get('/viewcase*', pageinfo, authentication(), userinfo, lmr, render('viewcase'));

// search cases by id or patientId
server.get('/searchcase', pageinfo, authentication(), userinfo, lmr, render('searchcase'));

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
    let requestedCase = sqlSelect[0];       // when no results: sqlSelect is an empty array [] and sqlSelect[0] is undefined
    if (!requestedCase) {res.status(404).send('Case not found or you do not have the permissions to see it')}
    // delete requestedCase.author;
    res.send(JSON.stringify(requestedCase));
});
// get cases by patientid
server.get('/getpatient/:patientid', authentication(), async (req,res)=>{
    let patientid = req.params.patientid;
    let userEntity = req?.oidc?.user?.entity;
    let [requestedCases,metadata] = await db.query(`SELECT * FROM eukardia.casesview WHERE patientId="${patientid}" AND entity="${userEntity}"`);
    res.send(JSON.stringify(requestedCases)); // requestedCases = a (possibly empty) array
});


// statistics page
server.get('/statistics', pageinfo, authentication(), userinfo, render('statistics'));
// get statistics table
server.get('/getstatistics', authentication(), async (req,res)=>{
    let [view,metadata] = await db.query(`SELECT * FROM eukardia.statistics`);
    res.send(JSON.stringify(view));
});

// secret page for administrators
server.get('/usage', pageinfo, authentication(), userinfo, lmr, render('usage'));

// info page
server.get('/info', pageinfo, userinfo, render('info'));

// how-to page
server.get('/howto', pageinfo, authentication(), userinfo, render('howto'));






//***************************         START WEB SERVER         ***************************//

const startWebServer = (server,port,listeningURL="http://localhost") => {
    server.listen(port, () => {
        let presentTime = new Date().toLocaleString('el-GR',{hour12: false});
        console.log(`\x1b[35m Server is listening at \x1b[4m ${listeningURL}:${port} \x1b[0m\x1b[35m. Started at: ${presentTime}. \x1b[0m`);
    });
};

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

