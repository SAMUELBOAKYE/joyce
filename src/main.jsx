import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./cartContext";
import { BrowserRouter } from "react-router-dom";
import "leaflet/dist/leaflet.css"; // ✅ Moved here
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <CartProvider>
      <App />
    </CartProvider>
  </BrowserRouter>
);
