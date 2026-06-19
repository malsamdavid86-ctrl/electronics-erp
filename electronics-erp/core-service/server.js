const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize the Stripe engine
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

// ====================================================================
# DATA LAYER CONNECTION ARCHITECTURE
// ====================================================================

// PostgreSQL Connection Pooling Configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'securepassword',
  database: process.env.DB_NAME || 'electronics_erp',
});

// Redis Resilient Client Handshake Matrix
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => console.error('⚡ REDIS_CACHE_DISCONNECTED:', err));
redisClient.connect().then(() => console.log('✔ REDIS_PIPELINE_ESTABLISHED'));

// ====================================================================
# MIDDLEWARE CONTEXT
// ====================================================================

// Standard JSON parser. Stripe requires raw payload parsing for webhooks,
// so we skip this global middleware selectively inside the webhook route block.
app.use((req, res, next) => {
  if (req.originalUrl === '/finance/stripe-webhook-handler') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Global standard system heartbeat probe
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ONLINE', database: 'CONNECTED', cache: redisClient.isOpen ? 'ACTIVE' : 'OFFLINE' });
  } catch (err) {
    res.status(500).json({ status: 'DEGRADED', error: err.message });
  }
});

// ====================================================================
# HIGH-SPEED PC BUILD COMPATIBILITY & CACHE ENGINE
// ====================================================================

app.post('/verify-build-compatibility', async (req, res) => {
  const { selectedPartIds } = req.body;

  if (!selectedPartIds || !Array.isArray(selectedPartIds)) {
    return res.status(400).json({ error: "INVALID_MATRIX_PAYLOAD", pipeline_logs: ["Error: Selected tracking arrays invalid."] });
  }

  // Generate a unique cache key based on the sorted IDs to prevent redundant DB loops
  const cacheFingerprint = crypto
    .createHash('sha256')
    .update([...selectedPartIds].sort().join(','))
    .digest('hex');

  const cacheKey = `build:compat:${cacheFingerprint}`;

  try {
    // 1. Intercept processing via Redis Cache
    if (redisClient.isOpen) {
      const cachedReport = await redisClient.get(cacheKey);
      if (cachedReport) {
        const parsedReport = JSON.parse(cachedReport);
        parsedReport.pipeline_logs.unshift("REDIS_CACHE_HIT: Loaded calculated telemetry from ephemeral space.");
        return res.json(parsedReport);
      }
    }

    // 2. Cache Miss: Execute analytical lookup checks against PostgreSQL specs entries
    const pipeline_logs = ["REDIS_CACHE_MISS: Querying physical schema matrices."];
    
    if (selectedPartIds.length === 0) {
      return res.json({ valid: true, pipeline_logs: [...pipeline_logs, "EMPTY_SANDBOX_INITIALIZED: Assembly sandbox cleared."] });
    }

    const queryResult = await pool.query(
      'SELECT id, name, category, specs FROM parts WHERE id = ANY($1)',
      [selectedPartIds]
    );
    const components = queryResult.rows;

    let valid = true;
    const socketsFound = [];

    // Evaluate hardware interfaces across components
    components.forEach(part => {
      if (part.specs && part.specs.socket) {
        socketsFound.push(part.specs.socket);
        pipeline_logs.push(`LOG // Found Category [${part.category}] using Socket interface: ${part.specs.socket}`);
      }
    });

    // Conflict Rule: Ensure matching sockets if multiple CPU/Motherboard parts are staged
    if (socketsFound.length > 1 && !socketsFound.every(s => s === socketsFound[0])) {
      valid = false;
      pipeline_logs.push("CONFLICT_DETECTED: Socket configuration mismatch across computing nodes.");
    }

    const evaluationReport = { valid, pipeline_logs: [...pipeline_logs, valid ? "VERIFICATION_SUCCESSFUL: Build is operational." : "VERIFICATION_FAILURE: Check matching requirements."] };

    // 3. Save calculations inside Redis memory space for 1 hour to protect database threads
    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(evaluationReport));
    }

    res.json(evaluationReport);

  } catch (err) {
    console.error("⚡ MATRIX_EVALUATION_FAULT:", err);
    res.status(500).json({ error: "INTERNAL_CORE_FAULT", pipeline_logs: [err.message] });
  }
});

// ====================================================================
# STRIPE PAYMENT & LOAN FINANCING MODULES
// ====================================================================
/**
 * POST /api/core/finance/initialize-loan-financing
 * Spawns an upfront down-payment intent and constructs a structural 
 * multi-month installment loan profile using Stripe's native Billing Engine.
 */
