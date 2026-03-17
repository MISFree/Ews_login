 const sql = require('mssql');

const dbConfig = {
  user: 'My_login',
  password: 'Ampl@12345',
  server: '172.16.3.200',
  database: 'RISK_EWS',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

module.exports = {
  sql,
  dbConfig
};