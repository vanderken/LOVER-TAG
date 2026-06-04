// ─── PAYMONGO CONFIG ──────────────────────────────────────────
// Use your PayMongo Secret Key (sk_live_xxx) from:
// https://dashboard.paymongo.com → Developers → API Keys
const PAYMONGO_SECRET_KEY = 'sk_live_t6qzgBt4sQvbGSRqr5Z88T7h';
// ─────────────────────────────────────────────────────────────

// Amount is in CENTAVOS (₱100 = 10000 centavos)
const AMOUNT = 10000;

// Create a GCash payment intent and source
export async function createGCashPayment(tagSlug, userEmail) {
  const encoded = btoa(PAYMONGO_SECRET_KEY + ':');

  // Step 1: Create a Payment Intent
  const intentRes = await fetch('https://api.paymongo.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: AMOUNT,
          currency: 'PHP',
          payment_method_allowed: ['gcash'],
          description: `LOVER TAG — ${tagSlug} (${userEmail})`,
        },
      },
    }),
  });

  const intentData = await intentRes.json();
  if (!intentRes.ok || !intentData?.data) {
    console.error('Payment Intent Error:', intentData);
    throw new Error(intentData?.errors?.[0]?.detail || 'Failed to create Payment Intent');
  }
  const intentId = intentData.data.id;

  // Step 2: Create a GCash Source
  const sourceRes = await fetch('https://api.paymongo.com/v1/sources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: AMOUNT,
          currency: 'PHP',
          type: 'gcash',
          redirect: {
            success: 'https://yourapp.com/success',
            failed: 'https://yourapp.com/failed',
          },
        },
      },
    }),
  });

  const sourceData = await sourceRes.json();
  if (!sourceRes.ok || !sourceData?.data) {
    console.error('GCash Source Error:', sourceData);
    throw new Error(sourceData?.errors?.[0]?.detail || 'Failed to create GCash Source');
  }

  const checkoutUrl = sourceData.data.attributes.redirect.checkout_url;
  return { checkoutUrl, intentId };
}

// Poll PayMongo to check if the payment intent has succeeded
export async function checkPaymentStatus(intentId) {
  const encoded = btoa(PAYMONGO_SECRET_KEY + ':');
  const res = await fetch(`https://api.paymongo.com/v1/payment_intents/${intentId}`, {
    headers: { Authorization: `Basic ${encoded}` },
  });
  const data = await res.json();
  if (!res.ok || !data?.data) {
    console.error('Status Check Error:', data);
    throw new Error(data?.errors?.[0]?.detail || 'Failed to check payment status');
  }
  const status = data.data.attributes.status;
  return status === 'succeeded';
}
