const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpay = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY,
        key_secret: process.env.RAZORPAY_SECRET,
    });
};

exports.createOrder = async (req, res) => {
    try {
        console.log('KEY:', process.env.RAZORPAY_KEY);      // ← debug line
        console.log('SECRET:', process.env.RAZORPAY_SECRET); // ← debug line

        const razorpay = getRazorpay();
        const { amount } = req.body;

        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY,
        });
    } catch (error) {
        console.error('Razorpay create order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Razorpay verify error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};