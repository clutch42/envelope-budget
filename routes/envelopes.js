const express = require('express');
const router = express.Router();
const { envelopes, getNextId } = require('../data/envelopesData');

// POST /envelopes - Create a new envelope
router.post('/', (req, res) => {
  const { name, budget } = req.body;

  if (!name || typeof budget !== 'number' || budget < 0) {
    return res.status(400).json({ error: 'Invalid envelope data' });
  }

  const newEnvelope = {
    id: getNextId(),
    name,
    budget
  };

  envelopes.push(newEnvelope);
  res.status(201).json(newEnvelope);
});

module.exports = router;