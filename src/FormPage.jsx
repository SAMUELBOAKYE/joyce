// src/FormPage.jsx
import React, { useState } from "react";
import { useCart } from "./cartContext";
import "./formPage.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { koforiduaAreas } from "./koforiduaAreas";

// Fix Leaflet marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const FormPage = () => {
  const { cartItems } = useCart();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    location: "",
    phone: "",
    email: "",
    message: "",
  });

  const [coordinates, setCoordinates] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(null);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  const koforiduaCenter = [6.0941, -0.2606];

  const getDrivingDistance = async (fromCoords, toCoords) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=false`
      );
      const data = await res.json();
      if (data.routes?.length > 0) {
        return Math.round(data.routes[0].duration / 60);
      }
    } catch (err) {
      console.error("Error fetching distance:", err);
    }
    return null;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "location" && value.trim().length > 2) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value + ", Koforidua, Ghana"
          )}`
        );
        const data = await res.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          const newCoords = [parseFloat(lat), parseFloat(lon)];
          setCoordinates(newCoords);
          const travelTime = await getDrivingDistance(
            koforiduaCenter,
            newCoords
          );
          setDistance(travelTime);
        } else {
          setCoordinates(null);
          setDistance(null);
        }
      } catch (err) {
        console.error("Geocoding error:", err);
        setCoordinates(null);
        setDistance(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalized = formData.location.trim().toLowerCase();

    if (!koforiduaAreas.includes(normalized)) {
      setError("❌ Sorry, we only deliver to Koforidua and its neighborhoods.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const form = new FormData();
    form.append("access_key", "e2158152-919f-402f-8674-9aa76afdc614");
    form.append("subject", "📩 New Order Submission from React App");
    form.append(
      "from_name",
      `${formData.firstName} ${formData.middleName} ${formData.lastName}`
    );
    form.append("email", formData.email);
    form.append(
      "message",
      `
Full Name: ${formData.firstName} ${formData.middleName} ${formData.lastName}
Location: ${formData.location}
Phone: ${formData.phone}
Email: ${formData.email}
Message: ${formData.message}
Total Price: GH₵ ${totalPrice.toFixed(2)}
Delivery Personnel: 0549202689
      `
    );

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          location: "",
          phone: "",
          email: "",
          message: "",
        });
        setCoordinates(null);
        setDistance(null);
      } else {
        setError("❌ Failed to send. Please try again.");
      }
    } catch {
      setError("❌ Error sending message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-heading">📝 Order Information Form</h2>

      {coordinates && (
        <div className="map-indicator">📍 Location detected in Koforidua</div>
      )}
      {error && <p className="form-error">{error}</p>}
      {success && (
        <div className="form-success">
          ✅ Message successfully sent to Joycelyn's email!
        </div>
      )}

      <form className="order-form" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="form-section">
          <h3 className="form-section-title">Personal Information</h3>
          <div className="name-fields">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="middleName"
              placeholder="Middle Name"
              value={formData.middleName}
              onChange={handleChange}
            />
          </div>
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Contact Info */}
        <div className="form-section">
          <h3 className="form-section-title">Contact Information</h3>
          <input
            type="text"
            name="location"
            placeholder="Enter your delivery location"
            value={formData.location}
            onChange={handleChange}
            required
          />
          {formData.location && coordinates === null && (
            <p className="form-error">❌ Invalid or unrecognized location</p>
          )}
          <div className="input-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Order Details */}
        <div className="form-section">
          <h3 className="form-section-title">Order Details</h3>
          <div className="static-info">
            <p>
              <strong>Total Purchase:</strong> GH₵ {totalPrice.toFixed(2)}
            </p>
            <p>
              <strong>Delivery Personnel Number:</strong> 0549202689
            </p>
          </div>
          <textarea
            name="message"
            placeholder="Leave a note or message..."
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "⏳ Sending..." : "Submit Order"}
        </button>
      </form>

      {/* Map Preview */}
      {coordinates && (
        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ textAlign: "center" }}>📍 Location Preview</h3>
          {distance && (
            <p style={{ textAlign: "center", marginBottom: "1rem" }}>
              🕒 Estimated delivery time from center: {distance} minutes
            </p>
          )}
          <MapContainer
            center={coordinates}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "300px", borderRadius: "16px", marginTop: "1rem" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={coordinates}>
              <Popup>{formData.location}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default FormPage;
