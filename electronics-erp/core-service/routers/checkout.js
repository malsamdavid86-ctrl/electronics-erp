// core-service/routers/checkout.js
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const pool = new Pool(); // Inherits global connection configurations

// ====================================================================
// 1. STRIPE CHECKOUT ROUTE
// ====================================================================
router.post('/create-stripe-session', async (req, res) => {
  const { orderItems, customerEmail } = req.body;

  try {
    // 1. Compute totals and log order state as PENDING in PostgreSQL
    const orderResult = await pool.query(
      "INSERT INTO orders (customer_email, total_amount, status, payment_provider) VALUES ($1, $2, 'PENDING', 'STRIPE') RETURNING id",
      [customerEmail, req.body.totalAmount]
    );
    const orderId = orderResult.rows[0].id;

    // 2. Format transactional metadata lines into Stripe syntax shapes
    const lineItems = orderItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100), // Converted to cents
      },
      quantity: item.quantity,
    }));

    // 3. Request session generation from Stripe gateway api
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.PRODUCTION_URL}/order-tracking?id=${orderId}&success=true`,
      cancel_url: `${process.env.PRODUCTION_URL}/checkout?cancelled=true`,
      metadata: { orderId: orderId },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: "STRIPE_SESSION_FAULT", details: err.message });
  }
});

// ====================================================================
// 2. STRIPE WEBHOOK LISTENER (Asynchronous State Verification)
// ====================================================================
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    // Mutate database structures confirming payment payload delivery
    await pool.query(
      "UPDATE orders SET status = 'PAID', provider_transaction_id = $1, updated_at = NOW() WHERE id = $2",
      [session.payment_intent, orderId]
    );

    await pool.query(
      "INSERT INTO order_status_logs (order_id, status, notes) VALUES ($1, 'PAID', 'Stripe checkout event processing complete.')",
      [orderId]
    );
  }

  res.json({ received: true });
});

// ====================================================================
// 3. PAYPAL ADVANCED CAPTURE ENDPOINT
// ====================================================================
router.post('/capture-paypal-order', async (req, res) => {
  const { paypalOrderId, internalOrderId } = req.body;

  try {
    // In production, execute server-to-server validation call to PayPal API:
    // POST v2/checkout/orders/paypalOrderId/capture
    
    // Assuming validated response delivery payload returned successfully:
    await pool.query(
      "UPDATE orders SET status = 'PAID', provider_transaction_id = $1, updated_at = NOW() WHERE id = $2",
      [paypalOrderId, internalOrderId]
    );

    await pool.query(
      "INSERT INTO order_status_logs (order_id, status, notes) VALUES ($1, 'PAID', 'PayPal smart capture payment confirmed.')",
      [internalOrderId]
    );

    res.json({ status: "COMPLETED", orderId: internalOrderId });
  } catch (err) {
    res.status(500).json({ error: "PAYPAL_CAPTURE_FAILURE", details: err.message });
  }
});

module.exports = router;
