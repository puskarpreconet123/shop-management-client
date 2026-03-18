import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, LayoutDashboard, Shield, Calculator as CalcIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import './BottomNav.css';

export default function BottomNav({ onOpenCalc }) {
  const { isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { lang } = useLanguage();
  const t = translations[lang];
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`bnav-item ${isActive('/') ? 'active' : ''}`}>
        <Home size={20} />
        <span>{t.shop}</span>
      </Link>

      <button className="bnav-item bnav-btn" onClick={onOpenCalc}>
        <CalcIcon size={20} />
        <span>{t.calc_link}</span>
      </button>

      <Link to="/cart" className={`bnav-item ${isActive('/cart') ? 'active' : ''}`}>
        <div className="bnav-cart-icon">
          <ShoppingCart size={20} />
          {totalItems > 0 && <span className="bnav-badge">{totalItems}</span>}
        </div>
        <span>{t.cart}</span>
      </Link>

      {isAdmin ? (
        <Link to="/admin" className={`bnav-item ${isActive('/admin') ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>{t.admin}</span>
        </Link>
      ) : (
        <Link to="/admin/login" className={`bnav-item ${isActive('/admin/login') ? 'active' : ''}`}>
          <Shield size={20} />
          <span>{t.login_link}</span>
        </Link>
      )}
    </nav>
  );
}
