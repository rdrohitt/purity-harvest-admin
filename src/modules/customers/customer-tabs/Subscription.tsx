import React, { useEffect, useState } from 'react';
import { Table, Input, Select, message, Switch, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useParams } from 'react-router-dom';
import { ISubscription } from '../../../models/Subscription';
import ApiService, { BASE_URL } from '../../../services/apiService';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { IProduct } from '../../../models/Product';
import AddSubscriptionModal from './modals/AddSubscription';

const { Option } = Select;

// Mappings for user-friendly labels
const frequencyLabels: { [key: string]: string } = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  alternate_days: 'Alternate Days',
  custom: 'Custom',
};

const packagingLabels: { [key: string]: string } = {
  packet: 'Packet',
  bottle: 'Bottle',
};

const Subscription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [editableRowId, setEditableRowId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<ISubscription | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<ISubscription[]>(`/customers/${id}/subscriptions`);
      setSubscriptions(response);
    } catch (error) {
      message.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = async (newSubscription: Omit<ISubscription, 'id'>) => {
    try {
      await ApiService.post(`/subscriptions`, newSubscription);
      message.success('Subscription added successfully');
      fetchSubscriptions();
    } catch (error) {
      message.error('Failed to add subscription');
    }
  };

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await ApiService.get<IProduct[]>('/products');
      setProducts(response);
    } catch (error) {
      message.error('Failed to fetch products');
    }
  };

  // Get product name by product_id
  const getProductName = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : 'N/A';
  };

   // Get product name by product_id
   const getProductImage = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.thumbnail : 'N/A';
  };

  // Toggle row to edit mode
  const handleEdit = (record: ISubscription) => {
    setEditableRowId(record.id!);
    setEditedData({ ...record });
  };

  // Save changes and call API to update data
  const handleSave = async (recordId: number) => {
    if (!editedData) return;

    try {
      await ApiService.put(`/subscriptions`, editedData);
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === recordId ? { ...editedData } : sub))
      );
      message.success('Subscription updated successfully');
    } catch (error) {
      message.error('Failed to update subscription');
    } finally {
      setEditableRowId(null);
      setEditedData(null);
    }
  };

  // Update edited data locally
  const handleFieldChange = (key: keyof ISubscription, value: any) => {
    setEditedData((prev) => (prev ? { ...prev, [key]: value } : null));
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchProducts();
  }, []);

  const columns: ColumnsType<ISubscription> = [
    {
      title: 'Product Name',
      dataIndex: 'product_id',
      key: 'product_id',
      fixed: 'left',
      width: 330,
      render: (productId: number, record) => (
        <>
          <img
            src={`${BASE_URL}/${getProductImage(productId)}`}
            alt="Product"
            width={50}
            height={50}
            style={{ marginRight: 8 }}
          />
          {getProductName(productId)}
        </>
      ),
    },
    {
      title: 'Frequency',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 130,
      render: (frequency: string, record) =>
        editableRowId === record.id ? (
          <Select
            value={editedData?.frequency}
            onChange={(value) => handleFieldChange('frequency', value)}
            style={{ width: '100px' }}
          >
            {Object.entries(frequencyLabels).map(([key, label]) => (
              <Option key={key} value={key}>
                {label}
              </Option>
            ))}
          </Select>
        ) : (
          frequencyLabels[frequency] || frequency
        ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      render: (quantity: number, record) =>
        editableRowId === record.id ? (
          <Input
            type="number"
            value={editedData?.quantity}
            onChange={(e) => handleFieldChange('quantity', Number(e.target.value))}
          />
        ) : (
          quantity
        ),
    },
    {
      title: 'Rate',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number, record) =>
        editableRowId === record.id ? (
          <Input
            type="number"
            value={editedData?.price}
            onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
          />
        ) : (
          `₹${price.toFixed(2)}`
        ),
    },
    {
      title: 'Type',
      dataIndex: 'packaging',
      key: 'packaging',
      width: 100,
      render: (packaging: string, record) =>
        editableRowId === record.id ? (
          <Select
            value={editedData?.packaging}
            onChange={(value) => handleFieldChange('packaging', value)}
            style={{ width: '100px' }}
          >
            {Object.entries(packagingLabels).map(([key, label]) => (
              <Option key={key} value={key}>
                {label}
              </Option>
            ))}
          </Select>
        ) : (
          packagingLabels[packaging] || packaging
        ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record) =>
        editableRowId === record.id ? (
          <Switch
            checked={editedData?.is_active}
            onChange={(checked) => handleFieldChange('is_active', checked)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        ) : (
          <Switch
            checked={isActive}
            onChange={(checked) => handleFieldChange('is_active', checked)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            disabled={editableRowId !== record.id}
          />
        ),
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date: string | null) => (date ? dayjs(date).format('DD-MMM-YYYY') : 'N/A'),
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) =>
        editableRowId === record.id ? (
          <Button type="primary" onClick={() => handleSave(record.id!)}>
            Save
          </Button>
        ) : (
          <Button onClick={() => handleEdit(record)}>Edit</Button>
        ),
    },
  ];

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 16, marginRight: 20 }}>
        <Button
          className='primary-button'
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}>
          Add Subscription
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={subscriptions}
        pagination={{ pageSize: 10 }}
        rowKey="id"
        bordered
        scroll={{ x: 1300 }}
        loading={loading}
      />

      <AddSubscriptionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={handleAddSubscription}
      />
    </div>
  );
};

export default Subscription;