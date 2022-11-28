/** Middleware for making page info available to a view */ 
module.exports.pagetitle = (req,res,next) =>{
    let titles = {
        "/":"ΕΥΚΑΡΔΙΑ",
        "/dataentryform":"ΕΥΚΑΡΔΙΑ - Καταχώριση περιστατικού",
        "/viewcase":"ΕΥΚΑΡΔΙΑ - Περιστατικό",
        "/searchcase":"ΕΥΚΑΡΔΙΑ - Αναζήτηση περιστατικών",
        "/editcase":"ΕΥΚΑΡΔΙΑ - Επεξεργασία περιστατικού",
    }
    let h1 = {
        "/dataentryform":"Καταχώριση νέου περιστατικού",
        "/editcase":"Επεξεργασία περιστατικού",
    };
    let path = req.baseUrl + req.path;      // path without get parameters
    res.locals.pagetitle = titles[path]??"ΕΥΚΑΡΔΙΑ";  // handlebarst title is the locals.title
    res.locals.h1 = h1[path]??"ΕΥΚΑΡΔΙΑ";  // handlebarst title is the locals.title
    next();
};
