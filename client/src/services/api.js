import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - 401 hatalarını yakala
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const auth = {
    login: (email, password) => api.post('/account/login', { email, password }),
    register: (name, email, password) => api.post('/account/register', { name, email, password }),
    updateProfile: (data) => api.put('/account/profile', data),
    changePassword: (currentPassword, newPassword) => api.put('/account/password', { currentPassword, newPassword }),
    getAddresses: () => api.get('/account/addresses'),
    addAddress: (data) => api.post('/account/addresses', data),
    updateAddress: (id, data) => api.put(`/account/addresses/${id}`, data),
    deleteAddress: (id) => api.delete(`/account/addresses/${id}`),
    setDefaultAddress: (id) => api.put(`/account/addresses/${id}/default`),
};

export const products = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const categories = {
    getAll: (includeDeleted = false) => api.get('/categories', { params: { includeDeleted } }),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

export const cart = {
    get: () => api.get('/products/cart/my'),
    add: (productId, quantity = 1) => api.post('/products/cart', { productId, quantity }),
    remove: (productId) => api.delete(`/products/cart/${productId}`),
    updateQuantity: (productId, quantity) => api.put(`/products/cart/${productId}`, { quantity }),
};

export default api; 