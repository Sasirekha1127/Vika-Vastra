const express = require('express');
const router = express.Router();

const Customer = require('../models/Customer');
const customerController = require('../controllers/customerController');

// ============================================
// Customer CRUD
// ============================================

// Add customer
router.post('/add', customerController.addCustomer);

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get customer by ID
router.get('/:id', customerController.getCustomerById);

// Update customer
router.put('/:id', customerController.updateCustomer);

// Delete customer
router.delete('/:id', customerController.deleteCustomer);

// ============================================
// Get customer by email
// ============================================

router.get('/by-email', async (req, res) => {
    try {

        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const customer = await Customer.findOne({
            where: { email },
            attributes: ['id', 'name', 'email', 'phone']
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });

    } catch (err) {

        console.error('Error fetching customer by email:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ============================================
// Customer Address Routes
// ============================================

// Get all addresses for customer
router.get('/:id/addresses', customerController.getCustomerAddresses);

// Add address
router.post('/:id/addresses', customerController.addCustomerAddress);

// Update address
router.put('/:id/addresses/:addressId', customerController.updateCustomerAddress);

// Delete address
router.delete('/:id/addresses/:addressId', customerController.deleteCustomerAddress);

module.exports = router;