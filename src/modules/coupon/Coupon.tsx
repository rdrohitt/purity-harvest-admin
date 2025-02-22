import React, { useEffect, useState } from 'react';
import { Col, Row, Table, message, Switch } from 'antd';
import { ColumnsType } from 'antd/es/table';
import ApiService from '../../services/apiService';
import { ICoupon } from '../../models/Coupon';
import CustomButton from '../../components/elements/CustomButton';
import { PlusOutlined } from '@ant-design/icons';
import CreateCouponModal from './CreateCouponModal';

const Coupon: React.FC = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);

  // Fetch coupon data from API
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get<ICoupon[]>('/coupons');
      setCoupons(response);
    } catch (error) {
      message.error('Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Define table columns
  const columns: ColumnsType<ICoupon> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (code, record) => (
        <a
          className='link'
          onClick={() => {
            setSelectedCoupon(record);
            setModalMode('edit');
            setIsModalVisible(true);
          }}
        >
          {code}
        </a>
      ),
    },
    {
      title: 'Min Order Value',
      dataIndex: 'min_order_value',
      key: 'min_order_value',
      render: (value) => `₹${value.toFixed(2)}`,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (value) => `${value}%`,
    },
    {
      title: 'Max Discount',
      dataIndex: 'max_discount',
      key: 'max_discount',
      render: (value) => `₹${value.toFixed(2)}`,
    },
    {
      title: 'Expiry Date',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Creation Date',
      dataIndex: 'creation_date',
      key: 'creation_date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Visible',
      dataIndex: 'is_visible',
      key: 'is_visible',
      render: (isVisible: boolean, record: ICoupon) => (
        <Switch
          checked={isVisible}
        //  onChange={(checked) => handleToggleVisibility(record, checked)}
          checkedChildren="Yes"
          unCheckedChildren="No"
        />
      ),
    },
  ];

  return (
    <div>
      <h5 className="page-heading">Coupons</h5>
      <div className="filter-container">
        <Row gutter={16}>
          <Col span={12}></Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <CustomButton
              text="Add Coupon"
              className="primary-button"
              icon={<PlusOutlined />}
              onClick={() => {
                setModalMode('add');
                setSelectedCoupon(null);
                setIsModalVisible(true);
              }}
            />
          </Col>
        </Row>
      </div>

      <div className="tab-container">
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 20 }}
        />
      </div>

      <CreateCouponModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={fetchCoupons} // Refresh the table after adding or editing a coupon
        mode={modalMode}
        initialValues={selectedCoupon} // Pass initial values for edit mode
      />
    </div>
  );
};

export default Coupon;