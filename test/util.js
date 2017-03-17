const fs = require('fs');
const path = require('path');

function getFixturePath(name) {
  return path.join(__dirname, '..', 'test', 'fixtures', name);
}

function getFixture(file) {
  return fs.readFileSync(getFixturePath(file), 'utf8');
}

module.exports = {
  getFixture,
  getFixturePath
};