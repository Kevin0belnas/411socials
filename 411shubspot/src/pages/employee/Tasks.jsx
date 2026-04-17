// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { FaTimes, FaFilePdf, FaRegFileAlt, FaCopy, FaCheck, FaExpandArrowsAlt, FaCompressArrowsAlt, FaUser, FaBook, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave, FaSpinner, FaGlobe, FaRobot } from "react-icons/fa";
// import { scriptTemplates, scriptOptions } from './scriptTemplates';

// const API_URL = import.meta.env.VITE_API_URL;
// const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// // Debounce utility function
// const debounce = (func, wait) => {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// };

// // ========== DRAGGABLE RESIZABLE MODAL COMPONENT ==========
// const DraggableResizableModal = ({ 
//   children, 
//   onClose, 
//   title, 
//   subtitle,
//   initialWidth = 800,
//   initialHeight = 600,
//   minWidth = 400,
//   minHeight = 300
// }) => {
//   const [position, setPosition] = useState({ x: window.innerWidth/2 - initialWidth/2, y: 100 });
//   const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
//   const [isDragging, setIsDragging] = useState(false);
//   const [isResizing, setIsResizing] = useState(false);
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
//   const [resizeDirection, setResizeDirection] = useState(null);
//   const modalRef = useRef(null);
//   const isFullscreen = useRef(false);
//   const originalSize = useRef(null);
//   const originalPosition = useRef(null);

//   const handleMouseDown = (e) => {
//     if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) {
//       return;
//     }
    
//     setIsDragging(true);
//     setDragOffset({
//       x: e.clientX - position.x,
//       y: e.clientY - position.y
//     });
//   };

//   const handleResizeMouseDown = (direction) => (e) => {
//     e.stopPropagation();
//     setIsResizing(true);
//     setResizeDirection(direction);
//   };

//   const handleMouseMove = (e) => {
//     if (isDragging) {
//       setPosition({
//         x: e.clientX - dragOffset.x,
//         y: e.clientY - dragOffset.y
//       });
//     } else if (isResizing) {
//       const newSize = { ...size };
//       const newPosition = { ...position };

//       if (resizeDirection.includes('e')) {
//         newSize.width = Math.max(minWidth, e.clientX - position.x);
//       }
//       if (resizeDirection.includes('s')) {
//         newSize.height = Math.max(minHeight, e.clientY - position.y);
//       }
//       if (resizeDirection.includes('w')) {
//         const widthChange = position.x - e.clientX;
//         newSize.width = Math.max(minWidth, size.width + widthChange);
//         if (newSize.width > minWidth) {
//           newPosition.x = e.clientX;
//         }
//       }
//       if (resizeDirection.includes('n')) {
//         const heightChange = position.y - e.clientY;
//         newSize.height = Math.max(minHeight, size.height + heightChange);
//         if (newSize.height > minHeight) {
//           newPosition.y = e.clientY;
//         }
//       }

//       setSize(newSize);
//       setPosition(newPosition);
//     }
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//     setIsResizing(false);
//     setResizeDirection(null);
//   };

//   const toggleFullscreen = () => {
//     if (!isFullscreen.current) {
//       originalSize.current = { ...size };
//       originalPosition.current = { ...position };
      
//       setPosition({ x: 0, y: 0 });
//       setSize({ 
//         width: window.innerWidth, 
//         height: window.innerHeight 
//       });
//       isFullscreen.current = true;
//     } else {
//       setPosition(originalPosition.current);
//       setSize(originalSize.current);
//       isFullscreen.current = false;
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('mousemove', handleMouseMove);
//     document.addEventListener('mouseup', handleMouseUp);

//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, [isDragging, isResizing, dragOffset, resizeDirection]);

//   return (
//     <div className="fixed inset-0 z-[1001] pointer-events-none">
//       <div
//         ref={modalRef}
//         className="absolute bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col pointer-events-auto"
//         style={{
//           left: `${position.x}px`,
//           top: `${position.y}px`,
//           width: `${size.width}px`,
//           height: `${size.height}px`,
//           minWidth: `${minWidth}px`,
//           minHeight: `${minHeight}px`,
//           maxWidth: `${window.innerWidth}px`,
//           maxHeight: `${window.innerHeight}px`,
//         }}
//       >
//         <div 
//           className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white cursor-move select-none"
//           onMouseDown={handleMouseDown}
//         >
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//             {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={toggleFullscreen}
//               className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
//               title={isFullscreen.current ? "Exit Fullscreen" : "Fullscreen"}
//             >
//               {isFullscreen.current ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
//             >
//               <FaTimes />
//             </button>
//           </div>
//         </div>
        
//         <div className="flex-1 overflow-auto">
//           {children}
//         </div>

//         <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
//           <div
//             className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize"
//             onMouseDown={handleResizeMouseDown('n')}
//           />
//           <div
//             className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize"
//             onMouseDown={handleResizeMouseDown('e')}
//           />
//           <div
//             className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
//             onMouseDown={handleResizeMouseDown('s')}
//           />
//           <div
//             className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize"
//             onMouseDown={handleResizeMouseDown('w')}
//           />
//           <div
//             className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize"
//             onMouseDown={handleResizeMouseDown('ne')}
//           />
//           <div
//             className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
//             onMouseDown={handleResizeMouseDown('se')}
//           />
//           <div
//             className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize"
//             onMouseDown={handleResizeMouseDown('sw')}
//           />
//           <div
//             className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize"
//             onMouseDown={handleResizeMouseDown('nw')}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// // ========== DEBOUNCE HOOK ==========
// const useDebounce = (value, delay) => {
//   const [debouncedValue, setDebouncedValue] = useState(value);

//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(handler);
//     };
//   }, [value, delay]);

//   return debouncedValue;
// };

// function Tasks() {
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [editingComment, setEditingComment] = useState({});
//   const [savingComment, setSavingComment] = useState({});
//   const [editingCommentsTemp, setEditingCommentsTemp] = useState({});
//   const [currentAgent, setCurrentAgent] = useState(null);
//   const [activeTab, setActiveTab] = useState('myContacts');
//   const [agents, setAgents] = useState([]);
//   const [updatingRatings, setUpdatingRatings] = useState({});

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [totalItems, setTotalItems] = useState(0);

//   const [showCompleteModal, setShowCompleteModal] = useState(false);
//   const [pendingStatusChange, setPendingStatusChange] = useState(null);
//   const [showRatingChangeModal, setShowRatingChangeModal] = useState(false);
//   const [pendingRatingChange, setPendingRatingChange] = useState(null);

//   const [showTransactionModal, setShowTransactionModal] = useState(false);
//   const [currentTransactionLead, setCurrentTransactionLead] = useState(null);
//   const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
//   const [transactionData, setTransactionData] = useState({
//     trans_status: '',
//     service_name: [],
//     amount_pay: '',
//     payment_status: '',
//     tot_service_price: '',
//     remain_bal: ''
//   });

//   const [uploadedFile, setUploadedFile] = useState(null);
//   const [filePreviewURL, setFilePreviewURL] = useState(null);

//   // 🔥 FIXED SEARCH STATES
//   const [searchInput, setSearchInput] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const debouncedSearchTerm = useDebounce(searchTerm, 500);

//   // Script Viewer State
//   const [showScriptViewer, setShowScriptViewer] = useState(false);
//   const [selectedScript, setSelectedScript] = useState('');
//   const [selectedScriptContent, setSelectedScriptContent] = useState('');
//   const [currentLeadForScript, setCurrentLeadForScript] = useState(null);
//   const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
//   // Gemini Research State
//   const [geminiResearch, setGeminiResearch] = useState('');
//   const [geminiLoading, setGeminiLoading] = useState(false);
//   const [geminiError, setGeminiError] = useState(null);
  
//   const requestQueue = useRef([]);
//   const isProcessingQueue = useRef(false);
//   const researchCache = useRef(new Map());
//   const lastRequestTime = useRef(0);
//   const MIN_REQUEST_INTERVAL = 2000;
  
//   const serviceOptions = [
//     'NBSP', 'INBSP', 'Book Video', 'Screenplay', 'Republication', 
//     'LA Times', 'SEO', 'Publication', 'Website', 'Kate Delaney', 
//     'Audiobook', 'New York Times', 'Billboard', 'Press Release', 
//     'Graphic Design', 'Animation', 'Coverage', 'Treatment', 
//     'Query Letter', 'Synopsis', 'Outline', 'Pitch Sheet', 'IMDB', 
//     'Community Boosting', 'Facebook', 'Instagram', 'TikTok', 
//     'Youtube', 'Book Signing'
//   ];

//   // Bio Modal State
//   const [showBioModal, setShowBioModal] = useState(false);
//   const [currentLeadForBio, setCurrentLeadForBio] = useState(null);
//   const [bioData, setBioData] = useState({
//     contact_id: '',
//     name: '',
//     book_titles: [],
//     book_titles_input: '',
//     email: '',
//     street_address: '',
//     city: '',
//     state: '',
//     zipcode: '',
//     phone_numbers: [],
//     phone_numbers_input: '',
//     reserve_note: '',
//     additional_notes: ''
//   });
//   const [editingBio, setEditingBio] = useState(false);
//   const [savingBio, setSavingBio] = useState(false);

//   // 🔥 FIXED Search handlers
//   const handleSearch = () => {
//     setSearchTerm(searchInput);
//     setCurrentPage(1);
//   };

//   const handleClearSearch = () => {
//     setSearchInput('');
//     setSearchTerm('');
//     setCurrentPage(1);
//   };

//   const processRequestQueue = async () => {
//     if (isProcessingQueue.current || requestQueue.current.length === 0) return;
    
//     isProcessingQueue.current = true;
    
//     while (requestQueue.current.length > 0) {
//       const request = requestQueue.current.shift();
      
//       const now = Date.now();
//       const timeSinceLastRequest = now - lastRequestTime.current;
//       if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
//         await new Promise(resolve => 
//           setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
//         );
//       }
      
//       try {
//         await request.fn();
//         lastRequestTime.current = Date.now();
//       } catch (error) {
//         console.error('Error processing queued request:', error);
//       }
      
//       await new Promise(resolve => setTimeout(resolve, 500));
//     }
    
//     isProcessingQueue.current = false;
//   };

//   const fetchGeminiResearch = async (lead, retryCount = 0) => {
//     if (!GEMINI_API_KEY) {
//       setGeminiError('Gemini API key not configured');
//       return;
//     }

//     const cacheKey = `${lead.id}_${lead.name}`;
//     const cachedData = researchCache.current.get(cacheKey);
//     if (cachedData && (Date.now() - cachedData.timestamp) < 3600000) {
//       setGeminiResearch(cachedData.data);
//       return;
//     }

//     setGeminiLoading(true);
//     setGeminiError(null);
//     setGeminiResearch('');

//     const makeRequest = async () => {
//       try {
//         const prompt = `Tell me more about this author:
// Name: ${lead.name || 'Unknown'}
// Email: ${lead.email || 'Not provided'}
// Book Title: ${lead.bookTitle || 'Unknown'}

// Please research and provide information about:
// 1. This author's presence on Amazon (find their book if available)
// 2. Any existing website they might have
// 3. Any press releases or media coverage they've had
// 4. Additional biographical information if available

// Please format the response in a clear, organized way with sections for Amazon Presence, Website, Press Coverage, and Biography. If specific information is not found, please indicate that.`;

//         const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             contents: [{
//               parts: [{
//                 text: prompt
//               }]
//             }]
//           })
//         });

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({}));
          
//           if (response.status === 429) {
//             let waitTime = 30;
            
//             if (errorData.error?.details) {
//               const retryInfo = errorData.error.details.find(d => 
//                 d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
//               );
//               if (retryInfo?.retryDelay) {
//                 const match = retryInfo.retryDelay.match(/(\d+)s/);
//                 if (match) {
//                   waitTime = parseInt(match[1]);
//                 }
//               }
//             }
            
//             const baseWaitTime = waitTime * Math.pow(2, retryCount);
            
//             if (retryCount < 3) {
//               setGeminiError(`Rate limit reached. Retrying in ${Math.ceil(baseWaitTime)} seconds... (Attempt ${retryCount + 1}/3)`);
              
//               await new Promise(resolve => setTimeout(resolve, baseWaitTime * 1000));
              
//               requestQueue.current.push({
//                 fn: () => fetchGeminiResearch(lead, retryCount + 1)
//               });
//               processRequestQueue();
//               return;
//             } else {
//               throw new Error('Rate limit exceeded. Please try again later.');
//             }
//           }
          
//           throw new Error(`API Error: ${response.status}`);
//         }

//         const data = await response.json();
        
//         if (!data.candidates || data.candidates.length === 0) {
//           throw new Error('No response from Gemini');
//         }
        
//         if (data.candidates[0]?.finishReason === 'SAFETY') {
//           throw new Error('Response was blocked due to safety concerns');
//         }
        
//         const researchText = data.candidates[0]?.content?.parts[0]?.text || 'No research results found';
        
//         researchCache.current.set(cacheKey, {
//           data: researchText,
//           timestamp: Date.now()
//         });
        
//         setGeminiResearch(researchText);
//       } catch (error) {
//         console.error('Error in Gemini request:', error);
//         setGeminiError(error.message);
//       } finally {
//         setGeminiLoading(false);
//       }
//     };

//     requestQueue.current.push({ fn: makeRequest });
//     processRequestQueue();
//   };

//   const debouncedFetchGeminiResearch = useCallback(
//     debounce((lead) => {
//       fetchGeminiResearch(lead);
//     }, 1000),
//     []
//   );

//   const handleRetryResearch = () => {
//     if (currentLeadForBio) {
//       const cacheKey = `${currentLeadForBio.id}_${currentLeadForBio.name}`;
//       researchCache.current.delete(cacheKey);
//       fetchGeminiResearch(currentLeadForBio);
//     }
//   };

//   const openBioModal = async (lead) => {
//     setCurrentLeadForBio(lead);
//     setGeminiResearch('');
//     setGeminiError(null);
    
//     try {
//       const response = await fetch(`${API_URL}/api/leads/${lead.id}/bio`, {
//         credentials: 'include'
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setBioData(data);
//       } else {
//         let phoneNumbers = [];
//         try {
//           phoneNumbers = lead.phone ? JSON.parse(lead.phone) : [];
//           if (!Array.isArray(phoneNumbers)) {
//             phoneNumbers = [lead.phone];
//           }
//         } catch {
//           phoneNumbers = lead.phone ? [lead.phone] : [];
//         }
        
//         let bookTitles = [];
//         if (lead.bookTitle) {
//           bookTitles = lead.bookTitle.split(',').map(title => title.trim()).filter(title => title);
//         }
        
