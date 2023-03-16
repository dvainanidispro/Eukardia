/* jshint esversion: 11 */

// remember that hanldebars has access to res.locals

/** Middleware for making page info (title, h1 text, buttons text) available to a view */ 
module.exports.pageinfo = (req,res,next) =>{
    let path = req.baseUrl + req.path;      // path without get parameters
    let titles = {
        "/":"ΕΥΚΑΡΔΙΑ",
        "/dataentryform" : "ΕΥΚΑΡΔΙΑ - Καταχώριση περιστατικού",
        "/newcase" : "ΕΥΚΑΡΔΙΑ - Καταχώριση περιστατικού",
        "/viewcase" : "ΕΥΚΑΡΔΙΑ - Περιστατικό",
        "/searchcase" : "ΕΥΚΑΡΔΙΑ - Αναζήτηση περιστατικών",
        "/editcase" : "ΕΥΚΑΡΔΙΑ - Επεξεργασία περιστατικού",
        "/statistics": "ΕΥΚΑΡΔΙΑ - Συγκεντρωτικά στοιχεία",
        "/usage": "ΕΥΚΑΡΔΙΑ - Ενεργοί χρήστες",
        "/info": "ΕΥΚΑΡΔΙΑ - Πληροφορίες εφαρμογής",
    };
    res.locals.pagetitle = titles[path]??"ΕΥΚΑΡΔΙΑ";  // handlebars' title is the locals.title

    if (path=="/dataentryform" || path=="/newcase"){
        res.locals.h1 = "Καταχώριση νέου περιστατικού";
        res.locals.submitlabel = "Καταχώριση περιστατικού";
        res.locals.editcase = false;
    } else if (path=="/editcase") {
        res.locals.h1 = "Επεξεργασία περιστατικού";
        res.locals.submitlabel = "Ενημέρωση περιστατικού";
        res.locals.editcase = true;     //used by handlebars later to know if "new" case or "edit" case
    } else {
        res.locals.h1 = "ΕΥΚΑΡΔΙΑ";
    }

    next();
};
