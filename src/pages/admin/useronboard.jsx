import React, { useEffect, useState } from "react";
import axios from "axios";

const UserOnboard = () => {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    type: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "", // ✅ added
    hub_code: "",
  });

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/hubs/");
      setHubs(res.data);
    } catch {
      console.error("Hub fetch failed");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post("http://127.0.0.1:8000/api/users/onboard/", formData, {
        headers: { "Content-Type": "application/json" },
      });

      setMessage("✅ User onboarded successfully");
      setFormData({
        username: "",
        password: "",
        type: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        address: "",
        hub_code: "",
      });
    } catch {
      setMessage("❌ Failed to onboard user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>User Onboarding</h2>

        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select User Type</option>
          <option value="hub">Hub</option>
          <option value="branch">Branch</option>
        </select>

        <input
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <input
          name="phone_number"
          placeholder="Phone Number"
          maxLength="10"
          value={formData.phone_number}
          onChange={handleChange}
          required
          style={styles.input}
        />

        {/* ✅ Address field */}
        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
          style={styles.textarea}
        />

        <select
          name="hub_code"
          value={formData.hub_code}
          onChange={handleChange}
          required
          style={styles.input}
        >
          <option value="">Select Hub or Branch</option>
          {hubs.map((hub) => (
            <option key={hub.hub_code} value={hub.hub_code}>
              {hub.hubname} ({hub.hub_code})
            </option>
          ))}
        </select>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

export default UserOnboard;

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
  },
  card: {
    width: "440px",
    padding: "25px 40px 25px 25px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    height: "70px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  message: {
    textAlign: "center",
    marginTop: "10px",
  },
};
