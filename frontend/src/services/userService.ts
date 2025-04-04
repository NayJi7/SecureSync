import API from './api';  // Votre service API configuré précédemment

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export const getUsers = () => {
  return API.get<User[]>('/users/');
};

export const getUser = (id: number) => {
  return API.get<User>(`/users/${id}/`);
};

export const createUser = (userData: Omit<User, 'id'> & { password: string }) => {
  return API.post<User>('/users/', userData);
};

export const updateUser = (id: number, userData: Partial<User>) => {
  return API.put<User>(`/users/${id}/`, userData);
};

export const deleteUser = (id: number) => {
  return API.delete(`/users/${id}/`);
};