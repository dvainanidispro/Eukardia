// const { Sequelize } = require('sequelize');
const { User } = require("./user");
const { Case } = require("./case");


User.hasMany( Case, {as:"cases", foreignKey:"author"} );        // associated to user.id (cannot be changed)
Case.belongsTo( User, {
    as:"user", 
    foreignKey:"author",
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'        // Δεν έπιασαν από εδώ, ήθελε χειροκίνητα από το workbench.  
} );       // creates new field author

Case.sync({ alter: true })
User.sync({ alter: true })

module.exports = { User, Case }