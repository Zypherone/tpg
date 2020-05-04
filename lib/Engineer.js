const Employee = require('./Employee.js');

// Extend Employee class as Engineer with added @github = valid GitHub username
class Engineer extends Employee {
  constructor(name, id, email, github) {
    super(name, id, email);
    this.github = github;
  }

  // Return and overide default role
  getRole() {
    return 'Engineer';
  }

  // Return employee's github details {
  getGithub() {
    return this.github;
  }
}

module.exports = Engineer;