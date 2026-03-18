import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Shield, LogOut, Leaf, Calculator as CalcIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import './Navbar.css';

export default function Navbar({ onOpenCalc }) {
    const { admin, logout, isAdmin } = useAuth();
    const { totalItems } = useCart();
    const { lang, toggleLanguage } = useLanguage();
    const t = translations[lang];
    const location = useLocation();

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
                    <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>{t.shop}</Link>
                    {isAdmin && (
                        <Link to="/admin" className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>{t.admin}</Link>
                    )}
                </div>

                {/* Right side */}
                <div className="navbar-right">
                    {/* Language Toggle */}
                    <button className="lang-toggle" onClick={toggleLanguage} title={lang === 'en' ? 'Switch to Bengali' : 'Switch to English'}>
                        {lang === 'en' ? 'BN' : 'EN'}
                    </button>

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
                            <Shield size={14} /> {t.admin}
                        </Link>
                    )}

                    {/* Cart */}
                    <Link to="/cart" className="cart-btn">
                        <ShoppingCart size={20} />
                        {totalItems > 0 && (
                            <span className="cart-count">{totalItems > 99 ? '99+' : totalItems}</span>
                        )}
                    </Link>

                    {/* Calculator Shortcut - Desktop only */}
                    <button className="btn btn-secondary btn-sm btn-icon calc-shortcut-desktop" onClick={onOpenCalc} title="Open Calculator">
                        <CalcIcon size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
