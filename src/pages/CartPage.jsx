import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Weight, Package, ArrowLeft, Printer, CheckCircle, Receipt } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './CartPage.css';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, totalItems } = useCart();
  const toast = useToast();
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
    toast.success('Order placed successfully!');
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
                <p><strong>Bill ID:</strong> #{billDetails.id}</p>
                <p><strong>Date:</strong> {billDetails.date}</p>
              </div>
            </div>

            <div className="bill-body">
              <h3>Order Receipt</h3>
              <div className="bill-table">
                <div className="bt-header">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Price</span>
                </div>
                {billDetails.items.map((item, idx) => (
                  <div key={idx} className="bt-row">
                    <span className="bt-name">{item.name}</span>
                    <span className="bt-qty">{item.quantity}{item.priceType === 'per_kg' ? 'kg' : ''}</span>
                    <span className="bt-sub">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="bill-total-row">
                <span>Grand Total</span>
                <span className="total-val">₹{billDetails.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bill-footer">
              <p>Thank you for shopping with FreshMart!</p>
              <div className="bill-actions no-print">
                <button className="btn btn-primary" onClick={handlePrint}>
                  <Printer size={18} /> Print Bill
                </button>
                <Link to="/" className="btn btn-ghost">
                  Back to Shop
                </Link>
              </div>
            </div>
          </div>
          <div className="success-message no-print">
            <CheckCircle size={48} color="var(--accent)" />
            <h2>Order Complete!</h2>
            <p>Your items will be delivered soon.</p>
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
            <h3>Your cart is empty</h3>
            <p>Add some products from the shop to get started</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
              <ShoppingBag size={16} /> Start Shopping
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
            <ArrowLeft size={16} /> Back to Shop
          </Link>
          <div className="cart-title-row">
            <h1>Your Cart</h1>
            <span className="badge badge-accent">{totalItems} items</span>
          </div>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {items.map(item => {
              const imgSrc = item.imageUrl || null;
              const unitIcon = item.priceType === 'per_kg' ? <Weight size={11} /> : <Package size={11} />;
              const unitLabel = item.priceType === 'per_kg' ? '/kg' : '/pcs';
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
                    <h3>{item.name}</h3>
                    {item.category && (
                      <span className="cart-item-cat">
                        {item.category.icon} {item.category.name}
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
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => {
                        const step = item.priceType === 'per_kg' ? 0.1 : 1;
                        updateQuantity(item._id, parseFloat((item.quantity - step).toFixed(1)));
                      }}>
                        <Minus size={13} />
                      </button>
                      <input
                        type="number"
                        min="0.1"
                        step={item.priceType === 'per_kg' ? '0.1' : '1'}
                        value={item.quantity}
                        onChange={e => {
                          const val = e.target.value;
                          const num = parseFloat(val);
                          if (!isNaN(num) && num > 0) updateQuantity(item._id, num);
                        }}
                        className="qty-input"
                      />
                      <button className="qty-btn qty-btn-add" onClick={() => {
                        const step = item.priceType === 'per_kg' ? 0.1 : 1;
                        updateQuantity(item._id, parseFloat((item.quantity + step).toFixed(1)));
                      }}>
                        <Plus size={13} />
                      </button>
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
              <Trash2 size={14} /> Clear Cart
            </button>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="summary-card card">
              <div className="summary-header">
                <h2>Order Summary</h2>
              </div>
              <div className="summary-body">
                {items.map(item => (
                  <div key={item._id} className="summary-row">
                    <span className="summary-name">
                      {item.name}
                      <span className="summary-qty"> ×{item.priceType === 'per_kg' ? item.quantity + 'kg' : item.quantity}</span>
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="divider" />
                <div className="summary-total">
                  <span>Total</span>
                  <span className="total-amount">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="summary-footer">
                <button className="btn btn-primary w-full btn-lg" onClick={handlePlaceOrder}>
                  <ShoppingBag size={18} /> Place Order
                </button>
                <p className="summary-note">* Prices calculated based on selected quantity</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
