import { useState, useEffect } from 'react';
import axios from '../utils/api';
import {
  Plus, Pencil, Trash2, Package, Tag, ToggleLeft, ToggleRight,
  Weight, ShoppingBag, Search, X, ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import translations from '../utils/translations';
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
  const { lang } = useLanguage();
  const t = translations[lang];

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: { en: '', bn: '' }, 
    description: { en: '', bn: '' }, 
    price: '', priceType: 'per_pcs',
    category: '', inStock: true,
  });
  const [productImage, setProductImage] = useState(null);
  const [productSaving, setProductSaving] = useState(false);

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ 
    name: { en: '', bn: '' }, 
    description: { en: '', bn: '' }, 
    icon: '🛒', color: '#a8e063' 
  });
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
    setProductForm({ 
      name: { en: '', bn: '' }, 
      description: { en: '', bn: '' }, 
      price: '', priceType: 'per_pcs', category: '', inStock: true 
    });
    setProductImage(null);
    setShowProductModal(true);
  };

  const openEditProduct = (p) => {
    setEditProduct(p);
    setProductForm({
      name: { en: p.name.en || '', bn: p.name.bn || '' },
      description: { en: p.description?.en || '', bn: p.description?.bn || '' },
      price: p.price,
      priceType: p.priceType,
      category: p.category?._id || '',
      inStock: p.inStock,
    });
    setProductImage(null);
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    if ((!productForm.name.en && !productForm.name.bn) || !productForm.price || !productForm.priceType) {
      toast.error(t.name_price_required);
      return;
    }
    setProductSaving(true);
    try {
      const fd = new FormData();
      fd.append('name[en]', productForm.name.en);
      fd.append('name[bn]', productForm.name.bn);
      fd.append('description[en]', productForm.description.en);
      fd.append('description[bn]', productForm.description.bn);
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
        toast.success(t.product_updated);
      } else {
        await axios.post('/api/products', fd);
        toast.success(t.product_added);
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
      toast.success(t.product_deleted);
      setDeleteConfirm(null);
      loadAll();
    } catch {
      toast.error(t.product_save_fail);
    }
  };

  // ── Category handlers ─────────────────────────────────────────
  const openAddCat = () => {
    setEditCat(null);
    setCatForm({ 
      name: { en: '', bn: '' }, 
      description: { en: '', bn: '' }, 
      icon: '🛒', color: '#a8e063' 
    });
    setShowCatModal(true);
  };

  const openEditCat = (c) => {
    setEditCat(c);
    setCatForm({ 
      name: { en: c.name.en || '', bn: c.name.bn || '' }, 
      description: { en: c.description?.en || '', bn: c.description?.bn || '' }, 
      icon: c.icon, 
      color: c.color 
    });
    setShowCatModal(true);
  };

  const saveCat = async () => {
    if (!catForm.name.en && !catForm.name.bn) { toast.error(t.cat_name_required); return; }
    setCatSaving(true);
    try {
      if (editCat) {
        await axios.put(`/api/categories/${editCat._id}`, catForm);
        toast.success(t.category_updated);
      } else {
        await axios.post('/api/categories', catForm);
        toast.success(t.category_created);
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
      toast.success(t.category_deleted);
      setDeleteConfirm(null);
      loadAll();
    } catch {
      toast.error(t.category_save_fail);
    }
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
  const normalize = (str) => str.toLowerCase().replace(/\s+/g, '');

  const nameEn = normalize(p.name.en || '');
  const nameBn = normalize(p.name.bn || '');
  const query = normalize(search);

  return nameEn.includes(query) || nameBn.includes(query);
});

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
            <h1 className="admin-title">{t.dashboard}</h1>
            <p className="admin-sub">{t.manage_store}</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={tab === 'products' ? openAddProduct : openAddCat}
          >
            <Plus size={16} />
            {tab === 'products' ? t.add_product : t.new_category}
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="stat-card">
            <Package size={20} className="stat-icon" />
            <div>
              <div className="stat-num">{stats.total}</div>
              <div className="stat-label">{t.products}</div>
            </div>
          </div>
          <div className="stat-card">
            <ToggleRight size={20} className="stat-icon accent" />
            <div>
              <div className="stat-num">{stats.inStock}</div>
              <div className="stat-label">{t.in_stock}</div>
            </div>
          </div>
          <div className="stat-card">
            <Tag size={20} className="stat-icon amber" />
            <div>
              <div className="stat-num">{stats.cats}</div>
              <div className="stat-label">{t.categories}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${tab === 'products' ? 'active' : ''}`}
            onClick={() => setTab('products')}
          >
            <Package size={16} /> {t.products}
          </button>
          <button
            className={`admin-tab ${tab === 'categories' ? 'active' : ''}`}
            onClick={() => setTab('categories')}
          >
            <Tag size={16} /> {t.categories}
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
                  placeholder={t.search_admin}
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
                <h3>{t.no_products_yet}</h3>
                <p>{t.click_add_prod}</p>
              </div>
            ) : (
              <div className="admin-list">
                {filteredProducts.map(p => {
                  const imgSrc = p.imageUrl || null;
                  return (
                    <div key={p._id} className="admin-row">
                      <div className="admin-row-img">
                        {imgSrc ? <img src={imgSrc} alt={p.name[lang] || p.name.en} /> : <span>🛒</span>}
                      </div>
                      <div className="admin-row-info">
                        <div className="admin-row-name">{p.name[lang] || p.name.en}</div>
                        <div className="admin-row-meta">
                          {p.category && (
                            <span className="meta-chip" style={{ color: p.category.color }}>
                              {p.category.icon} {p.category.name[lang] || p.category.name.en}
                            </span>
                          )}
                           <span className={`badge ${p.inStock ? 'badge-accent' : 'badge-red'}`}>
                             {p.inStock ? t.in_stock : t.out_of_stock}
                           </span>
                         </div>
                       </div>
                       <div className="admin-row-price">
                         <span className="price-big">₹{p.price}</span>
                         <span className="price-unit-sm">
                           {p.priceType === 'per_kg' ? <><Weight size={10} />{t.p_kg}</> : <><ShoppingBag size={10} />{t.p_pcs}</>}
                         </span>
                       </div>
                      <div className="admin-row-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditProduct(p)}>
                          <Pencil size={14} />
                        </button>
                         <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm({ type: 'product', id: p._id, name: p.name[lang] || p.name.en })}>
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
                <h3>{t.no_cats_yet}</h3>
                <p>{t.create_cats_to_org}</p>
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
                           <button className="btn btn-danger btn-sm btn-icon" onClick={() => setDeleteConfirm({ type: 'category', id: cat._id, name: cat.name[lang] || cat.name.en })}>
                             <Trash2 size={13} />
                           </button>
                        </div>
                      </div>
                        <div className="cat-admin-body">
                          <h3 style={{ color: cat.color }}>{cat.name[lang] || cat.name.en}</h3>
                          {cat.description && <p>{cat.description[lang] || cat.description.en}</p>}
                          <span className="cat-prod-count">{prodCount} {t.products}</span>
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
              <h2 className="modal-title">{editProduct ? t.edit_product : t.add_product}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowProductModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-form">
                 <div className="form-group">
                   <label className="label">{t.product_name} (English) *</label>
                   <input className="input" placeholder="e.g. Marie Gold Biscuits"
                     value={productForm.name.en}
                     onChange={e => setProductForm(f => ({ ...f, name: { ...f.name, en: e.target.value } }))} />
                 </div>
                 <div className="form-group">
                   <label className="label">{t.product_name} (Bengali)</label>
                   <input className="input" placeholder="যেমন: মেরি গোল্ড বিস্কুট"
                     value={productForm.name.bn}
                     onChange={e => setProductForm(f => ({ ...f, name: { ...f.name, bn: e.target.value } }))} />
                 </div>

                 <div className="form-group">
                   <label className="label">{t.description} (English)</label>
                   <textarea className="textarea" placeholder="Short description in English…" rows={2}
                     value={productForm.description.en}
                     onChange={e => setProductForm(f => ({ ...f, description: { ...f.description, en: e.target.value } }))} />
                 </div>
                 <div className="form-group">
                   <label className="label">{t.description} (Bengali)</label>
                   <textarea className="textarea" placeholder="বাংলায় বর্ণনা…" rows={2}
                     value={productForm.description.bn}
                     onChange={e => setProductForm(f => ({ ...f, description: { ...f.description, bn: e.target.value } }))} />
                 </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label">{t.price} (₹) *</label>
                    <input className="input" type="number" min="0" step="0.01" placeholder="0.00"
                      value={productForm.price}
                      onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="label">{t.price_type} *</label>
                    <select className="select"
                       value={productForm.priceType}
                       onChange={e => setProductForm(f => ({ ...f, priceType: e.target.value }))}>
                       <option value="per_pcs">{t.p_pcs}</option>
                       <option value="per_kg">{t.p_kg}</option>
                     </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">{t.category}</label>
                  <select className="select"
                    value={productForm.category}
                    onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}>
                     <option value="">— {t.no_category} —</option>
                     {categories.map(c => (
                       <option key={c._id} value={c._id}>{c.icon} {c.name[lang] || c.name.en}</option>
                     ))}
                   </select>
                </div>

                <div className="form-group">
                  <label className="label">{t.in_stock}</label>
                  <label className="switch">
                    <input type="checkbox" checked={productForm.inStock}
                      onChange={e => setProductForm(f => ({ ...f, inStock: e.target.checked }))} />
                    <span className="switch-track" />
                    <span className="switch-thumb" />
                  </label>
                </div>

                <div className="form-group">
                  <label className="label">{lang === 'bn' ? 'পণ্যের ছবি' : 'Product Image'}</label>
                  <ImagePicker
                    onChange={setProductImage}
                    currentImageUrl={editProduct?.imageUrl}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowProductModal(false)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={saveProduct} disabled={productSaving}>
                {productSaving ? t.saving : editProduct ? t.edit_product : t.add_product}
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
              <h2 className="modal-title">{editCat ? t.edit_category : t.new_category}</h2>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowCatModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="modal-form">
                 <div className="form-group">
                   <label className="label">{t.category_name} (English) *</label>
                   <input className="input" placeholder="e.g. Biscuits"
                     value={catForm.name.en}
                     onChange={e => setCatForm(f => ({ ...f, name: { ...f.name, en: e.target.value } }))} />
                 </div>
                 <div className="form-group">
                   <label className="label">{t.category_name} (Bengali)</label>
                   <input className="input" placeholder="যেমন: বিস্কুট"
                     value={catForm.name.bn}
                     onChange={e => setCatForm(f => ({ ...f, name: { ...f.name, bn: e.target.value } }))} />
                 </div>

                 <div className="form-group">
                   <label className="label">{t.description} (English)</label>
                   <input className="input" placeholder="Optional English description"
                     value={catForm.description.en}
                     onChange={e => setCatForm(f => ({ ...f, description: { ...f.description, en: e.target.value } }))} />
                 </div>
                 <div className="form-group">
                   <label className="label">{t.description} (Bengali)</label>
                   <input className="input" placeholder="বাংলায় বর্ণনা (ঐচ্ছিক)"
                     value={catForm.description.bn}
                     onChange={e => setCatForm(f => ({ ...f, description: { ...f.description, bn: e.target.value } }))} />
                 </div>

                <div className="form-group">
                  <label className="label">{t.icon}</label>
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
                  <label className="label">{t.color}</label>
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
                   <span style={{ color: catForm.color, fontWeight: 700 }}>{catForm.name[lang] || catForm.name.en || t.preview}</span>
                 </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowCatModal(false)}>{t.cancel}</button>
              <button className="btn btn-primary" onClick={saveCat} disabled={catSaving}>
                {catSaving ? t.saving : editCat ? t.update : t.save}
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
