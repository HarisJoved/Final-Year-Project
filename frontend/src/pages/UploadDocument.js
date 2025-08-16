import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image, X, Save, Eye, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Layout from '../components/Layout';
import ImagePreprocessor from '../components/ImagePreprocessor';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'preprocess', 'edit'
  const [preprocessingOptions, setPreprocessingOptions] = useState({});
  
  const navigate = useNavigate();

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setStep('preview');
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const processImage = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const result = await documentService.uploadImage(file, preprocessingOptions);
      setExtractedText(result.extracted_text);
      setCorrectedText(result.extracted_text);
      setStep('edit');
      toast.success('Text extracted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!extractedText) return;

    setSaving(true);
    try {
      await documentService.saveDocument(extractedText, correctedText);
      toast.success('Document saved successfully!');
      navigate('/documents');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setExtractedText('');
    setCorrectedText('');
    setStep('upload');
  };

  const renderUploadStep = () => (
    <div className="text-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 hover:border-primary-500 dark:hover:border-primary-400 transition-colors cursor-pointer"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Upload handwriting image
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop your image here, or click to browse
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Supports: JPG, PNG, GIF (max 10MB)
          </p>
        </label>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Preview Image
        </h2>
        <button
          onClick={resetUpload}
          className="btn-secondary flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Change Image</span>
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex justify-center">
        <img
          src={preview}
          alt="Preview"
          className="max-w-full max-h-96 object-contain rounded"
        />
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setStep('preprocess')}
          className="btn-secondary flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>Preprocess Image</span>
        </button>
        <button
          onClick={processImage}
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Extract Text</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderPreprocessStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Preprocess Image
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setStep('preview')}
            className="btn-secondary flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={resetUpload}
            className="btn-secondary flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Change Image</span>
          </button>
        </div>
      </div>

      <ImagePreprocessor
        image={preview}
        onPreprocessingChange={setPreprocessingOptions}
      />

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setStep('preview')}
          className="btn-secondary"
        >
          Back to Preview
        </button>
        <button
          onClick={processImage}
          disabled={loading}
          className="btn-primary flex items-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Extract Text</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderEditStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Review and Correct Text
        </h2>
        <button
          onClick={resetUpload}
          className="btn-secondary flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Start Over</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Original Image
          </h3>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex justify-center">
            <img
              src={preview}
              alt="Original"
              className="max-w-full max-h-64 object-contain rounded"
            />
          </div>
        </div>

        {/* Extracted Text */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Extracted Text
          </h3>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 h-64 overflow-y-auto">
            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono">
              {extractedText || 'No text extracted'}
            </pre>
          </div>
        </div>
      </div>

      {/* Corrected Text */}
      <div>
        <label className="block text-lg font-medium text-gray-900 dark:text-white mb-3">
          Corrected Text
        </label>
        <textarea
          value={correctedText}
          onChange={(e) => setCorrectedText(e.target.value)}
          className="input-field h-40 resize-none"
          placeholder="Review and correct the extracted text here..."
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Review the extracted text and make any necessary corrections before saving.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveDocument}
          disabled={saving || !extractedText}
          className="btn-primary flex items-center space-x-2"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Document</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="card p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Upload Document
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Upload an image of handwritten text to extract and correct it using OCR technology.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                step === 'upload' ? 'text-primary-600 dark:text-primary-400' : 
                step === 'preview' || step === 'preprocess' || step === 'edit' ? 'text-green-600 dark:text-green-400' : 
                'text-gray-400 dark:text-gray-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'upload' ? 'bg-primary-100 dark:bg-primary-900' :
                  step === 'preview' || step === 'preprocess' || step === 'edit' ? 'bg-green-100 dark:bg-green-900' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Upload</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              <div className={`flex items-center space-x-2 ${
                step === 'preview' ? 'text-primary-600 dark:text-primary-400' : 
                step === 'preprocess' || step === 'edit' ? 'text-green-600 dark:text-green-400' : 
                'text-gray-400 dark:text-gray-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'preview' ? 'bg-primary-100 dark:bg-primary-900' :
                  step === 'preprocess' || step === 'edit' ? 'bg-green-100 dark:bg-green-900' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Preview</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              <div className={`flex items-center space-x-2 ${
                step === 'preprocess' ? 'text-primary-600 dark:text-primary-400' : 
                step === 'edit' ? 'text-green-600 dark:text-green-400' : 
                'text-gray-400 dark:text-gray-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'preprocess' ? 'bg-primary-100 dark:bg-primary-900' :
                  step === 'edit' ? 'bg-green-100 dark:bg-green-900' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">Preprocess</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              
              <div className={`flex items-center space-x-2 ${
                step === 'edit' ? 'text-primary-600 dark:text-primary-400' : 
                'text-gray-400 dark:text-gray-500'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'edit' ? 'bg-primary-100 dark:bg-primary-900' :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  4
                </div>
                <span className="text-sm font-medium">Edit & Save</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'preprocess' && renderPreprocessStep()}
          {step === 'edit' && renderEditStep()}
        </div>
      </div>
    </Layout>
  );
};

export default UploadDocument;
