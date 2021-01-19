const mysql = require('mysql2/promise');
const inquirer = require('inquirer')
const { promptUser } = require('./prompts');
const depArr = []

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
    )
}

async function getDepartmentName() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`SELECT * FROM department`);
    await connection.end();

    rows.forEach(item => {
        depArr.push(item.name)
    })
}

const promptAddRole = () => {
    getDepartmentName();
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
            addRole(data, depArr)
        })
}

async function addRole(data, depArr) {
    let department_id;

    for (let i = 0; i < depArr.length; i++) {
        if (depArr[i] === data.department) {
            department_id = i + 1;
        };

    }

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`INSERT INTO roles (title, salary, department_id) VALUES(?,?,?)`, [data.role_title, data.salary, department_id]);
    await connection.end();
    console.log('Role added!')
    promptUser();
}

module.exports = { promptAddRole }