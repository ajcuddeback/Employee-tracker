const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees'
});

// Inital Prompt - Main Menu
const promptUser = () => {
    inquirer

        // Prompt the user
        .prompt({
            type: 'list',
            name: 'begin choices',
            message: 'What would you like to do? (Select on of the following)',
            choices: ['View All Employees', 'View All Employees By Department', 'View All Employees By Manager', 'Add Employee', 'Update Employee', 'View Departments', 'Add Department', 'View Roles', 'Add Role']
        })
        // Take the data and use switch statements to decide what to do per option
        .then((data) => {
            switch (data['begin choices']) {
                case 'View All Employees':
                    viewAllEmp();
                    break;
                case 'View All Employees By Department':
                    viewEmpByDep();
                    break;
                case 'View All Employees By Manager':
                    viewEmpByMngt();
                    break;
                case 'Add Employee':
                    addEmp();
                    break;
                case 'Update Employee':
                    upEmp();
                    break;
                case 'View Departments':
                    viewDep();
                    break;
                case 'Add Department':
                    addDep();
                    break;
                case 'View Roles':
                    viewRoles();
                    break;
                case 'Add Role':
                    addRole();
                    break;
            }
        })
};

// View all employees
const viewAllEmp = () => {

    // connect to db
    connection.query(
        // Manipulate tables to view all employees
        `SELECT employee.id, employee.first_name, employee.last_name, roles.title AS role, roles.salary AS salary, manager.first_name AS manager,
        department.name AS department 
        FROM employee
        LEFT JOIN roles
        ON employee.role_id = roles.id
        LEFT JOIN department
        ON roles.department_id = department.id
        LEFT JOIN manager
        ON employee.manager_id = manager.id`,
        // Call back function to decide what to do with data
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }

            // Show the results as a table to the user
            console.table(results);

            // Re-prompt the user
            promptUser();
        }
    );
};

// View Employees by Department
const viewEmpByDep = () => {

    // Connect to db
    connection.query(
        // Get the table contents from department table
        `SELECT * FROM department`,

        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }
            // Create empty array for storing info
            depArr = [];
            // for each item in the results array, push the name of the department to the department array
            results.forEach(item => {
                depArr.push(item.name)
            });
            inquirer
                .prompt({
                    type: 'list',
                    name: 'filter-emp-dep',
                    message: 'Choose a department to filter from:',
                    // Choices are from the department array, this will allow for the user to add departments in future
                    choices: depArr
                })
                .then((data) => {
                    // Take the data and filter based on what user chose
                    connection.query(
                        `SELECT employee.id, employee.first_name, employee.last_name, department.name AS department 
                            FROM employee
                            LEFT JOIN roles
                            ON employee.role_id = roles.id
                            LEFT JOIN department
                            ON roles.department_id = department.id
                            WHERE department.name = ?`,
                        // Value user chose that will be replaced with question mark, this prevents SQL Injection attacks
                        [data['filter-emp-dep']],
                        function (err, results, fields) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }

                            // Show results as table
                            console.table(results);
                            // Reprompt user
                            promptUser();
                        }
                    )
                });
        }
    );
};

//  View Employees by Managment
const viewEmpByMngt = () => {
    connection.query(
        // Get the table contents from manager table
        `SELECT * FROM manager`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }
            // Create empty array for storing info
            manArr = [];
            // for each item in the results array, push the name of the manager to the manager array
            results.forEach(item => {
                manArr.push(item.first_name)
            })

            inquirer
                .prompt({
                    type: 'list',
                    name: 'filter-emp-man',
                    message: 'Choose a manager to filter from:',
                    // Choices are from the manager array, this will allow for the user to add departments in future
                    choices: manArr
                })
                .then((data) => {
                    connection.query(
                        `SELECT employee.id, employee.first_name, manager.first_name AS manager
                            FROM employee
                            LEFT JOIN manager
                            ON employee.manager_id = manager.id
                            WHERE manager.first_name = ?`,
                        // Value user chose that will be replaced with question mark, this prevents SQL Injection attacks
                        [data['filter-emp-man']],
                        function (err, results, fields) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }

                            // Show results as table
                            console.table(results);
                            // Reprompt user
                            promptUser();
                        }
                    )
                });

        }
    );
};

// Add a new employee
const addEmp = () => {
    connection.query(
        `SELECT * FROM roles`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }

            let roleArr = [];

            results.forEach(item => {
                roleArr.push(item.title)
            })
            connection.query(
                `SELECT * FROM manager`,
                function (err, results, fields) {
                    if (err) {
                        console.log(err.message);
                        return;
                    }

                    let manArr = [];
                    results.forEach(item => {
                        manArr.push(item.first_name)
                    });

                    inquirer
                        .prompt([
                            {
                                type: 'text',
                                name: 'first_name',
                                message: 'What is you employees first name?'
                            },
                            {
                                type: 'text',
                                name: 'last_name',
                                message: 'What is your employees last name?'
                            },
                            {
                                type: 'list',
                                name: 'role_pick',
                                message: 'What will you employees role be?',
                                choices: roleArr
                            },
                            {
                                type: 'confirm',
                                name: 'mngt_confirm',
                                message: 'Is your employees role a manager position?'
                            },
                            {
                                type: 'list',
                                name: 'mngt_pick',
                                message: 'Who will your employees manager be?',
                                choices: manArr
                            }
                        ])
                        .then((data) => {
                            let role_id;
                            for (i = 0; i < roleArr.length; i++) {
                                if (data.role_pick === roleArr[i]) {
                                    role_id = i + 1
                                }
                            }
                            let manager_confirm;
                            if (data.mngt_confirm === true) {
                                manager_confirm = 1;
                            } else {
                                manager_confirm = 0
                            }
                            let manager_id;
                            for (i = 0; i < manArr.length; i++) {
                                if (data.mngt_pick === manArr[i]) {
                                    manager_id = i + 1
                                }
                            }
                            console.log(role_id, manager_confirm, manager_id)
                        })
                }
            )
        }
    )
}
const upEmp = () => {
    console.log('update!')
}
const viewDep = () => {
    console.log('View deps')
}
const addDep = () => {
    console.log('add dep')
}
const viewRoles = () => {
    console.log('View Roles')
}
const addRole = () => {
    console.log('Add da roles')
}

module.exports = { promptUser }