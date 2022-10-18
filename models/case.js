const { DataTypes } = require('sequelize');
const { db } = require("../database.js"); 

const Case = db.define('Case', {
    
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true    
    },
    // author is a foreign key, so we define it ONLY in relationships, or else fields should only be the default: case\userid
    // author: {  },                 
    testPatient: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    patientId: {
      type: DataTypes.STRING,
      allowNull: false
    },

    gender: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pressure: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    glucose: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    familyhistory: DataTypes.TEXT('medium'),
    activity: DataTypes.INTEGER,
    diet: DataTypes.TEXT('medium'),
    smoking: DataTypes.INTEGER,
    cholesterol: DataTypes.FLOAT,
    bmi: DataTypes.FLOAT,
    crp: DataTypes.FLOAT,
    whitebloodcell: DataTypes.FLOAT,
    carotid: DataTypes.FLOAT,
    ef: DataTypes.FLOAT,
    calcium: DataTypes.FLOAT,
    lpa: DataTypes.FLOAT,
    triglyceride: DataTypes.FLOAT,
    ldl: DataTypes.FLOAT,
    hdl: DataTypes.FLOAT,
    hba1c: DataTypes.FLOAT,
    diebetes: DataTypes.FLOAT,
    fibrillation: DataTypes.BOOLEAN,
    heartfailure: DataTypes.BOOLEAN,
    cancer: DataTypes.BOOLEAN,
    creatinine: DataTypes.FLOAT,
    result: {
        type: DataTypes.BOOLEAN,
        // allowNull: false
    },
    comments: DataTypes.TEXT('medium'),

  }, 
  
  {
    tableName: 'cases',
    indexes: [
    {   
        unique: true,
        fields: ['id']
    },
    {   
        fields: ['patientId']
    }
    ],
  });


    // χρειάζεται raw: true παρόλο που το έχεις και στα global settings, αλλιώς βγάζει λάθος!!!
    // Models.Case.findAll({where:{author : req?.oidc?.user?.sub ?? "auth0|6343d56a1a612a02e26d6e41"} , include: 'user', raw: true }).then(data=>console.log(data));
    // Models.User.findAll({where:{entity : "Computer Studio"} , include: 'cases', raw: true }).then(data=>console.log(data));
    // const [results, metadata] = await db.query('SELECT * from casesview WHERE userid="auth0|6343d56a1a612a02e26d6e41"');
    // console.log(results);

  module.exports = { Case };