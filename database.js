const { Sequelize } = require('sequelize');
require('dotenv').config();   // comment out when using web server (needs when testing db without web server)

/** The database connection using Sequelize */
module.exports.db = new Sequelize(
    process.env.DATABASENAME, 
    process.env.DATABASEUSERNAME, 
    process.env.DATABASEPASSWORD, 
    {
        host: process.env.DATABASEHOST,
        dialect: process.env.DATABASEDIALECT,
        query:{raw:true},       // returns queries as JSON objects
        logging: false,         // does not console log things...
    }
);

/** Returns a promise if the database is succesfully connected */
module.exports.databaseConnectionTest = (DbConnection) => {
    return new Promise(async (resolve, reject) => {
        try{
            await DbConnection.authenticate();
            console.log(`\x1b[35m MySQL Connection has been established successfully.`);
            resolve();
        } catch (error) {
            console.error(`\x1b[31m Unable to connect to the database:`, error);
            reject();
        }
    });
};

