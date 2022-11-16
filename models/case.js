const { DataTypes } = require('sequelize');
const { db } = require("../database.js"); 

const Case = db.define('Case', {
    
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true    
    },
    // author is a foreign key, so we define it ONLY in relationships (models.js), or else fields should only be the default: case\userid
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

    gender: DataTypes.TINYINT,
    age: DataTypes.TINYINT,

    drugbp: DataTypes.BOOLEAN,
    sbp: DataTypes.FLOAT,
    dbp: DataTypes.FLOAT,
    // pressure: DataTypes.FLOAT,   TODO: Delete from form
    glucose:  DataTypes.FLOAT,
    hba1c: DataTypes.FLOAT,
    diebetes: DataTypes.BOOLEAN,

    activity: DataTypes.TINYINT,
    diet: DataTypes.TINYINT,
    alcohol: DataTypes.TINYINT,
    smoking: DataTypes.TINYINT,

    druglipids: DataTypes.BOOLEAN,
    triglycerides: DataTypes.FLOAT,
    cholesterol: DataTypes.FLOAT,
    ldl: DataTypes.FLOAT,
    hdl: DataTypes.FLOAT,
    bmi: DataTypes.FLOAT,

    crp: DataTypes.FLOAT,
    wbc: DataTypes.FLOAT,
    imt: DataTypes.FLOAT,
    ef: DataTypes.FLOAT,
    calciumscore: DataTypes.FLOAT,
    lpa: DataTypes.FLOAT,
    creatinine: DataTypes.FLOAT,
    
    artialfibrillation: DataTypes.BOOLEAN,
    heartfailure: DataTypes.BOOLEAN,
    cvd: DataTypes.BOOLEAN,
    yrcvd: DataTypes.SMALLINT,
    deathcvd: DataTypes.BOOLEAN,
    yrcvddeath: DataTypes.SMALLINT,
    familyhistory: DataTypes.BOOLEAN,

    cancer: DataTypes.BOOLEAN,
    yrcancer: DataTypes.SMALLINT,
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