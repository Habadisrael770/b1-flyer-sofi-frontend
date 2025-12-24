import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    barcode: '',
    category: '',
    imageUrl: ''
  });

  const { user, logout } = useAuth();

  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }), []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get('/api/products', {
        headers: getAuthHeaders()
      });
      // Handle both { data: [...] } and direct array responses
      const productsData = response.data.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Fetch products error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, logout]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id || editingProduct._id}`, formData, {
          headers: getAuthHeaders()
        });
      } else {
        await axios.post('/api/products', formData, {
          headers: getAuthHeaders()
        });
      }
      
      fetchProducts();
      resetForm();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המוצר?')) return;

    try {
      await axios.delete(`/api/products/${id}`, {
        headers: getAuthHeaders()
      });
      fetchProducts();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        return;
      }
      setError('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      barcode: product.barcode || '',
      category: product.category || '',
      imageUrl: product.imageUrl || product.image || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      barcode: '',
      category: '',
      imageUrl: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>טוען...</div>;

  return (
    <div className="products-container" style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      <div className="products-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h1>מוצרים</h1>
        <div className="user-info">
          <span style={{marginLeft: '10px'}}>שלום, {user?.name || user?.firstName || 'משתמש'}</span>
          <button onClick={logout} style={{padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>התנתקות</button>
        </div>
      </div>

      {error && <div style={{background: '#fee', color: '#c33', padding: '10px', borderRadius: '5px', marginBottom: '20px'}}>{error}</div>}

      <div className="products-actions" style={{marginBottom: '20px'}}>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
        >
          {showForm ? 'בטל' : 'הוסף מוצר'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>שם המוצר</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>מחיר</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
              />
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>ברקוד</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
              />
            </div>
            <div>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>קטגוריה</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
              />
            </div>
          </div>
          <div style={{marginTop: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>תיאור</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
            />
          </div>
          <div style={{marginTop: '15px'}}>
            <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>כתובת תמונה</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              style={{width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px'}}
            />
          </div>
          <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
            <button type="submit" style={{padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
              {editingProduct ? 'עדכן' : 'הוסף'}
            </button>
            <button type="button" onClick={resetForm} style={{padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
              בטל
            </button>
          </div>
        </form>
      )}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px'}}>
        {products.map(product => (
          <div key={product.id || product._id} style={{background: 'white', borderRadius: '10px', padding: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
            {(product.imageUrl || product.image) && (
              <img src={product.imageUrl || product.image} alt={product.name} style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px'}} />
            )}
            <h3 style={{margin: '10px 0'}}>{product.name}</h3>
            <p style={{color: '#28a745', fontWeight: 'bold', fontSize: '1.2em'}}>₪{product.price}</p>
            {product.description && <p style={{color: '#666', fontSize: '0.9em'}}>{product.description}</p>}
            {product.barcode && <p style={{color: '#999', fontSize: '0.8em'}}>ברקוד: {product.barcode}</p>}
            {product.category && <p style={{color: '#999', fontSize: '0.8em'}}>קטגוריה: {product.category}</p>}
            <div style={{marginTop: '10px', display: 'flex', gap: '10px'}}>
              <button onClick={() => handleEdit(product)} style={{flex: 1, padding: '8px', background: '#ffc107', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>עריכה</button>
              <button onClick={() => handleDelete(product.id || product._id)} style={{flex: 1, padding: '8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>מחיקה</button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
          <p>אין מוצרים עדיין. הוסף את המוצר הראשון שלך!</p>
        </div>
      )}
    </div>
  );
};

export default Products;
