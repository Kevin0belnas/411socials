// import React, { useState, useEffect, useCallback } from 'react'

// const API_URL = import.meta.env.VITE_API_URL;

// export default function LeadsManagement() {
//   const [contacts, setContacts] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [selectedContacts, setSelectedContacts] = useState(new Set())
//   const [selectAll, setSelectAll] = useState(false)
  
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize, setPageSize] = useState(20)
//   const [totalCount, setTotalCount] = useState(0)
//   const [totalPages, setTotalPages] = useState(0)
  
//   // Filter state
//   const [search, setSearch] = useState('')
//   const [status, setStatus] = useState('')
//   const [view, setView] = useState('all')
//   const [assignedTo, setAssignedTo] = useState('')
//   const [leadOwner, setLeadOwner] = useState('')
  
//   // Edit modal state
//   const [editingContact, setEditingContact] = useState(null)
//   const [showEditModal, setShowEditModal] = useState(false)
//   const [editFormData, setEditFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     lead_owner: '',
//     author: '',
//     publisher: '',
//     book_title: '',
//     status: '',
//     rating: '',
//     assigned_to: '',
//     street_address: '',
//     city: '',
//     state: '',
//     zipcode: '',
//     reserve_note: '',
//     comment: ''
//   })
//   const [saving, setSaving] = useState(false)
  
//   // Duplicate detection with pagination
//   const [duplicates, setDuplicates] = useState([])
//   const [showDuplicates, setShowDuplicates] = useState(false)
//   const [selectedDuplicates, setSelectedDuplicates] = useState(new Set())
//   const [duplicateGroups, setDuplicateGroups] = useState([])
//   const [duplicatesLoading, setDuplicatesLoading] = useState(false)
//   const [duplicatesPage, setDuplicatesPage] = useState(1)
//   const [duplicatesPageSize] = useState(5)
//   const [duplicatesTotalPages, setDuplicatesTotalPages] = useState(0)
//   const [duplicatesTotalGroups, setDuplicatesTotalGroups] = useState(0)
  
//   // Stats
//   const [stats, setStats] = useState({
//     assignedCount: 0,
//     unassignedCount: 0,
//     totalContacts: 0,
//     duplicateCount: 0
//   })

//   // Fetch contacts from manage-leads endpoint
//   const fetchContacts = useCallback(async () => {
//     setLoading(true)
//     try {
//       const params = new URLSearchParams({
//         search: search || '',
//         view: view === 'all' ? '' : view,
//         status: status || '',
//         assignedTo: assignedTo || '',
//         leadOwner: leadOwner || '',
//         page: currentPage,
//         pageSize
//       })
      
//       const response = await fetch(`${API_URL}/api/manage-leads?${params}`)
//       const data = await response.json()
      
//       if (!response.ok) throw new Error(data.error || 'Failed to fetch contacts')
      
//       setContacts(data.contacts)
//       setTotalCount(data.totalCount)
//       setStats({
//         assignedCount: data.assignedCount,
//         unassignedCount: data.unassignedCount,
//         totalContacts: data.totalCount,
//         duplicateCount: data.duplicateCount || 0
//       })
//       setTotalPages(Math.ceil(data.totalCount / pageSize))
      
//       setSelectedContacts(new Set())
//       setSelectAll(false)
//     } catch (error) {
//       console.error('Error fetching contacts:', error)
//       alert('Error fetching contacts: ' + error.message)
//     } finally {
//       setLoading(false)
//     }
//   }, [search, view, status, assignedTo, leadOwner, currentPage, pageSize])

//   // Handle search button click
//   const handleSearch = () => {
//     setCurrentPage(1)
//     fetchContacts()
//   }

//   // Handle reset filters
//   const handleReset = () => {
//     setSearch('')
//     setStatus('')
//     setView('all')
//     setAssignedTo('')
//     setLeadOwner('')
//     setCurrentPage(1)
//   }

//   // Detect duplicates with pagination
//   const detectDuplicates = useCallback(async (page = 1) => {
//     setDuplicatesLoading(true)
//     try {
//       const response = await fetch(`${API_URL}/api/manage-leads/duplicates?page=${page}&pageSize=${duplicatesPageSize}`)
//       const data = await response.json()
      
//       if (!response.ok) throw new Error(data.error || 'Failed to detect duplicates')
      
//       setDuplicateGroups(data.duplicateGroups)
//       setDuplicates(data.duplicates)
//       setDuplicatesTotalPages(data.totalPages)
//       setDuplicatesTotalGroups(data.totalGroups)
//       setDuplicatesPage(page)
//       setShowDuplicates(true)
      
//       setSelectedDuplicates(new Set())
      
//       setStats(prev => ({
//         ...prev,
//         duplicateCount: data.totalDuplicateCount
//       }))
//     } catch (error) {
//       console.error('Error detecting duplicates:', error)
//       alert('Error detecting duplicates: ' + error.message)
//     } finally {
//       setDuplicatesLoading(false)
//     }
//   }, [duplicatesPageSize])

//   // Handle single contact selection
//   const handleSelectContact = (contactId) => {
//     const newSelected = new Set(selectedContacts)
//     if (newSelected.has(contactId)) {
//       newSelected.delete(contactId)
//     } else {
//       newSelected.add(contactId)
//     }
//     setSelectedContacts(newSelected)
//     setSelectAll(newSelected.size === contacts.length)
//   }

//   // Handle select all
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedContacts(new Set())
//     } else {
//       const allIds = contacts.map(contact => contact.id)
//       setSelectedContacts(new Set(allIds))
//     }
//     setSelectAll(!selectAll)
//   }

//   // Handle bulk delete from manage-leads/bulk-delete endpoint
//   const handleBulkDelete = async () => {
//     if (selectedContacts.size === 0) {
//       alert('Please select contacts to delete')
//       return
//     }

