import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, InteractionManager } from 'react-native';
import { API_URLS } from './config';

const TOKEN_KEY = '@gold_token';

// Timeout if native checkout never responds (e.g. getCurrentActivity was null on Android)
const CHECKOUT_OPEN_TIMEOUT_MS = 25000;

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
 * Open Razorpay checkout. Uses react-native-razorpay (must be linked; on Android rebuild after install).
 * Pass prefill to avoid Razorpay asking for contact/email again (uses logged-in user details).
 * @param {{ key_id: string, razorpayOrderId: string, amount: number, currency: string, description: string, name?: string, prefill?: { name?: string, email?: string, contact?: string } }} options
 * @returns {Promise<{ razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string }>}
 */
export async function openRazorpayCheckout(options) {
  const RNRazorpayCheckout = NativeModules.RNRazorpayCheckout;
  if (!RNRazorpayCheckout || typeof RNRazorpayCheckout.open !== 'function') {
    throw new Error(
      'Razorpay native module not available. Rebuild the app: npx react-native run-android (or run-ios). If using New Architecture, try disabling it in android/gradle.properties (newArchEnabled=false) and rebuild.'
    );
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const safeResolve = (data) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const paymentId = data.razorpay_payment_id || data.razorpayPaymentId || '';
      const orderId = data.razorpay_order_id || data.razorpayOrderId || '';
      const signature = data.razorpay_signature || data.razorpaySignature || '';
      resolve({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
      });
    };
    const safeReject = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (err && (err.code === 2 || err.code === 0)) reject(new Error('Payment cancelled'));
      else reject(new Error(err?.description || err?.message || 'Payment failed'));
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(
        new Error(
          'Payment screen did not open in time. Try again with the app in the foreground. On Android, ensure you have rebuilt the app after installing react-native-razorpay.'
        )
      );
    }, CHECKOUT_OPEN_TIMEOUT_MS);

    const checkoutOptions = {
      amount: String(options.amount),
      currency: options.currency || 'INR',
      key_id: options.key_id,
      key: options.key_id,
      order_id: options.razorpayOrderId,
      name: options.name || 'Dhiora Gold',
      description: options.description || 'Subscription',
    };

    // Prefill contact/email/name so Razorpay doesn't ask again (user is already logged in)
    if (options.prefill) {
      const p = options.prefill;
      const name = p.name ? String(p.name).trim() : '';
      const email = p.email ? String(p.email).trim() : '';
      let contact = '';
      if (p.contact) {
        const digits = String(p.contact).replace(/\D/g, '');
        contact = digits.length === 10 ? `91${digits}` : digits.length > 10 ? digits : `91${digits}`;
      }
      if (name || email || contact) {
        checkoutOptions.prefill = {};
        if (name) checkoutOptions.prefill.name = name;
        if (email) checkoutOptions.prefill.email = email;
        if (contact) checkoutOptions.prefill.contact = contact;
      }
    }

    const openCheckout = () => {
      try {
        require('react-native-razorpay').default.open(checkoutOptions).then(safeResolve).catch(safeReject);
      } catch (e) {
        safeReject(e);
      }
    };

    // On Android, opening immediately after tap can sometimes run before getCurrentActivity() is ready.
    InteractionManager.runAfterInteractions(() => {
      openCheckout();
    });
  });
}
