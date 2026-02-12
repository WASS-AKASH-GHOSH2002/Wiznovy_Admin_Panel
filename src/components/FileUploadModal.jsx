import React, { useRef } from 'react';
import PropTypes from 'prop-types';

const FileUploadModal = ({
  show,
  onClose,
  onSubmit,
  title,
  filePreview,
  setFilePreview,
  selectedFile,
  setSelectedFile,
  accept = 'image/*',
  loading = false,
  buttonText = 'Upload',
  previewType = 'image'
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFilePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{title}</h2>
          
          <form onSubmit={onSubmit}>
            <div>
              <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Select File *
              </label>
              {filePreview ? (
                <div className="relative mb-3">
                  {previewType === 'image' ? (
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                      <p className="text-gray-600">{selectedFile?.name}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="file-input" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                      <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="text-sm text-gray-500">Click to upload file</p>
                    </div>
                    <input 
                      id="file-input"
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange}
                      accept={accept}
                      ref={fileInputRef}
                      required
                    />
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  handleRemoveFile();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                disabled={loading}
              >
                {loading ? 'Uploading...' : buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

FileUploadModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  filePreview: PropTypes.string,
  setFilePreview: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  setSelectedFile: PropTypes.func.isRequired,
  accept: PropTypes.string,
  loading: PropTypes.bool,
  buttonText: PropTypes.string,
  previewType: PropTypes.oneOf(['image', 'file'])
};

export default FileUploadModal;
