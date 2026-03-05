// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaFileInvoice, FaTimes, 
//          FaBuilding, FaPhone, FaMapMarkerAlt, FaTag, FaCalendarAlt, 
//          FaShippingFast, FaBoxOpen, FaReceipt, FaMoneyBillWave, 
//          FaArrowLeft, FaPrint, FaSave, FaCheckCircle, FaClock, FaHourglassHalf, 
//          FaExclamationTriangle, FaChevronDown, FaChevronRight, 
//          FaBook,
//          FaPuzzlePiece,
//          FaCode,
//          FaCodeBranch,
//          FaCodepen} from "react-icons/fa";

// const API_URL = import.meta.env.VITE_API_URL;

// // Status options for dropdown
// const STATUS_OPTIONS = [
//   { value: "Ordered", label: "Ordered", color: "blue", icon: FaCheckCircle },
//   { value: "Pending", label: "Pending", color: "yellow", icon: FaClock },
//   { value: "Processing", label: "Processing", color: "purple", icon: FaHourglassHalf },
//   { value: "Approved", label: "Approved", color: "green", icon: FaCheckCircle }
// ];

// export default function PurchaseOrder() {
//   const [form, setForm] = useState({
//     vendor: "",
//     address: "",
//     phone: "",
//     poNumber: "",
//     bookstore: "",
//     zipcode: "",
//     date: new Date().toISOString().split('T')[0],
//     items: [{ author: "", book: "", qty: '', price: '', status: "" }],
//     shipping: 0,
//     handling: 0,
//     tax: 0,
//   });

//   const [orders, setOrders] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [preview, setPreview] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [expandedVendors, setExpandedVendors] = useState(new Set());

//   // Fetch orders on component mount
//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   // Group orders by vendor when orders change
//   useEffect(() => {
//     if (orders.length > 0) {
//       const vendorsMap = new Map();
      
//       orders.forEach(order => {
//         if (!vendorsMap.has(order.vendor)) {
//           vendorsMap.set(order.vendor, {
//             name: order.vendor,
//             address: order.address,
//             phone: order.phone,
//             zipcode: order.zipcode,
//             purchaseOrders: []
//           });
//         }
//         vendorsMap.get(order.vendor).purchaseOrders.push(order);
//       });
      
//       setVendors(Array.from(vendorsMap.values()));
      
//       // Expand all vendors by default
//       const vendorNames = Array.from(vendorsMap.keys());
//       setExpandedVendors(new Set(vendorNames));
//     } else {
//       setVendors([]);
//       setExpandedVendors(new Set());
//     }
//   }, [orders]);

//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return '';
    
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return dateString;
    
//     const adjustedDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000));
    
//     return adjustedDate.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit'
//     });
//   };

//   const fetchOrders = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_URL}/api/purchase-orders`);
//       setOrders(response.data);
//       setError("");
//     } catch (err) {
//       console.error("Error fetching orders:", err);
//       setError("Error fetching purchase orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleVendorExpansion = (vendorName) => {
//     const newExpanded = new Set(expandedVendors);
//     if (newExpanded.has(vendorName)) {
//       newExpanded.delete(vendorName);
//     } else {
//       newExpanded.add(vendorName);
//     }
//     setExpandedVendors(newExpanded);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value } = e.target;
//     const updatedItems = [...form.items];
    
//     if (name === 'qty' || name === 'price') {
//       if (value === '') {
//         updatedItems[index][name] = '';
//       } else {
//         const parsedValue = parseFloat(value);
//         updatedItems[index][name] = isNaN(parsedValue) ? '' : parsedValue;
//       }
//     } else {
//       updatedItems[index][name] = value;
//     }
    
//     setForm({ ...form, items: updatedItems });
//   };

//   const addItem = () => {
//     setForm({ ...form, items: [...form.items, { author: "", book: "", qty: '', price: '', status: "" }] });
//   };

//   const removeItem = (index) => {
//     if (form.items.length <= 1) return;
//     const updatedItems = [...form.items];
//     updatedItems.splice(index, 1);
//     setForm({ ...form, items: updatedItems });
//   };

//   const resetForm = () => {
//     setForm({
//       vendor: "",
//       address: "",
//       phone: "",
//       poNumber: "",
//       bookstore: "",
//       zipcode: "",
//       date: new Date().toISOString().split('T')[0],
//       items: [{ author: "", book: "", qty: '', price: '', status: "" }],
//       shipping: 0,
//       handling: 0,
//       tax: 0,
//     });
//     setPreview(false);
//     setEditingId(null);
//     setError("");
//   };

//   const formatDateForMySQL = (dateString) => {
//     if (!dateString) return new Date().toISOString().split('T')[0];
    
//     if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
//       return dateString;
//     }
    
