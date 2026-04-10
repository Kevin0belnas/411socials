import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// Import all components
import Sidebar from './components/Sidebar';
import Sidebar2 from './components/Sidebar2';
import Navbar from './components/Navbar';
import Navbar2 from './components/Navbar2';

import About from './pages/About';
import Contacts from './pages/admin/Contacts';
import Home from './pages/admin/Home';
import Unauthorized from './pages/Unauthorized';

import WelcomePage from './pages/WelcomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import AssignedTasks from './pages/admin/AssignedTasks';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Dashboard from './pages/admin/Dashboard';
import Fulfillment from './pages/employee/Fulfillment';
import NBSP from './pages/admin/NBSP';
import Publication from './pages/admin/Publication';
import ChangeLeads from './pages/admin/ChangeLeads';
import SampleFulfillment from './pages/employee/SampleFulfillment';
import UploadFulfillmentFile from './pages/admin/UploadFulfillmentFile';
import SalesReport from './pages/admin/SalesReport';
import Commission from './pages/admin/Commission';
import UserStatus from './pages/admin/UserStatus';
import AgentChat from './pages/employee/AgentChat';
import SampleSalesReport from './pages/admin/SampleSalesReport';
import PurchaseOrder from './pages/admin/PurchaseOrder';
import FulfillmentServices from './pages/admin/FulfillmentServices';
import ManagerialCommission from './pages/admin/ManagerialCommission';
import PaymentReceipt from './pages/admin/PaymentReceipt';
import Vendor from './pages/admin/Vendor';
import Analytics from './pages/admin/Analytics';
import TaskTest from './pages/employee/TaskTest';
import EventProgram from './pages/employee/EventProgram';
import RemindersPage from './pages/employee/RemindersPage';
import Tasks from './pages/employee/Tasks';
import LeadsManagement from './pages/admin/LeadsManagement';

// Admin Layout Component
const AdminLayout = () => (
  <div style={styles.layout}>
    <Sidebar />
    <div style={styles.mainContent}>
      <Navbar />
      <div style={styles.pageContent}>
        <Outlet />
      </div>
    </div>
  </div>
);

// Agent Layout Component
const AgentLayout = () => (
  <div style={styles.layout}>
    <Sidebar2 />
    <div style={styles.mainContent}>
      <Navbar2 />
      <div style={styles.pageContent}>
        <Outlet />
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
         

        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          {/* Admin routes with Admin layout */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/about" element={<About />} />
              <Route path="/assignedtask" element={<AssignedTasks />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/nbsp" element={<NBSP />} />
              <Route path="/publication" element={<Publication />} />
              <Route path="/changeleads" element={<ChangeLeads />} />
              <Route path ="/uploadfile" element={<UploadFulfillmentFile />} />
              <Route path ="/salesreport" element={<SalesReport />} />
              <Route path ="/commission" element={<Commission />} />
              <Route path ="/userstatus" element={<UserStatus />} />
              <Route path="/sample" element={<SampleSalesReport />} />
              <Route path="/purchaseorder" element={<PurchaseOrder />} />
              <Route path="/fulfillmentservices" element={<FulfillmentServices />} />
              <Route path="/managerialcommission" element={<ManagerialCommission />} />
              <Route path="/paymentreceipt" element={<PaymentReceipt />} />
              <Route path="/vendor" element={<Vendor />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/leadsmanagement" element={<LeadsManagement/>} />


            </Route>
          </Route>

          {/* Agent routes with Agent layout */}
          <Route element={<RoleRoute allowedRoles={['agent']} />}>
            <Route element={<AgentLayout />}>
              <Route path="/tasktest" element={<TaskTest />} />
              <Route path="/about" element={<About />} />
              <Route path="/employeedashboard" element={<EmployeeDashboard />} />
              <Route path="/fulfillment" element={<Fulfillment />} />
              <Route path="/samples" element={<SampleFulfillment />} />
              <Route path="/agentchat" element={<AgentChat />} />
              <Route path="/tasks" element={<Tasks/>} />
              <Route path="/events" element={<EventProgram/>} />
              <Route path="/reminders" element={<RemindersPage />} />

            </Route>
          </Route>

          {/* Shared routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

const styles = {
  layout: {
    display: 'flex',
    height: '100vh',
  },
  mainContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  pageContent: {
    flexGrow: 1,
    padding: '0.5rem',
    paddingBottom: '1rem',
    overflowY: 'auto',
    backgroundColor: '#f8fafc',
  }
};