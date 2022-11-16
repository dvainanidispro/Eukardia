'use strict';


var App = {
    userType: 'guest',
    // userType: 'user',
    user:{},
};

var Q = (selector) => {
    if ( selector.charAt(0)=='#' ) {  
        let element = document.querySelector(selector);    
        element.on ??= function(event,callback){element.addEventListener(event,callback);return element}    // jshint ignore:line
        return element;
    } else {
        if (selector.charAt(0)=='~') {selector='[data-variable=' + selector.substring(1) + ']'}
        let elements = [...document.querySelectorAll(selector)];
        elements.set ??= function(content){elements.forEach(el=>el.textContent=content)}     // jshint ignore:line
        return elements;
    }
};


let resetCSSProperties = () => {
    let setCSS = (property,value) => {
        document.documentElement.style.setProperty(property, value);
    };
    if (App.userType=="guest"){
        setCSS('--display-if-user',"none");
        setCSS('--display-if-guest',"block");
    } else if (App.userType=="user"){
        setCSS('--display-if-user',"block");
        setCSS('--display-if-guest',"none");
    }
};

let initializeContent = () => {
    Q('~username').set(App.user.name);
    Q('~entity').set(App.user.entity);
    resetCSSProperties();
};


fetch('/profile').then(response=>response.json()).then(profile => {
    console.log(profile);
    App.user = profile;
    App.userType = profile.name ? 'user' : 'guest';        // jshint ignore:line
    console.log(App.userType);
}).finally(()=>{initializeContent()});


let validateForm = (form) => {
    form.classList.add("was-validated");          // show errors using bootstrap
    form.reportValidity();    // reportValidity = CheckValidity + show validation errors using default the browser's way
};



let path = window.location.pathname;

if (path.includes("dataentryform")){

    Q("#naventry").style.display="none";
    
    Q("#testPatient").addEventListener("change",function(){
        Q("#testWarning").style.display = this.checked ? "block":"none";
    })

    
    // when press Enter, form is not sumbitted, but shows validation errors
    window.addEventListener('keydown', function(e) {
        console.log("Enter");
        if (e.keyIdentifier == 'U+000A' || e.keyIdentifier == 'Enter' || e.keyCode == 13) {         // if you press Enter
            if (e.target.nodeName == 'INPUT') {     // textarea is not an input (in textarea, Enter must have another meaning)
                e.preventDefault();                 // prevent sumbit
                validateForm(Q("#dataform"));
            }
        }
    }, true);


    Q("#btnFormSubmit").on('click',function(){
        validateForm(Q("#dataform"));
    });
    /* Σημειώνεται ότι το το addEventListener('submit' , καθώς και το html onsubmit εκτελούνται μόνο όταν η φόρμα έχει γίνει validated σωστά.
        Αυτό σημαίνει ότι αν η φόρμα δεν γίνει validated, δεν θα εκτελεστεί τίποτα από αυτά!
    */


   
}

