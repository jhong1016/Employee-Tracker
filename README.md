# Employee-Tracker [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

---

### [Description](#Description)

### [Screenshot](#Screenshot)

### [Installation](#Installation)

### [Usage](#Usage)

### [GitHub](#GitHub)

---

### <a name="Description"></a>Description:

Developers are often tasked with creating interfaces that make it easy for non-developers to view and interact with information stored in databases. Often these interfaces are known as **C**ontent **M**anagement **S**ystems. In this mission, I architected and built a solution for managing a company's employees using node, inquirer, and MySQL.

The application links to an SQL database and allows users to view and manage employee records from the command line interface in a more user friendly environment.

The following objectives were sought:

1. Get the SQL database and return it as a table in the command line by using linkages
2. The table should have the column names: id, first_name, last_name, title, salary, department, and manager (if applicable)
3. Allow the user to add, view or delete employees, roles, and departments
4. Allow the user to update employees, employee managers, roles, and departments

---

### <a name="Screenshot"></a>Screenshot:

![]

---

### <a name="Installation"></a>Installation:

I created the Employee Management System with npm packages: **MySQL**, **Node**, **Inquirer**, and **console.table** design pattern.

---

### <a name="Usage"></a>Usage:

Designed the following database schema containing three tables:

- **Department**:

  - **id**
  - **name**

- **Role**:

  - **id**
  - **title**
  - **salary**
  - **department_id**

- **Employee**:

  - **id**
  - **first_name**
  - **last_name**
  - **role_id**
  - **manager_id**

### <a name="Github"></a>GitHub Account:

http://github.com/jhong1016