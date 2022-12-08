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
        elements.on ??= function(event,action){elements.forEach(el=>el.addEventListener(event,action))}    // jshint ignore:line
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
    // Q('~username').set(App.user.name);
    // Q('~entity').set(App.user.entity);
    resetCSSProperties();
};

/*
fetch('/profile').then(response=>response.json()).then(profile => {
    console.debug(profile);
    App.user = profile;
    App.userType = profile.name ? 'user' : 'guest';        // jshint ignore:line
    // console.log(App.userType);
}).finally(()=>{initializeContent()});
*/


Q("#toggle-menu").on('click',function(){
    Q("#navbar").classList.toggle("d-none");
});


var GetParameters = (parameter=null) => parameter 
? Object.fromEntries(new URLSearchParams(window.location.search).entries())[parameter] ?? null  
: Object.fromEntries(new URLSearchParams(window.location.search).entries());

var Qname = (fieldName) => document.querySelector(`[name='${fieldName}']`);
var Qvalue = (fieldName,fieldValue) => document.querySelector(`[name='${fieldName}'][value='${fieldValue}']`);


let path = window.location.pathname;





if (path.includes("dataentryform")){

    Q("#naventry").style.display="none";
    
    Q("#testPatient").addEventListener("change",function(){
        Q("#testWarning").style.display = this.checked ? "block":"none";
    })


    let validateForm = (form) => {
        form.classList.add("was-validated");          // show errors using bootstrap
        form.reportValidity();    // reportValidity = CheckValidity + show validation errors using the default browser's way
    };
    
    
    // when press Enter, form is not sumbitted, but shows validation errors
    window.addEventListener('keydown', function(e) {
        if (e.keyIdentifier == 'U+000A' || e.keyIdentifier == 'Enter' || e.keyCode == 13) {         // if you press Enter
            if (e.target.nodeName == 'INPUT') {     // textarea is not an input (in textarea, Enter has another meaning)
                e.preventDefault();                 // prevent sumbit
                validateForm(Q("#dataform"));
            }
        }
    }, true);


    Q("#btnFormSubmit").on('click',function(){
        validateForm(Q("#dataform"));
        // since there is no preventDefault, form will be submitted after this. 
    });

    /* 
        Σημειώνεται ότι το το addEventListener('submit' , καθώς και το html onsubmit εκτελούνται μόνο όταν η φόρμα έχει γίνει validated σωστά.
        Αυτό σημαίνει ότι αν η φόρμα δεν γίνει validated, δεν θα εκτελεστεί τίποτα από αυτά!
    */

    let setValidation = (inputElement,value) => {
        if (value=="valid"){
            inputElement.classList.add("is-valid");
            inputElement.classList.remove("is-invalid");
            inputElement.setCustomValidity(""); // marks field as valid
        } else if (value=="invalid"){
            inputElement.classList.remove("is-valid");
            inputElement.classList.add("is-invalid");
        }
        inputElement.reportValidity();
    }

    let checkForDuplicate = async (field,path) => {
        // if field empty, do nothing
        if (field.value.trim()=="") {
            setValidation(field,"invalid");
            return null;
        } 
        let checkPath = `${path}/${field.value}`;
        let duplicateFound = "initial value";
        await fetch(checkPath).then(response=>response.text()).then(duplicate=>{
            duplicate = (duplicate=="false")?false:true;    //duplicate is text!
            if (duplicate){      
                setValidation(field,"invalid");    // marks field as invalid
                field.setCustomValidity("Διπλότυπη εγγραφή. Παρακαλώ ελέγξτε!");
                duplicateFound = true;
            } else {
                setValidation(field,"valid");
                duplicateFound = false;
            }
        });
        return duplicateFound;
    };

    Q('[role="ignore"]').on('click',function(){
        let underlyingField = Q("#"+this.getAttribute("for"));
        setValidation(underlyingField,"valid");
        underlyingField.focus();
    });

    // if not invalid (valid, or unknown), check only when changed (and loose focus)
    Q("#patientId").on('change',async function(){
        let isDuplicate = await checkForDuplicate(this,"checkforduplicate");
        if (isDuplicate) { Q("#ignorePatientId").classList.remove("d-none") }
    });
    // if invalid, check on every letter pressed
    Q("#patientId").on('input',function(){
        if (!this.checkValidity()) {checkForDuplicate(this,"checkforduplicate")};
    });



}



