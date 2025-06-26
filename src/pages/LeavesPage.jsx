"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, Calendar, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import axios from "axios"
import "../styles/leaves.css"
import { getDaysInMonth, getFirstDayOfMonth } from "../utils/dateUtils"

const LeavePage = () => {
  const [leaves, setLeaves] = useState([])
  const [filteredLeaves, setFilteredLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [statusFilter, setStatusFilter] = useState("Status")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date())
  const [calendarLeaves, setCalendarLeaves] = useState({})
  const [selectedDateLeaves, setSelectedDateLeaves] = useState([])
  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    designation: "",
    documents: null,
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const statusOptions = ["Pending", "Approved", "Rejected"]
  const leaveTypeOptions = [
    "Sick Leave",
    "Casual Leave",
    "Annual Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Emergency Leave",
  ]

  const weekdays = [
    { key: "sun", label: "S" },
    { key: "mon", label: "M" },
    { key: "tue", label: "T" },
    { key: "wed", label: "W" },
    { key: "thu", label: "T" },
    { key: "fri", label: "F" },
    { key: "sat", label: "S" },
  ]

  const BASE_API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api"
  const token = localStorage.getItem("token")

  // Memoize fetch functions to prevent unnecessary re-renders
  const fetchLeaves = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.get(`${BASE_API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLeaves(response.data)
    } catch (error) {
      setError("Failed to fetch leaves. Please try again.")
      console.error("Error fetching leaves:", error)
    } finally {
      setIsLoading(false)
    }
  }, [BASE_API_URL, token])

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setEmployees(response.data)
    } catch (error) {
      console.error("Error fetching employees:", error)
    }
  }, [BASE_API_URL, token])

  const fetchCalendarLeaves = useCallback(async () => {
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      const response = await axios.get(`${BASE_API_URL}/leaves/calendar?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCalendarLeaves(response.data)
    } catch (error) {
      console.error("Error fetching calendar leaves:", error)
    }
  }, [currentDate, BASE_API_URL, token])

  const fetchSelectedDateLeaves = useCallback(async () => {
    try {
      // Fix: Ensure date is formatted in local time to avoid timezone issues
      const year = selectedCalendarDate.getFullYear()
      const month = String(selectedCalendarDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedCalendarDate.getDate()).padStart(2, "0")
      const dateStr = `${year}-${month}-${day}`
      const response = await axios.get(`${BASE_API_URL}/leaves/date/${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSelectedDateLeaves(response.data)
    } catch (error) {
      console.error("Error fetching selected date leaves:", error)
      setSelectedDateLeaves([])
    }
  }, [selectedCalendarDate, BASE_API_URL, token])

  const filterLeaves = useCallback(() => {
    let filtered = leaves

    if (statusFilter !== "Status") {
      filtered = filtered.filter((leave) => leave.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (leave) =>
          leave.employeeId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredLeaves(filtered)
  }, [leaves, statusFilter, searchTerm])

  // Initial data fetch
  useEffect(() => {
    fetchLeaves()
    fetchEmployees()
  }, [fetchLeaves, fetchEmployees])

  // Fetch calendar data when month changes
  useEffect(() => {
    fetchCalendarLeaves()
  }, [fetchCalendarLeaves])

  // Fetch selected date leaves when date changes
  useEffect(() => {
    fetchSelectedDateLeaves()
  }, [fetchSelectedDateLeaves])

  // Filter leaves when dependencies change
  useEffect(() => {
    filterLeaves()
  }, [filterLeaves])

  const handleAddLeave = async (e) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append("employeeId", newLeave.employeeId)
      formData.append("leaveType", newLeave.leaveType)
      formData.append("startDate", newLeave.startDate)
      formData.append("endDate", newLeave.endDate)
      formData.append("reason", newLeave.reason)
      formData.append("designation", newLeave.designation)

      if (newLeave.documents) {
        formData.append("documents", newLeave.documents)
      }

      const response = await axios.post(`${BASE_API_URL}/leaves`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      setLeaves([response.data, ...leaves])
      setShowAddModal(false)
      setNewLeave({
        employeeId: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        designation: "",
        documents: null,
      })

      // Refresh calendar data
      await fetchCalendarLeaves()
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add leave application.")
      console.error("Error adding leave:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.put(
        `${BASE_API_URL}/leaves/${leaveId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setLeaves(leaves.map((leave) => (leave._id === leaveId ? response.data : leave)))

      // Refresh calendar data
      await fetchCalendarLeaves()
    } catch (error) {
      setError("Failed to update leave status.")
      console.error("Error updating leave status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadDocument = async (leaveId, fileName) => {
    try {
      setError(null)
      const response = await axios.get(`${BASE_API_URL}/leaves/${leaveId}/document`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName || "leave-document.pdf")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setError("Failed to download document.")
      console.error("Error downloading document:", error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Pending: { color: "#E8B000" },
      Approved: { color: "#008413" },
      Rejected: { color: "#B70000" },
    }
    return colors[status] || { color: "#4B5563" }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      // Fix: Use local date string for consistency
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(
        2,
        "0",
      )}`
      const dayLeaves = calendarLeaves[dateStr] || []
      const isSelected = date.toDateString() === selectedCalendarDate.toDateString()
      const isToday = date.toDateString() === new Date().toDateString()

      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${
            dayLeaves.length > 0 ? "has-leaves" : ""
          }`}
          onClick={() => setSelectedCalendarDate(date)}
        >
          <span className="day-number">{day}</span>
          {dayLeaves.length > 0 && <span className="leave-count">{dayLeaves.length}</span>}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="leave-container">
      {error && (
        <div className="error-message" style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}

      <div className="leave-header">
        <div className="leave-header-left">
          <select
            className="dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="Status">Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status} style={getStatusColor(status)}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="leave-header-right">
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
          <button className="add-leave-btn" onClick={() => setShowAddModal(true)} disabled={isLoading}>
            Add Leave
          </button>
        </div>
      </div>

      <div className="leave-content">
        {/* Left Section - Leaves Table */}
        <div className="leave-table-section">
          <div className="section-header">
            <h3>Applied Leaves</h3>
          </div>
          <div className="table-container">
            <table className="leaves-table">
              <thead>
                <tr>
                  <th>Sr no.</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Docs</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                      No leave applications found.
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave, index) => (
                    <tr key={leave._id}>
                      <td>{String(index + 1).padStart(2, "0")}</td>
                      <td>
                        <div className="leave-employee-info">
                          <div className="leave-employee-name">{leave.employeeId?.fullName}</div>
                          <div className="leave-employee-position">{leave.employeeId?.position}</div>
                        </div>
                      </td>
                      <td>
                        <div className="leave-date">
                          {new Date(leave.startDate).toLocaleDateString()}
                          {leave.startDate !== leave.endDate && (
                            <>
                              <br />
                              to {new Date(leave.endDate).toLocaleDateString()}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="leave-reason-cell">{leave.reason}</td>
                      <td className="leave-designation-cell">{leave.designation}</td>
                      <td>
                        <select
                          className="leave-status-dropdown"
                          value={leave.status}
                          onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                          style={getStatusColor(leave.status)}
                          disabled={isLoading}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status} style={getStatusColor(status)}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="leave-docs-cell">
                        {leave.documents && (leave.documents.hasDocument || leave.documents.filename) ? (
                          <FileText
                            size={18}
                            className="docs-icon has-docs"
                            onClick={() => handleDownloadDocument(leave._id, leave.documents.filename)}
                            title="Download document"
                          />
                        ) : (
                          <FileText size={18} className="docs-icon no-docs" title="No document uploaded" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section - Calendar */}
        <div className="leave-calendar-section">
          <div className="section-header">
            <h3>Leave Calendar</h3>
          </div>
          <div className="calendar-container">
            <div className="calendar-header">
              <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                <ChevronLeft size={16} />
              </button>
              <h4>
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>
              <button className="nav-btn" onClick={() => navigateMonth(1)}>
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="calendar-grid">
              <div className="calendar-weekdays">
                {weekdays.map((day) => (
                  <div key={day.key} className="weekday">
                    {day.label}
                  </div>
                ))}
              </div>
              <div className="calendar-days">{renderCalendar()}</div>
            </div>
          </div>

          {/* Approved Leaves for Selected Date */}
          <div className="selected-date-leaves">
            <h4>Approved Leaves</h4>
            <div className="selected-date">{formatDate(selectedCalendarDate)}</div>
            <div className="leaves-list">
              {selectedDateLeaves.length === 0 ? (
                <p className="no-leaves">No approved leaves for this date</p>
              ) : (
                selectedDateLeaves.map((leave) => (
                  <div key={leave._id} className="leave-item">
                    <div className="leave-employee">
                      <div className="profile-avatar">{leave.employeeId?.fullName?.charAt(0).toUpperCase()}</div>
                      <div className="employee-details">
                        <div className="name">{leave.employeeId?.fullName}</div>
                        <div className="position">{leave.designation}</div>
                      </div>
                    </div>
                    <div className="leave-type">{leave.leaveType}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Leave Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Leave</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddLeave}>
              <div className="leave-form-content">
                <div className="leave-form-row">
                  <div className="leave-form-group">
                    <label htmlFor="employee">Employee*</label>
                    <select
                      id="employee"
                      value={newLeave.employeeId}
                      onChange={(e) => {
                        const selectedEmployee = employees.find((emp) => emp._id === e.target.value)
                        setNewLeave({
                          ...newLeave,
                          employeeId: e.target.value,
                          designation: selectedEmployee?.position || "",
                        })
                      }}
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.fullName} - {employee.position}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="leave-form-group">
                    <label htmlFor="leaveType">Leave Type*</label>
                    <select
                      id="leaveType"
                      value={newLeave.leaveType}
                      onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                      required
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="leave-form-row">
                  <div className="leave-form-group">
                    <label htmlFor="designation">Designation*</label>
                    <input
                      type="text"
                      id="designation"
                      value={newLeave.designation}
                      onChange={(e) => setNewLeave({ ...newLeave, designation: e.target.value })}
                      placeholder="Employee designation"
                      required
                      readOnly
                    />
                  </div>
                  <div className="leave-form-group">
                    <label htmlFor="documents">Supporting Documents</label>
                    <div className="leave-file-input-group">
                      <input
                        type="file"
                        id="documents"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => setNewLeave({ ...newLeave, documents: e.target.files[0] })}
                        hidden
                      />
                      <label htmlFor="documents" className="leave-file-label">
                        {newLeave.documents ? newLeave.documents.name : "Choose file (optional)"}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="leave-form-row">
                  <div className="leave-form-group">
                    <label htmlFor="startDate">Start Date*</label>
                    <div className="leave-date-input-group">
                      <Calendar size={16} />
                      <input
                        type="date"
                        id="startDate"
                        value={newLeave.startDate}
                        onChange={(e) =>
                          setNewLeave({ ...newLeave, startDate: e.target.value, endDate: e.target.value })
                        }
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                  <div className="leave-form-group">
                    <label htmlFor="endDate">End Date*</label>
                    <div className="leave-date-input-group">
                      <Calendar size={16} />
                      <input
                        type="date"
                        id="endDate"
                        value={newLeave.endDate}
                        onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                        required
                        min={newLeave.startDate || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>

                <div className="leave-form-row full-width">
                  <div className="leave-form-group">
                    <label htmlFor="reason">Reason for Leave*</label>
                    <textarea
                      id="reason"
                      placeholder="Please provide a reason for your leave request..."
                      value={newLeave.reason}
                      onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                      required
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  Submit Leave Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeavePage