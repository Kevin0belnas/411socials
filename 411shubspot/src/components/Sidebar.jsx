import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaChartLine,
  FaUser, 
  FaTasks,
  FaFileUpload,
  FaChevronDown,
  FaChevronRight,
  FaBookReader,
  FaTags,
  FaFileInvoice,
  FaChartBar,
  FaMoneyBillAlt,
  FaFileAlt,
  FaUserCog,
  FaServicestack,
  FaUserEdit,
  FaPhoneAlt,
  FaMoneyBill,
  FaReceipt,
  FaTableTennis
} from 'react-icons/fa';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  const menuItems = [
    { icon: <FaChartLine />, name: "Dashboard", path: "/dashboard" },
    // { icon: <FaFileUpload />, name: "Upload Sample", path: "/uploadfile" },
    { icon: <FaPhoneAlt />, name: "Contacts", path: "/contacts" },
    { icon: <FaUserEdit />, name: "User Management", path: "/userstatus" },
    { icon: <FaTags />, name: "Analytics", path: "/analytics" },
    { icon: <FaTableTennis />, name: "Leads Management", path: "/leadsmanagement" },
    { icon: <FaTableTennis />, name: "Upload Leads", path: "/uploadleads" },

    {
      icon: <FaTasks />,
      name: "Fulfillment",
      submenu: [
        { icon: <FaBookReader />, name: "NBSP", path: "/assignedtask" },
        { icon: <FaServicestack />, name: "Other Services", path: "/fulfillmentservices" },
        { icon: <FaUser />, name: "Vendor Management", path: "/purchaseorder" },
        { icon: <FaReceipt />, name: "Receipt", path: "/paymentreceipt" }
      ]
    },
    {
      icon: <FaFileInvoice />,
      name: "Accounting",
      submenu: [
        { icon: <FaChartBar />, name: "Sales Report", path: "/salesreport" },
        { icon: <FaMoneyBillAlt />, name: "Commission", path: "/commission" },
        { icon: <FaMoneyBill />, name: "Managerial Com.", path: "/managerialcommission" }
      ]
    }
  ];

  return (
    <aside 
      className={`h-screen bg-[#0E74A0] text-white p-4 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
        expanded ? 'w-52' : 'w-18'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="py-4 mb-4 border-b border-slate-400 whitespace-nowrap overflow-hidden flex items-center ml-2">
        <img 
          src="/logo2.png" 
          alt="Logo" 
          className="w-10 h-10 transition-all duration-300 ease-in-out rounded-full" 
        />
        <h1 className={`text-sm font-bold ml-2 transition-all duration-300 ease-in-out ${
          expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
        } overflow-hidden`}>
          411 Socials CRM
        </h1>
      </div>

      <ul className="list-none p-0 m-0 flex-grow overflow-hidden">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <li 
              className={`mb-2 rounded-md transition-colors duration-200 cursor-pointer ${
                hoveredItem === index ? 'bg-[#0c5e8a]' : 'bg-transparent'
              }`}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={item.submenu ? () => toggleSubmenu(index) : undefined}
            >
              {item.path ? (
                <Link 
                  to={item.path} 
                  className="flex items-center p-3 rounded-md text-white no-underline transition-all duration-200 whitespace-nowrap overflow-hidden h-full"
                >
                  <span className="text-xl min-w-6 flex justify-center flex-shrink-0">{item.icon}</span>
                  <span className={`ml-4 text-sm transition-all duration-300 ease-in-out ${
                    expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                  } overflow-hidden`}>
                    {item.name}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center p-3 rounded-md text-white no-underline transition-all duration-200 whitespace-nowrap overflow-hidden h-full">
                  <span className="text-xl min-w-6 flex justify-center flex-shrink-0">{item.icon}</span>
                  <span className={`ml-4 text-sm transition-all duration-300 ease-in-out ${
                    expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                  } overflow-hidden`}>
                    {item.name}
                  </span>
                  {expanded && item.submenu && (
                    <span className="ml-auto">
                      {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  )}
                </div>
              )}
            </li>

            {item.submenu && expanded && openSubmenu === index && (
              <ul className="list-none pl-5 m-0 overflow-hidden">
                {item.submenu.map((subItem, subIndex) => (
                  <li 
                    key={subIndex} 
                    className="mb-1 rounded-md transition-colors duration-200 bg-[#0E74A0] bg-opacity-10 cursor-pointer hover:bg-[#0c5e8a]"
                    onMouseEnter={() => setHoveredItem(`${index}-${subIndex}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link 
                      to={subItem.path} 
                      className="flex items-center p-3 rounded-md text-white no-underline transition-all duration-200 whitespace-nowrap overflow-hidden h-full"
                    >
                      <span className="text-xl min-w-6 flex justify-center flex-shrink-0">{subItem.icon}</span>
                      <span className="ml-4 text-sm">
                        {subItem.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </React.Fragment>
        ))}
      </ul>
    </aside>
  );
}