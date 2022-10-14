const { DataTypes } = require('sequelize');
const { db } = require("../database.js"); 



const Case = db.define('Case', {
    
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true    
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "TestUser"
    },
    testPatient: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    patientID: {
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
  }, {
    tableName: 'cases',
  });


  Case.sync({ alter: true })

  module.exports = { Case };