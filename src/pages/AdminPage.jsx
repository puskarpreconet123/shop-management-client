import { useState, useEffect } from 'react';
import axios from '../utils/api';
import {
  Plus, Pencil, Trash2, Package, Tag, ToggleLeft, ToggleRight,
  Weight, ShoppingBag, Search, X, ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ImagePicker from '../components/ImagePicker';
import './AdminPage.css';


const ICONS = ['🍪', '🍜', '🧃', '🍿', '🥛', '🌶️', '🌾', '🥦', '🥩', '🧴', '🍫', '🥚', '🧀', '🥗', '🍱', '🌽', '🫙', '🛒', '📦', '🍔'];
const COLORS = ['#a8e063', '#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#a8dadc', '#52b788', '#e63946', '#ffc857', '#8d6e63', '#457b9d', '#c77dff'];

export default function AdminPage() {
  const toast = useToast();
  const [tab, setTab] = useState('products'); // 'products' | 'categories'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', priceType: 'per_pcs',
    category: '', inStock: true,
  });
  const [productImage, setProductImage] = useState(null);
  const [productSaving, setProductSaving] = useState(false);

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '🛒', color: '#a8e063' });
  const [catSaving, setCatSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type, id, name }

  // Load data
  const loadAll = async () => {
    setLoading(true);
    const [catRes, prodRes] = await Promise.all([
      axios.get('/api/categories'),
      axios.get('/api/products'),
    ]);
    setCategories(catRes.data);
    setProducts(prodRes.data);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // ── Product handlers ──────────────────────────────────────────
  const openAddProduct = () => {
    setEditProduct(null);
    setProductForm({ name: '', description: '', price: '', priceType: 'per_pcs', category: '', inStock: true });
    setProductImage(null);
    setShowProductModal(true);
  };

  const openEditProduct = (p) => {
    setEditProduct(p);
    setProductForm({
      name: p.name,
      description: p.description || '',
      price: p.price,
      priceType: p.priceType,
      category: p.category?._id || '',
      inStock: p.inStock,
    });
    setProductImage(null);
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.priceType) {
      toast.error('Name, price, and price type are required');
      return;
    }
    setProductSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', productForm.name);
      fd.append('description', productForm.description);
      fd.append('price', productForm.price);
      fd.append('priceType', productForm.priceType);
      fd.append('category', productForm.category);
      fd.append('inStock', productForm.inStock);

      if (productImage?.file) {
        fd.append('image', productImage.file);
      } else if (productImage?.base64) {
        fd.append('imageBase64', productImage.base64);
      } else if (productImage === null && editProduct?.imageUrl) {
        // image unchanged
      }

      if (editProduct) {
        await axios.put(`/api/products/${editProduct._id}`, fd);
        toast.success('Product updated!');
      } else {
        await axios.post('/api/products', fd);
        toast.success('Product added!');
      }

      setShowProductModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setProductSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      loadAll();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  // ── Category handlers ─────────────────────────────────────────
  const openAddCat = () => {
    setEditCat(null);
    setCatForm({ name: '', description: '', icon: '🛒', color: '#a8e063' });
    setShowCatModal(true);
  };

  const openEditCat = (c) => {
    setEditCat(c);
    setCatForm({ name: c.name, description: c.description || '', icon: c.icon, color: c.color });
    setShowCatModal(true);
  };

  const saveCat = async () => {
    if (!catForm.name) { toast.error('Category name is required'); return; }
    setCatSaving(true);
    try {
      if (editCat) {
        await axios.put(`/api/categories/${editCat._id}`, catForm);
        toast.success('Category updated!');
      } else {
        await axios.post('/api/categories', catForm);
        toast.success('Category created!');
      }
      setShowCatModal(false);
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setCatSaving(false);
    }
  };

  const deleteCat = async (id) => {
    try {
      await axios.delete(`/api/categories/${id}`);
      toast.success('Category deleted');
      setDeleteConfirm(null);
      loadAll();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  // Filtered products
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    cats: categories.length,
  };

  return (
    <div className="admin-page page">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Dashboard</h1>
            <p className="admin-sub">Manage your products and categories</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={tab === 'products' ? openAddProduct : openAddCat}
          >
            <Plus size={16} />
            {tab === 'products' ? 'Add Product' : 'New Category'}
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="stat-card">
            <Package size={20} className="stat-icon" />
            <div>
              <div className="stat-num">{stats.total}</div>
              <div className="stat-label">Products</div>
            </div>
          </div>
          <div className="stat-card">
            <ToggleRight size={20} className="stat-icon accent" />
            <div>
              <div className="stat-num">{stats.inStock}</div>
              <div className="stat-label">In Stock</div>
            </div>
          </div>
          <div className="stat-card">
            <Tag size={20} className="stat-icon amber" />
            <div>
              <div className="stat-num">{stats.cats}</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            <Package size={16} /> Products
          </button>
          <button
            className={`admin-tab ${tab === 'categories' ? 'active' : ''}`}
            onClick={() => setTab('categories')}
          >
            <Tag size={16} /> Categories
          </button>
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="fade-in">
            <div className="search-bar-row" style={{ marginBottom: 16 }}>
              <div className="search-wrap" style={{ flex: 1 }}>
                <Search size={16} className="search-icon" />
                <input
                  className="search-input"
                  placeholder="Search products…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
              </div>
            </div>

            {loading ? (
              <div className="admin-list">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius)' }} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h3>No products yet</h3>
                <p>Click "Add Product" to get started</p>
              </div>
            ) : (
              <div className="admin-list">
                {filteredProducts.map(p => {
                  const imgSrc = p.imageUrl || null;
                  return (
                    <div key={p._id} className="admin-row">
                      <div className="admin-row-img">
                        {imgSrc ? <img src={imgSrc} alt={p.name} /> : <span>🛒</span>}
                      </div>
                      <div className="admin-row-info">
                        <div className="admin-row-name">{p.name}</div>
                        <div className="admin-row-meta">
                          {p.category && (
                            <span className="meta-chip" style={{ color: p.category.color }}>
                              {p.category.icon} {p.category.name}
                            </span>
                          )}
                          <span className={`badge ${p.inStock ? 'badge-accent' : 'badge-red'}`}>
                            {p.inStock ? 'In Stock' : 'Out'}
                          </span>
                        </div>
                      </div>
                      <div className="admin-row-price">
                        <span className="price-big">₹{p.price}</span>
                        <span className="price-unit-sm">
                          {p.priceType === 'per_kg' ? <><Weight size={10} />kg</> : <><ShoppingBag size={10} />pcs</>}
                        </span>
                      </div>
                      <div className="admin-row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditProduct(p)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm({ type: 'product', id: p._id, name: p.name })}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
          <div className="fade-in">
            {loading ? (
              <div className="cat-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏷️</div>
                <h3>No categories yet</h3>
                <p>Create categories to organise your products</p>
              </div>
            ) : (
              <div className="cat-grid">
                {categories.map(cat => {
                  const prodCount = products.filter(p => p.category?._id === cat._id).length;
                  return (
                    <div key={cat._id} className="cat-admin-card" style={{ borderColor: cat.color + '40' }}>
                      <div className="cat-admin-top" style={{ background: cat.color + '15' }}>
                        <span className="cat-icon-lg">{cat.icon}</span>
                        <div className="cat-admin-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditCat(cat)}>
                            <Pencil size={13} />
                          </button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm({ type: 'category', id: cat._id, name: cat.name })}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="cat-admin-body">
                        <h3 style={{ color: cat.color }}>{cat.name}</h3>
                        {cat.description && <p>{cat.description}</p>}
                        <span className="cat-prod-count">{prodCount} products</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Product Modal ─── */}
      {showProductModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowProductModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowProductModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-form">
                <div className="form-group">
                  <label className="label">Product Name *</label>
                  <input className="input" placeholder="e.g. Marie Gold Biscuits"
                    value={productForm.name}
                    onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea className="textarea" placeholder="Short description…" rows={2}
                    value={productForm.description}
                    onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Price (₹) *</label>
                    <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                      value={productForm.price}
                      onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="label">Price Type *</label>
                    <select className="select"
                      value={productForm.priceType}
                      onChange={e => setProductForm(f => ({ ...f, priceType: e.target.value }))}>
                      <option value="per_pcs">Per Piece</option>
                      <option value="per_kg">Per Kg</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Category</label>
                  <select className="select"
                    value={productForm.category}
                    onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">— No Category —</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">In Stock</label>
                  <label className="switch">
                    <input type="checkbox" checked={productForm.inStock}
                      onChange={e => setProductForm(f => ({ ...f, inStock: e.target.checked }))} />
                    <span className="switch-track" />
                    <span className="switch-thumb" />
                  </label>
                </div>

                <div className="form-group">
                  <label className="label">Product Image</label>
                  <ImagePicker
                    onChange={setProductImage}
                    currentImageUrl={editProduct?.imageUrl}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowProductModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProduct} disabled={productSaving}>
                {productSaving ? 'Saving…' : editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Category Modal ─── */}
      {showCatModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCatModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 className="modal-title">{editCat ? 'Edit Category' : 'New Category'}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowCatModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-form">
                <div className="form-group">
                  <label className="label">Category Name *</label>
                  <input className="input" placeholder="e.g. Biscuits"
                    value={catForm.name}
                    onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="label">Description</label>
                  <input className="input" placeholder="Optional description"
                    value={catForm.description}
                    onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="label">Icon</label>
                  <div className="icon-picker">
                    {ICONS.map(ic => (
                      <button
                        key={ic}
                        type="button"
                        className={`icon-opt ${catForm.icon === ic ? 'selected' : ''}`}
                        onClick={() => setCatForm(f => ({ ...f, icon: ic }))}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Color</label>
                  <div className="color-picker">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`color-opt ${catForm.color === c ? 'selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => setCatForm(f => ({ ...f, color: c }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="cat-preview" style={{ background: catForm.color + '15', borderColor: catForm.color + '40' }}>
                  <span>{catForm.icon}</span>
                  <span style={{ color: catForm.color, fontWeight: 700 }}>{catForm.name || 'Preview'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCatModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveCat} disabled={catSaving}>
                {catSaving ? 'Saving…' : editCat ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm ─── */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-body" style={{ textAlign: 'center', paddingTop: 32 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🗑️</div>
              <h2 style={{ marginBottom: 8 }}>Delete {deleteConfirm.type}?</h2>
              <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>
                "{deleteConfirm.name}" will be permanently deleted. This cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: 16 }}>
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => deleteConfirm.type === 'product' ? deleteProduct(deleteConfirm.id) : deleteCat(deleteConfirm.id)}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