//     if (typeof dateString === 'string' && dateString.includes('T')) {
//       return dateString.split('T')[0];
//     }
    
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   const handleSave = async () => {
//     try {
//       const formattedData = {
//         ...form,
//         date: formatDateForMySQL(form.date)
//       };
      
//       if (editingId) {
//         await axios.put(`${API_URL}/api/purchase-orders/${editingId}`, formattedData);
//       } else {
//         await axios.post(`${API_URL}/api/purchase-orders`, formattedData);
//       }
//       alert(`Purchase order ${editingId ? 'updated' : 'saved'} successfully!`);
//       setShowModal(false);
//       resetForm();
//       fetchOrders();
//     } catch (err) {
//       console.error(err);
//       setError(`Error ${editingId ? 'updating' : 'saving'} purchase order.`);
//     }
//   };

//   const handleEdit = (order) => {
//     const orderDate = order.date ? new Date(order.date) : new Date();
//     const adjustedDate = new Date(orderDate.getTime() + Math.abs(orderDate.getTimezoneOffset() * 60000));
//     const formattedDate = adjustedDate.toISOString().split('T')[0];
    
//     setForm({
//       ...order,
//       shipping: parseFloat(order.shipping) || 0,
//       handling: parseFloat(order.handling) || 0,
//       tax: parseFloat(order.tax) || 0,
//       items: order.items.map(item => ({
//         ...item,
//         qty: parseInt(item.qty) || 0,
//         price: parseFloat(item.price) || 0,
//         status: item.status
//       })),
//       date: formattedDate
//     });
//     setEditingId(order._id);
//     setShowModal(true);
//   };

//   const handleView = (order) => {
//     const orderDate = order.date ? new Date(order.date) : new Date();
//     const adjustedDate = new Date(orderDate.getTime() + Math.abs(orderDate.getTimezoneOffset() * 60000));
//     const formattedDate = adjustedDate.toISOString().split('T')[0];
    
//     setForm({
//       ...order,
//       shipping: parseFloat(order.shipping) || 0,
//       handling: parseFloat(order.handling) || 0,
//       tax: parseFloat(order.tax) || 0,
//       items: order.items.map(item => ({
//         ...item,
//         qty: parseInt(item.qty) || 0,
//         price: parseFloat(item.price) || 0,
//         status: item.status
//       })),
//       date: formattedDate
//     });
//     setPreview(true);
//     setShowModal(true);
//   };

//   // Status badge component
//   const StatusBadge = ({ status }) => {
//     if (!status) {
//       return (
//         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//           <FaExclamationTriangle className="w-3 h-3" />
//           Not Set
//         </span>
//       );
//     }
    
//     const statusConfig = STATUS_OPTIONS.find(opt => opt.value === status);
//     if (!statusConfig) {
//       return (
//         <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//           <FaExclamationTriangle className="w-3 h-3" />
//           {status}
//         </span>
//       );
//     }
    
//     const IconComponent = statusConfig.icon;
    
//     const colorClasses = {
//       blue: "bg-blue-100 text-blue-800",
//       yellow: "bg-yellow-100 text-yellow-800",
//       purple: "bg-purple-100 text-purple-800",
//       green: "bg-green-100 text-green-800"
//     };

//     return (
//       <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusConfig.color]}`}>
//         <IconComponent className="w-3 h-3" />
//         {statusConfig.label}
//       </span>
//     );
//   };  
  
//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this purchase order?")) {
//       try {
//         await axios.delete(`${API_URL}/api/purchase-orders/${id}`);
//         alert("Purchase order deleted successfully!");
//         fetchOrders();
//       } catch (err) {
//         console.error("Error deleting order:", err);
//         setError("Error deleting purchase order");
//       }
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchTerm.trim()) {
//       fetchOrders();
//       return;
//     }
    
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_URL}/api/purchase-orders/search/${encodeURIComponent(searchTerm)}`);
//       setOrders(response.data);
//       setError("");
//     } catch (err) {
//       console.error("Error searching orders:", err);
//       setError("Error searching purchase orders");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setTimeout(() => {
//       resetForm();
//     }, 300);
//   };

//   const subtotal = form.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
//   const total = subtotal + Number(form.shipping) + Number(form.handling) + Number(form.tax);

//   const getOrderStatus = (order) => {
//     const allItemsOrdered = order.items.length > 0 && 
//       order.items.every(item => item.status === "Ordered");
    
//     const hasEmptyStatus = order.items.some(item => !item.status || item.status === "");
    
//     if (allItemsOrdered) {
//       return { status: "Complete", bgColor: "bg-green-100", textColor: "text-green-700", iconColor: "text-green-600", icon: FaCheckCircle };
//     } else if (hasEmptyStatus) {
//       return { status: "Incomplete", bgColor: "bg-yellow-100", textColor: "text-yellow-700", iconColor: "text-yellow-600", icon: FaClock };
//     } else {
//       return { status: "Not Complete", bgColor: "bg-red-100", textColor: "text-red-700", iconColor: "text-red-600", icon: FaExclamationTriangle };
//     }
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-gray-50 p-4">
//         <div className="max-w-8xl mx-auto">
//           {/* Header Section */}
//           <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
//                   <FaFileInvoice className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
//                   <p className="text-sm text-gray-500 mt-1">Manage vendors and their purchase orders</p>
//                 </div>
//               </div>
              
//               <button 
//                 onClick={() => setShowModal(true)}
//                 className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-lg flex items-center gap-2 shadow-md"
//               >
//                 <FaPlus className="w-5 h-5" />
//                 Add Vendor
//               </button>
//             </div>
//           </div>

//           {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
//               <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               {error}
//             </div>
//           )}

//           {/* Search and Filters Section */}
//           <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
//               <div className="flex-1 relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FaSearch className="text-gray-400" />
//                 </div>
//                 <input
//                   className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Search vendors or PO numbers..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//                 />
//               </div>
//               <div className="flex gap-2 w-full sm:w-auto">
//                 <button
//                   onClick={handleSearch}
//                   className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
//                 >
//                   <FaSearch className="w-4 h-4" />
//                   Search
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSearchTerm("");
//                     fetchOrders();
//                   }}
//                   className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
//                 >
//                   <FaTimes className="w-4 h-4" />
//                   Clear
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Vendors and P.O.s Table */}
//           {loading ? (
//             <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           ) : vendors.length > 0 ? (
//             <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead>
//                     <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
//                       <th className="p-4 text-left font-medium w-8"></th>
//                       <th className="p-4 text-left font-medium">Vendor</th>
//                       <th className="p-4 text-left font-medium">Contact</th>
//                       <th className="p-4 text-left font-medium">Total P.O.s</th>
//                       <th className="p-4 text-left font-medium">Total Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {vendors.map(vendor => {
//                       const isExpanded = expandedVendors.has(vendor.name);
//                       const totalPOs = vendor.purchaseOrders.length;
//                       const totalAmount = vendor.purchaseOrders.reduce((sum, po) => {
//                         const poTotal = po.items.reduce((itemSum, item) => 
//                           itemSum + (item.qty * item.price), 0
//                         ) + Number(po.shipping) + Number(po.handling) + Number(po.tax);
//                         return sum + poTotal;
//                       }, 0);

//                       return (
//                         <React.Fragment key={vendor.name}>
//                           {/* Vendor Header Row */}
//                           <tr className="hover:bg-gray-50 bg-gray-50 even:bg-gray-100">
//                             <td className="p-4">
//                               <button
//                                 onClick={() => toggleVendorExpansion(vendor.name)}
//                                 className="text-gray-600 hover:text-gray-800 transition-colors"
//                               >
//                                 {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
//                               </button>
//                             </td>
//                             <td className="p-4">
//                               <div className="flex items-center">
//                                 <div className="bg-blue-100 p-2 rounded-lg mr-3">
//                                   <FaBuilding className="text-blue-600" />
//                                 </div>
//                                 <span className="font-medium text-gray-900">{vendor.name}</span>
//                               </div>
//                             </td>
//                             <td className="p-4">
//                               <div className="text-gray-700">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <FaPhone className="text-gray-400" />
//                                   {vendor.phone}
//                                 </div>
//                                 <div className="flex items-center gap-2 text-sm">
//                                   <FaMapMarkerAlt className="text-gray-400" />
//                                   <span className="truncate max-w-xs">{vendor.address}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2 text-sm">
//                                   <FaCodepen className="text-gray-400" />
//                                   <span className="truncate max-w-xs">{vendor.zipcode}</span>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="p-4">
//                               <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                                 {totalPOs} P.O.{totalPOs !== 1 ? 's' : ''}
//                               </span>
//                             </td>
//                             <td className="p-4">
//                               <span className="font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
//                             </td>
//                           </tr>

//                           {/* Purchase Orders Rows (Expanded) */}
//                           {isExpanded && vendor.purchaseOrders.map(order => {
//                             const orderTotal = order.items.reduce((sum, item) => 
//                               sum + (item.qty * item.price), 0
//                             ) + Number(order.shipping) + Number(order.handling) + Number(order.tax);
                            
//                             const statusConfig = getOrderStatus(order);
//                             const StatusIcon = statusConfig.icon;

//                             return (
//                               <tr key={order._id} className="hover:bg-gray-50 bg-white border-l-4 border-blue-200">
//                                 <td className="p-4"></td>
//                                 <td className="p-4 pl-8">
//                                   <div className="flex items-center">
//                                     <div className="bg-purple-100 p-2 rounded-lg mr-3">
//                                       <FaTag className="text-purple-600" />
//                                     </div>
//                                     <div>
//                                       <span className="font-medium text-gray-900">{order.poNumber}</span>
//                                       <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
//                                         <FaCalendarAlt className="text-gray-400" />
//                                         {formatDateForDisplay(order.date)}
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td className="p-4">
//                                   <div className="text-gray-700">
//                                     <span className="text-sm">{order.items.length} items</span>
//                                   </div>
//                                 </td>
//                                 <td className="p-4">
//                                   <div className="flex items-center">
//                                     <div className={`${statusConfig.bgColor} p-2 rounded-lg mr-3`}>
//                                       <StatusIcon className={statusConfig.iconColor} />
//                                     </div>
//                                     <span className={`font-medium ${statusConfig.textColor}`}>
//                                       {statusConfig.status}
//                                     </span>
//                                   </div>
//                                 </td>
//                                 <td className="p-4">
//                                   <div className="flex items-center justify-between">
//                                     <span className="font-medium text-gray-900">${orderTotal.toFixed(2)}</span>
//                                     <div className="flex gap-2 ml-4">
//                                       <button 
//                                         onClick={() => handleView(order)}
//                                         className="text-blue-500 hover:text-blue-700 p-2 rounded-lg transition-colors"
//                                         title="View"
//                                       >
//                                         <FaEye className="w-4 h-4" />
//                                       </button>
//                                       <button 
//                                         onClick={() => handleEdit(order)}
//                                         className="text-green-500 hover:text-green-700 p-2 rounded-lg transition-colors"
//                                         title="Edit"
//                                       >
//                                         <FaEdit className="w-4 h-4" />
//                                       </button>
//                                       <button 
//                                         onClick={() => handleDelete(order._id)}
//                                         className="text-red-500 hover:text-red-700 p-2 rounded-lg transition-colors"
//                                         title="Delete"
//                                       >
//                                         <FaTrash className="w-4 h-4" />
//                                       </button>
//                                     </div>
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </React.Fragment>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ) : (
//             <div className="bg-white rounded-xl shadow-md p-8 text-center">
//               <div className="mx-auto bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
//                 <FaFileInvoice className="h-8 w-8 text-blue-600" />
//               </div>
//               <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
//               <p className="mt-1 text-sm text-gray-500">Get started by creating a new purchase order.</p>
//               <div className="mt-6">
//                 <button
//                   onClick={() => setShowModal(true)}
//                   className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-2 px-4 rounded-xl flex items-center gap-2 mx-auto hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
//                 >
//                   <FaPlus className="w-4 h-4" />
//                   New Purchase Order
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
//           <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 rounded-t-2xl">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-xl font-bold text-gray-900">
//                   {preview ? 'Purchase Order Preview' : (editingId ? 'Edit' : 'Add') + ' Vendor P. O.'}
//                 </h3>
//                 <button
//                   onClick={closeModal}
//                   className="text-gray-400 hover:text-gray-500 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"
//                 >
//                   <FaTimes className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               {!preview ? (
//                 <>
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="bg-gray-50 p-4 rounded-xl">
//                         <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                           <FaBuilding className="text-purple-500" />
//                           Vendor
//                         </label>
//                         <input
//                           className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                           placeholder="Vendor name"
//                           name="vendor"
//                           value={form.vendor}
//                           onChange={handleChange}
//                         />
//                       </div>
//                       <div className="bg-gray-50 p-4 rounded-xl">
//                         <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                           <FaPhone className="text-purple-500" />
//                           Phone
//                         </label>
//                         <input
//                           className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                           placeholder="Vendor phone"
//                           name="phone"
//                           value={form.phone}
//                           onChange={handleChange}
//                         />
//                       </div>
//                     </div>

//                     <div className="bg-gray-50 p-4 rounded-xl">
//                       <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                         <FaBook className="text-purple-500" />
//                         Bookstore
//                       </label>
//                       <input
//                         className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                         placeholder="Bookstore name"
//                         name="bookstore"
//                         value={form.bookstore}
//                         onChange={handleChange}
//                       />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="bg-gray-50 p-4 rounded-xl">
//                         <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                           <FaMapMarkerAlt className="text-purple-500" />
//                           Address
//                         </label>
//                         <input
//                           className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                           placeholder="Vendor address"
//                           name="address"
//                           value={form.address}
//                           onChange={handleChange}
//                         />
//                       </div>
//                       <div className="bg-gray-50 p-4 rounded-xl">
//                         <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                           <FaCodeBranch className="text-purple-500" />
//                           Zip Code
//                         </label>
//                         <input
//                           className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                           placeholder="Zip Code"
//                           name="zipcode"
//                           value={form.zipcode}
//                           onChange={handleChange}
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="bg-gray-50 p-4 rounded-xl">
//                         <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                           <FaTag className="text-purple-500" />
//                           P.O. Number
//                         </label>
//                         <input
//                           className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                           placeholder="PO Number"
//                           name="poNumber"
//                           value={form.poNumber}
//                           onChange={handleChange}
//                         />
//                       </div>
//                       <div className="bg-gray-50 p-4 rounded-xl">
//                         <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                           <FaCalendarAlt className="text-purple-500" />
//                           Date
//                         </label>
//                         <input
//                           type="date"
//                           className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                           name="date"
//                           value={form.date}
//                           onChange={handleChange}
//                         />
//                       </div>
//                     </div>

//                     <div className="border-t pt-6">
//                       <div className="flex justify-between items-center mb-4">
//                         <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
//                           <FaBoxOpen className="text-purple-500" />
//                           Items
//                         </h4>
//                         <button
//                           onClick={addItem}
//                           className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md"
//                         >
//                           <FaPlus className="w-4 h-4" />
//                           Add Item
//                         </button>
//                       </div>
                      
//                       {form.items.map((item, i) => (
//                         <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
//                           <div className="md:col-span-3">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
//                             <input
//                               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                               placeholder="Author"
//                               name="author"
//                               value={item.author}
//                               onChange={(e) => handleItemChange(i, e)}
//                             />
//                           </div>
//                           <div className="md:col-span-3">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
//                             <input
//                               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                               placeholder="Book Title"
//                               name="book"
//                               value={item.book}
//                               onChange={(e) => handleItemChange(i, e)}
//                             />
//                           </div>
//                           <div className="md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//                             <input
//                               type="number"
//                               min="1"
//                               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                               placeholder="Qty"
//                               name="qty"
//                               value={item.qty}
//                               onChange={(e) => handleItemChange(i, e)}
//                             />
//                           </div>
//                           <div className="md:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
//                             <input
//                               type="number"
//                               step="1"
//                               className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                               placeholder="Price"
//                               name="price"
//                               value={item.price}
//                               onChange={(e) => handleItemChange(i, e)}
//                             />
//                           </div>
//                           <div className="md:col-span-2 flex items-end gap-2">
//                             <div className="flex-grow">
//                               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                               <select
//                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                                 name="status"
//                                 value={item.status}
//                                 onChange={(e) => handleItemChange(i, e)}
//                               >
//                                 <option value="">Select Status</option> {/* Add this line */}
//                                 {STATUS_OPTIONS.map(option => (
//                                   <option key={option.value} value={option.value}>
//                                     {option.label}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                             <button
//                               onClick={() => removeItem(i)}
//                               className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg h-10 flex items-center justify-center transition-colors"
//                               disabled={form.items.length <= 1}
//                               title="Remove Item"
//                             >
//                               <FaTimes className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="border-t pt-6">
//                       <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
//                         <FaReceipt className="text-purple-500" />
//                         Additional Costs
//                       </h4>
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div className="bg-gray-50 p-4 rounded-xl">
//                           <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                             <FaShippingFast className="text-purple-500" />
//                             Shipping
//                           </label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                             placeholder="Shipping"
//                             name="shipping"
//                             value={form.shipping}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         <div className="bg-gray-50 p-4 rounded-xl">
//                           <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                             <FaBoxOpen className="text-purple-500" />
//                             Handling
//                           </label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                             placeholder="Handling"
//                             name="handling"
//                             value={form.handling}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         <div className="bg-gray-50 p-4 rounded-xl">
//                           <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//                             <FaMoneyBillWave className="text-purple-500" />
//                             Tax
//                           </label>
//                           <input
//                             type="number"
//                             step="0.01"
//                             className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                             placeholder="Tax"
//                             name="tax"
//                             value={form.tax}
//                             onChange={handleChange}
//                           />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex flex-col-reverse sm:flex-row justify-between pt-6 border-t gap-3">
//                       <div className="flex flex-col sm:flex-row gap-2">
//                         <button
//                           onClick={closeModal}
//                           className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
//                         >
//                           <FaTimes className="w-4 h-4" />
//                           Cancel
//                         </button>
//                         <button
//                           onClick={() => setPreview(true)}
//                           className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
//                         >
//                           <FaEye className="w-4 h-4" />
//                           Preview
//                         </button>
//                       </div>
//                       <button
//                         onClick={handleSave}
//                         className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
//                       >
//                         <FaSave className="w-4 h-4" />
//                         {editingId ? 'Update' : 'Save'} Order
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <div className="space-y-8">
//                     <div className="flex flex-col md:flex-row justify-between gap-6">
//                       <div>
//                         <h2 className="text-2xl font-bold text-gray-800">411 Socials LLC</h2>
//                         <p className="text-gray-600 mt-2">116 Lafayette Street<br />Palmyra, Missouri 63461</p>
//                       </div>
//                       <div className="text-left md:text-right">
//                         <h2 className="text-2xl font-bold text-purple-600">PURCHASE ORDER</h2>
//                         <div className="mt-2 space-y-1">
//                           <p className="text-gray-600 flex items-center gap-2 justify-end md:justify-start">
//                             <FaCalendarAlt className="text-purple-500" />
//                             Date: {formatDateForDisplay(form.date)}
//                           </p>
//                           <p className="text-gray-600 flex items-center gap-2 justify-end md:justify-start">
//                             <FaTag className="text-purple-500" />
//                             P.O. #: {form.poNumber}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="border-t pt-6">
//                       <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
//                         <FaBuilding className="text-purple-500" />
//                         Vendor Information
//                       </h3>
//                       <div className="bg-gray-50 p-4 rounded-xl">
//                         <p className="text-gray-800 font-bold">{form.vendor}</p>
//                         <p className="text-gray-600 font-medium">{form.bookstore}</p>
//                         <p className="text-gray-600">{form.address} ᯓ➤ {form.zipcode}</p>
//                         <p className="text-gray-600 flex items-center gap-2 mt-1">
//                           <FaPhone className="text-purple-500" />
//                           {form.phone}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="overflow-x-auto">
//                       <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-100">
//                           <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Author Name</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Book Name</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">QTY</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unit Price</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {form.items.map((item, i) => (
//                             <tr key={i} className="hover:bg-gray-50">
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.author}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.book}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.qty}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${Number(item.price).toFixed(2)}</td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                 <StatusBadge status={item.status} />
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">${(item.qty * item.price).toFixed(2)}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     <div className="text-right space-y-2 bg-gray-50 p-4 rounded-xl">
//                       <p className="text-gray-700 mr-10">Subtotal: ${subtotal.toFixed(2)}</p>
//                       <p className="text-gray-700 mr-10">Shipping: ${Number(form.shipping).toFixed(2)}</p>
//                       <p className="text-gray-700 mr-10">Handling: ${Number(form.handling).toFixed(2)}</p>
//                       <p className="text-gray-700 mr-10">Tax: ${Number(form.tax).toFixed(2)}</p>
//                       <p className="text-lg font-bold text-purple-600 border-t pt-2 mt-2 mr-10">Total: ${total.toFixed(2)}</p>
//                     </div>

//                     <div className="flex flex-col-reverse sm:flex-row justify-end pt-6 border-t gap-3">
//                       <button
//                         onClick={() => setPreview(false)}
//                         className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
//                       >
//                         <FaArrowLeft className="w-4 h-4" />
//                         Back to Editing
//                       </button>
//                       <button
//                         onClick={closeModal}
//                         className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
//                       >
//                         <FaTimes className="w-4 h-4" />
//                         Close
//                       </button>
//                     </div>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }



import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaFileInvoice, FaTimes, 
         FaBuilding, FaPhone, FaMapMarkerAlt, FaTag, FaCalendarAlt, 
         FaShippingFast, FaBoxOpen, FaReceipt, FaMoneyBillWave, 
         FaArrowLeft, FaPrint, FaSave, FaCheckCircle, FaClock, FaHourglassHalf, FaExclamationTriangle } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

// Status options for dropdown
const STATUS_OPTIONS = [
  { value: "Ordered", label: "Ordered", color: "blue", icon: FaCheckCircle },
  { value: "Pending", label: "Pending", color: "yellow", icon: FaClock },
  { value: "Processing", label: "Processing", color: "purple", icon: FaHourglassHalf },
  { value: "Approved", label: "Approved", color: "green", icon: FaCheckCircle }
];

export default function PurchaseOrder() {
  const [form, setForm] = useState({
    vendor: "",
    address: "",
    phone: "",
    poNumber: "",
    date: new Date().toISOString().split('T')[0],
    items: [{ author: "", book: "", qty: '', price: '', status: "" }],
    shipping: 0,
    handling: 0,
    tax: 0,
  });

  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Adjust for timezone offset to get the correct date
    const adjustedDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000));
    
    return adjustedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/purchase-orders`);
      setOrders(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error fetching purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

 const handleItemChange = (index, e) => {
  const { name, value } = e.target;
  const updatedItems = [...form.items];
  
  if (name === 'qty' || name === 'price') {
    // If value is empty, keep it as empty string
    if (value === '') {
      updatedItems[index][name] = '';
    } else {
      // Only parse if there's actual content
      const parsedValue = parseFloat(value);
      updatedItems[index][name] = isNaN(parsedValue) ? '' : parsedValue;
    }
  } else {
    updatedItems[index][name] = value;
  }
  
  setForm({ ...form, items: updatedItems });
};

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { author: "", book: "", qty: '', price: '', status: "" }] });
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    const updatedItems = [...form.items];
    updatedItems.splice(index, 1);
    setForm({ ...form, items: updatedItems });
  };

  const resetForm = () => {
    setForm({
      vendor: "",
      address: "",
      phone: "",
      poNumber: "",
      date: new Date().toISOString().split('T')[0],
      items: [{ author: "", book: "", qty: '', price: '', status: "" }],
      shipping: 0,
      handling: 0,
      tax: 0,
    });
    setPreview(false);
    setEditingId(null);
    setError("");
  };

  const formatDateForMySQL = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // If it's a full ISO string, extract just the date part
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    
    // For any other format, try to parse it
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    try {
      // Format the date for MySQL before sending
      const formattedData = {
        ...form,
        date: formatDateForMySQL(form.date)
      };
      
      if (editingId) {
        await axios.put(`${API_URL}/api/purchase-orders/${editingId}`, formattedData);
      } else {
        await axios.post(`${API_URL}/api/purchase-orders`, formattedData);
      }
      alert(`Purchase order ${editingId ? 'updated' : 'saved'} successfully!`);
      setShowModal(false);
      resetForm();
      fetchOrders();
    } catch (err) {
      console.error(err);
      setError(`Error ${editingId ? 'updating' : 'saving'} purchase order.`);
    }
  };

  const handleEdit = (order) => {
    // Fix date handling to ensure consistent display
    const orderDate = order.date ? new Date(order.date) : new Date();
    // Adjust for timezone offset to get the correct date
    const adjustedDate = new Date(orderDate.getTime() + Math.abs(orderDate.getTimezoneOffset() * 60000));
    const formattedDate = adjustedDate.toISOString().split('T')[0];
    
    setForm({
      ...order,
      shipping: parseFloat(order.shipping) || 0,
      handling: parseFloat(order.handling) || 0,
      tax: parseFloat(order.tax) || 0,
      items: order.items.map(item => ({
        ...item,
        qty: parseInt(item.qty) || 0,
        price: parseFloat(item.price) || 0,
        status: item.status // Default to "Ordered" if status is null
      })),
      date: formattedDate
    });
    setEditingId(order._id);
    setShowModal(true);
  };

  const handleView = (order) => {
    // Fix date handling to ensure consistent display
    const orderDate = order.date ? new Date(order.date) : new Date();
    // Adjust for timezone offset to get the correct date
    const adjustedDate = new Date(orderDate.getTime() + Math.abs(orderDate.getTimezoneOffset() * 60000));
    const formattedDate = adjustedDate.toISOString().split('T')[0];
    
    setForm({
      ...order,
      shipping: parseFloat(order.shipping) || 0,
      handling: parseFloat(order.handling) || 0,
      tax: parseFloat(order.tax) || 0,
      items: order.items.map(item => ({
        ...item,
        qty: parseInt(item.qty) || 0,
        price: parseFloat(item.price) || 0,
        status: item.status // Default to "Ordered" if status is null
      })),
      date: formattedDate
    });
    setPreview(true);
    setShowModal(true);
  };

  // Status badge component
