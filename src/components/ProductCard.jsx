import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Weight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, updateQuantity, getItemQuantity, removeFromCart } = useCart();
  const toast = useToast();
  const { lang } = useLanguage();
  const t = translations[lang];
  const qty = getItemQuantity(product._id);
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    setAdding(true);
    addToCart(product, 1);
    toast.success(`${product.name[lang] || product.name.en} ${t.added_to_cart_toast}`);
    setTimeout(() => setAdding(false), 400);
  };

  const handleIncrease = () => {
    const step = product.priceType === 'per_kg' ? 0.1 : 1;
    updateQuantity(product._id, parseFloat((qty + step).toFixed(1)));
  };
  const handleDecrease = () => {
    const step = product.priceType === 'per_kg' ? 0.1 : 1;
    if (qty <= step) removeFromCart(product._id);
    else updateQuantity(product._id, parseFloat((qty - step).toFixed(1)));
  };

  // imageUrl is now a full Cloudinary URL — use it directly
  const imgSrc = product.imageUrl || null;

  const unitLabel = product.priceType === 'per_kg' ? `/${t.kg}` : `/${t.pcs}`;
  const unitIcon = product.priceType === 'per_kg'
    ? <Weight size={11} />
    : <Package size={11} />;

  return (
    <div className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}>
      {/* Image */}
      <div className="product-img-wrap">
        {imgSrc ? (
          <img src={imgSrc} alt={product.name} className="product-img" loading="lazy" />
        ) : (
          <div className="product-img-placeholder"><span>🛒</span></div>
        )}
        {!product.inStock && (
          <div className="out-of-stock-overlay"><span>{t.out_of_stock}</span></div>
        )}
        {product.category && (
          <div
            className="product-cat-chip"
            style={{
              background: product.category.color + '22',
              color: product.category.color,
              borderColor: product.category.color + '44',
            }}
          >
            {product.category.icon} {product.category.name[lang] || product.category.name.en}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name[lang] || product.name.en}</h3>
        {product.description && (
          <p className="product-desc">{product.description[lang] || product.description.en}</p>
        )}

        <div className="product-price">
          <span className="price-amount">₹{product.price.toFixed(2)}</span>
          <span className="price-unit">{unitIcon}{unitLabel}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="product-actions">
        {product.inStock ? (
          qty === 0 ? (
            <button
              className={`btn btn-primary add-btn ${adding ? 'adding' : ''}`}
              onClick={handleAdd}
            >
              <ShoppingCart size={16} /> {t.add_to_cart}
            </button>
          ) : (
            <div className="qty-control">
              <button className="qty-btn" onClick={handleDecrease}><Minus size={14} /></button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn qty-btn-add" onClick={handleIncrease}><Plus size={14} /></button>
            </div>
          )
        ) : (
          <button className="btn btn-ghost w-full" disabled>{t.out_of_stock}</button>
        )}
      </div>
    </div>
  );
}
