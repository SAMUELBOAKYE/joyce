// src/Cart.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./cartContext";
import "./Cart.css";

const Cart = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.price * (item.quantity || 1);
  }, 0);

  const handleProceed = () => {
    navigate("/order-form"); // This should match your route path
  };

  return (
    <div className="cart-container">
      <h2 className="cart-heading">🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>No items in your cart yet.</p>
          <p>🛍️ Explore the shop to add delicious meals!</p>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item, index) => (
              <li key={index} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-img" />

                <div className="cart-details">
                  <h4>{item.name}</h4>
                  <p className="item-price">GH₵ {item.price.toFixed(2)}</p>
                  {item.quantity && (
                    <p className="item-qty">Qty: {item.quantity}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <h3>Total: GH₵ {totalPrice.toFixed(2)}</h3>
            <button className="checkout-button" onClick={handleProceed}>
              Proceed to Form
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