const StatusBadge = ({ status }) => {
  // If status is empty/null/undefined, show empty badge
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <FaExclamationTriangle className="w-3 h-3" />
        Not Set
      </span>
    );
  }
  
  const statusConfig = STATUS_OPTIONS.find(opt => opt.value === status);
  if (!statusConfig) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <FaExclamationTriangle className="w-3 h-3" />
        {status}
      </span>
    );
  }
  
  const IconComponent = statusConfig.icon;
  
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    yellow: "bg-yellow-100 text-yellow-800",
    purple: "bg-purple-100 text-purple-800",
    green: "bg-green-100 text-green-800"
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusConfig.color]}`}>
      <IconComponent className="w-3 h-3" />
      {statusConfig.label}
    </span>
  );
};  
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase order?")) {
      try {
        await axios.delete(`${API_URL}/api/purchase-orders/${id}`);
        alert("Purchase order deleted successfully!");
        fetchOrders();
      } catch (err) {
        console.error("Error deleting order:", err);
        setError("Error deleting purchase order");
      }
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchOrders();
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/purchase-orders/search/${encodeURIComponent(searchTerm)}`);
      setOrders(response.data);
      setError("");
    } catch (err) {
      console.error("Error searching orders:", err);
      setError("Error searching purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      resetForm();
    }, 300);
  };

  const subtotal = form.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const total = subtotal + Number(form.shipping) + Number(form.handling) + Number(form.tax);

  const filteredOrders = searchTerm 
    ? orders 
    : orders.filter(order => 
        order.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );

