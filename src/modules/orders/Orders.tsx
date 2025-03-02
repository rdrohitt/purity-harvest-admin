import React, { useEffect, useState } from 'react';
import { Table, Tooltip, message, Tag, Row, Col, Popconfirm, Tabs } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CopyOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import ApiService from '../../services/apiService';
import { IOrder, IOrderItem } from '../../models/Order';
import { IProduct } from '../../models/Product';
import { ICustomer } from '../../models/Customer';
import type { ColumnsType } from 'antd/es/table';
import CustomInput from '../../components/elements/CustomInput';
import CustomDateRangePicker from '../../components/elements/CustomDateRangePicker';
import CustomButton from '../../components/elements/CustomButton';
import dayjs, { Dayjs } from 'dayjs';
import EditOrders from './EditOrders';
import AddOrders from './AddOrders';
import { ITransaction } from '../../models/Transactions';
import { ITrial } from '../../models/Trials';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [originalOrders, setOriginalOrders] = useState<IOrder[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<IOrder>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [selectedOrderId, setSelectedOrderId] = useState<number>(0);
  const [transactions, setTransactions] = useState<Record<string, string>>({});
  const [trials, setTrials] = useState<ITrial[]>([]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get<IOrder[]>('/orders');
      setOrders(response);
      setOriginalOrders(response);
    } catch (error) {
      message.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch trials
  const fetchTrials = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get<ITrial[]>('/trials');
      setTrials(response);
    } catch (error) {
      message.error('Failed to fetch trials');
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

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get<ITransaction[]>('/payments');
      const txnMap = response.reduce((acc, txn) => {
        acc[txn.txn_id] = txn.status;
        return acc;
      }, {} as Record<string, string>);
      setTransactions(txnMap);
    } catch (error) {
      message.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchCustomers();
    fetchTransactions();
    fetchTrials();
  }, []);

  // Get product variant details by product and variant IDs
  const getProductVariantDetails = (productId: number, variantId: number) => {
    const product = products.find((p) => p.id === productId);
    return product?.variants.find((v) => v.id === variantId) || null;
  };

  // Get customer name by ID
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return (
      <div>
        <span>
          {customer ? customer?.name : 'Unknown Customer'}
        </span>
        <div style={{ fontSize: "12px", color: "gray" }}>
          <a href={`tel:${customer?.mobile}`}>{customer?.mobile}</a>
          <Tooltip title="Copy">
            <CopyOutlined
              style={{ marginLeft: 8, cursor: 'pointer' }}
              onClick={() => {
                navigator.clipboard.writeText(customer?.mobile || '');
                message.success('Copied to clipboard');
              }}
            />
          </Tooltip> | {customer?.state} | {customer?.city} | {customer?.pin || 'NA'} | {customer?.address}
        </div>
      </div>
    )
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

  // const updateOrderStatus = async (id: number, status: string) => {
  //   try {
  //     const order = orders.find((o) => o.id === id);
  //     if (!order) {
  //       message.error('Order not found');
  //       return;
  //     }

  //     const payload = {
  //       ...order,
  //       status,
  //     };

  //     await ApiService.put(`/orders/${id}/status`, payload);
  //     message.success(`Order status updated to ${status}`);
  //     fetchOrders(); // Refresh the orders after updating
  //   } catch (error) {
  //     message.error('Failed to update order status');
  //   }
  // };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const order = orders.find((o) => o.id === id);
      if (!order) {
        message.error('Order not found');
        return;
      }

      await ApiService.put(`/orders/${id}/status?status=${status}`);
      message.success(`Order status updated to ${status}`);
      fetchOrders(); // Refresh the orders after updating
    } catch (error) {
      message.error('Failed to update order status');
    }
  };

  const handleSaveOrder = (order: IOrder) => {
    if (order.id) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      setOriginalOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    } else {
      setOrders((prev) => [...prev, { ...order, id: prev.length + 1 }]);
      setOriginalOrders((prev) => [...prev, { ...order, id: prev.length + 1 }]);
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

  const handleDateRangeChange = (value: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(value as [Dayjs | null, Dayjs | null]);
    if (value && value[0] && value[1]) {
      const [start, end] = value;
      const filteredOrders = originalOrders.filter(order => {
        const orderDate = dayjs(order.creation_date);
        return orderDate.isSame(start, 'day') || orderDate.isSame(end, 'day') || (orderDate.isAfter(start) && orderDate.isBefore(end));
      });
      setOrders(filteredOrders);
    } else {
      setOrders(originalOrders);
    }
  };

  const milkOrders = orders.filter(order =>
    order.items.some(item => {
      const product = products.find(p => p.id === item.product_id);
      return product && !product.name.toLowerCase().includes('ghee');
    })
  );

  const gheeOrders = orders.filter(order =>
    order.items.some(item => {
      const product = products.find(p => p.id === item.product_id);
      return product && product.name.toLowerCase().includes('ghee');
    })
  );

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
      width: 250,
      render: (customerId) => getCustomerName(customerId),
    },
    {
      title: 'Products',
      dataIndex: 'items',
      key: 'items',
      width: 300,
      render: (_, record) => (
        <div>
          {(record.items || []).map((item) => {
            const product = products.find((p) => p.id === item.product_id); // Get the product details
            const variant = item.product_id && item.variant_id ? getProductVariantDetails(item.product_id, item.variant_id) : null;
            return (
              <div key={item.product_id}>
                <span className="link">
                  {product?.name || 'Unknown Product'}
                </span>
                <div style={{ fontSize: "12px", color: "gray" }}>
                  {variant?.name} | {item.packaging} | Qty - {item.quantity} | Price - ₹{(variant?.price || 0).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Order Details',
      key: 'order_details',
      width: 200,
      render: (_, record) => (
        <div>
          <span>
            Amount: ₹{record.amount}
          </span>
          <div style={{ fontSize: "12px", color: "gray" }}>
            <Tag color={record.is_cod ? 'blue' : 'green'}>
              {record.is_cod ? 'COD' : 'Online'}
            </Tag>| Date: {dayjs(record.creation_date).format('DD-MMM-YYYY hh:mm A')}
          </div>
        </div>
      ),
    },
    {
      title: 'Payment Status',
      dataIndex: 'txn_id',
      key: 'status',
      width: 150,
      render: (txn_id: string) => (
        <Tag color={transactions[txn_id] === 'success' ? 'green' : 'red'}>
          {transactions[txn_id] ? transactions[txn_id].toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Order Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => (
        <Tooltip title={`Status: ${status}`}>
          <Tag color={
            status === 'delivered' ? 'green' :
              status === 'cancelled' ? 'red' :
                status === 'rejected' ? 'yellow' :
                  status === 'confirmed' ? 'blue' :
                    status === 'packed' ? 'purple' :
                      status === 'in_transit' ? 'orange' :
                        'blue'
          }>
            {status.toUpperCase()}
          </Tag>
        </Tooltip>
      ),
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
              : iconStatus === 'packed'
                ? '#6f42c1' // Purple for packed
                : iconStatus === 'in_transit'
                  ? '#fd7e14' // Orange for in_transit
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
          record.status !== 'confirmed' && (
            <Popconfirm
              title="Are you sure you want to mark this order as Confirmed?"
              onConfirm={() => updateOrderStatus(record.id!, 'confirmed')}
              okText="Yes"
              cancelText="No"
              key="confirmed"
            >
              <Tooltip title="Confirmed">
                <CheckCircleOutlined style={getIconStyle('confirmed')} />
              </Tooltip>
            </Popconfirm>
          ),
          record.status !== 'packed' && (
            <Popconfirm
              title="Are you sure you want to mark this order as Packed?"
              onConfirm={() => updateOrderStatus(record.id!, 'packed')}
              okText="Yes"
              cancelText="No"
              key="packed"
            >
              <Tooltip title="Packed">
                <CheckCircleOutlined style={getIconStyle('packed')} />
              </Tooltip>
            </Popconfirm>
          ),
          record.status !== 'in_transit' && (
            <Popconfirm
              title="Are you sure you want to mark this order as In Transit?"
              onConfirm={() => updateOrderStatus(record.id!, 'in_transit')}
              okText="Yes"
              cancelText="No"
              key="in_transit"
            >
              <Tooltip title="In Transit">
                <CheckCircleOutlined style={getIconStyle('in_transit')} />
              </Tooltip>
            </Popconfirm>
          ),
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

  const trialColumns: ColumnsType<ITrial> = [
    {
      title: 'Trial ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => `Trial-${id}`,
    },
    {
      title: 'Customer Name',
      dataIndex: 'customer_id',
      key: 'customer_name',
      width: 250,
      render: (customerId, record) => getCustomerName(customerId),
    },
    {
      title: 'Product',
      key: 'product',
      dataIndex: 'product_id',
      width: 300,
      render: (productId: number, record: ITrial) => {
        const product = products.find((p) => p.id === productId);
        const variant = product?.variants.find((v) => v.id === record.variant_id);
        const qty = record.quantity;
        const packaging = record.packaging

        return product ? (
          <div key={record.product_id}>
            <span className="link">
              {product?.name || 'Unknown Product'}
            </span>
            <div style={{ fontSize: "12px", color: "gray" }}>
              {variant?.name} | {packaging} | Qty - {qty} | Price - ₹{(variant?.price || 0).toFixed(2)}
            </div>
          </div>
        ) : (
          <Tag color="red" style={{ marginBottom: '8px' }}>
            N/A
          </Tag>
        );
      },
    },
    {
      title: 'Order Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
    },
    {
      title: 'Payment Method',
      dataIndex: 'is_cod',
      key: 'is_cod',
      width: 150,
      render: (is_cod: boolean) => (is_cod ? 'COD' : 'Online'),
    },
    {
      title: 'Payment Status',
      dataIndex: 'txn_id',
      key: 'status',
      width: 150,
      render: (txn_id: string) => (
        <Tag color={transactions[txn_id] === 'success' ? 'green' : 'red'}>
          {transactions[txn_id] ? transactions[txn_id].toUpperCase() : 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 150,
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 150,
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tooltip title={`Status: ${status}`}>
          <Tag color={status === 'completed' ? 'green' : 'blue'}>
            {status.toUpperCase()}
          </Tag>
        </Tooltip>
      ),
    },
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
        <Tabs defaultActiveKey="1" type="card">
          <Tabs.TabPane tab="Trials" key="1">
            <Table
              columns={trialColumns}
              dataSource={trials}
              rowKey="id"
              pagination={{ pageSize: 50 }}
              loading={loading}
              bordered
              scroll={{ x: 1800 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Milk Orders" key="2">
            <Table
              columns={columns}
              dataSource={milkOrders}
              rowKey="id"
              pagination={{ pageSize: 50 }}
              loading={loading}
              bordered
              scroll={{ x: 1800 }}
              rowClassName={(record) => {
                if (record.status === 'delivered') return 'row-delivered';
                if (record.status === 'cancelled') return 'row-cancelled';
                if (record.status === 'rejected') return 'row-rejected';
                return '';
              }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Ghee Orders" key="3">
            <Table
              columns={columns}
              dataSource={gheeOrders}
              rowKey="id"
              pagination={{ pageSize: 50 }}
              loading={loading}
              bordered
              scroll={{ x: 1800 }}
              rowClassName={(record) => {
                if (record.status === 'delivered') return 'row-delivered';
                if (record.status === 'cancelled') return 'row-cancelled';
                if (record.status === 'rejected') return 'row-rejected';
                if (record.status === 'confirmed') return 'row-confirmed';
                if (record.status === 'packed') return 'row-packed';
                if (record.status === 'in_transit') return 'row-in-transit';
                return '';
              }}
            />
          </Tabs.TabPane>
        </Tabs>
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