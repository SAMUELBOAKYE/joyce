// src/App.jsx
import React from "react";
import "leaflet/dist/leaflet.css";
import { Routes, Route } from "react-router-dom";

import Header from "./Header";
import "./App.css";

import Home from "./Home";
import Shop from "./Shop";
import Cart from "./cart";
import Location from "./Location";
import FormPage from "./FormPage"; // Ensure filename casing matches

const App = () => {
  return (
    <div className="app-container bg-white dark:bg-gray-900 min-h-screen text-black dark:text-white transition-colors duration-300">
      <Header />
      <main className="content-container max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/location" element={<Location />} />
          <Route path="/order-form" element={<FormPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
