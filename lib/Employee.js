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
  getName() {
    return this.name;
  }

  // Return employee ID
  getId() {
    return this.id;
  }

  // Return employee email
  getEmail() {
    return this.email;
  }

  // Return default employee type
  getRole() {
    return "Employee";
  }
}

module.exports = Employee;