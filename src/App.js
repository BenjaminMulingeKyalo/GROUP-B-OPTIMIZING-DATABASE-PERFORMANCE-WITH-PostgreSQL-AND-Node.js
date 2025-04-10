import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ stock_code: '', description: '', unit_price: '' });
  const [editMode, setEditMode] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  // Fetch all products from the server
  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/products');
      if (!res.ok) {
        console.error('Failed to fetch products:', res.statusText);
        return;
      }
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input field changes
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle product creation
  const handleCreate = async () => {
    try {
      const res = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchProducts();
        setForm({ stock_code: '', description: '', unit_price: '' });
      } else {
        console.error('Failed to add product:', res.statusText);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  // Handle product update
  const handleUpdate = async () => {
    try {
      const res = await fetch(`http://localhost:5000/products/${editingCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: form.description, unit_price: form.unit_price }),
      });
      if (res.ok) {
        await fetchProducts();
        setEditMode(false);
        setForm({ stock_code: '', description: '', unit_price: '' });
      } else {
        console.error('Failed to update product:', res.statusText);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  // Handle product deletion
  const handleDelete = async (code) => {
    try {
      const res = await fetch(`http://localhost:5000/products/${code}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchProducts();
      } else {
        console.error('Failed to delete product:', res.statusText);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(({ stock_code, description, unit_price }) =>
    stock_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit_price.toString().includes(searchTerm)
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Online Retail Products</h2>

      {/* Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Form */}
      <div className="mb-3 row">
        <div className="col">
          <input
            type="text"
            name="stock_code"
            className="form-control"
            placeholder="Stock Code"
            value={form.stock_code}
            onChange={handleInputChange}
            disabled={editMode}
          />
        </div>
        <div className="col">
          <input
            type="text"
            name="description"
            className="form-control"
            placeholder="Description"
            value={form.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="col">
          <input
            type="number"
            name="unit_price"
            className="form-control"
            placeholder="Unit Price"
            value={form.unit_price}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-auto">
          {editMode ? (
            <button className="btn btn-warning" onClick={handleUpdate}>
              Update
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleCreate}>
              Add
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <table className="table table-bordered table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>Stock Code</th>
            <th>Description</th>
            <th>Unit Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(({ stock_code, description, unit_price }) => (
            <tr key={stock_code}>
              <td>{stock_code}</td>
              <td>{description}</td>
              <td>{unit_price}</td>
              <td>
                <button className="btn btn-sm btn-info me-2" onClick={() => { setForm({ stock_code, description, unit_price }); setEditingCode(stock_code); setEditMode(true); }}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(stock_code)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
