const mysql = require('mysql2/promise');

// create the connection to database

const getMysqlInstance=async()=>{
    try {
        const connection =await mysql.createConnection({
          host: 'localhost',
          user: process.env.DATABASE_USER,
          database: process.env.DATABASE_NAME,
          password:process.env.DATABASE_PASSWORD,
          port:3306
        });
        return connection;
    } catch (error) {
        throw error;
    }
}

module.exports = {getMysqlInstance }