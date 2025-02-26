import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { Toast } from './components/Toast';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Store the location they tried to access
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <div className="min-h-screen bg-black">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes with Header */}
              <Route path="/" element={
                <PrivateRoute>
                  <>
                    <Header />
                    <main className="pt-16"> {/* Add padding for fixed header */}
                      <Home />
                    </main>
                  </>
                </PrivateRoute>
              } />
              <Route path="/home" element={
                <PrivateRoute>
                  <>
                    <Header />
                    <main className="pt-16">
                      <Home />
                    </main>
                  </>
                </PrivateRoute>
              } />
              <Route path="/products" element={
                <PrivateRoute>
                  <>
                    <Header />
                    <main className="pt-16">
                      <Products />
                    </main>
                  </>
                </PrivateRoute>
              } />
              <Route path="/product/:id" element={
                <PrivateRoute>
                  <>
                    <Header />
                    <main className="pt-16">
                      <Product />
                    </main>
                  </>
                </PrivateRoute>
              } />
              <Route path="/cart" element={
                <PrivateRoute>
                  <>
                    <Header />
                    <main className="pt-16">
                      <Cart />
                    </main>
                  </>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <>
                    <Header />
                    <main className="pt-16">
                      <Profile />
                    </main>
                  </>
                </PrivateRoute>
              } />
              <Route path="/checkout" element={
                <PrivateRoute>
                  <>
                    <Header />
                    <main className="pt-16">
                      <Checkout />
                    </main>
                  </>
                </PrivateRoute>
              } />
              <Route path="/checkout/success" element={
                <PrivateRoute>
                  <CheckoutSuccess />
                </PrivateRoute>
              } />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toast />
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;