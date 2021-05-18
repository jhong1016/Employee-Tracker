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

// Prompt user to choose an option
function options() {
    inquirer
    .prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            "View all employees",
            "View all employees by role",
            "View all employees by department",
            "View all employees by manager",
            "Add employee",
            "Add role",
            "Add department",
            "Update employee role",
            "Update employee manager",
            "Delete employee",
            "Delete role",
            "Delete department",
            "View department budgets"
          ]
        })
    }