import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Download, Trash2, X, Upload } from 'lucide-react';
import axios from 'axios';
import '../styles/candidate.css';

const CandidatePage = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Status');
  const [positionFilter, setPositionFilter] = useState('Position');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [newCandidate, setNewCandidate] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    resume: null
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = ['New', 'Scheduled', 'Ongoing', 'Selected', 'Rejected'];
  const positionOptions = ['Senior Developer', 'Human Resource Lead', ' Designer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Product Manager'];

  const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_API_URL}/candidates`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setCandidates(response.data);
      setFilteredCandidates(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch candidates. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching candidates:', {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
        stack: error.stack
      });
      setCandidates([]);
      setFilteredCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = candidates;

    if (statusFilter !== 'Status') {
      filtered = filtered.filter(candidate => candidate.status === statusFilter);
    }

    if (positionFilter !== 'Position') {
      filtered = filtered.filter(candidate => candidate.position === positionFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone?.includes(searchTerm)
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, statusFilter, positionFilter, searchTerm]);

  const validateNewCandidate = () => {
    const errors = {};
    if (!newCandidate.fullName.trim() || newCandidate.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    if (!/^\S+@\S+\.\S+$/.test(newCandidate.email)) {
      errors.email = 'Invalid email format';
    }
    if (!/^\+?[\d\s-]{10,15}$/.test(newCandidate.phone)) {
      errors.phone = 'Invalid phone number (10-15 digits)';
    }
    if (!newCandidate.position) {
      errors.position = 'Position is required';
    }
    if (!newCandidate.experience.trim()) {
      errors.experience = 'Experience is required';
    }
    if (!newCandidate.resume) {
      errors.resume = 'Resume is required';
    }
    return errors;
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    const validationErrors = validateNewCandidate();
    if (Object.keys(validationErrors).length > 0) {
      setError(Object.values(validationErrors).join(', '));
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      Object.keys(newCandidate).forEach(key => {
        formData.append(key, newCandidate[key]);
      });

      const response = await axios.post(`${BASE_API_URL}/candidates`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setCandidates([...candidates, response.data]);
      setShowAddModal(false);
      setNewCandidate({
        fullName: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        resume: null
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add candidate. Please check your input and try again.';
      setError(errorMessage);
      console.error('Error adding candidate:', {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      setIsLoading(true);
      setError(null);
      await axios.delete(`${BASE_API_URL}/candidates/${candidateId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setCandidates(candidates.filter(c => c._id !== candidateId));
      setShowDeleteModal(false);
      setCandidateToDelete(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete candidate. Please try again.';
      setError(errorMessage);
      console.error('Error deleting candidate:', {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadResume = async (candidate) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_API_URL}/candidates/${candidate._id}/resume`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidate.fullName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to download resume. Please try again.';
      setError(errorMessage);
      console.error('Error downloading resume:', {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.patch(`${BASE_API_URL}/candidates/${candidateId}`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (newStatus === 'Selected') {
        const candidate = candidates.find(c => c._id === candidateId);
        await axios.post(`${BASE_API_URL}/employees`, {
          fullName: candidate.fullName,
          email: candidate.email,
          phone: candidate.phone,
          position: candidate.position,
          experience: candidate.experience,
          resume: candidate.resume
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        await handleDeleteCandidate(candidateId);
      } else {
        setCandidates(candidates.map(candidate =>
          candidate._id === candidateId ? response.data : candidate
        ));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update candidate status or move to employee. Please try again.';
      setError(errorMessage);
      console.error('Error updating candidate status:', {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': { color: '#1E40AF' },
      'Scheduled': { color: '#E8B000' },
      'Ongoing': { color: '#008413' },
      'Selected': { color: '#4D007D' },
      'Rejected': { color: '#B70000' }
    };
    return colors[status] || { color: '#4B5563' };
  };

  return (
    <div className="candidate-container">
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
          {error}
        </div>
      )}
      {isLoading && (
        <div className="loading-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Loading...
        </div>
      )}
      <div className="candidate-header">
        <div className="candidate-header-left">
          <select 
            className="dropdown" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="Status">Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status} style={getStatusColor(status)}>{status}</option>
            ))}
          </select>
          <select 
            className="dropdown" 
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            disabled={isLoading}
          >
            <option value="Position">Position</option>
            {positionOptions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>
        <div className="candidate-header-right">
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
          <button 
            className="add-candidate-btn"
            onClick={() => setShowAddModal(true)}
            disabled={isLoading}
          >
            Add Candidate
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Sr no.</th>
              <th>Candidates Name</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Position</th>
              <th>Status</th>
              <th>Experience</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No candidates found. {error ? 'Please resolve the error and try again.' : 'Try adding a new candidate or adjusting the filters.'}
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate, index) => (
                <tr key={candidate._id}>
                  <td>{String(index + 1).padStart(2, '0')}</td>
                  <td>{candidate.fullName}</td>
                  <td>{candidate.email}</td>
                  <td>{candidate.phone}</td>
                  <td>{candidate.position}</td>
                  <td>
                    <select
                      className="status-dropdown"
                      value={candidate.status}
                      onChange={(e) => handleStatusChange(candidate._id, e.target.value)}
                      style={getStatusColor(candidate.status)}
                      disabled={isLoading}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status} style={getStatusColor(status)}>{status}</option>
                      ))}
                    </select>
                  </td>
                  <td>{candidate.experience}</td>
                  <td>
                    <div className="action-dropdown">
                      <button 
                        className="action-btn"
                        onClick={() => setActiveDropdown(activeDropdown === candidate._id ? null : candidate._id)}
                        disabled={isLoading}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdown === candidate._id && (
                        <div className="dropdown-menu">
                          <button 
                            onClick={() => handleDownloadResume(candidate)}
                            className="dropdown-item"
                            disabled={isLoading}
                          >
                            <Download size={14} />
                            Download Resume
                          </button>
                          <button 
                            onClick={() => {
                              setCandidateToDelete(candidate);
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

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Candidate</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCandidate}>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Full Name*"
                    value={newCandidate.fullName}
                    onChange={(e) => setNewCandidate({...newCandidate, fullName: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                  </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email Address*"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Phone Number*"
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({...newCandidate, phone: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <select
                    value={newCandidate.position}
                    onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Position*</option>
                    {positionOptions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Experience*"
                    value={newCandidate.experience}
                    onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="resume"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setNewCandidate({...newCandidate, resume: e.target.files[0]})}
                      hidden
                      disabled={isLoading}
                    />
                    <label htmlFor="resume" className="file-input-label">
                      <Upload size={16} />
                      {newCandidate.resume ? newCandidate.resume.name : 'Resume*'}
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-checkbox">
                <input 
                  type="checkbox" 
                  id="declaration" 
                  required 
                  disabled={isLoading}
                />
                <label htmlFor="declaration">
                  I hereby declare that the above information is true to the best of my knowledge and belief
                </label>
              </div>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={isLoading}
              >
                Add Candidate
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Candidate</h2>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="delete-content">
              <p>Are you sure you want to delete {candidateToDelete?.fullName}?</p>
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
                onClick={() => handleDeleteCandidate(candidateToDelete._id)}
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

export default CandidatePage;