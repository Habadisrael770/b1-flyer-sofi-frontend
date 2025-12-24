import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Flyers from './pages/Flyers';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />
            <Route path="/flyers" element={
              <ProtectedRoute>
                <Flyers />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/products" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;