const express = require('express');
const router = express.Router();
const { Transaction, Envelope } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         date:
 *           type: string
 *           format: date-time
 *         amount:
 *           type: number
 *         recipient:
 *           type: string
 *         envelopeId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         date: "2025-05-20T18:34:00Z"
 *         amount: 45.99
 *         recipient: "Target"
 *         envelopeId: 2
 *         createdAt: "2025-05-20T18:34:00Z"
 *         updatedAt: "2025-05-20T18:34:00Z"
 * 
 *     NewTransaction:
 *       type: object
 *       required:
 *         - amount
 *         - recipient
 *         - envelopeId
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *           description: Optional — defaults to now
 *         amount:
 *           type: number
 *         recipient:
 *           type: string
 *         envelopeId:
 *           type: integer
 *       example:
 *         amount: 45.99
 *         recipient: "Target"
 *         envelopeId: 2
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewTransaction'
 *     responses:
 *       201:
 *         description: Transaction created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Envelope not found or insufficient funds
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Retrieve all transactions
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Failed to retrieve transactions
 */
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Retrieve a specific transaction by ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction to retrieve
 *     responses:
 *       200:
 *         description: A transaction object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Failed to retrieve transaction
 */
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

/**
 * @swagger
 * /transactions/envelope/{envelopeId}:
 *   get:
 *     summary: Retrieve all transactions for a specific envelope
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: envelopeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the envelope
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Failed to fetch transactions
 */
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

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Delete a specific transaction and restore envelope balance
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the transaction
 *     responses:
 *       200:
 *         description: Transaction deleted and balance restored
 *       404:
 *         description: Transaction or envelope not found
 *       500:
 *         description: Failed to delete transaction
 */
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