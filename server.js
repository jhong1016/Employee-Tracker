const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table')

// Connection properties to sql database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'yourRootPassword',
    database: 'employees_DB'
})

// Connection to sql server and sql database
connection.connect((err) => {
    if (err) throw err;

    // Start main menu function
    console.log("\n Welcome to Employee Tracker \n");
    options();
});