const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// List Products
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get Single Product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add Product (auth required)
router.post('/', auth, async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

// Delete Product (auth required)
router.delete('/:id', auth, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Product deleted' });
});

module.exports = router;