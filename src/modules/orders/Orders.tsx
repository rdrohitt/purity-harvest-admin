import React, { useEffect, useState } from 'react';
import { Table, Tooltip, message, Tag, Row, Col, Popconfirm } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import ApiService from '../../services/apiService';
import { IOrder } from '../../models/Order';
import { IProduct } from '../../models/Product';
import { ICustomer } from '../../models/Customer';
import type { ColumnsType } from 'antd/es/table';
import CustomInput from '../../components/elements/CustomInput';
import CustomDateRangePicker from '../../components/elements/CustomDateRangePicker';
import CustomButton from '../../components/elements/CustomButton';
import dayjs, { Dayjs } from 'dayjs';
import EditOrders from './EditOrders';
import AddOrders from './AddOrders';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<IOrder>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get<IOrder[]>('/orders');
      setOrders(response);
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get<IProduct[]>('/products');
      setProducts(response);
    } catch (error) {
      message.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get<ICustomer[]>('/customers');
      setCustomers(response);
    } catch (error) {
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
  }, []);

  // Get product variant details by product and variant IDs
  const getProductVariantDetails = (productId: number, variantId: number) => {
    const product = products.find((p) => p.id === productId);
    return product?.variants.find((v) => v.id === variantId) || null;
  };

  // Get customer name by ID
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const handleAddModalClose = () => {
    setIsAddModalVisible(false);
  };

  const handleEditModalClose = () => {
    setCurrentOrder({});
    setIsEditModalVisible(false);
  };

  const handleAddOrder = () => {
    setCurrentOrder({ items: [] });
    setIsAddModalVisible(true);
  };

  const handleOrderClick = (order: IOrder) => {
    setSelectedOrderId(order.id || 0);
    setCurrentOrder(order);
    setIsEditModalVisible(true);
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const order = orders.find((o) => o.id === id);
      if (!order) {
        message.error('Order not found');
        return;
      }

      const payload = {
        ...order,
        status,
      };

      await ApiService.put('/orders', payload);
      message.success(`Order status updated to ${status}`);
      fetchOrders(); // Refresh the orders after updating
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const handleSaveOrder = (order: IOrder) => {
    if (order.id) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    } else {
      setOrders((prev) => [...prev, { ...order, id: prev.length + 1 }]);
    }
    setIsEditModalVisible(false);
    setIsAddModalVisible(false);
    fetchOrders();
  };

  // Filter data based on search text
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase());
    const filtered = orders.filter((order) =>
      order.items.some((item) => {
        const variant = item.product_id && item.variant_id ? getProductVariantDetails(item.product_id, item.variant_id) : null;
        return variant?.name.toLowerCase().includes(e.target.value.toLowerCase());
      })
    );
    setOrders(filtered);
  };

  // Handle date range filtering
  const handleDateRangeChange = (
    value: [Dayjs | null, Dayjs | null] | null,
    dateString: [string, string] | string,
  ) => {
    setDateRange(value as [Dayjs | null, Dayjs | null]);
  };

  const columns: ColumnsType<IOrder> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <a className='link' onClick={() => handleOrderClick(orders.find((o) => o.id === id)!)}>{`Order-${id}`}</a>,
    },
    {
      title: 'Customer Name',
      dataIndex: 'customer_id',
      key: 'customer_name',
      fixed: 'left',
      width: 180,
      render: (customerId) => getCustomerName(customerId),
    },
    {
      title: 'Products',
      dataIndex: 'items',
      key: 'items',
      render: (_, record) => (
        <div>
          {(record.items || []).map((item) => {
            const product = products.find((p) => p.id === item.product_id); // Get the product details
            const variant = item.product_id && item.variant_id ? getProductVariantDetails(item.product_id, item.variant_id) : null;
            return (
              <Tag key={item.product_id} color="blue" style={{ marginBottom: '8px' }}>
                {product?.name || 'Unknown Product'} - {variant?.name || 'Unknown Variant'} - Qty: {item.quantity}, Packaging: {item.packaging}, Price: ₹{(variant?.price || 0).toFixed(2)}
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Order Amount',
      key: 'amount',
      dataIndex: 'amount',
      width: 130,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tooltip title={`Status: ${status}`}>
          <Tag color={status === 'delivered' ? 'green' : status === 'cancelled' ? 'red' : 'blue'}>
            {status.toUpperCase()}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'creation_date',
      key: 'creation_date',
      width: 130,
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      width: 130,
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      render: (_, record) => {
        const getIconStyle = (iconStatus: string) => ({
          color:
            iconStatus === 'confirmed'
              ? '#007bff' // Blue for confirmed
              : iconStatus === 'delivered'
              ? '#28a745' // Green for delivered
              : iconStatus === 'cancelled'
              ? '#dc3545' // Red for cancelled
              : iconStatus === 'rejected'
              ? '#ffc107' // Yellow for rejected
              : '#6c757d', // Default color
          cursor: 'pointer',
          fontSize: '18px',
        });
    
        const availableIcons = [
          record.status !== 'delivered' && (
            <Popconfirm
              title="Are you sure you want to mark this order as Delivered?"
              onConfirm={() => updateOrderStatus(record.id!, 'delivered')}
              okText="Yes"
              cancelText="No"
              key="delivered"
            >
              <Tooltip title="Delivered">
                <CheckCircleOutlined style={getIconStyle('delivered')} />
              </Tooltip>
            </Popconfirm>
          ),
          record.status !== 'cancelled' && (
            <Popconfirm
              title="Are you sure you want to Cancel this order?"
              onConfirm={() => updateOrderStatus(record.id!, 'cancelled')}
              okText="Yes"
              cancelText="No"
              key="cancelled"
            >
              <Tooltip title="Cancelled">
                <CloseCircleOutlined style={getIconStyle('cancelled')} />
              </Tooltip>
            </Popconfirm>
          ),
          record.status !== 'rejected' && (
            <Popconfirm
              title="Are you sure you want to Reject this order?"
              onConfirm={() => updateOrderStatus(record.id!, 'rejected')}
              okText="Yes"
              cancelText="No"
              key="rejected"
            >
              <Tooltip title="Rejected">
                <StopOutlined style={getIconStyle('rejected')} />
              </Tooltip>
            </Popconfirm>
          ),
        ];
    
        return <div style={{ display: 'flex', gap: '10px' }}>{availableIcons.filter(Boolean)}</div>;
      },
    }
  ];

  return (
    <div>
      <h5 className='page-heading'>Orders</h5>
      <div className="filter-container">
        <Row gutter={16}>
          <Col span={6}>
            <CustomInput placeholder="Search by name" value={searchText} onChange={handleSearch} />
          </Col>
          <Col span={6}>
            <CustomDateRangePicker value={dateRange} onChange={handleDateRangeChange} />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <CustomButton
              text="Add Order"
              className="primary-button"
              icon={<PlusOutlined />}
              onClick={handleAddOrder}
            />
          </Col>
        </Row>
      </div>
      <div className='tab-container'>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 50 }}
          loading={loading}
          bordered
          scroll={{ x: 1400 }}
        />
      </div>
      <EditOrders
        visible={isEditModalVisible}
        orderData={currentOrder}
        onClose={handleEditModalClose}
        onSave={handleSaveOrder}
        selectedOrderId={selectedOrderId}
      />
      <AddOrders
        visible={isAddModalVisible}
        onClose={handleAddModalClose}
        onSave={(orderData) => {
          fetchOrders();
          setIsAddModalVisible(false);
        }}
      />
    </div>
  );
};

export default Orders;