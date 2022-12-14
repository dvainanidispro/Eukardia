const { DataTypes } = require('sequelize');
const { db } = require("../database.js"); 

let User = db.define('user', {
    // Model attributes are defined here
    id: {
      primaryKey: true,
      type: DataTypes.STRING,           // μπορεί να μην το πιάσει από εδώ, ειδικά αν τα υπάρχοντα data δεν είναι ΟΚ αλλά μόνο από το workbench... 
      allowNull: false
    },
    name: DataTypes.STRING,
    entity: DataTypes.STRING,
    roles: DataTypes.STRING,
}, {
    tableName: 'users',
    // timestamps: false 
  });


let getUserRoles = async (userID) => {
    let users = await User.findAll({
        attributes: [ "user_id" , "name", "roles" ],
        where: { user_id: userID },
        // raw: true, // I have set it in global settings
        // nest: true, // works in flattened objects... 
      });
    return users.map(user=>user.role);
}
// getUserRoles("auth0|62f555e24c7ec8bba7e6ede0").then((data)=>console.log(data));

// Models.User.create({id:"newtest",name:"New Name", entity: "New Entity"});        // it works!

module.exports = { User, getUserRoles };


// console.log(DataTypes.TEXT('medium'));

