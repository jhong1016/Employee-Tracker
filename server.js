const inquirer = require('inquirer');
const db = require('./utils/connection.js');
const consoleTable = require('console.table');
const promisemysql = require('promise-mysql');
const logo = require("asciiart-logo");

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

runApp();

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

// Delete Department
function deleteDept(){
    // Create department array
    var deptArr = [];
    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties
    ).then((conn) => {
        // Query all departments
        return conn.query("SELECT id, name FROM department");
    }).then((depts) => {
        // Add all departments to array
        for (i=0; i < depts.length; i++){
            deptArr.push(depts[i].name);
        }
        inquirer.prompt([{
            // Confirm to continue to delete selected department
            name: "continueDelete",
            type: "list",
            message: "*** WARNING *** Deleting a department will delete all roles and employees associated with the department. Do you want to continue?",
            choices: ["YES", "NO"]
        }]).then((answer) => {
            // If not, go back to main menu
            if (answer.continueDelete === "NO") {
                options();
            }
        }).then(() => {
            inquirer.prompt([{
                // Prompt user to select department
                name: "department",
                type: "list",
                message: "Which department would you like to delete?",
                choices: deptArr
            }, 
            {
                // Confirm with user to delete
                name: "confirmDelete",
                type: "Input",
                message: "Type the department name EXACTLY to confirm deletion of the department: "
            }]).then((answer) => {
                if(answer.confirmDelete === answer.dept){
                    // I confirmed, get department ID
                    let deptID;
                    for (i=0; i < depts.length; i++){
                        if (answer.dept == depts[i].name){
                            deptID = depts[i].id;
                        }
                    }
                    // Delete department
                    connection.query(`DELETE FROM department WHERE id=${deptID};`, (err, res) => {
                        if(err) return err;
                        // Confirm department has been deleted
                        console.log(`\n DEPARTMENT '${answer.dept}' DELETED...\n `);
                        // Go back to main menu
                        options();
                    });
                } 
                else {
                    // Do not delete department if not confirmed and go back to main menu
                    console.log(`\n DEPARTMENT '${answer.dept}' NOT DELETED...\n `);
                    options();
                }
            });
        })
    });
}

// View Department Budget
function viewDeptBudget(){
    // Create connection using promise-sql
    promisemysql.createConnection(connectionProperties)
    .then((conn) => {
        return  Promise.all([
            // Query all departments and salaries
            conn.query("SELECT department.name AS department, role.salary FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY department ASC"),
            conn.query('SELECT name FROM department ORDER BY name ASC')
        ]);
    }).then(([deptSalaries, departments]) => {
        let deptBudgetArr =[];
        let department;
        for (d=0; d < departments.length; d++){
            let departmentBudget = 0;
            // Add all salaries together
            for (i=0; i < deptSalaries.length; i++){
                if (departments[d].name == deptSalaries[i].department){
                    departmentBudget += deptSalaries[i].salary;
                }
            }
            // Create new property with budgets
            department = {
                Department: departments[d].name,
                Budget: departmentBudget
            }
            // Add to array
            deptBudgetArr.push(department);
        }
        console.log("\n");
        // Display departments budgets using console.table
        console.table(deptBudgetArr);
        // Back to main menu
        options();
    });
}