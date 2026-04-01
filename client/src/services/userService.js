import axiosInstance from '../utils/axiosInstance';

const userService = {
  updateProfile: async (formData) => {
    const response = await axiosInstance.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteAccount: async () => {
    const response = await axiosInstance.delete('/users/account');
    return response.data;
  },
  toggleNotifications: async (targetUserId) => {
    const response = await axiosInstance.put(`/users/${targetUserId}/notifications`);
    return response.data;
  }
};

export default userService;
