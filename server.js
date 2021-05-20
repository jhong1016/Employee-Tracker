const inquirer = require('inquirer');
const mysql = require('mysql');
const consoleTable = require('console.table');
const logo = require('asciiart-logo');

// Displays logo when user npm starts
displayLogo();
function displayLogo() {
    console.log(
        logo({
            name: 'Employee Tracker System',
            lineChars: 10,
            padding: 2,
            margin: 3,
            borderColor: 'grey',
            logoColor: 'white',
            textColor: 'white',
        })
        .render()
    );
}

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

// // Main Menu - Prompt user to choose an option
function runApp() {
    inquirer.prompt({
        name: "mainmenu",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "Edit Employee Info",
            "View Roles",
            "Edit Roles",
            "View Departments",
            "Edit Departments"
        ]
    }).then(responses => {
        // Switch case depending on user option
        switch (responses.mainmenu) {
            case "View All Employees":
                showEmployeeSummary();
                break;
            case "Edit Employee Info":
                editEmployeeOptions();
                break;
            case "View Roles":
                showRoleSummary();
                break;
            case "Edit Roles":
                editRoleOptions();
                break;
            case "View Departments":
                showDepartments();
                break;
            case "Edit Departments":
                editDepartmentOptions();
                break;
        }
    });
}

// Builds complete employee table
async function showEmployeeSummary() {
    console.log(' ');
    await db.query('SELECT e.id, e.first_name AS First_Name, e.last_name AS Last_Name, title AS Title, salary AS Salary, name AS Department, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id', (err, res) => {
        if (err) throw err;
        console.table(res);
        runApp();
    });
};

// Builds a table which shows existing roles and their departments
async function showRoleSummary() {
    console.log(' ');
    await db.query('SELECT r.id, title, salary, name AS department FROM role r LEFT JOIN department d ON department_id = d.id', (err, res) => {
        if (err) throw err;
        console.table(res);
        runApp();
    })
};

// Builds a table which shows existing departments
async function showDepartments() {
    console.log(' ');
    await db.query('SELECT id, name AS department FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        runApp();
    })
};

// Calls inside inquirers to check that user completing the input correctly
async function confirmStringInput(input) {
    if ((input.trim() != "") && (input.trim().length <= 30)) {
        return true;
    }
    return "Please limit your input to 30 characters or less."
};

// Adds a new employee after asking for emloyee name, role, and manager
async function addEmployee() {
    // Create two global arrays to hold 
    let positions = await db.query('SELECT id, title FROM role');
    let managers = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS Manager FROM employee');
    managers.unshift({ id: null, Manager: "None" });
    // Create connection using prompt
    inquirer.prompt([
        {
            name: "firstName",
            type: "input",
            message: "First name:",
            validate: confirmStringInput
        },
        {
            name: "lastName",
            type: "input",
            message: "Last name:",
            validate: confirmStringInput
        },
        {
            name: "role",
            type: "list",
            message: "Role:",
            choices: positions.map(obj => obj.title)
        },
        {
            name: "manager",
            type: "list",
            message: "Select employee's manager:",
            choices: managers.map(obj => obj.Manager)
        }
    ]).then(answers => {
        let positionDetails = positions.find(obj => obj.title === answers.role);
        let manager = managers.find(obj => obj.Manager === answers.manager);
        db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)", [[answers.firstName.trim(), answers.lastName.trim(), positionDetails.id, manager.id]]);
        console.log("\x1b[32m", `${answers.firstName} was added to the employee database!`);
        runApp();
    });
};

// Options to make changes to employees specifically
function editEmployeeOptions() {
    // Create connection using prompt
    inquirer.prompt({
        name: "editChoice",
        type: "list",
        message: "What would you like to update?",
        choices: [
            "Add A New Employee",
            "Change Employee Role",
            "Change Employee Manager",
            "Remove An Employee",
            "Return To Main Menu"
        ]
    // Prompt user to make a selection
    }).then(response => {
        switch (response.editChoice) {
            case "Add A New Employee":
                addEmployee();
                break;
            case "Change Employee Role":
                updateEmployeeRole();
                break;
            case "Change Employee Manager":
                updateManager();
                break;
            case "Remove An Employee":
                removeEmployee();
                break;
            case "Return To Main Menu":
                runApp();
                break;
        }
    })
};

