const express = require('express');
const router = express.Router();
const data = require('../data/envelopesData');

// GET /envelopes - Retrieve all envelopes
router.get('/', (req, res) => {
  res.json(data.envelopes);
});

// GET /envelopes/:id - Retrieve a specific envelope
router.get('/:id', (req, res) => {
  const envelopeId = parseInt(req.params.id);
  const envelope = data.envelopes.find(env => env.id === envelopeId);

  if (!envelope) {
    return res.status(404).json({ error: 'Envelope not found' });
  }

  res.json(envelope);
});

// POST /envelopes - Create a new envelope
router.post('/', (req, res) => {
  const { name, budget } = req.body;

  if (!name || typeof budget !== 'number' || budget < 0) {
    return res.status(400).json({ error: 'Invalid envelope data' });
  }

  const newEnvelope = {
    id: data.getNextId(),
    name,
    budget
  };

  data.envelopes.push(newEnvelope);
  res.status(201).json(newEnvelope);
});

// PUT /envelopes/:id - Update a specific envelope
router.put('/:id', (req, res) => {
  const envelopeId = parseInt(req.params.id);
  const envelope = data.envelopes.find(env => env.id === envelopeId);

  if (!envelope) {
    return res.status(404).json({ error: 'Envelope not found' });
  }

  const { name, budget } = req.body;

  if (name !== undefined) {
    envelope.name = name;
  }

  if (budget !== undefined) {
    if (typeof budget !== 'number' || budget < 0) {
      return res.status(400).json({ error: 'Invalid budget' });
    }
    envelope.budget = budget;
  }

  res.json(envelope);
});

// DELETE /envelopes/:id - Delete a specific envelope
router.delete('/:id', (req, res) => {
  const envelopeId = parseInt(req.params.id);
  const index = data.envelopes.findIndex(env => env.id === envelopeId);

  if (index === -1) {
    return res.status(404).json({ error: 'Envelope not found' });
  }

  const deleted = data.envelopes.splice(index, 1)[0];
  res.json({ message: 'Envelope deleted', envelope: deleted });
});

module.exports = router;