import React, { useEffect, useState } from 'react';
import { postService, categoryService } from './services/api';
import { Link, useNavigate } from 'react-router-dom';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [page, search, category]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await postService.getAllPosts(page, 5, category, search);
      setPosts(data.posts || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategory = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-potasq dark:text-potasq-light">Latest Posts - PoTaSQ Blogs</h2>
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={handleSearch}
            className="border border-potasq rounded px-4 py-2 w-full md:w-1/2 focus:border-potasq-dark bg-white dark:bg-gray-800 dark:text-gray-100"
          />
          <select
            value={category}
            onChange={handleCategory}
            className="border border-potasq rounded px-4 py-2 w-full md:w-1/4 focus:border-potasq-dark bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="text-center text-potasq dark:text-potasq-light">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <ul className="space-y-6">
              {posts.map((post) => {
                const latestComment = post.latestComment || (
                  post.comments && post.comments.length > 0
                    ? post.comments[post.comments.length - 1]
                    : null
                );
                const imageUrl = post.image
                  ? `${apiBase}/uploads/${post.image}`
                  : null;
                return (
                  <li
                    key={post._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition flex items-start gap-4"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={post.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0 border-2 border-potasq"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-potasq-light dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-potasq text-2xl border-2 border-potasq">
                        <span>No Image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <Link to={`/posts/${post._id}`}>
                        <h3 className="text-xl font-bold text-potasq dark:text-potasq-light mb-2 hover:text-potasq-dark transition">{post.title}</h3>
                      </Link>
                      <p className="text-gray-700 dark:text-gray-200 mb-4">{post.excerpt || (post.content?.slice(0, 100) + '...')}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span>
                          By {post.author?.username || post.author?.name || post.author?.email || 'Anonymous'}
                        </span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      {latestComment && (
                        <div className="mt-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-potasq">
                          <strong className="text-potasq-dark dark:text-potasq-light">Latest comment by {latestComment.username}:</strong>
                          <div className="italic text-gray-700 dark:text-gray-200">{latestComment.content}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(latestComment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/posts/${post._id}`)}
                        className="mt-4 px-4 py-2 bg-potasq text-white rounded hover:bg-potasq-dark transition"
                      >
                        View Post
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-potasq-light dark:bg-gray-700 rounded hover:bg-potasq disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-potasq dark:text-potasq-light font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-potasq-light dark:bg-gray-700 rounded hover:bg-potasq disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow mt-12">
        <div className="container mx-auto py-4 px-6 text-center text-potasq dark:text-potasq-light">
          &copy; {new Date().getFullYear()} PoTaSQ Blogs. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PostList;
