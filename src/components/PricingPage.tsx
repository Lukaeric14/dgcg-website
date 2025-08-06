import React from 'react';
import './PricingPage.css';

const PricingPage = () => {
  return (
    <div className="pricing-container">
      <div className="pricing-content">
        {/* Header */}
        <div className="pricing-header">
          <h1>Welcome to our startup newsletter</h1>
          <p>Choose the plan that works best for you and your journey. Join my personal newsletter on building an AI-native startup.</p>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {/* Monthly Plan */}
          <div className="pricing-card">
            <div className="card-header">
              <h3>Monthly</h3>
              <p className="card-description">Essential insights for individuals</p>
              <div className="price">
                <span className="price-amount">$5</span>
                <span className="price-period">/month</span>
              </div>
            </div>
            <div className="card-content">
              <ul className="features-list">
                <li>✓ Personal AI newsletter</li>
                <li>✓ Startup journey updates</li>
                <li>✓ Best practices & learnings</li>
                <li>✓ Early access to experiments</li>
                <li>✓ Community access</li>
              </ul>
            </div>
            <div className="card-footer">
              <a href="https://buy.stripe.com/aFacN4bDRh286Cdf0n5J603" className="btn btn-outline">Get Started</a>
            </div>
          </div>

          {/* Annual Plan */}
          <div className="pricing-card popular">
            <div className="card-header">
              <h3>Annual</h3>
              <p className="card-description">Advanced insights for committed followers</p>
              <div className="price">
                <span className="price-amount">$49</span>
                <span className="price-period">/year</span>
              </div>
            </div>
            <div className="card-content">
              <ul className="features-list">
                <li>✓ Everything in Monthly</li>
                <li>✓ Exclusive deep-dive content</li>
                <li>✓ Behind-the-scenes access</li>
                <li>✓ Direct access to experiments</li>
                <li>✓ ~20% savings</li>
              </ul>
            </div>
            <div className="card-footer">
              <a href="https://buy.stripe.com/eVqfZg23heU02lX7xV5J604" className="btn btn-primary">Get Started</a>
            </div>
          </div>

          {/* Founding Believer Plan */}
          <div className="pricing-card">
            <div className="card-header">
              <h3>Founding Believer</h3>
              <p className="card-description">Everything a founding believer needs</p>
              <div className="price">
                <span className="price-amount">$199</span>
                <span className="price-period">one-time</span>
              </div>
            </div>
            <div className="card-content">
              <ul className="features-list">
                <li>✓ Lifetime access</li>
                <li>✓ All current & future content</li>
                <li>✓ Founding member recognition</li>
                <li>✓ Early access to all products</li>
              </ul>
            </div>
            <div className="card-footer">
              <a href="https://buy.stripe.com/fZu8wOdLZ27ef8JbOb5J605" className="btn btn-outline">Join Founders</a>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="pricing-footer">
          <p>All plans include AI news, experiments, and best practices.</p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;