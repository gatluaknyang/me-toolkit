import React, { useState, useEffect } from 'react';

const SECTOR_FORMS = {
  health: {
    title: "Health Monitoring Form",
    fields: [
      { label: "Facility Name", name: "facility", type: "text" },
      { label: "Date", name: "date", type: "date" },
      { label: "Type of Facility", name: "type", type: "select", options: ["PHCU", "PHCC", "Hospital"] },
      { label: "Services Offered", name: "services", type: "textarea" },
      { label: "Officer in Charge", name: "officer", type: "text" }
    ]
  },
  wash: {
    title: "WASH Assessment Form",
    fields: [
      { label: "Location", name: "location", type: "text" },
      { label: "Water Source Type", name: "waterSource", type: "select", options: ["Borehole", "Well", "River"] },
      { label: "Sanitation Facilities", name: "sanitation", type: "checkbox", options: ["Toilet", "Handwashing", "Shower"] },
      { label: "Hygiene Promotion Activities", name: "hygiene", type: "textarea" },
      { label: "Date of Last Maintenance", name: "maintenanceDate", type: "date" }
    ]
  },
  gbv: {
    title: "Gender-Based Violence Reporting",
    fields: [
      { label: "Incident Location", name: "incidentLocation", type: "text" },
      { label: "Type of Incident", name: "incidentType", type: "select", options: ["Physical", "Sexual", "Psychological"] },
      { label: "Victim Age Group", name: "ageGroup", type: "select", options: ["Child", "Youth", "Adult", "Elderly"] },
      { label: "Support Services Provided", name: "support", type: "textarea" },
      { label: "Referral Made", name: "referral", type: "checkbox", options: ["Medical", "Legal", "Psychosocial"] }
    ]
  }
};

function App() {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState(null);

  // Simulate login using localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("mne_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setView("dashboard");
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "admin@guukstudio.com" && password === "guuk") {
      const userData = {
        role: "admin",
        name: "Guuk Studio Admin"
      };
      localStorage.setItem("mne_user", JSON.stringify(userData));
      setUser(userData);
      setView("dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("mne_user");
    setUser(null);
    setView("login");
  };

  const handleFormSubmit = (sector) => {
    if (!navigator.onLine) {
      // Save locally when offline
      const offlineData = JSON.parse(localStorage.getItem("offlineForms")) || [];
      localStorage.setItem("offlineForms", JSON.stringify([...offlineData, { sector, formData, timestamp: new Date().toISOString() }]));
      alert("Saved locally. Will sync when online.");
    } else {
      // Submit to backend (Firebase or Google Sheets)
      fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, formData })
      }).then(res => res.json())
        .then(data => {
          alert("Submitted successfully!");
          setFormData({});
        })
        .catch(err => {
          alert("Error submitting form. Saving locally...");
          const offlineData = JSON.parse(localStorage.getItem("offlineForms")) || [];
          localStorage.setItem("offlineForms", JSON.stringify([...offlineData, { sector, formData, timestamp: new Date().toISOString() }]));
        });
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>
      {/* Header */}
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1>Guuk Studio M&E Toolkit</h1>
        <p>For South Sudan Humanitarian Use</p>
      </header>

      {/* Authenticated Views */}
      {user && (
        <button onClick={handleLogout} style={{ float: "right", background: "#dc3545", color: "white", border: "none", padding: "10px 16px", borderRadius: "4px" }}>
          Logout
        </button>
      )}

      {/* Routes */}
      {view === "login" && (
        <LoginForm setEmail={setEmail} setPassword={setPassword} onLogin={handleLogin} />
      )}

      {view === "dashboard" && (
        <Dashboard setCurrentForm={setView} />
      )}

      {view.startsWith("form-") && (
        <FormRenderer 
          sector={view.replace("form-", "")}
          formData={formData}
          setFormData={setFormData}
          onSubmit={() => handleFormSubmit(view.replace("form-", ""))}
          setView={setView}
        />
      )}
    </div>
  );
}

// Login Form Component
function LoginForm({ setEmail, setPassword, onLogin }) {
  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      <form onSubmit={onLogin}>
        <label>Email:</label>
        <input type="email" onChange={(e) => setEmail(e.target.value)} required />

        <label>Password:</label>
        <input type="password" onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

// Dashboard Component
function Dashboard({ setCurrentForm }) {
  const sectors = Object.keys(SECTOR_FORMS).map(key => SECTOR_FORMS[key]);

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Welcome to M&E Toolkit Dashboard</h2>
      <p>Select a sector form below:</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {sectors.map(form => (
          <button 
            key={form.title} 
            onClick={() => setCurrentForm(`form-${form.fields[0].name}`)}
            style={{ background: "#007BFF", color: "white", border: "none", padding: "12px", borderRadius: "4px" }}
          >
            {form.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// Form Renderer Component
function FormRenderer({ sector, onSubmit, setView, formData, setFormData }) {
  const formDef = SECTOR_FORMS[sector];

  if (!formDef) {
    return <p>Form not found</p>;
  }

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <h2>{formDef.title}</h2>
      <form onSubmit={handleSubmit}>
        {formDef.fields.map(field => (
          <div key={field.name} style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: "bold", display: "block" }}>{field.label}</label>
            
            {field.type === "text" && <input name={field.name} onChange={handleChange} />}
            {field.type === "date" && <input type="date" name={field.name} onChange={handleChange} />}
            {field.type === "textarea" && <textarea name={field.name} onChange={handleChange}></textarea>}
            {field.type === "select" && (
              <select name={field.name} onChange={handleChange}>
                <option value="">Select an option</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {field.type === "checkbox" && field.options.map(opt => (
              <div key={opt} style={{ marginTop: "8px" }}>
                <input type="checkbox" name={field.name} value={opt} onChange={handleChange} />
                <label style={{ marginLeft: "8px" }}>{opt}</label>
              </div>
            ))}
          </div>
        ))}
        
        <button type="submit" style={{ background: "#007BFF", color: "white", border: "none", padding: "12px", width: "100%", fontSize: "16px" }}>
          Submit
        </button>
        <button 
          type="button" 
          onClick={() => setView("dashboard")}
          style={{ background: "#6c757d", color: "white", border: "none", padding: "12px", width: "100%", fontSize: "16px", marginTop: "10px" }}
        >
          Back
        </button>
      </form>
    </div>
  );
}

export default App;