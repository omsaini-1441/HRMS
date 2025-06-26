import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const BASE_API_URL = import.meta.env.VITE_API_URL;

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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!isLogin) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setErrors({});
      try {
        if (!isLogin) {
          const response = await axios.post(`${BASE_API_URL}/auth/register`, formData);
          setErrors({ general: "Registration successful. Please log in." });
          setIsLogin(true);
          setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
          return;
        }
        const response = await axios.post(`${BASE_API_URL}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard/candidates");
      } catch (error) {
        const errorMessage = error.response?.data?.message || (isLogin ? "Login failed" : "Registration failed");
        setErrors({ general: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  useEffect(() => {
    setErrors({});
  }, [isLogin]);

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
            {isLoading && <div className="loading-message">Loading...</div>}
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
                    disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
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
                disabled={!formData.email || !formData.password || Object.keys(errors).length > 0 || isLoading}
                className={`submit-button ${formData.email && formData.password && Object.keys(errors).length === 0 && !isLoading ? "valid" : "invalid"}`}
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
                <button type="button" onClick={handleToggle} className="link-button" disabled={isLoading}>
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </button>
              </div>
              {errors.general && (
                <span className={errors.general.includes("successful") ? "success-message" : "error-message"}>
                  {errors.general}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}

export default Login;