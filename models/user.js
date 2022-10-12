const { DataTypes } = require('sequelize');
const { db } = require("../database.js"); 

let User = db.define('user', {
    // Model attributes are defined here
    user_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING
      // allowNull defaults to true
    }
}, {
    tableName: 'users',
    timestamps: false 
  });


let getUserRoles = async (userID) => {
    let users = await User.findAll({
        attributes: [ "user_id" , "name", "role" ],
        where: { user_id: userID },
        // raw: true, // I have set it in global settings
        // nest: true, // works in flattened objects... 
      });
    return users.map(user=>user.role);
}
// getUserRoles("auth0|62f555e24c7ec8bba7e6ede0").then((data)=>console.log(data));

module.exports = { User, getUserRoles };


// console.log(DataTypes.TEXT('medium'));

