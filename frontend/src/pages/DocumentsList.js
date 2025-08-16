import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Eye, Trash2, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'corrected', 'uncorrected'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return 'No text available';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch = searchTerm === '' || 
        doc.original_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.corrected_text?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' ||
        (filterBy === 'corrected' && doc.corrected_text) ||
        (filterBy === 'uncorrected' && !doc.corrected_text);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your OCR documents and corrections
            </p>
          </div>
          <Link
            to="/upload"
            className="btn-primary flex items-center space-x-2 w-fit"
          >
            <FileText className="w-4 h-4" />
            <span>Upload New Document</span>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">All Documents</option>
                <option value="corrected">Corrected</option>
                <option value="uncorrected">Uncorrected</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredAndSortedDocuments.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {documents.length === 0 ? 'No documents yet' : 'No documents found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {documents.length === 0 
                ? 'Upload your first handwriting image to get started with OCR text extraction.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {documents.length === 0 && (
              <Link to="/upload" className="btn-primary">
                Upload Your First Document
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedDocuments.map((document) => (
              <Link
                key={document.id}
                to={`/documents/${document.id}`}
                className="card card-hover p-6 block transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Document
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {document.corrected_text && (
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                        Corrected
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDelete(document.id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Original Text Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Original Text
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {truncateText(document.original_text)}
                    </p>
                  </div>

                  {/* Corrected Text Preview (if available) */}
                  {document.corrected_text && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Corrected Text
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {truncateText(document.corrected_text)}
                      </p>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(document.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    View Details
                  </span>
                  <Eye className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        {documents.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                Showing {filteredAndSortedDocuments.length} of {documents.length} documents
              </span>
              <span>
                {documents.filter(doc => doc.corrected_text).length} corrected
              </span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentsList;
