import React from 'react';
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
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const customerStats = [
    { title: 'Total Customers', count: 0, icon: <UserOutlined className="stat-icon total-customers-icon" /> },
    { title: 'Active Subscriptions', count: 0, icon: <CheckCircleOutlined className="stat-icon active-subscriptions-icon" /> },
    { title: 'Inactive Subscriptions', count: 0, icon: <CloseCircleOutlined className="stat-icon inactive-subscriptions-icon" /> },
    { title: 'Trial Given', count: 0, icon: <ExperimentOutlined className="stat-icon trial-given-icon" /> },
    { title: 'Without Subscription', count: 0, icon: <QuestionCircleOutlined className="stat-icon without-subscription-icon" /> },
  ];

  const orderStats = [
    { title: 'Buffalo Milk', count: '0 ltr', icon: <ShoppingCartOutlined className="stat-icon cart-icon" /> },
    { title: 'Cow Milk', count: '0 ltr', icon: <ShoppingCartOutlined className="stat-icon cart-icon" /> },
    { title: 'Ghee', count: '0 pack', icon: <ShoppingCartOutlined className="stat-icon cart-icon" /> },
    { title: 'Paneer', count: '0 pack', icon: <ShoppingCartOutlined className="stat-icon cart-icon" /> },
  ];

  const deliveryStats = [
    { title: 'Total Deliveries', count: 0, icon: <CarOutlined className="stat-icon total-deliveries-icon" /> },
    { title: 'Pending Deliveries', count: 0, icon: <QuestionCircleOutlined className="stat-icon pending-deliveries-icon" /> },
    { title: 'Successful Deliveries', count: 0, icon: <CheckCircleOutlined className="stat-icon active-subscriptions-icon" /> },
    { title: 'Failed Deliveries', count: 0, icon: <CloseCircleOutlined className="stat-icon failed-delivery-icon" /> },
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
        <Row gutter={[20, 20]} justify="space-between">
          {customerStats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
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

      <Row gutter={20} style={{ marginTop: '20px' }}>
        <Col xs={24} lg={12} style={{marginTop: '10px'}}>
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
        <Col xs={24} lg={12} style={{marginTop: '10px'}}>
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
            <Col key={index} xs={24} sm={12} md={8} lg={6} style={{marginTop: '10px'}}>
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