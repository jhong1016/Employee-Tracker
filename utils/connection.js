const mysql = require('mysql');

// Creating Connection
class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }

    // Connection to sql server and sql database
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

// Connection properties to sql database
const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "yourRootPassword",
    database: "employee_DB"
});

module.exports = db;