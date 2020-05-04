const Employee = require('./Employee.js');

// Extend Employee class as Engineer with added @github = valid GitHub username
class Engineer extends Employee {
  constructor(name, id, email, github) {
    super(name, id, email);
    this.github = github;
  }

  // Return and overide default role
  getRole = () => 'Engineer';

  // Return employee's github details 
  getGithub = () => this.github;

}

module.exports = Engineer;