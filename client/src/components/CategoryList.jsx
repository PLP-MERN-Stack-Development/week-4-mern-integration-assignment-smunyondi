import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/api';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryService.createCategory({ name, description });
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      setError('Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(cat => cat._id !== id));
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 mt-8 transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 text-potasq dark:text-potasq-light">Categories</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border border-potasq rounded p-2 flex-1 bg-white dark:bg-gray-800 dark:text-gray-100"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-potasq rounded p-2 flex-1 bg-white dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          className="bg-potasq text-white px-4 py-2 rounded hover:bg-potasq-dark transition"
        >
          Add Category
        </button>
      </form>
      {loading ? (
        <div className="text-center text-potasq dark:text-potasq-light">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat._id} className="bg-white dark:bg-gray-800 border border-potasq-light dark:border-gray-700 rounded p-3 flex items-center justify-between">
              <div>
                <b className="text-potasq dark:text-potasq-light">{cat.name}</b>
                <span className="ml-2 text-gray-600 dark:text-gray-300">{cat.description}</span>
              </div>
              <button
                onClick={() => handleDelete(cat._id)}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryList;
