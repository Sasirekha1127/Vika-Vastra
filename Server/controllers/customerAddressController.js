// controllers/customerAddressController.js
const CustomerAddress = require('../models/CustomerAddress');
const UserLogin = require('../models/UserLogin'); // FIX: was Customer, now UserLogin

// ============================================
// Get all addresses for a customer
// ============================================
exports.getCustomerAddresses = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Check if user exists in userlogin table
        const user = await UserLogin.findByPk(customerId, {
            attributes: ['id', 'username', 'email', 'phone']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${customerId} not found`
            });
        }

        const addresses = await CustomerAddress.findAll({
            where: { customer_id: customerId }
        });

        const formattedAddresses = addresses.map(addr => ({
            id:         addr.id,
            customerId: addr.customer_id,
            type:       addr.type,
            firstName:  addr.first_name,
            lastName:   addr.last_name,
            company:    addr.company   || '',
            address1:   addr.address1,
            address2:   addr.address2  || '',
            city:       addr.city,
            state:      addr.state,
            postcode:   addr.postcode,
            phone:      addr.phone,
            phone2:     addr.phone2    || '',
            email:      addr.email
        }));

        res.json(formattedAddresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch addresses',
            error: error.message
        });
    }
};

// ============================================
// Add a new address for a customer
// ============================================
exports.addCustomerAddress = async (req, res) => {
    try {
        const { customerId } = req.params;
        const {
            type, firstName, lastName, company,
            address1, address2, city, state,
            postcode, phone, phone2, email
        } = req.body;

        console.log('Adding address for customer:', customerId);
        console.log('Address data:', req.body);

        // Check if user exists in userlogin table
        const user = await UserLogin.findByPk(customerId, {
            attributes: ['id']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `Customer with ID ${customerId} not found`
            });
        }

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'address1', 'city', 'state', 'postcode', 'phone', 'email'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const newAddress = await CustomerAddress.create({
            customer_id: customerId,
            type:        type || 'billing',
            first_name:  firstName,
            last_name:   lastName,
            company:     company  || '',
            address1,
            address2:    address2 || '',
            city,
            state,
            postcode,
            phone,
            phone2:      phone2   || '',
            email
        });

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: {
                id:        newAddress.id,
                type:      newAddress.type,
                firstName: newAddress.first_name,
                lastName:  newAddress.last_name,
                company:   newAddress.company,
                address1:  newAddress.address1,
                address2:  newAddress.address2,
                city:      newAddress.city,
                state:     newAddress.state,
                postcode:  newAddress.postcode,
                phone:     newAddress.phone,
                phone2:    newAddress.phone2,
                email:     newAddress.email
            }
        });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add address',
            error: error.message
        });
    }
};

// ============================================
// Update an existing address
// ============================================
exports.updateCustomerAddress = async (req, res) => {
    try {
        const { customerId, addressId } = req.params;
        const {
            type, firstName, lastName, company,
            address1, address2, city, state,
            postcode, phone, phone2, email
        } = req.body;

        const address = await CustomerAddress.findOne({
            where: { id: addressId, customer_id: customerId }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found or does not belong to this customer'
            });
        }

        await address.update({
            type:       type       || address.type,
            first_name: firstName  || address.first_name,
            last_name:  lastName   || address.last_name,
            company:    company    !== undefined ? company    : address.company,
            address1:   address1   || address.address1,
            address2:   address2   !== undefined ? address2   : address.address2,
            city:       city       || address.city,
            state:      state      || address.state,
            postcode:   postcode   || address.postcode,
            phone:      phone      || address.phone,
            phone2:     phone2     !== undefined ? phone2     : address.phone2,
            email:      email      || address.email
        });

        const updated = await CustomerAddress.findByPk(addressId);

        res.json({
            success: true,
            message: 'Address updated successfully',
            data: {
                id:        updated.id,
                type:      updated.type,
                firstName: updated.first_name,
                lastName:  updated.last_name,
                company:   updated.company,
                address1:  updated.address1,
                address2:  updated.address2,
                city:      updated.city,
                state:     updated.state,
                postcode:  updated.postcode,
                phone:     updated.phone,
                phone2:    updated.phone2,
                email:     updated.email
            }
        });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update address',
            error: error.message
        });
    }
};

// ============================================
// Delete an address
// ============================================
exports.deleteCustomerAddress = async (req, res) => {
    try {
        const { customerId, addressId } = req.params;

        const address = await CustomerAddress.findOne({
            where: { id: addressId, customer_id: customerId }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found or does not belong to this customer'
            });
        }

        await address.destroy();

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete address',
            error: error.message
        });
    }
};