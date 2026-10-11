import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  LayoutDashboard,
  Plus,
  Search,
  Bell,
  UserRound,
  CalendarDays,
  MapPin,
  Clock,
  TrendingUp,
  CircleCheck,
  XCircle,
  Menu,
  Pencil,
  Trash2,
  RefreshCw,
  Target,
  Download,
} from "lucide-react";

import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
} from "./api";

import "./App.css";

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const emptyJob = {
  companyName: "",
  jobTitle: "",
  location: "",
  status: "Applied",
  date: getToday(),
};

// Read applicationDate from the backend, with date as a fallback.
const getJobDate = (job) => {
  return job.applicationDate ?? job.date ?? "";
};

// Convert a date into a number for sorting.
const getDateValue = (job) => {
  const date = getJobDate(job);

  if (!date) {
    return null;
  }

  const timestamp = new Date(date).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
};

const exportJobsToCSV = (jobs) => {
  if (jobs.length === 0) {
    alert("No applications available to export.");
    return;
  }

  const headers = [
    "Company Name",
    "Job Title",
    "Location",
    "Status",
    "Application Date",
  ];

  const escapeCSV = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
};

const rows = jobs.map((job) => [
  job.companyName,
  job.jobTitle,
  job.location,
  job.status,
  getJobDate(job),
]);

const csvContent = [
  headers.map(escapeCSV).join(","),
  ...rows.map((row) => row.map(escapeCSV).join(",")),
].join("\r\n");

const blob = new Blob(["\uFEFF" + csvContent], {
  type: "text/csv;charset=utf-8;",
});

const url = URL.createObjectURL(blob);
const link = document.createElement("a");

link.href = url;
link.download = "job-applications.csv";

document.body.appendChild(link);
link.click();
link.remove();

URL.revokeObjectURL(url);
};

