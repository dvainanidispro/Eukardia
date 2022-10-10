'use strict';

// packages
require('dotenv').config();
const express = require('express');
const server = express();
const { auth, requiresAuth } = require('express-openid-connect');
const port = process.env.PORT || 80;

// grab post/put variables, json objects and send static files
server.use(express.urlencoded({extended: false})); 
server.use(express.json());

// server.use(express.static('public'));
server.use(express.static(__dirname + '/public'));      // vercel supports only the old command


/*******************       AUTHENTICATION AUTHORIZATION        ***********************/ 
// auth0 configuration
const auth0config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0SECRET,
    baseURL: process.env.AUTH0BASEURL,
    clientID: process.env.AUTH0CLIENTID,
    issuerBaseURL: 'https://eykardia.eu.auth0.com'
};
// auth router attaches /login, /logout, and /callback routes to the baseURL
server.use(auth(auth0config));

// auth0 authorization
const validateRole = (rolesArray) => (req,res,next) => {
    let roles = req.oidc.isAuthenticated() ? req.oidc.user.positions : [];
    console.log(roles)
    const hasTheRole = rolesArray.some(r=> roles.includes(r));
    if (hasTheRole) {
        next();
    } else {
        res.status(403).sendFile(__dirname + '/public/403.html');
    }
};



/*******************             ROUTES             ***********************/ 

server.get('/profile', (req, res) => {
    // console.log(JSON.stringify(req.oidc.user))
    res.send(req.oidc.isAuthenticated() ? JSON.stringify(req.oidc.user) : {"guest:": "true"});  // IdToken
});

// dataentry page
const dataentryRoles =  ["Developer","Admin","Dataentry","Tester"];
server.get('/dataentry', requiresAuth(), validateRole(dataentryRoles), (req,res)=>{
    if (req.oidc.isAuthenticated()) {       // if user has logged in
        res.sendFile(__dirname + '/public/dataentry.html');
    } else {
        // res.status(403).send('<h1>You are not authorized to access this page</h1>');
        res.status(403).sendFile(__dirname + '/public/403.html');
    }
});




/*******************          START SERVER          ***********************/ 

server.listen(port, () => {
    let presentTime = new Date().toLocaleString('el-GR',{hour12: false});
    console.log(`\x1b[35m Server is listening at \x1b[4m http://localhost:${port} \x1b[0m\x1b[35m. Started at: ${presentTime} \x1b[0m`);
  });


// module.exports = server; // for testing purposes only
