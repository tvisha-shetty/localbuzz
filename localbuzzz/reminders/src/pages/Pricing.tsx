import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51QccfPP01PorL0iGRzvKpLWfbdJVXX3o6gKPEiKu8BwNaZMflv1W6ySH5wQfPCBsQ9wUh2HgGtJfU9LPiGEXBiDL00DjSVVlzD');

// Hardcoded Stripe Price IDs (replace these with your actual price IDs from Stripe Dashboard)
const STRIPE_PRICES = {
  free: null, // Free tier doesn't need checkout
  starter: 'price_1QccqvP01PorL0iGtkKJ2IkI', // Replace with your actual price ID
  pro: 'price_1QccrfP01PorL0iGHzXWHBpJ', // Replace with your actual price ID
  enterprise: null // Contact sales
};

const Pricing = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(planName);
    
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Call your backend to create a checkout session
      const response = await fetch('https://your-backend-url.com/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          planName: planName,
        }),
      });

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // For demo purposes, hardcoded checkout
  const handleHardcodedCheckout = async (planName: string, price: string) => {
    setLoading(planName);
    
    // Simulate checkout process
    setTimeout(() => {
      alert(`Redirecting to Stripe Checkout for ${planName} plan (${price}/month)...\n\nIn production, this would redirect to Stripe's secure checkout page.`);
      setLoading(null);
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #fff3e6, #ffe0c2)' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#ffffff', borderBottom: '1px solid #eee', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ff8c00">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
        <h2 style={{ margin: 0, color: '#e11c2a' }}>LocalBuzz</h2>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', marginLeft: 'auto' }}>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '14px', 
              color: '#e65100', 
              fontWeight: 500 
            }}
          >
            ← Back to Home
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '60px 24px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', margin: '0 0 16px', color: '#ff7a00' }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ fontSize: '18px', color: '#555', maxWidth: '600px', margin: '0 auto 40px' }}>
          Choose the perfect plan for your event organization needs. All plans include our core features.
        </p>
      </section>

      {/* Pricing Cards */}
      <section style={{ padding: '0 24px 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          
          {/* Free Plan */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '32px', 
            border: '2px solid #e5e5e5',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', margin: '0 0 8px', color: '#333' }}>Free</h3>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#ff7a00', margin: '16px 0' }}>
                $0
                <span style={{ fontSize: '18px', fontWeight: '400', color: '#666' }}>/month</span>
              </div>
              <p style={{ color: '#666', fontSize: '14px' }}>Perfect for getting started</p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {[
                'Up to 3 events',
                'Basic analytics',
                'Email support',
                'Community features',
                'Mobile app access'
              ].map((feature, i) => (
                <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px', color: '#333' }}>
                  <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => window.location.href = '/'}
              style={{
                width: '100%',
                padding: '14px',
                background: '#fff',
                color: '#ff7a00',
                border: '2px solid #ff7a00',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff7ed';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
              }}
            >
              Get Started Free
            </button>
          </div>

          {/* Starter Plan */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '32px', 
            border: '3px solid #ff7a00',
            position: 'relative',
            transform: 'scale(1.05)',
            boxShadow: '0 20px 40px rgba(255,122,0,0.15)'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '-16px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: '#ff7a00', 
              color: '#fff', 
              padding: '6px 20px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: '600' 
            }}>
              MOST POPULAR
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', margin: '0 0 8px', color: '#333' }}>Starter</h3>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#ff7a00', margin: '16px 0' }}>
                $29
                <span style={{ fontSize: '18px', fontWeight: '400', color: '#666' }}>/month</span>
              </div>
              <p style={{ color: '#666', fontSize: '14px' }}>Great for growing organizers</p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {[
                'Up to 25 events',
                'Advanced analytics',
                'Priority email support',
                'Custom event pages',
                'QR code check-ins',
                'Email marketing tools',
                'Remove LocalBuzz branding'
              ].map((feature, i) => (
                <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px', color: '#333' }}>
                  <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleHardcodedCheckout('Starter', '$29')}
              disabled={loading === 'Starter'}
              style={{
                width: '100%',
                padding: '14px',
                background: '#ff7a00',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading === 'Starter' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading === 'Starter' ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (loading !== 'Starter') {
                  e.currentTarget.style.background = '#e65100';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (loading !== 'Starter') {
                  e.currentTarget.style.background = '#ff7a00';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading === 'Starter' ? 'Processing...' : 'Start 14-Day Free Trial'}
            </button>
          </div>

          {/* Pro Plan */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '32px', 
            border: '2px solid #e5e5e5',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', margin: '0 0 8px', color: '#333' }}>Pro</h3>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#ff7a00', margin: '16px 0' }}>
                $79
                <span style={{ fontSize: '18px', fontWeight: '400', color: '#666' }}>/month</span>
              </div>
              <p style={{ color: '#666', fontSize: '14px' }}>For professional organizers</p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {[
                'Unlimited events',
                'Full analytics suite',
                'Phone & email support',
                'Team collaboration (5 users)',
                'Custom branding',
                'API access',
                'Advanced integrations',
                'Dedicated account manager',
                'White-label option'
              ].map((feature, i) => (
                <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px', color: '#333' }}>
                  <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleHardcodedCheckout('Pro', '$79')}
              disabled={loading === 'Pro'}
              style={{
                width: '100%',
                padding: '14px',
                background: '#ff7a00',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading === 'Pro' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading === 'Pro' ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (loading !== 'Pro') {
                  e.currentTarget.style.background = '#e65100';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (loading !== 'Pro') {
                  e.currentTarget.style.background = '#ff7a00';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading === 'Pro' ? 'Processing...' : 'Start 14-Day Free Trial'}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
            borderRadius: '16px', 
            padding: '32px', 
            border: '2px solid #475569',
            color: '#fff',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', margin: '0 0 8px', color: '#fff' }}>Enterprise</h3>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#fff', margin: '16px 0' }}>
                Custom
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>For large organizations</p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {[
                'Everything in Pro',
                'Unlimited team members',
                '24/7 priority support',
                'Custom integrations',
                'SLA guarantees',
                'Dedicated infrastructure',
                'Advanced security',
                'Training & onboarding',
                'Custom contract terms'
              ].map((feature, i) => (
                <li key={i} style={{ padding: '12px 0', borderBottom: '1px solid #475569', fontSize: '14px', color: '#e2e8f0' }}>
                  <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                alert('Thank you for your interest! Our sales team will contact you within 24 hours.\n\nEmail: sales@localbuzz.com\nPhone: +1 (555) 123-4567');
              }}
              style={{
                width: '100%',
                padding: '14px',
                background: '#fff',
                color: '#1e293b',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '60px 24px', background: '#fff', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '40px', color: '#333' }}>
          Frequently Asked Questions
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[
            {
              q: 'Can I change plans at any time?',
              a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.'
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processor.'
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes! Both Starter and Pro plans come with a 14-day free trial. No credit card required to start.'
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Absolutely. You can cancel your subscription at any time with no cancellation fees. You'll retain access until the end of your billing period.'
            },
            {
              q: 'Do you offer refunds?',
              a: 'We offer a 30-day money-back guarantee. If you're not satisfied within the first 30 days, we'll provide a full refund.'
            }
          ].map((faq, i) => (
            <div key={i} style={{ padding: '24px', background: '#f9fafb', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '18px', color: '#ff7a00' }}>{faq.q}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1e293b', color: '#94a3b8', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 16px', fontSize: '14px' }}>
          Need help choosing a plan? Contact us at{' '}
          <a href="mailto:support@localbuzz.com" style={{ color: '#ff7a00', textDecoration: 'none' }}>
            support@localbuzz.com
          </a>
        </p>
        <p style={{ margin: 0, fontSize: '13px' }}>
          © 2025 LocalBuzz. All rights reserved. | Secure payments powered by Stripe
        </p>
      </footer>
    </div>
  );
};

export default Pricing;