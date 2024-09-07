const { 
    GraphQLObjectType, 
    GraphQLSchema, 
    GraphQLInt, 
    GraphQLString, 
    GraphQLList, 
    GraphQLNonNull 
  } = require('graphql');
  const Item = require('./models/Item');
  
  // Define ItemType
  const ItemType = new GraphQLObjectType({
    name: 'Item',
    fields: {
      id: { type: GraphQLInt },
      name: { type: GraphQLString },
      quantity: { type: GraphQLInt },
      description: { type: GraphQLString },
      price: { type: GraphQLString },
      createdAt: { type: GraphQLString },
      updatedAt: { type: GraphQLString },
    },
  });
  
  // Define the Root Query
  const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      items: {
        type: new GraphQLList(ItemType),
        resolve() {
          return Item.findAll();
        },
      },
      item: {
        type: ItemType,
        args: { id: { type: GraphQLInt } },
        resolve(parent, args) {
          return Item.findByPk(args.id);
        },
      },
    },
  });
  
  // Define the Mutations
  const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      // Add Item Mutation
      addItem: {
        type: ItemType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          quantity: { type: new GraphQLNonNull(GraphQLInt) },
          description: { type: GraphQLString },
          price: { type: GraphQLString },
        },
        async resolve(parent, args) {
          try {
            const newItem = await Item.create({
              name: args.name,
              quantity: args.quantity,
              description: args.description,
            });
            return newItem;
          } catch (error) {
            throw new Error('Failed to create item');
          }
        },
      },
  
      // Update Item Mutation
      updateItem: {
        type: ItemType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLInt) },
          name: { type: GraphQLString },
          quantity: { type: GraphQLInt },
          description: { type: GraphQLString },
          price:{ type: GraphQLString },
        },
        async resolve(parent, args) {
          try {
            const [rowsUpdated, [updatedItem]] = await Item.update(
              { name: args.name, quantity: args.quantity, description: args.description },
              { where: { id: args.id }, returning: true }
            );
            if (rowsUpdated > 0) return updatedItem;
            throw new Error('Item not found');
          } catch (error) {
            throw new Error('Failed to update item');
          }
        },
      },
  
      // Delete Item Mutation
      deleteItem: {
        type: GraphQLString,
        args: {
          id: { type: new GraphQLNonNull(GraphQLInt) },
        },
        async resolve(parent, args) {
          try {
            const deleted = await Item.destroy({ where: { id: args.id } });
            if (deleted) return 'Item deleted successfully';
            throw new Error('Item not found');
          } catch (error) {
            throw new Error('Failed to delete item');
          }
        },
      },
    },
  });
  
  // Create the schema
  const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
  });
  
  module.exports = schema;