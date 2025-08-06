import React from 'react';
import './PricingPage.css';

const PricingPage = () => {
  return (
    <div className="pricing-container">
      <div className="pricing-content">
        {/* Header */}
        <div className="pricing-header">
          <h1 className="text-cormorant-display text-white-full">Welcome to our startup newsletter</h1>
          <p className="text-cormorant-body text-white">Choose the plan that works best for you and your journey. Join my personal newsletter on building an AI-native startup.</p>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {/* Monthly Plan */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3 className="text-cormorant-h2 text-white-full">Monthly</h3>
              <p className="pricing-card-description text-cormorant-body">Essential insights for individuals</p>
              <div className="price">
                <span className="price-amount text-cormorant-h1 text-white-full">$5</span>
                <span className="price-period text-cormorant-body">/month</span>
              </div>
            </div>
            <div className="pricing-card-content">
              <ul className="features-list">
                <li className="text-cormorant-body">✓ Personal AI newsletter</li>
                <li className="text-cormorant-body">✓ Startup journey updates</li>
                <li className="text-cormorant-body">✓ Best practices & learnings</li>
                <li className="text-cormorant-body">✓ Early access to experiments</li>
                <li className="text-cormorant-body">✓ Community access</li>
              </ul>
            </div>
            <div className="pricing-card-footer">
              <a href="https://buy.stripe.com/aFacN4bDRh286Cdf0n5J603" className="pricing-btn pricing-btn-outline text-palatino-body">Get Started</a>
            </div>
          </div>

          {/* Annual Plan */}
          <div className="pricing-card popular">
            <div className="pricing-card-header">
              <h3 className="text-cormorant-h2 text-white-full">Annual</h3>
              <p className="pricing-card-description text-cormorant-body">Advanced insights for committed followers</p>
              <div className="price">
                <span className="price-amount text-cormorant-h1 text-white-full">$49</span>
                <span className="price-period text-cormorant-body">/year</span>
              </div>
            </div>
            <div className="pricing-card-content">
              <ul className="features-list">
                <li className="text-cormorant-body">✓ Everything in Monthly</li>
                <li className="text-cormorant-body">✓ Exclusive deep-dive content</li>
                <li className="text-cormorant-body">✓ Behind-the-scenes access</li>
                <li className="text-cormorant-body">✓ Direct access to experiments</li>
                <li className="text-cormorant-body">✓ ~20% savings</li>
              </ul>
            </div>
            <div className="pricing-card-footer">
              <a href="https://buy.stripe.com/eVqfZg23heU02lX7xV5J604" className="pricing-btn pricing-btn-primary text-palatino-body">Get Started</a>
            </div>
          </div>

          {/* Founding Believer Plan */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3 className="text-cormorant-h2 text-white-full">Founding Believer</h3>
              <p className="pricing-card-description text-cormorant-body">Everything a founding believer needs</p>
              <div className="price">
                <span className="price-amount text-cormorant-h1 text-white-full">$199</span>
                <span className="price-period text-cormorant-body">one-time</span>
              </div>
            </div>
            <div className="pricing-card-content">
              <ul className="features-list">
                <li className="text-cormorant-body">✓ Lifetime access</li>
                <li className="text-cormorant-body">✓ All current & future content</li>
                <li className="text-cormorant-body">✓ Founding member recognition</li>
                <li className="text-cormorant-body">✓ Early access to all products</li>
              </ul>
            </div>
            <div className="pricing-card-footer">
              <a href="https://buy.stripe.com/fZu8wOdLZ27ef8JbOb5J605" className="pricing-btn pricing-btn-outline text-palatino-body">Join Founders</a>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="pricing-footer">
          <p className="text-cormorant-body text-white">All plans include AI news, experiments, and best practices.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;