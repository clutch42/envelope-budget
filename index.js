const express = require('express');
const app = express();
const PORT = 3000;

const envelopeRoutes = require('./routes/envelopes');
const transactionsRouter = require('./routes/transactions');
const { sequelize } = require('./models'); 

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected.');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });

app.use(express.json());

app.use('/envelopes', envelopeRoutes);
app.use('/transactions', transactionsRouter);

app.get('/', (req, res) => {
    res.send('Hello World');
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});