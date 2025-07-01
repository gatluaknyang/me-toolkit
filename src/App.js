import React, { useState, useEffect } from 'react';
import './styles.css';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('login');
  const [formData, setFormData] = useState({});

  // Simulated login
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'admin@guukstudio.com' && password === 'guuk') {
      localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
      setUser({ role: 'admin' });
      setView('dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setView('dashboard');
    }
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>Guuk Studio M&E Toolkit</h1>
        <p>For South Sudan Humanitarian Use</p>
      </header>

      {/* Authenticated Views */}
      {user && (
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      )}

      {/* Routes */}
      {view === "login" && (
        <LoginForm setEmail={setEmail} setPassword={setPassword} onLogin={handleLogin} />
      )}

      {view === "dashboard" && (
        <Dashboard setView={setView} />
      )}

      {view.startsWith("form-") && (
        <FormRenderer 
          sector={view.replace("form-", "")} 
          formData={formData} 
          setFormData={setFormData}
          onSubmit={() => alert("Form submitted!")}
          setView={setView}
        />
      )}
    </div>
  );
}

// Login Form Component
function LoginForm({ setEmail, setPassword, onLogin }) {
  return (
    <div className="form-container">
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
function Dashboard({ setView }) {
  const SECTOR_FORMS = [
    { id: "health", name: "Health Monitoring" },
    { id: "wash", name: "WASH Assessment" },
    { id: "gbv", name: "Gender-Based Violence Reporting" },
    { id: "nutrition", name: "Nutrition Surveillance" },
    { id: "finance", name: "Financial Audit Checklist" },
    { id: "hr", name: "Human Resources Management" },
    { id: "audit", name: "Internal Audit Report" },
    { id: "logistics", name: "Supply Chain Monitoring" },
    { id: "childProtection", name: "Child Protection Incident" },
    { id: "fsl", name: "Food Security & Livelihoods" },
    { id: "it", name: "IT Equipment Inventory" },
    { id: "mne", name: "Monitoring & Evaluation Plan" },
    { id: "general", name: "General Field Visit Report" }
  ];

  return (
    <div className="dashboard">
      <h2>Welcome, Admin</h2>
      <h3>Select Sector Form</h3>
      <div className="sector-buttons">
        {SECTOR_FORMS.map((form) => (
          <button key={form.id} onClick={() => setView(`form-${form.id}`)}>
            {form.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// Form Renderer Component
function FormRenderer({ sector, onSubmit, setView, formData, setFormData }) {
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

  const formDef = SECTOR_FORMS[sector];

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
    <div className="form-renderer">
      <h2>{formDef.title}</h2>
      <form onSubmit={handleSubmit}>
        {formDef.fields.map(field => (
          <div key={field.name} className="form-field">
            <label>{field.label}</label>
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
              <div key={opt} className="checkbox-group">
                <input type="checkbox" name={field.name} value={opt} onChange={handleChange} />
                <label>{opt}</label>
              </div>
            ))}
          </div>
        ))}
        <button type="submit">Submit</button>
        <button type="button" onClick={() => setView("dashboard")}>Back</button>
      </form>
    </div>
  );
}

export default App;
