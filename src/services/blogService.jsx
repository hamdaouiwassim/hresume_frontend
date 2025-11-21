import axiosInstance from "../api/axiosInstance";

// Get all published blog posts (public)
export const getBlogPosts = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return axiosInstance.get(`/blog?${queryString}`);
};

// Get a single blog post by slug (public)
export const getBlogPost = (slug) => {
  return axiosInstance.get(`/blog/${slug}`);
};

// Admin: Get all blog posts (including drafts)
export const getAdminBlogPosts = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return axiosInstance.get(`/admin/blog?${queryString}`);
};

// Admin: Get a single blog post
export const getAdminBlogPost = (id) => {
  return axiosInstance.get(`/admin/blog/${id}`);
};

// Admin: Create a blog post
export const createBlogPost = (data) => {
  return axiosInstance.post("/admin/blog", data);
};

// Admin: Update a blog post
export const updateBlogPost = (id, data) => {
  return axiosInstance.put(`/admin/blog/${id}`, data);
};

// Admin: Delete a blog post
export const deleteBlogPost = (id) => {
  return axiosInstance.delete(`/admin/blog/${id}`);
};

