import Razorpay from 'razorpay';

// Razorpay configuration
const key_id = 'rzp_test_1wSYUGMK0YWQFf';
const key_secret = 'IWtK7xheEIV3qbyBMXaelW0Y';

/**
 * Create a Razorpay order directly in the client.
 * @param {number} amount - Amount in rupees (e.g., 500 for ₹500).
 * @param {string} currency - Currency code (default: INR).
 * @returns {Object} - The created Razorpay order.
 */
export const createOrder = async (amount, currency = 'INR') => {
  try {
    // Create a Razorpay instance
    const razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });

    // Create an order
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Amount in paise
      currency,
      receipt: `receipt_${Math.floor(Math.random() * 10000)}`,
    });

    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Initialize the Razorpay payment modal.
 * @param {Object} order - Razorpay order details.
 */
export const initiatePayment = (order) => {
  const options = {
    key: key_id, // Razorpay Key ID
    amount: order.amount,
    currency: order.currency,
    name: 'Your Company Name',
    description: 'Test Transaction',
    order_id: order.id,
    handler: (response) => {
      console.log('Payment successful:', response);
      alert('Payment successful! Order ID: ' + response.razorpay_order_id);
    },
    prefill: {
      name: 'Customer Name',
      email: 'customer@example.com',
      contact: '9999999999',
    },
    theme: {
      color: '#3399cc',
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
