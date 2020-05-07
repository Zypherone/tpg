const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const ajax = require("./ajax.js");
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
      message: 'Enter ROLE\'s ID',
      validate: input => validateData(input, 'ID')      
    },
    {
      type: 'input',
      name: 'email',
      message: 'Enter ROLE\'s Email',
      validate: input => validateData(input, 'email')
    }
  ],
  // A list of questions for the manager's role
  manager: [
    {
      type: 'input',
      name: 'number',
      message: 'Enter Office Number',
      validate: input => validateData(input, 'phone')
    }
  ],
  // A list of questions for the engineer's role
  engineer: [
    {
      type: 'input',
      name: 'github',
      message: 'Enter GitHub username',
      validate: input => validateData(input, 'github')
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

const validateData = (input, type = 'ID') => {

  if (type === 'ID') {

    // Reference: https://www.w3resource.com/javascript/form/all-numbers.php
    if (!input.match(/^[0-9]+$/))
      return 'You have provided an invalid ID. Please use numbers only.'

    if (teamList.length && (teamList.filter(val => (val.id === input))).length) 
      return 'This id has already been assigned.';

    return true;

  } 
  else if (type === 'email') {
    
    // Reference: https://www.w3resource.com/javascript/form/email-validation.php
    if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input)) {
        return true;
    }
    return 'Please enter a valid email address.';

  }
  else if (type === 'phone') {

    // Reference: https://www.regexpal.com/?fam=99127
    if(/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/.test(input)) {
        return true;
    }
    return 'Please enter a number a valid phone number.';
    
  }
  else if (type === 'github') {

    return ajax(input).then(r => !r ? 'You have provided an invalid GitHub username.' : true)

  }
  else if (type === 'exist') {

    return (teamList.filter(val => (val.getRole() === input))).length

  }
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
    .then(processRoleEntry)

  }

  confirmExit = () => {

    inquirer.prompt({
      type: 'confirm',
      name: 'role',
      message: 'You have not entered anything. Are you sure you would like to quit?',
    })
    .then(processRoleEntry)

  }

  processRoleEntry = r => {
      
    const role = r.role;

    switch (role) {
      case true:
          // Double check if we actually wanted to exit or not
          endEntry(true);
        break;
      case false:
          // Double check if we actually wanted to exit or not.
          askRole();
        break;
      case 'manager':
        // Once we start the managers entry, list remove it from the array so we are not prompted.
        roles.splice(roles.indexOf('manager'), 1);

      case 'engineer':
      case 'intern':
          
        // Join and map a list of all the questions for the relevent roles.
        let listOfQuestions = questions.base.concat(questions[role]);

        // Since there is a requirement that one manager and at least one engineer is need. Only ask if it has been fufilled.
        if ((role === 'engineer' && validateData('Manager', 'exist')) 
          || (role === 'manager' && validateData('Engineer', 'exist'))) {
          listOfQuestions = listOfQuestions.concat(questions.anotherEntry);
        }
      
        listOfQuestions.map(val => {
          //val.message = val.message.replace('ROLE', role);
          val.message = val.message.replace('ROLE', 'employee');
        })

        inquirer
          .prompt(listOfQuestions)
          .then(r => processDetailedEntry(r, role))

        break;
      default:

        if (teamList.length) {

          if (validateData('Manager', 'exist') === 0) {
            console.log(`You have not included a manager. Please enter one.`);
            askRole();
            break;
          }
          
          if (validateData('Engineer', 'exist') === 0) {
            console.log('You have not included an engineer. Please include at least one engineer.');
            askRole();
            break;
          }

        } 
        else {
          confirmExit();
          break;
        }

        // If all options does not match end it!
        endEntry();
        break;
    }

  }

  processDetailedEntry = (r, role) => {

    // Based on the role lets pull the different classes and push to teamList.
    if (role === 'manager') 
      teamList.push(new Manager(r.name, r.id, r.email, r.number))
    else if (role === 'engineer')
      teamList.push(new Engineer(r.name, r.id, r.email, r.github))
    else 
      teamList.push(new Intern(r.name, r.id, r.email, r.school))

    // Lets repeat the process or end it!
    if (!r.hasOwnProperty('anotherEntry')) askRole();
    else if (r.anotherEntry) askRole();
    else endEntry();
  }

  endEntry = (cancel = false) => {

    if (cancel)
      return console.log('Team roster build cancled!');

    // Check if OUTPUT_DIR is accessible
    accessFileAsync(OUTPUT_DIR)
    .catch(function (err) {
      // If OUTPUT_DIR is unaccessible make new directory
      if (err && err.code === 'ENOENT') {
        mkdirFileAsync('output')
      }
      return true
    })
    .then(() => {
      // Lets render and write to file.
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
