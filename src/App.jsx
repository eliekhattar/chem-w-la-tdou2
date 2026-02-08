import React from 'react'
import './App.css'

export default function App() {
  return (
    <div className="landing-page">
      {/* Header Navigation */}
      <header className="header">
        <div className="container">
          <div className="nav-wrapper">
            <div className="logo">CORPORATE.</div>
            <nav className="nav-menu">
              <a href="#services" className="nav-link">Services</a>
              <a href="#expertise" className="nav-link">Expertise</a>
              <a href="#insights" className="nav-link">Insights</a>
              <a href="#about" className="nav-link">About</a>
              <button className="contact-btn">Contact Us</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <p className="subtitle">PREMIUM CORPORATE SOLUTIONS</p>
            <h1 className="hero-title">
              Transform Your<br />
              Business Vision<br />
              <span className="highlight">Into Reality</span>
            </h1>
            <p className="hero-description">
              We deliver strategic consulting and innovative solutions that drive<br />
              sustainable growth, operational excellence, and competitive advantage<br />
              for forward-thinking enterprises.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary">Explore Services</button>
              <button className="btn-secondary">Learn More</button>
            </div>
            
            {/* Stats */}
            <div className="stats">
              <div className="stat-item">
                <div className="stat-number">250+</div>
                <div className="stat-label">Global Clients</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Success Rate</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">15+</div>
                <div className="stat-label">Years Experience</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow">▼</div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">WHAT WE OFFER</p>
            <h2 className="section-title">Our Services</h2>
            <p className="section-description">
              Comprehensive solutions tailored to elevate your business to new heights
            </p>
          </div>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3 className="service-title">Strategic Consulting</h3>
              <p className="service-description">
                Expert guidance to navigate complex business challenges and identify growth opportunities with data-driven insights.
              </p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">💡</div>
              <h3 className="service-title">Digital Transformation</h3>
              <p className="service-description">
                Modernize your operations with cutting-edge technology solutions that streamline processes and boost efficiency.
              </p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">📈</div>
              <h3 className="service-title">Business Analytics</h3>
              <p className="service-description">
                Turn data into actionable insights with advanced analytics tools and custom reporting dashboards.
              </p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎯</div>
              <h3 className="service-title">Market Strategy</h3>
              <p className="service-description">
                Develop winning market strategies that position your brand for success in competitive landscapes.
              </p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🔧</div>
              <h3 className="service-title">Process Optimization</h3>
              <p className="service-description">
                Streamline operations and eliminate inefficiencies to maximize productivity and reduce costs.
              </p>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🤝</div>
              <h3 className="service-title">Change Management</h3>
              <p className="service-description">
                Guide your organization through transformational change with proven methodologies and expert support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <p className="section-subtitle">WHO WE ARE</p>
              <h2 className="section-title">About Us</h2>
              <p className="about-paragraph">
                We are a premier corporate consulting firm dedicated to transforming businesses through 
                strategic innovation and operational excellence. With over 15 years of industry experience, 
                our team of seasoned professionals has helped hundreds of organizations across the globe 
                achieve their most ambitious goals.
              </p>
              <p className="about-paragraph">
                Our approach combines deep industry knowledge with cutting-edge methodologies to deliver 
                sustainable results. We don't just provide recommendations—we partner with you to implement 
                solutions that drive real, measurable impact.
              </p>
              <div className="about-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">Industry-leading expertise</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">Proven track record of success</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">Client-centric approach</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">Innovative solutions</span>
                </div>
              </div>
            </div>
            
            <div className="about-image">
              <div className="image-placeholder">
                <span className="placeholder-text">Your Image Here</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">OUR ADVANTAGES</p>
            <h2 className="section-title">Why Choose Us</h2>
            <p className="section-description">
              Discover what sets us apart from the competition
            </p>
          </div>
          
          <div className="reasons-grid">
            <div className="reason-card">
              <div className="reason-number">01</div>
              <h3 className="reason-title">Expert Team</h3>
              <p className="reason-description">
                Our consultants bring decades of combined experience across multiple industries and business functions.
              </p>
            </div>
            
            <div className="reason-card">
              <div className="reason-number">02</div>
              <h3 className="reason-title">Proven Results</h3>
              <p className="reason-description">
                We deliver measurable outcomes with a 98% client satisfaction rate and consistent ROI improvement.
              </p>
            </div>
            
            <div className="reason-card">
              <div className="reason-number">03</div>
              <h3 className="reason-title">Tailored Solutions</h3>
              <p className="reason-description">
                Every engagement is customized to your unique challenges, goals, and organizational culture.
              </p>
            </div>
            
            <div className="reason-card">
              <div className="reason-number">04</div>
              <h3 className="reason-title">Global Reach</h3>
              <p className="reason-description">
                With clients across 40+ countries, we bring international best practices to your doorstep.
              </p>
            </div>
            
            <div className="reason-card">
              <div className="reason-number">05</div>
              <h3 className="reason-title">Cutting-Edge Tools</h3>
              <p className="reason-description">
                We leverage the latest technology and analytics platforms to drive insights and efficiency.
              </p>
            </div>
            
            <div className="reason-card">
              <div className="reason-number">06</div>
              <h3 className="reason-title">Long-Term Partnership</h3>
              <p className="reason-description">
                We're committed to your success beyond project completion with ongoing support and guidance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}