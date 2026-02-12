import React from 'react';
import PropTypes from 'prop-types';
import { BookOpen, ChevronDown, ChevronUp, FileText, Download, Eye, Plus, RefreshCw } from 'lucide-react';

const StudyMaterialsList = ({
  unitId,
  expandedMaterials,
  studyMaterials,
  materialsLoading,
  handleToggleMaterials,
  handleCreateStudyMaterial,
  handleFileAction,
  setSelectedStudyMaterial,
  setShowEditStudyMaterialModal,
  setShowUpdatePdfModal
}) => {
  return (
    <div className="border rounded-md">
      <button
        onClick={() => handleToggleMaterials(unitId)}
        className="w-full bg-blue-50 p-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-blue-600" />
          <span className="font-medium text-gray-800">Study Materials</span>
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
            {studyMaterials[unitId]?.length || 0}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCreateStudyMaterial(unitId);
            }}
            className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
          >
            <Plus size={12} />
          </button>
        </div>
        {expandedMaterials[unitId] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedMaterials[unitId] && (
        <div className="p-3 space-y-2">
          {materialsLoading[unitId] ? (
            <div className="text-center py-4">
              <RefreshCw className="animate-spin h-6 w-6 mx-auto text-blue-500" />
              <p className="text-sm text-gray-600 mt-2">Loading materials...</p>
            </div>
          ) : studyMaterials[unitId]?.length > 0 ? (
            studyMaterials[unitId].map((material) => (
              <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText size={14} className="text-gray-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-800 truncate">{material.title}</p>
                    <p className="text-xs text-gray-600 truncate">{material.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={() => {
                      setSelectedStudyMaterial(material);
                      setShowEditStudyMaterialModal(true);
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-md border border-purple-200"
                    title="Edit Text"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedStudyMaterial(material);
                      setShowUpdatePdfModal(true);
                    }}
                    className="p-2 text-orange-600 hover:bg-orange-100 rounded-md border border-orange-200 bg-orange-50"
                    title="Update PDF"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleFileAction(material, 'Download')}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-md border border-blue-200"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => handleFileAction(material, 'View')}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-md border border-green-200"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <FileText size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No study materials found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

StudyMaterialsList.propTypes = {
  unitId: PropTypes.string.isRequired,
  expandedMaterials: PropTypes.object.isRequired,
  studyMaterials: PropTypes.object.isRequired,
  materialsLoading: PropTypes.object.isRequired,
  handleToggleMaterials: PropTypes.func.isRequired,
  handleCreateStudyMaterial: PropTypes.func.isRequired,
  handleFileAction: PropTypes.func.isRequired,
  setSelectedStudyMaterial: PropTypes.func.isRequired,
  setShowEditStudyMaterialModal: PropTypes.func.isRequired,
  setShowUpdatePdfModal: PropTypes.func.isRequired
};

export default StudyMaterialsList;
