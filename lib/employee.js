const { promptUser } = require('../index')
const inquirer = require('inquirer');
const mysql = require('mysql2');
const { dropManager, createManagerTable, addManagers } = require('./reset');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees'
});

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
                    );
                });

        }
    );
};

// Add a new employee
const addEmp = () => {

    // Connect to DB
    connection.query(
        // Select all roles from table for future ref
        `SELECT * FROM roles`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }
            let roleObj = results;
            // Create empty array for storing info
            let roleArr = [];

            // for each item in the results array, push the name of the roles to the roles array
            results.forEach(item => {
                roleArr.push(item.title)
            })
            // Connect to db again 
            connection.query(
                // Select all managers from managers table for future ref
                `SELECT * FROM manager`,
                function (err, results, fields) {
                    if (err) {
                        console.log(err.message);
                        return;
                    }
                    let manObj = results;
                    // Create empty array for managers
                    let manArr = [];

                    // For each item in results array, push the name of the manager to the manager array
                    results.forEach(item => {
                        manArr.push(item.first_name)
                    });

                    // Prompt the user
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
                                // use the names from the roles array to get the roles, this will allow us to add new roles in the future
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
                                // If the user confirms the emp is a manager, then do not run this prompt
                                when: ({ mngt_confirm }) => {
                                    if (!mngt_confirm) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },
                                // Choices will be the names from the manager array
                                choices: manArr
                            }
                        ])
                        .then((data) => {
                            // Create a loop of the role arr in order to compare the users answer to the position it is in in the array,
                            // this will provide us with a number that can be used as an id for the role_id section of our table
                            let role_id;
                            roleObj.forEach(item => {
                                // if the roles user picked is equal to the objects title
                                if (data.role_pick === item.title) {
                                    // set the role id = to the objects id
                                    role_id = item.id;
                                }
                            })

                            // if statement that will decide weather or not based on users input if the employee is a manager or not 
                            let manager_confirm;
                            if (data.mngt_confirm === true) {
                                manager_confirm = 1;
                            } else {
                                manager_confirm = 0
                            }

                            let manager_id;

                            // if the mngt_pick prompt was not run and returns nothing set the manager_id to null
                            if (!data.mngt_pick) {
                                manager_id = null;
                                // else Create a loop of the manager arr in order to compare the users answer to the position it is in in the array,
                                // this will provide us with a number that can be used as an id for the manager_id section of our table
                            } else {
                                manObj.forEach(item => {
                                    // if the roles user picked is equal to the objects title
                                    if (data.mngt_pick === item.first_name) {
                                        // set the role id = to the objects id
                                        manager_id = item.id;
                                    }
                                })
                            }
                            // Connect to db again
                            connection.query(
                                // Insert values from user into db, uses place holders to prevent SQL Injection attack
                                `INSERT INTO employee (first_name, last_name, role_id, manager_id, manager_confirm)
                                    VALUES (?, ?, ?, ?, ?)`,
                                [data.first_name, data.last_name, role_id, manager_id, manager_confirm],
                                function (err, results, fields) {
                                    if (err) {
                                        console.log(err.message);
                                        return;
                                    }
                                    // Drop the manager table in order to re-update manager table
                                    dropManager();
                                    // Re-Create the manager table
                                    createManagerTable();
                                    // Add new and current managers to table
                                    addManagers();
                                    console.log('Employee succesfully added!');
                                    // Reset to main screen
                                    promptUser();
                                }
                            );
                        });
                }
            );
        }
    );
};

const upEmp = () => {
    // Select all roles from table for future ref
    connection.query(
        `SELECT * FROM roles`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }
            // Store results into a variable for later use
            let roleObj = results;
            // Create empty array for storing info
            let roleArr = [];

            // for each item in the results array, push the name of the roles to the roles array
            results.forEach(item => {
                roleArr.push(item.title)
            })
            connection.query(
                `SELECT first_name, last_name FROM employee`,
                function (err, results, fields) {
                    if (err) {
                        console.log(err.message);
                    }

                    let nameArr = [];
                    results.forEach(item => {
                        nameArr.push(item.first_name);
                        nameArr.push(item.last_name);
                    })
                    let combinedNameArr = [];
                    for (let i = 0; i < nameArr.length; i += 2) {
                        if (!nameArr[i + 1])
                            break
                        combinedNameArr.push(`${nameArr[i]} ${nameArr[i + 1]}`)
                    }
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                name: 'name_select',
                                message: 'Please select an employee you would like to update',
                                choices: combinedNameArr
                            },
                            {
                                type: 'list',
                                name: 'role_select',
                                message: 'Please select a role you would like your employee to change to:',
                                choices: roleArr
                            }
                        ])
                        .then((data) => {
                            let role_id;

                            // for each item in the results array....
                            roleObj.forEach(item => {
                                // if the roles user picked is equal to the objects title
                                if (data.role_select === item.title) {
                                    // set the role id = to the objects id
                                    role_id = item.id;
                                }
                            })
                            let selectedNameArr = data.name_select.split(" ");
                            let last_name = selectedNameArr.pop();
                            let first_name = selectedNameArr[0];

                            connection.query(
                                `UPDATE employee 
                                        SET role_id = ?
                                        WHERE first_name = ? AND last_name = ?`,
                                [role_id, first_name, last_name],
                                function (err, results, fields) {
                                    if (err) {
                                        console.log(err.message);
                                        return;
                                    }
                                    console.log('Employee updated!');
                                    promptUser();
                                }
                            );
                        });
                }
            );

        }
    );
};

module.exports = { viewAllEmp, viewEmpByDep, viewEmpByMngt, addEmp, upEmp };
