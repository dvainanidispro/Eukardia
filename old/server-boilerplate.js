const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const app = express();

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: 'a long, randomly-generated string stored in env',
    baseURL: 'http://localhost:80',
    clientID: '7lcPO0eJWTV6bxCDAcvqpj16GR2cOF2n',
    issuerBaseURL: 'https://eukardia.eu.auth0.com'
  };

// The `auth` router attaches /login, /logout
// and /callback routes to the baseURL
app.use(auth(config));

// req.oidc.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
  res.send(
    req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out'
  )
});

// The /profile route will show the user profile as JSON
app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user, null, 2));
});

app.listen(80, function() {
  console.log('Listening on http://localhost');
});