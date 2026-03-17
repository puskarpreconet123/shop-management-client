import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Shield, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { admin, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><Leaf size={20} /></span>
          <span className="logo-text">{import.meta.env.VITE_SHOP_NAME || 'FreshMart'}</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Shop</Link>
          {isAdmin && (
            <>
              <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>Dashboard</Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {isAdmin ? (
            <div className="admin-pill">
              <Shield size={13} />
              <span>{admin?.username}</span>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={logout} title="Logout">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="btn btn-ghost btn-sm">
              <Shield size={14} /> Admin
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="cart-count">{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
