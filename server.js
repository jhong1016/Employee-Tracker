const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const promisemysql = require('promise-mysql');

// Connection properties to sql database
const connectionProperties = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'yourRootPassword',
    database: 'employee_DB'
};

// Creating Connection
const connection = mysql.createConnection(connectionProperties);

// Connection to sql server and sql database
connection.connect((err) => {
    if (err) throw err;
    // Start main menu function
    console.log("\n Welcome to Employee Tracker \n");
    options();
});

// Main Menu - Prompt user to choose an option
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
        // Back to main menu
        options();
    });
}

// view all employees by role
function viewAllEmpByRole(){
    // Set global array to store all roles
    var roleArr = [];
    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {
        // Query all roles
        return conn.query('SELECT title FROM role');
    }).then(function(roles){
        // Place all roles within the roleArr
        for (i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }
    }).then(() => {
        // Prompt user to select a role
        inquirer.prompt({
            name: "role",
            type: "list",
            message: "Select a role",
            choices: roleArr
        })    
        .then((answer) => {
            // Query all employees by selected role
            const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE role.title = '${answer.role}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if(err) return err;
                // Show results using console.table
                console.log("\n");
                console.table(res);
                // Back to main menu
                options();
            });
        });
    });
}

// View all employees by department
function viewAllEmpByDept(){
    // Set global array to store departments
    var deptArr = [];
    // Create new connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {
        // Query all departments
        return conn.query('SELECT name FROM department');
    }).then(function(value){
        // Place all names within deptArr
        deptQuery = value;
        for (i=0; i < value.length; i++){
            deptArr.push(value[i].name);
        }
    }).then(() => {
        // Prompt user to select department from array of departments
        inquirer.prompt({
            name: "department",
            type: "list",
            message: "Select a department",
            choices: deptArr
        })    
        .then((answer) => {
            // Query all employees depending on selected department
            const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title, department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.name = '${answer.department}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if(err) return err;
                // Show results in console.table
                console.log("\n");
                console.table(res);
                // Back to main menu
                options();
            });
        });
    });
}

// View all employees by manager
function viewAllEmpByMngr(){
    // Set manager array
    var managerArr = [];
    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {
        // Query all employees
        return conn.query("SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Inner JOIN employee m ON e.manager_id = m.id");
    }).then(function(managers){
        // Place all employees in array
        for (i=0; i < managers.length; i++){
            managerArr.push(managers[i].manager);
        }
        return managers;
    }).then((managers) => {
        inquirer.prompt({
            // Prompt user of manager
            name: "manager",
            type: "list",
            message: "Select a manager",
            choices: managerArr
        })    
        .then((answer) => {
            let managerID;
            // Get ID of manager selected
            for (i=0; i < managers.length; i++){
                if (answer.manager == managers[i].manager){
                    managerID = managers[i].id;
                }
            }
            // Query all employees by selected manager
            const query = `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager
            FROM employee e
            LEFT JOIN employee m ON e.manager_id = m.id
            INNER JOIN role ON e.role_id = role.id
            INNER JOIN department ON role.department_id = department.id
            WHERE e.manager_id = ${managerID};`;
            connection.query(query, (err, res) => {
                if(err) return err;
                // Display results with console.table
                console.log("\n");
                console.table(res);
                // Back to main menu
                options();
            });
        });
    });
}

// Add employee
function addEmp(){
    // Create two global arrays to hold 
    var roleArr = [];
    var managerArr = [];
    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {
        // Query all roles and managers, pass as a promise
        return Promise.all([
            conn.query('SELECT id, title FROM role ORDER BY title ASC'), 
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
        ]);
    }).then(([roles, managers]) => {
        // Place all roles in array
        for (i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }
        // Place all managers in array
        for (i=0; i < managers.length; i++){
            managerArr.push(managers[i].Employee);
        }
        return Promise.all([roles, managers]);
    }).then(([roles, managers]) => {
        // Add option for no manager
        managerArr.unshift('--');
        inquirer.prompt([
            {
                // Prompt user of their first name
                name: "firstName",
                type: "input",
                message: "First name: ",
                // Validate field is not blank
                validate: function(input){
                    if (input === ""){
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                // Prompt user of their last name
                name: "lastName",
                type: "input",
                message: "Last name: ",
                // Validate field is not blank
                validate: function(input){
                    if (input === ""){
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else {
                        return true;
                    }
                }
            },
            {
                // Prompt user of their role
                name: "role",
                type: "list",
                message: "What is their role?",
                choices: roleArr
            },
            {
                // Prompt user for manager
                name: "manager",
                type: "list",
                message: "What is their manager's ID?",
                choices: managerArr
            }]).then((answer) => {
                // Set variable for IDs
                let roleID;
                // Default Manager value as null
                let managerID = null;
                // Get ID of role selected
                for (i=0; i < roles.length; i++){
                    if (answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }
                // Get ID of manager selected
                for (i=0; i < managers.length; i++){
                    if (answer.manager == managers[i].Employee){
                        managerID = managers[i].id;
                    }
                }
                // Add employee
                connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ("${answer.firstName}", "${answer.lastName}", ${roleID}, ${managerID})`, (err, res) => {
                    if(err) return err;
                    // Confirm employee has been added
                    console.log(`\n EMPLOYEE ${answer.firstName} ${answer.lastName} ADDED...\n `);
                    options();
                });
            });
    });
}

// Add Role
function addRole(){
    // Create department array
    var departmentArr = [];
    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {
        // Query all departments
        return conn.query('SELECT id, name FROM department ORDER BY name ASC');
    }).then((departments) => {
        // Place all departments in array
        for (i=0; i < departments.length; i++){
            departmentArr.push(departments[i].name);
        }
        return departments;
    }).then((departments) => {
        inquirer.prompt([
            {
                // Prompt user role title
                name: "roleTitle",
                type: "input",
                message: "Role title: ",
            },
            {
                // Prompt user for salary
                name: "salary",
                type: "number",
                message: "Salary: ",
            },
            {   
                // Prompt user to select which department role falls under
                name: "department",
                type: "list",
                message: "Department: ",
                choices: departmentArr
            }]).then((answer) => {
                // Set department ID variable
                let deptID;
                // Get selected department ID
                for (i=0; i < departments.length; i++){
                    if (answer.dept == departments[i].name){
                        deptID = departments[i].id;
                    }
                }
                // Added role to role table
                connection.query(`INSERT INTO role (title, salary, department_id)
                VALUES ("${answer.roleTitle}", ${answer.salary}, ${deptID})`, (err, res) => {
                    if(err) return err;
                    console.log(`\n ROLE ${answer.roleTitle} ADDED...\n`);
                    options();
                });
            });
    });
}

// Add Department
function addDept(){
    inquirer.prompt({
        // Prompt user for name of department
        name: "departmentName",
        type: "input",
        message: "Department Name: ",
    }).then((answer) => {
        // Add department to role table
        connection.query(`INSERT INTO department (name)VALUES ("${answer.deptName}");`, (err, res) => {
            if(err) return err;
            console.log("\n DEPARTMENT ADDED...\n ");
            options();
        });
    });
}
