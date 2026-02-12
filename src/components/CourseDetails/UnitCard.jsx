import React from 'react';
import PropTypes from 'prop-types';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const UnitCard = ({ 
  unit, 
  expandedUnits, 
  handleToggleUnit, 
  handleEditUnit, 
  handleStatusUpdate, 
  handleUnitImageUpload, 
  normalizeUrl,
  children 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="bg-blue-50 p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex gap-3 flex-1">
            <div className="flex-shrink-0 relative group">
              {unit.imgUrl ? (
                <img
                  src={normalizeUrl(unit.imgUrl)}
                  alt={unit.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-gray-200"
                  onError={(e) => {
                    e.target.src = '/src/assets/default-unit.svg';
                  }}
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <label 
                className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                htmlFor={`unit-image-${unit.id}`}
                aria-label="Upload unit image"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  id={`unit-image-${unit.id}`}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleUnitImageUpload(e, unit.id)}
                />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {unit.name}
              </h2>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{unit.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(unit.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleStatusUpdate(unit)}
                  className={(() => {
                    if (unit.status === 'ACTIVE') {
                      return 'px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 bg-green-100 text-green-800';
                    } else if (unit.status === 'PENDING') {
                      return 'px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 bg-yellow-100 text-yellow-800';
                    } else {
                      return 'px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 bg-gray-100 text-gray-800';
                    }
                  })()}
                >
                  {unit.status}
                </button>
                <button
                  onClick={() => handleEditUnit(unit)}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleToggleUnit(unit.id)}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-md border text-sm font-medium transition-colors self-start"
          >
            <span>Content</span>
            {expandedUnits[unit.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {expandedUnits[unit.id] && children}
    </div>
  );
};

UnitCard.propTypes = {
  unit: PropTypes.object.isRequired,
  expandedUnits: PropTypes.object.isRequired,
  handleToggleUnit: PropTypes.func.isRequired,
  handleEditUnit: PropTypes.func.isRequired,
  handleStatusUpdate: PropTypes.func.isRequired,
  handleUnitImageUpload: PropTypes.func.isRequired,
  normalizeUrl: PropTypes.func.isRequired,
  children: PropTypes.node
};

export default UnitCard;