app.post('/finance/initialize-loan-financing', async (req, res) => {
  const { userId, totalBuildCost, downPaymentAmount, monthlyInstallmentWeeks, customerEmail } = req.body;

  try {
    // 1. Calculate financial parameters safely in lowest integer denominations (cents)
    const downPaymentCents = Math.round(downPaymentAmount * 100);
    const remainingBalanceCents = Math.round((totalBuildCost - downPaymentAmount) * 100);
    
    // Calculate accurate installment divisions based on target distribution length
    const installmentsCount = parseInt(monthlyInstallmentWeeks) || 12; // Default to 12 monthly terms
    const recurringInstallmentCents = Math.round(remainingBalanceCents / installmentsCount);

    // 2. Provision or look up the core Customer Profile
    const customer = await stripe.customers.create({
      email: customerEmail,
      metadata: { internal_user_id: userId || 'anonymous_tech_build' }
    });

    // 3. Spawning the Upfront Down Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: downPaymentCents,
      currency: 'usd',
      customer: customer.id,
      description: 'Custom PC Hardware - Required Down Payment Deposit',
      metadata: { transaction_type: 'DOWN_PAYMENT', total_financed_loan: totalBuildCost - downPaymentAmount }
    });

    // 4. Generate a Transient Product Descriptor Sheet for the installment plan
    const recurringProduct = await stripe.products.create({
      name: `Financing Loan Payment Plan (ID: ${userId || 'SYS_BUILD'})`,
      description: `Hardware installment package. Total terms: ${installmentsCount} payments.`,
    });

    // 5. Build the explicit Price Matrix object tracking the automated monthly schedules
    const recurringPrice = await stripe.prices.create({
      product: recurringProduct.id,
      unit_amount: recurringInstallmentCents,
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      metadata: { total_installments_scheduled: installmentsCount }
    });

    // 6. Bind the Price Engine directly into an Active Corporate Subscription Profile
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: recurringPrice.id }],
      payment_behavior: 'default_incomplete', // Keeps profile safe until first payment clears
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      // Advanced Strategy: Cap the life cycle of the subscription to stop once the terms complete
      cancel_at_period_end: false, 
      metadata: {
        installments_target: installmentsCount,
        current_term_index: 1
      }
    });

    // Return all cryptographic parameters securely back to the frontend checkout components
    res.json({
      downPaymentClientSecret: paymentIntent.client_secret,
      subscriptionId: subscription.id,
      subscriptionClientSecret: subscription.latest_invoice.payment_intent ? subscription.latest_invoice.payment_intent.client_secret : null,
      customerId: customer.id
    });

  } catch (error) {
    console.error('组件支付逻辑错误 ⚡ STRIPE_LOAN_FINANCING_FAULT:', error);
    res.status(500).json({ error: "PAYMENT_GATEWAY_ERROR", msg: error.message });
  }
});
app.post('/finance/create-payment-intent', async (req, res) => {
  const { userId, totalBuildCost, downPaymentAmount } = req.body;

  try {
    const downPaymentCents = Math.round(downPaymentAmount * 100);

    // Provisions an customer shell identifier inside Stripe's grid
    const customer = await stripe.customers.create({
      metadata: { internal_user_id: userId || 'anonymous_tech_build' }
    });

    // Draft immediate deposit parameter fields
    const paymentIntent = await stripe.paymentIntents.create({
      amount: downPaymentCents,
      currency: 'usd',
      customer: customer.id,
      description: 'Custom Hardware Platform Down Payment Deposit',
      metadata: { transaction_type: 'DOWN_PAYMENT', build_total: totalBuildCost }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id
    });

  } catch (error) {
    console.error('⚡ STRIPE_INTENT_FAULT:', error);
    res.status(500).json({ error: "PAYMENT_GATEWAY_ERROR", msg: error.message });
  }
});

