import axiosInstance from '../utils/axiosInstance';

const postService = {
  createPost: async (formData) => {
    // Note: using multipart/form-data for images
    const response = await axiosInstance.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFeedPosts: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUserPosts: async (userId, page = 1, limit = 10) => {
    // If no userId, the backend defaults to the logged-in user
    const url = userId ? `/posts/user/${userId}` : '/posts/user';
    const response = await axiosInstance.get(`${url}?page=${page}&limit=${limit}`);
    return response.data;
  },

  likePost: async (postId) => {
    const response = await axiosInstance.put(`/posts/${postId}/like`);
    return response.data;
  },

  updatePost: async (postId, content) => {
    const response = await axiosInstance.put(`/posts/${postId}`, { content });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
  },

  addComment: async (postId, text) => {
    const response = await axiosInstance.post(`/posts/${postId}/comment`, { text });
    return response.data;
  },

  updateComment: async (postId, commentId, text) => {
    const response = await axiosInstance.put(`/posts/${postId}/comment/${commentId}`, { text });
    return response.data;
  },

  deleteComment: async (postId, commentId) => {
    const response = await axiosInstance.delete(`/posts/${postId}/comment/${commentId}`);
    return response.data;
  },
};

export default postService;
