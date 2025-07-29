// src/FormPage.jsx
import React, { useState, useEffect } from "react";
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
  const { cartItems, clearCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

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
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  const koforiduaCenter = [6.0941, -0.2606];

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim()) error = "This field is required";
        else if (value.length < 2) error = "Must be at least 2 characters";
        break;
      case "phone":
        if (!/^[0-9]{10,15}$/.test(value)) error = "Invalid phone number";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email address";
        break;
      case "location":
        if (!value.trim()) error = "Delivery location is required";
        break;
      default:
        break;
    }
    return error;
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "middleName" && key !== "message") {
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field immediately after change if it's been touched
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: error }));
    }

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

    if (!validateForm()) {
      setError("Please fix the errors in the form");
      return;
    }

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
        setTouchedFields({});
        clearCart();
      } else {
        setError("❌ Failed to send. Please try again.");
      }
    } catch {
      setError("❌ Error sending message.");
    } finally {
      if (isMounted) {
        setLoading(false);
      }
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
          ✅ Order successfully submitted! We'll contact you shortly.
        </div>
      )}

      <form className="order-form" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="form-section">
          <h3 className="form-section-title">Personal Information</h3>
          <div className="name-fields">
            <div className="input-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name *"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={formErrors.firstName ? "input-error" : ""}
              />
              {formErrors.firstName && touchedFields.firstName && (
                <span className="error-message">{formErrors.firstName}</span>
              )}
            </div>
            <div className="input-group">
              <input
                type="text"
                name="middleName"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>
          <div className="input-group">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name *"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={formErrors.lastName ? "input-error" : ""}
            />
            {formErrors.lastName && touchedFields.lastName && (
              <span className="error-message">{formErrors.lastName}</span>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="form-section">
          <h3 className="form-section-title">Contact Information</h3>
          <div className="input-group">
            <input
              type="text"
              name="location"
              placeholder="Enter your delivery location *"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={formErrors.location ? "input-error" : ""}
            />
            {formErrors.location && touchedFields.location && (
              <span className="error-message">{formErrors.location}</span>
            )}
            {formData.location && coordinates === null && (
              <p className="form-warning">Searching for location...</p>
            )}
          </div>
          <div className="input-row">
            <div className="input-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={formErrors.phone ? "input-error" : ""}
              />
              {formErrors.phone && touchedFields.phone && (
                <span className="error-message">{formErrors.phone}</span>
              )}
            </div>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={formErrors.email ? "input-error" : ""}
              />
              {formErrors.email && touchedFields.email && (
                <span className="error-message">{formErrors.email}</span>
              )}
            </div>
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
            {distance && (
              <p>
                <strong>Estimated Delivery Time:</strong> {distance} minutes
              </p>
            )}
          </div>
          <div className="input-group">
            <textarea
              name="message"
              placeholder="Special instructions or notes..."
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Processing Order...
            </>
          ) : (
            "Submit Order"
          )}
        </button>
      </form>

      {/* Map Preview */}
      {coordinates && (
        <div className="map-preview">
          <h3 className="map-title">📍 Location Preview</h3>
          <MapContainer
            center={coordinates}
            zoom={15}
            scrollWheelZoom={false}
            className="delivery-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={coordinates}>
              <Popup>{formData.location}</Popup>
            </Marker>
            <Marker position={koforiduaCenter}>
              <Popup>Koforidua Center</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default FormPage;
