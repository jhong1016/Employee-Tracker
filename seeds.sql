USE employee_DB;

----- Department Seeds -----
INSERT INTO department (department_id, name)
VALUES (1, 'Sales'), (2, 'Engineering'), (3, 'Finance'), (4, 'Legal'), (5, 'IT');

----- Role Seeds -----
INSERT INTO role (title, salary, department_id)
VALUES ('Sales Lead', 100000, 1), ('Salesperson', 80000, 1), ('Lead Engineer', 150000, 2), ('Software Engineer', 120000, 2), ('Accountant', 125000, 3), ('Legal Team Lead', 250000, 4), ('Lawyer', 190000, 4), ('System Adminstrator', 80000, 5), ('IT Manager', 110000, 5);

----- Employee Seeds -----
INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ('John', 'Smith', 1, null), ('Rosie', 'Cole', 3, null), ('Ronald', 'Young', 4, 2), ('David', 'Miller', 6, null), ('Maria', 'Hall', 2, null), ('Martin', 'Cast', 2, 1), ('Taylor', 'Wilson', 5, 1);
