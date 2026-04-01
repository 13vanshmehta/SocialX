import axiosInstance from '../utils/axiosInstance';

const notificationService = {
  getNotifications: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },
  markAsRead: async () => {
    const response = await axiosInstance.put('/notifications/mark-read');
    return response.data;
  }
};

export default notificationService;
