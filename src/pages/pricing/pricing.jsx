import "./pricing.css";
import { FaCheck, FaRocket, FaStar, FaBuilding, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      icon: <FaRocket />,
                  features: ["10 GB Storage", "10 Documents", "Basic Support", "1 User", "Standard Security"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      icon: <FaStar />,
      features: ["50 GB Storage", "Unlimited Documents", "Priority Support", "3 Users", "Advanced Security", "Document Sharing", "Version History"],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$29",
      period: "/month",
      icon: <FaBuilding />,
      features: ["Unlimited Storage", "Unlimited Documents", "24/7 Support", "Unlimited Users", "Bank-Grade Security", "Advanced Sharing", "Audit Logs", "API Access", "Custom Integrations"],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="page pricing-page">
      <div className="container">
        <section className="pricing-header">
          <span className="hero-pill">Pricing</span>
          <h1>Simple, transparent pricing</h1>
          <p>Choose the plan that fits your needs. All plans include a 14-day free trial.</p>
        </section>
        <section className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card ${plan.popular ? "popular" : ""}`}>
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <div className="pricing-card-header">
                <div className="pricing-icon">{plan.icon}</div>
                <h2>{plan.name}</h2>
                <div className="pricing-amount">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
              </div>
              <ul className="pricing-features">
                {plan.features.map(feature => (
                  <li key={feature}><FaCheck /> {feature}</li>
                ))}
              </ul>
              <Link to="/register" className={`pricing-cta ${plan.popular ? "primary" : "secondary"}`}>
                {plan.cta} <FaArrowRight />
              </Link>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default Pricing;
