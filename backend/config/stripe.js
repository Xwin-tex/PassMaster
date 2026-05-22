const Stripe = require('stripe');
require('dotenv').config();

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.warn('WARNING: STRIPE_SECRET_KEY not set. Payment features disabled.');
}

const stripe = stripeKey ? Stripe(stripeKey) : null;

module.exports = stripe;
