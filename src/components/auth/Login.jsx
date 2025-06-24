import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./Login.css";
import dashboardImage from "../../assets/images/dashboard.png";
import eyeIcon from "../../assets/images/eye.png";
import eyeOffIcon from "../../assets/images/eye-off.png";
import logoIcon from "../../assets/images/logo.png";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Use useNavigate for routing

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "fullName":
        if (!isLogin && !value.trim()) {
          newErrors.fullName = "Full name is required";
        } else {
          delete newErrors.fullName;
        }
        break;
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;
      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        if (!isLogin && formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      case "confirmPassword":
        if (!isLogin) {
          if (!value) {
            newErrors.confirmPassword = "Please confirm your password";
          } else if (value !== formData.password) {
            newErrors.confirmPassword = "Passwords do not match";
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
    }

    setErrors(newErrors);
  };

  const isFormValid = () => {
    const hasRequiredFields = formData.email && formData.password;
    const hasNoErrors = Object.keys(errors).length === 0;
    const hasFullNameIfRegister = isLogin || formData.fullName;
    const hasConfirmPasswordIfRegister = isLogin || formData.confirmPassword;
    return hasRequiredFields && hasNoErrors && hasFullNameIfRegister && hasConfirmPasswordIfRegister;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormValid()) {
      try {
        // Mock API call to backend (replace with your actual URL)
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          // Store token (in real app, consider secure storage)
          localStorage.setItem("token", data.token);
          // Redirect to /dashboard/candidates
          navigate("/dashboard/candidates");
        } else {
          setErrors({ general: data.message || "Login failed" });
        }
      } catch (error) {
        setErrors({ general: "An error occurred. Please try again." });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="login-container">
      <div className="logo">
        <img src={logoIcon || "/placeholder.svg"} alt="Logo" className="logo-icon" />
        <span className="logo-text">LOGO</span>
      </div>
      <div className="content-wrapper">
        <div className="left-panel">
          <img
            src={dashboardImage || "/placeholder.svg"}
            alt="Dashboard Preview"
            className="dashboard-image"
            style={{
              width: "100%",
              maxWidth: "350px",
              height: "200px",
              objectFit: "cover",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            }}
          />
          <div className="left-content">
            <h3 className="left-heading">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod</h3>
            <p className="left-description">
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
              ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <div className="pagination-dots">
              <div className="dot active"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
        <div className="right-panel">
          <div className="form-container">
            <h2 className="form-title">Welcome to Dashboard</h2>
            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <div className="form-group">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full name*"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-input"
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>
              )}
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address*"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password*"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input password-input"
                  />
                  <img
                    src={showPassword ? eyeIcon : eyeOffIcon}
                    alt="Toggle Password"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  />
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              {!isLogin && (
                <div className="form-group">
                  <div className="password-container">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password*"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-input password-input"
                    />
                    <img
                      src={showConfirmPassword ? eyeIcon : eyeOffIcon}
                      alt="Toggle Confirm Password"
                      className="password-toggle"
                      onClick={toggleConfirmPasswordVisibility}
                    />
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              )}
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`submit-button ${isFormValid() ? "valid" : "invalid"}`}
              >
                {isLogin ? "Login" : "Register"}
              </button>
            </form>
            {isLogin && (
              <div className="form-link forgot-password">
                <button type="button" className="link-button">
                  Forgot password?
                </button>
              </div>
            )}
            <div className="form-link toggle-link">
              <button type="button" onClick={handleToggle} className="link-button">
                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
              </button>
            </div>
            {errors.general && <span className="error-message general-error">{errors.general}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;