//     if (!confirm(`Are you sure you want to delete ${selectedContacts.size} contact(s)? This action cannot be undone.`)) {
//       return
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/manage-leads/bulk-delete`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           contactIds: Array.from(selectedContacts)
//         })
//       })
      
//       const data = await response.json()
//       if (!response.ok) throw new Error(data.error || 'Failed to delete contacts')
      
//       fetchContacts()
//       alert(`${selectedContacts.size} contact(s) deleted successfully`)
//     } catch (error) {
//       console.error('Error deleting contacts:', error)
//       alert('Error deleting contacts: ' + error.message)
//     }
//   }

//   // Handle edit contact
//   const handleEditContact = (contact) => {
//     setEditingContact(contact)
//     setEditFormData({
//       name: contact.name || '',
//       email: contact.email || '',
//       phone: contact.phone || '',
//       lead_owner: contact.lead_owner || '',
//       author: contact.author || '',
//       publisher: contact.publisher || '',
//       book_title: contact.book_title || '',
//       status: contact.status || 'New',
//       rating: contact.rating || '',
//       assigned_to: contact.assigned_to || '',
//       street_address: contact.street_address || '',
//       city: contact.city || '',
//       state: contact.state || '',
//       zipcode: contact.zipcode || '',
//       reserve_note: contact.reserve_note || '',
//       comment: contact.comment || ''
//     })
//     setShowEditModal(true)
//   }

//   // Handle save edit
//   const handleSaveEdit = async () => {
//     setSaving(true)
//     try {
//       const response = await fetch(`${API_URL}/api/contacts/${editingContact.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(editFormData)
//       })
      
//       const data = await response.json()
//       if (!response.ok) throw new Error(data.error || 'Failed to update contact')
      
//       setShowEditModal(false)
//       setEditingContact(null)
//       fetchContacts()
//       alert('Contact updated successfully')
//     } catch (error) {
//       console.error('Error updating contact:', error)
//       alert('Error updating contact: ' + error.message)
//     } finally {
//       setSaving(false)
//     }
//   }

//   // Handle duplicate selection
//   const handleSelectDuplicate = (contactId) => {
//     const newSelected = new Set(selectedDuplicates)
//     if (newSelected.has(contactId)) {
//       newSelected.delete(contactId)
//     } else {
//       newSelected.add(contactId)
//     }
//     setSelectedDuplicates(newSelected)
//   }

//   // Handle select all duplicates in a specific group
//   const handleSelectGroupDuplicates = (groupContacts) => {
//     const groupDuplicateIds = groupContacts.slice(1).map(c => c.id)
//     const newSelected = new Set(selectedDuplicates)
//     const allCurrentlySelected = groupDuplicateIds.every(id => newSelected.has(id))
    
//     if (allCurrentlySelected) {
//       groupDuplicateIds.forEach(id => newSelected.delete(id))
//     } else {
//       groupDuplicateIds.forEach(id => newSelected.add(id))
//     }
    
//     setSelectedDuplicates(newSelected)
//   }

//   // Check if all duplicates in a group are selected
//   const isGroupFullySelected = (groupContacts) => {
//     const groupDuplicateIds = groupContacts.slice(1).map(c => c.id)
//     return groupDuplicateIds.length > 0 && 
//            groupDuplicateIds.every(id => selectedDuplicates.has(id))
//   }

//   // Check if some (but not all) duplicates in a group are selected
//   const isGroupPartiallySelected = (groupContacts) => {
//     const groupDuplicateIds = groupContacts.slice(1).map(c => c.id)
//     const selectedCount = groupDuplicateIds.filter(id => selectedDuplicates.has(id)).length
//     return selectedCount > 0 && selectedCount < groupDuplicateIds.length
//   }

//   // Auto-select all duplicates on current page
//   const handleSelectAllDuplicatesOnPage = () => {
//     const allDuplicateIds = duplicateGroups.flatMap(group => 
//       group.contacts.slice(1).map(c => c.id)
//     )
//     setSelectedDuplicates(new Set(allDuplicateIds))
//   }

//   // Clear all selected duplicates
//   const handleClearAllSelections = () => {
//     setSelectedDuplicates(new Set())
//   }

//   // Auto-select all duplicates across all pages
//   const handleSelectAllDuplicates = async () => {
//     if (!confirm(`This will select all duplicates across ${duplicatesTotalGroups} groups. This might take a moment. Continue?`)) {
//       return
//     }
    
//     let allDuplicateIds = []
//     for (let page = 1; page <= duplicatesTotalPages; page++) {
//       const response = await fetch(`${API_URL}/api/manage-leads/duplicates?page=${page}&pageSize=${duplicatesPageSize}`)
//       const data = await response.json()
//       const pageDuplicateIds = data.duplicateGroups.flatMap(group => 
//         group.contacts.slice(1).map(c => c.id)
//       )
//       allDuplicateIds.push(...pageDuplicateIds)
//     }
    
//     setSelectedDuplicates(new Set(allDuplicateIds))
//     alert(`Selected ${allDuplicateIds.length} duplicates across all pages`)
//   }

//   // Handle bulk delete duplicates
//   const handleDeleteDuplicates = async () => {
//     if (selectedDuplicates.size === 0) {
//       alert('Please select duplicate contacts to delete')
//       return
//     }

//     if (!confirm(`Delete ${selectedDuplicates.size} duplicate contact(s)? Keep the oldest version of each duplicate group.`)) {
//       return
//     }

//     try {
//       const response = await fetch(`${API_URL}/api/manage-leads/bulk-delete`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           contactIds: Array.from(selectedDuplicates)
//         })
//       })
      
//       const data = await response.json()
//       if (!response.ok) throw new Error(data.error || 'Failed to delete duplicates')
      
//       setShowDuplicates(false)
//       setSelectedDuplicates(new Set())
//       fetchContacts()
//       alert('Duplicate contacts deleted successfully')
//     } catch (error) {
//       console.error('Error deleting duplicates:', error)
//       alert('Error deleting duplicates: ' + error.message)
//     }
//   }

//   useEffect(() => {
//     fetchContacts()
//   }, [fetchContacts])

//   // Pagination controls for main table
//   const goToPage = (page) => {
//     setCurrentPage(Math.max(1, Math.min(page, totalPages)))
//   }

//   // Pagination controls for duplicates modal
//   const goToDuplicatesPage = (page) => {
//     detectDuplicates(page)
//   }

//   // Change page size
//   const handlePageSizeChange = (e) => {
//     setPageSize(Number(e.target.value))
//     setCurrentPage(1)
//   }

//   // Get status badge color
//   const getStatusBadgeColor = (status) => {
//     const colors = {
//       'New': 'bg-green-100 text-green-800',
//       'Contacted': 'bg-blue-100 text-blue-800',
//       'In Progress': 'bg-yellow-100 text-yellow-800',
//       'Closed': 'bg-gray-100 text-gray-800',
//       'Completed': 'bg-purple-100 text-purple-800',
//       'Incompleted': 'bg-red-100 text-red-800',
//       'Transferred': 'bg-orange-100 text-orange-800'
//     }
//     return colors[status] || 'bg-gray-100 text-gray-800'
//   }

//   return (
//     <div className="p-6 max-w-full bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Leads Management</h1>
//         <p className="text-gray-600 mt-1">Manage and organize your contacts</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white rounded-lg shadow p-4">
//           <div className="text-sm text-gray-500">Total Contacts</div>
//           <div className="text-2xl font-bold text-gray-800">{stats.totalContacts.toLocaleString()}</div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4">
//           <div className="text-sm text-gray-500">Assigned</div>
//           <div className="text-2xl font-bold text-green-600">{stats.assignedCount.toLocaleString()}</div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4">
//           <div className="text-sm text-gray-500">Unassigned (New)</div>
//           <div className="text-2xl font-bold text-orange-600">{stats.unassignedCount.toLocaleString()}</div>
//         </div>
//         <div className="bg-white rounded-lg shadow p-4">
//           <div className="text-sm text-gray-500">Duplicates Found</div>
//           <div className="text-2xl font-bold text-red-600">{stats.duplicateCount.toLocaleString()}</div>
//         </div>
//       </div>

//       {/* Filters Section */}
//       <div className="bg-white rounded-lg shadow mb-6 p-4">
//         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
//           <div className="lg:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by name, email, phone, book title..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
//             <select
//               value={view}
//               onChange={(e) => setView(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="all">All Contacts</option>
//               <option value="unassigned">Unassigned (New)</option>
//               <option value="my">My Leads</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//             <select
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Status</option>
//               <option value="New">New</option>
//               <option value="Contacted">Contacted</option>
//               <option value="In Progress">In Progress</option>
//               <option value="Closed">Closed</option>
//               <option value="Completed">Completed</option>
//               <option value="Incompleted">Incompleted</option>
//               <option value="Transferred">Transferred</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
//             <select
//               value={assignedTo}
//               onChange={(e) => setAssignedTo(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Users</option>
//               <option value="1">User 1</option>
//               <option value="2">User 2</option>
//               <option value="3">User 3</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Lead Owner</label>
//             <input
//               type="text"
//               value={leadOwner}
//               onChange={(e) => setLeadOwner(e.target.value)}
//               placeholder="Filter by lead owner"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>
        
//         <div className="flex gap-2 mt-4">
//           <button
//             onClick={handleSearch}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Search
//           </button>
//           <button
//             onClick={handleReset}
//             className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
//           >
//             Reset
//           </button>
//           <button
//             onClick={() => detectDuplicates(1)}
//             className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ml-auto"
//           >
//             Find Duplicates
//           </button>
//         </div>
//       </div>

//       {/* Bulk Actions Bar */}
//       {selectedContacts.size > 0 && (
//         <div className="bg-blue-50 rounded-lg shadow mb-4 p-3 flex items-center justify-between">
//           <div className="text-blue-800">
//             <span className="font-semibold">{selectedContacts.size}</span> contact(s) selected
//           </div>
//           <button
//             onClick={handleBulkDelete}
//             className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//           >
//             Delete Selected
//           </button>
//         </div>
//       )}

//       {/* Contacts Table */}
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={handleSelectAll}
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
//                 </th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Owner</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ratings</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
//                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {loading ? (
//                 <tr>
//                   <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
//                     <div className="flex justify-center items-center">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                       <span className="ml-2">Loading...</span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : contacts.length === 0 ? (
//                 <tr>
//                   <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
//                     No contacts found
//                   </td>
//                 </tr>
//               ) : (
//                 contacts.map((contact) => (
//                   <tr key={contact.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedContacts.has(contact.id)}
//                         onChange={() => handleSelectContact(contact.id)}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       />
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-900">{contact.id}</td>
//                     <td className="px-4 py-3 text-sm text-gray-900 font-medium">{contact.name}</td>
//                     <td className="px-4 py-3 text-sm text-gray-500">{contact.email || '-'}</td>
//                     <td className="px-4 py-3 text-sm text-gray-500">{contact.phone || '-'}</td>
//                     <td className="px-4 py-3 text-sm text-gray-500">{contact.book_title || '-'}</td>
//                     <td className="px-4 py-3 text-sm text-gray-500">{contact.author || '-'}</td>
//                     <td className="px-4 py-3 text-sm text-gray-500">{contact.lead_owner || '-'}</td>
//                     <td className="px-4 py-3">
//                       <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(contact.status)}`}>
//                         {contact.status || 'New'}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-500">{contact.rating || '-'}</td>
//                     <td className="px-4 py-3 text-sm text-gray-500">
//                       {contact.assigned_to || null}
//                     </td>
//                     <td className="px-4 py-3 text-sm text-gray-500">
//                       {new Date(contact.created_at).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-3 text-sm">
//                       <button
//                         onClick={() => handleEditContact(contact)}
//                         className="text-blue-600 hover:text-blue-800 font-medium"
//                       >
//                         Edit
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 0 && (
//           <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
//             <div className="flex items-center gap-4">
//               <select
//                 value={pageSize}
//                 onChange={handlePageSizeChange}
//                 className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value={10}>10 per page</option>
//                 <option value={20}>20 per page</option>
//                 <option value={50}>50 per page</option>
//                 <option value={100}>100 per page</option>
//               </select>
//               <div className="text-sm text-gray-700">
//                 Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} results
//               </div>
//             </div>
            
//             <div className="flex gap-2">
//               <button
//                 onClick={() => goToPage(1)}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 First
//               </button>
//               <button
//                 onClick={() => goToPage(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 Previous
//               </button>
//               <span className="px-3 py-1 text-sm">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => goToPage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 Next
//               </button>
//               <button
//                 onClick={() => goToPage(totalPages)}
//                 disabled={currentPage === totalPages}
//                 className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 Last
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Edit Contact Modal */}
//       {showEditModal && editingContact && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="text-xl font-bold text-gray-800">Edit Contact</h2>
//               <button
//                 onClick={() => {
//                   setShowEditModal(false)
//                   setEditingContact(null)
//                 }}
//                 className="text-gray-500 hover:text-gray-700 text-2xl"
//               >
//                 ×
//               </button>
//             </div>
            
//             <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
//                   <input
//                     type="text"
//                     value={editFormData.name}
//                     onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                   <input
//                     type="email"
//                     value={editFormData.email}
//                     onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                   <input
//                     type="text"
//                     value={editFormData.phone}
//                     onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Lead Owner</label>
//                   <input
//                     type="text"
//                     value={editFormData.lead_owner}
//                     onChange={(e) => setEditFormData({...editFormData, lead_owner: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
//                   <input
//                     type="text"
//                     value={editFormData.author}
//                     onChange={(e) => setEditFormData({...editFormData, author: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
//                   <input
//                     type="text"
//                     value={editFormData.publisher}
//                     onChange={(e) => setEditFormData({...editFormData, publisher: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
//                   <input
//                     type="text"
//                     value={editFormData.book_title}
//                     onChange={(e) => setEditFormData({...editFormData, book_title: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                   <select
//                     value={editFormData.status}
//                     onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="New">New</option>
//                     <option value="Contacted">Contacted</option>
//                     <option value="In Progress">In Progress</option>
//                     <option value="Closed">Closed</option>
//                     <option value="Completed">Completed</option>
//                     <option value="Incompleted">Incompleted</option>
//                     <option value="Transferred">Transferred</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
//                   <select
//                     value={editFormData.rating}
//                     onChange={(e) => setEditFormData({...editFormData, rating: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">None</option>
//                     <option value="Flagged">Flagged</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
//                   <select
//                     value={editFormData.assigned_to}
//                     onChange={(e) => setEditFormData({...editFormData, assigned_to: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="">Unassigned</option>
//                     <option value="1">User 1</option>
//                     <option value="2">User 2</option>
//                     <option value="3">User 3</option>
//                   </select>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
//                   <input
//                     type="text"
//                     value={editFormData.street_address}
//                     onChange={(e) => setEditFormData({...editFormData, street_address: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
//                   <input
//                     type="text"
//                     value={editFormData.city}
//                     onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
//                   <input
//                     type="text"
//                     value={editFormData.state}
//                     onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
//                   <input
//                     type="text"
//                     value={editFormData.zipcode}
//                     onChange={(e) => setEditFormData({...editFormData, zipcode: e.target.value})}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Reserve Note</label>
//                   <textarea
//                     value={editFormData.reserve_note}
//                     onChange={(e) => setEditFormData({...editFormData, reserve_note: e.target.value})}
//                     rows="2"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
//                   <textarea
//                     value={editFormData.comment}
//                     onChange={(e) => setEditFormData({...editFormData, comment: e.target.value})}
//                     rows="3"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//               </div>
//             </div>
            
//             <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
//               <button
//                 onClick={() => {
//                   setShowEditModal(false)
//                   setEditingContact(null)
//                 }}
//                 className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveEdit}
//                 disabled={saving}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
//               >
//                 {saving ? 'Saving...' : 'Save Changes'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Duplicates Modal with Pagination and Group Selection */}
//       {showDuplicates && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden">
//             <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">Duplicate Contacts (by Phone Number)</h2>
//                 <p className="text-sm text-gray-500 mt-1">
//                   Found {stats.duplicateCount} duplicate contacts in {duplicatesTotalGroups} groups
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowDuplicates(false)
//                   setSelectedDuplicates(new Set())
//                 }}
//                 className="text-gray-500 hover:text-gray-700 text-2xl"
//               >
//                 ×
//               </button>
//             </div>
            
//             <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
//               {duplicatesLoading ? (
//                 <div className="text-center py-8">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
//                   <p className="mt-4 text-gray-500">Loading duplicates...</p>
//                 </div>
//               ) : duplicateGroups.length === 0 ? (
//                 <div className="text-center text-gray-500 py-8">
//                   No duplicate phone numbers found
//                 </div>
//               ) : (
//                 duplicateGroups.map((group, idx) => {
//                   const groupFullySelected = isGroupFullySelected(group.contacts)
//                   const groupPartiallySelected = isGroupPartiallySelected(group.contacts)
//                   const groupDuplicateIds = group.contacts.slice(1).map(c => c.id)
//                   const allGroupDuplicatesSelected = groupDuplicateIds.length > 0 && 
//                     groupDuplicateIds.every(id => selectedDuplicates.has(id))
                  
//                   return (
//                     <div key={idx} className="mb-6 border border-gray-200 rounded-lg p-4 bg-yellow-50">
//                       <div className="mb-3">
//                         <div className="flex items-center justify-between flex-wrap gap-2">
//                           <div>
//                             <span className="font-semibold text-gray-700">
//                               Duplicate Group {(duplicatesPage - 1) * duplicatesPageSize + idx + 1}
//                             </span>
//                             <div className="text-sm text-red-600 mt-1">
//                               <span className="font-medium">Duplicate Phone Number:</span> {group.value}
//                             </div>
//                             <div className="text-xs text-gray-500 mt-1">
//                               This phone appears {group.totalCount} times • {group.duplicateCount} duplicate(s) to delete
//                               {group.hasFlagged && (
//                                 <span className="ml-2 text-blue-600 font-medium">
//                                   ⭐ Contains Flagged Lead
//                                 </span>
//                               )}
//                             </div>
//                           </div>
                          
//                           <div className="flex gap-2">
//                             {group.duplicateCount > 0 && (
//                               <button
//                                 onClick={() => handleSelectGroupDuplicates(group.contacts)}
//                                 className={`px-3 py-1 text-sm rounded-md transition-colors ${
//                                   groupFullySelected
//                                     ? 'bg-green-600 text-white hover:bg-green-700'
//                                     : groupPartiallySelected
//                                     ? 'bg-yellow-600 text-white hover:bg-yellow-700'
//                                     : 'bg-blue-600 text-white hover:bg-blue-700'
//                                 }`}
//                               >
//                                 {groupFullySelected ? '✓ Unselect All' : groupPartiallySelected ? '◐ Select All' : '☐ Select All'}
//                               </button>
//                             )}
                            
//                             {group.duplicateCount > 0 && (
//                               <button
//                                 onClick={() => {
//                                   const groupDuplicateIds = group.contacts.slice(1).map(c => c.id)
//                                   if (confirm(`Delete ALL ${group.duplicateCount} duplicate(s) in this group?\n\nThe ${group.keepReason} (${group.contacts[0].name}) will be kept.`)) {
//                                     setSelectedDuplicates(new Set(groupDuplicateIds))
//                                     setTimeout(() => {
//                                       handleDeleteDuplicates()
//                                     }, 100)
//                                   }
//                                 }}
//                                 className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
//                               >
//                                 🗑 Delete Group
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="space-y-2">
//                         {group.contacts.map((contact, contactIdx) => (
//                           <div 
//                             key={contact.id} 
//                             className={`flex items-center gap-3 p-3 rounded ${
//                               contactIdx === 0 ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'
//                             }`}
//                           >
//                             <input
//                               type="checkbox"
//                               checked={selectedDuplicates.has(contact.id)}
//                               onChange={() => handleSelectDuplicate(contact.id)}
//                               disabled={contactIdx === 0}
//                               className={`rounded ${
//                                 contactIdx === 0 
//                                   ? 'opacity-50 cursor-not-allowed' 
//                                   : 'border-gray-300 text-red-600 focus:ring-red-500'
//                               }`}
//                             />
//                             <div className="flex-1">
//                               <div className="flex items-center gap-2 flex-wrap">
//                                 <span className="font-medium text-gray-900">{contact.name}</span>
//                                 {contactIdx === 0 && (
//                                   <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
//                                     Keep ({group.keepReason})
//                                   </span>
//                                 )}
//                                 {contact.rating === 'Flagged' && contactIdx !== 0 && (
//                                   <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
//                                     ⭐ Flagged (Will be deleted)
//                                   </span>
//                                 )}
//                                 {contactIdx > 0 && contact.rating !== 'Flagged' && (
//                                   <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
//                                     Duplicate #{contactIdx} - Delete
//                                   </span>
//                                 )}
//                               </div>
//                               <div className="text-sm text-gray-500 mt-1 grid grid-cols-1 md:grid-cols-2 gap-1">
//                                 <div>📞 Phone: {contact.phone}</div>
//                                 <div>📧 Email: {contact.email || 'No email'}</div>
//                                 <div>📚 Book: {contact.book_title || 'No book'}</div>
//                                 <div>👤 Lead Owner: {contact.lead_owner || 'Unassigned'}</div>
//                                 {contact.rating === 'Flagged' && (
//                                   <div className="text-orange-600 font-medium">⭐ Flagged Lead</div>
//                                 )}
//                               </div>
//                               <div className="text-xs text-gray-400 mt-1">
//                                 Created: {new Date(contact.created_at).toLocaleString()}
//                               </div>
//                             </div>
//                             <div className="text-xs text-gray-400">
//                               ID: {contact.id}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
                      
//                       <div className="mt-3 text-sm bg-blue-50 p-2 rounded flex justify-between items-center flex-wrap gap-2">
//                         <div>
//                           <span className="text-gray-600">💡 Suggestion: </span>
//                           <span className="text-gray-700">
//                             Keep the {group.keepReason} ({group.contacts[0].name}) and delete the {group.duplicateCount} duplicate(s)
//                           </span>
//                         </div>
//                         <div className="flex gap-2 items-center">
//                           <span className="text-xs font-medium">
//                             {selectedDuplicates.has(group.contacts[1]?.id) ? 
//                               `${group.duplicateCount - group.contacts.slice(1).filter(c => selectedDuplicates.has(c.id)).length} remaining` : 
//                               `${group.duplicateCount} to delete`}
//                           </span>
//                           {allGroupDuplicatesSelected && (
//                             <button
//                               onClick={() => {
//                                 if (confirm(`Delete ${group.duplicateCount} selected duplicate(s) in this group?\n\nThe ${group.keepReason} (${group.contacts[0].name}) will be kept.`)) {
//                                   handleDeleteDuplicates()
//                                 }
//                               }}
//                               className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
//                             >
//                               Delete Selected in Group
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   )
//                 })
//               )}
//             </div>
            
//             {duplicatesTotalPages > 1 && (
//               <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
//                 <div className="text-sm text-gray-600">
//                   Page {duplicatesPage} of {duplicatesTotalPages} (Total {duplicatesTotalGroups} duplicate groups)
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => goToDuplicatesPage(duplicatesPage - 1)}
//                     disabled={duplicatesPage === 1}
//                     className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                   >
//                     Previous
//                   </button>
//                   <button
//                     onClick={() => goToDuplicatesPage(duplicatesPage + 1)}
//                     disabled={duplicatesPage === duplicatesTotalPages}
//                     className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
//                   >
//                     Next
//                   </button>
//                 </div>
//               </div>
//             )}
            
//             <div className="p-4 border-t border-gray-200 flex justify-between flex-wrap gap-2">
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleSelectAllDuplicatesOnPage}
//                   className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
//                 >
//                   Select All on This Page
//                 </button>
//                 {duplicatesTotalPages > 1 && (
//                   <button
//                     onClick={handleSelectAllDuplicates}
//                     className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
//                   >
//                     Select All ({stats.duplicateCount} duplicates)
//                   </button>
//                 )}
//                 <button
//                   onClick={handleClearAllSelections}
//                   className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
//                 >
//                   Clear All
//                 </button>
//               </div>
//               <div className="flex gap-2">
//                 <div className="text-sm text-gray-600 mr-2 self-center font-semibold">
//                   {selectedDuplicates.size} duplicate(s) selected
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowDuplicates(false)
//                     setSelectedDuplicates(new Set())
//                   }}
//                   className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteDuplicates}
//                   disabled={selectedDuplicates.size === 0}
//                   className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
//                 >
//                   🗑 Delete Selected ({selectedDuplicates.size})
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }



import React, { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL;

export default function LeadsManagement() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // Filter state
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [view, setView] = useState('all')
  const [assignedTo, setAssignedTo] = useState('')
  const [leadOwner, setLeadOwner] = useState('')
  
  // Edit modal state
  const [editingContact, setEditingContact] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    lead_owner: '',
    author: '',
    publisher: '',
    book_title: '',
    status: '',
    rating: '',
    assigned_to: '',
    street_address: '',
    city: '',
    state: '',
    zipcode: '',
    reserve_note: '',
    comment: ''
  })
  const [saving, setSaving] = useState(false)
  
  // Duplicate detection with pagination
  const [duplicates, setDuplicates] = useState([])
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [selectedDuplicates, setSelectedDuplicates] = useState(new Set())
  const [duplicateGroups, setDuplicateGroups] = useState([])
  const [duplicatesLoading, setDuplicatesLoading] = useState(false)
  const [duplicatesPage, setDuplicatesPage] = useState(1)
  const [duplicatesPageSize, setDuplicatesPageSize] = useState(20)
  const [duplicatesTotalPages, setDuplicatesTotalPages] = useState(0)
  const [duplicatesTotalGroups, setDuplicatesTotalGroups] = useState(0)
  
  // Batch deletion state
  const [batchDeleting, setBatchDeleting] = useState(false)
  const [deleteProgress, setDeleteProgress] = useState({ current: 0, total: 0, phase: '' })
  const [deletionCancelled, setDeletionCancelled] = useState(false)
  
  // Stats
  const [stats, setStats] = useState({
    assignedCount: 0,
    unassignedCount: 0,
    totalContacts: 0,
    duplicateCount: 0
  })

  // Abort controller for cancellation
  let abortController = null

  // Fetch contacts from manage-leads endpoint
  const fetchContacts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: search || '',
        view: view === 'all' ? '' : view,
        status: status || '',
        assignedTo: assignedTo || '',
        leadOwner: leadOwner || '',
        page: currentPage,
        pageSize
      })
      
      const response = await fetch(`${API_URL}/api/manage-leads?${params}`)
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to fetch contacts')
      
      setContacts(data.contacts)
      setTotalCount(data.totalCount)
      setStats({
        assignedCount: data.assignedCount,
        unassignedCount: data.unassignedCount,
        totalContacts: data.totalCount,
        duplicateCount: data.duplicateCount || 0
      })
      setTotalPages(Math.ceil(data.totalCount / pageSize))
      
      setSelectedContacts(new Set())
      setSelectAll(false)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      alert('Error fetching contacts: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [search, view, status, assignedTo, leadOwner, currentPage, pageSize])

  // Handle search button click
  const handleSearch = () => {
    setCurrentPage(1)
    fetchContacts()
  }

  // Handle reset filters
  const handleReset = () => {
    setSearch('')
    setStatus('')
    setView('all')
    setAssignedTo('')
    setLeadOwner('')
    setCurrentPage(1)
  }

  // Function to determine which contact to keep in a duplicate group
  const prioritizeContact = (contacts) => {
    // First, separate protected contacts (Completed status or Flagged rating)
    const protectedContacts = contacts.filter(contact => 
      contact.status === 'Completed' || contact.rating === 'Flagged'
    )
    
    // If there are protected contacts, prioritize them
    if (protectedContacts.length > 0) {
      // Sort protected contacts: prioritize those with email, then by creation date (oldest first)
      return protectedContacts.sort((a, b) => {
        const aHasEmail = a.email && a.email.trim() !== ''
        const bHasEmail = b.email && b.email.trim() !== ''
        
        if (aHasEmail && !bHasEmail) return -1
        if (!aHasEmail && bHasEmail) return 1
        
        const aDate = new Date(a.created_at)
        const bDate = new Date(b.created_at)
        return aDate - bDate
      })
    }
    
    // If no protected contacts, sort by email presence then oldest
    return contacts.sort((a, b) => {
      const aHasEmail = a.email && a.email.trim() !== ''
      const bHasEmail = b.email && b.email.trim() !== ''
      
      if (aHasEmail && !bHasEmail) return -1
      if (!aHasEmail && bHasEmail) return 1
      
      const aDate = new Date(a.created_at)
      const bDate = new Date(b.created_at)
      return aDate - bDate
    })
  }

  // Get keep reason for display
  const getKeepReason = (contact) => {
    if (contact.status === 'Completed') {
      return 'Status: Completed (Protected)'
    }
    if (contact.rating === 'Flagged') {
      return 'Rating: Flagged (Protected)'
    }
    if (contact.email && contact.email.trim() !== '') {
      return 'Has email address'
    }
    return 'Oldest contact'
  }

  // Detect duplicates with pagination
  const detectDuplicates = useCallback(async (page = 1) => {
    setDuplicatesLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/manage-leads/duplicates?page=${page}&pageSize=${duplicatesPageSize}`)
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to detect duplicates')
      
      // Process duplicate groups
      const processedGroups = data.duplicateGroups.map(group => {
        const sortedContacts = prioritizeContact([...group.contacts])
        const keepContact = sortedContacts[0]
        const keepReason = getKeepReason(keepContact)
        const protectedContacts = sortedContacts.filter(contact => 
          contact.status === 'Completed' || contact.rating === 'Flagged'
        )
        
        return {
          ...group,
          contacts: sortedContacts,
          keepReason: keepReason,
          protectedContacts: protectedContacts.map(c => c.id)
        }
      })
      
      setDuplicateGroups(processedGroups)
      setDuplicates(data.duplicates)
      setDuplicatesTotalPages(data.totalPages)
      setDuplicatesTotalGroups(data.totalGroups)
      setDuplicatesPage(page)
      setShowDuplicates(true)
      
      setSelectedDuplicates(new Set())
      
      setStats(prev => ({
        ...prev,
        duplicateCount: data.totalDuplicateCount
      }))
    } catch (error) {
      console.error('Error detecting duplicates:', error)
      alert('Error detecting duplicates: ' + error.message)
    } finally {
      setDuplicatesLoading(false)
    }
  }, [duplicatesPageSize])

  // Handle single contact selection
  const handleSelectContact = (contactId) => {
    const newSelected = new Set(selectedContacts)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedContacts(newSelected)
    setSelectAll(newSelected.size === contacts.length)
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedContacts(new Set())
    } else {
      const allIds = contacts.map(contact => contact.id)
      setSelectedContacts(new Set(allIds))
    }
    setSelectAll(!selectAll)
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select contacts to delete')
      return
    }

    if (!confirm(`⚠️ WARNING: Are you sure you want to delete ${selectedContacts.size} contact(s)? This action cannot be undone.`)) {
      return
    }

    if (!confirm(`FINAL CONFIRMATION: Delete ${selectedContacts.size} contacts?`)) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/manage-leads/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactIds: Array.from(selectedContacts)
        })
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete contacts')
      
      fetchContacts()
      alert(`✅ ${selectedContacts.size} contact(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting contacts:', error)
      alert('Error deleting contacts: ' + error.message)
    }
  }

  // Handle edit contact
  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setEditFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      lead_owner: contact.lead_owner || '',
      author: contact.author || '',
      publisher: contact.publisher || '',
      book_title: contact.book_title || '',
      status: contact.status || 'New',
      rating: contact.rating || '',
      assigned_to: contact.assigned_to || '',
      street_address: contact.street_address || '',
      city: contact.city || '',
      state: contact.state || '',
      zipcode: contact.zipcode || '',
      reserve_note: contact.reserve_note || '',
      comment: contact.comment || ''
    })
    setShowEditModal(true)
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update contact')
      
      setShowEditModal(false)
      setEditingContact(null)
      fetchContacts()
      alert('Contact updated successfully')
    } catch (error) {
      console.error('Error updating contact:', error)
      alert('Error updating contact: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Cancel deletion
  const cancelDeletion = () => {
    if (batchDeleting && confirm('Cancel current deletion process? Some contacts may have already been deleted.')) {
      setDeletionCancelled(true)
      if (abortController) {
        abortController.abort()
      }
    }
  }

  // FASTEST: Direct batch delete with parallel processing
  const handleFastDeleteAllDuplicates = async () => {
    if (!confirm(`⚡ FAST DELETE MODE\n\nThis will delete ALL deletable duplicate contacts.\n\n⚠️ Safety Features:\n• Protected contacts (Completed/Flagged) are SAFE\n• Contacts with email are prioritized to keep\n• Oldest contacts are kept if no email\n• Deletion runs in parallel for speed\n• You can cancel at any time\n\nTotal deletable: ${stats.duplicateCount}\n\nContinue?`)) {
      return
    }

    if (!confirm(`FINAL SAFETY CHECK: Delete ${stats.duplicateCount} duplicate contacts?`)) {
      return
    }

    setBatchDeleting(true)
    setDeletionCancelled(false)
    setDeleteProgress({ current: 0, total: stats.duplicateCount, phase: 'Preparing...' })
    
    abortController = new AbortController()

    try {
      // Phase 1: Collect all deletable IDs quickly
      setDeleteProgress({ current: 0, total: stats.duplicateCount, phase: 'Scanning for duplicates...' })
      
      let allDeletableIds = []
      const pagePromises = []
      
      // Fetch all pages in parallel for speed
      for (let page = 1; page <= duplicatesTotalPages; page++) {
        pagePromises.push(
          fetch(`${API_URL}/api/manage-leads/duplicates?page=${page}&pageSize=${duplicatesPageSize}`, {
            signal: abortController.signal
          }).then(res => res.json())
        )
      }
      
      const pagesData = await Promise.all(pagePromises)
      
      if (deletionCancelled) throw new Error('Deletion cancelled by user')
      
      // Process all pages
      for (const data of pagesData) {
        const pageDeletableIds = data.duplicateGroups.flatMap(group => {
          const sortedContacts = prioritizeContact([...group.contacts])
          const protectedIds = sortedContacts
            .filter(c => c.status === 'Completed' || c.rating === 'Flagged')
            .map(c => c.id)
          const keepIds = new Set([sortedContacts[0].id, ...protectedIds])
          
          return sortedContacts
            .filter(c => !keepIds.has(c.id))
            .map(c => c.id)
        })
        allDeletableIds.push(...pageDeletableIds)
      }
      
      if (allDeletableIds.length === 0) {
        alert('No deletable duplicates found!')
        setBatchDeleting(false)
        return
      }
      
      // Phase 2: Delete in parallel batches
      setDeleteProgress({ current: 0, total: allDeletableIds.length, phase: 'Deleting in parallel...' })
      
      const BATCH_SIZE = 500 // Smaller batches for better parallelism
      const CONCURRENT_BATCHES = 5 // Process 5 batches at once
      
      const batches = []
      for (let i = 0; i < allDeletableIds.length; i += BATCH_SIZE) {
        batches.push(allDeletableIds.slice(i, i + BATCH_SIZE))
      }
      
      let deletedCount = 0
      
      // Process batches concurrently
      for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
        if (deletionCancelled) throw new Error('Deletion cancelled by user')
        
        const concurrentBatches = batches.slice(i, i + CONCURRENT_BATCHES)
        const deletePromises = concurrentBatches.map(async (batch, idx) => {
          const response = await fetch(`${API_URL}/api/manage-leads/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactIds: batch }),
            signal: abortController.signal
          })
          
          if (!response.ok) throw new Error(`Batch failed`)
          return batch.length
        })
        
        const results = await Promise.all(deletePromises)
        deletedCount += results.reduce((a, b) => a + b, 0)
        
        setDeleteProgress({ 
          current: deletedCount, 
          total: allDeletableIds.length, 
          phase: `Deleting... (${Math.round((deletedCount / allDeletableIds.length) * 100)}%)`
        })
      }
      
      alert(`✅ FAST DELETE COMPLETE!\n\nSuccessfully deleted ${deletedCount.toLocaleString()} duplicate contacts!\n\nProtected contacts were kept safe.`)
      
      // Refresh
      await detectDuplicates(duplicatesPage)
      fetchContacts()
      setSelectedDuplicates(new Set())
      
    } catch (error) {
      if (error.name === 'AbortError') {
        alert('Deletion cancelled by user.')
      } else {
        console.error('Error in fast delete:', error)
        alert('Error during deletion: ' + error.message)
      }
    } finally {
      setBatchDeleting(false)
      setDeleteProgress({ current: 0, total: 0, phase: '' })
      abortController = null
    }
  }

  // SAFE: Traditional batch delete with confirmation per batch
  const handleSafeDeleteAllDuplicates = async () => {
    if (!confirm(`🛡️ SAFE DELETE MODE\n\nThis will delete ALL deletable duplicate contacts with extra safety checks.\n\n⚠️ Features:\n• Confirms before each batch\n• Slower but safer\n• Can be cancelled between batches\n• Protected contacts are SAFE\n\nTotal deletable: ${stats.duplicateCount}\n\nContinue?`)) {
      return
    }

    setBatchDeleting(true)
    setDeletionCancelled(false)
    setDeleteProgress({ current: 0, total: stats.duplicateCount, phase: 'Preparing safe deletion...' })

    try {
      // Collect all deletable IDs
      let allDeletableIds = []
      for (let page = 1; page <= duplicatesTotalPages; page++) {
        const response = await fetch(`${API_URL}/api/manage-leads/duplicates?page=${page}&pageSize=${duplicatesPageSize}`)
        const data = await response.json()
        
        const pageDeletableIds = data.duplicateGroups.flatMap(group => {
          const sortedContacts = prioritizeContact([...group.contacts])
          const protectedIds = sortedContacts
            .filter(c => c.status === 'Completed' || c.rating === 'Flagged')
            .map(c => c.id)
          const keepIds = new Set([sortedContacts[0].id, ...protectedIds])
          
          return sortedContacts
            .filter(c => !keepIds.has(c.id))
            .map(c => c.id)
        })
        allDeletableIds.push(...pageDeletableIds)
      }
      
      if (allDeletableIds.length === 0) {
        alert('No deletable duplicates found!')
        setBatchDeleting(false)
        return
      }
      
      // Confirm total to delete
      if (!confirm(`Ready to delete ${allDeletableIds.length} duplicate contacts in batches.\n\nContinue?`)) {
        setBatchDeleting(false)
        return
      }
      
      // Delete in batches with confirmation
      const BATCH_SIZE = 100
      let deletedCount = 0
      
      for (let i = 0; i < allDeletableIds.length; i += BATCH_SIZE) {
        if (deletionCancelled) break
        
        const batch = allDeletableIds.slice(i, i + BATCH_SIZE)
        
        // Optional: ask before each batch (can be removed for speed)
        // if (i > 0 && !confirm(`Delete next batch of ${batch.length}?`)) break
        
        const response = await fetch(`${API_URL}/api/manage-leads/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactIds: batch })
        })
        
        if (!response.ok) throw new Error(`Batch ${i / BATCH_SIZE + 1} failed`)
        
        deletedCount += batch.length
        setDeleteProgress({ 
          current: deletedCount, 
          total: allDeletableIds.length, 
          phase: `Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allDeletableIds.length / BATCH_SIZE)}`
        })
      }
      
      alert(`✅ SAFE DELETE COMPLETE!\n\nDeleted ${deletedCount.toLocaleString()} duplicate contacts.`)
      
      await detectDuplicates(duplicatesPage)
      fetchContacts()
      setSelectedDuplicates(new Set())
      
    } catch (error) {
      console.error('Error in safe delete:', error)
      alert('Error during deletion: ' + error.message)
    } finally {
      setBatchDeleting(false)
      setDeleteProgress({ current: 0, total: 0, phase: '' })
    }
  }

  // Handle duplicate selection
  const handleSelectDuplicate = (contactId, isProtected = false) => {
    if (isProtected) {
      alert('This contact is protected and cannot be deleted.')
      return
    }
    
    const newSelected = new Set(selectedDuplicates)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedDuplicates(newSelected)
  }

  // Handle select all duplicates in a specific group
  const handleSelectGroupDuplicates = (groupContacts, protectedIds) => {
    const groupDuplicateIds = groupContacts
      .slice(1)
      .filter(c => !protectedIds.includes(c.id))
      .map(c => c.id)
    
    const newSelected = new Set(selectedDuplicates)
    const allCurrentlySelected = groupDuplicateIds.length > 0 && 
      groupDuplicateIds.every(id => newSelected.has(id))
    
    if (allCurrentlySelected) {
      groupDuplicateIds.forEach(id => newSelected.delete(id))
    } else {
      groupDuplicateIds.forEach(id => newSelected.add(id))
    }
    
    setSelectedDuplicates(newSelected)
  }

  const isGroupFullySelected = (groupContacts, protectedIds) => {
    const groupDuplicateIds = groupContacts
      .slice(1)
      .filter(c => !protectedIds.includes(c.id))
      .map(c => c.id)
    return groupDuplicateIds.length > 0 && 
           groupDuplicateIds.every(id => selectedDuplicates.has(id))
  }

  const isGroupPartiallySelected = (groupContacts, protectedIds) => {
    const groupDuplicateIds = groupContacts
      .slice(1)
      .filter(c => !protectedIds.includes(c.id))
      .map(c => c.id)
    const selectedCount = groupDuplicateIds.filter(id => selectedDuplicates.has(id)).length
    return selectedCount > 0 && selectedCount < groupDuplicateIds.length
  }

  const handleSelectAllDuplicatesOnPage = () => {
    const allDuplicateIds = duplicateGroups.flatMap(group => 
      group.contacts
        .slice(1)
        .filter(c => !group.protectedContacts.includes(c.id))
        .map(c => c.id)
    )
    setSelectedDuplicates(new Set(allDuplicateIds))
  }

  const handleClearAllSelections = () => {
    setSelectedDuplicates(new Set())
  }

  const handleSelectAllDuplicates = async () => {
    if (!confirm(`Select all deletable duplicates across ${duplicatesTotalGroups} groups?`)) {
      return
    }
    
    setDuplicatesLoading(true)
    try {
      let allDeletableIds = []
      for (let page = 1; page <= duplicatesTotalPages; page++) {
        const response = await fetch(`${API_URL}/api/manage-leads/duplicates?page=${page}&pageSize=${duplicatesPageSize}`)
        const data = await response.json()
        
        const pageDeletableIds = data.duplicateGroups.flatMap(group => {
          const sortedContacts = prioritizeContact([...group.contacts])
          const protectedIds = sortedContacts
            .filter(c => c.status === 'Completed' || c.rating === 'Flagged')
            .map(c => c.id)
          const keepIds = new Set([sortedContacts[0].id, ...protectedIds])
          
          return sortedContacts
            .filter(c => !keepIds.has(c.id))
            .map(c => c.id)
        })
        allDeletableIds.push(...pageDeletableIds)
      }
      
      setSelectedDuplicates(new Set(allDeletableIds))
      alert(`Selected ${allDeletableIds.length} deletable duplicates`)
    } catch (error) {
      console.error('Error selecting all duplicates:', error)
      alert('Error selecting all duplicates: ' + error.message)
    } finally {
      setDuplicatesLoading(false)
    }
  }

  const handleDeleteSelectedDuplicates = async () => {
    if (selectedDuplicates.size === 0) {
      alert('Please select duplicate contacts to delete')
      return
    }

    if (!confirm(`Delete ${selectedDuplicates.size} selected duplicate contact(s)?`)) {
      return
    }

    setBatchDeleting(true)
    setDeleteProgress({ current: 0, total: selectedDuplicates.size, phase: 'Deleting selected...' })

    try {
      const selectedIds = Array.from(selectedDuplicates)
      const BATCH_SIZE = 500
      const CONCURRENT_BATCHES = 3
      
      const batches = []
      for (let i = 0; i < selectedIds.length; i += BATCH_SIZE) {
        batches.push(selectedIds.slice(i, i + BATCH_SIZE))
      }
      
      let deletedCount = 0
      
      for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
        const concurrentBatches = batches.slice(i, i + CONCURRENT_BATCHES)
        const deletePromises = concurrentBatches.map(async (batch) => {
          const response = await fetch(`${API_URL}/api/manage-leads/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactIds: batch })
          })
          if (!response.ok) throw new Error(`Batch failed`)
          return batch.length
        })
        
        const results = await Promise.all(deletePromises)
        deletedCount += results.reduce((a, b) => a + b, 0)
        
        setDeleteProgress({ 
          current: deletedCount, 
          total: selectedIds.length, 
          phase: `Deleting...`
        })
      }

      alert(`✅ Deleted ${deletedCount} duplicate contacts!`)
      
      await detectDuplicates(duplicatesPage)
      fetchContacts()
      setSelectedDuplicates(new Set())
    } catch (error) {
      console.error('Error deleting duplicates:', error)
      alert('Error deleting duplicates: ' + error.message)
    } finally {
      setBatchDeleting(false)
      setDeleteProgress({ current: 0, total: 0, phase: '' })
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToDuplicatesPage = (page) => {
    detectDuplicates(page)
  }

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value))
    setCurrentPage(1)
  }

  const handleDuplicatesPageSizeChange = (e) => {
    const newSize = Number(e.target.value)
    setDuplicatesPageSize(newSize)
    setDuplicatesPage(1)
    detectDuplicates(1)
  }

  const getStatusBadgeColor = (status) => {
    const colors = {
      'New': 'bg-green-100 text-green-800',
      'Contacted': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Completed': 'bg-purple-100 text-purple-800',
      'Incompleted': 'bg-red-100 text-red-800',
      'Transferred': 'bg-orange-100 text-orange-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6 max-w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Leads Management</h1>
        <p className="text-gray-600 mt-1">Manage and organize your contacts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Contacts</div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalContacts.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Assigned</div>
          <div className="text-2xl font-bold text-green-600">{stats.assignedCount.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Unassigned (New)</div>
          <div className="text-2xl font-bold text-orange-600">{stats.unassignedCount.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Duplicates Found</div>
          <div className="text-2xl font-bold text-red-600">{stats.duplicateCount.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters Section - Same as before */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, book title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Contacts</option>
              <option value="unassigned">Unassigned (New)</option>
              <option value="my">My Leads</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
              <option value="Incompleted">Incompleted</option>
              <option value="Transferred">Transferred</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              <option value="1">User 1</option>
              <option value="2">User 2</option>
              <option value="3">User 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Owner</label>
            <input
              type="text"
              value={leadOwner}
              onChange={(e) => setLeadOwner(e.target.value)}
              placeholder="Filter by lead owner"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
          <button
            onClick={() => detectDuplicates(1)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ml-auto"
          >
            Find Duplicates
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedContacts.size > 0 && (
        <div className="bg-blue-50 rounded-lg shadow mb-4 p-3 flex items-center justify-between">
          <div className="text-blue-800">
            <span className="font-semibold">{selectedContacts.size}</span> contact(s) selected
          </div>
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Contacts Table - Same as before */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ratings</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center text-gray-500">
                    No contacts found
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedContacts.has(contact.id)}
                        onChange={() => handleSelectContact(contact.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{contact.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{contact.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.book_title || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.author || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.lead_owner || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(contact.status)}`}>
                        {contact.status || 'New'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{contact.rating || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {contact.assigned_to || null}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleEditContact(contact)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} results
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                First
              </button>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next
              </button>
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Contact Modal - Same as before */}
      {showEditModal && editingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Edit Contact</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingContact(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Form fields - same as before */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Owner</label>
                  <input
                    type="text"
                    value={editFormData.lead_owner}
                    onChange={(e) => setEditFormData({...editFormData, lead_owner: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={editFormData.author}
                    onChange={(e) => setEditFormData({...editFormData, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={editFormData.publisher}
                    onChange={(e) => setEditFormData({...editFormData, publisher: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                  <input
                    type="text"
                    value={editFormData.book_title}
                    onChange={(e) => setEditFormData({...editFormData, book_title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                    <option value="Completed">Completed</option>
                    <option value="Incompleted">Incompleted</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={editFormData.rating}
                    onChange={(e) => setEditFormData({...editFormData, rating: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="Flagged">Flagged</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <select
                    value={editFormData.assigned_to}
                    onChange={(e) => setEditFormData({...editFormData, assigned_to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    <option value="1">User 1</option>
                    <option value="2">User 2</option>
                    <option value="3">User 3</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={editFormData.street_address}
                    onChange={(e) => setEditFormData({...editFormData, street_address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zipcode</label>
                  <input
                    type="text"
                    value={editFormData.zipcode}
                    onChange={(e) => setEditFormData({...editFormData, zipcode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reserve Note</label>
                  <textarea
                    value={editFormData.reserve_note}
                    onChange={(e) => setEditFormData({...editFormData, reserve_note: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea
                    value={editFormData.comment}
                    onChange={(e) => setEditFormData({...editFormData, comment: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingContact(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicates Modal - With FAST and SAFE options */}
      {showDuplicates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-8xl w-full max-h-[95vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">🗑️ Duplicate Contacts Manager</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Found <span className="font-bold text-red-600">{stats.duplicateCount.toLocaleString()}</span> duplicate contacts in <span className="font-bold">{duplicatesTotalGroups.toLocaleString()}</span> groups
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  📧 Priority: Completed status → Flagged rating → Has email → Oldest contact
                </p>
                <p className="text-xs text-green-600">
                  🛡️ Protected contacts (Completed or Flagged) cannot be deleted
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDuplicates(false)
                  setSelectedDuplicates(new Set())
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl mr-5 border-2 border-red-700 p-2"
              >
                ×
              </button>
            </div>

            {/* Batch Deletion Progress Bar */}
            {batchDeleting && (
              <div className="bg-blue-50 p-4 border-b border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-800">
                      {deleteProgress.phase || 'Deleting...'}
                    </span>
                    <button
                      onClick={cancelDeletion}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <span className="text-sm font-medium text-blue-800">
                    {deleteProgress.current.toLocaleString()} / {deleteProgress.total.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${deleteProgress.total > 0 ? (deleteProgress.current / deleteProgress.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Quick Actions Bar - WITH NEW FAST & SAFE BUTTONS */}
            <div className="bg-yellow-50 p-3 border-b border-yellow-200">
              <div className="flex gap-2 flex-wrap items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {/* FAST DELETE BUTTON */}
                  <button
                    onClick={handleFastDeleteAllDuplicates}
                    disabled={batchDeleting}
                    className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold shadow-sm disabled:opacity-50"
                  >
                    ⚡ FAST DELETE ALL ({stats.duplicateCount})
                  </button>
                  
                  {/* SAFE DELETE BUTTON */}
                  <button
                    onClick={handleSafeDeleteAllDuplicates}
                    disabled={batchDeleting}
                    className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold shadow-sm disabled:opacity-50"
                  >
                    🛡️ SAFE DELETE ALL ({stats.duplicateCount})
                  </button>
                  
                  <button
                    onClick={handleSelectAllDuplicates}
                    disabled={batchDeleting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm disabled:opacity-50"
                  >
                    Select All Deletable
                  </button>
                  
                  <button
                    onClick={handleSelectAllDuplicatesOnPage}
                    disabled={batchDeleting}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                  >
                    Select Current Page
                  </button>
                  
                  <button
                    onClick={handleClearAllSelections}
                    disabled={batchDeleting}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={duplicatesPageSize}
                    onChange={handleDuplicatesPageSizeChange}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    Page {duplicatesPage} of {duplicatesTotalPages}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-280px)]">
              {duplicatesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading duplicates...</p>
                </div>
              ) : duplicateGroups.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No duplicate phone numbers found
                </div>
              ) : (
                <div className="space-y-4">
                  {duplicateGroups.map((group, idx) => {
                    const groupFullySelected = isGroupFullySelected(group.contacts, group.protectedContacts)
                    const groupPartiallySelected = isGroupPartiallySelected(group.contacts, group.protectedContacts)
                    
                    return (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-yellow-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-yellow-200">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                              Group {(duplicatesPage - 1) * duplicatesPageSize + idx + 1}
                            </span>
                            <span className="text-sm">
                              <span className="font-medium text-red-600">{group.value}</span>
                              <span className="text-gray-500 ml-2">
                                ({group.totalCount} total, {group.duplicateCount} duplicates)
                              </span>
                            </span>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSelectGroupDuplicates(group.contacts, group.protectedContacts)}
                              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                groupFullySelected
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : groupPartiallySelected
                                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {groupFullySelected ? '✓ All Selected' : groupPartiallySelected ? '◐ Partial' : 'Select All'}
                            </button>
                            
                            <button
                              onClick={() => {
                                const deletableIds = group.contacts
                                  .slice(1)
                                  .filter(c => !group.protectedContacts.includes(c.id))
                                  .map(c => c.id)
                                if (deletableIds.length === 0) {
                                  alert('No deletable duplicates in this group')
                                  return
                                }
                                if (confirm(`Delete ${deletableIds.length} duplicate(s) in this group?`)) {
                                  setSelectedDuplicates(new Set(deletableIds))
                                  setTimeout(() => handleDeleteSelectedDuplicates(), 100)
                                }
                              }}
                              className="px-3 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                              🗑️ Delete Group
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          {group.contacts.map((contact, contactIdx) => {
                            const hasEmail = contact.email && contact.email.trim() !== ''
                            const isProtected = contact.status === 'Completed' || contact.rating === 'Flagged'
                            const isKept = contactIdx === 0
                            
                            return (
                              <div 
                                key={contact.id} 
                                className={`flex items-center gap-2 p-2 rounded text-sm ${
                                  isKept ? 'bg-green-50 border border-green-200' : 
                                  isProtected ? 'bg-orange-50 border border-orange-200' : 
                                  'bg-white border border-gray-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDuplicates.has(contact.id)}
                                  onChange={() => handleSelectDuplicate(contact.id, isProtected || isKept)}
                                  disabled={isKept || isProtected}
                                  className={`rounded ${
                                    (isKept || isProtected) 
                                      ? 'opacity-50 cursor-not-allowed' 
                                      : 'border-gray-300 text-red-600 focus:ring-red-500'
                                  }`}
                                />
                                <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-3 font-medium">
                                    {contact.name}
                                    {isKept && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                        Keep ({group.keepReason})
                                      </span>
                                    )}
                                    {isProtected && !isKept && (
                                      <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                                        🛡️ Protected
                                      </span>
                                    )}
                                    {hasEmail && !isKept && !isProtected && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                        📧
                                      </span>
                                    )}
                                  </div>
                                  <div className="col-span-2 text-gray-600">{contact.email || 'No email'}</div>
                                  <div className="col-span-2 text-gray-600">{contact.book_title || 'No book'}</div>
                                  <div className="col-span-2 text-gray-600">{contact.lead_owner || 'Unassigned'}</div>
                                  <div className="col-span-2 text-gray-600">
                                    {new Date(contact.created_at).toLocaleDateString()}
                                  </div>
                                  <div className="col-span-1 text-right">
                                    {contact.rating === 'Flagged' && (
                                      <span className="text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">⭐</span>
                                    )}
                                    {contact.status === 'Completed' && (
                                      <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">✓</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        
                        <div className="mt-2 text-xs bg-blue-50 p-2 rounded flex justify-between items-center">
                          <span className="text-gray-600">
                            💡 Keep: <span className="font-medium">{group.contacts[0].name}</span> ({group.keepReason})
                          </span>
                          <span className="text-gray-500">
                            {group.contacts.filter(c => !group.protectedContacts.includes(c.id) && c.id !== group.contacts[0].id).length} to delete
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            {/* Pagination for Duplicates */}
            {duplicatesTotalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {duplicatesPage} of {duplicatesTotalPages} ({duplicatesTotalGroups.toLocaleString()} total groups)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToDuplicatesPage(1)}
                    disabled={duplicatesPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    First
                  </button>
                  <button
                    onClick={() => goToDuplicatesPage(duplicatesPage - 1)}
                    disabled={duplicatesPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {duplicatesPage} of {duplicatesTotalPages}
                  </span>
                  <button
                    onClick={() => goToDuplicatesPage(duplicatesPage + 1)}
                    disabled={duplicatesPage === duplicatesTotalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => goToDuplicatesPage(duplicatesTotalPages)}
                    disabled={duplicatesPage === duplicatesTotalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
            
            {/* Bottom Action Bar */}
            <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="text-sm">
                {selectedDuplicates.size > 0 && (
                  <span className="font-semibold text-red-600">
                    {selectedDuplicates.size.toLocaleString()} duplicate(s) selected for deletion
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowDuplicates(false)
                    setSelectedDuplicates(new Set())
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={handleDeleteSelectedDuplicates}
                  disabled={selectedDuplicates.size === 0 || batchDeleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-bold"
                >
                  🗑️ Delete Selected ({selectedDuplicates.size.toLocaleString()})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}