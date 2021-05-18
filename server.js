const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table')

// Connection properties to sql database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'yourRootPassword',
    database: 'employee_DB'
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
        .then((answer) => {
            // Switch case depending on user option
            switch (answer.action) {
                case "View all employees":
                    viewAllEmp();
                    break;
                case "View all employees by role":
                    viewAllEmpByRole();
                    break;
                case "View all employees by department":
                    viewAllEmpByDept();
                    break;
                case "View all employees by manager":
                    viewAllEmpByMngr();
                    break;
                case "Add employee":
                    addEmp();
                    break;
                case "Add role":
                    addRole();
                    break;
                case "Add department":
                    addDept();
                    break;
                case "Update employee role":
                    updateEmpRole();
                    break;
                case "Update employee manager":
                    updateEmpMngr();
                    break;
                case "Delete employee":
                    deleteEmp();
                    break;
                case "Delete role":
                    deleteRole();
                    break;
                case "Delete department":
                    deleteDept();
                    break;
                case "View department budgets":
                    viewDeptBudget();
                    break;
            }
        });    
    }

// View all employees in the database
function viewAllEmp(){
    // Query to view all employees
    var query = "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC";
    // Query from connection
    connection.query(query, function(err, res) {
        if(err) return err;
        console.log("\n");
        // Display query results using console.table
        console.table('All Employees: ', res);
        //Back to main menu
        options();
    });
}