import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal';

const UnitModals = ({
  showCreateModal,
  showEditModal,
  showStatusModal,
  setShowCreateModal,
  setShowEditModal,
  setShowStatusModal,
  selectedUnit,
  setSelectedUnit,
  formData,
  handleInputChange,
  handleCreateUnit,
  handleUpdateUnit,
  updateStatus,
  imagePreview,
  setImagePreview,
  selectedFile,
  setSelectedFile,
  handleImageUpload,
  fileInputRef,
  resetForm,
  unitLoading
}) => {
  return (
    <>
      {}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => { setShowCreateModal(false); resetForm(); }}
        title="Create New Unit"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUnit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="create-unit-name" className="block text-sm font-medium text-gray-700 mb-1 text-left">Name *</label>
              <input
                id="create-unit-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Introduction to Programming"
              />
            </div>
            
            <div>
              <label htmlFor="create-unit-description" className="block text-sm font-medium text-gray-700 mb-1 text-left">Description *</label>
              <textarea
                id="create-unit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Basic programming concepts and fundamentals"
              />
            </div>
            
            <div>
              <label htmlFor="unit-image-upload" className="block text-sm font-medium text-gray-700 mb-1 text-left">Unit Image</label>
              
              {imagePreview ? (
                <div className="relative mb-3">
                  <img 
                    src={imagePreview} 
                    alt="Unit preview" 
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
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
                  <label htmlFor="unit-image-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100" aria-label="Upload unit image">
                    <div className="flex flex-col items-center justify-center pt-2 pb-2">
                      <svg className="w-6 h-6 mb-2 text-gray-500" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="text-xs text-gray-500">Upload Image</p>
                    </div>
                    <input 
                      id="unit-image-upload"
                      type="file" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      accept="image/*"
                      ref={fileInputRef}
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
                setShowCreateModal(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={unitLoading}
            >
              {unitLoading ? 'Creating...' : 'Create Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Unit Modal */}
      <Modal 
        isOpen={showEditModal && selectedUnit} 
        onClose={() => { setShowEditModal(false); resetForm(); }}
        title="Edit Unit"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateUnit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-unit-name" className="block text-sm font-medium text-gray-700 mb-1 text-left">Name *</label>
              <input
                id="edit-unit-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Introduction to Programming"
              />
            </div>
            
            <div>
              <label htmlFor="edit-unit-description" className="block text-sm font-medium text-gray-700 mb-1 text-left">Description *</label>
              <textarea
                id="edit-unit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Basic programming concepts and fundamentals"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={unitLoading}
            >
              {unitLoading ? 'Updating...' : 'Update Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Unit Status Update Modal */}
      {showStatusModal && selectedUnit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Update Unit Status</h3>
              <p className="text-gray-600 mb-4">Unit: {selectedUnit.name}</p>
              <p className="text-sm text-gray-500 mb-6">Current Status: {selectedUnit.status}</p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => updateStatus('PENDING')}
                  className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
                >
                  Set as Pending
                </button>
                <button
                  onClick={() => updateStatus('ACTIVE')}
                  className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  Set as Active
                </button>
                <button
                  onClick={() => updateStatus('DEACTIVE')}
                  className="p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                >
                  Set as Deactive
                </button>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedUnit(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

UnitModals.propTypes = {
  showCreateModal: PropTypes.bool.isRequired,
  showEditModal: PropTypes.bool.isRequired,
  showStatusModal: PropTypes.bool.isRequired,
  setShowCreateModal: PropTypes.func.isRequired,
  setShowEditModal: PropTypes.func.isRequired,
  setShowStatusModal: PropTypes.func.isRequired,
  selectedUnit: PropTypes.object,
  setSelectedUnit: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleCreateUnit: PropTypes.func.isRequired,
  handleUpdateUnit: PropTypes.func.isRequired,
  updateStatus: PropTypes.func.isRequired,
  imagePreview: PropTypes.string,
  setImagePreview: PropTypes.func.isRequired,
  selectedFile: PropTypes.object,
  setSelectedFile: PropTypes.func.isRequired,
  handleImageUpload: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  resetForm: PropTypes.func.isRequired,
  unitLoading: PropTypes.bool.isRequired
};

export default UnitModals;
