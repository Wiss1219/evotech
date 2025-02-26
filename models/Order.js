const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: {
    type: Number,
    required: true
  },
  shippingDetails: {
    fullName: String,
    address: String,
    city: String,
    zipCode: String,
    email: String
  },
  paymentDetails: {
    cardNumber: String,
    expiryDate: String
  },
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);