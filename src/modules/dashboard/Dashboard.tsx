import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';
import {
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExperimentOutlined,
  QuestionCircleOutlined,
  ShoppingCartOutlined,
  CarOutlined,
} from '@ant-design/icons';
import ApiService, { BASE_URL } from '../../services/apiService';
import './Dashboard.scss';
import { DashboardStats } from '../../models/DashboardStats';

const Dashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState({
    total_customers: 0,
    active_customers: 0,
    inactive_customers: 0,
    total_orders: 0,
    pending_orders: 0,
    delivered_orders: 0,
    total_trials: 0,
    active_trials: 0,
    completed_trials: 0,
    total_subscriptions: 0,
    active_subscriptions: 0,
    inactive_subscriptions: 0,
    total_enquiries: 0,
    total_complains: 0,
    resolved_complains: 0,
    pending_complains: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiService.get<DashboardStats>('/website/get_count');
        setDashboardStats(response);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchData();
  }, []);

  const customerStats = [
    { title: 'Total Customers', count: dashboardStats.total_customers, icon: <UserOutlined className="stat-icon total-customers-icon" />, path: '/customers/all' },
    { title: 'Total Orders', count: dashboardStats.total_orders, icon: <ShoppingCartOutlined className="stat-icon total-orders-icon" />, path: '/orders/one-time-order'},
    { title: 'Trials', count: dashboardStats.total_trials, icon: <ExperimentOutlined className="stat-icon trial-given-icon" /> ,path: '/orders/one-time-order'},
    { title: 'Active Subscriptions', count: dashboardStats.active_subscriptions, icon: <CheckCircleOutlined className="stat-icon active-subscriptions-icon" />, path: '' },
    { title: 'Inactive Subscriptions', count: dashboardStats.inactive_subscriptions, icon: <CloseCircleOutlined className="stat-icon inactive-subscriptions-icon" />, path: '' },
    { title: 'Enquiries', count: dashboardStats.total_enquiries, icon: <QuestionCircleOutlined className="stat-icon without-subscription-icon" />, path: '' },
  ];

  const orderStats = [
    { title: 'Buffalo Milk', count: '0', icon: <ShoppingCartOutlined className="stat-icon cart-icon" /> },
    { title: 'Cow Milk', count: '0', icon: <ShoppingCartOutlined className="stat-icon cart-icon" /> },
    { title: 'Ghee', count: '0', icon: <ShoppingCartOutlined className="stat-icon cart-icon" /> },
    { title: 'Paneer', count: '0', icon: <ShoppingCartOutlined className="stat-icon cart-icon" /> },
  ];

  const deliveryStats = [
    { title: 'Total Deliveries', count: dashboardStats.total_orders, icon: <CarOutlined className="stat-icon total-deliveries-icon" /> },
    { title: 'Pending Deliveries', count: dashboardStats.pending_orders, icon: <QuestionCircleOutlined className="stat-icon pending-deliveries-icon" /> },
    { title: 'Successful Deliveries', count: dashboardStats.delivered_orders, icon: <CheckCircleOutlined className="stat-icon active-subscriptions-icon" /> },
    { title: 'Failed Deliveries', count: '0', icon: <CloseCircleOutlined className="stat-icon failed-delivery-icon" /> },
  ];

  const salesStats = [
    { title: 'Total Payments Dues', count: '0 /-', icon: <i className="fa-solid fa-indian-rupee-sign stat-icon total-customers-icon"></i> },
    { title: 'Current Month Sales', count: '0 /-', icon: <i className="fa-solid fa-indian-rupee-sign stat-icon total-customers-icon"></i> },
    { title: 'Current Month Milk Sale', count: '0 /-', icon: <i className="fa-solid fa-indian-rupee-sign stat-icon total-customers-icon"></i> },
    { title: 'Current Month Ghee Sale', count: '0 /-', icon: <i className="fa-solid fa-indian-rupee-sign stat-icon total-customers-icon"></i> },
    { title: 'Current Month Paneer Sale', count: '0 /-', icon: <i className="fa-solid fa-indian-rupee-sign stat-icon total-customers-icon"></i> },
  ];

  return (
    <div className="dashboard">
      <Card title="Customers" bordered={false}>
        <Row gutter={[20, 20]}>
          {customerStats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              <Card className="stat-card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = stat.path}>
                <div className="stat-content">
                  {stat.icon}
                  <div className="stat-details">
                    <p className="stat-count">{stat.count}</p>
                    <p className="stat-title">{stat.title}</p>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col xs={24} lg={12} style={{ marginTop: '10px' }}>
          <Card title="Today's Orders Summary" bordered={false}>
            <Row gutter={[20, 20]}>
              {orderStats.map((stat, index) => (
                <Col key={index} xs={12} md={8} lg={12}>
                  <Card className="stat-card">
                    <div className="stat-content">
                      {stat.icon}
                      <div className="stat-details">
                        <p className="stat-count">{stat.count}</p>
                        <p className="stat-title">{stat.title}</p>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12} style={{ marginTop: '10px' }}>
          <Card title="Today Deliveries" bordered={false}>
            <Row gutter={[20, 20]}>
              {deliveryStats.map((stat, index) => (
                <Col key={index} xs={12} md={8} lg={12}>
                  <Card className="stat-card">
                    <div className="stat-content">
                      {stat.icon}
                      <div className="stat-details">
                        <p className="stat-count">{stat.count}</p>
                        <p className="stat-title">{stat.title}</p>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="Sales" bordered={false} style={{ marginTop: '15px' }}>
        <Row gutter={[20, 20]}>
          {salesStats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6} style={{ marginTop: '10px' }}>
              <Card className="stat-card">
                <div className="stat-content">
                  {stat.icon}
                  <div className="stat-details">
                    <p className="stat-count">{stat.count}</p>
                    <p className="stat-title">{stat.title}</p>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;