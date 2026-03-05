import React, { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaChartBar, 
  FaCamera, 
  FaNewspaper, 
  FaGift, 
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaFilter,
  FaDownload,
  FaShare,
  FaEye,
  FaBook,
  FaUserTie,
  FaMicrophone,
  FaTrophy
} from 'react-icons/fa';

const AuthorDashboard = () => {
  const [activeTab, setActiveTab] = useState('placement');
  const [selectedMonth, setSelectedMonth] = useState('january');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const monthlyPlacements = [
    { id: 1, title: "The Silent Echo", author: "Sarah Johnson", genre: "Mystery", placement: "Featured - Homepage", date: "Jan 15, 2024", status: "Active", performance: "+42%" },
    { id: 2, title: "Beyond the Horizon", author: "Michael Chen", genre: "Science Fiction", placement: "New Releases", date: "Jan 10, 2024", status: "Active", performance: "+28%" },
    { id: 3, title: "Whispers in the Wind", author: "Emma Rodriguez", genre: "Romance", placement: "Editor's Pick", date: "Jan 5, 2024", status: "Expiring", performance: "+15%" },
    { id: 4, title: "The Last Emperor", author: "David Wilson", genre: "Historical Fiction", placement: "Best Sellers", date: "Dec 28, 2023", status: "Active", performance: "+67%" },
    { id: 5, title: "Code Breaker", author: "Alex Thompson", genre: "Thriller", placement: "Featured - Category", date: "Dec 20, 2023", status: "Active", performance: "+35%" },
  ];

  const reports = [
    { id: 1, title: "Q4 2023 Sales Report", type: "Sales Analytics", date: "Jan 20, 2024", downloads: 245, status: "Published" },
    { id: 2, title: "Marketing Campaign Performance", type: "Marketing Report", date: "Jan 15, 2024", downloads: 189, status: "Published" },
    { id: 3, title: "Reader Demographics Analysis", type: "Audience Insights", date: "Jan 10, 2024", downloads: 312, status: "Draft" },
    { id: 4, title: "Social Media Engagement", type: "Social Metrics", date: "Jan 5, 2024", downloads: 167, status: "Published" },
  ];

  const photos = [
    { id: 1, title: "Book Launch Event", category: "Events", date: "Dec 15, 2023", downloads: 89, featured: true },
    { id: 2, title: "Author Interview Session", category: "Press", date: "Dec 10, 2023", downloads: 124, featured: true },
    { id: 3, title: "Behind the Scenes", category: "Studio", date: "Dec 5, 2023", downloads: 67, featured: false },
    { id: 4, title: "Book Cover Shoot", category: "Photoshoot", date: "Nov 28, 2023", downloads: 156, featured: true },
  ];

  const pressEvents = [
    { id: 1, title: "New York Times Feature", outlet: "NY Times", date: "Jan 22, 2024", type: "Feature", impact: "High" },
    { id: 2, title: "Morning Show Interview", outlet: "Good Morning America", date: "Jan 18, 2024", type: "TV Interview", impact: "Very High" },
    { id: 3, title: "Podcast Appearance", outlet: "The Writing Life Podcast", date: "Jan 12, 2024", type: "Podcast", impact: "Medium" },
    { id: 4, title: "Literary Festival", outlet: "Chicago Book Festival", date: "Feb 5-7, 2024", type: "Event", impact: "High" },
    { id: 5, title: "Radio Interview", outlet: "NPR Books", date: "Jan 8, 2024", type: "Radio", impact: "High" },
  ];

  const perks = [
    { id: 1, title: "Premium Book Cover Design", category: "Design Services", points: 5000, status: "Available", popular: true },
    { id: 2, title: "Professional Author Photos", category: "Photography", points: 3000, status: "Available", popular: false },
    { id: 3, title: "Social Media Promotion Package", category: "Marketing", points: 4500, status: "Available", popular: true },
    { id: 4, title: "Editorial Consultation", category: "Editing", points: 6000, status: "Redeemed", popular: false },
    { id: 5, title: "Audiobook Production", category: "Production", points: 8000, status: "Available", popular: true },
    { id: 6, title: "Book Trailer Video", category: "Video Production", points: 5500, status: "Available", popular: false },
  ];

  const months = [
    { value: 'january', label: 'January 2024' },
    { value: 'december', label: 'December 2023' },
    { value: 'november', label: 'November 2023' },
    { value: 'october', label: 'October 2023' },
  ];

 // const genres = ['All Genres', 'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy', 'Biography'];

  const stats = {
    totalPlacements: 47,
    activePlacements: 32,
    avgPerformance: '+38%',
    totalDownloads: 1024,
    upcomingEvents: 8,
    availablePerks: 12,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Author Success Dashboard</h1>
          <p className="text-gray-600">Track your book placements, reports, press coverage, and available perks</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Placements</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activePlacements}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FaChartBar className="text-blue-500 text-xl" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <FaArrowUp className="mr-1" /> {stats.avgPerformance} avg performance
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDownloads}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FaDownload className="text-green-500 text-xl" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Reports & Photos</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingEvents}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FaCalendarAlt className="text-purple-500 text-xl" />
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-2 flex items-center">
              <FaMicrophone className="mr-1" /> Next: Feb 5, 2024
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Perks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.availablePerks}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FaGift className="text-yellow-500 text-xl" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Ready to redeem</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('placement')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'placement' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <FaCalendarAlt /> Monthly Placement
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'reports' ? 'bg-green-50 text-green-700 border-b-2 border-green-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <FaChartBar /> Reports & Photos
            </button>
            <button
              onClick={() => setActiveTab('press')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'press' ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <FaNewspaper /> Press & Events
            </button>
            <button
              onClick={() => setActiveTab('perks')}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors flex items-center gap-2 ${activeTab === 'perks' ? 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-700' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <FaGift /> Perks
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, or keyword..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <FaFilter /> Filter
              </button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'placement' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" /> Monthly Book Placements
                </h2>
                <p className="text-gray-600 mt-1">Your books featured across platforms this month</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placement</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {monthlyPlacements.map((placement) => (
                      <tr key={placement.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaBook className="text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{placement.title}</p>
                              <p className="text-xs text-gray-500">{placement.genre}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <FaUserTie className="text-gray-600 text-sm" />
                            </div>
                            <span className="text-sm text-gray-700">{placement.author}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {placement.placement}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">{placement.date}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            placement.status === 'Active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {placement.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              placement.performance.startsWith('+') 
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {placement.performance}
                            </span>
                            {placement.performance.startsWith('+') ? (
                              <FaArrowUp className="text-green-500 text-sm" />
                            ) : (
                              <FaArrowDown className="text-red-500 text-sm" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Placement Performance</h3>
                <div className="space-y-4">
                  {['Featured - Homepage', 'New Releases', 'Editor\'s Pick', 'Best Sellers'].map((type, index) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{type}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${60 + index * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{60 + index * 10}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Placement Opportunities</h3>
                <div className="space-y-4">
                  {[
                    { title: "Spring Reading List", date: "Feb 15, 2024", spots: 12 },
                    { title: "Author Spotlight", date: "Feb 28, 2024", spots: 8 },
                    { title: "Book of the Month", date: "Mar 5, 2024", spots: 1 },
                  ].map((opp) => (
                    <div key={opp.title} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{opp.title}</p>
                          <p className="text-sm text-gray-600">Deadline: {opp.date}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {opp.spots} spots left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports Section */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaChartBar className="text-green-500" /> Reports & Analytics
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-sm text-gray-600">{report.type}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{report.date}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-blue-600">{report.downloads} downloads</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'Published' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                        <button className="p-2 text-gray-500 hover:text-gray-700">
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos Section */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaCamera className="text-purple-500" /> Photo Gallery
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        <FaCamera className="text-gray-400 text-3xl" />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{photo.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-600">{photo.category}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-600">{photo.date}</span>
                            </div>
                          </div>
                          {photo.featured && (
                            <FaStar className="text-yellow-400" />
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-blue-600">{photo.downloads} downloads</span>
                          <div className="flex gap-2">
                            <button className="p-1.5 text-gray-500 hover:text-gray-700">
                              <FaEye />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-gray-700">
                              <FaDownload />
                            </button>
                            <button className="p-1.5 text-gray-500 hover:text-gray-700">
                              <FaShare />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'press' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaNewspaper className="text-purple-500" /> Press Coverage & Events
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {pressEvents.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.impact === 'Very High' 
                              ? 'bg-red-100 text-red-800'
                              : event.impact === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {event.impact} Impact
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-700">{event.outlet}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-700">{event.type}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-700">{event.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                          View Details
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 text-white">
                <h3 className="text-lg font-bold mb-4">Press Kit</h3>
                <p className="mb-6">Download your complete press kit including bio, photos, and book information</p>
                <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Download Press Kit
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {[
                    { title: "Book Signing", location: "Barnes & Noble NYC", date: "Feb 10, 2024" },
                    { title: "Author Panel", location: "Chicago Literary Fest", date: "Feb 18, 2024" },
                    { title: "Virtual Q&A", location: "Online", date: "Feb 25, 2024" },
                  ].map((event) => (
                    <div key={event.title} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaCalendarAlt className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                        <p className="text-xs text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Media Requests</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-gray-900">The Guardian Interview Request</p>
                    <p className="text-sm text-gray-600 mt-1">Pending • Feb 2, 2024</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="font-medium text-gray-900">Podcast Guest Invitation</p>
                    <p className="text-sm text-gray-600 mt-1">Confirmed • Jan 30, 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'perks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FaGift className="text-yellow-500" /> Available Perks
                  </h2>
                  <p className="text-gray-600 mt-1">Redeem your points for exclusive author benefits</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-lg">
                  <p className="text-sm">Your Points</p>
                  <p className="text-2xl font-bold">12,500</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {perks.map((perk) => (
                  <div key={perk.id} className={`border rounded-xl overflow-hidden hover:shadow-lg transition-shadow ${
                    perk.status === 'Redeemed' ? 'border-gray-200' : 'border-yellow-200'
                  }`}>
                    <div className="h-40 bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center relative">
                      <FaGift className="text-yellow-400 text-4xl" />
                      {perk.popular && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            POPULAR
                          </span>
                        </div>
                      )}
                      {perk.status === 'Redeemed' && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                            REDEEMED
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{perk.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{perk.category}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaTrophy className="text-yellow-500" />
                          <span className="font-bold text-gray-900">{perk.points.toLocaleString()}</span>
                        </div>
                      </div>
                      <button 
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          perk.status === 'Redeemed'
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        }`}
                        disabled={perk.status === 'Redeemed'}
                      >
                        {perk.status === 'Redeemed' ? 'Already Redeemed' : 'Redeem Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">How to Earn More Points</h3>
                <div className="space-y-4">
                  {[
                    { task: "Submit book for placement", points: 500 },
                    { task: "Complete author interview", points: 300 },
                    { task: "Share on social media", points: 100 },
                    { task: "Participate in event", points: 750 },
                  ].map((item) => (
                    <div key={item.task} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <span className="text-gray-700">{item.task}</span>
                      <span className="font-bold text-yellow-600">+{item.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Redemptions</h3>
                <div className="space-y-4">
                  {[
                    { perk: "Professional Author Photos", date: "Jan 15, 2024", points: 3000 },
                    { perk: "Social Media Promotion", date: "Jan 8, 2024", points: 4500 },
                  ].map((redemption) => (
                    <div key={redemption.perk} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{redemption.perk}</p>
                          <p className="text-sm text-gray-600 mt-1">Redeemed on {redemption.date}</p>
                        </div>
                        <span className="text-red-600 font-bold">-{redemption.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDashboard;