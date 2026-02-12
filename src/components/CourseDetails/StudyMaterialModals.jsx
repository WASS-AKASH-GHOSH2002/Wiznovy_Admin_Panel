import React from 'react';
import PropTypes from 'prop-types';
import { FileText } from 'lucide-react';

const StudyMaterialModals = ({
  showStudyMaterialModal,
  showVideoStudyMaterialModal,
  showEditStudyMaterialModal,
  showUpdatePdfModal,
  setShowStudyMaterialModal,
  setShowVideoStudyMaterialModal,
  setShowEditStudyMaterialModal,
  setShowUpdatePdfModal,
  studyMaterialFormData,
  videoStudyMaterialFormData,
  selectedStudyMaterial,
  setSelectedStudyMaterial,
  selectedStudyFile,
  selectedVideoStudyFile,
  selectedEditStudyFile,
  setSelectedEditStudyFile,
  handleStudyMaterialInputChange,
  handleVideoStudyMaterialInputChange,
  handleStudyFileUpload,
  handleVideoStudyFileUpload,
  handleStudyMaterialSubmit,
  handleVideoStudyMaterialSubmit,
  handleEditStudyMaterial,
  handleUpdatePdf,
  resetStudyMaterialForm,
  resetVideoStudyMaterialForm,
  studyMaterialLoading
}) => {
  return (
    <>
      {/* Create Study Material Modal */}
      {showStudyMaterialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add Study Material</h2>
              
              <form onSubmit={handleStudyMaterialSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="study-material-title" className="block text-sm font-medium text-gray-700 mb-1 text-left">Title *</label>
                    <input
                      id="study-material-title"
                      type="text"
                      name="title"
                      value={studyMaterialFormData.title}
                      onChange={handleStudyMaterialInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Newton Worksheet"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="study-material-description" className="block text-sm font-medium text-gray-700 mb-1 text-left">Description *</label>
                    <textarea
                      id="study-material-description"
                      name="description"
                      value={studyMaterialFormData.description}
                      onChange={handleStudyMaterialInputChange}
                      required
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Practice problems for calculus"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="study-material-file" className="block text-sm font-medium text-gray-700 mb-1 text-left">File *</label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="study-material-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100" aria-label="Upload study material file">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <FileText className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-xs text-gray-500">
                            {selectedStudyFile ? selectedStudyFile.name : 'Upload File'}
                          </p>
                        </div>
                        <input 
                          id="study-material-file"
                          type="file" 
                          className="hidden" 
                          onChange={handleStudyFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          required
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowStudyMaterialModal(false);
                      resetStudyMaterialForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    disabled={studyMaterialLoading}
                  >
                    {studyMaterialLoading ? 'Creating...' : 'Add Study Material'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Video Study Material Modal */}
      {showVideoStudyMaterialModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add Video Study Material</h2>
              
              <form onSubmit={handleVideoStudyMaterialSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="video-study-title" className="block text-sm font-medium text-gray-700 mb-1 text-left">Title *</label>
                    <input
                      id="video-study-title"
                      type="text"
                      name="title"
                      value={videoStudyMaterialFormData.title}
                      onChange={handleVideoStudyMaterialInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Newton Worksheet"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="video-study-description" className="block text-sm font-medium text-gray-700 mb-1 text-left">Description *</label>
                    <textarea
                      id="video-study-description"
                      name="description"
                      value={videoStudyMaterialFormData.description}
                      onChange={handleVideoStudyMaterialInputChange}
                      required
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Practice problems for calculus"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="video-study-file" className="block text-sm font-medium text-gray-700 mb-1 text-left">File *</label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="video-study-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <FileText className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-xs text-gray-500">
                            {selectedVideoStudyFile ? selectedVideoStudyFile.name : 'Upload File'}
                          </p>
                        </div>
                        <input 
                          id="video-study-file"
                          type="file" 
                          className="hidden" 
                          onChange={handleVideoStudyFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          required
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoStudyMaterialModal(false);
                      resetVideoStudyMaterialForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    disabled={studyMaterialLoading}
                  >
                    {studyMaterialLoading ? 'Creating...' : 'Add Study Material'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Study Material Modal */}
      {showEditStudyMaterialModal && selectedStudyMaterial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Study Material</h2>
              
              <form onSubmit={handleEditStudyMaterial}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-study-title" className="block text-sm font-medium text-gray-700 mb-1 text-left">Title *</label>
                    <input
                      id="edit-study-title"
                      type="text"
                      value={selectedStudyMaterial.title}
                      onChange={(e) => setSelectedStudyMaterial(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Newton Worksheet"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-study-description" className="block text-sm font-medium text-gray-700 mb-1 text-left">Description *</label>
                    <textarea
                      id="edit-study-description"
                      value={selectedStudyMaterial.description}
                      onChange={(e) => setSelectedStudyMaterial(prev => ({ ...prev, description: e.target.value }))}
                      required
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Practice problems for calculus"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditStudyMaterialModal(false);
                      setSelectedStudyMaterial(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={studyMaterialLoading}
                  >
                    {studyMaterialLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update PDF Modal */}
      {showUpdatePdfModal && selectedStudyMaterial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Update PDF File</h2>
              <p className="text-sm text-gray-600 mb-4">Material: {selectedStudyMaterial.title}</p>
              
              <form onSubmit={handleUpdatePdf}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="update-pdf-file" className="block text-sm font-medium text-gray-700 mb-1 text-left">Select New PDF File *</label>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="update-pdf-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <FileText className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-xs text-gray-500">
                            {selectedEditStudyFile ? selectedEditStudyFile.name : 'Choose PDF file'}
                          </p>
                        </div>
                        <input 
                          id="update-pdf-file"
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setSelectedEditStudyFile(e.target.files[0])}
                          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                          required
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdatePdfModal(false);
                      setSelectedStudyMaterial(null);
                      setSelectedEditStudyFile(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    disabled={studyMaterialLoading}
                  >
                    {studyMaterialLoading ? 'Updating...' : 'Update PDF'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

StudyMaterialModals.propTypes = {
  showStudyMaterialModal: PropTypes.bool.isRequired,
  showVideoStudyMaterialModal: PropTypes.bool.isRequired,
  showEditStudyMaterialModal: PropTypes.bool.isRequired,
  showUpdatePdfModal: PropTypes.bool.isRequired,
  setShowStudyMaterialModal: PropTypes.func.isRequired,
  setShowVideoStudyMaterialModal: PropTypes.func.isRequired,
  setShowEditStudyMaterialModal: PropTypes.func.isRequired,
  setShowUpdatePdfModal: PropTypes.func.isRequired,
  studyMaterialFormData: PropTypes.object.isRequired,
  videoStudyMaterialFormData: PropTypes.object.isRequired,
  selectedStudyMaterial: PropTypes.object,
  setSelectedStudyMaterial: PropTypes.func.isRequired,
  selectedStudyFile: PropTypes.object,
  selectedVideoStudyFile: PropTypes.object,
  selectedEditStudyFile: PropTypes.object,
  setSelectedEditStudyFile: PropTypes.func.isRequired,
  handleStudyMaterialInputChange: PropTypes.func.isRequired,
  handleVideoStudyMaterialInputChange: PropTypes.func.isRequired,
  handleStudyFileUpload: PropTypes.func.isRequired,
  handleVideoStudyFileUpload: PropTypes.func.isRequired,
  handleStudyMaterialSubmit: PropTypes.func.isRequired,
  handleVideoStudyMaterialSubmit: PropTypes.func.isRequired,
  handleEditStudyMaterial: PropTypes.func.isRequired,
  handleUpdatePdf: PropTypes.func.isRequired,
  resetStudyMaterialForm: PropTypes.func.isRequired,
  resetVideoStudyMaterialForm: PropTypes.func.isRequired,
  studyMaterialLoading: PropTypes.bool.isRequired
};

export default StudyMaterialModals;
