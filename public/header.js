'use strict';

let appHeader = /*html*/`
    
    <a href="/" class="navbar-brand">
    <img src="logo.png" class="logo"/>
    <h1>ΕΥΚΑΡΔΙΑ</h1>
    <!-- <span>Logo and/or Brand Name</span> -->
    </a>
    <nav class="navbar navbar-dark">
    <ul>
        <li class="show-if-guest"><a href="/login" id="navlogin" >Σύνδεση χρήστη</a></li>
        <li class="show-if-user"><a href="/dataentryform" id="naventry" >Καταχώριση</a></li>
        <li class="show-if-user"><a href="/logout" id="navlogout" >Αποσύνδεση</a></li>
    </ul>
    </nav>
`;
document.getElementById("app-header").innerHTML = appHeader;