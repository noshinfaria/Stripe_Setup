# Stripe Payment Integration with Apple Pay, Google Pay & card

This project is a simple web-based payment integration using **Stripe**, supporting:

- Card payments
- Apple Pay (Safari/iOS/macOS)
- Google Pay (Chrome on Android/Desktop)
- Billing address collection
- Payment Intent creation on the backend

---

##  Project Structure

- `server.js`: Node.js + Express server to handle PaymentIntent creation and Stripe webhook events.
- `index.html`: Frontend form using Stripe.js and Elements API to collect card details.

---

## Features

### Card Payments
- Users can enter their card information via Stripe Elements.

### Automatic Wallet Detection (Google Pay & Apple Pay)

Stripe automatically shows the **Google Pay** and **Apple Pay** buttons if the user meets the conditions:

- **Google Pay**: On Chrome (desktop or Android), logged into Google with a saved payment method.
- **Apple Pay**: On Safari (macOS/iOS), with a valid card in Apple Wallet and verified domain.

---

## Installation & Setup

### 1. Clone the Repo

```bash
git clone git@github.com:noshinfaria/Stripe_Setup.git
cd Stripe_Setup
```
2. Install Dependencies
```bash
npm install
```
3. Set Up Stripe API Keys
In server.js, replace your Stripe secret key:
```js
const stripe = require('stripe')('sk_test_...');
```
Replace the publishable key in index.html:
```js
const stripe = Stripe('pk_test_...');
```

### Apple Pay Setup
Go to your Stripe dashboard:
- Dashboard → Settings → Payment Methods
- Under Apple Pay, click “Add new domain”
- Verify the domain in Stripe.

This only needs to be done once per domain.

### Testing Apple Pay & Google Pay
- Google Pay (Testing Requirements)
Use Chrome (desktop or Android)
Be logged into a Google Account
Have a payment method saved at https://pay.google.com

- Apple Pay (Testing Requirements)
Use Safari on macOS or iOS
Be logged into iCloud
Have a card in Apple Wallet
Site must be served over HTTPS (or localhost)

### Webhooks (Optional)
A webhook endpoint is provided at /webhook to handle payment events like payment_intent.succeeded.
To enable:
Add your webhook secret:
```js
const endpointSecret = 'whsec_...';
```
Set the webhook URL in Stripe Dashboard:
```arduino
https://yourdomain.com/webhook
```

### Start the Server
```bash
node server.js
```
Visit: http://localhost:3000

### Notes
- Minimum payment amount: $0.50 (i.e., 50 cents)
- Stripe handles wallet detection (Google Pay, Apple Pay) automatically
- Remember to switch to live keys when going to production
- Apple Pay requires HTTPS (except localhost)



### File Locations
File	Purpose
server.js -	Backend API to create payment intents and handle webhooks
index.html - Frontend Stripe Elements integration and form
