import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Printers from './pages/Printers';
import PrinterDetail from './pages/PrinterDetail';
import AddPrinter from './pages/AddPrinter';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/printers" element={<Printers />} />
            <Route path="/printers/:id" element={<PrinterDetail />} />
            <Route path="/add-printer" element={<AddPrinter />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;