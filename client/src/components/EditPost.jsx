import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch post and categories on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [postRes, catRes] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get('/categories'),
        ]);
        setForm({
          title: postRes.data.title,
          content: postRes.data.content,
          category: postRes.data.category?._id || '',
        });
        setCategories(catRes.data.categories || catRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load post or categories');
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('category', form.category);
      if (image) formData.append('image', image);

      await api.put(`/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/posts/${id}`);
    } catch (err) {
      setError('Failed to update post');
    }
  };

  const handleCancel = () => {
    navigate(`/posts/${id}`);
  };

  if (loading) return <div className="text-center mt-8 text-potasq dark:text-potasq-light">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 mt-8 transition-colors duration-300"
    >
      <h2 className="text-2xl font-bold mb-6 text-potasq dark:text-potasq-light">Edit Post</h2>
      <div className="mb-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border border-potasq rounded p-2 bg-white dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <div className="mb-4">
        <textarea
          name="content"
          placeholder="Content"
          value={form.content}
          onChange={handleChange}
          required
          className="w-full border border-potasq rounded p-2 min-h-[120px] bg-white dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <div className="mb-4">
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="w-full border border-potasq rounded p-2 bg-white dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-potasq file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-potasq-light file:text-potasq hover:file:bg-potasq dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="px-4 py-2 bg-potasq text-white rounded hover:bg-potasq-dark transition"
        >
          Update Post
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </form>
  );
};

export default EditPost;