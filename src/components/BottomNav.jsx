import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, LayoutDashboard, Shield, Calculator as CalcIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './BottomNav.css';

export default function BottomNav({ onOpenCalc }) {
  const { isAdmin } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bnav-item ${isActive('/') ? 'active' : ''}`}>
        <Home size={20} />
        <span>Shop</span>
      </Link>

      <button className="bnav-item bnav-btn" onClick={onOpenCalc}>
        <CalcIcon size={20} />
        <span>Calc</span>
      </button>

      <Link to="/cart" className={`bnav-item ${isActive('/cart') ? 'active' : ''}`}>
        <div className="bnav-cart-icon">
          <ShoppingCart size={20} />
          {totalItems > 0 && <span className="bnav-badge">{totalItems}</span>}
        </div>
        <span>Cart</span>
      </Link>

      {isAdmin ? (
        <Link to="/admin" className={`bnav-item ${isActive('/admin') ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Admin</span>
        </Link>
      ) : (
        <Link to="/admin/login" className={`bnav-item ${isActive('/admin/login') ? 'active' : ''}`}>
          <Shield size={20} />
          <span>Login</span>
        </Link>
      )}
    </nav>
  );
}
