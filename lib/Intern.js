const Employee = require('./Employee.js');

// Extend Employee class as Intern with added @officeNumber = Team Office NUmber
class Intern extends Employee {
  constructor(name, id, email, school) {
    super(name, id, email);
    this.school = school;
  }

  // Return and overide default role
  getRole = () => 'Intern';

  // Return intern's school name {
  getSchool = () => this.school;
  
}

module.exports = Intern;