return (
    <>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-8xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-md">
                  <FaFileInvoice className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
                  <p className="text-sm text-gray-500 mt-1">Manage vendor orders and inventory</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none py-3 px-6 rounded-xl cursor-pointer font-semibold transition-all duration-200 hover:from-blue-700 hover:to-blue-600 hover:shadow-lg flex items-center gap-2 shadow-md"
              >
                <FaPlus className="w-5 h-5" />
                New Purchase Order
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Search and Filters Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search vendors or PO numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSearch}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
                >
                  <FaSearch className="w-4 h-4" />
                  Search
                </button>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    fetchOrders();
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
                >
                  <FaTimes className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                      <th className="p-4 text-left font-medium">PO Number</th>
                      <th className="p-4 text-left font-medium">Vendor</th>
                      <th className="p-4 text-left font-medium">Date</th>
                      <th className="p-4 text-left font-medium">Items</th>
                      <th className="p-4 text-left font-medium">Status</th>
                      <th className="p-4 text-left font-medium">Total Amount</th>
                      <th className="p-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map(order => {
                      const orderTotal = order.items.reduce((sum, item) => 
                        sum + (item.qty * item.price), 0
                      ) + Number(order.shipping) + Number(order.handling) + Number(order.tax);
                      
                      // Check if all items have "Ordered" status
                      const allItemsOrdered = order.items.length > 0 && 
                        order.items.every(item => item.status === "Ordered");
                      
                      // Check if any items have empty/null status
                      const hasEmptyStatus = order.items.some(item => !item.status || item.status === "");
                      
                      // Determine overall order status
                      let orderStatus = "Not Complete";
                      let statusConfig = {
                        bgColor: "bg-red-100",
                        textColor: "text-red-700",
                        iconColor: "text-red-600",
                        icon: FaExclamationTriangle
                      };
                      
                      if (allItemsOrdered) {
                        orderStatus = "Complete";
                        statusConfig = {
                          bgColor: "bg-green-100",
                          textColor: "text-green-700",
                          iconColor: "text-green-600",
                          icon: FaCheckCircle
                        };
                      } else if (hasEmptyStatus) {
                        orderStatus = "Incomplete";
                        statusConfig = {
                          bgColor: "bg-yellow-100",
                          textColor: "text-yellow-700",
                          iconColor: "text-yellow-600",
                          icon: FaClock
                        };
                      }

                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <tr key={order._id} className="hover:bg-gray-50 even:bg-gray-50">
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <FaTag className="text-purple-600" />
                              </div>
                              <span className="font-medium text-gray-900">{order.poNumber}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <FaBuilding className="text-blue-600" />
                              </div>
                              <span className="text-gray-700">{order.vendor}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-green-100 p-2 rounded-lg mr-3">
                                <FaCalendarAlt className="text-green-600" />
                              </div>
                              <span className="text-gray-700">{formatDateForDisplay(order.date)}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                                <FaBoxOpen className="text-yellow-600" />
                              </div>
                              <span className="text-gray-700">{order.items.length} items</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`${statusConfig.bgColor} p-2 rounded-lg mr-3`}>
                                <StatusIcon className={statusConfig.iconColor} />
                              </div>
                              <span className={`font-medium ${statusConfig.textColor}`}>{orderStatus}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                <FaMoneyBillWave className="text-indigo-600" />
                              </div>
                              <span className="font-medium text-gray-900">${orderTotal.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                              <button 
                                onClick={() => handleView(order)}
                                className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-colors shadow-sm"
                                title="View"
                              >
                                <FaEye className="w-3 h-3" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                              <button 
                                onClick={() => handleEdit(order)}
                                className="text-white bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-colors shadow-sm"
                                title="Edit"
                              >
                                <FaEdit className="w-3 h-3" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                              <button 
                                onClick={() => handleDelete(order._id)}
                                className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-colors shadow-sm"
                                title="Delete"
                              >
                                <FaTrash className="w-3 h-3" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="mx-auto bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FaFileInvoice className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No purchase orders</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new purchase order.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-2 px-4 rounded-xl flex items-center gap-2 mx-auto hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                >
                  <FaPlus className="w-4 h-4" />
                  New Purchase Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  {preview ? 'Purchase Order Preview' : (editingId ? 'Edit' : 'Create') + ' Purchase Order'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!preview ? (
                <>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaBuilding className="text-purple-500" />
                          Vendor
                        </label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Vendor name"
                          name="vendor"
                          value={form.vendor}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaPhone className="text-purple-500" />
                          Phone
                        </label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Vendor phone"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-purple-500" />
                        Address
                      </label>
                      <input
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Vendor address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaTag className="text-purple-500" />
                          P.O. Number
                        </label>
                        <input
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="PO Number"
                          name="poNumber"
                          value={form.poNumber}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaCalendarAlt className="text-purple-500" />
                          Date
                        </label>
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          name="date"
                          value={form.date}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                          <FaBoxOpen className="text-purple-500" />
                          Items
                        </h4>
                        <button
                          onClick={addItem}
                          className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-md"
                        >
                          <FaPlus className="w-4 h-4" />
                          Add Item
                        </button>
                      </div>
                      
                      {form.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                            <input
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Author"
                              name="author"
                              value={item.author}
                              onChange={(e) => handleItemChange(i, e)}
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                            <input
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Book Title"
                              name="book"
                              value={item.book}
                              onChange={(e) => handleItemChange(i, e)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Qty"
                              name="qty"
                              value={item.qty}
                              onChange={(e) => handleItemChange(i, e)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                            <input
                              type="number"
                              step="1"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Price"
                              name="price"
                              value={item.price}
                              onChange={(e) => handleItemChange(i, e)}
                            />
                          </div>
                          <div className="md:col-span-2 flex items-end gap-2">
                            <div className="flex-grow">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                              <select
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                name="status"
                                value={item.status}
                                onChange={(e) => handleItemChange(i, e)}
                              >
                                <option value="">Select Status</option> {/* Add this line */}
                                {STATUS_OPTIONS.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => removeItem(i)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg h-10 flex items-center justify-center transition-colors"
                              disabled={form.items.length <= 1}
                              title="Remove Item"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FaReceipt className="text-purple-500" />
                        Additional Costs
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaShippingFast className="text-purple-500" />
                            Shipping
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Shipping"
                            name="shipping"
                            value={form.shipping}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaBoxOpen className="text-purple-500" />
                            Handling
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Handling"
                            name="handling"
                            value={form.handling}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaMoneyBillWave className="text-purple-500" />
                            Tax
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Tax"
                            name="tax"
                            value={form.tax}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-between pt-6 border-t gap-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={closeModal}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
                        >
                          <FaTimes className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          onClick={() => setPreview(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
                        >
                          <FaEye className="w-4 h-4" />
                          Preview
                        </button>
                      </div>
                      <button
                        onClick={handleSave}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
                      >
                        <FaSave className="w-4 h-4" />
                        {editingId ? 'Update' : 'Save'} Order
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">411 Socials LLC</h2>
                        <p className="text-gray-600 mt-2">116 Lafayette Street<br />Palmyra, Missouri 63461</p>
                      </div>
                      <div className="text-left md:text-right">
                        <h2 className="text-2xl font-bold text-purple-600">PURCHASE ORDER</h2>
                        <div className="mt-2 space-y-1">
                          <p className="text-gray-600 flex items-center gap-2 justify-end md:justify-start">
                            <FaCalendarAlt className="text-purple-500" />
                            Date: {formatDateForDisplay(form.date)}
                          </p>
                          <p className="text-gray-600 flex items-center gap-2 justify-end md:justify-start">
                            <FaTag className="text-purple-500" />
                            P.O. #: {form.poNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <FaBuilding className="text-purple-500" />
                        Vendor Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="text-gray-800 font-medium">{form.vendor}</p>
                        <p className="text-gray-600">{form.address}</p>
                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                          <FaPhone className="text-purple-500" />
                          {form.phone}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Author Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Book Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">QTY</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Unit Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {form.items.map((item, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.author}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.book}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.qty}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${Number(item.price).toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">${(item.qty * item.price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-right space-y-2 bg-gray-50 p-4 rounded-xl">
                      <p className="text-gray-700 mr-10">Subtotal: ${subtotal.toFixed(2)}</p>
                      <p className="text-gray-700 mr-10">Shipping: ${Number(form.shipping).toFixed(2)}</p>
                      <p className="text-gray-700 mr-10">Handling: ${Number(form.handling).toFixed(2)}</p>
                      <p className="text-gray-700 mr-10">Tax: ${Number(form.tax).toFixed(2)}</p>
                      <p className="text-lg font-bold text-purple-600 border-t pt-2 mt-2 mr-10">Total: ${total.toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end pt-6 border-t gap-3">
                      <button
                        onClick={() => setPreview(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
                      >
                        <FaArrowLeft className="w-4 h-4" />
                        Back to Editing
                      </button>
                      <button
                        onClick={closeModal}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 w-full sm:w-auto transition-colors shadow-md"
                      >
                        <FaTimes className="w-4 h-4" />
                        Close
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
