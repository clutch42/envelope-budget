const express = require('express');
const router = express.Router();
const data = require('../data/envelopesData');
const { Envelope } = require('../models');

/**
 * @swagger
 * components:
 *   schemas:
 *     Envelope:
 *       type: object
 *       required:
 *         - name
 *         - balance
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Envelope name
 *         balance:
 *           type: number
 *           format: float
 *           description: Amount available in the envelope
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         name: Rent
 *         balance: 1200.50
 *         createdAt: 2025-05-20T20:00:00.000Z
 *         updatedAt: 2025-05-20T20:00:00.000Z
 *     NewEnvelope:
 *       type: object
 *       required:
 *         - name
 *         - balance
 *       properties:
 *         name:
 *           type: string
 *           description: Envelope name
 *         balance:
 *           type: number
 *           format: float
 *           description: Initial balance
 *       example:
 *         name: Groceries
 *         balance: 500
 */

/**
 * @swagger
 * /envelopes:
 *   get:
 *     summary: Retrieve a list of all envelopes
 *     tags: [Envelopes]
 *     responses:
 *       200:
 *         description: A list of envelopes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Envelope'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const envelopes = await Envelope.findAll();
    res.json(envelopes);
  } catch (err) {
    console.error('Error fetching envelopes:', err); 
    res.status(500).json({ error: 'Failed to retrieve envelopes'});
  }
});

/**
 * @swagger
 * /envelopes/{id}:
 *   get:
 *     summary: Retrieve a specific envelope by ID
 *     tags: [Envelopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Envelope ID
 *     responses:
 *       200:
 *         description: Envelope found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Envelope'
 *       404:
 *         description: Envelope not found
 *       500:
 *         description: Failed to retrieve envelope
 */
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

/**
 * @swagger
 * /envelopes:
 *   post:
 *     summary: Create a new envelope
 *     tags: [Envelopes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewEnvelope'
 *     responses:
 *       201:
 *         description: The created envelope
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Envelope'
 *       400:
 *         description: Invalid envelope data
 *       500:
 *         description: Failed to create envelope
 */
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

/**
 * @swagger
 * /envelopes/{id}:
 *   put:
 *     summary: Update an existing envelope
 *     tags: [Envelopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Envelope ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               balance:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Updated envelope
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Envelope'
 *       400:
 *         description: Invalid balance
 *       404:
 *         description: Envelope not found
 *       500:
 *         description: Failed to update envelope
 */
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

/**
 * @swagger
 * /envelopes/{id}:
 *   delete:
 *     summary: Delete an envelope
 *     tags: [Envelopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Envelope ID
 *     responses:
 *       200:
 *         description: Envelope deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Envelope not found
 *       500:
 *         description: Failed to delete envelope
 */
router.delete('/:id', async (req, res) => {
  const envelopeId = parseInt(req.params.id);

  try {
    const deletedCount = await Envelope.destroy({ where: { id: req.params.id } });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Envelope not found' });
    }
    res.json({ message: 'Envelope deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete envelope' });
  }
});

/**
 * @swagger
 * /envelopes/transfer:
 *   post:
 *     summary: Transfer funds from one envelope to another
 *     tags: [Envelopes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromId
 *               - toId
 *               - amount
 *             properties:
 *               fromId:
 *                 type: integer
 *               toId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 from:
 *                   $ref: '#/components/schemas/Envelope'
 *                 to:
 *                   $ref: '#/components/schemas/Envelope'
 *       400:
 *         description: Invalid transfer data or insufficient funds
 *       404:
 *         description: One or both envelopes not found
 *       500:
 *         description: Transfer failed
 */
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