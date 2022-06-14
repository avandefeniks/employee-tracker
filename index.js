const inquirer = require('inquirer');
const mysql = require('mysql2');
const { resolve } = require('path');
// const consoleTable = require('console.table');
require('dotenv').config();


const db = mysql.createConnection({
    host: 'localhost',
    // Your MySQL username,
    user: 'root',
    // Your MySQL password
    password: process.env.DB_PASSWORD,
    database: 'employees'
});

// db.query (`SELECT * FROM department`, (err, data) => {
//     console.log(data);
// });



const firstAction = firstActionData => {

    return inquirer.prompt([
        {
            type: 'list',
            name: 'firstChoice',
            message: 'What would you like to do?',
            choices: ['View All Departments', 'View All Roles', 'View All Employees', 'Add Department', 'Add Role', 'Add Employee', 'Update Employee Role']

        }
    ])
        .then(firstActionData => {
            // view all departments
            if (firstActionData.firstChoice === 'View All Departments') {
                db.query(`SELECT * FROM department`, (err, results) => {
                    console.table(results);
                    firstAction();
                });

            }

            // view all roles
            if (firstActionData.firstChoice === 'View All Roles') {
                db.query(`SELECT role.title AS Title, role.id AS ID, department.name AS Department, role.salary AS Salary 
                    FROM role
                    LEFT JOIN department
                    ON role.department_id = department.id`, (err, results) => {
                    console.table(results);
                    firstAction();
                });

            }

            // view all employees
            if (firstActionData.firstChoice === 'View All Employees') {
                db.query(`SELECT e.id AS ID, e.first_name AS "First Name", e.last_name AS "Last Name", r.title AS Title, d.name AS Department, 
                    r.salary AS Salary, CONCAT(m.first_name, " ", m.last_name) AS Manager
                    FROM employee e
                    LEFT JOIN role r
                    ON e.role_id = r.id
                    LEFT JOIN department d
                    ON r.department_id = d.id
                    LEFT JOIN employee m
                    ON e.manager_id = m.id`, (err, results) => {
                    console.table(results);
                    firstAction();
                });
            }

            // add a department
            if (firstActionData.firstChoice === 'Add Department') {
                addDepartment();
            }

            // add a role
            if (firstActionData.firstChoice === 'Add Role') {
                addRole();
            }

            // add employee
            if (firstActionData.firstChoice === 'Add Employee') {
                addEmployee();
            }
        })
}

const addDepartment = addDepartmentData => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the new department?'
        }
    ])
        .then(addDepartmentData => {
            const sql = `INSERT INTO department (name) VALUES (?)`;
            db.query(sql, addDepartmentData.department, (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }

            })

            console.log('Added ' + addDepartmentData.department + ' to the database');
            firstAction();
        });

}

const addRole = addRoleData => {
    db.query(`SELECT * FROM department`, (err, deptList) => {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'Please enter a role'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Please enter a salary'
            },
            {
                type: 'list',
                name: 'roleDept',
                message: 'What department does the role belong to?',
                choices: deptList
            }

        ])
            .then(addRoleData => {
                const deptIndex = deptList.filter(name => addRoleData.roleDept === name.name)[0]
                // console.log(deptIndex.id);         

                const sql = `INSERT INTO role (title, salary, department_id)
                            VALUES (?,?,?)`;
                db.query(sql, [addRoleData.title, addRoleData.salary, deptIndex.id], (err, data) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                })
                console.log('Added ' + addRoleData.title + ' to the database');
                firstAction();

            });
    });

}

const addEmployee = addEmployeeData => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's fist name?"
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?"
        }
    ])
        .then(roleData => {
            const sql = `SELECT id, title FROM role`;
            db.query(sql, (err, roles) => {
                if (err) {
                    console.log(err);
                    return;
                }
                return inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the employee's role?",
                        choices: roles
                    }
                ])
            })
        })
}

// firstAction()
// addRole()
addEmployee()