//         setBioData({
//           contact_id: lead.id || '',
//           name: lead.name || '',
//           book_titles: bookTitles,
//           book_titles_input: lead.bookTitle || '',
//           email: lead.email || '',
//           street_address: '',
//           city: '',
//           state: '',
//           zipcode: '',
//           phone_numbers: phoneNumbers,
//           phone_numbers_input: phoneNumbers.join(', ') || '',
//           reserve_note: '',
//           additional_notes: lead.comment || ''
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching bio data:', error);
//       let phoneNumbers = [];
//       try {
//         phoneNumbers = lead.phone ? JSON.parse(lead.phone) : [];
//         if (!Array.isArray(phoneNumbers)) {
//           phoneNumbers = [lead.phone];
//         }
//       } catch {
//         phoneNumbers = lead.phone ? [lead.phone] : [];
//       }
      
//       let bookTitles = [];
//       if (lead.bookTitle) {
//         bookTitles = lead.bookTitle.split(',').map(title => title.trim()).filter(title => title);
//       }
      
//       setBioData({
//         contact_id: lead.id || '',
//         name: lead.name || '',
//         book_titles: bookTitles,
//         book_titles_input: lead.bookTitle || '',
//         email: lead.email || '',
//         street_address: '',
//         city: '',
//         state: '',
//         zipcode: '',
//         phone_numbers: phoneNumbers,
//         phone_numbers_input: phoneNumbers.join(', ') || '',
//         reserve_note: '',
//         additional_notes: lead.comment || ''
//       });
//     }
    
//     debouncedFetchGeminiResearch(lead);
    
//     setShowBioModal(true);
//     setEditingBio(false);
//   };

//   const handleBioChange = (field, value) => {
//     setBioData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const saveBioData = async () => {
//     try {
//       setSavingBio(true);
      
//       const bioDataToSave = {
//         name: bioData.name,
//         book_titles_input: bioData.book_titles_input,
//         email: bioData.email,
//         street_address: bioData.street_address,
//         city: bioData.city,
//         state: bioData.state,
//         zipcode: bioData.zipcode,
//         phone_numbers_input: bioData.phone_numbers_input,
//         reserve_note: bioData.reserve_note,
//         additional_notes: bioData.additional_notes
//       };
      
//       const response = await fetch(`${API_URL}/api/leads/${bioData.contact_id}/bio`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(bioDataToSave),
//         credentials: 'include'
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to save bio data');
//       }
      
//       const result = await response.json();
      
//       const updatedLead = result.data;
      
//       setLeads(prevLeads => 
//         prevLeads.map(lead => 
//           lead.id === bioData.contact_id 
//             ? { 
//                 ...lead, 
//                 name: updatedLead.name || bioData.name,
//                 bookTitle: updatedLead.book_title || bioData.book_titles_input,
//                 email: updatedLead.email || bioData.email,
//                 phone: updatedLead.phone || '[]',
//                 comment: updatedLead.comment || bioData.additional_notes
//               } 
//             : lead
//         )
//       );
      
//       if (updatedLead.book_title) {
//         const bookTitlesArray = updatedLead.book_title
//           .split(',')
//           .map(title => title.trim())
//           .filter(title => title);
        
//         setBioData(prev => ({
//           ...prev,
//           book_titles: bookTitlesArray
//         }));
//       }
      
//       if (updatedLead.phone) {
//         let phoneNumbersArray = [];
//         try {
//           phoneNumbersArray = JSON.parse(updatedLead.phone);
//           if (!Array.isArray(phoneNumbersArray)) {
//             phoneNumbersArray = [updatedLead.phone];
//           }
//         } catch {
//           phoneNumbersArray = [updatedLead.phone];
//         }
        
//         setBioData(prev => ({
//           ...prev,
//           phone_numbers: phoneNumbersArray
//         }));
//       }
      
//       setEditingBio(false);
//       alert('Bio data saved successfully!');
//     } catch (error) {
//       console.error('Error saving bio data:', error);
//       alert(`Error saving bio data: ${error.message}`);
//     } finally {
//       setSavingBio(false);
//     }
//   };

//   const openScriptViewer = (lead) => {
//     setCurrentLeadForScript(lead);
//     setShowScriptViewer(true);
//     setSelectedScript(scriptOptions[0]);
//     personalizeScriptContent(scriptOptions[0], lead);
//   };

//   const personalizeScriptContent = (scriptName, lead) => {
//     let content = scriptTemplates[scriptName];
    
//     if (lead) {
//       content = content
//         .replace(/\[Client Name\]/g, lead.name || 'Client')
//         .replace(/\[Book Title\]/g, lead.bookTitle || 'Your Book')
//         .replace(/\[Agent Name\]/g, currentAgent?.name || 'Our Agent')
//         .replace(/\[Company Name\]/g, 'Our Publishing Company');
//     }
    
//     setSelectedScriptContent(content);
//     setCopiedToClipboard(false);
//   };

//   const handleScriptSelect = (scriptName) => {
//     setSelectedScript(scriptName);
//     personalizeScriptContent(scriptName, currentLeadForScript);
//   };

//   const copyToClipboard = async () => {
//     try {
//       await navigator.clipboard.writeText(selectedScriptContent);
//       setCopiedToClipboard(true);
//       setTimeout(() => setCopiedToClipboard(false), 2000);
//     } catch (err) {
//       console.error('Failed to copy:', err);
//     }
//   };

//   // 🔥 FIXED fetchAssignedLeads with proper search
//   const fetchAssignedLeads = useCallback(async () => {
//     try {
//       setLoading(true);
//       const url = new URL(`${API_URL}/api/contacts-agents`);
//       url.searchParams.append('page', currentPage);
//       url.searchParams.append('pageSize', pageSize);
//       url.searchParams.append('filter', activeTab);
      
//       if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
//         url.searchParams.append('search', debouncedSearchTerm.trim());
//       }

//       const response = await fetch(url, { credentials: 'include' });
      
//       if (!response.ok) throw new Error('Failed to fetch leads');
//       const data = await response.json();

//       const formattedLeads = data.data.map(contact => ({
//         id: contact.id,
//         name: contact.name,
//         phone: contact.phone,
//         email: contact.email,
//         owner: contact.lead_owner,
//         status: contact.status || '',
//         bookTitle: contact.book_title,
//         publisher: contact.publisher,
//         rating: contact.rating || '',
//         assignedTo: contact.assigned_to,
//         transferred_to: contact.transferred_to,
//         comment: contact.comment || '',
//         payment_status: contact.payment_status || '',
//       }));

//       setLeads(formattedLeads);
//       setTotalItems(data.pagination.totalItems);
//     } catch (error) {
//       console.error('Error fetching leads:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [currentPage, pageSize, activeTab, debouncedSearchTerm]);

//   useEffect(() => {
//     fetchAssignedLeads();
//   }, [fetchAssignedLeads]);

//   // Reset page when tab changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab]);

//   // Reset page when search term changes
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [debouncedSearchTerm]);

//   useEffect(() => {
//     const fetchCurrentAgent = async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/current-agentID`, {
//           credentials: 'include'
//         });
//         if (!response.ok) throw new Error('Failed to fetch current agent');
//         const data = await response.json();
//         setCurrentAgent(data);
//       } catch (error) {
//         console.error('Error fetching current agent:', error);
//       }
//     };
    
//     fetchCurrentAgent();
//   }, []);

//   useEffect(() => {
//     const fetchAgents = async () => {
//       try {
//         const response = await fetch(`${API_URL}/api/agents`);
//         const data = await response.json();
//         if (!Array.isArray(data)) throw new Error('Agents data is not in expected format');
//         setAgents(data);
//       } catch (error) {
//         console.error("Error fetching agents:", error);
//       }
//     };
//     fetchAgents();
//   }, []);

//   // Status update with confirmation
//   const handleStatusChangeWithConfirmation = (id, newStatus) => {
//     setPendingStatusChange({ id, newStatus });
//     setShowCompleteModal(true);
//   };

//   const handleStatusUpdate = async (id, newStatus) => {
//     try {
//       await fetch(`${API_URL}/api/contacts/${id}/status`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus })
//       });
//       setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
//     } catch (error) {
//       console.error('Error updating status:', error);
//     }
//   };

//   const handleRatingChange = async (id, newRating) => {
//     setUpdatingRatings(prev => ({ ...prev, [id]: true }));

//     try {
//       const lead = leads.find(l => l.id === id);
      
//       if (newRating === 'Decline') {
//         const confirmDecline = window.confirm(
//           `⚠️ Delete Lead?\n\n` +
//           `Are you sure you want to delete "${lead?.name || 'this lead'}"?\n\n` +
//           `⚠️ Only use for WRONG NUMBER!\n\n` +
//           `This action cannot be undone.`
//         );
        
//         if (!confirmDecline) {
//           setUpdatingRatings(prev => ({ ...prev, [id]: false }));
//           return;
//         }
//       } else if (newRating === 'Flagged') {
//         const confirmFlagged = window.confirm(
//           `⭐ Flag Lead?\n\n` +
//           `Mark "${lead?.name || 'this lead'}" as Flagged?\n\n` +
//           `This lead will be saved for follow-up.`
//         );
        
//         if (!confirmFlagged) {
//           setUpdatingRatings(prev => ({ ...prev, [id]: false }));
//           return;
//         }
//       }
      
//       const response = await fetch(`${API_URL}/api/update-ratings/${id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ rating: newRating })
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to update rating');
//       }

//       if (newRating === 'Decline') {
//         alert(`✅ Lead "${lead?.name}" deleted.`);
//       } else if (newRating === 'Flagged') {
//         alert(`⭐ Lead "${lead?.name}" flagged.`);
//       }

//       await fetchAssignedLeads();

//       setShowRatingChangeModal(false);
//       setPendingRatingChange(null);

//     } catch (error) {
//       console.error('Error updating rating:', error);
//       alert(`❌ Error: ${error.message}`);
//     } finally {
//       setUpdatingRatings(prev => ({ ...prev, [id]: false }));
//     }
//   };

//   const handleRatingSelect = (id, currentRating, newRating) => {
//     if (currentRating !== newRating) {
//       setPendingRatingChange({ id, currentRating, newRating });
//       setShowRatingChangeModal(true);
//     }
//   };

//   const handleLocalCommentChange = (leadId, newComment) => {
//     setEditingCommentsTemp(prev => ({ ...prev, [leadId]: newComment }));
//   };

//   const handleCommentSave = async (leadId) => {
//     const newComment = editingCommentsTemp[leadId] || '';
//     try {
//       setSavingComment(prev => ({ ...prev, [leadId]: true }));
//       const response = await fetch(`${API_URL}/api/leads/${leadId}/comment`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ comment: newComment }),
//       });
//       if (!response.ok) throw new Error('Failed to save comment');
//       setLeads(prevLeads => prevLeads.map(lead => lead.id === leadId ? { ...lead, comment: newComment } : lead));
//       setEditingComment(prev => ({ ...prev, [leadId]: false }));
//     } catch (error) {
//       console.error('Error saving comment:', error);
//     } finally {
//       setSavingComment(prev => ({ ...prev, [leadId]: false }));
//     }
//   };

//   const totalPages = Math.ceil(totalItems / pageSize);

//   const paginate = (pageNumber) => {
//     if (pageNumber >= 1 && pageNumber <= totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <h1 className="text-2xl mb-6 text-white font-bold bg-blue-400 p-7 rounded">Assigned Leads</h1>
//         <p>Loading your leads...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="p-4 bg-gray-50 min-h-screen">
//         <h1 className="text-2xl mb-6 text-white font-bold bg-blue-400 p-7 rounded">Assigned Leads</h1>
        
//         <div className="flex border-b border-gray-200 mb-6">
//           <div 
//             className={`px-6 py-3 cursor-pointer border-b-2 ${activeTab === 'myContacts' ? 'border-yellow-700 text-black font-semibold' : 'border-transparent text-gray-500'}`}
//             onClick={() => setActiveTab('myContacts')}
//           >
//             My Contacts
//           </div>
//           <div 
//             className={`px-6 py-3 cursor-pointer border-b-2 ${activeTab === 'flagged' ? 'border-yellow-700 text-black font-semibold' : 'border-transparent text-gray-500'}`}
//             onClick={() => setActiveTab('flagged')}
//           >
//             Flagged
//           </div>
//         </div>

