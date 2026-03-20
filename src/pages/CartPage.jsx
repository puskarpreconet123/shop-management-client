import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Weight, Package, ArrowLeft, Printer, CheckCircle, Receipt } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import './CartPage.css';

import QtyInput from '../components/QtyInput';

export default function CartPage() {
  const { items, updateQuantity, updateItemUnit, removeFromCart, clearCart, totalAmount, totalItems } = useCart();
  const toast = useToast();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [orderComplete, setOrderComplete] = useState(false);
  const [billDetails, setBillDetails] = useState(null);

  const handlePlaceOrder = () => {
    const bill = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toLocaleString(),
      items: [...items],
      total: totalAmount,
    };
    setBillDetails(bill);
    setOrderComplete(true);
    clearCart();
    toast.success(t.order_success);
  };

  const handlePrint = () => {
    window.print();
  };

  if (orderComplete && billDetails) {
    return (
      <div className="bill-view page fade-in">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="bill-card card">
            <div className="bill-header">
              <div className="bill-logo">
                <Receipt size={32} className="text-accent" />
                <h1>{import.meta.env.VITE_SHOP_NAME || 'FreshMart'}</h1>
              </div>
              <div className="bill-meta">
                <p><strong>{t.bill_id}:</strong> #{billDetails.id}</p>
                <p><strong>{t.date}:</strong> {billDetails.date}</p>
              </div>
            </div>

            <div className="bill-body">
              <h3>{t.order_summary}</h3>
              <div className="bill-table">
                <div className="bt-header">
                  <span>{t.items}</span>
                  <span>{t.qty}</span>
                  <span>{t.result}</span>
                </div>
                {billDetails.items.map((item, idx) => (
                  <div key={idx} className="bt-row">
                    <span className="bt-name">{item.name[lang] || item.name.en}</span>
                    <span className="bt-qty">{item.quantity} {item.priceType === 'per_kg' ? t.kg : t.pcs}</span>
                    <span className="bt-sub">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="bill-total-row">
                <span>{t.grand_total}</span>
                <span className="total-val">₹{billDetails.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bill-footer">
              <p>{t.thank_you}</p>
              <div className="bill-actions no-print">
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={18} /> {t.print_bill}
                </button>
                <Link to="/" className="btn btn-ghost">
                  {t.back_to_shop}
                </Link>
              </div>
            </div>
          </div>
          <div className="success-message no-print">
            <CheckCircle size={48} color="var(--accent)" />
            <h2>{t.order_complete}</h2>
            <p>{t.delivery_soon}</p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: 80 }}>
            <div className="empty-state-icon">🛒</div>
            <h3>{t.empty_cart}</h3>
            <p>{t.try_different}</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
              <ShoppingBag size={16} /> {t.start_shopping}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page">
      <div className="container">
        <div className="cart-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> {t.back_to_shop}
          </Link>
          <div className="cart-title-row">
            <h1>{t.your_cart}</h1>
            <span className="badge badge-accent">{totalItems} {t.items}</span>
          </div>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {items.map(item => {
              const imgSrc = item.imageUrl || null;
              const unitIcon = item.priceType === 'per_kg' ? <Weight size={11} /> : <Package size={11} />;
              const unitLabel = item.priceType === 'per_kg' ? t.p_kg : t.p_pcs;
              const itemTotal = item.price * item.quantity;

              return (
                <div key={item._id} className="cart-item">
                  {/* Image */}
                  <div className="cart-item-img">
                    {imgSrc ? (
                      <img src={imgSrc} alt={item.name} />
                    ) : (
                      <span>🛒</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="cart-item-info">
                    <h3>{item.name[lang] || item.name.en}</h3>
                    {item.category && (
                      <span className="cart-item-cat">
                        {item.category.icon} {item.category.name[lang] || item.category.name.en}
                      </span>
                    )}
                    <div className="cart-item-price-row">
                      <span className="cart-unit-price">
                        ₹{item.price.toFixed(2)} {unitIcon}{unitLabel}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="cart-item-controls">
                    <div className="qty-control-wrapper">
                      {item.priceType === 'per_kg' && (
                        <div className="cart-item-unit-switch">
                          <button 
                            className={`unit-toggle ${item.unit === 'gm' ? '' : 'active'}`}
                            onClick={() => updateItemUnit(item._id, 'kg')}
                          >
                            {t.kg}
                          </button>
                          <button 
                            className={`unit-toggle ${item.unit === 'gm' ? 'active' : ''}`}
                            onClick={() => updateItemUnit(item._id, 'gm')}
                          >
                            {t.gm}
                          </button>
                        </div>
                      )}
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => {
                          const step = item.priceType === 'per_kg' ? 0.1 : 1;
                          updateQuantity(item._id, parseFloat((item.quantity - step).toFixed(3)));
                        }}>
                          <Minus size={13} />
                        </button>
                        <QtyInput
                          value={item.quantity}
                          onChange={val => updateQuantity(item._id, val)}
                          priceType={item.priceType}
                          unit={item.unit || 'kg'}
                        />
                        <button className="qty-btn qty-btn-add" onClick={() => {
                          const step = item.priceType === 'per_kg' ? 0.1 : 1;
                          updateQuantity(item._id, parseFloat((item.quantity + step).toFixed(3)));
                        }}>
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>

                    <span className="cart-item-total">₹{itemTotal.toFixed(2)}</span>

                    <button
                      className="btn btn-icon btn-danger"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 8 }} onClick={clearCart}>
              <Trash2 size={14} /> {t.clear_cart}
            </button>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="summary-card card">
              <div className="summary-header">
                <h2>{t.order_summary}</h2>
              </div>
              <div className="summary-body">
                {items.map(item => (
                  <div key={item._id} className="summary-row">
                    <span className="summary-name">
                      {item.name[lang] || item.name.en}
                      <span className="summary-qty"> ×{item.priceType === 'per_kg' ? item.quantity + t.kg : item.quantity}</span>
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="divider" />
                <div className="summary-total">
                  <span>{t.grand_total}</span>
                  <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="summary-footer">
                <button className="btn btn-primary w-full btn-lg" onClick={handlePlaceOrder}>
                  <ShoppingBag size={18} /> {t.place_order}
                </button>
                <p className="summary-note">{t.price_calc_note}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
