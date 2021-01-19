const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees'
});

const dropManager = () => {
    connection.query(
        `DROP TABLE IF EXISTS manager`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
            }
            console.log('')
        }
    )
};

const createManagerTable = () => {
    connection.query(
        `CREATE TABLE manager (
            id INT NOT NULL AUTO_INCREMENT,
            first_name VARCHAR(30),
            last_name VARCHAR(30),
            PRIMARY KEY (id)
        )`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
            }
            console.log('')
        }
    )
};

const addManagers = () => {
    connection.query(
        `INSERT INTO manager (first_name, last_name)
        SELECT first_name,
            last_name
        FROM employee
        WHERE manager_confirm = 1`,
        function (err, results, fields) {
            if (err) {
                console.log(err.message);
            }
            console.log('')
        }
    )
};

module.exports = { dropManager, createManagerTable, addManagers }