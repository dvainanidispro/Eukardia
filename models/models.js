// const { Sequelize } = require('sequelize');
const { User } = require("./user");
const { Case } = require("./case");


User.hasMany( Case, {
    // associated to user.id (cannot be changed)
    as:"cases", 
    foreignKey:"author"
});        
Case.belongsTo( User, {
    as: "user", 
    foreignKey: "author",       // creates new field author (must NOT be defind in User Model)
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'        // Δεν έπιασαν από εδώ, ήθελε χειροκίνητα από το workbench.  
});       


// if you all sync tables (models) at once, there will be "locked tables" issues...
async function syncTables(){   
    return new Promise(async (resolve, reject) => {
        try{
            await User.sync({ alter: true });
            await Case.sync({ alter: true });
            resolve();
        }
        catch(e){
            console.log(e);
            reject();
        }
    });
}

syncTables()
    .then(()=>{console.log(`\x1b[35m All database models were synchronized.\x1b[0m`)})
    .catch(()=>{console.error(`\x1b[31m Error in database synchronization!`)});



module.exports = { User, Case };