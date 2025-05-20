const express = require('express');
const router = express.Router();
const data = require('../data/envelopesData');
const { Envelope } = require('../models');

// GET /envelopes - Retrieve all envelopes
router.get('/', async (req, res) => {
  try {
    const envelopes = await Envelope.findAll();
    res.json(envelopes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve envelopes'});
  }
});

// GET /envelopes/:id - Retrieve a specific envelope
router.get('/:id', async (req, res) => {
  try {
    const envelope = await Envelope.findByPk(req.params.id);
    if (!envelope) {
      return res.status(404).json({ error: 'Envelope not found' });
    }
    res.json(envelope);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve envelope' });
  }


});

// POST /envelopes - Create a new envelope
router.post('/', async (req, res) => {
  const { name, balance } = req.body;

  if (!name || typeof balance !== 'number' || balance < 0) {
    return res.status(400).json({ error: 'Invalid envelope data' });
  }

  try {
    const newEnvelope = await Envelope.create( {name, balance });
    res.status(201).json(newEnvelope);
  } catch {
    res.status(500).json({ error: 'Failed to create envelope' });
  }
});

// PUT /envelopes/:id - Update a specific envelope
router.put('/:id', async (req, res) => {
  const { name, balance } = req.body;

  try {
    const envelope = await Envelope.findByPk(req.params.id);
    
    if (!envelope) {
      return res.status(404).json({ error: 'Envelope not found' });
    }

    if (name !== undefined) {
      envelope.name = name;
    }
    
    if (balance !== undefined) {
      if (typeof balance !== 'number' || balance < 0) {
        return res.status(400).json({ error: 'Invalid balance' });
      }
      envelope.balance = balance;
    }
    await envelope.save();
    res.json(envelope);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update envelope' })
  }
});

// DELETE /envelopes/:id - Delete a specific envelope
router.delete('/:id', (req, res) => {
  const envelopeId = parseInt(req.params.id);

  try {
    const deletedCount = Envelope.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Envelope not found' });
    }
    res.json({ message: 'Envelope deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete envelope' });
  }
});

// POST /envelopes/transfer - Transfer budget from one envelope to another
router.post('/transfer', async (req, res) => {
  const { fromId, toId, amount } = req.body;

  if (
    typeof fromId !== 'number' ||
    typeof toId !== 'number' ||
    typeof amount !== 'number' ||
    amount <= 0
  ) {
    return res.status(400).json({ error: 'Invalid transfer data' });
  }

  const t = await Envelope.sequelize.transaction();

  try {
    const fromEnvelope = await Envelope.findByPk(fromId);
    const toEnvelope = await Envelope.findByPk(toId);

    if (!fromEnvelope || !toEnvelope) {
      await t.rollback();
      return res.status(404).json({ error: 'One or both envelopes not found' });
    }

    if (fromEnvelope.balance < amount) {
      await t.rollback();
      return res.status(400).json({ error: 'Insufficient funds in source envelope' });
    }

    fromEnvelope.balance -= amount;
    toEnvelope.balance += amount;

    await fromEnvelope.save({ transaction: t });
    await toEnvelope.save({ transaction: t });

    await t.commit();
    
    res.json({
      message: `Transferred $${amount} from '${fromEnvelope.name}' to '${toEnvelope.name}'`,
      from: fromEnvelope,
      to: toEnvelope
    });
  } catch (err) {
    res.status(500).json({ error: 'Transfer failed', details: err.message })
  }
});

module.exports = router;