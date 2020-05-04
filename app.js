const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const util = require('util')
const readFileAsync = util.promisify(fs.readFile)
const accessFileAsync = util.promisify(fs.access)                     
const mkdirFileAsync = util.promisify(fs.mkdir)
const writeFileAsync = util.promisify(fs.writeFile);

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");

// Set a base employee team list.
const teamList = [];

// Build the questions for all the different roles.
const questions = {
  // A list of base questions for all roles.
  base: [
    {
      type: 'input',
      name: 'name',
      message: 'Enter ROLE\s name'
    },
    {
      type: 'input',
      name: 'id',
      message: 'Enter ROLE\'s ID'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Enter ROLE\'s Email'
    }
  ],
  // A list of questions for the manager's role
  manager: [
    {
      type: 'input',
      name: 'number',
      message: 'Enter Office Number'
    }
  ],
  // A list of questions for the engineer's role
  engineer: [
    {
      type: 'input',
      name: 'github',
      message: 'Enter GitHub username'
    }
  ],
  // A list of questions for the intern's role
  intern: [
    {
      type: 'input',
      name: 'school',
      message: 'Enter School/College name'
    }
  ],
  // Final follow up question
  anotherEntry: [
    {
      type: 'confirm',
      name: 'anotherEntry',
      message: 'Add another employee'
    }
  ]
}

const init = () => {

  // The base roles choices for the first question.
  const roles = [
    'manager',
    'engineer',
    'intern',
    'no further entries'
  ]

  askRole = () => {

    inquirer.prompt({
      type: 'rawlist',
      name: 'role',
      message: 'Enter new employee\'s role type',
      choices: () => {
        return roles.map(val => {
          return val.replace(/^\w/, c => c.toUpperCase())
        })
      },
      filter: (a) => {
        return a.toLowerCase()
      }
    })
    .then(r => {
      
      const role = r.role;

      switch (role) {
        case 'manager':
          // Once we start the managers entry, list remove it from the array so we are not prompted.
          roles.splice(roles.indexOf('manager'), 1);

        case 'engineer':
        case 'intern':
            
          // Join and map a list of all the questions for the relevent roles.
          const listOfQuestions = questions.base // Base question
                                    .concat(
                                      questions[role], // Role specific question
                                      questions.anotherEntry // Final follow up question
                                    );

          listOfQuestions.map(val => {
            val.message = val.message.replace('ROLE', role);
          })

          inquirer
            .prompt(listOfQuestions)
            .then((r) => {

              // Based on the role lets pull the different classes and push to teamList.
              if (role === 'manager') 
                teamList.push(new Manager(r.name, r.id, r.email, r.number))
              else if (role === 'engineer')
                teamList.push(new Engineer(r.name, r.id, r.email, r.github))
              else 
                teamList.push(new Intern(r.name, r.id, r.email, r.school))

              // Lets repeat the process or end it!
              if (r.anotherEntry) askRole();
              else endEntry();
            })

          break;
        default:

          // If all options does not match end it!
          endEntry();
          break;
      }

    })

  }

  endEntry = () => {
    
    accessFileAsync(OUTPUT_DIR)
    .catch(function (err) {
      if (err && err.code === 'ENOENT') {
        mkdirFileAsync('output')
      }
      return true
    })
    .then(() => {
      writeFileAsync(outputPath, render(teamList))
      .then(() => {
        console.log('Team roster is complete!')
      })
      .catch(err => {
        console.log('Unable to render team roster.')
      })
    })
  }
 
  askRole();

}

init();
