// const { Sequelize } = require('sequelize');
const { User } = require("./user");
const { Case } = require("./case");


User.hasMany( Case, {as:"cases", foreignKey:"author"} );        // user.id cannot be changed as a foreign key association
Case.belongsTo( User, {as:"user", foreignKey:"author"} );       // creates new field author

Case.sync({ alter: true })
User.sync({ alter: true })

module.exports = { User, Case }