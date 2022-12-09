'use strict';
const helmet = require('helmet');


// Security headers
const SecurityHelmet = helmet({
    contentSecurityPolicy:     
        {directives: 
            {
                "script-src": ["'self'","'unsafe-inline'","ajax.googleapis.com"],
                "style-src": ["*","'unsafe-inline'"],
                "script-src-attr": ["'none'"],  // prevent scripts in (image) attributes
                "img-src": ["*"]
            },
        },
    referrerPolicy: {policy: "same-origin"},    // strict-origin-when-cross-origin (default) |  same-origin
    frameguard: {action: "deny"},               // X-Frame-Options, deny framing
    // hsts: false,                             // enable on Firebase projects 
    // crossOriginEmbedderPolicy: false,        // if true (default), everything on my page is CORS (crossorigin="anonymous")
});

const PermissionPolicy = function(req, res, next) {
    res.header('Permissions-Policy', "camera=(),microphone=(),fullscreen=*");       // do not allow these
    res.header('Access-Control-Allow-Origin', "*");       // it is safe, unless you run it on an intranet 
    next();
};


module.exports = [
    SecurityHelmet,
    PermissionPolicy
];
