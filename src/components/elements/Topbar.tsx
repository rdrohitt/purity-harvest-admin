import React from 'react';
import { Avatar, Dropdown, MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Topbar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const navigate = useNavigate(); 
  const handleLogout = () => {
    localStorage.removeItem('bearer'); 
    navigate('/login');
  };

  // Define the menu items using the correct format
  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <header className="topbar" style={styles.topbar}>
     <div className="hamburger" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </div>
      <div style={styles.userProfile}>
        <Dropdown menu={{ items: menuItems }} trigger={['hover']}>
          <div style={styles.userInfo}>
            <Avatar size="large" icon={<UserOutlined />} />
            <span style={styles.userName}>Admin</span>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

const styles = {
  topbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: '#f1f1f1',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    height: '60px',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // Add spacing between the avatar and name
  },
  userName: {
    fontWeight: 500,
    fontSize: '16px',
    marginRight: '48px',
    marginTop: '8px'
  },
};

export default Topbar;