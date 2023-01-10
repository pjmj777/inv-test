const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/restaurant-inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Use body-parser to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Define schema for inventory items
const inventoryItemSchema = new mongoose.Schema({
  name: String,
  yield: Number,
  unit: String,
  supplier: String,
  cost: Number,
  quantity: Number
});

// Create model for inventory items
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

// Define schema for purchase orders
const purchaseOrderSchema = new mongoose.Schema({
  supplier: String,
  items: [{
    name: String,
    yield: Number,
    unit: String,
    cost: Number,
    quantity: Number
  }],
  totalCost: Number
});

// Create model for purchase orders
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

// Define route for creating a new inventory item
app.post('/inventory', (req, res) => {
  // Create a new inventory item
  const newInventoryItem = new InventoryItem({
    name: req.body.name,
    yield: req.body.yield,
    unit: req.body.unit,
    supplier: req.body.supplier,
    cost: req.body.cost,
    quantity: req.body.quantity
  });

  // Save the new inventory item to the database
  newInventoryItem.save((err, item) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(item);
    }
  });
});

// Define route for creating a new purchase order
app.post('/purchase-orders', (req, res) => {
  // Find all inventory items for the specified supplier
  InventoryItem.find({ supplier: req.body.supplier }, (err, items) => {
    if (err) {
      res.status(500).send(err);
    } else {
      // Calculate the total cost of the purchase order
      let totalCost = 0;
      items.forEach((item) => {
        totalCost += item.cost * item.quantity;
      });

      // Create a new purchase order
      const newPurchaseOrder = new PurchaseOrder({
        supplier: req.body.supplier,
        items: items,
        totalCost: totalCost
      });

      // Save the new purchase order to the database
      newPurchaseOrder.save((err, order) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(order);
        }
      });
    }
  });
});

// Define route for generating a report on cost per inventory unit
app.get('/cost-per-unit', (req, res) => {
  // Find all inventory items
  InventoryItem.find((err, items) => {
    if (err) {
      res.status(500).send(err);
    } else {
      // Calculate the cost per unit for each inventory item
      const report = [];
      items.forEach((item) => {
        report.push({
          name: item.name,
          unit: item.unit,
          costPerUnit: item.cost / item.yield
        });
      });

      // Send the report back to the client
      res.send(report);
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
