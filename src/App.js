import React from "react";
import JobTracker from "./components/JobTracker";
import "./styles.css";

function App() {
  return (
    <div className="app">
      <h1 className="title">💼 Smart Job Tracker</h1>
      <JobTracker />
    </div>
  );
}

export default App;