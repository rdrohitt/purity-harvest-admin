import React, { useEffect, useState } from 'react';
import { Row, Col, DatePicker, Select, Form, Tabs } from 'antd';
import ApiService from '../../services/apiService';
import TotalItemPickup from './TotalItemPickup';
import Main from './main';
import dayjs from 'dayjs';
import { IProduct } from '../../models/Product';
import './DeliverySheet.scss';

const { Option } = Select;
const { TabPane } = Tabs;

// Data for dropdowns
const drivers = ['Driver 1', 'Driver 2', 'Driver 3'];
const orderTypes = ['All Orders', 'Modified Orders'];
const orderStatuses = ['Pending', 'Delivered', 'Cancelled'];
const customers = ['Customer 1', 'Customer 2', 'Customer 3'];
const areas = ['Area 1', 'Area 2', 'Area 3'];

const DeliverySheet: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [products, setProducts] = useState<IProduct[]>([]);
  const [activeTab, setActiveTab] = useState('1');

  const stats = {
    totalOrders: 120,
    delivered: 80,
    rejected: 10,
    pending: 30,
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date || dayjs());
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const fetchProducts = async () => {
    try {
      const productData = await ApiService.get<IProduct[]>('/products');
      setProducts(productData);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h5 className="page-heading">Delivery Sheet</h5>
      <div className="filter-container">
        <Form layout="vertical">
          <Row gutter={16} align="middle">
            {/* Date Picker */}
            <Col span={4}>
              <Form.Item label={<strong>Select Date</strong>} name="date">
                <DatePicker style={{ width: '100%' }}
                  defaultValue={dayjs()}
                  onChange={handleDateChange}
                  allowClear={false}
                />
              </Form.Item>
            </Col>

            {/* Driver Name */}
            <Col span={4}>
              <Form.Item label={<strong>Driver Name</strong>} name="driver">
                <Select placeholder="Select Driver">
                  {drivers.map((driver, index) => (
                    <Option key={index} value={driver}>
                      {driver}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Order Type */}
            <Col span={4}>
              <Form.Item label={<strong>Order Type</strong>} name="orderType">
                <Select placeholder="Select Order Type">
                  {orderTypes.map((type, index) => (
                    <Option key={index} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Order Status */}
            <Col span={4}>
              <Form.Item label={<strong>Order Status</strong>} name="orderStatus">
                <Select placeholder="Select Order Status">
                  {orderStatuses.map((status, index) => (
                    <Option key={index} value={status}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Customer */}
            <Col span={4}>
              <Form.Item label={<strong>Select Customer</strong>} name="customer">
                <Select placeholder="Select Customer">
                  {customers.map((customer, index) => (
                    <Option key={index} value={customer}>
                      {customer}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Search by Area */}
            <Col span={4}>
              <Form.Item label={<strong>Search by Area</strong>} name="area">
                <Select placeholder="Select Area">
                  {areas.map((area, index) => (
                    <Option key={index} value={area}>
                      {area}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Statistics within the same row */}
          <Row gutter={16} align="middle" className="stats-row">
            <Col span={4}>
              <div className="stat-box">
                <strong>Total Orders</strong>
                <p className="blue">{stats.totalOrders}</p>
              </div>
            </Col>
            <Col span={4}>
              <div className="stat-box">
                <strong>Delivered</strong>
                <p className="green">{stats.delivered}</p>
              </div>
            </Col>
            <Col span={4}>
              <div className="stat-box">
                <strong>Rejected</strong>
                <p className="red">{stats.rejected}</p>
              </div>
            </Col>
            <Col span={4}>
              <div className="stat-box">
                <strong>Pending</strong>
                <p className="orange">{stats.pending}</p>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
      <div className="tab-container">
        <Row gutter={16}>
          <Col span={24}>
            <Tabs defaultActiveKey="1" type="card" onChange={handleTabChange}>
              <TabPane tab="Today's Pickup" key="1">
                <TotalItemPickup products={products} selectedDate={selectedDate}/>
              </TabPane>
              <TabPane tab="Deliveries" key="2">
                <Main selectedDate={selectedDate} products={products}/>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DeliverySheet;