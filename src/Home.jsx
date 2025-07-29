// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import bgImage from "./assets/tomatoes.jpg";
import "./Home.css";

const Home = () => {
  const promotions = [
    "🎉 Free Delivery on orders above GH¢50",
    "🔥 New! Pre-packed Fufu Bundle",
    "🌿 Seasonal: Nkontomire Season Bundle",
  ];

  const testimonials = [
    {
      quote: "I made a delicious soup in 30 minutes. All from KofCity Foods!",
      author: "Ama B.",
    },
    {
      quote: "Affordable prices and quick delivery!",
      author: "Kwame T.",
    },
    {
      quote: "Perfect ingredients selection from Joycelyn!",
      author: "Eronia KTU.",
    },
  ];

  const steps = [
    {
      emoji: "🛒",
      title: "Browse Ingredients",
      text: "Choose what you want to cook today.",
    },
    {
      emoji: "🧺",
      title: "Add to Cart",
      text: "Fresh items from trusted sellers.",
    },
    {
      emoji: "🚚",
      title: "Fast Delivery",
      text: "Same-day delivery in Koforidua.",
    },
  ];

  return (
    <main className="home-container">
      {/* ✅ HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1>Order Fresh Ghanaian Ingredients</h1>
          <p>
            Fresh Ghanaian ingredients delivered fast to your doorstep in
            Koforidua – trusted by Joycelyn.
          </p>
          <Link to="/shop" className="cta-button">
            🛍️ Start Shopping
          </Link>
        </div>
        <div className="hero-image neumorph">
          <img
            src={bgImage}
            alt="Fresh Ghanaian food ingredients"
            loading="lazy"
          />
        </div>
      </section>

      {/* ✅ HOW IT WORKS - Animated Carousel */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-carousel">
          <div className="steps-track">
            {[...Array(2)].flatMap((_, loopIndex) =>
              steps.map(({ emoji, title, text }, i) => (
                <div
                  className="step neumorph-card"
                  key={`step-${loopIndex}-${i}-${title}`}
                >
                  <span role="img" aria-label={title.toLowerCase()}>
                    {emoji}
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ✅ POPULAR CATEGORIES */}
      <section className="popular-categories">
        <h2>Popular Ingredient Categories</h2>
        <div className="categories">
          {[
            { label: "🍅 Vegetables", category: "vegetables" },
            { label: "🐟 Proteins", category: "proteins" },
            { label: "🥬 Greens", category: "greens" },
          ].map(({ label, category }) => (
            <Link
              key={`category-${category}`}
              to={`/shop?category=${category}`}
              className="category-card neumorph-pill"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* ✅ TESTIMONIALS */}
      <section className="testimonials">
        <h2>What Customers Say</h2>
        <div className="testimonial-carousel">
          <div className="testimonial-track">
            {[...testimonials, ...testimonials].map(
              ({ quote, author }, idx) => (
                <blockquote key={`testimonial-${idx}-${author}`}>
                  "{quote}" <cite>- {author}</cite>
                </blockquote>
              )
            )}
          </div>
        </div>
      </section>

      {/* ✅ FINAL CTA */}
      <section className="final-cta neumorph">
        <h2>Ready to cook?</h2>
        <p>Let's get your fresh ingredients now!</p>
        <Link to="/shop" className="cta-button">
          🛍️ Shop Now
        </Link>
      </section>
    </main>
  );
};

export default Home;