function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Applications");
  const [sortOrder, setSortOrder] = useState("newest");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [newJob, setNewJob] = useState({ ...emptyJob });

  // Load applications from the Spring Boot backend.
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllJobs();

      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading applications:", err);

      setError(
          "Unable to load applications. Make sure your Spring Boot backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Search, filter, and sort applications.
  const filteredJobs = jobs
      .filter((job) => {
        const company = String(job.companyName ?? "");
        const title = String(job.jobTitle ?? "");
        const location = String(job.location ?? "");
        const status = String(job.status ?? "");

        const search = searchTerm.trim().toLowerCase();

        const matchesSearch =
            company.toLowerCase().includes(search) ||
            title.toLowerCase().includes(search) ||
            location.toLowerCase().includes(search);

        const matchesFilter =
            activeFilter === "All Applications" ||
            status.toLowerCase() === activeFilter.toLowerCase();

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const dateA = getDateValue(a);
        const dateB = getDateValue(b);

        // Keep records without dates at the bottom.
        if (dateA === null && dateB === null) {
          return 0;
        }

        if (dateA === null) {
          return 1;
        }

        if (dateB === null) {
          return -1;
        }

        return sortOrder === "oldest"
            ? dateA - dateB
            : dateB - dateA;
      });

  // Dashboard statistics.
  const totalApplications = jobs.length;

  const interviewCount = jobs.filter(
      (job) => String(job.status ?? "").toLowerCase() === "interview"
  ).length;

  const offerCount = jobs.filter(
      (job) => String(job.status ?? "").toLowerCase() === "offer"
  ).length;

  const rejectedCount = jobs.filter(
      (job) => String(job.status ?? "").toLowerCase() === "rejected"
  ).length;

  const offerRate =
      totalApplications > 0
          ? Math.round((offerCount / totalApplications) * 100)
          : 0;

  // Update form values.
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setNewJob((previousJob) => ({
      ...previousJob,
      [name]: value,
    }));
  };

  // Open form to add an application.
  const handleAddClick = () => {
    setEditingId(null);
    setNewJob({ ...emptyJob });
    setShowForm(true);
    setError("");
  };

  // Open form to edit an application.
  const handleEditClick = (job) => {
    setEditingId(job.id);

    setNewJob({
      companyName: job.companyName ?? "",
      jobTitle: job.jobTitle ?? "",
      location: job.location ?? "",
      status: job.status ?? "Applied",
      date: getJobDate(job)
          ? String(getJobDate(job)).slice(0, 10)
          : getToday(),
    });

    setShowForm(true);
    setError("");
  };

  // Create or update an application.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
        !newJob.companyName.trim() ||
        !newJob.jobTitle.trim() ||
        !newJob.location.trim() ||
        !newJob.date
    ) {
      setError("Please fill in all fields before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const jobData = {
        companyName: newJob.companyName.trim(),
        jobTitle: newJob.jobTitle.trim(),
        location: newJob.location.trim(),
        status: newJob.status,
        applicationDate: newJob.date,
      };

      if (editingId !== null) {
        await updateJob(editingId, jobData);
      } else {
        await createJob(jobData);
      }

      setShowForm(false);
      setEditingId(null);
      setNewJob({ ...emptyJob });

      await loadJobs();
    } catch (err) {
      console.error("Error saving application:", err);

      setError(
          "Unable to save the application. Please check your backend and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete an application.
  const handleDeleteClick = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteJob(id);
      await loadJobs();
    } catch (err) {
      console.error("Error deleting application:", err);

      setError("Unable to delete the application. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Close the application form.
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setNewJob({ ...emptyJob });
    setError("");
  };

  return (
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <BriefcaseBusiness size={25} />
            </div>

            <div>
              <h2>JobTrack</h2>
              <span>Career Dashboard</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <p className="nav-heading">MENU</p>

            <a href="#dashboard" className="nav-item active">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </a>

            <a href="#applications" className="nav-item">
              <BriefcaseBusiness size={20} />
              <span>Applications</span>
            </a>

            <a href="#statistics" className="nav-item">
              <TrendingUp size={20} />
              <span>Statistics</span>
            </a>
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-help">
              <Target size={24} />
              <h3>Keep going!</h3>

              <p>
                Every application brings you one step closer to your next
                opportunity.
              </p>
            </div>

            <div className="sidebar-footer">JobTrack Dashboard</div>
          </div>
        </aside>

        {/* Main dashboard */}
        <main className="main-content" id="dashboard">
          <header className="topbar">
            <div className="topbar-left">
              <button
                  className="icon-button mobile-menu"
                  type="button"
                  aria-label="Menu"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="breadcrumb">Workspace / Dashboard</p>
                <h1>My Dashboard</h1>
              </div>
            </div>

            <div className="topbar-right">
              <button
                  type="button"
                  className="icon-button"
                  aria-label="Notifications"
              >
                <Bell size={20} />
              </button>

              <div className="profile-info">
                <div className="profile-icon">
                  <UserRound size={20} />
                </div>

                <div className="profile-text">
                  <strong>My Account</strong>
                  <span>Job Seeker</span>
                </div>
              </div>
            </div>
          </header>

          {/* Welcome section */}
          <section className="welcome-section">
            <div>
              <h2>Welcome back!</h2>

              <p>
                Track your job applications and stay on top of your career goals.
              </p>
            </div>

            <button
                type="button"
                className="primary-button"
                onClick={handleAddClick}
            >
              <Plus size={19} />
              Add Application
            </button>
          </section>

          {/* Error message */}
          {error && (
              <div className="error-message">
                <span>{error}</span>

                <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                >
                  <XCircle size={18} />
                </button>
              </div>
          )}

          {/* Statistics */}
          <section className="stats-grid" id="statistics">
            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon blue">
                  <BriefcaseBusiness size={22} />
                </div>
              </div>

              <p className="stat-label">Total Applications</p>
              <h3>{totalApplications}</h3>
              <span className="stat-description">Applications tracked</span>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon purple">
                  <CalendarDays size={22} />
                </div>
              </div>

              <p className="stat-label">Interviews</p>
              <h3>{interviewCount}</h3>
              <span className="stat-description">Interview opportunities</span>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon green">
                  <CircleCheck size={22} />
                </div>
              </div>

              <p className="stat-label">Offers</p>
              <h3>{offerCount}</h3>
              <span className="stat-description">Job offers received</span>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon red">
                  <XCircle size={22} />
                </div>
              </div>

              <p className="stat-label">Rejected</p>
              <h3>{rejectedCount}</h3>
              <span className="stat-description">Applications rejected</span>
            </div>

            <div className="stat-card">
              <div className="stat-card-top">
                <div className="stat-icon orange">
                  <TrendingUp size={22} />
                </div>
              </div>

              <p className="stat-label">Offer Rate</p>
              <h3>{offerRate}%</h3>
              <span className="stat-description">
              Offers / total applications
            </span>
            </div>
          </section>

          {/* Application form */}
          {showForm && (
              <section className="form-card">
                <div className="section-heading">
                  <div>
                    <h2>
                      {editingId !== null
                          ? "Edit Application"
                          : "Add New Application"}
                    </h2>

                    <p>Enter the details of your job application.</p>
                  </div>

                  <button
                      type="button"
                      className="icon-button"
                      onClick={handleCancel}
                      aria-label="Close form"
                  >
                    <XCircle size={21} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="companyName">Company Name</label>

                      <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          placeholder="e.g. Google"
                          value={newJob.companyName}
                          onChange={handleInputChange}
                          required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="jobTitle">Job Title</label>

                      <input
                          id="jobTitle"
                          name="jobTitle"
                          type="text"
                          placeholder="e.g. Software Engineer"
                          value={newJob.jobTitle}
                          onChange={handleInputChange}
                          required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="location">Location</label>

                      <input
                          id="location"
                          name="location"
                          type="text"
                          placeholder="e.g. Hyderabad"
                          value={newJob.location}
                          onChange={handleInputChange}
                          required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="status">Application Status</label>

                      <select
                          id="status"
                          name="status"
                          value={newJob.status}
                          onChange={handleInputChange}
                          required
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="date">Application Date</label>

                      <input
                          id="date"
                          name="date"
                          type="date"
                          value={newJob.date}
                          onChange={handleInputChange}
                          required
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                      Cancel
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={saving}
                    >
                      {saving
                          ? "Saving..."
                          : editingId !== null
                              ? "Update Application"
                              : "Save Application"}
                    </button>
                  </div>
                </form>
              </section>
          )}

          {/* Applications table */}
          <section className="applications-card" id="applications">
            <div className="applications-header">
              <div className="section-heading">
                <div>
                  <h2>Job Applications</h2>

                  <p>
                    Manage and track all your applications in one place.
                  </p>
                </div>
              </div>

              <div className="section-actions">
                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => exportJobsToCSV(filteredJobs)}
                >
                  <Download size={16} />
                  Export CSV
                </button>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={loadJobs}
                    disabled={loading}
                >
                  <RefreshCw
                      size={16}
                      className={loading ? "spin" : ""}
                  />
                  Refresh
                </button>

                <button
                    type="button"
                    className="primary-button"
                    onClick={handleAddClick}
                >
                  <Plus size={17} />
                  Add New
                </button>
              </div>
            </div>

            {/* Search and filters */}
            <div className="table-toolbar">
              <div className="search-box">
                <Search size={19} />

                <input
                    type="search"
                    placeholder="Search company, job title, or location..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <div className="toolbar-filters">
                <select
                    className="filter-select"
                    value={activeFilter}
                    onChange={(event) => setActiveFilter(event.target.value)}
                    aria-label="Filter by application status"
                >
                  <option value="All Applications">All Applications</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                    className="filter-select"
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    aria-label="Sort applications by date"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Applications table */}
            <div className="table-container">
              <table className="applications-table">
                <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
                </thead>

                <tbody>
                {loading ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        Loading applications...
                      </td>
                    </tr>
                ) : filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <BriefcaseBusiness size={32} />
                        <p>No applications found.</p>

                        <span>
                        Try changing your search or filter, or add an
                        application.
                      </span>
                      </td>
                    </tr>
                ) : (
                    filteredJobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <div className="company-cell">
                              <div className="company-avatar">
                                {String(job.companyName ?? "?")
                                    .charAt(0)
                                    .toUpperCase()}
                              </div>

                              <strong>
                                {job.companyName || "Unknown Company"}
                              </strong>
                            </div>
                          </td>

                          <td>{job.jobTitle || "—"}</td>

                          <td>
                        <span className="location-cell">
                          <MapPin size={15} />
                          {job.location || "—"}
                        </span>
                          </td>

                          <td>
                        <span className="date-cell">
                          <Clock size={15} />
                          {getJobDate(job)
                              ? String(getJobDate(job)).slice(0, 10)
                              : "No date"}
                        </span>
                          </td>

                          <td>
                        <span
                            className={`status-badge ${String(
                                job.status ?? "Applied"
                            )
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                        >
                          {job.status || "Applied"}
                        </span>
                          </td>

                          <td>
                            <div className="action-buttons">
                              <button
                                  type="button"
                                  className="table-action edit-action"
                                  title="Edit application"
                                  aria-label="Edit application"
                                  onClick={() => handleEditClick(job)}
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                  type="button"
                                  className="table-action delete-action"
                                  title="Delete application"
                                  aria-label="Delete application"
                                  disabled={deletingId === job.id}
                                  onClick={() => handleDeleteClick(job.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))
                )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
            <span>
              Showing {filteredJobs.length} of {jobs.length} applications
            </span>
            </div>
          </section>

          {/* Footer */}
          <footer className="dashboard-footer">
            <span>JobTrack — Your Career, Organized.</span>
            <span>Keep learning. Keep applying.</span>
          </footer>
        </main>
      </div>
  );
}

export default App;

