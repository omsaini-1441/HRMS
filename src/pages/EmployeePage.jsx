import { react, useState, useEffect } from "react";
import { Search, MoreVertical, Edit, Trash2, X } from "lucide-react";
import axios from "axios";
import "../styles/employee.css";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [positionFilter, setPositionFilter] = useState("Position");
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState({
    fullName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    dateOfJoining: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedFields, setFocusedFields] = useState({});

  const positionOptions = [
    "Senior Developer",
    "Human Resource Lead",
    "Designer",
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Product Manager",
    "Intern",
  ];
  const departmentOptions = ["Human Resource", "Developer", "Designer"];

  const BASE_API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${BASE_API_URL}/employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } catch (error) {
        setError(
          "Failed to fetch employees. Please try again or check your authentication."
        );
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, [BASE_API_URL, token]);

  useEffect(() => {
    let filtered = employees;
    if (positionFilter !== "Position") {
      filtered = filtered.filter(
        (employee) => employee.position === positionFilter
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (employee) =>
          employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.phone?.includes(searchTerm)
      );
    }
    setFilteredEmployees(filtered);
  }, [employees, positionFilter, searchTerm]);

  const validateEditedEmployee = () => {
    const errors = {};
    if (!editedEmployee.fullName.trim() || editedEmployee.fullName.length < 2)
      errors.fullName = "Full name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(editedEmployee.email))
      errors.email = "Invalid email format";
    if (!/^\+?[\d\s-]{10,15}$/.test(editedEmployee.phone))
      errors.phone = "Invalid phone number (10-15 digits)";
    if (!editedEmployee.position) errors.position = "Position is required";
    if (!editedEmployee.department)
      errors.department = "Department is required";
    if (!editedEmployee.dateOfJoining)
      errors.dateOfJoining = "Date of Joining is required";
    return errors;
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    const validationErrors = validateEditedEmployee();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors).join(", "));
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.patch(
        `${BASE_API_URL}/employees/${employeeToEdit._id}`,
        editedEmployee,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmployees(
        employees.map((emp) =>
          emp._id === employeeToEdit._id ? response.data : emp
        )
      );
      setShowEditModal(false);
      setEmployeeToEdit(null);
    } catch (error) {
      setError(
        "Failed to update employee. Please try again or check your authentication."
      );
      console.error("Error updating employee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      setIsLoading(true);
      setError(null);
      await axios.delete(`${BASE_API_URL}/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employees.filter((emp) => emp._id !== employeeId));
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
    } catch (error) {
      setError(
        "Failed to delete employee. Please try again or check your authentication."
      );
      console.error("Error deleting employee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field, value) => {
    if (!value && field !== "resume" ? !value.trim() : !value) {
      setFocusedFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="employee-container">
      {error && (
        <div
          className="error-message"
          style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}
        >
          {error}
        </div>
      )}
      {isLoading && (
        <div
          className="loading-message"
          style={{ textAlign: "center", marginBottom: "1rem" }}
        >
          Loading...
        </div>
      )}
      <div className="employee-header">
        <div className="employee-header-left">
          <select
            className="dropdown"
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="Position">Position</option>
            {positionOptions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
        <div className="employee-header-right">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="employees-table">
          <thead>
            <tr>
              <th>Sr no.</th>
              <th>Employee Name</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Position</th>
              <th>Department</th>
              <th>Date of Joining</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No employees found.{" "}
                  {error
                    ? "Please resolve the error and try again."
                    : "Try adjusting the filters."}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee, index) => (
                <tr key={employee._id}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td>{employee.fullName}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone}</td>
                  <td>{employee.position}</td>
                  <td>{employee.department}</td>
                  <td>
                    {new Date(employee.dateOfJoining).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-dropdown">
                      <button
                        className="action-btn"
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === employee._id
                              ? null
                              : employee._id
                          )
                        }
                        disabled={isLoading}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdown === employee._id && (
                        <div className="dropdown-menu">
                          <button
                            onClick={() => {
                              setEmployeeToEdit(employee);
                              setEditedEmployee(employee);
                              setShowEditModal(true);
                              setActiveDropdown(null);
                            }}
                            className="dropdown-item"
                            disabled={isLoading}
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setEmployeeToDelete(employee);
                              setShowDeleteModal(true);
                              setActiveDropdown(null);
                            }}
                            className="dropdown-item delete"
                            disabled={isLoading}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Employee</h2>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditEmployee}>
              <div className="form-row">
                <div className="form-group">
                  <div className="floating-label">
                    <input
                      type="text"
                      value={editedEmployee.fullName}
                      onChange={(e) =>
                        setEditedEmployee({
                          ...editedEmployee,
                          fullName: e.target.value,
                        })
                      }
                      onFocus={() => handleFocus("fullName")}
                      onBlur={() =>
                        handleBlur("fullName", editedEmployee.fullName)
                      }
                      required
                      disabled={isLoading}
                    />
                    <span
                      className={
                        focusedFields.fullName || editedEmployee.fullName
                          ? "label-active"
                          : ""
                      }
                    >
                      Employee Name*
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <div className="floating-label">
                    <input
                      type="email"
                      value={editedEmployee.email}
                      onChange={(e) =>
                        setEditedEmployee({
                          ...editedEmployee,
                          email: e.target.value,
                        })
                      }
                      onFocus={() => handleFocus("email")}
                      onBlur={() => handleBlur("email", editedEmployee.email)}
                      required
                      disabled={isLoading}
                    />
                    <span
                      className={
                        focusedFields.email || editedEmployee.email
                          ? "label-active"
                          : ""
                      }
                    >
                      Email Address*
                    </span>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <div className="floating-label">
                    <input
                      type="tel"
                      value={editedEmployee.phone}
                      onChange={(e) =>
                        setEditedEmployee({
                          ...editedEmployee,
                          phone: e.target.value,
                        })
                      }
                      onFocus={() => handleFocus("phone")}
                      onBlur={() => handleBlur("phone", editedEmployee.phone)}
                      required
                      disabled={isLoading}
                    />
                    <span
                      className={
                        focusedFields.phone || editedEmployee.phone
                          ? "label-active"
                          : ""
                      }
                    >
                      Phone Number*
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <div className="static-label">
                    <select
                      value={editedEmployee.position}
                      onChange={(e) =>
                        setEditedEmployee({
                          ...editedEmployee,
                          position: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select Position*</option>
                      {positionOptions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <div className="static-label">
                    <select
                      value={editedEmployee.department}
                      onChange={(e) =>
                        setEditedEmployee({
                          ...editedEmployee,
                          department: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    >
                      <option value="">Select Department*</option>
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <div className="static-label">
                    <input
                      type="date"
                      value={editedEmployee.dateOfJoining}
                      onChange={(e) =>
                        setEditedEmployee({
                          ...editedEmployee,
                          dateOfJoining: e.target.value,
                        })
                      }
                      required
                      className="date-input"
                      disabled={isLoading}
                      placeholder="Select Date of Joining*"
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={isLoading}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-content delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Delete Employee</h2>
              <button
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="delete-content">
              <p>
                Are you sure you want to delete {employeeToDelete?.fullName}?
              </p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="delete-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="delete-confirm-btn"
                onClick={() => handleDeleteEmployee(employeeToDelete._id)}
                disabled={isLoading}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;