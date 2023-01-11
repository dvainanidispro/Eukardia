const { Sequelize } = require('sequelize');
// require('dotenv').config();   // comment out when using web server (needs when testing db without web server)

/** The database connection using Sequelize */
db = new Sequelize(
    process.env.DATABASENAME, 
    process.env.DATABASEUSERNAME, 
    process.env.DATABASEPASSWORD, 
    {
        host: process.env.DATABASEHOST,
        dialect: process.env.DATABASEDIALECT,
        // στο παρακάτω έβαλα 'mariadb' διότι το process.env.DATABASEDIALECT δεν έπαιζε...
        dialectModule: (process.env.vercel!=="true") ? null : require('mariadb'), 
        // dialectOptions: {
        //     encrypt: true
        // },
        timezone: "Europe/Athens",                         // greek time, for writing to database   
        query: { raw: true },       // returns queries as simple JSON objects
        logging: false,         // does not console log things...
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 300000
          },
        retry: { max: 3 },
    }
);





/** Returns a promise - resolves if the database is succesfully connected */
databaseConnectionTest = (DbConnection) => {
    return new Promise(async (resolve, reject) => {
        try{
            await DbConnection.authenticate();
            console.log(`\x1b[35m Database connection to ${process.env.DATABASEHOST}\\${process.env.DATABASENAME} (${process.env.DATABASEDIALECT}) has been established successfully.\x1b[0m`);
            resolve();
        } catch (error) {
            console.error(`\x1b[31m Unable to connect to the database:`, error);
            reject();
        }
    });
};

module.exports = { db , databaseConnectionTest }