//         {/* 🔥 FIXED Search Section */}
//         <div className="flex gap-3 mb-6 items-center flex-wrap">
//           <input
//             type="text"
//             placeholder="Search contacts by name, email, phone, or book title..."
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             onKeyPress={(e) => {
//               if (e.key === 'Enter') {
//                 handleSearch();
//               }
//             }}
//             className="px-3.5 py-2.5 rounded-lg border border-gray-300 flex-1 max-w-md min-w-60 text-sm transition-colors focus:outline-none focus:border-blue-300"
//           />
//           <button 
//             onClick={handleSearch}
//             className="px-4.5 py-2.5 bg-blue-500 text-white border border-blue-500 rounded-lg cursor-pointer text-sm transition-colors hover:bg-blue-600"
//           >
//             Search
//           </button>
//           {(searchInput || searchTerm) && (
//             <button 
//               onClick={handleClearSearch}
//               className="px-4.5 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg cursor-pointer text-sm transition-colors hover:bg-gray-200"
//             >
//               Clear
//             </button>
//           )}
//         </div>

//         {/* 🔥 Search indicator */}
//         {searchTerm && (
//           <div className="mb-4 text-sm text-blue-600">
//             Showing results for: <strong>"{searchTerm}"</strong>
//             {totalItems === 0 && <span className="text-red-500 ml-2">- No results found</span>}
//           </div>
//         )}

//         <div className="flex justify-between items-center flex-wrap mt-5">
//           <div className="flex items-center gap-2">
//             <span className="text-sm">Show: </span>
//             <select 
//               value={pageSize} 
//               onChange={(e) => {
//                 setPageSize(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               className="px-2 py-1 text-sm rounded border border-gray-300 bg-white cursor-pointer"
//             >
//               {[10, 25, 50, 100, 500, 1000, 2000].map(size => (
//                 <option key={size} value={size}>{size}</option>
//               ))}
//             </select>
//             <span className="text-sm"> contacts per page</span>
//           </div>

//           <div className="flex items-center gap-1.5 flex-wrap justify-end">
//             <button
//               onClick={() => paginate(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="px-3 py-1.5 text-sm cursor-pointer rounded border border-gray-300 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>

//             {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//               let pageNumber;
//               if (totalPages <= 5) {
//                 pageNumber = i + 1;
//               } else if (currentPage <= 3) {
//                 pageNumber = i + 1;
//               } else if (currentPage >= totalPages - 2) {
//                 pageNumber = totalPages - 4 + i;
//               } else {
//                 pageNumber = currentPage - 2 + i;
//               }

//               return (
//                 <button
//                   key={pageNumber}
//                   onClick={() => paginate(pageNumber)}
//                   className={`px-3 py-1.5 text-sm cursor-pointer rounded border min-w-9 ${
//                     currentPage === pageNumber 
//                       ? 'bg-blue-600 text-white border-blue-600' 
//                       : 'border-gray-300 bg-gray-50'
//                   }`}
//                 >
//                   {pageNumber}
//                 </button>
//               );
//             })}

//             {totalPages > 5 && currentPage < totalPages - 2 && (
//               <span className="px-3 py-1.5 text-gray-500">...</span>
//             )}

//             {totalPages > 5 && currentPage < totalPages - 2 && (
//               <button
//                 onClick={() => paginate(totalPages)}
//                 className="px-3 py-1.5 text-sm cursor-pointer rounded border border-gray-300 bg-gray-50 min-w-9"
//               >
//                 {totalPages}
//               </button>
//             )}

//             <div className="flex items-center gap-1">
//               <span>Go to: </span>
//               <input
//                 type="number"
//                 min="1"
//                 max={totalPages}
//                 value={currentPage}
//                 onChange={(e) => {
//                   const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages);
//                   paginate(value);
//                 }}
//                 className="w-14 px-1 py-0.5 text-sm border border-gray-300 rounded text-center"
//               />
//             </div>

//             <button
//               onClick={() => paginate(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1.5 text-sm cursor-pointer rounded border border-gray-300 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next
//             </button>
//           </div>
//         </div>

//         <div className="overflow-x-auto mt-6">
//           <table className="w-full border-separate border-spacing-0 bg-white shadow-sm rounded-lg overflow-hidden">
//             <thead>
//               <tr>
//                 <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Name</th>
//                 <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Contact</th>
//                 <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Book Details</th>
//                 {activeTab === 'flagged' && (
//                   <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Status</th>
//                 )}
//                 <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Rating</th>
//                 <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Comment</th>
//                 <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {leads.length > 0 ? (
//                 leads.map((lead) => (
//                   <tr key={lead.id} className="hover:bg-gray-50">
//                     <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
//                       <button
//                         onClick={() => openBioModal(lead)}
//                         className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left w-full text-xs"
//                       >
//                         {lead.name}
//                       </button>
//                      </td>
                    
//                     <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
//                       <div className="flex flex-col">
//                         {(() => {
//                           if (!lead.phone) {
//                             return <span className="text-gray-400 italic mr-2 text-xs">-</span>;
//                           }

//                           let phones = [];
//                           try {
//                             // Handle different possible formats
//                             if (typeof lead.phone === 'string') {
//                               // Check if it's a JSON array string
//                               if (lead.phone.startsWith('[')) {
//                                 phones = JSON.parse(lead.phone);
//                               } else {
//                                 // Split by comma to get individual phone numbers
//                                 phones = lead.phone.split(',').map(p => p.trim()).filter(p => p);
//                               }
//                             } else if (Array.isArray(lead.phone)) {
//                               phones = lead.phone;
//                             } else {
//                               phones = [String(lead.phone)];
//                             }
                            
//                             // Ensure phones is an array and filter out empty values
//                             if (!Array.isArray(phones)) {
//                               phones = [phones];
//                             }
//                             phones = phones.filter(p => p && p.trim());
                            
//                           } catch (error) {
//                             console.error('Error parsing phones:', error);
//                             phones = [lead.phone];
//                           }

//                           // Show only first phone number
//                           const firstPhone = phones[0];
//                           const remainingCount = phones.length - 1;
                          
//                           return (
//                             <div className="flex items-center flex-wrap gap-1">
//                               {firstPhone ? (
//                                 <span className="text-blue-600 text-xs">
//                                   {firstPhone}
//                                 </span>
//                               ) : (
//                                 <span className="text-gray-400 italic text-xs">-</span>
//                               )}
//                               {remainingCount > 0 && (
//                                 <span 
//                                   className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full cursor-help"
//                                   title={`${remainingCount} more phone number(s): ${phones.slice(1).join(', ')}`}
//                                 >
//                                   +{remainingCount}
//                                 </span>
//                               )}
//                             </div>
//                           );
//                         })()}

//                         {lead.email ? (
//                           <span className="text-gray-700 text-xs mt-1">{lead.email}</span>
//                         ) : (
//                           <span className="text-gray-400 italic text-xs mt-1">-</span>
//                         )}
//                       </div>
//                     </td>

//                     <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top max-w-xs">
//                       <div className="break-words">
//                         {lead.bookTitle?.split(',').map((book, index) => {
//                           const trimmedBook = book.trim();
//                           if (!trimmedBook) return null;
                          
//                           return (
//                             <div key={index} className={index > 0 ? "mt-1" : ""}>
//                               <a 
//                                 href={`https://www.google.com/search?q=${encodeURIComponent(trimmedBook)}`} 
//                                 target="_blank" 
//                                 rel="noopener noreferrer"
//                                 className="text-blue-600 underline font-bold break-words hover:text-blue-800 text-xs"
//                               >
//                                 {index + 1}. {trimmedBook}
//                               </a>
//                             </div>
//                           );
//                         })}
//                       </div>
//                       {lead.publisher && (
//                         <div className="break-words mt-2 text-gray-500 text-xs">
//                           {lead.publisher}
//                         </div>
//                       )}
//                      </td>
                    
//                     {activeTab === 'flagged' && (
//                       <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
//                         <select
//                           value={lead.status}
//                           onChange={(e) => handleStatusChangeWithConfirmation(lead.id, e.target.value)}
//                           className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 font-medium text-xs w-full max-w-xs"
//                         >
//                           <option value="New">New</option>
//                           <option value="Contacted">Contacted</option>
//                           <option value="In Progress">In Progress</option>
//                           <option value="Closed">Closed</option>
//                           <option value="Completed">Completed</option>
//                           <option value="Incompleted">Incompleted</option>
//                           <option value="Transferred">Transferred</option>
//                         </select>
//                        </td>
//                     )}
                    
//                     <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
//                       <select
//                         value={lead.rating || ''}
//                         onChange={(e) => handleRatingSelect(lead.id, lead.rating, e.target.value)}
//                         disabled={updatingRatings[lead.id]}
//                         className={`px-2 py-1 rounded border border-gray-300 bg-white font-medium text-xs w-full max-w-xs ${
//                           lead.rating === 'Flagged' ? 'text-yellow-500' : 
//                           lead.rating === 'Decline' ? 'text-red-500' : 'text-gray-500'
//                         } ${updatingRatings[lead.id] ? 'opacity-70' : ''}`}
//                       >
//                         {updatingRatings[lead.id] ? (
//                           <option value="">Updating...</option>
//                         ) : (
//                           <>
//                             <option value="">Select Rating</option>
//                             <option value="Flagged">Flagged</option>
//                             <option value="Decline">Decline</option>
//                           </>
//                         )}
//                       </select>
//                       {updatingRatings[lead.id] && (
//                         <span className="text-gray-500 text-xs ml-2">Saving...</span>
//                       )}
//                      </td>
                    
//                     <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
//                       {editingComment[lead.id] ? (
//                         <>
//                           <textarea
//                             value={editingCommentsTemp[lead.id] || ''}
//                             onChange={(e) => handleLocalCommentChange(lead.id, e.target.value)}
//                             placeholder="Enter comment"
//                             className="w-full resize-y p-2 rounded border border-gray-300 min-h-16 text-xs"
//                           />
//                           <div className="flex gap-2 mt-1">
//                             <button
//                               onClick={() => handleCommentSave(lead.id)}
//                               disabled={savingComment[lead.id]}
//                               className={`px-2 py-1 rounded cursor-pointer text-white text-xs font-medium transition-colors ${
//                                 savingComment[lead.id] ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
//                               }`}
//                             >
//                               {savingComment[lead.id] ? 'Saving...' : 'Save'}
//                             </button>
//                             <button
//                               onClick={() => setEditingComment(prev => ({ ...prev, [lead.id]: false }))}
//                               disabled={savingComment[lead.id]}
//                               className="px-2 py-1 bg-gray-100 text-gray-700 border-none rounded cursor-pointer text-xs font-medium transition-colors hover:bg-gray-200"
//                             >
//                               Cancel
//                             </button>
//                           </div>
//                         </>
//                       ) : (
//                         <>
//                           <div className="mb-1 text-xs">
//                             {lead.comment || <span className="text-gray-400 italic">No comment</span>}
//                           </div>
//                           <button
//                             onClick={() => {
//                               setEditingComment(prev => ({ ...prev, [lead.id]: true }));
//                               setEditingCommentsTemp(prev => ({ ...prev, [lead.id]: lead.comment || '' }));
//                             }}
//                             className="px-2 py-1 bg-yellow-50 text-yellow-800 border-none rounded cursor-pointer text-xs font-medium transition-colors hover:bg-yellow-100 mt-1"
//                           >
//                             {lead.comment ? 'Edit' : 'Add'}
//                           </button>
//                         </>
//                       )}
//                      </td>
                    
//                     <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
//                       <div className="flex flex-col gap-1">
//                         <button
//                           onClick={() => openScriptViewer(lead)}
//                           className="px-2 py-1 bg-green-50 text-green-700 border-none rounded cursor-pointer text-xs font-medium transition-colors hover:bg-green-100 flex items-center gap-1"
//                         >
//                           <FaRegFileAlt className="text-xs" />
//                           View Scripts
//                         </button>
//                       </div>
//                      </td>
//                    </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={activeTab === 'flagged' ? 7 : 6} className="p-4 border-b border-gray-200 text-center text-gray-500 text-xs">
//                     {activeTab === 'myContacts' 
//                       ? 'No leads assigned to you currently' 
//                       : activeTab === 'flagged'
//                       ? 'No flagged leads found'
//                       : 'No incomplete transactions found'}
//                    </td>
//                  </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {totalItems > 0 && (
//           <div className="mt-6">
//             <div className="flex items-center gap-2 my-5 text-sm text-gray-500">
//               <span>Show: </span>
//               <select 
//                 value={pageSize} 
//                 onChange={(e) => {
//                   setPageSize(Number(e.target.value));
//                   setCurrentPage(1);
//                 }}
//                 className="px-2.5 py-1.5 rounded border border-gray-200 bg-white cursor-pointer"
//               >
//                 {[10, 25, 50, 100, 500, 1000, 2000].map(size => (
//                   <option key={size} value={size}>{size}</option>
//                 ))}
//               </select>
//               <span> contacts per page</span>
//             </div>

//             <div className="flex justify-center items-center gap-2 mt-2.5 flex-wrap">
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1.5 border border-gray-200 bg-white text-gray-700 rounded min-w-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-50"
//               >
//                 Previous
//               </button>
              
//               {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                 let pageNumber;
//                 if (totalPages <= 5) {
//                   pageNumber = i + 1;
//                 } else if (currentPage <= 3) {
//                   pageNumber = i + 1;
//                 } else if (currentPage >= totalPages - 2) {
//                   pageNumber = totalPages - 4 + i;
//                 } else {
//                   pageNumber = currentPage - 2 + i;
//                 }
                
//                 return (
//                   <button
//                     key={pageNumber}
//                     onClick={() => paginate(pageNumber)}
//                     className={`px-3 py-1.5 border rounded min-w-9 text-sm cursor-pointer ${
//                       currentPage === pageNumber 
//                         ? 'bg-blue-600 text-white border-blue-600' 
//                         : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
//                     }`}
//                   >
//                     {pageNumber}
//                   </button>
//                 );
//               })}
              
//               {totalPages > 5 && currentPage < totalPages - 2 && (
//                 <span className="px-3 py-1.5 text-gray-500">...</span>
//               )}
              
//               {totalPages > 5 && currentPage < totalPages - 2 && (
//                 <button
//                   onClick={() => paginate(totalPages)}
//                   className="px-3 py-1.5 border border-gray-200 bg-white text-gray-700 rounded min-w-9 text-sm cursor-pointer hover:bg-gray-50"
//                 >
//                   {totalPages}
//                 </button>
//               )}
              
//               <div className="flex items-center mx-2.5">
//                 <span className="text-sm">Go to: </span>
//                 <input
//                   type="number"
//                   min="1"
//                   max={totalPages}
//                   value={currentPage}
//                   onChange={(e) => {
//                     const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages);
//                     paginate(value);
//                   }}
//                   className="w-12 px-1.5 py-1 ml-1.5 text-center border border-gray-300 rounded text-sm"
//                 />
//               </div>
              
//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="px-3 py-1.5 border border-gray-200 bg-white text-gray-700 rounded min-w-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-50"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Bio Modal */}
//         {showBioModal && currentLeadForBio && (
//           <div className="fixed inset-0 z-[1002] bg-gray-100 flex flex-col max-h-screen">
//             <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                   <FaUser className="text-blue-600 text-sm" />
//                   <h3 className="text-md font-semibold text-gray-900">Author Bio</h3>
//                   <span className="text-xs text-gray-500 ml-2">ID: {bioData.contact_id}</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   {!editingBio && (
//                     <button
//                       onClick={() => setEditingBio(true)}
//                       className="px-2 py-1 bg-blue-500 text-white rounded text-xs flex items-center gap-1 hover:bg-blue-600 ml-20"
//                     >
//                       <FaEdit size={12} /> Edit
//                     </button>
//                   )}
//                   <button
//                     onClick={() => {
//                       setShowBioModal(false);
//                       setCurrentLeadForBio(null);
//                       setEditingBio(false);
//                       setGeminiResearch('');
//                       setGeminiError(null);
//                     }}
//                     className="p-1.5 text-red-500 hover:bg-gray-100 rounded"
//                   >
//                     <FaTimes size={45} />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1 overflow-hidden p-3">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
//                 <div className="space-y-3">
//                   <div className="border border-gray-300 rounded p-3">
//                     <h4 className="font-semibold text-gray-800 text-sm mb-2">Bio</h4>
//                     <div className="grid grid-cols-2 gap-2 mb-2">
//                       <div>
//                         <label className="block mb-1 text-xs font-medium">Name</label>
//                         <input
//                           value={bioData.name}
//                           onChange={(e) => handleBioChange('name', e.target.value)}
//                           readOnly={!editingBio}
//                           className={`w-full p-1.5 text-xs rounded border ${
//                             editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
//                           }`}
//                         />
//                       </div>
//                       <div>
//                         <label className="block mb-1 text-xs font-medium">Email</label>
//                         <input
//                           value={bioData.email}
//                           onChange={(e) => handleBioChange('email', e.target.value)}
//                           readOnly={!editingBio}
//                           className={`w-full p-1.5 text-xs rounded border ${
//                             editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
//                           }`}
//                         />
//                       </div>
//                     </div>

//                     <div className="mb-2">
//                       <h4 className="font-semibold text-xs mb-1">Address</h4>
//                       <div className="grid grid-cols-2 gap-1">
//                         <input 
//                           value={bioData.street_address} 
//                           onChange={(e) => handleBioChange('street_address', e.target.value)}
//                           readOnly={!editingBio}
//                           className={`w-full p-1.5 text-xs border rounded ${
//                             editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
//                           } col-span-2`} 
//                           placeholder="Street" 
//                         />
//                         <input 
//                           value={bioData.city} 
//                           onChange={(e) => handleBioChange('city', e.target.value)}
//                           readOnly={!editingBio}
//                           className={`w-full p-1.5 text-xs border rounded ${
//                             editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
//                           }`} 
//                           placeholder="City" 
//                         />
//                         <input 
//                           value={bioData.state} 
//                           onChange={(e) => handleBioChange('state', e.target.value)}
//                           readOnly={!editingBio}
//                           className={`w-full p-1.5 text-xs border rounded ${
//                             editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
//                           }`} 
//                           placeholder="State" 
//                         />
//                         <input 
//                           value={bioData.zipcode} 
//                           onChange={(e) => handleBioChange('zipcode', e.target.value)}
//                           readOnly={!editingBio}
//                           className={`w-full p-1.5 text-xs border rounded ${
//                             editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
//                           }`} 
//                           placeholder="ZIP" 
//                         />
//                       </div>
//                     </div>

//                     <div className="mb-2">
//                       <label className="block mb-1 text-xs font-medium">Books</label>
//                       {editingBio ? (
//                         <textarea
//                           value={bioData.book_titles_input}
//                           onChange={(e) =>
//                             setBioData((p) => ({ ...p, book_titles_input: e.target.value }))
//                           }
//                           className="w-full p-1.5 text-xs rounded border min-h-[60px]"
//                           placeholder="Enter book titles, separated by commas"
//                         />
//                       ) : (
//                         <div className="bg-gray-50 p-2 rounded border text-xs min-h-[60px] max-h-[80px] overflow-y-auto">
//                           {bioData.book_titles.length ? (
//                             <div className="space-y-1">
//                               {bioData.book_titles.map((t, i) => (
//                                 <div key={i} className="flex items-start">
//                                   <span className="font-medium text-gray-500 min-w-[20px]">{i + 1}.</span>
//                                   <span className="text-gray-700 leading-tight ml-1">{t}</span>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <p className="italic text-gray-400">No books listed</p>
//                           )}
//                         </div>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block mb-1 text-xs font-medium">Phones</label>
//                       {editingBio ? (
//                         <textarea
//                           value={bioData.phone_numbers_input}
//                           onChange={(e) =>
//                             setBioData((p) => ({ ...p, phone_numbers_input: e.target.value }))
//                           }
//                           className="w-full p-1.5 text-xs border rounded min-h-[50px]"
//                           placeholder="Enter phone numbers, separated by commas"
//                         />
//                       ) : (
//                         <div className="bg-gray-50 p-2 rounded border text-xs min-h-[50px] flex items-center">
//                           {bioData.phone_numbers.length ? (
//                             <div className="flex flex-wrap gap-1">
//                               {bioData.phone_numbers.map((phone, i) => (
//                                 <span key={i} className="px-2 py-1 bg-white rounded border text-gray-700">
//                                   {phone}
//                                 </span>
//                               ))}
//                             </div>
//                           ) : (
//                             <span className="italic text-gray-400">No phone numbers</span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="border border-gray-300 rounded p-3">
//                     <h4 className="font-semibold text-gray-800 text-sm mb-2">Note</h4>
//                     <textarea
//                       value={bioData.additional_notes}
//                       onChange={(e) => handleBioChange('additional_notes', e.target.value)}
//                       readOnly={!editingBio}
//                       className={`w-full min-h-[80px] p-1.5 text-xs rounded border ${
//                         editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
//                       }`}
//                       placeholder="Additional notes..."
//                     />
//                   </div>
//                 </div>

//                 <div className="border border-gray-300 rounded p-3 overflow-y-auto">
//                   <div className="flex items-center justify-between mb-3">
//                     <div className="flex items-center gap-2">
//                       <FaRobot className="text-purple-600" />
//                       <h4 className="font-semibold text-gray-800 text-sm">Gemini Research</h4>
//                     </div>
//                     {geminiError && (
//                       <button
//                         onClick={handleRetryResearch}
//                         disabled={geminiLoading}
//                         className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center gap-1 disabled:opacity-50"
//                       >
//                         <FaSpinner className={geminiLoading ? 'animate-spin' : ''} />
//                         Retry
//                       </button>
//                     )}
//                   </div>
                  
//                   {geminiLoading && (
//                     <div className="flex flex-col items-center justify-center p-8">
//                       <div className="relative">
//                         <FaSpinner className="animate-spin text-purple-600 text-3xl mb-3" />
//                         <div className="absolute inset-0 flex items-center justify-center">
//                           <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></div>
//                         </div>
//                       </div>
//                       <span className="text-sm text-gray-600 mt-2">Researching author...</span>
//                       <span className="text-xs text-gray-400 mt-1">This may take a moment</span>
//                     </div>
//                   )}
                  
//                   {geminiError && !geminiLoading && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
//                       <div className="flex items-start gap-2">
//                         <div className="text-red-500 font-bold text-lg">⚠️</div>
//                         <div>
//                           <p className="text-red-600 font-medium">{geminiError}</p>
//                           <p className="text-xs text-gray-500 mt-2">
//                             Due to API rate limits, requests are queued and processed slowly. 
//                             Please wait a moment and try again.
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   )}
                  
