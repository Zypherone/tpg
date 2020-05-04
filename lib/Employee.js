/*
 * Employee Class
 * @name  = employee name
 * @id    = employee id
 * @email = employee email
 */

class Employee {
  constructor(name, id, email) {
    this.name = name;
    this.id = id;
    this.email = email;
  }

  // Return employee name
  getName = () => this.name;

  // Return employee ID
  getId = () => this.id;

  // Return employee email
  getEmail = () => this.email;

  // Return default employee type
  getRole = () => 'Employee';
  
}

module.exports = Employee;