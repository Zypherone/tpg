const axios = require("axios");

// Let create the ajax function
const ajax = input => {
  let endpoint = `https://api.github.com/users/${input}`;

  return axios.get(endpoint)
    .then(r => r.data.login)
    .catch(r => false) 
}

//const test = ajax('zypherone').then(console.log)

module.exports = ajax;