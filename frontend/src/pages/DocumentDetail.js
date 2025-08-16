import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, X, Calendar, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [correctedText, setCorrectedText] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const data = await documentService.getDocument(id);
      setDocument(data);
      setCorrectedText(data.corrected_text || data.original_text);
    } catch (error) {
      toast.error('Document not found');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedDoc = await documentService.updateDocument(id, correctedText);
      setDocument(updatedDoc);
      setIsEditing(false);
      toast.success('Document updated successfully!');
    } catch (error) {
      toast.error('Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCorrectedText(document.corrected_text || document.original_text);
    setIsEditing(false);
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Text copied to clipboard!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Document not found
          </h2>
          <Link to="/documents" className="btn-primary">
            Back to Documents
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/documents"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Document Details
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(document.created_at)}</span>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Correction</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Original Text */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Original Text (OCR)
              </h2>
              <button
                onClick={() => copyToClipboard(document.original_text, 'original')}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Copy to clipboard"
              >
                {copiedField === 'original' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[200px]">
              <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
                {document.original_text || 'No text extracted'}
              </pre>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              This is the text extracted directly from your image using OCR technology.
            </div>
          </div>

          {/* Corrected Text */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Corrected Text
              </h2>
              {!isEditing && (
                <button
                  onClick={() => copyToClipboard(correctedText, 'corrected')}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedField === 'corrected' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={correctedText}
                  onChange={(e) => setCorrectedText(e.target.value)}
                  className="input-field min-h-[200px] resize-none font-mono"
                  placeholder="Enter your corrections here..."
                />
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2 flex-1"
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="btn-secondary flex items-center space-x-2 flex-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-[200px]">
                  <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
                    {correctedText || 'No corrections made yet'}
                  </pre>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  {document.corrected_text 
                    ? 'This is your corrected version of the extracted text.'
                    : 'Click "Edit Correction" to make improvements to the extracted text.'
                  }
                </div>
              </>
            )}
          </div>
        </div>

        {/* Comparison Stats */}
        {document.original_text && correctedText && document.original_text !== correctedText && (
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Comparison
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {document.original_text.length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Original chars</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {correctedText.length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Corrected chars</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {document.original_text.split(/\s+/).length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Original words</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {correctedText.split(/\s+/).length}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Corrected words</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DocumentDetail;
