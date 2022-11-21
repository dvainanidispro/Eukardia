'use strict';

let GetParameters = (parameter=null) => parameter 
? Object.fromEntries(new URLSearchParams(window.location.search).entries())[parameter] ?? null  
: Object.fromEntries(new URLSearchParams(window.location.search).entries());

let theCase = GetParameters("case")
console.log(theCase);

function tableFromObject(caseObject){
    let rows = '';
    let head = `
        <thead>
            <tr>
            <th scope="col">Πεδίο</th>
            <th scope="col">Τιμή</th>
            </tr>
        </thead>`;
    for (const [key,value] of Object.entries(caseObject)){
        const val = value?value:""; //κενό αντί για null
        rows+=`<tr><td>${key}</td><td>${val}</td></tr>`;
    }
    return `
        <table class="table table-striped">
                ${head}
            <tbody>
                ${rows}
            </tbody>
        </table>`;
}




fetch("/getcase/"+theCase).then(answer=>answer.json()).then((answer)=>{
    
    let created = new Date(answer.createdAt);
    let updated = new Date(answer.updatedAt);

    answer.createdAt = created.toLocaleString("EL-gr");
    answer.updatedAt = updated.toLocaleString("EL-gr");
    console.log(answer);
    // Q("#case").innerHTML = JSON.stringify(answer, null, 4);
    Q('#case').innerHTML = tableFromObject(answer);

    Q("#mainframe").classList.remove("d-none")

})
