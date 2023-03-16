/* jshint strict:global , esversion: 11 */
'use strict';

/*
var App = {
    userType: 'guest',
    // userType: 'user',
    user:{},
};
*/

var Q = (selector) => {
    if ( selector.charAt(0)=='#' ) {  
        let element = document.querySelector(selector);    
        element.on ??= function(event,callback){element.addEventListener(event,callback);return element}    // jshint ignore:line
        element.show ??= function(showthis=true){if (showthis) {element.classList.remove('d-none')} else {element.classList.add('d-none')} }     // jshint ignore:line
        return element;
    } else {
        if (selector.charAt(0)=='~') {selector='[data-variable=' + selector.substring(1) + ']'}
        let elements = [...document.querySelectorAll(selector)];
        elements.on ??= function(event,action){elements.forEach(el=>el.addEventListener(event,action))}    // jshint ignore:line
        elements.set ??= function(content){elements.forEach(el=>el.textContent=content)}     // jshint ignore:line
        return elements;
    }
};

/** Public (window) variable for checks using the browser console */
var currentCase = {};

/** Gets the GET parameter from the URL */
var GetParameters = (parameter=null) => parameter 
    ? Object.fromEntries(new URLSearchParams(window.location.search).entries())[parameter] ?? null  
    : Object.fromEntries(new URLSearchParams(window.location.search).entries());


/** Selects the field as a DOM Object (not HTML element). 
 * For example Qfield('gender') is a RadioNodeList with 3 children!
 * Useful properties: Qfield(*).value, Qfield(*).type
 */
var Qfield = (fieldName,fieldValue=null) => {
    try{
        if (!fieldValue) {
            return Q("#dataform")?.[fieldName] ?? null;
        } else {
            return document.querySelector(`form [name='${fieldName}'][value='${fieldValue}']`);
        }
    }
    catch{return null}
    // try catch, διότι περίεργες τιμές (πχ έχουν αλλαγές γραμμών ή έχεις δώσει περίεργο όρισμα), βγάζουν error
};


/** Returns a Date/Time in a Greek format */
function greekDate(date,notime=false){
    return !notime ? (new Date(date)).toLocaleString("EL-gr",{hour12:false}):(new Date(date)).toLocaleDateString("EL-gr",{hour12:false});
}

/** the relative path of the current page */
let path = window.location.pathname;


/*
Q("#toggle-menu").on('click',function(){       //TODO: remove when menu is added
    Q("#navbar").classList.toggle("d-none");
});
*/

var calculateBMI = () => {
    /** Round to 2 decimals and always show 2 decimals, even if they are zero */
    let roundTo2 = (num) => (Math.round(num*100)/100).toFixed(2);
    if (Qfield('height').value>99) {Qfield('height').value = (Qfield('height').value/100).toFixed(2)}
    if (Qfield('weight').value=="" || Qfield('height').value=="") {return}
    Qfield('bmi').value = roundTo2( Qfield('weight').value/Math.pow(Qfield('height').value,2) );
};



Q("~currentYear").set(new Date().getFullYear());       // used in info page




if (path.includes("dataentryform") || path.includes("newcase")){

    // Q("#naventry").style.display="none";
    
    Q("#testPatient").addEventListener("change",function(){
        Q("#testWarning").show(this.checked);
    });

    Q(".calcBmi").on('input',calculateBMI);


    ////////    VALIDATE FORM    ////////

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
        Σημειώνεται ότι το το addEventListener('submit'... , καθώς και το html onsubmit εκτελούνται μόνο όταν η φόρμα έχει γίνει validated σωστά.
        Αυτό σημαίνει ότι αν η φόρμα δεν γίνει validated, δεν θα εκτελεστεί τίποτα από αυτά!
    */


    ////////    Check for duplicate petientID and show error    ////////

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
    };

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


    ////////    Ingore validation functions    ////////

    Q('[role="ignore"]').on('click',function(){
        let underlyingField = Q("#"+this.getAttribute("for"));
        setValidation(underlyingField,"valid");
        underlyingField.focus();
    });

    // if not invalid (valid, or unknown), check only when changed (and loose focus)
    Q("#patientId").on('change',async function(){
        let isDuplicate = await checkForDuplicate(this,"checkforduplicate");
        if (isDuplicate) { Q("#ignorePatientId").show(true) }
    });
    // if invalid, check on every letter pressed
    Q("#patientId").on('input',function(){
        if (!this.checkValidity()) { checkForDuplicate(this,"checkforduplicate") }
    });



}




