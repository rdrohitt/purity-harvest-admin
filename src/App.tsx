import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Sidebar, Topbar } from './components/elements';
import { AllCustomer, Subscription, Vacations, CustomerDetail } from './modules/customers';
import './styles/styles.scss';
import Dashboard from './modules/dashboard/Dashboard';
import DeliverySheet from './modules/deliveries/DeliverySheet';
import Products from './modules/catalogue/Products';
import Category from './modules/catalogue/Category';
import Banners from './modules/catalogue/Banners';
import AreaManagement from './modules/hub/AreaManagement';
import DeliveryPartner from './modules/hub/DeliveryPartner';
import UnSubscribers from './modules/customers/UnSubscribers';
import Orders from './modules/orders/Orders';
import Coupon from './modules/coupon/Coupon';
import Complain from './modules/complains/Complain';
import Offers from './modules/offers/Offers';
import Enquiries from './modules/customers/Enquiries';
import Trials from './modules/customers/Trials';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth > 768);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleResize = () => {
    if (window.innerWidth > 768) {
      setIsSidebarOpen(true); // Open on larger screens
    } else {
      setIsSidebarOpen(false); // Close on smaller screens
    }
  };

  useEffect(() => {
    // Attach event listener for window resize
    window.addEventListener('resize', handleResize);
    // Check screen width on initial load
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${isSidebarOpen ? '' : 'collapsed'}`}>
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="container-fluid mt-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers/all" element={<AllCustomer />} />
            <Route path="/customer/:id/:tab" element={<CustomerDetail />} />
            <Route path="/customers/subscribers" element={<Subscription />} />
            <Route path="/customers/unsubscribers" element={<UnSubscribers />} />
            <Route path="/customers/vacations" element={<Vacations />} />
            <Route path="/customers/complaints" element={<Complain />} />
            <Route path="/customers/enquiries" element={<Enquiries />} />
            <Route path="/customers/trials" element={<Trials />} />
            <Route path="/delivery/sheet" element={<DeliverySheet />} />
            <Route path="/catalogue/products" element={<Products />} />
            <Route path="/catalogue/categories" element={<Category />} />
            <Route path="/catalogue/banners" element={<Banners />} />
            <Route path="/hub/area-management" element={<AreaManagement />} />
            <Route path="/hub/delivery-partners" element={<DeliveryPartner />} />
            <Route path="/orders/one-time-order" element={<Orders />} />
            <Route path="/marketing/coupon" element={<Coupon />} />
            <Route path="/marketing/offers" element={<Offers />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App