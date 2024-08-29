const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path'); // Import path module for resolving paths
const cors = require('cors');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());



const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const Item = sequelize.define('Item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER, 
    allowNull: false,
    defaultValue: 0  
  },
  description: {
    type: DataTypes.STRING, 
    allowNull: true
  }
});

sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Database sync error:', err));

  app.get('/', async (req, res) => {
    try {
      res.json("up and running");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

app.get('/items', async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = await Item.findByPk(id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).send('Item not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/items', async (req, res) => {
  try {
    const newItem = await Item.create(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.put('/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await Item.update(req.body, { where: { id } });
    if (updated) {
      const updatedItem = await Item.findByPk(id);
      res.json(updatedItem);
    } else {
      res.status(404).send('Item not found');
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await Item.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).send('Item not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
