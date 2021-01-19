const inquirer = require('inquirer');
const { viewAllEmp, viewEmpByDep, viewEmpByMngt, addEmp, upEmp, viewDep, addDep, viewRoles, addRole } = require('../lib/prompts');



module.exports = { promptUser }