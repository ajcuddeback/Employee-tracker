const { promptUser } = require('../index');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees'
});

const viewRoles = () => {
    connection.query(
        `SELECT roles.id, roles.title, roles.salary, department.name
            FROM roles
            LEFT JOIN department
            ON roles.department_id = department.id `,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
                return;
            }

            console.table(results);
            promptUser();
        }
    );
};

const addRole = () => {
    connection.query(
        `SELECT * FROM department`,
        function (err, results, fields) {
            if (err) {
                console.log(err);
                return;
            }
            let depObj = results;
            let depArr = [];
            results.forEach(item => {
                depArr.push(item.name)
            })

            inquirer
                .prompt([
                    {
                        type: 'text',
                        name: 'role_title',
                        message: 'Please enter the name of the role you would like to add: '
                    },
                    {
                        type: 'number',
                        name: 'salary',
                        message: 'Please enter the salary of this role. Note: Please do not use commas or periods'
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Please select the department you role will be a part of: ',
                        choices: depArr
                    }
                ])
                .then((data) => {
                    let department_id;

                    depObj.forEach(item => {
                        if (data.department === item.name) {
                            department_id = item.id
                        }
                    })

                    connection.query(
                        `INSERT INTO roles (title, salary, department_id)
                            VALUES(?,?,?)`,
                        [data.role_title, data.salary, department_id],
                        function (err, results, fields) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }

                            console.log('Role added!')
                            promptUser();
                        }
                    );
                });
        }
    );
};

const deleteRoles = () => {
    connection.query(
        `SELECT * FROM roles`,
        function (err, results) {
            if (err) {
                console.log(err.message);
                return;
            }

            let roleObj = results;
            let roleArr = [];

            results.forEach(item => {
                roleArr.push(item.title)
            });

            inquirer
                .prompt(
                    {
                        type: 'list',
                        name: 'role_select',
                        message: 'Please select a role you would like to delete:',
                        choices: roleArr
                    }
                )
                .then((data) => {
                    let role_id;

                    roleObj.forEach(item => {
                        if (data.role_select === item.title) {
                            role_id = item.id;
                        }
                    })

                    connection.query(
                        `DELETE FROM roles
                            WHERE id = ?`,
                        [role_id],
                        function (err, results) {
                            if (err) {
                                console.log(err.message);
                                return;
                            }
                            console.log(results.affectedRows)
                            console.log('Role Deleted!');
                            promptUser();
                        }
                    )
                })
        }
    )
}
module.exports = { viewRoles, addRole, deleteRoles };