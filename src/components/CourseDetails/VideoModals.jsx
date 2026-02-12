import React from 'react';
import PropTypes from 'prop-types';
import { Play } from 'lucide-react';

const VideoModals = ({
  showVideoModal,
  setShowVideoModal,
  videoFormData,
  handleVideoInputChange,
  handleVideoSubmit,
  videoPreview,
  setVideoPreview,
  thumbnailPreview,
  setThumbnailPreview,
  selectedVideoFile,
  setSelectedVideoFile,
  selectedThumbnailFile,
  setSelectedThumbnailFile,
  handleVideoFileUpload,
  handleThumbnailUpload,
  videoInputRef,
  thumbnailInputRef,
  resetVideoForm,
  videoLoading,
  showEditVideoModal,
  setShowEditVideoModal,
  editVideoFormData,
  handleEditVideoInputChange,
  handleEditVideoSubmit
}) => {
  return (
    <>
      {/* Create Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add Video Lecture</h2>
              
              <form onSubmit={handleVideoSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 mb-1 text-left">Title *</label>
                    <input
                      id="video-title"
                      type="text"
                      name="title"
                      value={videoFormData.title}
                      onChange={handleVideoInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Introduction to JavaScript"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="video-duration" className="block text-sm font-medium text-gray-700 mb-1 text-left">Duration (minutes) *</label>
                    <input
                      id="video-duration"
                      type="number"
                      name="duration"
                      value={videoFormData.duration}
                      onChange={handleVideoInputChange}
                      required
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="30"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="video-description" className="block text-sm font-medium text-gray-700 mb-1 text-left">Description *</label>
                    <textarea
                      id="video-description"
                      name="description"
                      value={videoFormData.description}
                      onChange={handleVideoInputChange}
                      required
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Basic JavaScript concepts and fundamentals"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="video-file-input" className="block text-sm font-medium text-gray-700 mb-1 text-left">Video File *</label>
                    {videoPreview ? (
                      <div className="relative mb-3">
                        <video 
                          src={videoPreview} 
                          className="w-full h-32 object-cover rounded-md"
                          controls
                        >
                          <track kind="captions" srcLang="en" label="English" />
                        </video>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoPreview(null);
                            setSelectedVideoFile(null);
                            if (videoInputRef.current) videoInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="video-file-input" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100" aria-label="Upload video file">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <Play className="w-6 h-6 mb-2 text-gray-500" />
                            <p className="text-xs text-gray-500">Upload Video</p>
                          </div>
                          <input 
                            id="video-file-input"
                            type="file" 
                            className="hidden" 
                            onChange={handleVideoFileUpload}
                            accept="video/*"
                            ref={videoInputRef}
                            required
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="thumbnail-file-input" className="block text-sm font-medium text-gray-700 mb-1 text-left">Thumbnail *</label>
                    {thumbnailPreview ? (
                      <div className="relative mb-3">
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailPreview(null);
                            setSelectedThumbnailFile(null);
                            if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="thumbnail-file-input" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100" aria-label="Upload thumbnail image">
                          <div className="flex flex-col items-center justify-center pt-2 pb-2">
                            <svg className="w-6 h-6 mb-2 text-gray-500" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p className="text-xs text-gray-500">Upload Thumbnail</p>
                          </div>
                          <input 
                            id="thumbnail-file-input"
                            type="file" 
                            className="hidden" 
                            onChange={handleThumbnailUpload}
                            accept="image/*"
                            ref={thumbnailInputRef}
                            required
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVideoModal(false);
                      resetVideoForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    disabled={videoLoading}
                  >
                    {videoLoading ? 'Creating...' : 'Add Video'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {showEditVideoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Edit Video Lecture</h2>
              
              <form onSubmit={handleEditVideoSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-video-title" className="block text-sm font-medium text-gray-700 mb-1 text-left">Title *</label>
                    <input
                      id="edit-video-title"
                      type="text"
                      name="title"
                      value={editVideoFormData.title}
                      onChange={handleEditVideoInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-video-duration" className="block text-sm font-medium text-gray-700 mb-1 text-left">Duration (minutes) *</label>
                    <input
                      id="edit-video-duration"
                      type="number"
                      name="duration"
                      value={editVideoFormData.duration}
                      onChange={handleEditVideoInputChange}
                      required
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="edit-video-description" className="block text-sm font-medium text-gray-700 mb-1 text-left">Description *</label>
                    <textarea
                      id="edit-video-description"
                      name="description"
                      value={editVideoFormData.description}
                      onChange={handleEditVideoInputChange}
                      required
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditVideoModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={videoLoading}
                  >
                    {videoLoading ? 'Updating...' : 'Update Video'}
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

VideoModals.propTypes = {
  showVideoModal: PropTypes.bool.isRequired,
  setShowVideoModal: PropTypes.func.isRequired,
  videoFormData: PropTypes.object.isRequired,
  handleVideoInputChange: PropTypes.func.isRequired,
  handleVideoSubmit: PropTypes.func.isRequired,
  videoPreview: PropTypes.string,
  setVideoPreview: PropTypes.func.isRequired,
  thumbnailPreview: PropTypes.string,
  setThumbnailPreview: PropTypes.func.isRequired,
  selectedVideoFile: PropTypes.object,
  setSelectedVideoFile: PropTypes.func.isRequired,
  selectedThumbnailFile: PropTypes.object,
  setSelectedThumbnailFile: PropTypes.func.isRequired,
  handleVideoFileUpload: PropTypes.func.isRequired,
  handleThumbnailUpload: PropTypes.func.isRequired,
  videoInputRef: PropTypes.object.isRequired,
  thumbnailInputRef: PropTypes.object.isRequired,
  resetVideoForm: PropTypes.func.isRequired,
  videoLoading: PropTypes.bool.isRequired,
  showEditVideoModal: PropTypes.bool,
  setShowEditVideoModal: PropTypes.func,
  editVideoFormData: PropTypes.object,
  handleEditVideoInputChange: PropTypes.func,
  handleEditVideoSubmit: PropTypes.func
};

export default VideoModals;
