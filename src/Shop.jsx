// src/Shop.jsx
import React, { useState } from "react";
import "./Shop.css";
import { useCart } from "./cartContext";

// ✅ Ingredient images
import tomatoes from "./assets/tomatoes.jpg";
import onions from "./assets/onion.jpg";
import gardenEggs from "./assets/gardenEggs.jpg";
import koobi from "./assets/koobi.jpg";
import tuna from "./assets/tuna.jpg";
import goatMeat from "./assets/goatMeat.jpg";
import ginger from "./assets/ginger.jpg";
import garlic from "./assets/garlic.jpg";
import kontomire from "./assets/kontomire.jpg";
import cabbage from "./assets/cabbage.jpg";
import palmOil from "./assets/palmOil.jpg";
import cassava from "./assets/cassava.jpg";
import plantain from "./assets/plantain.jpg";
import cassavaDough from "./assets/cassavaDough.jpg";
import maizeDough from "./assets/maizeDough.jpg";
import okro from "./assets/okro.jpg";
import pepper from "./assets/pepper.jpg";
import smokedFish from "./assets/smokedFish.jpg";

// 🛒 Ingredient list
const ingredients = [
  { name: "Tomatoes", price: 10, image: tomatoes },
  { name: "Onions", price: 5, image: onions },
  { name: "Pepper", price: 7, image: pepper },
  { name: "Garden Eggs", price: 8, image: gardenEggs },
  { name: "Koobi (Salted Fish)", price: 15, image: koobi },
  { name: "Tuna", price: 20, image: tuna },
  { name: "Goat Meat", price: 35, image: goatMeat },
  { name: "Ginger", price: 4, image: ginger },
  { name: "Garlic", price: 6, image: garlic },
  { name: "Kontomire", price: 5, image: kontomire },
  { name: "Cabbage", price: 6, image: cabbage },
  { name: "Palm Oil", price: 12, image: palmOil },
  { name: "Cassava", price: 9, image: cassava },
  { name: "Plantain", price: 14, image: plantain },
  { name: "Cassava Dough", price: 10, image: cassavaDough },
  { name: "Maize Dough", price: 10, image: maizeDough },
  { name: "Okro", price: 6, image: okro },
  { name: "Smoked Fish", price: 25, image: smokedFish },
];

const Shop = () => {
  const { addToCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    missing_item: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("access_key", "e2158152-919f-402f-8674-9aa76afdc614"); // ✅ Updated API Key
    form.append("subject", "Missing Item Request from Shop Page");
    form.append("from_name", "KofCity Foods Website");
    form.append("name", formData.name);
    form.append("email", formData.email);
    form.append("missing_item", formData.missing_item);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", missing_item: "" });
      } else {
        alert("❌ Failed to send. Please try again.");
      }
    } catch {
      alert("❌ Submission error. Please try again.");
    }
  };

  return (
    <div className="shop-container">
      <h1 className="shop-title">🛒 Fresh Ghanaian Ingredients</h1>

      <div className="ingredient-grid">
        {ingredients.map((item, index) => (
          <div key={index} className="ingredient-card neumorph-card">
            <img
              src={item.image}
              alt={`Image of ${item.name}`}
              className="ingredient-img"
              loading="lazy"
            />
            <h3 className="ingredient-name">{item.name}</h3>
            <p className="ingredient-price">GH₵ {item.price.toFixed(2)}</p>
            <button className="add-cart-button" onClick={() => addToCart(item)}>
              ➕ Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* 🌟 Missing Item Form */}
      <div className="missing-form-wrapper">
        <h2 className="form-title">📝 Can't find what you want?</h2>
        <p className="form-desc">Let us know what you're looking for:</p>

        {submitted ? (
          <p className="form-success">
            ✅ Thank you! We received your request.
          </p>
        ) : (
          <form className="missing-form" onSubmit={handleFormSubmit}>
            <ul className="form-list">
              <li>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </li>
              <li>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </li>
              <li>
                <input
                  type="text"
                  name="missing_item"
                  placeholder="Item you want us to add"
                  value={formData.missing_item}
                  onChange={handleChange}
                  required
                />
              </li>
            </ul>

            <button type="submit" className="submit-missing-button">
              📩 Send Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Shop;
