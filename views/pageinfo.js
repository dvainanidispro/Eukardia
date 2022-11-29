/** Middleware for making page info available to a view */ 
module.exports.pageinfo = (req,res,next) =>{
    let path = req.baseUrl + req.path;      // path without get parameters
    let titles = {
        "/":"ΕΥΚΑΡΔΙΑ",
        "/dataentryform" : "ΕΥΚΑΡΔΙΑ - Καταχώριση περιστατικού",
        "/viewcase" : "ΕΥΚΑΡΔΙΑ - Περιστατικό",
        "/searchcase" : "ΕΥΚΑΡΔΙΑ - Αναζήτηση περιστατικών",
        "/editcase" : "ΕΥΚΑΡΔΙΑ - Επεξεργασία περιστατικού",
    }
    res.locals.pagetitle = titles[path]??"ΕΥΚΑΡΔΙΑ";  // handlebarst title is the locals.title

    if (path=="/dataentryform"){
        res.locals.h1 = "Καταχώριση νέου περιστατικού";
        res.locals.submitlabel = "Καταχώριση περιστατικού";
        res.locals.editcase = false;
    } else if (path=="/editcase") {
        res.locals.h1 = "Επεξεργασία περιστατικού";
        res.locals.submitlabel = "Ενημέρωση περιστατικού";
        res.locals.editcase = true;
    } else{
        res.locals.h1 = "ΕΥΚΑΡΔΙΑ";
    }

    next();
};
