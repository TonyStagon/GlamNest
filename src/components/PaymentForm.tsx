
import { useState, FC } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import './PaymentForm.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  onSuccess: (paymentMethod: object) => void;
  onError?: (error: Error) => void;
  amount: number;
}

const CheckoutForm: FC<CheckoutFormProps> = ({ onSuccess, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      });
      if (methodError) throw methodError;

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount,
          currency: 'usd'
        })
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const { clientSecret } = await response.json();
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order-complete`,
        }
      });

      if (confirmError) throw confirmError;
      onSuccess(paymentMethod);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Payment processing failed'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="payment-methods">
          <div className="payment-card">
            <h3>Card Payment</h3>
            <CardElement options={{
              hidePostalCode: true,
              style: { base: { fontSize: '16px' } }
            }} />
          </div>
        </div>
        <button type="submit" disabled={!stripe || processing}>
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>

      <div className="paypal-container">
        <PayPalScriptProvider options={{
          clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
          currency: "USD",
          intent: "CAPTURE"
        }}>
          <PayPalButtons 
            style={{ layout: "vertical" }}
            createOrder={(_, actions) => {
              return actions.order?.create({
                intent: 'CAPTURE',
                purchase_units: [{
                  amount: { currency_code: "USD", value: amount.toFixed(2) }
                }]
              }) || Promise.resolve('');
            }}
            onApprove={(_, actions) => {
              return actions.order?.capture().then(details => {
                onSuccess(details);
                return;
              }) || Promise.resolve();
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
};

interface PaymentFormProps {
  amount: number;
  onSuccess: (paymentMethod: object) => void;
  onError?: (error: Error) => void;
}

export const PaymentForm: FC<PaymentFormProps> = ({ amount, onSuccess }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm amount={amount} onSuccess={onSuccess} />
  </Elements>
);
