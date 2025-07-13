import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [modalError, setModalError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || res.data);
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Image is required');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('image', image);

    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setContent('');
      setCategory('');
      setImage(null);
      navigate('/');
    } catch (err) {
      setError('Failed to create post');
    }
  };

  // Handle adding a new category via modal
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setModalError(null);
    if (!newCategoryName.trim()) {
      setModalError('Category name is required');
      return;
    }
    try {
      const res = await api.post('/categories', {
        name: newCategoryName,
        description: newCategoryDescription,
      });
      setCategories([...categories, res.data.category]);
      setCategory(res.data.category._id);
      setShowModal(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
    } catch (err) {
      setModalError('Failed to add new category');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 mt-8 transition-colors duration-300"
      >
        <h2 className="text-2xl font-bold mb-6 text-potasq dark:text-potasq-light">Create New Post</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full border border-potasq rounded p-2 bg-white dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Content"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="w-full border border-potasq rounded p-2 min-h-[120px] bg-white dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div className="mb-4">
          <div className="flex gap-2 items-center">
            <select
              value={category}
              onChange={e => {
                if (e.target.value === '__add_new__') {
                  setShowModal(true);
                } else {
                  setCategory(e.target.value);
                }
              }}
              required
              className="w-full border border-potasq rounded p-2 bg-white dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
              <option value="__add_new__">+ Add new category</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
            required
            className="block w-full text-sm text-potasq file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-potasq-light file:text-potasq hover:file:bg-potasq dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-potasq text-white py-2 rounded hover:bg-potasq-dark transition font-semibold"
        >
          Submit
        </button>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      </form>

      {/* Modal for adding new category */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-4 text-potasq dark:text-potasq-light">Add New Category</h3>
            <form onSubmit={handleAddCategory}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  required
                  className="w-full border border-potasq rounded p-2 bg-white dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newCategoryDescription}
                  onChange={e => setNewCategoryDescription(e.target.value)}
                  className="w-full border border-potasq rounded p-2 bg-white dark:bg-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-potasq text-white px-4 py-2 rounded hover:bg-potasq-dark transition"
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
              {modalError && <div className="text-red-500 mt-3 text-center">{modalError}</div>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PostForm;
