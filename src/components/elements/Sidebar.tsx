import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../../assets/images/logo.jpeg';

const Sidebar: React.FC<{ isSidebarOpen: boolean; toggleSidebar: () => void }> = ({ isSidebarOpen, toggleSidebar }) => {
  const [isCustomersSubmenuOpen, setIsCustomersSubmenuOpen] = useState(false);
  const [isProductsSubmenuOpen, setIsProductsSubmenuOpen] = useState(false);
  const [isPaymentsSubmenuOpen, setIsPaymentsSubmenuOpen] = useState(false);
  const [isHubSubmenuOpen, setIsHubSubmenuOpen] = useState(false);
  const [isMarketingSubmenuOpen, setIsMarketingSubmenuOpen] = useState(false);
  const [isNotificationsSubmenuOpen, setIsNotificationsSubmenuOpen] = useState(false);
  const [isOrdersSubmenuOpen, setIsOrdersSubmenuOpen] = useState(false);
  const [isDeliverySubmenuOpen, setIsDeliverySubmenuOpen] = useState(false);

  const location = useLocation();

  // Refine active checks to be exact
  const isCustomersActive = location.pathname.startsWith('/customers');
  const isProductsActive = location.pathname.startsWith('/catalogue');
  const isPaymentsActive = location.pathname.startsWith('/payments');
  const isHubActive = location.pathname.startsWith('/hub');
  const isMarketingActive = location.pathname.startsWith('/marketing');
  const isNotificationsActive = location.pathname.startsWith('/notifications');
  const isOrdersActive = location.pathname.startsWith('/orders');
  const isDeliveryActive = location.pathname === '/delivery';

  const toggleCustomersSubmenu = () => setIsCustomersSubmenuOpen(!isCustomersSubmenuOpen);
  const toggleProductsSubmenu = () => setIsProductsSubmenuOpen(!isProductsSubmenuOpen);
  const togglePaymentsSubmenu = () => setIsPaymentsSubmenuOpen(!isPaymentsSubmenuOpen);
  const toggleHubSubmenu = () => setIsHubSubmenuOpen(!isHubSubmenuOpen);
  const toggleMarketingSubmenu = () => setIsMarketingSubmenuOpen(!isMarketingSubmenuOpen);
  const toggleNotificationsSubmenu = () => setIsNotificationsSubmenuOpen(!isNotificationsSubmenuOpen);
  const toggleOrdersSubmenu = () => setIsOrdersSubmenuOpen(!isOrdersSubmenuOpen);
  const toggleDeliverySubmenu = () => setIsDeliverySubmenuOpen(!isDeliverySubmenuOpen);

  return (
    <>
      <nav className={`sidebar ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <div>
          {/* Logo with circular background */}
          <div className="sidebar-header">
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" />
            </div>
          </div>
          <ul className="nav flex-column">
            {/* Main Dashboard Link */}
            <li className="nav-item">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <i className="fas fa-tachometer-alt"></i> Dashboard
              </NavLink>
            </li>

            {/* Customers Submenu */}
            <li
              className={`nav-item collapse-toggle ${isCustomersActive ? 'active-parent' : ''}`}
              onClick={toggleCustomersSubmenu}
            >
              <a href="javascript:void(0)" className={`nav-link d-flex align-items-center ${isCustomersActive ? 'active' : ''}`}>
                <i className="fas fa-users"></i> Customers
                <i className={`fas ${isCustomersSubmenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              </a>
            </li>
            <ul className={`submenu collapse ${isCustomersSubmenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <NavLink to="/customers/all" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  All Customers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/trials" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Trials
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/subscribers" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Subscribers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/unsubscribers" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  UnSubscribers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/new" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  New Customers
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/low-wallet" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Low Wallet
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/credit" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Credit Allocation
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/wallet-beneficiaries" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Wallet Beneficiaries
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/vacations" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Paused Subscription
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/complaints" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Complaints
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/customers/enquiries" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Enquiries
                </NavLink>
              </li>
            </ul>

            {/* Delivery Submenu */}
            <li
              className={`nav-item collapse-toggle ${location.pathname === '/delivery' ? 'active-parent' : ''}`}
              onClick={toggleDeliverySubmenu}
            >
              <a href="javascript:void(0)" className={`nav-link d-flex align-items-center ${location.pathname === '/delivery' ? 'active' : ''}`}>
                <i className="fas fa-truck"></i> Deliveries
                <i className={`fas ${isDeliverySubmenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              </a>
            </li>
            <ul className={`submenu collapse ${isDeliverySubmenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <NavLink to="/delivery/sheet" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Delivery Sheet
                </NavLink>
              </li>
            </ul>


            {/* Orders Submenu */}
            <li
              className={`nav-item collapse-toggle ${isOrdersActive ? 'active-parent' : ''}`}
              onClick={toggleOrdersSubmenu}
            >
              <a href="javascript:void(0)" className={`nav-link d-flex align-items-center ${isOrdersActive ? 'active' : ''}`}>
                <i className="fas fa-chart-line"></i> Orders
                <i className={`fas ${isOrdersSubmenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              </a>
            </li>
            <ul className={`submenu collapse ${isOrdersSubmenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <NavLink to="/orders/one-time-order" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  One Time Orders
                </NavLink>
              </li>
            </ul>

            {/* Products Submenu */}
            <li
              className={`nav-item collapse-toggle ${isProductsActive ? 'active-parent' : ''}`}
              onClick={toggleProductsSubmenu}
            >
              <a href="javascript:void(0)" className={`nav-link d-flex align-items-center ${isProductsActive ? 'active' : ''}`}>
                <i className="fas fa-box"></i> Catalogue
                <i className={`fas ${isProductsSubmenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              </a>
            </li>
            <ul className={`submenu collapse ${isProductsSubmenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <NavLink to="/catalogue/products" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Products
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/catalogue/categories" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Category
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/catalogue/banners" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Banners
                </NavLink>
              </li>
            </ul>

            {/* Payments Submenu */}
            <li
              className={`nav-item collapse-toggle ${isPaymentsActive ? 'active-parent' : ''}`}
              onClick={togglePaymentsSubmenu}
            >
              <a href="javascript:void(0)" className={`nav-link d-flex align-items-center ${isPaymentsActive ? 'active' : ''}`}>
                <i className="fas fa-money-bill-wave"></i> Payments
                <i className={`fas ${isPaymentsSubmenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              </a>
            </li>
            <ul className={`submenu collapse ${isPaymentsSubmenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <NavLink to="/payments/all" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Invoices
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/payments/add-payment" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Gateway Trans
                </NavLink>
              </li>
            </ul>

            {/* Hub Submenu */}
            <li
              className={`nav-item collapse-toggle ${isHubActive ? 'active-parent' : ''}`}
              onClick={toggleHubSubmenu}
            >
              <a href="javascript:void(0)" className={`nav-link d-flex align-items-center ${isHubActive ? 'active' : ''}`}>
                <i className="fas fa-truck"></i> Hub
                <i className={`fas ${isHubSubmenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              </a>
            </li>
            <ul className={`submenu collapse ${isHubSubmenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <NavLink to="/hub/delivery-partners" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Delivery Partners
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/hub/area-management" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Area Management
                </NavLink>
              </li>
            </ul>

            {/* Marketing Submenu */}
            <li
              className={`nav-item collapse-toggle ${isMarketingActive ? 'active-parent' : ''}`}
              onClick={toggleMarketingSubmenu}
            >
              <a href="javascript:void(0)" className={`nav-link d-flex align-items-center ${isMarketingActive ? 'active' : ''}`}>
                <i className="fas fa-bullhorn"></i> Marketing
                <i className={`fas ${isMarketingSubmenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              </a>
            </li>
            <ul className={`submenu collapse ${isMarketingSubmenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <NavLink to="/marketing/coupon" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Coupon
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/marketing/offers" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Offers
                </NavLink>
              </li>
            </ul>

            {/* Notifications Submenu */}
            <li
              className={`nav-item collapse-toggle ${isNotificationsActive ? 'active-parent' : ''}`}
              onClick={toggleNotificationsSubmenu}
            >
              <a href="javascript:void(0)" className={`nav-link d-flex align-items-center ${isNotificationsActive ? 'active' : ''}`}>
                <i className="fas fa-bell"></i> Notifications
                <i className={`fas ${isNotificationsSubmenuOpen ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
              </a>
            </li>
            <ul className={`submenu collapse ${isNotificationsSubmenuOpen ? 'show' : ''}`}>
              <li className="nav-item">
                <NavLink to="/notifications/sms" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  SMS Templates
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/notifications/push" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Push Templates
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/notifications/send-notification" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Send Notification
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/notifications/notification-scheduler" className={({ isActive }) => `nav-link ${isActive ? 'active-submenu' : ''}`}>
                  Notification Scheduler
                </NavLink>
              </li>
            </ul>
          </ul>
        </div>
      </nav>

      <div
        className={`overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={toggleSidebar}
      ></div>
    </>
  );
};

export default Sidebar;