//                   {geminiResearch && !geminiLoading && !geminiError && (
//                     <div className="space-y-4">
//                       {geminiResearch.split('\n').reduce((sections, line) => {
//                         if (line.match(/^\d\.|^[A-Za-z\s]+:/i) || line.startsWith('#')) {
//                           sections.push({
//                             type: 'header',
//                             content: line.replace(/^[#\d.\s]*/, '').replace(':', '')
//                           });
//                         } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
//                           if (sections.length > 0 && sections[sections.length - 1].type === 'bullet') {
//                             sections[sections.length - 1].content.push(line.trim());
//                           } else {
//                             sections.push({
//                               type: 'bullet',
//                               content: [line.trim()]
//                             });
//                           }
//                         } else if (line.trim() && !line.match(/^```/)) {
//                           sections.push({
//                             type: 'text',
//                             content: line.trim()
//                           });
//                         }
//                         return sections;
//                       }, []).map((section, index) => {
//                         if (section.type === 'header') {
//                           return (
//                             <div key={index} className="border-b border-gray-200 pb-1 mb-2">
//                               <h5 className="font-bold text-purple-800 text-sm flex items-center gap-1">
//                                 <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
//                                 {section.content}
//                               </h5>
//                             </div>
//                           );
//                         } else if (section.type === 'bullet') {
//                           return (
//                             <ul key={index} className="space-y-1 mb-3">
//                               {section.content.map((item, idx) => (
//                                 <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
//                                   <span className="text-purple-500 mt-1">•</span>
//                                   <span>{item.replace(/^[-•]\s*/, '')}</span>
//                                 </li>
//                               ))}
//                             </ul>
//                           );
//                         } else if (section.type === 'text' && section.content) {
//                           return (
//                             <p key={index} className="text-xs text-gray-700 leading-relaxed mb-3">
//                               {section.content}
//                             </p>
//                           );
//                         }
//                         return null;
//                       })}
//                     </div>
//                   )}
                  
//                   {!geminiResearch && !geminiLoading && !geminiError && (
//                     <div className="text-center py-8">
//                       <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
//                         <FaRobot className="text-purple-400 text-2xl" />
//                       </div>
//                       <p className="text-sm text-gray-500">Researching author information...</p>
//                       <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="sticky bottom-0 bg-white p-3 border-t border-gray-200">
//               <div className="flex justify-end gap-2">
//                 {editingBio && (
//                   <button
//                     onClick={saveBioData}
//                     disabled={savingBio}
//                     className={`px-3 py-1.5 rounded text-white text-xs flex items-center gap-1
//                       ${savingBio ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}
//                     `}
//                   >
//                     {savingBio ? (
//                       <>
//                         <FaSpinner className="animate-spin" /> Saving...
//                       </>
//                     ) : (
//                       <>
//                         <FaSave size={12} /> Save Changes
//                       </>
//                     )}
//                   </button>
//                 )}
//                 <button
//                   onClick={() => {
//                     setShowBioModal(false);
//                     setCurrentLeadForBio(null);
//                     setEditingBio(false);
//                     setGeminiResearch('');
//                     setGeminiError(null);
//                   }}
//                   className="px-3 py-1.5 bg-red-200 rounded text-xs hover:bg-gray-300 flex items-center gap-1"
//                 >
//                   <FaTimes size={32} /> Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Script Viewer Modal */}
//         {showScriptViewer && currentLeadForScript && (
//           <DraggableResizableModal
//             onClose={() => {
//               setShowScriptViewer(false);
//               setCurrentLeadForScript(null);
//             }}
//             title={`Scripts for ${currentLeadForScript.name}`}
//             subtitle={`Book: "${currentLeadForScript.bookTitle}"`}
//             initialWidth={1000}
//             initialHeight={650}
//             minWidth={700}
//             minHeight={500}
//           >
//             <div className="flex h-full overflow-hidden">
//               <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
//                 <div className="p-4">
//                   <h4 className="font-medium text-gray-700 mb-3">Select Script Template</h4>
//                   <div className="space-y-1">
//                     {scriptOptions.map((script) => (
//                       <button
//                         key={script}
//                         onClick={() => handleScriptSelect(script)}
//                         className={`w-full text-left p-3 rounded text-sm transition-all duration-200 ${
//                           selectedScript === script
//                             ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
//                             : 'text-gray-600 hover:bg-gray-100 hover:shadow-sm border border-transparent'
//                         }`}
//                       >
//                         {script}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
              
//               <div className="w-2/3 flex flex-col">
//                 <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//                   <div>
//                     <h4 className="font-medium text-gray-700">{selectedScript}</h4>
//                     <p className="text-xs text-gray-500 mt-1">Ready to copy and personalize</p>
//                   </div>
//                   <button
//                     onClick={copyToClipboard}
//                     className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 text-sm hover:bg-blue-600"
//                   >
//                     {copiedToClipboard ? (
//                       <>
//                         <FaCheck /> Copied!
//                       </>
//                     ) : (
//                       <>
//                         <FaCopy /> Copy to Clipboard
//                       </>
//                     )}
//                   </button>
//                 </div>
                
//                 <div className="flex-1 p-4 overflow-y-auto">
//                   <div className="bg-gray-50 p-6 rounded border border-gray-200">
//                     <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
//                       {selectedScriptContent}
//                     </pre>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </DraggableResizableModal>
//         )}

//         {/* Status Change Confirmation Modal */}
//         {showCompleteModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Confirm Status Change</h3>
//                 <button
//                   className="bg-none border-none text-xl text-gray-400 cursor-pointer"
//                   onClick={() => {
//                     setShowCompleteModal(false);
//                     setPendingStatusChange(null);
//                   }}
//                 >
//                   <FaTimes />
//                 </button>
//               </div>
//               <div className="text-gray-600 mb-5">
//                 Are you sure you want to mark this lead as <strong>{pendingStatusChange?.newStatus}</strong>?
//               </div>
//               <div className="flex justify-end gap-2.5">
//                 <button
//                   className="px-4 py-2 bg-gray-100 text-gray-700 border-none rounded cursor-pointer font-medium text-sm hover:bg-gray-200"
//                   onClick={() => {
//                     setShowCompleteModal(false);
//                     setPendingStatusChange(null);
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer font-medium text-sm hover:bg-blue-600"
//                   onClick={() => {
//                     if (pendingStatusChange) {
//                       handleStatusUpdate(pendingStatusChange.id, pendingStatusChange.newStatus);
//                       setShowCompleteModal(false);
//                       setPendingStatusChange(null);
//                     }
//                   }}
//                 >
//                   Confirm
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Rating Change Confirmation Modal */}
//         {showRatingChangeModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg">
//               <div className="flex justify-between items-center mb-3">
//                 <h3 className="text-lg font-bold">Confirm Rating Change</h3>
//                 <button
//                   className="bg-none border-none text-lg cursor-pointer"
//                   onClick={() => {
//                     setShowRatingChangeModal(false);
//                     setPendingRatingChange(null);
//                   }}
//                 >
//                   <FaTimes />
//                 </button>
//               </div>
//               <div className="text-sm mb-4">
//                 <p>
//                   Are you sure you want to change the rating from <strong>{pendingRatingChange?.currentRating || 'None'}</strong> to <strong>{pendingRatingChange?.newRating}</strong>?
//                 </p>
//               </div>
//               <div className="flex justify-end gap-2.5">
//                 <button
//                   className="px-3 py-2 bg-gray-200 border-none rounded cursor-pointer hover:bg-gray-300"
//                   onClick={() => {
//                     setShowRatingChangeModal(false);
//                     setPendingRatingChange(null);
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-3 py-2 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600"
//                   onClick={() => {
//                     if (pendingRatingChange) {
//                       handleRatingChange(pendingRatingChange.id, pendingRatingChange.newRating);
//                       setShowRatingChangeModal(false);
//                       setPendingRatingChange(null);
//                     }
//                   }}
//                 >
//                   Confirm
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Transaction Modal */}
//         {showTransactionModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
//             <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-lg relative my-4">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   Create Transaction for {currentTransactionLead?.name} (ID: {currentTransactionLead?.id})
//                 </h3>
//                 <button
//                   className="bg-none border-none text-xl text-gray-400 cursor-pointer"
//                   onClick={() => {
//                     setShowTransactionModal(false);
//                     setCurrentTransactionLead(null);
//                     setServicesDropdownOpen(false);
//                     setUploadedFile(null);
//                     setFilePreviewURL(null);
//                   }}
//                 >
//                   <FaTimes />
//                 </button>
//               </div>
              
