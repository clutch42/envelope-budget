const express = require('express');
const router = express.Router();
const { Transaction, Envelope } = require('../models');

// POST /transactions - Create a new transaction
router.post('/', async (req, res) => {
  const { date, amount, recipient, envelopeId } = req.body;
  const transactionDate = date ? new Date(date) : new Date();

  if (!transactionDate || typeof amount !== 'number' || !recipient || !envelopeId) {
    return res.status(400).json({ error: 'Invalid transaction data' });
  }

  try {
    const envelope = await Envelope.findByPk(envelopeId);
    if (!envelope) {
      return res.status(404).json({ error: 'Envelope not found' });
    }

    if (envelope.balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds in envelope' });
    }

    envelope.balance -= amount;
    await envelope.save();

    const transaction = await Transaction.create({
      date: transactionDate,
      amount,
      recipient,
      envelopeId,
    });

    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
});

// GET /transactions - Retrieve all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

// GET /transactions/:id - Retrieve a specific transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve transaction' });
  }
});

// GET /transactions/envelope/:envelopeId - Get all transactions for a specific envelope
router.get('/envelope/:envelopeId', async (req, res) => {
  const envelopeId = parseInt(req.params.envelopeId);

  try {
    const transactions = await Transaction.findAll({
      where: { envelopeId },
      order: [['date', 'DESC']],
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
  }
});

// DELETE /transactions/:id - Delete a specific transaction
router.delete('/:id', async (req, res) => {
  const transactionId = parseInt(req.params.id);

  try {
    const transaction = await Transaction.findByPk(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const envelope = await Envelope.findByPk(transaction.envelopeId);
    if (!envelope) {
      return res.status(404).json({ error: 'Associated envelope not found' });
    }

    // Restore the balance
    envelope.balance += transaction.amount;
    await envelope.save();

    // Delete the transaction
    await transaction.destroy();

    res.json({ message: 'Transaction deleted and balance restored' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction', details: err.message });
  }
});

module.exports = router;