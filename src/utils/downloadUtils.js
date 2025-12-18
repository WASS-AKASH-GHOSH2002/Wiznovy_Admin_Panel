import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper functions
const generatePDF = (title, columns, rows, filename) => {
  try {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 30,
    });

    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

const generateExcel = (data, sheetName, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
};

const generateCSV = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const exportUsersToPDF = (users) => {
  const columns = ['Name', 'Email', 'Phone', 'Status', 'Created Date'];
  const rows = users.map(user => [
    user.userDetail?.name || 'N/A',
    user.email || 'N/A',
    user.phoneNumber || 'N/A',
    user.status || 'N/A',
    new Date(user.createdAt).toLocaleDateString()
  ]);
  
  generatePDF('Users Report', columns, rows, 'users-report.pdf');
};


export const exportUsersToExcel = (users) => {
  const data = users.map(user => ({
    'Name': user.name || 'N/A',
    'Email': user.email || 'N/A',
    'Phone': user.phoneNumber || 'N/A',
    'Status': user.status || 'N/A',
    'Created Date': new Date(user.createdAt).toLocaleDateString()
  }));
  
  generateExcel(data, 'Users', 'users-report.xlsx');
};


export const exportUsersToCSV = (users) => {
  const data = users.map(user => ({
    'Name': user.userDetail?.name || 'N/A',
    'Email': user.email || 'N/A',
    'Phone': user.phoneNumber || 'N/A',
    'Status': user.status || 'N/A',
    'Created Date': new Date(user.createdAt).toLocaleDateString()
  }));
  
  generateCSV(data, 'users-report.csv');
};


export const exportTutorsToPDF = (tutors) => {
  const columns = ['Tutor ID', 'Name', 'Email', 'Phone', 'Rating', 'Status', 'Created Date'];
  const rows = tutors.map(tutor => [
    tutor.tutorDetail?.tutorId || 'N/A',
    tutor.tutorDetail?.name || 'N/A',
    tutor.email || 'N/A',
    tutor.phoneNumber || 'N/A',
    tutor.tutorDetail?.averageRating || '0.00',
    tutor.status || 'N/A',
    new Date(tutor.createdAt).toLocaleDateString()
  ]);
  
  generatePDF('Tutors Report', columns, rows, 'tutors-report.pdf');
};


export const exportTutorsToExcel = (tutors) => {
  const data = tutors.map(tutor => ({
    'Tutor ID': tutor.tutorDetail?.tutorId || 'N/A',
    'Name': tutor.tutorDetail?.name || 'N/A',
    'Email': tutor.email || 'N/A',
    'Phone': tutor.phoneNumber || 'N/A',
    'Gender': tutor.tutorDetail?.gender || 'N/A',
    'Rating': tutor.tutorDetail?.averageRating || '0.00',
    'Hourly Rate': tutor.tutorDetail?.hourlyRate || '0.00',
    'Status': tutor.status || 'N/A',
    'Created Date': new Date(tutor.createdAt).toLocaleDateString()
  }));
  
  generateExcel(data, 'Tutors', 'tutors-report.xlsx');
};


export const exportTutorsToCSV = (tutors) => {
  const data = tutors.map(tutor => ({
    'Tutor ID': tutor.tutorDetail?.tutorId || 'N/A',
    'Name': tutor.tutorDetail?.name || 'N/A',
    'Email': tutor.email || 'N/A',
    'Phone': tutor.phoneNumber || 'N/A',
    'Gender': tutor.tutorDetail?.gender || 'N/A',
    'Rating': tutor.tutorDetail?.averageRating || '0.00',
    'Hourly Rate': tutor.tutorDetail?.hourlyRate || '0.00',
    'Status': tutor.status || 'N/A',
    'Created Date': new Date(tutor.createdAt).toLocaleDateString()
  }));
  
  generateCSV(data, 'tutors-report.csv');
};