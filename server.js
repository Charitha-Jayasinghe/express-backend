const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const sequelize = require('./database');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql');  // Import GraphQL schema
const Item = require('./models/Item');  // Import the Item model

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Existing RESTful routes for items
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
    const item = await Item.findByPk(req.params.id);
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
    const [updated] = await Item.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const updatedItem = await Item.findByPk(req.params.id);
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
    const deleted = await Item.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).send('Item not found');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,  // Enables GraphiQL UI for testing queries
}));

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    console.log(`Server running at http://localhost:${port}/`);
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
});