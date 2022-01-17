const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// We create a schema for an order
let orderSchema = Schema({
  username: { type: String, required: true },
  restaurant: { type: String, required: true },
  summary: {type: Array, required: true},
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
