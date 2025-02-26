const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  const order = new Order({ userId: req.user._id, items: cart.items, total: cart.total });
  await order.save();
  await Cart.findOneAndDelete({ userId: req.user._id });
  res.json(order);
});

router.get('/', auth, async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ date: -1 });
  res.json(orders);
});

module.exports = router;  