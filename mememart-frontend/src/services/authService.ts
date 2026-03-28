import api from "./api";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  register: (data: RegisterData) => api.post("/auth/register", data),
  login: (data: LoginData) => api.post("/auth/login", data),
  firebaseLogin: (idToken: string) =>
    api.post("/auth/firebase-login", { idToken }),
  adminLogin: (username: string, password: string) =>
    api.post("/auth/admin/login", { username, password }),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data: { username?: string; avatar?: string }) =>
    api.put("/auth/profile", data),
  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh-token", { refreshToken }),
  toggleFavourite: (mediaId: string) => api.post(`/auth/favourites/${mediaId}`),
  getFavourites: () => api.get("/auth/favourites"),
  getUserById: (userId: string) => api.get(`/auth/users/${userId}`),
};
