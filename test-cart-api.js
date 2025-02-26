const fetch = require('node-fetch');

/**
 * Utility to test the cart API directly
 * Run with: node test-cart-api.js
 */

// Configuration
const API_URL = 'http://localhost:5000/api/cart/add';
const TOKEN = 'your-token-here'; // Replace with an actual token from localStorage
const PRODUCT_ID = 'your-product-id-here'; // Replace with an actual product ID

async function testCartAPI() {
  try {
    console.log('Testing cart API with:');
    console.log('- Product ID:', PRODUCT_ID);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ productId: PRODUCT_ID, quantity: 1, price: 100 })
    });
    
    const status = response.status;
    const data = await response.json();
    
    console.log('Response status:', status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (status >= 400) {
      console.error('API request failed');
    } else {
      console.log('API request successful');
    }
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testCartAPI();
