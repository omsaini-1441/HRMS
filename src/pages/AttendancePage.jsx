import { React, useState, useEffect } from "react"
import { Search, MoreVertical, Edit, X, Calendar, Trash2 } from "lucide-react"
import axios from "axios"
import "../styles/attendance.css"

const AttendancePage = () => {
  const [attendanceData, setAttendanceData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [statusFilter, setStatusFilter] = useState("Status")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [employeeToEdit, setEmployeeToEdit] = useState(null)
  const [recordToDelete, setRecordToDelete] = useState(null)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [taskInput, setTaskInput] = useState("")
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const statusOptions = ["Present", "Absent", "Medical Leave", "Work from Home"]

  const BASE_API_URL = import.meta.env.VITE_API_URL 
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchAttendanceByDate(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    filterData()
  }, [attendanceData, statusFilter, searchTerm])

  const fetchAttendanceByDate = async (date) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.get(`${BASE_API_URL}/attendance/date/${date}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Transform the response to match our component structure
      const transformedData = response.data.map((item) => ({
        _id: item.attendance._id || `temp-${item.employee._id}`,
        employee: item.employee,
        attendanceStatus: item.attendance.status,
        task: item.attendance.task,
        date: item.attendance.date,
        attendanceId: item.attendance._id,
      }))

      setAttendanceData(transformedData)
    } catch (error) {
      setError("Failed to fetch attendance data. Please try again.")
      console.error("Error fetching attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterData = () => {
    let filtered = attendanceData

    if (statusFilter !== "Status") {
      filtered = filtered.filter((item) => item.attendanceStatus === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.employee.department?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredData(filtered)
  }

  const handleStatusChange = async (employeeId, newStatus) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.post(
        `${BASE_API_URL}/attendance`,
        {
          employeeId: employeeId,
          date: selectedDate,
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update local state
      setAttendanceData((prevData) =>
        prevData.map((item) =>
          item.employee._id === employeeId
            ? { ...item, attendanceStatus: newStatus, attendanceId: response.data._id }
            : item,
        ),
      )
    } catch (error) {
      setError("Failed to update attendance status. Please try again.")
      console.error("Error updating attendance status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.post(
        `${BASE_API_URL}/attendance`,
        {
          employeeId: employeeToEdit.employee._id,
          date: selectedDate,
          task: taskInput,
          status: employeeToEdit.attendanceStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Update local state
      setAttendanceData((prevData) =>
        prevData.map((item) =>
          item.employee._id === employeeToEdit.employee._id
            ? { ...item, task: taskInput, attendanceId: response.data._id }
            : item,
        ),
      )

      setShowTaskModal(false)
      setEmployeeToEdit(null)
      setTaskInput("")
    } catch (error) {
      setError("Failed to update task. Please try again.")
      console.error("Error updating task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecord = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Only delete if there's an actual attendance record (not just default)
      if (recordToDelete.attendanceId) {
        await axios.delete(`${BASE_API_URL}/attendance/${recordToDelete.attendanceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Update local state - reset to default values
        setAttendanceData((prevData) =>
          prevData.map((item) =>
            item.employee._id === recordToDelete.employee._id
              ? {
                  ...item,
                  attendanceStatus: "Present",
                  task: "",
                  attendanceId: null,
                }
              : item,
          ),
        )
      } else {
        // If no actual record exists, just reset to defaults
        setAttendanceData((prevData) =>
          prevData.map((item) =>
            item.employee._id === recordToDelete.employee._id
              ? {
                  ...item,
                  attendanceStatus: "Present",
                  task: "",
                  attendanceId: null,
                }
              : item,
          ),
        )
      }

      setShowDeleteModal(false)
      setRecordToDelete(null)
    } catch (error) {
      setError("Failed to delete attendance record. Please try again.")
      console.error("Error deleting attendance record:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      Present: { color: "#008413" },
      Absent: { color: "#B70000" },
      "Medical Leave": { color: "#4D007D" },
      "Work from Home": { color: "#4D007D" },
    }
    return colors[status] || { color: "#4B5563" }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="attendance-container">
      {error && (
        <div className="error-message" style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
          {error}
        </div>
      )}
      {isLoading && (
        <div className="loading-message" style={{ textAlign: "center", marginBottom: "1rem" }}>
          Loading...
        </div>
      )}

      <div className="attendance-header">
        <div className="attendance-header-left">
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

          <div className="date-selector">
            <Calendar size={18} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={isLoading}
              className="date-input"
            />
          </div>
        </div>

        <div className="attendance-header-right">
          <div className="selected-date-display">
            <span className="date-label">Attendance for:</span>
            <span className="date-value">{formatDate(selectedDate)}</span>
          </div>

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
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Sr no.</th>
              <th>Employee Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Task</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                  No employees found for {formatDate(selectedDate)}.
                  {error ? " Please resolve the error and try again." : " Try adjusting the filters."}
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item._id}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td>{item.employee.fullName}</td>
                  <td>{item.employee.position}</td>
                  <td>{item.employee.department}</td>
                  <td className="task-cell">{item.task || "--"}</td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={item.attendanceStatus}
                      onChange={(e) => handleStatusChange(item.employee._id, e.target.value)}
                      style={getStatusColor(item.attendanceStatus)}
                      disabled={isLoading}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status} style={getStatusColor(status)}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="action-dropdown">
                      <button
                        className="action-btn"
                        onClick={() => setActiveDropdown(activeDropdown === item._id ? null : item._id)}
                        disabled={isLoading}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdown === item._id && (
                        <div className="dropdown-menu">
                          <button
                            onClick={() => {
                              setEmployeeToEdit(item)
                              setTaskInput(item.task || "")
                              setShowTaskModal(true)
                              setActiveDropdown(null)
                            }}
                            className="dropdown-item"
                            disabled={isLoading}
                          >
                            <Edit size={14} />
                            {item.task ? "Edit Task" : "Add Task"}
                          </button>
                          <button
                            onClick={() => {
                              setRecordToDelete(item)
                              setShowDeleteModal(true)
                              setActiveDropdown(null)
                            }}
                            className="dropdown-item delete"
                            disabled={isLoading}
                          >
                            <Trash2 size={14} />
                            Delete Record
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

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{employeeToEdit?.task ? "Edit Task" : "Add Task"}</h2>
              <button className="close-btn" onClick={() => setShowTaskModal(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleTaskSubmit}>
              <div className="task-form-content">
                <div className="employee-info">
                  <p>
                    <strong>Employee:</strong> {employeeToEdit?.employee.fullName}
                  </p>
                  <p>
                    <strong>Position:</strong> {employeeToEdit?.employee.position}
                  </p>
                  <p>
                    <strong>Department:</strong> {employeeToEdit?.employee.department}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(selectedDate)}
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="task">Task Description*</label>
                  <textarea
                    id="task"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    placeholder="Enter task description..."
                    required
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
              </div>
              <div className="task-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowTaskModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {employeeToEdit?.task ? "Update Task" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Attendance Record</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
                <X size={20} />
              </button>
            </div>
            <div className="delete-content">
              <p>
                Are you sure you want to delete the attendance record for{" "}
                <strong>{recordToDelete?.employee.fullName}</strong>?
              </p>
              <p>
                <strong>Date:</strong> {formatDate(selectedDate)}
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                <span style={getStatusColor(recordToDelete?.attendanceStatus)}>{recordToDelete?.attendanceStatus}</span>
              </p>
              {recordToDelete?.task && (
                <p>
                  <strong>Task:</strong> {recordToDelete.task}
                </p>
              )}
              <p className="warning-text">
                This will reset the attendance to default values (Present status with no task).
              </p>
            </div>
            <div className="delete-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)} disabled={isLoading}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={handleDeleteRecord} disabled={isLoading}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendancePage
