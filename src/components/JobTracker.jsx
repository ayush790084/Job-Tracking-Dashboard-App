// ================= components/JobTracker.jsx =================
import React, { useState, useEffect } from "react";

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [filter, setFilter] = useState("");
  const [dark, setDark] = useState(false);
  const [reminderTime, setReminderTime] = useState("");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("jobs"));
    const theme = JSON.parse(localStorage.getItem("theme"));
    if (data) setJobs(data);
    if (theme) setDark(theme);
  }, []);

  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(dark));
    document.body.className = dark ? "dark" : "";
  }, [dark]);

  const addJob = () => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    if (!company || !role) return;
    setJobs([
      ...jobs,
      { id: Date.now(), company, role, status, reminder: reminderTime, notified: false }
    ]);
    setCompany("");
    setRole("");
    setReminderTime("");
  };

  const updateStatus = (id, newStatus) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j));
  };

  // Reminder checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      jobs.forEach(job => {
        if (job.reminder && !job.notified) {
          const reminderDate = new Date(job.reminder);
          if (now >= reminderDate) {
            new Notification("Interview Reminder", {
              body: `${job.company} - ${job.role}`
            });
            job.notified = true;
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [jobs]);

  const deleteJob = (id) => {
    setJobs(jobs.filter(j => j.id !== id));
  };

  const filteredJobs = jobs.filter(j =>
    j.company.toLowerCase().includes(filter.toLowerCase()) ||
    j.role.toLowerCase().includes(filter.toLowerCase())
  );

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === "Applied").length,
    interview: jobs.filter(j => j.status === "Interview").length,
    rejected: jobs.filter(j => j.status === "Rejected").length
  };

  return (
    <div className="container">

      <div className="top-bar">
        <button className="toggle" onClick={() => setDark(!dark)}>
          {dark ? "☀" : "🌙"}
        </button>
      </div>

      <div className="stats">
        <div className="card">Total<br/><b>{stats.total}</b></div>
        <div className="card">Applied<br/><b>{stats.applied}</b></div>
        <div className="card">Interview<br/><b>{stats.interview}</b></div>
        <div className="card">Rejected<br/><b>{stats.rejected}</b></div>
      </div>

      <div className="form">
        <input placeholder="Company" value={company} onChange={(e)=>setCompany(e.target.value)} />
        <input placeholder="Role" value={role} onChange={(e)=>setRole(e.target.value)} />
        <select value={status} onChange={(e)=>setStatus(e.target.value)}>
          <option>Applied</option>
          <option>Interview</option>
          <option>Rejected</option>
        </select>
        <input
          type="datetime-local"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
        />
        <button onClick={addJob}>Add Job</button>
      </div>

      <input
        className="filter"
        placeholder="Search company or role..."
        value={filter}
        onChange={(e)=>setFilter(e.target.value)}
      />

      <div className="jobs">
        {filteredJobs.map(job => (
          <div className="job" key={job.id}>
            <h3>{job.company}</h3>
            <p>{job.role}</p>
            <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>

            <div className="actions">
              <button onClick={()=>updateStatus(job.id,"Applied")}>A</button>
              <button onClick={()=>updateStatus(job.id,"Interview")}>I</button>
              <button onClick={()=>updateStatus(job.id,"Rejected")}>R</button>
              <button onClick={()=>deleteJob(job.id)}>❌</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