if (path.includes("viewcase")){


    let theCase = GetParameters("case");
    
    function tableFromObject(caseObject){
        let rows = '';
        let head = /*html*/`
            <thead>
                <tr>
                    <th scope="col">Πεδίο</th>
                    <th scope="col">Τιμή</th>
                </tr>
            </thead>`;
        for (const [key,value] of Object.entries(caseObject)){
            const val = value??""; //κενό αντί για null
            rows+=/*html*/`<tr><td>${key}</td><td>${val}</td></tr>`;
        }
        return /*html*/`
            <table class="table table-striped">
                    ${head}
                <tbody>
                    ${rows}
                </tbody>
            </table>`;
    }
    
    fetch("/getcase/"+theCase).then(answer=>answer.json())
        .then((answer)=>{
            
            let created = new Date(answer.createdAt);
            let updated = new Date(answer.updatedAt);
            answer.createdAt = created.toLocaleString("EL-gr");
            answer.updatedAt = updated.toLocaleString("EL-gr");
            
            Q('#case').innerHTML = tableFromObject(answer);
            Q("#caseframe").classList.remove("d-none");
            Q("#editBtn").href += `?case=${theCase}`;

        }).catch(e=>{
            Q('#caseerror').classList.remove("d-none");
        }).finally(()=>{
            Q('#loadingSpinner').classList.add("d-none");
            Q('#actionButtons').classList.remove("d-none");
        });

}



/* Φύλο: ${singleCase.gender=1?"Άνδρας":2?"Γυναίκα":"Άγνωστο"}<br> */

if (path.includes("searchcase")){

    Q("#navsearch").style.display="none";

    let presentCase = singleCase => {
        let greekGender = (genderNumber) => {
            if (genderNumber==1) {return "Άνδρας"}
            if (genderNumber==2) {return "Γυναίκα"}
            return "Άγνωστο";
        };
        return /*html*/ `
            <a type="button" class="btn btn-case btn-light mb-1" type="button" href="/viewcase?case=${singleCase.id}">
                ID βάσης: ${singleCase.id}<br>
                <!--Αναγνωριστικό ασθενούς: ${singleCase.patientId}<br>-->
                Φύλο: ${greekGender(singleCase.gender)}<br>
                Ηλικία: ${singleCase.age}<br>
            </a>
        `;
        // return singleCase.id;
    }
    let presentCases = allCases => {
        console.log(allCases);
        if (!allCases?.length) {return `Δεν βρέθηκαν περιστατικά με αυτό το αναγνωριστικό ή δεν έχετε δικαίωμα να τα δείτε.`}
        let presentation = `
            <p>Βρέθηκαν τα παρακάτω περιστατικά:</p>
            <div class="d-grid gap-2">`;
        allCases.forEach(singleCase=>{
            presentation += presentCase(singleCase);
        });
        presentation += `</div>`;
        return presentation;
    }

    Q("#search").on('click',function(e){
        e.preventDefault();
        let dbid = Q("#dbId").value;
        let patientid = Q("#patientId").value;  
        if ( !dbid && !patientid) {
            return;
        } else if (dbid) {
            // console.log(dbid);
            location.href = "/viewcase?case="+dbid;
        } else if (patientid) {
            Q("#searchresult").classList.add('d-none');
            Q("#loadingSpinner").classList.remove('d-none');
            fetch('/getpatient/'+patientid).then(response=>response.json()).then((answer)=>{
                // Q("#searchresult").innerHTML = answer.length;
                Q("#searchresult").innerHTML = presentCases(answer);
            }).finally(()=>{
                Q("#loadingSpinner").classList.add('d-none');
                Q("#searchresult").classList.remove('d-none');
            });
        }
    });

}




if (path.includes("editcase")){

    let theCase = GetParameters("case");
    // console.log(theCase);
    if (theCase){
        
        Q("#loadingSpinner").classList.remove('d-none');
        fetch("/getcase/"+theCase).then(answer=>answer.json())
            .then((answer)=>{
            
                let created = new Date(answer.createdAt);
                let updated = new Date(answer.updatedAt);
                answer.createdAt = created.toLocaleString("EL-gr");
                answer.updatedAt = updated.toLocaleString("EL-gr");

                for (const [key,value] of Object.entries(answer)){     // loop for objects
                        // console.log(key + " " + value);
                        if (Qname(key)) {
                            Q("#dataform")[key].value = value;
                            // console.log(Q("#dataform")[key]);
                        }
                        else if (Qvalue(key,value)){
                            Qvalue(key,value).checked = true;
                            // console.log(Qvalue(key,value));
                        }
                    };
                })
                .catch(e=>{
                    document.querySelector("main").remove();
                }).finally(()=>{
                    Q("#loadingSpinner").classList.add('d-none');
                    Q("#dataform").classList.remove('d-none');
                })


            
        }

    };
    



