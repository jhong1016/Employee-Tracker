USE employee_DB;

----- Department Seeds -----
INSERT INTO department (id, name)
VALUES (1, "Sales");
INSERT INTO department (id, name)
VALUES (2, "Engineering");
INSERT INTO department (id, name)
VALUES (3, "Finance");
INSERT INTO department (id, name)
VALUES (4, "Legal");
INSERT INTO department (id, name)
VALUES (5, "IT");

----- Role Seeds -----
INSERT INTO role (id, title, salary, department_id)
VALUES (1, "Sales Lead", 50000, 1);
INSERT INTO role (id, title, salary, department_id)
VALUES (2, "Salesperson", 45000, 1);
INSERT INTO role (id, title, salary, department_id)
VALUES (3, "Assistant Store Manager", 60000, 1);
INSERT INTO role (id, title, salary, department_id)
VALUES (4, "Store Manager", 75000, 1);
INSERT INTO role (id, title, salary, department_id)
VALUES (5, "Lead Engineer", 73000, 2);
INSERT INTO role (id, title, salary, department_id)
VALUES (6, "Accountant", 60000, 3);
INSERT INTO role (id, title, salary, department_id)
VALUES (7, "Lawyer", 90000, 4);
INSERT INTO role (id, title, salary, department_id)
VALUES (8, "System Adminstrator", 80000, 5);
INSERT INTO role (id, title, salary, department_id)
VALUES (9, "IT Coordinator", 52000, 5);
INSERT INTO role (id, title, salary, department_id)
VALUES (10, "IT Manager", 105000, 5);

----- Employee Seeds -----
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (1, "John", "Smith", 1, 3);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (2, "Rosie", "Cole", 1, 3);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (3, "Ronald", "Young", 2, 4);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (4, "Charbelle", "Chaz", 3, null);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (5, "David", "Miller", 4, null);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (6, "Lianne", "Soon", 5, 7);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (7, "Maria", "Hall", 6, null);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (8, "Linda", "Martin", 7, 10);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (9, "Martin", "Cast", 8, 10);
INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (10, "Taylor", "Wilson", 9, null);