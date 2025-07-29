// src/FormPage.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "./cartContext";
import "./formPage.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { koforiduaAreas } from "./koforiduaAreas";

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
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    location: "",
    phone: "",
    email: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const koforiduaCenter = [6.0941, -0.2606];

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const validateField = (name, value) => {
    let error = "";
    if (!value.trim() && !["middleName", "message"].includes(name)) {
      error = "This field is required";
    } else if (
      (name === "firstName" || name === "lastName") &&
      value.length < 2
    ) {
      error = "Must be at least 2 characters";
    } else if (name === "phone" && !/^(\+?233|0)[0-9]{9}$/.test(value.trim())) {
      error = "Invalid Ghanaian phone number";
    } else if (
      name === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ) {
      error = "Invalid email address";
    }
    return error;
  };

  const validateForm = () => {
    const errors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const err = validateField(key, value);
      if (err) errors[key] = err;
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, formData[name]);
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touchedFields[name]) {
      const err = validateField(name, value);
      setFormErrors((prev) => ({ ...prev, [name]: err }));
    }

    if (name === "location" && value.trim().length > 2) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value + ", Koforidua, Ghana"
          )}`
        );
        const data = await res.json();
        if (data[0]) {
          const { lat, lon } = data[0];
          const coords = [parseFloat(lat), parseFloat(lon)];
          setCoordinates(coords);
          const distance = await getDrivingDistance(koforiduaCenter, coords);
          setDistance(distance);
        } else {
          setCoordinates(null);
          setDistance(null);
        }
      } catch {
        setCoordinates(null);
        setDistance(null);
      }
    }
  };

  const getDrivingDistance = async (from, to) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=false`
      );
      const data = await res.json();
      return Math.round(data.routes[0].duration / 60);
    } catch {
      return null;
    }
  };

  const createRipple = (event) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return setError("❌ Fix the highlighted fields");

    const normalized = formData.location.trim().toLowerCase();
    if (!koforiduaAreas.includes(normalized)) {
      return setError(
        "❌ Sorry, we only deliver to Koforidua and nearby areas."
      );
    }

    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("access_key", "e2158152-919f-402f-8674-9aa76afdc614");
      form.append("subject", "New Order from React Food App");
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
Notes: ${formData.message}
Total Price: GH₵ ${totalPrice.toFixed(2)}
Estimated Delivery: ${distance ? distance + " mins" : "N/A"}
        `
      );

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Submission failed");

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
      setFormErrors({});
      setTouchedFields({});
      clearCart();
      setCoordinates(null);
      setDistance(null);
    } catch (err) {
      setError("❌ Submission failed. Try again.");
    } finally {
      isMounted && setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Delivery Information</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">✅ Order submitted successfully!</p>}

      <form onSubmit={handleSubmit} noValidate>
        {[
          { name: "firstName", label: "First Name *" },
          { name: "middleName", label: "Middle Name" },
          { name: "lastName", label: "Last Name *" },
          { name: "location", label: "Delivery Location *" },
          { name: "phone", label: "Phone Number *" },
          { name: "email", label: "Email Address *" },
        ].map((field) => (
          <div key={field.name} className="floating-label-group">
            <input
              type={field.name === "email" ? "email" : "text"}
              name={field.name}
              placeholder=" "
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              className={formErrors[field.name] ? "input-error" : ""}
            />
            <label className="floating-label">{field.label}</label>
            {formErrors[field.name] && (
              <span className="error">{formErrors[field.name]}</span>
            )}
          </div>
        ))}

        <div className="floating-label-group">
          <textarea
            name="message"
            placeholder=" "
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          <label className="floating-label">Additional Notes</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          onClick={(e) => {
            createRipple(e);
            handleSubmit(e);
          }}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span> Processing...
            </>
          ) : (
            "Submit Order"
          )}
        </button>
      </form>

      {coordinates && (
        <MapContainer center={coordinates} zoom={14} className="map">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={coordinates}>
            <Popup>Delivery Location</Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  );
};

export default FormPage;
