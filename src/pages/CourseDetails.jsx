import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, FileText, RefreshCw, Plus } from 'lucide-react';
import { 
  fetchCourseUnits, 
  fetchStudyMaterials, 
  fetchVideoLectures, 
  fetchVideoStudyMaterials,
  toggleUnit, 
  toggleMaterials, 
  toggleVideos,
  toggleVideoMaterials
} from '../store/courseDetailsSlice';
import { createUnit, updateUnit, updateUnitStatus, updateUnitImage } from '../store/unitSlice';
import { createVideoLecture, updateVideoLecture, updateVideoThumbnail, updateVideoFile } from '../store/videoLectureSlice';
import { createStudyMaterial, updateStudyMaterial, updateStudyMaterialPdf } from '../store/studyMaterialSlice';
import { toast } from 'react-toastify';
import FileUploadModal from '../components/FileUploadModal';
import { 
  UnitCard, 
  StudyMaterialsList, 
  VideoLecturesList, 
  UnitModals, 
  VideoModals, 
  StudyMaterialModals 
} from '../components/CourseDetails';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { units, courseName, loading, error, expandedUnits, expandedMaterials, expandedVideos, studyMaterials, materialsLoading, videoLectures, videosLoading, videoStudyMaterials, videoMaterialsLoading, expandedVideoMaterials } = useSelector(state => state.courseDetails);
  const { loading: unitLoading } = useSelector(state => state.units);
  const { loading: videoLoading } = useSelector(state => state.videoLecture);
  const { loading: studyMaterialLoading } = useSelector(state => state.studyMaterial);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [showUpdateThumbnailModal, setShowUpdateThumbnailModal] = useState(false);
  const [showUpdateVideoModal, setShowUpdateVideoModal] = useState(false);
  const [showStudyMaterialModal, setShowStudyMaterialModal] = useState(false);
  const [showVideoStudyMaterialModal, setShowVideoStudyMaterialModal] = useState(false);
  const [showEditStudyMaterialModal, setShowEditStudyMaterialModal] = useState(false);
  const [showUpdatePdfModal, setShowUpdatePdfModal] = useState(false);
  const [selectedStudyMaterial, setSelectedStudyMaterial] = useState(null);
  const [selectedEditStudyFile, setSelectedEditStudyFile] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedEditThumbnailFile, setSelectedEditThumbnailFile] = useState(null);
  const [editThumbnailPreview, setEditThumbnailPreview] = useState(null);
  const [selectedEditVideoFile, setSelectedEditVideoFile] = useState(null);
  const [editVideoPreview, setEditVideoPreview] = useState(null);

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    courseId: courseId,
    image:''
  });
  
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    duration: 0,
    unitId: ''
  });
  
  const [editVideoFormData, setEditVideoFormData] = useState({
    title: '',
    description: '',
    duration: 0
  });
  
  const [studyMaterialFormData, setStudyMaterialFormData] = useState({
    title: '',
    description: '',
    unitId: ''
  });
  
  const [videoStudyMaterialFormData, setVideoStudyMaterialFormData] = useState({
    title: '',
    description: '',
    videoLectureId: ''
  });
  
  const [selectedStudyFile, setSelectedStudyFile] = useState(null);
  const [selectedVideoStudyFile, setSelectedVideoStudyFile] = useState(null);

  useEffect(() => {
    dispatch(fetchCourseUnits(courseId));
  }, [dispatch, courseId]);

  const handleRefresh = () => {
    dispatch(fetchCourseUnits(courseId));
  };

  const handleToggleUnit = (unitId) => {
    
    dispatch(toggleUnit(unitId));
    
      dispatch(fetchStudyMaterials({ unitId }));
      dispatch(fetchVideoLectures({ unitId }));
  };

  const handleToggleMaterials = (unitId) => {
    dispatch(toggleMaterials(unitId));
    if (!studyMaterials[unitId]) {
      dispatch(fetchStudyMaterials({ unitId }));
    }
  };

  const handleToggleVideos = (unitId) => {
    dispatch(toggleVideos(unitId));
    if (!videoLectures[unitId]) {
      dispatch(fetchVideoLectures({ unitId }));
    }
  };

  const handleToggleVideoMaterials = (videoId) => {
    dispatch(toggleVideoMaterials(videoId));
    if (!videoStudyMaterials[videoId]) {
      dispatch(fetchVideoStudyMaterials({ videoLectureId: videoId }));
    }
  };

  const handleActionResult = (result, successMessage, onSuccess) => {
    if (result.type.endsWith('/fulfilled')) {
      toast.success(successMessage);
      onSuccess();
      dispatch(fetchCourseUnits(courseId));
    } else {
      const errorMessage = result.payload || result.error?.message || 'Unknown error';
      toast.error(`Failed: ${errorMessage}`);
    }
  };

  const normalizeUrl = (url) => {
    if (!url) return null;
    let normalized = url.replaceAll('\\', '/');
    return normalized.replaceAll('http:/', 'http://');
  };

  const handleFileAction = (material, action) => {
    if (material.fileUrl) {
      const normalizedUrl = normalizeUrl(material.fileUrl);
      console.log(`${action} URL:`, normalizedUrl);
      window.open(normalizedUrl, '_blank');
    } else {
      toast.error('File URL not available');
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('courseId', courseId);
    
    if (selectedFile) {
      submitData.append('image', selectedFile);
    }
    
    const result = await dispatch(createUnit(submitData));
    handleActionResult(result, 'Unit created successfully!', () => {
      setShowCreateModal(false);
      resetForm();
    });
  };

  const handleUpdateUnit = async (e) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      description: formData.description
    };
    
    const result = await dispatch(updateUnit({ id: selectedUnit.id, formData: updateData }));
    handleActionResult(result, 'Unit updated successfully!', () => {
      setShowEditModal(false);
      resetForm();
    });
  };

  const validateImageFile = (file) => {
    if (!file) return { isValid: false, error: 'No file selected' };
    if (!file.type.match('image.*')) return { isValid: false, error: 'Please select an image file' };
    if (file.size > 5 * 1024 * 1024) return { isValid: false, error: 'Image size should be less than 5MB' };
    return { isValid: true };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      if (validation.error !== 'No file selected') {
        toast.error(validation.error);
      }
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      courseId: courseId,
      image: ''
    });
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUnit = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      name: unit.name,
      description: unit.description,
      courseId: courseId
    });
    setShowEditModal(true);
  };

  const handleStatusUpdate = (unit) => {
    setSelectedUnit(unit);
    setShowStatusModal(true);
  };

  const updateStatus = async (status) => {
    const result = await dispatch(updateUnitStatus({ id: selectedUnit.id, status }));
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Unit status updated successfully!');
      setShowStatusModal(false);
      setSelectedUnit(null);
      dispatch(fetchCourseUnits(courseId));
    }
  };

  const handleUnitImageUpload = async (e, unitId) => {
    const file = e.target.files[0];
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      if (validation.error !== 'No file selected') {
        toast.error(validation.error);
      }
      return;
    }
    
    try {
      const result = await dispatch(updateUnitImage({ id: unitId, file }));
      handleActionResult(result, 'Unit image updated successfully!', () => {});
    } catch (error) {
      toast.error('Failed to update unit image: ' + error.message);
    }
  };

  const handleCreateVideo = (unitId) => {
    setVideoFormData(prev => ({ ...prev, unitId }));
    setShowVideoModal(true);
  };
  
  const handleCreateStudyMaterial = (unitId) => {
    setStudyMaterialFormData(prev => ({ ...prev, unitId }));
    setShowStudyMaterialModal(true);
  };
  
  const handleCreateVideoStudyMaterial = (videoId) => {
    setVideoStudyMaterialFormData(prev => ({ ...prev, videoLectureId: videoId }));
    setShowVideoStudyMaterialModal(true);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', videoFormData.title);
    submitData.append('description', videoFormData.description);
    submitData.append('duration', videoFormData.duration);
    submitData.append('unitId', videoFormData.unitId);
    
    if (selectedVideoFile) {
      submitData.append('video', selectedVideoFile);
    }
    if (selectedThumbnailFile) {
      submitData.append('thumbnail', selectedThumbnailFile);
    }
    
    const result = await dispatch(createVideoLecture(submitData));
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Video lecture created successfully!');
      setShowVideoModal(false);
      resetVideoForm();
      dispatch(fetchVideoLectures({ unitId: videoFormData.unitId }));
      dispatch(fetchCourseUnits(courseId));
    }
  };

  const handleVideoFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('video.*')) {
      toast.error('Please select a video file');
      return;
    }
    
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video size should be less than 500MB');
      return;
    }
    
    setSelectedVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }
    
    setSelectedThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbnailPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const resetVideoForm = () => {
    setVideoFormData({
      title: '',
      description: '',
      duration: 0,
      unitId: ''
    });
    setSelectedVideoFile(null);
    setSelectedThumbnailFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };
  
  const resetStudyMaterialForm = () => {
    setStudyMaterialFormData({
      title: '',
      description: '',
      unitId: ''
    });
    setSelectedStudyFile(null);
  };
  
  const resetVideoStudyMaterialForm = () => {
    setVideoStudyMaterialFormData({
      title: '',
      description: '',
      videoLectureId: ''
    });
    setSelectedVideoStudyFile(null);
  };

  const handleVideoInputChange = (e) => {
    const { name, value } = e.target;
    setVideoFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditVideoInputChange = (e) => {
    const { name, value } = e.target;
    setEditVideoFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEditVideo = (video) => {
    setSelectedVideo(video);
    setEditVideoFormData({
      title: video.title,
      description: video.description,
      duration: video.duration
    });
    setShowEditVideoModal(true);
  };
  
  const handleEditVideoSubmit = async (e) => {
    e.preventDefault();
    
    const updateData = {
      title: editVideoFormData.title,
      description: editVideoFormData.description,
      duration: parseInt(editVideoFormData.duration)
    };
    
    const unitId = selectedVideo.unitId;
    const result = await dispatch(updateVideoLecture({ id: selectedVideo.id, formData: updateData }));
     handleToggleUnit(result?.payload?.unitId );
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Video lecture updated successfully!');
       handleToggleUnit(result?.payload?.unitId );
      setShowEditVideoModal(false);
      setSelectedVideo(null);
      await dispatch(fetchVideoLectures({ unitId }));
    } else {
      toast.error('Failed to update video lecture: ' + (result.payload || result.error?.message || 'Unknown error'));
    }
  };
  
  const handleUpdateThumbnailClick = (video) => {
    setSelectedVideo(video);
    setShowUpdateThumbnailModal(true);
  };
  
  const handleUpdateThumbnail = async (e) => {
    e.preventDefault();
    
    if (!selectedEditThumbnailFile) {
      toast.error('Please select a thumbnail file');
      return;
    }
    
    const unitId = selectedVideo.unitId;
    const result = await dispatch(updateVideoThumbnail({ id: selectedVideo.id, file: selectedEditThumbnailFile }));
     handleToggleUnit(result?.payload?.unitId );
     handleToggleUnit(result?.payload?.unitId );
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Thumbnail updated successfully!');
       handleToggleUnit(result?.payload?.unitId );
       handleToggleUnit(result?.payload?.unitId );
      setShowUpdateThumbnailModal(false);
      setSelectedVideo(null);
      setSelectedEditThumbnailFile(null);
      setEditThumbnailPreview(null);
      await dispatch(fetchVideoLectures({ unitId }));
    } else {
      toast.error('Failed to update thumbnail: ' + (result.payload || result.error?.message || 'Unknown error'));
    }
  };
  
  const handleUpdateVideoClick = (video) => {
    setSelectedVideo(video);
    setShowUpdateVideoModal(true);
  };
  
  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    
    if (!selectedEditVideoFile) {
      toast.error('Please select a video file');
      return;
    }
    
    const unitId = selectedVideo.unitId;
    const result = await dispatch(updateVideoFile({ id: selectedVideo.id, file: selectedEditVideoFile }));
     handleToggleUnit(result?.payload?.unitId );
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Video updated successfully!');
       handleToggleUnit(result?.payload?.unitId );
      setShowUpdateVideoModal(false);
      setSelectedVideo(null);
      setSelectedEditVideoFile(null);
      setEditVideoPreview(null);
      await dispatch(fetchVideoLectures({ unitId }));
    } else {
      toast.error('Failed to update video: ' + (result.payload || result.error?.message || 'Unknown error'));
    }
  };
  
  const handleStudyMaterialInputChange = (e) => {
    const { name, value } = e.target;
    setStudyMaterialFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleStudyFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedStudyFile(file);
  };
  
  const handleStudyMaterialSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', studyMaterialFormData.title);
    submitData.append('description', studyMaterialFormData.description);
    submitData.append('unitId', studyMaterialFormData.unitId);
    
    if (selectedStudyFile) {
      submitData.append('pdf', selectedStudyFile);
    }
    
    const result = await dispatch(createStudyMaterial(submitData));
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Study material created successfully!');
      setShowStudyMaterialModal(false);
      resetStudyMaterialForm();
      dispatch(fetchStudyMaterials({ unitId: studyMaterialFormData.unitId }));
      dispatch(fetchCourseUnits(courseId));
    } else {
      toast.error('Failed to create study material: ' + (result.payload || result.error?.message || 'Unknown error'));
    }
  };
  
  const handleVideoStudyMaterialSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', videoStudyMaterialFormData.title);
    submitData.append('description', videoStudyMaterialFormData.description);
    submitData.append('videoLectureId', videoStudyMaterialFormData.videoLectureId);
    
    if (selectedVideoStudyFile) {
      submitData.append('pdf', selectedVideoStudyFile);
    }
    
    const result = await dispatch(createStudyMaterial(submitData));
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Video study material created successfully!');
      setShowVideoStudyMaterialModal(false);
      resetVideoStudyMaterialForm();
      dispatch(fetchVideoStudyMaterials({ videoLectureId: videoStudyMaterialFormData.videoLectureId }));
      dispatch(fetchCourseUnits(courseId));
    } else {
      toast.error('Failed to create video study material: ' + (result.payload || result.error?.message || 'Unknown error'));
    }
  };
  
  const handleVideoStudyMaterialInputChange = (e) => {
    const { name, value } = e.target;
    setVideoStudyMaterialFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleVideoStudyFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedVideoStudyFile(file);
  };
  
  const handleEditStudyMaterial = async (e) => {
    e.preventDefault();
    
    const updateData = {
      title: selectedStudyMaterial.title,
      description: selectedStudyMaterial.description
    };
    
    const unitId = selectedStudyMaterial.unitId;
    const videoLectureId = selectedStudyMaterial.videoLectureId;
    
    const result = await dispatch(updateStudyMaterial({ id: selectedStudyMaterial.id, formData: updateData }));
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('Study material updated successfully!');
      
      if (unitId) {
        await dispatch(fetchStudyMaterials({ unitId }));
      } else if (videoLectureId) {
        await dispatch(fetchVideoStudyMaterials({ videoLectureId }));
      }
      
      setShowEditStudyMaterialModal(false);
      setSelectedStudyMaterial(null);
    } else {
      toast.error('Failed to update study material: ' + (result.payload || result.error?.message || 'Unknown error'));
    }
  };
  
  const handleUpdatePdf = async (e) => {
    e.preventDefault();
    
    if (!selectedEditStudyFile) {
      toast.error('Please select a PDF file');
      return;
    }
    
    const unitId = selectedStudyMaterial.unitId;
    const videoLectureId = selectedStudyMaterial.videoLectureId;
    const materialId = selectedStudyMaterial.id;
    
    const result = await dispatch(updateStudyMaterialPdf({ id: materialId, file: selectedEditStudyFile }));
    
    if (result.type.endsWith('/fulfilled')) {
      toast.success('PDF updated successfully!');
      
      if (unitId) {
        await dispatch(fetchStudyMaterials({ unitId }));
      } else if (videoLectureId) {
        await dispatch(fetchVideoStudyMaterials({ videoLectureId }));
      }
      
      setShowUpdatePdfModal(false);
      setSelectedStudyMaterial(null);
      setSelectedEditStudyFile(null);
    } else {
      toast.error('Failed to update PDF: ' + (result.payload || result.error?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/courses/show')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate('/courses/show')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 self-start"
            >
              <ArrowLeft size={18} />
              <span className="text-sm sm:text-base">Back to Courses</span>
            </button>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{courseName}</h1>
                <p className="text-sm text-gray-600">Course Units</p>
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleRefresh}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <RefreshCw size={18} /> Refresh
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Plus size={18} /> Create Unit
                </button>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {units.length} Units
                </div>
              </div>
            </div>
          </div>
        </div>

        {units.length > 0 ? (
          <div className="space-y-4">
            {units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                expandedUnits={expandedUnits}
                handleToggleUnit={handleToggleUnit}
                handleEditUnit={handleEditUnit}
                handleStatusUpdate={handleStatusUpdate}
                handleUnitImageUpload={handleUnitImageUpload}
                normalizeUrl={normalizeUrl}
              >
                <div className="p-4 space-y-3">
                  <StudyMaterialsList
                    unitId={unit.id}
                    expandedMaterials={expandedMaterials}
                    studyMaterials={studyMaterials}
                    materialsLoading={materialsLoading}
                    handleToggleMaterials={handleToggleMaterials}
                    handleCreateStudyMaterial={handleCreateStudyMaterial}
                    handleFileAction={handleFileAction}
                    setSelectedStudyMaterial={setSelectedStudyMaterial}
                    setShowEditStudyMaterialModal={setShowEditStudyMaterialModal}
                    setShowUpdatePdfModal={setShowUpdatePdfModal}
                  />
                  
                  <VideoLecturesList
                    unitId={unit.id}
                    expandedVideos={expandedVideos}
                    videoLectures={videoLectures}
                    videosLoading={videosLoading}
                    expandedVideoMaterials={expandedVideoMaterials}
                    videoStudyMaterials={videoStudyMaterials}
                    videoMaterialsLoading={videoMaterialsLoading}
                    handleToggleVideos={handleToggleVideos}
                    handleCreateVideo={handleCreateVideo}
                    handleToggleVideoMaterials={handleToggleVideoMaterials}
                    handleCreateVideoStudyMaterial={handleCreateVideoStudyMaterial}
                    handleFileAction={handleFileAction}
                    normalizeUrl={normalizeUrl}
                    setSelectedStudyMaterial={setSelectedStudyMaterial}
                    setShowEditStudyMaterialModal={setShowEditStudyMaterialModal}
                    setShowUpdatePdfModal={setShowUpdatePdfModal}
                    handleEditVideo={handleEditVideo}
                    handleUpdateThumbnailClick={handleUpdateThumbnailClick}
                    handleUpdateVideoClick={handleUpdateVideoClick}
                  />
                </div>
              </UnitCard>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">No Units Found</h3>
            <p className="text-sm sm:text-base text-gray-600">This course doesn't have any units yet.</p>
          </div>
        )}
      </div>

      <UnitModals
        showCreateModal={showCreateModal}
        showEditModal={showEditModal}
        showStatusModal={showStatusModal}
        setShowCreateModal={setShowCreateModal}
        setShowEditModal={setShowEditModal}
        setShowStatusModal={setShowStatusModal}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        formData={formData}
        handleInputChange={handleInputChange}
        handleCreateUnit={handleCreateUnit}
        handleUpdateUnit={handleUpdateUnit}
        updateStatus={updateStatus}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        handleImageUpload={handleImageUpload}
        fileInputRef={fileInputRef}
        resetForm={resetForm}
        unitLoading={unitLoading}
      />

      <VideoModals
        showVideoModal={showVideoModal}
        setShowVideoModal={setShowVideoModal}
        videoFormData={videoFormData}
        handleVideoInputChange={handleVideoInputChange}
        handleVideoSubmit={handleVideoSubmit}
        videoPreview={videoPreview}
        setVideoPreview={setVideoPreview}
        thumbnailPreview={thumbnailPreview}
        setThumbnailPreview={setThumbnailPreview}
        selectedVideoFile={selectedVideoFile}
        setSelectedVideoFile={setSelectedVideoFile}
        selectedThumbnailFile={selectedThumbnailFile}
        setSelectedThumbnailFile={setSelectedThumbnailFile}
        handleVideoFileUpload={handleVideoFileUpload}
        handleThumbnailUpload={handleThumbnailUpload}
        videoInputRef={videoInputRef}
        thumbnailInputRef={thumbnailInputRef}
        resetVideoForm={resetVideoForm}
        videoLoading={videoLoading}
        showEditVideoModal={showEditVideoModal}
        setShowEditVideoModal={setShowEditVideoModal}
        editVideoFormData={editVideoFormData}
        handleEditVideoInputChange={handleEditVideoInputChange}
        handleEditVideoSubmit={handleEditVideoSubmit}
      />

      <StudyMaterialModals
        showStudyMaterialModal={showStudyMaterialModal}
        showVideoStudyMaterialModal={showVideoStudyMaterialModal}
        showEditStudyMaterialModal={showEditStudyMaterialModal}
        showUpdatePdfModal={showUpdatePdfModal}
        setShowStudyMaterialModal={setShowStudyMaterialModal}
        setShowVideoStudyMaterialModal={setShowVideoStudyMaterialModal}
        setShowEditStudyMaterialModal={setShowEditStudyMaterialModal}
        setShowUpdatePdfModal={setShowUpdatePdfModal}
        studyMaterialFormData={studyMaterialFormData}
        videoStudyMaterialFormData={videoStudyMaterialFormData}
        selectedStudyMaterial={selectedStudyMaterial}
        setSelectedStudyMaterial={setSelectedStudyMaterial}
        selectedStudyFile={selectedStudyFile}
        selectedVideoStudyFile={selectedVideoStudyFile}
        selectedEditStudyFile={selectedEditStudyFile}
        setSelectedEditStudyFile={setSelectedEditStudyFile}
        handleStudyMaterialInputChange={handleStudyMaterialInputChange}
        handleVideoStudyMaterialInputChange={handleVideoStudyMaterialInputChange}
        handleStudyFileUpload={handleStudyFileUpload}
        handleVideoStudyFileUpload={handleVideoStudyFileUpload}
        handleStudyMaterialSubmit={handleStudyMaterialSubmit}
        handleVideoStudyMaterialSubmit={handleVideoStudyMaterialSubmit}
        handleEditStudyMaterial={handleEditStudyMaterial}
        handleUpdatePdf={handleUpdatePdf}
        resetStudyMaterialForm={resetStudyMaterialForm}
        resetVideoStudyMaterialForm={resetVideoStudyMaterialForm}
        studyMaterialLoading={studyMaterialLoading}
      />

      <FileUploadModal
        show={showUpdateThumbnailModal}
        onClose={() => {
          setShowUpdateThumbnailModal(false);
          setSelectedVideo(null);
          setSelectedEditThumbnailFile(null);
          setEditThumbnailPreview(null);
        }}
        onSubmit={handleUpdateThumbnail}
        title="Update Thumbnail"
        filePreview={editThumbnailPreview}
        setFilePreview={setEditThumbnailPreview}
        selectedFile={selectedEditThumbnailFile}
        setSelectedFile={setSelectedEditThumbnailFile}
        accept="image/*"
        loading={videoLoading}
        buttonText="Update Thumbnail"
        previewType="image"
      />

      <FileUploadModal
        show={showUpdateVideoModal}
        onClose={() => {
          setShowUpdateVideoModal(false);
          setSelectedVideo(null);
          setSelectedEditVideoFile(null);
          setEditVideoPreview(null);
        }}
        onSubmit={handleUpdateVideo}
        title="Update Video"
        filePreview={editVideoPreview}
        setFilePreview={setEditVideoPreview}
        selectedFile={selectedEditVideoFile}
        setSelectedFile={setSelectedEditVideoFile}
        accept="video/*"
        loading={videoLoading}
        buttonText="Update Video"
        previewType="file"
      />
    </div>
  );
};

export default CourseDetails;
