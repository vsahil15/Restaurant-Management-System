import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import api from './api/api';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import BookTable from './pages/BookTable';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import AdminInventory from './pages/AdminInventory';
import AdminMenu from './pages/AdminMenu';
import AdminPanel from './pages/AdminPanel';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Route wrapper component
const AdminRoute = ({ children }) => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }
  try {
    const userObj = JSON.parse(storedUser);
    if (!userObj.isAdmin) {
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Loader function definitions for data routers
export const menuLoader = async () => {
  try {
    const res = await api.get('/menu');
    return res.data.menu || [];
  } catch (err) {
    console.error("Failed to load menu:", err);
    return [];
  }
};

export const bookingsLoader = async () => {
  try {
    const res = await api.get('/booktable/my-bookings');
    return res.data.bookings || [];
  } catch (err) {
    return [];
  }
};

export const ordersLoader = async () => {
  try {
    const res = await api.get('/order/my-orders');
    return res.data.orders || [];
  } catch (err) {
    return [];
  }
};

export const inventoryLoader = async () => {
  try {
    const res = await api.get('/admin/inventory');
    return res.data.data || [];
  } catch (err) {
    console.error("Failed to load inventory:", err);
    return [];
  }
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'book-table',
        element: <BookTable />,
      },
      {
        path: 'menu',
        element: <Menu />,
      },
      {
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'admin/inventory',
        element: <AdminRoute><AdminInventory /></AdminRoute>,
        loader: inventoryLoader,
      },
      {
        path: 'admin/menu',
        element: <AdminRoute><AdminMenu /></AdminRoute>,
      },
      {
        path: 'admin',
        element: <AdminRoute><AdminPanel /></AdminRoute>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

