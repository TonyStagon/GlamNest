import { useEffect } from 'react';
import './PaymentForm.css';

export const PaymentForm = ({ amount }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleYocoPayment = () => {
    const yoco = new window.YocoSDK({
      publicKey: 'pk_live_67e7a4eb66EV9dJac344', // Replace with your actual Live Public Key from Yoco dashboard
    });

    console.log('Submitting to Yoco:', {
      amountInCents: Math.round(amount * 100),
      formattedAmount: amount.toLocaleString('en-ZA', {style: 'currency', currency: 'ZAR'}),
      currency: 'ZAR'
    });
    yoco.showPopup({
      amountInCents: Math.round(amount * 100), // Convert Rands to cents
      currency: 'ZAR',
      name: 'E-commerce Order',
      description: 'Secure payment with Yoco',
      callback: function (result) {
        if (result.error) {
          alert("❌ Payment failed: " + result.error.message);
        } else {
          console.log('Charging:', {
            cents: Math.round(amount * 100),
            rand: amount.toLocaleString('en-ZA', {style: 'currency', currency: 'ZAR'})
          });
          // Send the token to your backend
          fetch('http://localhost:5000/charge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: result.id,
              amount: amount // Yoco expects amount in cents
            })
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                alert("✅ Payment successful!");
              } else {
                alert("❌ Payment failed: " + data.error.message);
              }
            })
            .catch((err) => {
              alert("❌ Network error: " + err.message);
            });
        }
      },
    });
  };

  return (
    <div>
      <div className="order-summary">
        <h3>Order Details</h3>
        <div className="breakdown">
          <div className="total-line">
            <span>Items Subtotal</span>
            <span>{(amount - 75).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}</span>
          </div>
          <div className="total-line">
            <span>Delivery Fee</span>
            <span>R1.00</span>
          </div>
          <div className="total-line">
            <span className="total-label">Total Amount</span>
            <span className="total-amount">
              {amount.toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR' })}
            </span>
          </div>
        </div>
      </div>

      <button onClick={handleYocoPayment}>Pay with Yoco</button>

      {/* PayFast Button (Commented Out) */}
      {/* <button onClick={handlePayFastPayment}>Pay with PayFast</button> */}

      {/* PayPal (Commented Out) */}
      {/* <div id="paypal-button-container" /> */}
    </div>
  );
};
