const express = require('express');
const app = express();
const PORT = 3000;

const envelopeRoutes = require('./routes/envelopes');

app.use(express.json());

app.use('/envelopes', envelopeRoutes);


app.get('/', (req, res) => {
    res.send('Hello World');
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});