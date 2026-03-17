import { useState, useEffect } from 'react';
import axios from '../utils/api';
import { Search, SlidersHorizontal, X, ShoppingCart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './ShopPage.css';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filterInStock, setFilterInStock] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/products'),
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data);
      setProducts(prodRes.data);
    }).finally(() => setLoading(false));
  }, []);

  // Filtered products
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || p.category?._id === activeCategory;
    const matchStock = !filterInStock || p.inStock;
    return matchSearch && matchCat && matchStock;
  });

  // Group products by category for "all" view
  const grouped = activeCategory === 'all' && !search
    ? categories.reduce((acc, cat) => {
        const prods = filtered.filter(p => p.category?._id === cat._id);
        if (prods.length > 0) acc.push({ category: cat, products: prods });
        return acc;
      }, [])
    : null;

  const uncategorized = filtered.filter(p => !p.category);

  return (
    <div className="shop-page page">
      <div className="container">
        {/* Hero */}
        <div className="shop-hero">
          <div className="shop-hero-text">
            <div className="hero-eyebrow">🌿 Fresh & Local</div>
            <h1 className="hero-title">Shop Fresh<br /><span>Every Day</span></h1>
            <p className="hero-sub">Quality products at your fingertips</p>
          </div>
          <div className="hero-art">
            <div className="art-circle c1" />
            <div className="art-circle c2" />
            <div className="art-icon">
              <ShoppingCart size={36} strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="search-bar-row">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
            )}
          </div>
          <button
            className={`btn btn-sm ${filterInStock ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterInStock(v => !v)}
          >
            <SlidersHorizontal size={14} /> In Stock
          </button>
        </div>

        {/* Category Pills */}
        <div className="cat-scroll">
          <button
            className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            🏪 All
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              className={`cat-pill ${activeCategory === cat._id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat._id)}
              style={activeCategory === cat._id ? { '--pill-color': cat.color } : {}}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Products */}
        {loading ? (
          <div className="products-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try a different search or category</p>
          </div>
        ) : grouped ? (
          // Grouped view by category
          <div className="grouped-view">
            {grouped.map(({ category, products: prods }) => (
              <section key={category._id} className="cat-section">
                <div className="cat-section-header">
                  <div
                    className="cat-section-badge"
                    style={{ background: category.color + '18', borderColor: category.color + '33' }}
                  >
                    <span>{category.icon}</span>
                    <h2 style={{ color: category.color }}>{category.name}</h2>
                  </div>
                  <span className="cat-count">{prods.length} items</span>
                </div>
                <div className="products-grid">
                  {prods.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </section>
            ))}
            {uncategorized.length > 0 && (
              <section className="cat-section">
                <div className="cat-section-header">
                  <div className="cat-section-badge">
                    <span>📦</span>
                    <h2>Other Products</h2>
                  </div>
                </div>
                <div className="products-grid">
                  {uncategorized.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="products-grid fade-in">
            {filtered.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
