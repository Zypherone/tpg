const Employee = require('./Employee.js');

// Extend Employee class as Manager with added @officeNumber = Team Office NUmber
class Manager extends Employee {
  constructor(name, id, email, officeNumber) {
    super(name, id, email);
    this.officeNumber = officeNumber;
  }

  // Return and overide default role
  getRole() {
    return 'Manager';
  }

  // Return team office number {
  getOfficeNumber() {
    return this.officeNumber;
  }
}

module.exports = Manager;