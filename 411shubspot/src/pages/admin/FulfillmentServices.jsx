import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import { format } from 'date-fns';

export default function FulfillmentServices() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [formData, setFormData] = useState({
    author_name: '',
    service_type: '',
    book_name: '',
    notes: '',
    fulfillment_status: '',
    fulfillment_date: ''
  });
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [activeServiceFilter, setActiveServiceFilter] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // All service types
  const serviceTypes = [
    'Book Video',
    'Screenplay',
    'Republication',
    'LA Times',
    "SEO",
    'Publication',
    'Website',
    'Kate Delaney',
    'Audiobook',
    'New York Times',
    'Billboard',
    'Press Release',
    'Graphic Design',
    'Animation',
    'Coverage',
    'Treatment',
    'Query Letter',
    'Synopsis',
    'Outline',
    'Pitch Sheet',
    'IMDB',
    'Facebook Boost',
    'Instagram Boost',
    'TikTok Boost',
    'YouTube Boost',
    'Book Signing',
    'Book fair',
    'Traditional Publishing',
    'Account Creation',
    'book distribution',
    'website hosting',
    ' website maintenance',
    'Editorial',
    'Book Display'
  ];

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/fulfillment_services`);
      setServices(res.data);
      setFilteredServices(res.data);

      const years = [...new Set(
        res.data
          .map(service => {
            if (service.fulfillment_date) {
              return new Date(service.fulfillment_date).getFullYear();
            }
            return null;
          })
          .filter(year => year !== null)
      )].sort((a, b) => b - a);
      setAvailableYears(years);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedYear, selectedMonth, services, activeServiceFilter]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const applyFilters = () => {
    let filtered = [...services];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.author_name?.toLowerCase().includes(term) ||
        service.book_name?.toLowerCase().includes(term) ||
        service.service_type?.toLowerCase().includes(term) ||
        service.notes?.toLowerCase().includes(term)
      );
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(service => {
        if (!service.fulfillment_date) return false;
        const year = new Date(service.fulfillment_date).getFullYear();
        return year.toString() === selectedYear;
      });
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(service => {
        if (!service.fulfillment_date) return false;
        const month = new Date(service.fulfillment_date).getMonth() + 1;
        return month.toString() === selectedMonth;
      });
    }

    if (activeServiceFilter !== 'all') {
      filtered = filtered.filter(service => 
        service.service_type === activeServiceFilter
      );
    }

    setFilteredServices(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedYear('all');
    setSelectedMonth('all');
    setActiveServiceFilter('all');
    setCurrentPage(1);
  };

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editing !== null) {
        await axios.put(`${API_URL}/api/fulfillment_services/${editing}`, formData);
      } else {
        await axios.post(`${API_URL}/api/fulfillment_services`, formData);
      }
      setFormData({
        author_name: '',
        service_type: '',
        book_name: '',
        notes: '',
        fulfillment_status: '',
        fulfillment_date: ''
      });
      setEditing(null);
      setShowModal(false);
      fetchServices();
    } catch (err) {
      console.error('Error saving:', err.response?.data || err.message);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (service) => {
    // Format the date for the input field (YYYY-MM-DD)
    let formattedDate = '';
    if (service.fulfillment_date) {
      const date = new Date(service.fulfillment_date);
      formattedDate = date.toISOString().split('T')[0];
    }
    
    setFormData({
      author_name: service.author_name || '',
      service_type: service.service_type || '',
      book_name: service.book_name || '',
      notes: service.notes || '',
      fulfillment_status: service.fulfillment_status || '',
      fulfillment_date: formattedDate
    });
    setEditing(service.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`${API_URL}/api/fulfillment_services/${id}`);
        fetchServices();
      } catch (err) {
        console.error('Delete error:', err.response?.data || err.message);
        alert('Error deleting: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Fulfilled': 
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'In Progress': 
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Pending': 
        return 'bg-red-100 text-red-800 border border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({
      author_name: '',
      service_type: '',
      book_name: '',
      notes: '',
      fulfillment_status: '',
      fulfillment_date: ''
    });
  };

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-center mb-4 sm:mb-0">
          <span className="text-sm text-gray-700 mr-4">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredServices.length)}
            </span> of{' '}
            <span className="font-medium">{filteredServices.length}</span> results
          </span>
          
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md py-1 px-2 text-sm"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            First
          </button>
          
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Previous
          </button>
          
          {startPage > 1 && (
            <span className="px-3 py-1 text-gray-500">...</span>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentPage === number
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <span className="px-3 py-1 text-gray-500">...</span>
          )}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Next
          </button>
          
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-screen mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl shadow-md">
            <span className="text-white text-2xl">🚀</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Fulfillment Services</h2>
            <p className="text-gray-500 mt-1">Manage all author services in one place</p>
          </div>
        </div>
        
        <button 
          onClick={() => {
            setFormData({
              author_name: '',
              service_type: '',
              book_name: '',
              notes: '',
              fulfillment_status: '',
              fulfillment_date: ''
            });
            setEditing(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:from-indigo-700 hover:to-purple-700 inline-flex items-center gap-2 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add New Service
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm font-medium">Total Services</h3>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-3">{services.length}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm font-medium">Fulfilled</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-3">
            {services.filter(s => s.fulfillment_status === 'Fulfilled').length}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-3">
            {services.filter(s => s.fulfillment_status === 'In Progress').length}
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
            <div className="bg-red-100 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-3">
            {services.filter(s => s.fulfillment_status === 'Pending').length}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters
          </h3>
          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg h-fit cursor-pointer font-medium transition-all duration-200 hover:bg-gray-200 flex items-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              </svg>
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Search</label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                placeholder="Search by author, book, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700">Filter by Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700">Filter by Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Months</option>
              {monthNames.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">Service Type</label>
            <select
              value={activeServiceFilter}
              onChange={(e) => setActiveServiceFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Services</option>
              {serviceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
            </svg>
            Fulfillment List
          </h3>
          <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1.5 rounded-full">
            {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase text-sm">Author</th>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase text-sm">Service Type</th>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase text-sm">Book</th>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase text-sm">Notes</th>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase text-sm">Status</th>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase text-sm">Date</th>
                <th className="p-4 text-left font-semibold text-gray-700 uppercase text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 even:bg-gray-50/30">
                    <td className="p-4 font-medium">{service.author_name}</td>
                    <td className="p-4">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1.5 rounded-full border border-indigo-200">
                        {service.service_type}
                      </span>
                    </td>
                    <td className="p-4 max-w-[200px] break-words">{service.book_name}</td>
                    <td className="p-4 max-w-[250px] break-words text-sm text-gray-600">
                      {service.notes || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(service.fulfillment_status)}`}>
                        {service.fulfillment_status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {service.fulfillment_date ? format(new Date(service.fulfillment_date), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="bg-blue-100 text-blue-700 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-200 flex items-center gap-1 shadow-sm"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span className="text-xs hidden lg:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="bg-red-100 text-red-700 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-red-200 flex items-center gap-1 shadow-sm"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs hidden lg:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium text-gray-600 mb-2">No services found</p>
                      <p className="text-gray-500 mb-4">Try adjusting your filters or add a new service</p>
                      <button 
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add New Service
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <PaginationControls />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                {editing ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-semibold transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Author Name</label>
                  <input
                    type="text"
                    name="author_name"
                    placeholder="Enter author name"
                    value={formData.author_name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Service Type</label>
                  <select
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a service type</option>
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Book Name</label>
                <input
                  type="text"
                  name="book_name"
                  placeholder="Enter book name"
                  value={formData.book_name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Enter any notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Status</label>
                  <select
                    name="fulfillment_status"
                    value={formData.fulfillment_status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Fulfilled">Fulfilled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Fulfillment Date</label>
                  <input
                    type="date"
                    name="fulfillment_date"
                    value={formData.fulfillment_date}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button 
                  onClick={closeModal}
                  className="bg-gray-500 text-white py-2 px-5 rounded-lg cursor-pointer font-medium transition-all duration-200 hover:bg-gray-600 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white py-2 px-5 rounded-lg cursor-pointer font-medium transition-all duration-200 hover:bg-indigo-700 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {editing ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}