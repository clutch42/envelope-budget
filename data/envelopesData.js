let envelopes = [];
let nextId = 1;

function getNextId() {
  return nextId++;
}

module.exports = {
  envelopes,
  getNextId
};