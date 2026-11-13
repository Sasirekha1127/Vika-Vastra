// routes/customerAddressRoutes.js
const express = require('express');
const router = express.Router();
const customerAddressController = require('../controllers/customerAddressController');

// Get all addresses for a customer
router.get('/:customerId/addresses', customerAddressController.getCustomerAddresses);

// Add a new address
router.post('/:customerId/addresses', customerAddressController.addCustomerAddress);

// Update an address
router.put('/:customerId/addresses/:addressId', customerAddressController.updateCustomerAddress);

// Delete an address
router.delete('/:customerId/addresses/:addressId', customerAddressController.deleteCustomerAddress);

module.exports = router;