//               <div className="space-y-4 mb-5">
//                 <div>
//                   <label className="block mb-2 font-medium text-gray-700">Transaction Status</label>
//                   <select
//                     value={transactionData.trans_status}
//                     onChange={(e) => setTransactionData({...transactionData, trans_status: e.target.value})}
//                     className="w-full p-2 rounded border border-gray-300 bg-white text-sm"
//                   >
//                     <option value="Sold">Sold</option>
//                     <option value="Pending">Pending</option>
//                     <option value="Cancelled">Cancelled</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block mb-2 font-medium text-gray-700">Services</label>
//                   <div className="relative">
//                     <div 
//                       className="w-full p-2 rounded border border-gray-300 bg-white text-sm cursor-pointer flex justify-between items-center"
//                       onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
//                     >
//                       <span className="truncate">
//                         {transactionData.service_name.length > 0 
//                           ? transactionData.service_name.join(', ') 
//                           : 'Select Services'}
//                       </span>
//                       <span>{servicesDropdownOpen ? '▲' : '▼'}</span>
//                     </div>
                    
//                     {servicesDropdownOpen && (
//                       <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 p-2 z-10 max-h-60 overflow-y-auto shadow-lg">
//                         {serviceOptions.map(service => (
//                           <label key={service} className="flex items-center p-2 cursor-pointer rounded hover:bg-gray-50">
//                             <input
//                               type="checkbox"
//                               checked={transactionData.service_name.includes(service)}
//                               onChange={(e) => {
//                                 const isChecked = e.target.checked;
//                                 setTransactionData(prev => ({
//                                   ...prev,
//                                   service_name: isChecked
//                                     ? [...prev.service_name, service]
//                                     : prev.service_name.filter(s => s !== service)
//                                 }));
//                               }}
//                               className="mr-2 cursor-pointer"
//                             />
//                             {service}
//                           </label>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block mb-2 font-medium text-gray-700">Total Service Price ($)</label>
//                   <input
//                     type="number"
//                     value={transactionData.tot_service_price}
//                     onChange={(e) => {
//                       const totalPrice = parseFloat(e.target.value) || 0;
//                       const amountPaid = parseFloat(transactionData.amount_pay) || 0;
//                       setTransactionData({
//                         ...transactionData, 
//                         tot_service_price: e.target.value,
//                         remain_bal: transactionData.payment_status !== 'Full Payment' 
//                           ? (totalPrice - amountPaid).toFixed(2)
//                           : '0'
//                       });
//                     }}
//                     className="w-full p-2 rounded border border-gray-300 text-sm"
//                     placeholder="0.00"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 font-medium text-gray-700">Payment Status</label>
//                   <select
//                     value={transactionData.payment_status}
//                     onChange={(e) => {
//                       const newPaymentStatus = e.target.value;
//                       const totalPrice = parseFloat(transactionData.tot_service_price) || 0;
//                       const amountPaid = parseFloat(transactionData.amount_pay) || 0;
                      
//                       setTransactionData({
//                         ...transactionData, 
//                         payment_status: newPaymentStatus,
//                         remain_bal: newPaymentStatus === 'Full Payment' 
//                           ? '0' 
//                           : (totalPrice - amountPaid).toFixed(2)
//                       });
//                     }}
//                     className="w-full p-2 rounded border border-gray-300 bg-white text-sm"
//                   >
//                     <option value="">Select Payment Status</option>
//                     <option value="First Payment">First Payment</option>
//                     <option value="Second Payment">Second Payment</option>
//                     <option value="Full Payment">Full Payment</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block mb-2 font-medium text-gray-700">Amount Paid ($)</label>
//                   <input
//                     type="number"
//                     value={transactionData.amount_pay}
//                     onChange={(e) => {
//                       const amountPaid = parseFloat(e.target.value) || 0;
//                       const totalPrice = parseFloat(transactionData.tot_service_price) || 0;
//                       setTransactionData({
//                         ...transactionData, 
//                         amount_pay: e.target.value,
//                         remain_bal: transactionData.payment_status !== 'Full Payment' 
//                           ? (totalPrice - amountPaid).toFixed(2)
//                           : '0'
//                       });
//                     }}
//                     className="w-full p-2 rounded border border-gray-300 text-sm"
//                     placeholder="0.00"
//                   />
//                 </div>

//                 <div>
//                   <label className="block mb-2 font-medium text-gray-700">Remaining Balance ($)</label>
//                   <input
//                     type="number"
//                     value={transactionData.remain_bal}
//                     readOnly
//                     className="w-full p-2 rounded border border-gray-300 text-sm bg-gray-50 cursor-not-allowed"
//                     placeholder="0.00"
//                   />
//                 </div>

//                 <div className="flex flex-col gap-2.5">
//                   <label className="block font-medium text-gray-700">Upload File (Image or PDF)</label>
//                   <input
//                     type="file"
//                     accept="image/*,application/pdf"
//                     onChange={(e) => {
//                       const file = e.target.files[0];
//                       if (file) {
//                         if (file.type.startsWith('image/') || file.type === 'application/pdf') {
//                           setUploadedFile(file);
//                           setFilePreviewURL(URL.createObjectURL(file));
//                         } else {
//                           alert('Please upload only images (JPEG, PNG, etc.) or PDF files.');
//                           e.target.value = '';
//                         }
//                       }
//                     }}
//                     className="p-2 border border-gray-300 rounded text-sm"
//                   />

//                   {uploadedFile && (
//                     <div className="relative border border-gray-200 rounded p-2.5 bg-gray-50 max-h-56 overflow-hidden">
//                       <button
//                         onClick={() => {
//                           setUploadedFile(null);
//                           setFilePreviewURL(null);
//                         }}
//                         className="absolute top-1 right-1 bg-transparent border-none text-red-600 text-lg cursor-pointer z-10"
//                       >
//                         <FaTimes />
//                       </button>

//                       {uploadedFile.type.startsWith('image/') ? (
//                         <img
//                           src={filePreviewURL}
//                           alt="Preview"
//                           className="w-full h-48 object-contain block rounded"
//                         />
//                       ) : (
//                         <div className="flex flex-col items-center p-4">
//                           <FaFilePdf size={48} className="text-red-500" />
//                           <span className="my-1 text-sm">{uploadedFile.name}</span>
//                           <a
//                             href={filePreviewURL}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-blue-500 underline font-bold text-sm hover:text-blue-700"
//                           >
//                             View PDF
//                           </a>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2.5">
//                 <button
//                   className="px-4 py-2 bg-gray-100 text-gray-700 border-none rounded cursor-pointer font-medium text-sm hover:bg-gray-200"
//                   onClick={() => {
//                     setShowTransactionModal(false);
//                     setCurrentTransactionLead(null);
//                     setServicesDropdownOpen(false);
//                     setUploadedFile(null);
//                     setFilePreviewURL(null);
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer font-medium text-sm hover:bg-blue-600"
//                   onClick={async () => {
//                     try {
//                       if (transactionData.service_name.length === 0) {
//                         throw new Error('Please select at least one service');
//                       }
//                       if (!transactionData.payment_status) {
//                         throw new Error('Please select a payment status');
//                       }
//                       if (!transactionData.amount_pay || isNaN(parseFloat(transactionData.amount_pay))) {
//                         throw new Error('Please enter a valid amount paid');
//                       }
//                       if (!transactionData.tot_service_price || isNaN(parseFloat(transactionData.tot_service_price))) {
//                         throw new Error('Please enter a valid total service price');
//                       }

//                       const formData = new FormData();
//                       formData.append('lead_name', currentTransactionLead.name);
//                       formData.append('lead_id', currentTransactionLead.id);
//                       formData.append('lead_owner', currentTransactionLead.owner); 
//                       formData.append('lead_transferredTo', currentTransactionLead.transferred_to); 
//                       formData.append('trans_status', transactionData.trans_status);
//                       formData.append('service_name', JSON.stringify(transactionData.service_name));
//                       formData.append('amount_pay', transactionData.amount_pay);
//                       formData.append('payment_status', transactionData.payment_status);
//                       formData.append('tot_service_price', transactionData.tot_service_price);
//                       formData.append('remain_bal', transactionData.remain_bal);
//                       if (uploadedFile) {
//                         formData.append('file', uploadedFile);
//                       }

//                       const response = await fetch(`${API_URL}/api/create-transaction`, {
//                         method: 'POST',
//                         body: formData,
//                         credentials: 'include'
//                       });

//                       const result = await response.json();

//                       if (!response.ok) {
//                         throw new Error(result.error || 'Failed to save transaction');
//                       }

//                       setLeads(prevLeads => 
//                         prevLeads.map(lead => 
//                           lead.id === currentTransactionLead.id 
//                             ? { ...lead, status: 'Completed' } 
//                             : lead
//                         )
//                       );

//                       setShowTransactionModal(false);
//                       setCurrentTransactionLead(null);
//                       setServicesDropdownOpen(false);
//                       setUploadedFile(null);
//                       setFilePreviewURL(null);

//                       alert('Transaction saved successfully!');
//                     } catch (error) {
//                       console.error('Error saving transaction:', error);
//                       alert(`Error: ${error.message}`);
//                     }
//                   }}
//                 >
//                   Save Transaction
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// export default Tasks;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes, FaFilePdf, FaRegFileAlt, FaCopy, FaCheck, FaExpandArrowsAlt, FaCompressArrowsAlt, FaUser, FaBook, FaPhone, FaEnvelope, FaMapMarkerAlt, FaEdit, FaSave, FaSpinner, FaGlobe, FaRobot } from "react-icons/fa";
import { scriptTemplates, scriptOptions } from './scriptTemplates';

const API_URL = import.meta.env.VITE_API_URL;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ========== DRAGGABLE RESIZABLE MODAL COMPONENT ==========
const DraggableResizableModal = ({ 
  children, 
  onClose, 
  title, 
  subtitle,
  initialWidth = 800,
  initialHeight = 600,
  minWidth = 400,
  minHeight = 300
}) => {
  const [position, setPosition] = useState({ x: window.innerWidth/2 - initialWidth/2, y: 100 });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeDirection, setResizeDirection] = useState(null);
  const modalRef = useRef(null);
  const isFullscreen = useRef(false);
  const originalSize = useRef(null);
  const originalPosition = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) {
      return;
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeMouseDown = (direction) => (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    } else if (isResizing) {
      const newSize = { ...size };
      const newPosition = { ...position };

      if (resizeDirection.includes('e')) {
        newSize.width = Math.max(minWidth, e.clientX - position.x);
      }
      if (resizeDirection.includes('s')) {
        newSize.height = Math.max(minHeight, e.clientY - position.y);
      }
      if (resizeDirection.includes('w')) {
        const widthChange = position.x - e.clientX;
        newSize.width = Math.max(minWidth, size.width + widthChange);
        if (newSize.width > minWidth) {
          newPosition.x = e.clientX;
        }
      }
      if (resizeDirection.includes('n')) {
        const heightChange = position.y - e.clientY;
        newSize.height = Math.max(minHeight, size.height + heightChange);
        if (newSize.height > minHeight) {
          newPosition.y = e.clientY;
        }
      }

      setSize(newSize);
      setPosition(newPosition);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen.current) {
      originalSize.current = { ...size };
      originalPosition.current = { ...position };
      
      setPosition({ x: 0, y: 0 });
      setSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
      isFullscreen.current = true;
    } else {
      setPosition(originalPosition.current);
      setSize(originalSize.current);
      isFullscreen.current = false;
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeDirection]);

  return (
    <div className="fixed inset-0 z-[1001] pointer-events-none">
      <div
        ref={modalRef}
        className="absolute bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: `${minWidth}px`,
          minHeight: `${minHeight}px`,
          maxWidth: `${window.innerWidth}px`,
          maxHeight: `${window.innerHeight}px`,
        }}
      >
        <div 
          className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title={isFullscreen.current ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen.current ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div
            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize"
            onMouseDown={handleResizeMouseDown('n')}
          />
          <div
            className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize"
            onMouseDown={handleResizeMouseDown('e')}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
            onMouseDown={handleResizeMouseDown('s')}
          />
          <div
            className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize"
            onMouseDown={handleResizeMouseDown('w')}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize"
            onMouseDown={handleResizeMouseDown('ne')}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            onMouseDown={handleResizeMouseDown('se')}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-nesw-resize"
            onMouseDown={handleResizeMouseDown('sw')}
          />
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize"
            onMouseDown={handleResizeMouseDown('nw')}
          />
        </div>
      </div>
    </div>
  );
};

