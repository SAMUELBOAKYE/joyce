// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./cartContext";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CartProvider>
      <App />
    </CartProvider>
  </BrowserRouter>
);
