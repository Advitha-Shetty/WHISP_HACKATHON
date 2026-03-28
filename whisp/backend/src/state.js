const bcrypt = require('bcryptjs');

let districts = [];
let reports = [];
const users = [
  {
    id: 1,
    email: 'admin@whisp.gov',
    password: bcrypt.hashSync('Admin@123', 10),
    role: 'government',
    name: 'District Admin',
  },
  {
    id: 2,
    email: 'citizen@whisp.in',
    password: bcrypt.hashSync('Citizen@123', 10),
    role: 'citizen',
    name: 'Citizen',
  },
];

function setDistricts(d) {
  districts = d;
}

function setReports(r) {
  reports = [...r];
}

function getReports() {
  return reports;
}

function getDistricts() {
  return districts;
}

function getUsers() {
  return users;
}

module.exports = {
  setDistricts,
  setReports,
  getDistricts,
  getReports,
  getUsers,
};