if (path.includes("viewcase")){


    let theCase = GetParameters("case");
    

    /** Converts the Case object (key-value) to an html table */
    let tableFromObject = (caseObject,headers=["key","value"]) => {

        let head = /*html*/`
            <thead>
                <tr>
                    <th scope="col">${headers[0]}</th>
                    <th scope="col">${headers[1]}</th>
                </tr>
            </thead>`;

        let rows = '';
        for (const [key,value] of Object.entries(caseObject)){
            const val = value??""; //κενό αντί για null
            rows+=/*html*/`<tr><td>${key}</td><td>${val}</td></tr>`;
        }

        return /*html*/`
            <table class="table table-striped">
                    ${head}
                <tbody class="table-group-divider">
                    ${rows}
                </tbody>
            </table>`;

    };
    

    fetch("/getcase/"+theCase).then(answer=>answer.json())
        .then((answer)=>{

            currentCase = answer;

            answer.createdAt = greekDate(answer.createdAt);
            answer.updatedAt = greekDate(answer.updatedAt);
            
            Q('#case').innerHTML = tableFromObject(answer,["Πεδίο","Τιμή"]);
            Q("#caseframe").show(true);
            Q("#editBtn").href += `?case=${theCase}`;

        }).catch(e=>{
            Q('#caseerror').show(true);
            Q('#editBtn').show(false);
        }).finally(()=>{
            Q('#loadingSpinner').show(false);
            Q('#actionButtons').show(true);
        });

}




if (path.includes("searchcase")){

    // Q("#navsearch").style.display="none";

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
    };
    let presentCases = allCases => {
        // console.log(allCases);
        if (!allCases?.length) {return `Δεν βρέθηκαν περιστατικά με αυτό το αναγνωριστικό ή δεν έχετε δικαίωμα να τα δείτε.`}
        let presentation = `
            <p>Βρέθηκαν τα παρακάτω περιστατικά:</p>
            <div class="d-grid gap-2">`;
        allCases.forEach(singleCase=>{
            presentation += presentCase(singleCase);
        });
        presentation += `</div>`;
        return presentation;
    };

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
            Q("#searchresult").show(false);
            Q("#loadingSpinner").show(true);
            fetch('/getpatient/'+patientid).then(response=>response.json()).then((answer)=>{
                // Q("#searchresult").innerHTML = answer.length;
                Q("#searchresult").innerHTML = presentCases(answer);
            }).finally(()=>{
                Q("#loadingSpinner").show(false);
                Q("#searchresult").show(true);
            });
        }
    });

}




if (path.includes("editcase")){

    Q(".calcBmi").on('input',calculateBMI);

    let theCase = GetParameters("case");

    if (theCase){


        Q("#testPatient").addEventListener("change",function(){
            Q("#testWarning").show(this.checked);
        });
        
        Q("#loadingSpinner").show(true);
        fetch("/getcase/"+theCase).then(answer=>answer.json())
            .then((answer)=>{
                // console.log(answer);
                currentCase = answer;

                for (const [key,value] of Object.entries(answer)){     // loop for objects
                        if (value!=null && Qfield(key)) {           // το Qfield(key) είανι true σε όλα εκτός από author, entity, createdAt, updatedAt
                            // Ιδιοτροπία checkbox. Επίσης, το παρακάτω λειτουργεί μόνο αν το checkbox έχει values 0 και 1 (όχι άλλα values), διότι #.checked=true|false->1|0
                            if (Qfield(key).type=="checkbox") {Qfield(key).checked = value}     
                            else {Qfield(key).value = value}
                        } 
                    }
                })

                .catch(e=>{
                    console.log(e);
                    document.querySelector("main").remove();
                }).finally(()=>{
                    Q("#loadingSpinner").show(false);
                    Q("#dataform").show(true);
                });

        }

}
    


if (path.includes("statistics")){


    let tableFromArray = (statsArray) => {
        let sum = 0;
        let head = /*html*/`
            <thead>
                <tr >
                    <th scope="col">Φορέας</th>
                    <th scope="col">Περιστατικά</th>
                    <th scope="col" class="hide-md">Τελευταία εγγραφή</th>
                </tr>
            </thead>`;
        let rows = '';
        for (const item of statsArray){
            rows+=/*html*/`<tr>
                <td>${item.entity}</td>
                <td>${item.submittedcases}</td>
                <td class="hide-md">${greekDate(item.lastupdate,"notime")}</td>
            </tr>`;
            sum+=item.submittedcases;
        }
        let tableFooter = /*html*/`<tfoot class="table-group-divider fw-bold"><tr>
            <td>Σύνολο</td>
            <td>${sum}</td>
        </tr></tfoot>`;
        /*
            <th scope="col" class="hide-md">Τελευταία εγγραφή</th>
            <td class="hide-md">${greekDate(item.lastupdate)}</td>
        */
        return /*html*/`
            <table class="table">
                ${head}
                <tbody class="table-group-divider">
                    ${rows}
                </tbody>
                ${tableFooter}
            </table>`;
    };


    fetch("/getstatistics").then(answer=>answer.json())
    .then((answer)=>{
        // console.log(answer);  
        Q("#caseframe").show(true);
        Q("#statistics").innerHTML = tableFromArray(answer);
    }).finally(()=>{
        Q("#loadingSpinner").show(false);
    });

}