// Removes an employee from the database
async function removeEmployee() {
    let employees = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });
    // Prompt user of all employees
    inquirer.prompt([
        {
            name: "empName",
            type: "list",
            message: "Remove which employee?",
            choices: employees.map(obj => obj.name)
        }
    ]).then(response => {
        if (response.employeeName != "Cancel") {
            let unluckyEmployee = employees.find(obj => obj.name === response.employeeName);
            db.query("DELETE FROM employee WHERE id=?", unluckyEmployee.id);
            console.log("\x1b[32m", `${response.employeeName} was let go...`);
        }
        runApp();
    })
};

// Change the employee's manager. Also prevents employee from being their own manager
async function updateManager() {
    let employees = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });
    // Create connection using prompt
    inquirer.prompt([
        {
            name: "empName",
            type: "list",
            message: "For which employee?",
            choices: employees.map(obj => obj.name)
        }
    ]).then(employeeInfo => {
        if (employeeInfo.empName == "Cancel") {
            runApp();
            return;
        }
        let managers = employees.filter(currEmployee => currEmployee.name != employeeInfo.empName);
        for (i in managers) {
            if (managers[i].name === "Cancel") {
                managers[i].name = "None";
            }
        };
        inquirer.prompt([
            {
                name: "mgName",
                type: "list",
                message: "Change employee manager to:",
                choices: managers.map(obj => obj.name)
            }
        ]).then(managerInfo => {
            let empID = employees.find(obj => obj.name === employeeInfo.empName).id
            let mgID = managers.find(obj => obj.name === managerInfo.mgName).id
            db.query("UPDATE employee SET manager_id=? WHERE id=?", [mgID, empID]);
            console.log("\x1b[32m", `${employeeInfo.empName} now reports to ${managerInfo.mgName}`);
            runApp();
        })
    })
};

// Updates selected employee's role
async function updateEmployeeRole() {
    let employees = await db.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee');
    employees.push({ id: null, name: "Cancel" });
    let role = await db.query('SELECT id, title FROM role');
    // Create connection using prompt
    inquirer.prompt([
        {
            name: "empName",
            type: "list",
            message: "For which employee?",
            choices: employees.map(obj => obj.name)
        },
        {
            name: "newRole",
            type: "list",
            message: "Change employee role to:",
            choices: role.map(obj => obj.title)
        }
    ]).then(answers => {
        if (answers.empName != "Cancel") {
            let empID = employees.find(obj => obj.name === answers.empName).id
            let roleID = role.find(obj => obj.title === answers.newRole).id
            db.query("UPDATE employee SET role_id=? WHERE id=?", [roleID, empID]);
            console.log("\x1b[32m", `${answers.empName} new role is ${answers.newRole}`);
        }
        runApp();
    })
};

// Add a new role to the database
async function addRole() {
    // Create department array
    let departments = await db.query('SELECT id, name FROM department');
    // Create connection using prompt
    inquirer.prompt([
        {
            name: "roleName",
            type: "input",
            message: "Enter new role:",
            validate: confirmStringInput
        },
        {
            name: "salaryNum",
            type: "input",
            message: "Enter salary for the role:",
            validate: input => {
                if (!isNaN(input)) {
                    return true;
                }
                return "Please enter a valid number."
            }
        },
        {
            name: "roleDepartment",
            type: "list",
            message: "Choose the role's department:",
            choices: departments.map(obj => obj.name)
        }
    ]).then(answers => {
        // Set department ID variable
        let depID = departments.find(obj => obj.name === answers.roleDepartment).id
        db.query("INSERT INTO role (title, salary, department_id) VALUES (?)", [[answers.roleName, answers.salaryNum, depID]]);
        console.log("\x1b[32m", `${answers.roleName} was added. Department: ${answers.roleDepartment}`);
        runApp();
    })
};