// ========== DEBOUNCE HOOK ==========
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function Tasks() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingComment, setEditingComment] = useState({});
  const [savingComment, setSavingComment] = useState({});
  const [editingCommentsTemp, setEditingCommentsTemp] = useState({});
  const [currentAgent, setCurrentAgent] = useState(null);
  const [activeTab, setActiveTab] = useState('myContacts');
  const [agents, setAgents] = useState([]);
  const [updatingRatings, setUpdatingRatings] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Go to page input state
  const [goToPageInput, setGoToPageInput] = useState('1');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [showRatingChangeModal, setShowRatingChangeModal] = useState(false);
  const [pendingRatingChange, setPendingRatingChange] = useState(null);

  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentTransactionLead, setCurrentTransactionLead] = useState(null);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [transactionData, setTransactionData] = useState({
    trans_status: '',
    service_name: [],
    amount_pay: '',
    payment_status: '',
    tot_service_price: '',
    remain_bal: ''
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewURL, setFilePreviewURL] = useState(null);

  // Search states
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Script Viewer State
  const [showScriptViewer, setShowScriptViewer] = useState(false);
  const [selectedScript, setSelectedScript] = useState('');
  const [selectedScriptContent, setSelectedScriptContent] = useState('');
  const [currentLeadForScript, setCurrentLeadForScript] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  // Gemini Research State
  const [geminiResearch, setGeminiResearch] = useState('');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState(null);
  
  const requestQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const researchCache = useRef(new Map());
  const lastRequestTime = useRef(0);
  const MIN_REQUEST_INTERVAL = 2000;
  
  const serviceOptions = [
    'NBSP', 'INBSP', 'Book Video', 'Screenplay', 'Republication', 
    'LA Times', 'SEO', 'Publication', 'Website', 'Kate Delaney', 
    'Audiobook', 'New York Times', 'Billboard', 'Press Release', 
    'Graphic Design', 'Animation', 'Coverage', 'Treatment', 
    'Query Letter', 'Synopsis', 'Outline', 'Pitch Sheet', 'IMDB', 
    'Community Boosting', 'Facebook', 'Instagram', 'TikTok', 
    'Youtube', 'Book Signing'
  ];

  // Bio Modal State
  const [showBioModal, setShowBioModal] = useState(false);
  const [currentLeadForBio, setCurrentLeadForBio] = useState(null);
  const [bioData, setBioData] = useState({
    contact_id: '',
    name: '',
    book_titles: [],
    book_titles_input: '',
    email: '',
    street_address: '',
    city: '',
    state: '',
    zipcode: '',
    phone_numbers: [],
    phone_numbers_input: '',
    reserve_note: '',
    additional_notes: ''
  });
  const [editingBio, setEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);

  // Sync goToPageInput with currentPage
  useEffect(() => {
    setGoToPageInput(currentPage.toString());
  }, [currentPage]);

  // Handle go to page with debounce
  const handleGoToPageChange = (e) => {
    const value = e.target.value;
    setGoToPageInput(value);
    
    // Allow empty or negative sign temporarily
    if (value === '' || value === '-') {
      return;
    }
    
    const pageNumber = parseInt(value, 10);
    if (!isNaN(pageNumber)) {
      // Debounced navigation
      const timeoutId = setTimeout(() => {
        const validPage = Math.min(Math.max(1, pageNumber), totalPages);
        paginate(validPage);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleGoToPageBlur = () => {
    const pageNumber = parseInt(goToPageInput, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      paginate(pageNumber);
    } else {
      setGoToPageInput(currentPage.toString());
    }
  };

  // Search handlers
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const processRequestQueue = async () => {
    if (isProcessingQueue.current || requestQueue.current.length === 0) return;
    
    isProcessingQueue.current = true;
    
    while (requestQueue.current.length > 0) {
      const request = requestQueue.current.shift();
      
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => 
          setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
      }
      
      try {
        await request.fn();
        lastRequestTime.current = Date.now();
      } catch (error) {
        console.error('Error processing queued request:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    isProcessingQueue.current = false;
  };

  const fetchGeminiResearch = async (lead, retryCount = 0) => {
    if (!GEMINI_API_KEY) {
      setGeminiError('Gemini API key not configured');
      return;
    }

    const cacheKey = `${lead.id}_${lead.name}`;
    const cachedData = researchCache.current.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < 3600000) {
      setGeminiResearch(cachedData.data);
      return;
    }

    setGeminiLoading(true);
    setGeminiError(null);
    setGeminiResearch('');

    const makeRequest = async () => {
      try {
        const prompt = `Tell me more about this author:
Name: ${lead.name || 'Unknown'}
Email: ${lead.email || 'Not provided'}
Book Title: ${lead.bookTitle || 'Unknown'}

Please research and provide information about:
1. This author's presence on Amazon (find their book if available)
2. Any existing website they might have
3. Any press releases or media coverage they've had
4. Additional biographical information if available

Please format the response in a clear, organized way with sections for Amazon Presence, Website, Press Coverage, and Biography. If specific information is not found, please indicate that.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 429) {
            let waitTime = 30;
            
            if (errorData.error?.details) {
              const retryInfo = errorData.error.details.find(d => 
                d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
              );
              if (retryInfo?.retryDelay) {
                const match = retryInfo.retryDelay.match(/(\d+)s/);
                if (match) {
                  waitTime = parseInt(match[1]);
                }
              }
            }
            
            const baseWaitTime = waitTime * Math.pow(2, retryCount);
            
            if (retryCount < 3) {
              setGeminiError(`Rate limit reached. Retrying in ${Math.ceil(baseWaitTime)} seconds... (Attempt ${retryCount + 1}/3)`);
              
              await new Promise(resolve => setTimeout(resolve, baseWaitTime * 1000));
              
              requestQueue.current.push({
                fn: () => fetchGeminiResearch(lead, retryCount + 1)
              });
              processRequestQueue();
              return;
            } else {
              throw new Error('Rate limit exceeded. Please try again later.');
            }
          }
          
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
          throw new Error('No response from Gemini');
        }
        
        if (data.candidates[0]?.finishReason === 'SAFETY') {
          throw new Error('Response was blocked due to safety concerns');
        }
        
        const researchText = data.candidates[0]?.content?.parts[0]?.text || 'No research results found';
        
        researchCache.current.set(cacheKey, {
          data: researchText,
          timestamp: Date.now()
        });
        
        setGeminiResearch(researchText);
      } catch (error) {
        console.error('Error in Gemini request:', error);
        setGeminiError(error.message);
      } finally {
        setGeminiLoading(false);
      }
    };

    requestQueue.current.push({ fn: makeRequest });
    processRequestQueue();
  };

  const debouncedFetchGeminiResearch = useCallback(
    debounce((lead) => {
      fetchGeminiResearch(lead);
    }, 1000),
    []
  );

  const handleRetryResearch = () => {
    if (currentLeadForBio) {
      const cacheKey = `${currentLeadForBio.id}_${currentLeadForBio.name}`;
      researchCache.current.delete(cacheKey);
      fetchGeminiResearch(currentLeadForBio);
    }
  };

  const openBioModal = async (lead) => {
    setCurrentLeadForBio(lead);
    setGeminiResearch('');
    setGeminiError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/leads/${lead.id}/bio`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBioData(data);
      } else {
        let phoneNumbers = [];
        try {
          phoneNumbers = lead.phone ? JSON.parse(lead.phone) : [];
          if (!Array.isArray(phoneNumbers)) {
            phoneNumbers = [lead.phone];
          }
        } catch {
          phoneNumbers = lead.phone ? [lead.phone] : [];
        }
        
        let bookTitles = [];
        if (lead.bookTitle) {
          bookTitles = lead.bookTitle.split(',').map(title => title.trim()).filter(title => title);
        }
        
        setBioData({
          contact_id: lead.id || '',
          name: lead.name || '',
          book_titles: bookTitles,
          book_titles_input: lead.bookTitle || '',
          email: lead.email || '',
          street_address: '',
          city: '',
          state: '',
          zipcode: '',
          phone_numbers: phoneNumbers,
          phone_numbers_input: phoneNumbers.join(', ') || '',
          reserve_note: '',
          additional_notes: lead.comment || ''
        });
      }
    } catch (error) {
      console.error('Error fetching bio data:', error);
      let phoneNumbers = [];
      try {
        phoneNumbers = lead.phone ? JSON.parse(lead.phone) : [];
        if (!Array.isArray(phoneNumbers)) {
          phoneNumbers = [lead.phone];
        }
      } catch {
        phoneNumbers = lead.phone ? [lead.phone] : [];
      }
      
      let bookTitles = [];
      if (lead.bookTitle) {
        bookTitles = lead.bookTitle.split(',').map(title => title.trim()).filter(title => title);
      }
      
      setBioData({
        contact_id: lead.id || '',
        name: lead.name || '',
        book_titles: bookTitles,
        book_titles_input: lead.bookTitle || '',
        email: lead.email || '',
        street_address: '',
        city: '',
        state: '',
        zipcode: '',
        phone_numbers: phoneNumbers,
        phone_numbers_input: phoneNumbers.join(', ') || '',
        reserve_note: '',
        additional_notes: lead.comment || ''
      });
    }
    
    debouncedFetchGeminiResearch(lead);
    
    setShowBioModal(true);
    setEditingBio(false);
  };

  const handleBioChange = (field, value) => {
    setBioData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveBioData = async () => {
    try {
      setSavingBio(true);
      
      const bioDataToSave = {
        name: bioData.name,
        book_titles_input: bioData.book_titles_input,
        email: bioData.email,
        street_address: bioData.street_address,
        city: bioData.city,
        state: bioData.state,
        zipcode: bioData.zipcode,
        phone_numbers_input: bioData.phone_numbers_input,
        reserve_note: bioData.reserve_note,
        additional_notes: bioData.additional_notes
      };
      
      const response = await fetch(`${API_URL}/api/leads/${bioData.contact_id}/bio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bioDataToSave),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save bio data');
      }
      
      const result = await response.json();
      
      const updatedLead = result.data;
      
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === bioData.contact_id 
            ? { 
                ...lead, 
                name: updatedLead.name || bioData.name,
                bookTitle: updatedLead.book_title || bioData.book_titles_input,
                email: updatedLead.email || bioData.email,
                phone: updatedLead.phone || '[]',
                comment: updatedLead.comment || bioData.additional_notes
              } 
            : lead
        )
      );
      
      if (updatedLead.book_title) {
        const bookTitlesArray = updatedLead.book_title
          .split(',')
          .map(title => title.trim())
          .filter(title => title);
        
        setBioData(prev => ({
          ...prev,
          book_titles: bookTitlesArray
        }));
      }
      
      if (updatedLead.phone) {
        let phoneNumbersArray = [];
        try {
          phoneNumbersArray = JSON.parse(updatedLead.phone);
          if (!Array.isArray(phoneNumbersArray)) {
            phoneNumbersArray = [updatedLead.phone];
          }
        } catch {
          phoneNumbersArray = [updatedLead.phone];
        }
        
        setBioData(prev => ({
          ...prev,
          phone_numbers: phoneNumbersArray
        }));
      }
      
      setEditingBio(false);
      alert('Bio data saved successfully!');
    } catch (error) {
      console.error('Error saving bio data:', error);
      alert(`Error saving bio data: ${error.message}`);
    } finally {
      setSavingBio(false);
    }
  };

  const openScriptViewer = (lead) => {
    setCurrentLeadForScript(lead);
    setShowScriptViewer(true);
    setSelectedScript(scriptOptions[0]);
    personalizeScriptContent(scriptOptions[0], lead);
  };

  const personalizeScriptContent = (scriptName, lead) => {
    let content = scriptTemplates[scriptName];
    
    if (lead) {
      content = content
        .replace(/\[Client Name\]/g, lead.name || 'Client')
        .replace(/\[Book Title\]/g, lead.bookTitle || 'Your Book')
        .replace(/\[Agent Name\]/g, currentAgent?.name || 'Our Agent')
        .replace(/\[Company Name\]/g, 'Our Publishing Company');
    }
    
    setSelectedScriptContent(content);
    setCopiedToClipboard(false);
  };

  const handleScriptSelect = (scriptName) => {
    setSelectedScript(scriptName);
    personalizeScriptContent(scriptName, currentLeadForScript);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(selectedScriptContent);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const fetchAssignedLeads = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_URL}/api/contacts-agents`);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('pageSize', pageSize);
      url.searchParams.append('filter', activeTab);
      
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        url.searchParams.append('search', debouncedSearchTerm.trim());
      }

      const response = await fetch(url, { credentials: 'include' });
      
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();

      const formattedLeads = data.data.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        owner: contact.lead_owner,
        status: contact.status || '',
        bookTitle: contact.book_title,
        publisher: contact.publisher,
        rating: contact.rating || '',
        assignedTo: contact.assigned_to,
        transferred_to: contact.transferred_to,
        comment: contact.comment || '',
        payment_status: contact.payment_status || '',
      }));

      setLeads(formattedLeads);
      setTotalItems(data.pagination.totalItems);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeTab, debouncedSearchTerm]);

  useEffect(() => {
    fetchAssignedLeads();
  }, [fetchAssignedLeads]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const fetchCurrentAgent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/current-agentID`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch current agent');
        const data = await response.json();
        setCurrentAgent(data);
      } catch (error) {
        console.error('Error fetching current agent:', error);
      }
    };
    
    fetchCurrentAgent();
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/agents`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Agents data is not in expected format');
        setAgents(data);
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };
    fetchAgents();
  }, []);

  // Status update with confirmation
  const handleStatusChangeWithConfirmation = (id, newStatus) => {
    setPendingStatusChange({ id, newStatus });
    setShowCompleteModal(true);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/api/contacts/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRatingChange = async (id, newRating) => {
    setUpdatingRatings(prev => ({ ...prev, [id]: true }));

    try {
      const lead = leads.find(l => l.id === id);
      
      if (newRating === 'Decline') {
        const confirmDecline = window.confirm(
          `⚠️ Delete Lead?\n\n` +
          `Are you sure you want to delete "${lead?.name || 'this lead'}"?\n\n` +
          `⚠️ Only use for WRONG NUMBER!\n\n` +
          `This action cannot be undone.`
        );
        
        if (!confirmDecline) {
          setUpdatingRatings(prev => ({ ...prev, [id]: false }));
          return;
        }
      } else if (newRating === 'Flagged') {
        const confirmFlagged = window.confirm(
          `⭐ Flag Lead?\n\n` +
          `Mark "${lead?.name || 'this lead'}" as Flagged?\n\n` +
          `This lead will be saved for follow-up.`
        );
        
        if (!confirmFlagged) {
          setUpdatingRatings(prev => ({ ...prev, [id]: false }));
          return;
        }
      }
      
      const response = await fetch(`${API_URL}/api/update-ratings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update rating');
      }

      if (newRating === 'Decline') {
        alert(`✅ Lead "${lead?.name}" deleted.`);
      } else if (newRating === 'Flagged') {
        alert(`⭐ Lead "${lead?.name}" flagged.`);
      }

      await fetchAssignedLeads();

      setShowRatingChangeModal(false);
      setPendingRatingChange(null);

    } catch (error) {
      console.error('Error updating rating:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setUpdatingRatings(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleRatingSelect = (id, currentRating, newRating) => {
    if (currentRating !== newRating) {
      setPendingRatingChange({ id, currentRating, newRating });
      setShowRatingChangeModal(true);
    }
  };

  const handleLocalCommentChange = (leadId, newComment) => {
    setEditingCommentsTemp(prev => ({ ...prev, [leadId]: newComment }));
  };

  const handleCommentSave = async (leadId) => {
    const newComment = editingCommentsTemp[leadId] || '';
    try {
      setSavingComment(prev => ({ ...prev, [leadId]: true }));
      const response = await fetch(`${API_URL}/api/leads/${leadId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment }),
      });
      if (!response.ok) throw new Error('Failed to save comment');
      setLeads(prevLeads => prevLeads.map(lead => lead.id === leadId ? { ...lead, comment: newComment } : lead));
      setEditingComment(prev => ({ ...prev, [leadId]: false }));
    } catch (error) {
      console.error('Error saving comment:', error);
    } finally {
      setSavingComment(prev => ({ ...prev, [leadId]: false }));
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl mb-6 text-white font-bold bg-blue-400 p-7 rounded">Assigned Leads</h1>
        <p>Loading your leads...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 bg-gray-50 min-h-screen">
        <h1 className="text-2xl mb-6 text-white font-bold bg-blue-400 p-7 rounded">Assigned Leads</h1>
        
        <div className="flex border-b border-gray-200 mb-6">
          <div 
            className={`px-6 py-3 cursor-pointer border-b-2 ${activeTab === 'myContacts' ? 'border-yellow-700 text-black font-semibold' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab('myContacts')}
          >
            My Contacts
          </div>
          <div 
            className={`px-6 py-3 cursor-pointer border-b-2 ${activeTab === 'flagged' ? 'border-yellow-700 text-black font-semibold' : 'border-transparent text-gray-500'}`}
            onClick={() => setActiveTab('flagged')}
          >
            Flagged
          </div>
        </div>

        {/* Search Section */}
        <div className="flex gap-3 mb-6 items-center flex-wrap">
          <input
            type="text"
            placeholder="Search contacts by name, email, phone, or book title..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="px-3.5 py-2.5 rounded-lg border border-gray-300 flex-1 max-w-md min-w-60 text-sm transition-colors focus:outline-none focus:border-blue-300"
          />
          <button 
            onClick={handleSearch}
            className="px-4.5 py-2.5 bg-blue-500 text-white border border-blue-500 rounded-lg cursor-pointer text-sm transition-colors hover:bg-blue-600"
          >
            Search
          </button>
          {(searchInput || searchTerm) && (
            <button 
              onClick={handleClearSearch}
              className="px-4.5 py-2.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg cursor-pointer text-sm transition-colors hover:bg-gray-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search indicator */}
        {searchTerm && (
          <div className="mb-4 text-sm text-blue-600">
            Showing results for: <strong>"{searchTerm}"</strong>
            {totalItems === 0 && <span className="text-red-500 ml-2">- No results found</span>}
          </div>
        )}

        <div className="flex justify-between items-center flex-wrap mt-5">
          <div className="flex items-center gap-2">
            <span className="text-sm">Show: </span>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-sm rounded border border-gray-300 bg-white cursor-pointer"
            >
              {[10, 25, 50, 100, 500, 1000, 2000].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm"> contacts per page</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm cursor-pointer rounded border border-gray-300 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-3 py-1.5 text-sm cursor-pointer rounded border min-w-9 ${
                    currentPage === pageNumber 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-3 py-1.5 text-gray-500">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <button
                onClick={() => paginate(totalPages)}
                className="px-3 py-1.5 text-sm cursor-pointer rounded border border-gray-300 bg-gray-50 min-w-9"
              >
                {totalPages}
              </button>
            )}

            <div className="flex items-center gap-1">
              <span>Go to: </span>
              <input
                type="text"
                value={goToPageInput}
                onChange={handleGoToPageChange}
                onBlur={handleGoToPageBlur}
                className="w-14 px-1 py-0.5 text-sm border border-gray-300 rounded text-center"
              />
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm cursor-pointer rounded border border-gray-300 bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full border-separate border-spacing-0 bg-white shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr>
                <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Name</th>
                <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Contact</th>
                <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Book Details</th>
                {activeTab === 'flagged' && (
                  <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Status</th>
                )}
                <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Rating</th>
                <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Comment</th>
                <th className="text-left p-3 bg-blue-400 font-semibold border-b border-gray-200 text-white text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
                      <button
                        onClick={() => openBioModal(lead)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left w-full text-xs"
                      >
                        {lead.name}
                      </button>
                    </td>
                    
                    <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
                      <div className="flex flex-col">
                        {(() => {
                          if (!lead.phone) {
                            return <span className="text-gray-400 italic mr-2 text-xs">-</span>;
                          }

                          let phones = [];
                          try {
                            // Handle different possible formats
                            if (typeof lead.phone === 'string') {
                              // Check if it's a JSON array string
                              if (lead.phone.startsWith('[')) {
                                phones = JSON.parse(lead.phone);
                              } else {
                                // Split by comma to get individual phone numbers
                                phones = lead.phone.split(',').map(p => p.trim()).filter(p => p);
                              }
                            } else if (Array.isArray(lead.phone)) {
                              phones = lead.phone;
                            } else {
                              phones = [String(lead.phone)];
                            }
                            
                            // Ensure phones is an array and filter out empty values
                            if (!Array.isArray(phones)) {
                              phones = [phones];
                            }
                            phones = phones.filter(p => p && p.trim());
                            
                          } catch (error) {
                            console.error('Error parsing phones:', error);
                            phones = [lead.phone];
                          }

                          // Show only first phone number
                          const firstPhone = phones[0];
                          const remainingCount = phones.length - 1;
                          
                          return (
                            <div className="flex items-center flex-wrap gap-1">
                              {firstPhone ? (
                                <span className="text-blue-600 text-xs">
                                  {firstPhone}
                                </span>
                              ) : (
                                <span className="text-gray-400 italic text-xs">-</span>
                              )}
                              {remainingCount > 0 && (
                                <span 
                                  className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full cursor-help"
                                  title={`${remainingCount} more phone number(s): ${phones.slice(1).join(', ')}`}
                                >
                                  +{remainingCount}
                                </span>
                              )}
                            </div>
                          );
                        })()}

                        {lead.email ? (
                          <span className="text-gray-700 text-xs mt-1">{lead.email}</span>
                        ) : (
                          <span className="text-gray-400 italic text-xs mt-1">-</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top max-w-xs">
                      <div className="break-words">
                        {lead.bookTitle?.split(',').map((book, index) => {
                          const trimmedBook = book.trim();
                          if (!trimmedBook) return null;
                          
                          return (
                            <div key={index} className={index > 0 ? "mt-1" : ""}>
                              <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(trimmedBook)}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 underline font-bold break-words hover:text-blue-800 text-xs"
                              >
                                {index + 1}. {trimmedBook}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                      {lead.publisher && (
                        <div className="break-words mt-2 text-gray-500 text-xs">
                          {lead.publisher}
                        </div>
                      )}
                    </td>
                    
                    {activeTab === 'flagged' && (
                      <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChangeWithConfirmation(lead.id, e.target.value)}
                          className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 font-medium text-xs w-full max-w-xs"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                          <option value="Completed">Completed</option>
                          <option value="Incompleted">Incompleted</option>
                          <option value="Transferred">Transferred</option>
                        </select>
                      </td>
                    )}
                    
                    <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
                      <select
                        value={lead.rating || ''}
                        onChange={(e) => handleRatingSelect(lead.id, lead.rating, e.target.value)}
                        disabled={updatingRatings[lead.id]}
                        className={`px-2 py-1 rounded border border-gray-300 bg-white font-medium text-xs w-full max-w-xs ${
                          lead.rating === 'Flagged' ? 'text-yellow-500' : 
                          lead.rating === 'Decline' ? 'text-red-500' : 'text-gray-500'
                        } ${updatingRatings[lead.id] ? 'opacity-70' : ''}`}
                      >
                        {updatingRatings[lead.id] ? (
                          <option value="">Updating...</option>
                        ) : (
                          <>
                            <option value="">Select Rating</option>
                            <option value="Flagged">Flagged</option>
                            <option value="Decline">Decline</option>
                          </>
                        )}
                      </select>
                      {updatingRatings[lead.id] && (
                        <span className="text-gray-500 text-xs ml-2">Saving...</span>
                      )}
                    </td>
                    
                    <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
                      {editingComment[lead.id] ? (
                        <>
                          <textarea
                            value={editingCommentsTemp[lead.id] || ''}
                            onChange={(e) => handleLocalCommentChange(lead.id, e.target.value)}
                            placeholder="Enter comment"
                            className="w-full resize-y p-2 rounded border border-gray-300 min-h-16 text-xs"
                          />
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleCommentSave(lead.id)}
                              disabled={savingComment[lead.id]}
                              className={`px-2 py-1 rounded cursor-pointer text-white text-xs font-medium transition-colors ${
                                savingComment[lead.id] ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
                              }`}
                            >
                              {savingComment[lead.id] ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingComment(prev => ({ ...prev, [lead.id]: false }))}
                              disabled={savingComment[lead.id]}
                              className="px-2 py-1 bg-gray-100 text-gray-700 border-none rounded cursor-pointer text-xs font-medium transition-colors hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="mb-1 text-xs">
                            {lead.comment || <span className="text-gray-400 italic">No comment</span>}
                          </div>
                          <button
                            onClick={() => {
                              setEditingComment(prev => ({ ...prev, [lead.id]: true }));
                              setEditingCommentsTemp(prev => ({ ...prev, [lead.id]: lead.comment || '' }));
                            }}
                            className="px-2 py-1 bg-yellow-50 text-yellow-800 border-none rounded cursor-pointer text-xs font-medium transition-colors hover:bg-yellow-100 mt-1"
                          >
                            {lead.comment ? 'Edit' : 'Add'}
                          </button>
                        </>
                      )}
                    </td>
                    
                    <td className="p-3 border-b border-gray-200 text-gray-700 text-xs align-top">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => openScriptViewer(lead)}
                          className="px-2 py-1 bg-green-50 text-green-700 border-none rounded cursor-pointer text-xs font-medium transition-colors hover:bg-green-100 flex items-center gap-1"
                        >
                          <FaRegFileAlt className="text-xs" />
                          View Scripts
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === 'flagged' ? 7 : 6} className="p-4 border-b border-gray-200 text-center text-gray-500 text-xs">
                    {activeTab === 'myContacts' 
                      ? 'No leads assigned to you currently' 
                      : activeTab === 'flagged'
                      ? 'No flagged leads found'
                      : 'No incomplete transactions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalItems > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 my-5 text-sm text-gray-500">
              <span>Show: </span>
              <select 
                value={pageSize} 
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded border border-gray-200 bg-white cursor-pointer"
              >
                {[10, 25, 50, 100, 500, 1000, 2000].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span> contacts per page</span>
            </div>

            <div className="flex justify-center items-center gap-2 mt-2.5 flex-wrap">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 bg-white text-gray-700 rounded min-w-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`px-3 py-1.5 border rounded min-w-9 text-sm cursor-pointer ${
                      currentPage === pageNumber 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-3 py-1.5 text-gray-500">...</span>
              )}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  onClick={() => paginate(totalPages)}
                  className="px-3 py-1.5 border border-gray-200 bg-white text-gray-700 rounded min-w-9 text-sm cursor-pointer hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              )}
              
              <div className="flex items-center mx-2.5">
                <span className="text-sm">Go to: </span>
                <input
                  type="text"
                  value={goToPageInput}
                  onChange={handleGoToPageChange}
                  onBlur={handleGoToPageBlur}
                  className="w-12 px-1.5 py-1 ml-1.5 text-center border border-gray-300 rounded text-sm"
                />
              </div>
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 bg-white text-gray-700 rounded min-w-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Bio Modal */}
        {showBioModal && currentLeadForBio && (
          <div className="fixed inset-0 z-[1002] bg-gray-100 flex flex-col max-h-screen">
            <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-600 text-sm" />
                  <h3 className="text-md font-semibold text-gray-900">Author Bio</h3>
                  <span className="text-xs text-gray-500 ml-2">ID: {bioData.contact_id}</span>
                </div>
                <div className="flex items-center gap-1">
                  {!editingBio && (
                    <button
                      onClick={() => setEditingBio(true)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs flex items-center gap-1 hover:bg-blue-600 ml-20"
                    >
                      <FaEdit size={12} /> Edit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowBioModal(false);
                      setCurrentLeadForBio(null);
                      setEditingBio(false);
                      setGeminiResearch('');
                      setGeminiError(null);
                    }}
                    className="p-1.5 text-red-500 hover:bg-gray-100 rounded"
                  >
                    <FaTimes size={45} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                <div className="space-y-3">
                  <div className="border border-gray-300 rounded p-3">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Bio</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block mb-1 text-xs font-medium">Name</label>
                        <input
                          value={bioData.name}
                          onChange={(e) => handleBioChange('name', e.target.value)}
                          readOnly={!editingBio}
                          className={`w-full p-1.5 text-xs rounded border ${
                            editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-medium">Email</label>
                        <input
                          value={bioData.email}
                          onChange={(e) => handleBioChange('email', e.target.value)}
                          readOnly={!editingBio}
                          className={`w-full p-1.5 text-xs rounded border ${
                            editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <h4 className="font-semibold text-xs mb-1">Address</h4>
                      <div className="grid grid-cols-2 gap-1">
                        <input 
                          value={bioData.street_address} 
                          onChange={(e) => handleBioChange('street_address', e.target.value)}
                          readOnly={!editingBio}
                          className={`w-full p-1.5 text-xs border rounded ${
                            editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
                          } col-span-2`} 
                          placeholder="Street" 
                        />
                        <input 
                          value={bioData.city} 
                          onChange={(e) => handleBioChange('city', e.target.value)}
                          readOnly={!editingBio}
                          className={`w-full p-1.5 text-xs border rounded ${
                            editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
                          }`} 
                          placeholder="City" 
                        />
                        <input 
                          value={bioData.state} 
                          onChange={(e) => handleBioChange('state', e.target.value)}
                          readOnly={!editingBio}
                          className={`w-full p-1.5 text-xs border rounded ${
                            editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
                          }`} 
                          placeholder="State" 
                        />
                        <input 
                          value={bioData.zipcode} 
                          onChange={(e) => handleBioChange('zipcode', e.target.value)}
                          readOnly={!editingBio}
                          className={`w-full p-1.5 text-xs border rounded ${
                            editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
                          }`} 
                          placeholder="ZIP" 
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="block mb-1 text-xs font-medium">Books</label>
                      {editingBio ? (
                        <textarea
                          value={bioData.book_titles_input}
                          onChange={(e) =>
                            setBioData((p) => ({ ...p, book_titles_input: e.target.value }))
                          }
                          className="w-full p-1.5 text-xs rounded border min-h-[60px]"
                          placeholder="Enter book titles, separated by commas"
                        />
                      ) : (
                        <div className="bg-gray-50 p-2 rounded border text-xs min-h-[60px] max-h-[80px] overflow-y-auto">
                          {bioData.book_titles.length ? (
                            <div className="space-y-1">
                              {bioData.book_titles.map((t, i) => (
                                <div key={i} className="flex items-start">
                                  <span className="font-medium text-gray-500 min-w-[20px]">{i + 1}.</span>
                                  <span className="text-gray-700 leading-tight ml-1">{t}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="italic text-gray-400">No books listed</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium">Phones</label>
                      {editingBio ? (
                        <textarea
                          value={bioData.phone_numbers_input}
                          onChange={(e) =>
                            setBioData((p) => ({ ...p, phone_numbers_input: e.target.value }))
                          }
                          className="w-full p-1.5 text-xs border rounded min-h-[50px]"
                          placeholder="Enter phone numbers, separated by commas"
                        />
                      ) : (
                        <div className="bg-gray-50 p-2 rounded border text-xs min-h-[50px] flex items-center">
                          {bioData.phone_numbers.length ? (
                            <div className="flex flex-wrap gap-1">
                              {bioData.phone_numbers.map((phone, i) => (
                                <span key={i} className="px-2 py-1 bg-white rounded border text-gray-700">
                                  {phone}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="italic text-gray-400">No phone numbers</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded p-3">
                    <h4 className="font-semibold text-gray-800 text-sm mb-2">Note</h4>
                    <textarea
                      value={bioData.additional_notes}
                      onChange={(e) => handleBioChange('additional_notes', e.target.value)}
                      readOnly={!editingBio}
                      className={`w-full min-h-[80px] p-1.5 text-xs rounded border ${
                        editingBio ? 'border-blue-300 bg-white' : 'bg-gray-50'
                      }`}
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>

                <div className="border border-gray-300 rounded p-3 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FaRobot className="text-purple-600" />
                      <h4 className="font-semibold text-gray-800 text-sm">Gemini Research</h4>
                    </div>
                    {geminiError && (
                      <button
                        onClick={handleRetryResearch}
                        disabled={geminiLoading}
                        className="px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 flex items-center gap-1 disabled:opacity-50"
                      >
                        <FaSpinner className={geminiLoading ? 'animate-spin' : ''} />
                        Retry
                      </button>
                    )}
                  </div>
                  
                  {geminiLoading && (
                    <div className="flex flex-col items-center justify-center p-8">
                      <div className="relative">
                        <FaSpinner className="animate-spin text-purple-600 text-3xl mb-3" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 mt-2">Researching author...</span>
                      <span className="text-xs text-gray-400 mt-1">This may take a moment</span>
                    </div>
                  )}
                  
                  {geminiError && !geminiLoading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="text-red-500 font-bold text-lg">⚠️</div>
                        <div>
                          <p className="text-red-600 font-medium">{geminiError}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Due to API rate limits, requests are queued and processed slowly. 
                            Please wait a moment and try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {geminiResearch && !geminiLoading && !geminiError && (
                    <div className="space-y-4">
                      {geminiResearch.split('\n').reduce((sections, line) => {
                        if (line.match(/^\d\.|^[A-Za-z\s]+:/i) || line.startsWith('#')) {
                          sections.push({
                            type: 'header',
                            content: line.replace(/^[#\d.\s]*/, '').replace(':', '')
                          });
                        } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                          if (sections.length > 0 && sections[sections.length - 1].type === 'bullet') {
                            sections[sections.length - 1].content.push(line.trim());
                          } else {
                            sections.push({
                              type: 'bullet',
                              content: [line.trim()]
                            });
                          }
                        } else if (line.trim() && !line.match(/^```/)) {
                          sections.push({
                            type: 'text',
                            content: line.trim()
                          });
                        }
                        return sections;
                      }, []).map((section, index) => {
                        if (section.type === 'header') {
                          return (
                            <div key={index} className="border-b border-gray-200 pb-1 mb-2">
                              <h5 className="font-bold text-purple-800 text-sm flex items-center gap-1">
                                <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                                {section.content}
                              </h5>
                            </div>
                          );
                        } else if (section.type === 'bullet') {
                          return (
                            <ul key={index} className="space-y-1 mb-3">
                              {section.content.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                                  <span className="text-purple-500 mt-1">•</span>
                                  <span>{item.replace(/^[-•]\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        } else if (section.type === 'text' && section.content) {
                          return (
                            <p key={index} className="text-xs text-gray-700 leading-relaxed mb-3">
                              {section.content}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                  
                  {!geminiResearch && !geminiLoading && !geminiError && (
                    <div className="text-center py-8">
                      <div className="bg-purple-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <FaRobot className="text-purple-400 text-2xl" />
                      </div>
                      <p className="text-sm text-gray-500">Researching author information...</p>
                      <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-3 border-t border-gray-200">
              <div className="flex justify-end gap-2">
                {editingBio && (
                  <button
                    onClick={saveBioData}
                    disabled={savingBio}
                    className={`px-3 py-1.5 rounded text-white text-xs flex items-center gap-1
                      ${savingBio ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}
                    `}
                  >
                    {savingBio ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave size={12} /> Save Changes
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowBioModal(false);
                    setCurrentLeadForBio(null);
                    setEditingBio(false);
                    setGeminiResearch('');
                    setGeminiError(null);
                  }}
                  className="px-3 py-1.5 bg-red-200 rounded text-xs hover:bg-gray-300 flex items-center gap-1"
                >
                  <FaTimes size={32} /> Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Script Viewer Modal */}
        {showScriptViewer && currentLeadForScript && (
          <DraggableResizableModal
            onClose={() => {
              setShowScriptViewer(false);
              setCurrentLeadForScript(null);
            }}
            title={`Scripts for ${currentLeadForScript.name}`}
            subtitle={`Book: "${currentLeadForScript.bookTitle}"`}
            initialWidth={1000}
            initialHeight={650}
            minWidth={700}
            minHeight={500}
          >
            <div className="flex h-full overflow-hidden">
              <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Select Script Template</h4>
                  <div className="space-y-1">
                    {scriptOptions.map((script) => (
                      <button
                        key={script}
                        onClick={() => handleScriptSelect(script)}
                        className={`w-full text-left p-3 rounded text-sm transition-all duration-200 ${
                          selectedScript === script
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:shadow-sm border border-transparent'
                        }`}
                      >
                        {script}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="w-2/3 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-700">{selectedScript}</h4>
                    <p className="text-xs text-gray-500 mt-1">Ready to copy and personalize</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2 text-sm hover:bg-blue-600"
                  >
                    {copiedToClipboard ? (
                      <>
                        <FaCheck /> Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy /> Copy to Clipboard
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="bg-gray-50 p-6 rounded border border-gray-200">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                      {selectedScriptContent}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </DraggableResizableModal>
        )}

        {/* Status Change Confirmation Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Status Change</h3>
                <button
                  className="bg-none border-none text-xl text-gray-400 cursor-pointer"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setPendingStatusChange(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="text-gray-600 mb-5">
                Are you sure you want to mark this lead as <strong>{pendingStatusChange?.newStatus}</strong>?
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 border-none rounded cursor-pointer font-medium text-sm hover:bg-gray-200"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setPendingStatusChange(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer font-medium text-sm hover:bg-blue-600"
                  onClick={() => {
                    if (pendingStatusChange) {
                      handleStatusUpdate(pendingStatusChange.id, pendingStatusChange.newStatus);
                      setShowCompleteModal(false);
                      setPendingStatusChange(null);
                    }
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Change Confirmation Modal */}
        {showRatingChangeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold">Confirm Rating Change</h3>
                <button
                  className="bg-none border-none text-lg cursor-pointer"
                  onClick={() => {
                    setShowRatingChangeModal(false);
                    setPendingRatingChange(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="text-sm mb-4">
                <p>
                  Are you sure you want to change the rating from <strong>{pendingRatingChange?.currentRating || 'None'}</strong> to <strong>{pendingRatingChange?.newRating}</strong>?
                </p>
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  className="px-3 py-2 bg-gray-200 border-none rounded cursor-pointer hover:bg-gray-300"
                  onClick={() => {
                    setShowRatingChangeModal(false);
                    setPendingRatingChange(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-2 bg-blue-500 text-white border-none rounded cursor-pointer hover:bg-blue-600"
                  onClick={() => {
                    if (pendingRatingChange) {
                      handleRatingChange(pendingRatingChange.id, pendingRatingChange.newRating);
                      setShowRatingChangeModal(false);
                      setPendingRatingChange(null);
                    }
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-lg relative my-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Transaction for {currentTransactionLead?.name} (ID: {currentTransactionLead?.id})
                </h3>
                <button
                  className="bg-none border-none text-xl text-gray-400 cursor-pointer"
                  onClick={() => {
                    setShowTransactionModal(false);
                    setCurrentTransactionLead(null);
                    setServicesDropdownOpen(false);
                    setUploadedFile(null);
                    setFilePreviewURL(null);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4 mb-5">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Transaction Status</label>
                  <select
                    value={transactionData.trans_status}
                    onChange={(e) => setTransactionData({...transactionData, trans_status: e.target.value})}
                    className="w-full p-2 rounded border border-gray-300 bg-white text-sm"
                  >
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Services</label>
                  <div className="relative">
                    <div 
                      className="w-full p-2 rounded border border-gray-300 bg-white text-sm cursor-pointer flex justify-between items-center"
                      onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                    >
                      <span className="truncate">
                        {transactionData.service_name.length > 0 
                          ? transactionData.service_name.join(', ') 
                          : 'Select Services'}
                      </span>
                      <span>{servicesDropdownOpen ? '▲' : '▼'}</span>
                    </div>
                    
                    {servicesDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 p-2 z-10 max-h-60 overflow-y-auto shadow-lg">
                        {serviceOptions.map(service => (
                          <label key={service} className="flex items-center p-2 cursor-pointer rounded hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={transactionData.service_name.includes(service)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                setTransactionData(prev => ({
                                  ...prev,
                                  service_name: isChecked
                                    ? [...prev.service_name, service]
                                    : prev.service_name.filter(s => s !== service)
                                }));
                              }}
                              className="mr-2 cursor-pointer"
                            />
                            {service}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Total Service Price ($)</label>
                  <input
                    type="number"
                    value={transactionData.tot_service_price}
                    onChange={(e) => {
                      const totalPrice = parseFloat(e.target.value) || 0;
                      const amountPaid = parseFloat(transactionData.amount_pay) || 0;
                      setTransactionData({
                        ...transactionData, 
                        tot_service_price: e.target.value,
                        remain_bal: transactionData.payment_status !== 'Full Payment' 
                          ? (totalPrice - amountPaid).toFixed(2)
                          : '0'
                      });
                    }}
                    className="w-full p-2 rounded border border-gray-300 text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Payment Status</label>
                  <select
                    value={transactionData.payment_status}
                    onChange={(e) => {
                      const newPaymentStatus = e.target.value;
                      const totalPrice = parseFloat(transactionData.tot_service_price) || 0;
                      const amountPaid = parseFloat(transactionData.amount_pay) || 0;
                      
                      setTransactionData({
                        ...transactionData, 
                        payment_status: newPaymentStatus,
                        remain_bal: newPaymentStatus === 'Full Payment' 
                          ? '0' 
                          : (totalPrice - amountPaid).toFixed(2)
                      });
                    }}
                    className="w-full p-2 rounded border border-gray-300 bg-white text-sm"
                  >
                    <option value="">Select Payment Status</option>
                    <option value="First Payment">First Payment</option>
                    <option value="Second Payment">Second Payment</option>
                    <option value="Full Payment">Full Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Amount Paid ($)</label>
                  <input
                    type="number"
                    value={transactionData.amount_pay}
                    onChange={(e) => {
                      const amountPaid = parseFloat(e.target.value) || 0;
                      const totalPrice = parseFloat(transactionData.tot_service_price) || 0;
                      setTransactionData({
                        ...transactionData, 
                        amount_pay: e.target.value,
                        remain_bal: transactionData.payment_status !== 'Full Payment' 
                          ? (totalPrice - amountPaid).toFixed(2)
                          : '0'
                      });
                    }}
                    className="w-full p-2 rounded border border-gray-300 text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Remaining Balance ($)</label>
                  <input
                    type="number"
                    value={transactionData.remain_bal}
                    readOnly
                    className="w-full p-2 rounded border border-gray-300 text-sm bg-gray-50 cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="block font-medium text-gray-700">Upload File (Image or PDF)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                          setUploadedFile(file);
                          setFilePreviewURL(URL.createObjectURL(file));
                        } else {
                          alert('Please upload only images (JPEG, PNG, etc.) or PDF files.');
                          e.target.value = '';
                        }
                      }
                    }}
                    className="p-2 border border-gray-300 rounded text-sm"
                  />

                  {uploadedFile && (
                    <div className="relative border border-gray-200 rounded p-2.5 bg-gray-50 max-h-56 overflow-hidden">
                      <button
                        onClick={() => {
                          setUploadedFile(null);
                          setFilePreviewURL(null);
                        }}
                        className="absolute top-1 right-1 bg-transparent border-none text-red-600 text-lg cursor-pointer z-10"
                      >
                        <FaTimes />
                      </button>

                      {uploadedFile.type.startsWith('image/') ? (
                        <img
                          src={filePreviewURL}
                          alt="Preview"
                          className="w-full h-48 object-contain block rounded"
                        />
                      ) : (
                        <div className="flex flex-col items-center p-4">
                          <FaFilePdf size={48} className="text-red-500" />
                          <span className="my-1 text-sm">{uploadedFile.name}</span>
                          <a
                            href={filePreviewURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline font-bold text-sm hover:text-blue-700"
                          >
                            View PDF
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 border-none rounded cursor-pointer font-medium text-sm hover:bg-gray-200"
                  onClick={() => {
                    setShowTransactionModal(false);
                    setCurrentTransactionLead(null);
                    setServicesDropdownOpen(false);
                    setUploadedFile(null);
                    setFilePreviewURL(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white border-none rounded cursor-pointer font-medium text-sm hover:bg-blue-600"
                  onClick={async () => {
                    try {
                      if (transactionData.service_name.length === 0) {
                        throw new Error('Please select at least one service');
                      }
                      if (!transactionData.payment_status) {
                        throw new Error('Please select a payment status');
                      }
                      if (!transactionData.amount_pay || isNaN(parseFloat(transactionData.amount_pay))) {
                        throw new Error('Please enter a valid amount paid');
                      }
                      if (!transactionData.tot_service_price || isNaN(parseFloat(transactionData.tot_service_price))) {
                        throw new Error('Please enter a valid total service price');
                      }

                      const formData = new FormData();
                      formData.append('lead_name', currentTransactionLead.name);
                      formData.append('lead_id', currentTransactionLead.id);
                      formData.append('lead_owner', currentTransactionLead.owner); 
                      formData.append('lead_transferredTo', currentTransactionLead.transferred_to); 
                      formData.append('trans_status', transactionData.trans_status);
                      formData.append('service_name', JSON.stringify(transactionData.service_name));
                      formData.append('amount_pay', transactionData.amount_pay);
                      formData.append('payment_status', transactionData.payment_status);
                      formData.append('tot_service_price', transactionData.tot_service_price);
                      formData.append('remain_bal', transactionData.remain_bal);
                      if (uploadedFile) {
                        formData.append('file', uploadedFile);
                      }

                      const response = await fetch(`${API_URL}/api/create-transaction`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                      });

                      const result = await response.json();

                      if (!response.ok) {
                        throw new Error(result.error || 'Failed to save transaction');
                      }

                      setLeads(prevLeads => 
                        prevLeads.map(lead => 
                          lead.id === currentTransactionLead.id 
                            ? { ...lead, status: 'Completed' } 
                            : lead
                        )
                      );

                      setShowTransactionModal(false);
                      setCurrentTransactionLead(null);
                      setServicesDropdownOpen(false);
                      setUploadedFile(null);
                      setFilePreviewURL(null);

                      alert('Transaction saved successfully!');
                    } catch (error) {
                      console.error('Error saving transaction:', error);
                      alert(`Error: ${error.message}`);
                    }
                  }}
                >
                  Save Transaction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Tasks;