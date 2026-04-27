/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import Navbar from './components/Layout/Navbar';
import ScrollToTop from './components/Common/ScrollToTop';
import HomePage from './pages/HomePage';
import WatchPage from './components/Watch/WatchPage';
import WatchlistPage from './pages/WatchlistPage';

import Footer from './components/Layout/Footer';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <MovieProvider>
          <Router>
            <ScrollToTop />
            <div className="bg-bg-dark min-h-screen text-white selection:bg-brand-primary selection:text-white relative overflow-hidden">
              {/* Mesh Backgrounds */}
              <div className="mesh-gradient-1" />
              <div className="mesh-gradient-2" />
              
              <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/phim/:slug" element={<WatchPage />} />
                    <Route path="/watch/:id" element={<WatchPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="/movie/:id" element={<WatchPage />} />
                    <Route path="/category/:slug" element={<HomePage />} />
                    <Route path="/type/:type" element={<HomePage />} />
                    <Route path="/genre/:genre" element={<HomePage />} />
                    <Route path="/country/:country" element={<HomePage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </div>
          </Router>
        </MovieProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
