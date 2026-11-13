const UserLogin = require('../models/UserLogin');
const CustomerAddress = require('../models/CustomerAddress');

// ============================================
// Add Customer
// ============================================

exports.addCustomer = async (req, res) => {
    try {

        const { name, phone, email } = req.body;

        const newUser = await UserLogin.create({
            username: name,
            phone: phone || null,
            email: email || null,
            password: ''
        });

        res.status(201).json({
            success: true,
            message: 'Customer Registered!',
            data: newUser
        });

    } catch (err) {

        console.error('Add customer error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ============================================
// Get All Customers
// ============================================

exports.getAllCustomers = async (req, res) => {
    try {

        const customers = await UserLogin.findAll({
            attributes: ['id', 'username', 'email', 'phone']
        });

        res.status(200).json(customers);

    } catch (err) {

        console.error('Get customers error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ============================================
// Get Customer By ID
// ============================================

exports.getCustomerById = async (req, res) => {
    try {

        const { id } = req.params;

        const customer = await UserLogin.findByPk(id, {
            attributes: ['id', 'username', 'email', 'phone']
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json(customer);

    } catch (err) {

        console.error('Get customer error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ============================================
// Update Customer
// ============================================

exports.updateCustomer = async (req, res) => {
    try {

        const { id } = req.params;

        const customer = await UserLogin.findByPk(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const { username, email, phone } = req.body;

        await customer.update({
            username,
            email,
            phone
        });

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: customer
        });

    } catch (err) {

        console.error('Update customer error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ============================================
// Delete Customer
// ============================================

exports.deleteCustomer = async (req, res) => {
    try {

        const { id } = req.params;

        const customer = await UserLogin.findByPk(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        await customer.destroy();

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully'
        });

    } catch (err) {

        console.error('Delete customer error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ============================================
// Get Customer Addresses
// ============================================

exports.getCustomerAddresses = async (req, res) => {
    try {

        const { id } = req.params;

        const addresses = await CustomerAddress.findAll({
            where: {
                customer_id: id
            }
        });

        res.status(200).json(addresses);

    } catch (err) {

        console.error('Get addresses error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ============================================
// Add Customer Address
// ============================================

exports.addCustomerAddress = async (req, res) => {
    try {

        const { id } = req.params;

        const newAddress = await CustomerAddress.create({
            customer_id: id,
            ...req.body
        });

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: newAddress
        });

    } catch (err) {

        console.error('Add address error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ============================================
// Update Customer Address
// ============================================

exports.updateCustomerAddress = async (req, res) => {
    try {

        const { id, addressId } = req.params;

        const address = await CustomerAddress.findOne({
            where: {
                id: addressId,
                customer_id: id
            }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        await address.update(req.body);

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: address
        });

    } catch (err) {

        console.error('Update address error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ============================================
// Delete Customer Address
// ============================================

exports.deleteCustomerAddress = async (req, res) => {
    try {

        const { id, addressId } = req.params;

        const address = await CustomerAddress.findOne({
            where: {
                id: addressId,
                customer_id: id
            }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        await address.destroy();

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });

    } catch (err) {

        console.error('Delete address error:', err);

        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};