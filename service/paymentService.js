import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from './config';

const TOKEN_KEY = '@gold_token';

/**
 * Create order for subscription. Returns { orderId, razorpayOrderId, amount, key_id } for checkout.
 * @param {string} type - 'user_subscription' | 'shop_subscription'
 */
export async function createOrder(type) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('Login required');
  const res = await fetch(API_URLS.PaymentCreateOrder, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create order');
  return data.data;
}

/**
 * Verify payment after Razorpay success.
 */
export async function verifyPayment(payload) {
  const res = await fetch(API_URLS.PaymentVerify, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Payment verification failed');
  return data;
}

/**
 * Open Razorpay checkout. Uses react-native-razorpay if available.
 * Install: npm install react-native-razorpay (and link / rebuild for native).
 * @param {{ key_id: string, razorpayOrderId: string, amount: number, currency: string, description: string }} options
 * @returns {Promise<{ razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string }>}
 */
export async function openRazorpayCheckout(options) {
  let RazorpayCheckout;
  try {
    RazorpayCheckout = require('react-native-razorpay').default;
  } catch (e) {
    throw new Error(
      'Razorpay SDK not installed. Run: npm install react-native-razorpay, then rebuild the app.'
    );
  }
  return new Promise((resolve, reject) => {
    RazorpayCheckout.open({
      amount: String(options.amount),
      currency: options.currency || 'INR',
      key_id: options.key_id,
      order_id: options.razorpayOrderId,
      name: options.name || 'Dhiora Gold',
      description: options.description || 'Subscription',
    })
      .then((data) => {
        // SDK may return snake_case or camelCase
        const paymentId = data.razorpay_payment_id || data.razorpayPaymentId || '';
        const orderId = data.razorpay_order_id || data.razorpayOrderId || '';
        const signature = data.razorpay_signature || data.razorpaySignature || '';
        resolve({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
        });
      })
      .catch((err) => {
        if (err && (err.code === 2 || err.code === 0)) reject(new Error('Payment cancelled'));
        else reject(new Error(err?.description || err?.message || 'Payment failed'));
      });
  });
}
