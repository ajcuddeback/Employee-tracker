// const mysql = require('mysql2');

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'password',
//     database: 'employees'
// });
// var depArr = [];


// connection.query(
//     `SELECT * FROM department`,
//     function (err, results, fields) {
//         if (err) {
//             console.log(err.message);
//             return;
//         }
//         saveDepArr(results);
//     }
// )

// const saveDepArr = (results) => {
//     results.forEach(item => {
//         depArr.push(item);
//     })
//     module.exports = { depArr };
// }