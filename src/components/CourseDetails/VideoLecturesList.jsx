import React from 'react';
import PropTypes from 'prop-types';
import { Play, ChevronDown, ChevronUp, FileText, Download, Eye, Plus, RefreshCw, Edit, Image } from 'lucide-react';

const VideoLecturesList = ({
  unitId,
  expandedVideos,
  videoLectures,
  videosLoading,
  expandedVideoMaterials,
  videoStudyMaterials,
  videoMaterialsLoading,
  handleToggleVideos,
  handleCreateVideo,
  handleToggleVideoMaterials,
  handleCreateVideoStudyMaterial,
  handleFileAction,
  normalizeUrl,
  setSelectedStudyMaterial,
  setShowEditStudyMaterialModal,
  setShowUpdatePdfModal,
  handleEditVideo,
  handleUpdateThumbnailClick
}) => {
  return (
    <div className="border rounded-md">
      <button
        onClick={() => handleToggleVideos(unitId)}
        className="w-full bg-red-50 p-3 flex items-center justify-between hover:bg-red-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Play size={18} className="text-red-600" />
          <span className="font-medium text-gray-800">Video Lectures</span>
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
            {videoLectures[unitId]?.length || 0}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCreateVideo(unitId);
            }}
            className="ml-2 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
          >
            <Plus size={12} />
          </button>
        </div>
        {expandedVideos[unitId] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedVideos[unitId] && (
        <div className="p-3 space-y-2">
          {videosLoading[unitId] ? (
            <div className="text-center py-4">
              <RefreshCw className="animate-spin h-6 w-6 mx-auto text-red-500" />
              <p className="text-sm text-gray-600 mt-2">Loading videos...</p>
            </div>
          ) : videoLectures[unitId]?.length > 0 ? (
            videoLectures[unitId].map((video) => (
              <div key={video.id} className="border rounded-md mb-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-t-md">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <img
                        src={normalizeUrl(video.thumbnailUrl)}
                        alt={video.title}
                        className="w-12 h-8 rounded object-cover bg-gray-200"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-800 truncate">{video.title}</p>
                      <p className="text-xs text-gray-600 truncate">{video.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Duration: {video.duration} min</span>
                        <span>•</span>
                        <span>Unit: {video.unit?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button 
                      onClick={() => handleEditVideo(video)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit Video"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleUpdateThumbnailClick(video)}
                      className="p-1.5 text-orange-600 hover:bg-orange-100 rounded"
                      title="Update Thumbnail"
                    >
                      <Image size={14} />
                    </button>
                    {video.videoUrl && (
                      <button 
                        onClick={() => window.open(normalizeUrl(video.videoUrl), '_blank')}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                        title="Play Video"
                      >
                        <Play size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => window.open(normalizeUrl(video.thumbnailUrl), '_blank')}
                      className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                      title="View Thumbnail"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleToggleVideoMaterials(video.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                      title="Study Materials"
                    >
                      <FileText size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateVideoStudyMaterial(video.id);
                      }}
                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded"
                      title="Add Study Material"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                {expandedVideoMaterials[video.id] && (
                  <div className="p-3 bg-white border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-blue-600" />
                      <span className="font-medium text-sm text-gray-800">Study Materials</span>
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {videoStudyMaterials[video.id]?.length || 0}
                      </span>
                    </div>
                    {videoMaterialsLoading[video.id] ? (
                      <div className="text-center py-2">
                        <RefreshCw className="animate-spin h-4 w-4 mx-auto text-blue-500" />
                        <p className="text-xs text-gray-600 mt-1">Loading materials...</p>
                      </div>
                    ) : videoStudyMaterials[video.id]?.length > 0 ? (
                      <div className="space-y-1">
                        {videoStudyMaterials[video.id].map((material) => (
                          <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText size={12} className="text-gray-600 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-xs text-gray-800 truncate">{material.title}</p>
                                <p className="text-xs text-gray-600 truncate">{material.description}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button 
                                onClick={() => {
                                  setSelectedStudyMaterial({ ...material, videoLectureId: video.id });
                                  setShowEditStudyMaterialModal(true);
                                }}
                                className="p-1 text-purple-600 hover:bg-purple-100 rounded border border-purple-200"
                                title="Edit Text"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedStudyMaterial({ ...material, videoLectureId: video.id });
                                  setShowUpdatePdfModal(true);
                                }}
                                className="p-1 text-orange-600 hover:bg-orange-100 rounded border border-orange-200 bg-orange-50"
                                title="Update PDF"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleFileAction(material, 'Video Material Download')}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Download"
                              >
                                <Download size={12} />
                              </button>
                              <button 
                                onClick={() => handleFileAction(material, 'Video Material View')}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                title="View"
                              >
                                <Eye size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-500">
                        <FileText size={16} className="mx-auto mb-1 text-gray-300" />
                        <p className="text-xs">No study materials found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Play size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No video lectures found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

VideoLecturesList.propTypes = {
  unitId: PropTypes.string.isRequired,
  expandedVideos: PropTypes.object.isRequired,
  videoLectures: PropTypes.object.isRequired,
  videosLoading: PropTypes.object.isRequired,
  expandedVideoMaterials: PropTypes.object.isRequired,
  videoStudyMaterials: PropTypes.object.isRequired,
  videoMaterialsLoading: PropTypes.object.isRequired,
  handleToggleVideos: PropTypes.func.isRequired,
  handleCreateVideo: PropTypes.func.isRequired,
  handleToggleVideoMaterials: PropTypes.func.isRequired,
  handleCreateVideoStudyMaterial: PropTypes.func.isRequired,
  handleFileAction: PropTypes.func.isRequired,
  normalizeUrl: PropTypes.func.isRequired,
  setSelectedStudyMaterial: PropTypes.func.isRequired,
  setShowEditStudyMaterialModal: PropTypes.func.isRequired,
  setShowUpdatePdfModal: PropTypes.func.isRequired,
  handleEditVideo: PropTypes.func.isRequired,
  handleUpdateThumbnailClick: PropTypes.func.isRequired
};

export default VideoLecturesList;
