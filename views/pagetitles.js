/** Middleware for making page info available to a view */ 
module.exports.pagetitle = (req,res,next) =>{
    let titles = {
        "/":"ΕΥΚΑΡΔΙΑ",
        "/dataentryform":"ΕΥΚΑΡΔΙΑ - Καταχώριση περιστατικών",
        "/viewcase":"ΕΥΚΑΡΔΙΑ - Περιστατικό",
        "/searchcase":"ΕΥΚΑΡΔΙΑ - Αναζήτηση περιστατικών",
    }
    let path = req.baseUrl + req.path;      // path without get parameters
    res.locals.pagetitle = titles[path]??"ΕΥΚΑΡΔΙΑ";  // handlebarst title is the locals.title
    next();
};
