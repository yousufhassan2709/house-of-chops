const ZIINA_BASE = 'https://api-v2.ziina.com';

function authHeaders() {
  const key = process.env.ZIINA_API_KEY;
  if (!key) throw new Error('ZIINA_API_KEY is missing.');
  return { Authorization: `Bearer ${key}` };
}

export async function createPaymentIntent({ amountFils, successUrl, cancelUrl, failureUrl }) {
  const res = await fetch(`${ZIINA_BASE}/api/payment_intent`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountFils,
      currency_code: 'AED',
      message: 'House of Chops order',
      success_url: successUrl,
      cancel_url: cancelUrl,
      failure_url: failureUrl,
      test: process.env.ZIINA_TEST_MODE !== 'false',
    }),
  });
  if (!res.ok) {
    throw new Error(`Ziina create intent failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function getPaymentIntent(id) {
  const res = await fetch(`${ZIINA_BASE}/api/payment_intent/${id}`, { headers: authHeaders() });
  if (!res.ok) {
    throw new Error(`Ziina get intent failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
