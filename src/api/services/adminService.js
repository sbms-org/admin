import api from '../axiosInstance';

export const getProvidersForVerification = () => api.get('/admin/providers/verification');
export const updateProviderVerification = (id, data) =>
  api.patch('/admin/providers/verification', { id, ...data });

export const getUsers = () => api.get('/admin/users');
export const updateUser = (id, data) =>
  api.patch(`/admin/users/${encodeURIComponent(id)}`, data);

export const getWorkPostsForModeration = () => api.get('/admin/work-posts/moderation');
export const updateWorkPostModeration = (id, data) =>
  api.patch('/admin/work-posts/moderation', { id, ...data });

export const getIssues = () => api.get('/admin/issues');
export const updateIssue = (id, data) =>
  api.patch('/admin/issues', { id, ...data });

export const getPlatformReports = () => api.get('/admin/reports');
export const getPlatformSettings = () => api.get('/admin/settings');
export const updatePlatformSettings = (data) => api.patch('/admin/settings', data);
export const getActivityLogs = () => api.get('/admin/activity-logs');
