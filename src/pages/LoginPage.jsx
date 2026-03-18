import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Leaf, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import './LoginPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { lang } = useLanguage();
  const t = translations[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success(t.welcome_admin);
      navigate('/admin');
    } catch (err) {
      toast.error(t.login_fail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-blob b1" />
        <div className="login-blob b2" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon-lg"><Leaf size={24} /></div>
          <span>{import.meta.env.VITE_SHOP_NAME || 'FreshMart'}</span>
        </div>

        <div className="login-header">
          <div className="login-shield-wrap">
            <Shield size={20} />
          </div>
          <h1>{t.admin_access}</h1>
          <p>{t.sign_in_to_manage}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="label">{t.username}</label>
            <input
              className="input"
              type="text"
              placeholder={t.enter_username}
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="label">{t.password}</label>
            <div className="pass-wrap">
              <input
                className="input"
                type={showPass ? 'text' : 'password'}
                placeholder={t.enter_password}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(v => !v)}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg w-full" type="submit" disabled={loading}>
            {loading ? (
              <span className="spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid #0d1a0d', borderTop: '2px solid transparent', borderRadius: '50%' }} />
            ) : (
              <><LogIn size={18} /> {t.sign_in}</>
            )}
          </button>
        </form>

        <p className="login-hint">Default: admin / admin123</p>
      </div>
    </div>
  );
}
