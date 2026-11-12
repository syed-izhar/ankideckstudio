import React, { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ProModal from './components/ProModal';
import { useDeck } from './context/DeckContext';

import ViewerPage from './pages/ViewerPage';
import CompressorPage from './pages/CompressorPage';
import PdfPage from './pages/PdfPage';
import CsvPage from './pages/CsvPage';
import SEOHead from './components/SEOHead';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AnkiDeckStudio ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 shadow-xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '#/';
                window.location.reload();
              }}
              className="btn-primary w-full text-sm py-2"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { showProModal } = useDeck();

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <SEOHead />
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<ViewerPage />} />
            <Route path="/apkg-viewer" element={<ViewerPage />} />
            <Route path="/anki-deck-compressor" element={<CompressorPage />} />
            <Route path="/apkg-to-pdf" element={<PdfPage />} />
            <Route path="/apkg-to-csv-quizlet" element={<CsvPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        {showProModal && <ProModal />}
      </div>
    </ErrorBoundary>
  );
}
