import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Eye } from "lucide-react";
import { fetchContacts, fetchContactDetails } from "../store/contactSlice";
import Modal from '../components/Modal';

const ContactUs = () => {
  const dispatch = useDispatch();
  const { contacts, total, loading, error, selectedContact, detailsLoading } = useSelector(state => state.contacts);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    dispatch(fetchContacts({ limit: itemsPerPage, offset }));
  }, [dispatch, currentPage, itemsPerPage]);

  const handleRefresh = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    dispatch(fetchContacts({ limit: itemsPerPage, offset }));
  };

  const handleViewDetails = async (contact) => {
    setShowDetailsModal(true);
    await dispatch(fetchContactDetails(contact.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-12 w-12 mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading contacts...</p>
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
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Contact Us Management
          </h2>
          <button 
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        <p className="text-gray-600 mb-6">Total Contacts: {total}</p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-4 text-left">First Name</th>
                <th className="p-4 text-left">Last Name</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Phone Number</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Message</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => (
                <tr key={contact.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-4">{contact.firstName}</td>
                  <td className="p-4">{contact.lastName || '-'}</td>
                  <td className="p-4">{contact.email}</td>
                  <td className="p-4">{contact.phoneNumber}</td>
                  <td className="p-4">{contact.category?.title || '-'}</td>
                  <td className="p-4">
                    <div className="max-w-xs truncate">{contact.message}</div>
                  </td>
                  <td className="p-4">{new Date(contact.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleViewDetails(contact)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-4 justify-between">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 px-2 py-1 rounded text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} contacts
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-gray-100 rounded">
                Page {currentPage} of {Math.ceil(total / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= Math.ceil(total / itemsPerPage)}
                className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <Modal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)}
          title="Contact Details"
          maxWidth="max-w-lg"
          position="center"
        >
          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : selectedContact ? (
            <>
              <div className="space-y-3 text-left">
                <p><strong>Contact ID:</strong> {selectedContact.id}</p>
                <p><strong>First Name:</strong> {selectedContact.firstName}</p>
                <p><strong>Last Name:</strong> {selectedContact.lastName || '-'}</p>
                <p><strong>Email:</strong> {selectedContact.email}</p>
                <p><strong>Phone:</strong> {selectedContact.phoneNumber}</p>
                <p><strong>Category:</strong> {selectedContact.category?.title || '-'}</p>
                <p><strong>Category Status:</strong> {selectedContact.category?.status || '-'}</p>
                <p><strong>Message:</strong></p>
                <p className="bg-gray-50 p-3 rounded">{selectedContact.message}</p>
                <p><strong>Created:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </>
          ) : (
            <p className="text-center text-gray-500 py-4">No contact details available</p>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ContactUs;