// Updates a role on the database
async function updateRole() {
    let role = await db.query('SELECT id, title FROM role');
    role.push({ id: null, title: "Cancel" });
    let departments = await db.query('SELECT id, name FROM department');
    // Create connection using prompt
    inquirer.prompt([
        {
            name: "roleName",
            type: "list",
            message: "Update which role?",
            choices: role.map(obj => obj.title)
        }
    ]).then(response => {
        if (response.roleName == "Cancel") {
            runApp();
            return;
        }
        inquirer.prompt([
            {
                name: "salaryNum",
                type: "input",
                message: "Enter role's salary:",
                validate: input => {
                    if (!isNaN(input)) {
                        return true;
                    }
                    return "Please enter a valid number."
                }
            },
            {
                name: "roleDepartment",
                type: "list",
                message: "Choose the role's department:",
                choices: departments.map(obj => obj.name)
            }
        ]).then(answers => {
            let depID = departments.find(obj => obj.name === answers.roleDepartment).id
            let roleID = role.find(obj => obj.title === response.roleName).id
            db.query("UPDATE role SET title=?, salary=?, department_id=? WHERE id=?", [response.roleName, answers.salaryNum, depID, roleID]);
            console.log("\x1b[32m", `${response.roleName} was updated.`);
            runApp();
        })
    })
};

// Options to make changes to roles
function editRoleOptions() {
    // Create connection using prompt
    inquirer.prompt({
        name: "editRoles",
        type: "list",
        message: "What would you like to update?",
        choices: [
            "Add A New Role",
            "Update A Role",
            "Remove A Role",
            "Return To Main Menu"
        ]
    }).then(responses => {
        switch (responses.editRoles) {
            case "Add A New Role":
                addRole();
                break;
            case "Update A Role":
                updateRole();
                break;
            case "Remove A Role":
                removeRole();
                break;
            case "Return To Main Menu":
                runApp();
                break;
        }
    })
};

// Remove a role from the database
async function removeRole() {
    // Create role array
    let role = await db.query('SELECT id, title FROM role');
    role.push({ id: null, title: "Cancel" });
    // Create connection using prompt
    inquirer.prompt([
        {
            // Prompt user of of roles
            name: "roleName",
            type: "list",
            message: "Remove which role?",
            choices: role.map(obj => obj.title)
        }
    ]).then(response => {
        if (response.roleName != "Cancel") {
            // Confirm deletion of role
            let noMoreRole = role.find(obj => obj.title === response.roleName);
            db.query("DELETE FROM role WHERE id=?", noMoreRole.id);
            console.log("\x1b[32m", `${response.roleName} was removed. Please reassign associated employees.`);
        }
        runApp();
    })
};

// Add a new department to the database
async function addDepartment() {
    inquirer.prompt([
        {
            name: "depName",
            type: "input",
            message: "Enter new department:",
            validate: confirmStringInput
        }
    ]).then(answers => {
        db.query("INSERT INTO department (name) VALUES (?)", [answers.depName]);
        console.log("\x1b[32m", `${answers.depName} was added to departments.`);
        runApp();
    })
};

// Remove a department from the database
async function removeDepartment() {
    // Create department array
    let departments = await db.query('SELECT id, name FROM department');
    departments.push({ id: null, name: "Cancel" });
    // Create connection using prompt
    inquirer.prompt([
        {
            name: "depName",
            type: "list",
            message: "Remove which department?",
            choices: departments.map(obj => obj.name)
        }
    ]).then(response => {
        if (response.depName != "Cancel") {
            // Confirm to continue to delete selected department
            let uselessDepartment = departments.find(obj => obj.name === response.depName);
            db.query("DELETE FROM department WHERE id=?", uselessDepartment.id);
            console.log("\x1b[32m", `${response.depName} was removed. Please reassign associated roles.`);
        }
        runApp();
    })
};

// Options to make changes to departments
function editDepartmentOptions() {
    // Create connection using prompt
    inquirer.prompt({
        name: "editDeps",
        type: "list",
        message: "Which department would you like to update?",
        choices: [
            "Add A New Department",
            "Remove A Department",
            "Return To Main Menu"
        ]
    }).then(responses => {
        switch (responses.editDeps) {
            case "Add A New Department":
                addDepartment();
                break;
            case "Remove A Department":
                removeDepartment();
                break;
            case "Return To Main Menu":
                runApp();
                break;
        }
    })
};

runApp();