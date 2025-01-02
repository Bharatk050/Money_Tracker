const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

const uri = "<>";
const client = new MongoClient(uri);
const dbName = "Tracker";
const collectionName = "Money_Tracker";

app.use(cors());
app.use(express.json());

app.post('/expenses', async (req, res) => {
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const expense = req.body; 
        const result = await collection.insertOne(expense);

        res.status(201).json({ message: 'Expense added', id: result.insertedId });
    } catch (error) {
        console.error('Error saving expense:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});