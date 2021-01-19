const inquirer = require('inquirer');
const mysql = require('mysql2/promise');


// const upEmp = () => {
//     console.log('in')
//     // Select all roles from table for future ref
//     connection.query(
//         `SELECT * FROM roles`,
//         function (err, results, fields) {
//             if (err) {
//                 console.log(err.message);
//                 return;
//             }

//             // Create empty array for storing info
//             let roleArr = [];

//             // for each item in the results array, push the name of the roles to the roles array
//             results.forEach(item => {
//                 roleArr.push(item.title)
//             })
//             connection.query(
//                 `SELECT first_name, last_name FROM employee`,
//                 function (err, results, fields) {
//                     if (err) {
//                         console.log(err.message);
//                     }

//                     let nameArr = [];
//                     results.forEach(item => {
//                         nameArr.push(item.first_name);
//                         nameArr.push(item.last_name);
//                     })
//                     let combinedNameArr = [];
//                     for (let i = 0; i < nameArr.length; i += 2) {
//                         if (!nameArr[i + 1])
//                             break
//                         combinedNameArr.push(`${nameArr[i]} ${nameArr[i + 1]}`)
//                     }
//                     inquirer
//                         .prompt([
//                             {
//                                 type: 'list',
//                                 name: 'name_select',
//                                 message: 'Please select an employee you would like to update',
//                                 choices: combinedNameArr
//                             },
//                             {
//                                 type: 'list',
//                                 name: 'role_select',
//                                 message: 'Please select a role you would like your employee to change to:',
//                                 choices: roleArr
//                             }
//                         ])
//                         .then((data) => {
//                             let role_id;
//                             for (let i = 0; i < roleArr.length; i++) {
//                                 if (data.role_select === roleArr[i]) {
//                                     role_id = i + 1;
//                                 }
//                             };
//                             let selectedNameArr = data.name_select.split(" ");
//                             let last_name = selectedNameArr.pop();
//                             let first_name = selectedNameArr[0];

//                             connection.query(
//                                 `UPDATE employee 
//                                     SET role_id = ?
//                                     WHERE first_name = ? AND last_name = ?`,
//                                 [role_id, first_name, last_name],
//                                 function (err, results, fields) {
//                                     if (err) {
//                                         console.log(err.message);
//                                         return;
//                                     }
//                                     console.log('Employee updated!');
//                                     promptUser();
//                                 }
//                             );
//                         });
//                 }
//             );

//         }
//     );
// };

// async function getRoleTitle() {

// }
// View department

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees'
});

async function viewDep() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees'
    });
    const [rows, fields] = await connection.execute(`SELECT * FROM department`);
    await connection.end();

    console.table(rows);
    promptUser();
}



viewDep()