app.post('/finance/stripe-webhook-handler', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock');
  } catch (err) {
    console.error(`❌ WEBHOOK_SIGNATURE_INVALID: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manage transactional workflow milestones asynchronously
  switch (event.type) {
    case 'payment_intent.succeeded':
      const intent = event.data.object;
      console.log(`✔ TRANSACTION_CLEARED: Intent ${intent.id} processed successfully.`);
      // Run database pool update scripts here to authorize custom build releases
      break;

    case 'invoice.payment_succeeded':
      case 'invoice.payment_succeeded':
  const invoice = event.data.object;
  
  // If the invoice is tied to an active loan subscription track...
  if (invoice.subscription) {
    try {
      const subProfile = await stripe.subscriptions.retrieve(invoice.subscription);
      const totalTargetTerms = parseInt(subProfile.metadata.installments_target);
      
      // Pull previous billing data or count past paid invoices from your DB to calculate current term index
      // For this implementation context, we check if we've hit the final installment payment threshold
      const currentTermIndex = await countPaidInvoices(invoice.customer, invoice.subscription);

      console.log(`📡 Subscription Loop Check: Term [${currentTermIndex}/${totalTargetTerms}] Processed.`);

      if (currentTermIndex >= totalTargetTerms) {
        console.log(`🏁 LOAN_FULLY_PAID: Term target achieved. Cancelling subscription ${invoice.subscription} natively.`);
        
        // Gracefully cancel the subscription tracking timeline at the end of the current billing cycle
        await stripe.subscriptions.update(invoice.subscription, {
          cancel_at_period_end: true 
        });
      }
    } catch (subErr) {
      console.error('⚠️ SUBSCRIPTION_INTERCEPTION_ERROR:', subErr.message);
    }
  }
  break;
      const invoice = event.data.object;
      console.log(`💚 INSTALLMENT_PROCESSED: Loan layer payment recorded for subscription profile: ${invoice.subscription}`);
      break;

    default:
      console.log(`ℹ️ UNHANDLED_STRIPE_STREAM: ${event.type}`);
  }

  res.json({ received: true });
});

// Start listening for inbound application cluster queries
app.listen(PORT, () => {
  console.log(`📡 CORE_SERVICE NODE RUNNING ON PORT // ${PORT}`);
});
// Append this configuration to your core-service/server.js file
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

/**
 * POST /api/core/finance/create-payment-intent
 * Generates initial down-payment tokens and creates customer subscription ledger hooks
 */
app.post('/finance/create-payment-intent', async (req, res) => {
  const { userId, totalBuildCost, downPaymentAmount, monthlyInstallmentWeeks } = req.body;

  try {
    // 1. Calculate the matching monetary value in lowest denominations (cents/pence)
    const downPaymentCents = Math.round(downPaymentAmount * 100);

    // 2. Provision an immutable customer reference shell inside Stripe's infrastructure
    const customer = await stripe.customers.create({
      metadata: { internal_user_id: userId }
    });

    // 3. Draft the immediate upfront down payment parameters 
    const paymentIntent = await stripe.paymentIntents.create({
      amount: downPaymentCents,
      currency: 'usd',
      customer: customer.id,
      description: 'Custom Hardware Infrastructure Matrix Down Payment',
      metadata: { transaction_type: 'DOWN_PAYMENT' }
    });

    // 4. (Optional) Here you would also create a 'Price' object and 'Subscription' 
    // if using Stripe's native recurring billing system for the installment phase.

    res.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id
    });

  } catch (error) {
    console.error('⚡ STRIPE_INTENT_FAULT:', error);
    res.status(500).json({ error: "PAYMENT_GATEWAY_ERROR", msg: error.message });
  }
});

/**
 * POST /api/core/finance/stripe-webhook-handler
 * Strictly processes background payment success signals from Stripe.
 * NOTE: Needs raw body parsing enabled specifically for this route route block.
 */
app.post('/finance/stripe-webhook-handler', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Validate that the request originates from Stripe's authentic validation servers
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock');
  } catch (err) {
    console.error(`❌ WEBHOOK_SIGNATURE_INVALID: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Orchestrate systems updates based on processing events
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`✔ TRANSACTION_CLEARED: Intent ${paymentIntent.id} passed validation metrics.`);
      
      // Update your PostgreSQL database to mark the down payment paid
      // await pgPool.query('UPDATE builds SET status = $1 WHERE stripe_id = $2', ['FINANCED_ACTIVE', paymentIntent.id]);
      break;

    case 'invoice.payment_succeeded':
      // Captures recurring monthly automated loan installments 
      const invoice = event.data.object;
      console.log(`💚 INSTALLMENT_PROCESSED: Monthly payment logged for Subscription: ${invoice.subscription}`);
      break;

    default:
      console.log(`ℹ️ UNHANDLED_STRIPE_STREAM: ${event.type}`);
  }

  res.json({ received: true });
});
