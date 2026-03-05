import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

function Publication() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [formData, setFormData] = useState({
    Author_name: '',
    services: '',
    book_name: '',
    notes: '',
    fulfillment_status: '',
    fulfillment_date: ''
  });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/publication_services`);
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
  }, [searchTerm, selectedYear, selectedMonth, services]);

  const applyFilters = () => {
    let filtered = [...services];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.author_name?.toLowerCase().includes(term) ||
        service.book_name?.toLowerCase().includes(term) ||
        service.services?.toLowerCase().includes(term) ||
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

    setFilteredServices(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedYear('all');
    setSelectedMonth('all');
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
        await axios.put(`${API_URL}/api/publication_services/${editing}`, formData);
      } else {
        await axios.post(`${API_URL}/api/publication_services`, formData);
      }
      setFormData({
        Author_name: '',
        services: '',
        book_name: '',
        notes: '',
        fulfillment_status: '',
        fulfillment_date: ''
      });
      setEditing(null);
      setShowForm(false);
      fetchServices();
    } catch (err) {
      console.error('Error saving:', err.response?.data || err.message);
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (service) => {
    setFormData({
      Author_name: service.author_name,
      services: service.services,
      book_name: service.book_name,
      notes: service.notes,
      fulfillment_status: service.fulfillment_status,
      fulfillment_date: service.fulfillment_date
    });
    setEditing(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`${API_URL}/api/publication_services/${id}`);
        fetchServices();
      } catch (err) {
        console.error('Delete error:', err.response?.data || err.message);
        alert('Error deleting: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Completed': 
        return 'bg-green-100 text-green-800';
      case 'In Progress': 
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending': 
        return 'bg-red-100 text-red-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <span>📚</span> Publication Services
      </h2>
      
      <button 
        onClick={() => {
          setFormData({
            Author_name: '',
            services: '',
            book_name: '',
            notes: '',
            fulfillment_status: '',
            fulfillment_date: ''
          });
          setEditing(null);
          setShowForm(true);
        }}
        className="bg-indigo-600 text-white py-2 px-4 rounded-md mr-3 mb-4 cursor-pointer font-medium transition-all duration-200 shadow-sm hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md inline-flex items-center gap-2"
      >
        <span>+</span> Add New Transaction
      </button>

      {showForm && (
        <div className="bg-white p-6 mb-8 rounded-lg shadow-sm border border-gray-100">
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Author Name</label>
            <input
              type="text"
              name="Author_name"
              placeholder="Enter author name"
              value={formData.Author_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Service</label>
            <input
              type="text"
              name="services"
              placeholder="Enter service type"
              value={formData.services}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Book Name</label>
            <input
              type="text"
              name="book_name"
              placeholder="Enter book name"
              value={formData.book_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              placeholder="Enter any notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Status</label>
            <input
              type="text"
              name="fulfillment_status"
              placeholder="Enter status"
              value={formData.fulfillment_status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">Fulfillment Date</label>
            <input
              type="date"
              name="fulfillment_date"
              value={formData.fulfillment_date}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSubmit}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-indigo-700"
            >
              {editing ? 'Update' : 'Save'}
            </button>

            <button 
              onClick={() => setShowForm(false)}
              className="bg-slate-400 text-white py-2 px-4 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 -mr-4">
        <div className="flex flex-col min-w-[200px]">
          <label className="block mb-2 font-medium text-gray-700">Search</label>
          <input
            type="text"
            placeholder="Search by author, book, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mr-2"
          />
        </div>
        
        <div className="flex flex-col min-w-[200px]">
          <label className="block mb-2 font-medium text-gray-700">Filter by Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col min-w-[200px]">
          <label className="block mb-2 font-medium text-gray-700">Filter by Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Months</option>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={resetFilters}
          className="bg-slate-500 text-white py-2 px-4 rounded-md h-fit self-end cursor-pointer font-medium transition-all duration-200 hover:bg-slate-600"
        >
          Reset Filters
        </button>
      </div>

      <div className="overflow-hidden rounded-lg shadow-md border border-gray-200">
        <table className="w-full border-collapse">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-4 text-left font-semibold">Author</th>
              <th className="p-4 text-left font-semibold">Service</th>
              <th className="p-4 text-left font-semibold">Book</th>
              <th className="p-4 text-left font-semibold">Notes</th>
              <th className="p-4 text-left font-semibold">Status</th>
              <th className="p-4 text-left font-semibold">Date</th>
              <th className="p-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map(service => (
              <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="p-4 border-b border-gray-100 bg-white">{service.author_name}</td>
                <td className="p-4 border-b border-gray-100 bg-white">{service.services}</td>
                <td className="p-4 border-b border-gray-100 bg-white">{service.book_name}</td>
                <td className="p-4 border-b border-gray-100 bg-white">{service.notes}</td>
                <td className="p-4 border-b border-gray-100 bg-white">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(service.fulfillment_status)}`}>
                    {service.fulfillment_status}
                  </span>
                </td>
                <td className="p-4 border-b border-gray-100 bg-white">{service.fulfillment_date}</td>
                <td className="p-4 border-b border-gray-100 bg-white">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="bg-amber-500 text-white py-1 px-3 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-amber-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Publication;