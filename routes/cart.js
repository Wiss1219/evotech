const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Add to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    console.log('Adding to cart:', { productId, quantity });

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
        total: 0
      });
    }

    const existingItem = cart.items.find(item => 
      item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity) + Number(quantity);
    } else {
      cart.items.push({
        productId,
        quantity: Number(quantity),
        price: Number(product.price)
      });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => {
      const itemProduct = item.productId.toString() === productId ? 
        product : 
        { price: item.price };
      return sum + (Number(item.quantity) * Number(itemProduct.price));
    }, 0);

    await cart.save();

    // Return populated cart
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price image');

    res.json(populatedCart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

// Remove from cart - Changed from POST to DELETE
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => 
      item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate total
    cart.total = cart.items.reduce((sum, item) => 
      sum + (Number(item.quantity) * Number(item.price)), 0
    );

    await cart.save();

    // Return transformed cart data
    const transformedCart = {
      items: cart.items.map(item => ({
        id: item._id,
        productId: item.productId,
        price: item.price,
        quantity: item.quantity
      }))
    };

    res.json(transformedCart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update cart item quantity
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // Validate inputs
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the item in the cart
    const cartItem = cart.items.find(item => 
      item._id.toString() === req.params.itemId
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Get the current product price
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update quantity and ensure price is current
    cartItem.quantity = Number(quantity);
    cartItem.price = product.price;

    // Recalculate cart total
    cart.total = cart.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.price));
    }, 0);

    await cart.save();

    // Return populated cart data
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name price image');

    res.json(populatedCart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ 
      message: 'Failed to update cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get cart with populated product details
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching cart for user:', req.user.id);

    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.productId',
        select: 'name price image description',
        model: 'Product'
      });
    
    if (!cart) {
      console.log('No cart found, returning empty array');
      return res.json({ items: [] });
    }

    // Transform and validate each item
    const transformedItems = await Promise.all(cart.items.map(async (item) => {
      // Verify product still exists
      const product = await Product.findById(item.productId);
      
      return {
        id: item._id.toString(),
        productId: item.productId._id,
        name: product ? product.name : 'Product Not Found',
        price: product ? product.price : 0,
        image: product ? product.image : 'https://placehold.co/400x400/1a1a1a/ffffff',
        description: product ? product.description : '',
        quantity: Number(item.quantity)
      };
    }));

    // Filter out invalid products and recalculate total
    const validItems = transformedItems.filter(item => item.price > 0);
    const total = validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    console.log('Returning cart with items:', validItems.length);
    res.json({ 
      items: validItems,
      total: Number(total.toFixed(2))
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;