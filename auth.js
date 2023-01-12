const { auth, requiresAuth } = require('express-openid-connect');
// const { getUserRoles } = require("./models/user");

/** auth0 configuration */
module.exports.auth0config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0SECRET,
    baseURL: process.env.AUTH0BASEURL,
    clientID: process.env.AUTH0CLIENTID,
    issuerBaseURL: 'https://eukardia.eu.auth0.com',
    routes: {
        login: false,       // use custom login, not the default. See server.get('/login')
    },
};

/** Middleware for making user info available to a view */ 
module.exports.userinfo = (req,res,next) =>{
    res.locals.user = req.oidc.isAuthenticated() ? req.oidc.user : {guest:"true"};
    next();
};



/** an object containing the active users of the app */
let CurrentUsers = {}

/** Logs/Shows the time of the last meaningfull request (lmr) so you can know if the application is active */
module.exports.lmr = (req,res,next) => {
    if (req.originalUrl=='/usage'){
        /** Maximum time difference in minutes to be considered active */
        const maxTimeDiff = -60;
        const rtf = new Intl.RelativeTimeFormat("el", { numeric: "auto" });
        let returnedUsers = {};
        for (const [person,time] of Object.entries(CurrentUsers)){
            let timeDiff = Math.round((time - new Date()) /(1000*60));    // time difference in minutes
            console.log(timeDiff);
            if (timeDiff>maxTimeDiff) {  
                returnedUsers[person] = timeDiff ? rtf.format(timeDiff,"minutes") : "Τώρα"; // αν timeDiff=0, δείξε "Τώρα"
            } 
        }
        res.locals.CurrentUsers = (Object.keys(returnedUsers).length==0) ? "Δεν υπάρχουν ενεργοί χρήστες" : JSON.stringify(returnedUsers, null, "\t");
    } else {
        let username = req.oidc.user.name;
        CurrentUsers[username] = new Date();
    }
    next();
};




/** Middleware for making user info available */ 
/*
module.exports.appRoles = {
    dataentryform: ["Developer","Admin","Dataentry","Tester"],
    submitdata: ["Developer","Datasubmitter","Tester"]
}
*/

/** auth0 authorization using ID Token */ 
// checks if any of the user's roles matches any of the resource's required roles. 
/*
module.exports.validateRoleUsingToken = (rolesArray) => (req,res,next) => {
    let roles = req.oidc.isAuthenticated() ? req.oidc.user.positions : [];
    console.log(req.oidc.user.name)
    console.log(roles);
    const hasTheRole = rolesArray.some(r=> roles.includes(r));
    if (hasTheRole) {
        next();
    } else {
        res.status(403).render('403');
    }
};
*/

/** auth0 authorization using MySQL Database */ 
// checks if any of the user's roles matches any of the resource's required roles. 
/*
module.exports.validateRoleUsingDB = (rolesArray=null) => async (req,res,next) => {
    // if (!rolesArray) {rolesArray=req.originalUrl}
    let userID = req.oidc.user.sub;
    console.log(userID + " " + req.oidc.user.name);
    let roles = await getUserRoles(userID);
    console.log(roles);
    const hasTheRole = rolesArray.some(r=> roles.includes(r));
    if (hasTheRole) {
        next();
    } else {
        res.status(403).render('403');
    }
};
*/