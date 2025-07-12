import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BuilderDashboard from './pages/BuilderDashboard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/builder" element={<BuilderDashboard />} />
      <Route path="/" element={<h1>Welcome to Aeonforge OS</h1>} />
    </Routes>
  );
}

export default App;