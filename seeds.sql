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
VALUES (1, "Sales Lead", 45000, 1);
INSERT INTO role (id, title, salary, department_id)
VALUES (2, "Salesperson", 35000, 1);
INSERT INTO role (id, title, salary, department_id)
VALUES (3, "Assistant Store Manager", 60000, 1);
INSERT INTO role (id, title, salary, department_id)
VALUES (4, "Store Manager", 75000, 1);
INSERT INTO role (id, title, salary, department_id)
VALUES (5, "Lead Engineer", 43000, 2);
INSERT INTO role (id, title, salary, department_id)
VALUES (6, "Accountant", 50000, 3);
INSERT INTO role (id, title, salary, department_id)
VALUES (7, "Lawyer", 40000, 4);
INSERT INTO role (id, title, salary, department_id)
VALUES (8, "System Adminstrator", 80000, 5);
INSERT INTO role (id, title, salary, department_id)
VALUES (9, "IT Coordinator", 52000, 5);
INSERT INTO role (id, title, salary, department_id)
VALUES (10, "IT Manager", 105000, 5);

