// const { Sequelize } = require('sequelize');
const { User } = require("./user");
const { Case } = require("./case");


User.hasMany( Case, {as:"cases", foreignKey:"author"} );        // associated to user.id (cannot be changed)
Case.belongsTo( User, {
    as: "user", 
    foreignKey: "author",
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'        // Δεν έπιασαν από εδώ, ήθελε χειροκίνητα από το workbench.  
} );       // creates new field author


// if you sync tables all at once, there will be "locked tables" issues...
async function syncTables(){   
    await User.sync({ alter: true });
    await Case.sync({ alter: true });
    console.log(`\x1b[35m All database models were synchronized.\x1b[0m`);
}

syncTables();

module.exports = { User, Case }