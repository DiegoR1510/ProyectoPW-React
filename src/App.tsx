import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { NewsProvider } from './context/NewsContext';
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ThankYou from './pages/ThankYou';
import News from './pages/News';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import TopSellers from './pages/TopSellers';
import TopRated from './pages/TopRated';
import ConfirmEmail from './pages/ConfirmEmail';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <NewsProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/:id" element={<GameDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/thankyou" element={<ThankYou />} />
              <Route path="/news" element={<News />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/top-sellers" element={<TopSellers />} />
              <Route path="/top-rated" element={<TopRated />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Router>
        </NewsProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
