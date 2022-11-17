'use strict';

let GetParameters = (parameter=null) => parameter 
? Object.fromEntries(new URLSearchParams(window.location.search).entries())[parameter] ?? null  
: Object.fromEntries(new URLSearchParams(window.location.search).entries());

let theCase = GetParameters("case")
console.log(theCase);

fetch("/getcase/"+theCase).then(answer=>answer.json()).then((answer)=>{
    
    let created = new Date(answer.createdAt);
    let updated = new Date(answer.updatedAt);

    answer.createdAt = created.toLocaleString("EL-gr");
    answer.updatedAt = updated.toLocaleString("EL-gr");
    console.log(answer);
    Q("#answer").innerHTML = JSON.stringify(answer, null, 4);
})
