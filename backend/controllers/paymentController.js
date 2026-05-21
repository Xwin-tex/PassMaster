const stripe = require('../config/stripe');
const Event = require('../models/Event');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { event_id, quantity = 1 } = req.body;

    const event = await Event.findById(event_id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const amount = Math.round(event.ticket_price * quantity * 100); // cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        event_id: String(event_id),
        buyer_id: String(req.user.id),
        quantity: String(quantity),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear intención de pago' });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { event_id, buyer_id } = paymentIntent.metadata;

    const pool = require('../config/db');
    await pool.execute(
      `UPDATE transactions SET payment_status = 'completed', payment_id = ?
       WHERE buyer_id = ? AND payment_status = 'pending'
       ORDER BY id DESC LIMIT 1`,
      [paymentIntent.id, buyer_id]
    );

    const { generateUniqueCode } = require('../utils/generateCode');
    const code = generateUniqueCode();
    await pool.execute(
      'INSERT INTO tickets (event_id, buyer_id, unique_code, status) VALUES (?, ?, ?, "active")',
      [event_id, buyer_id, code]
    );
  }

  res.json({ received: true });
};
