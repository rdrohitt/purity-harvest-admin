import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Select, message, Switch, Tooltip, Tag } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { CustomInput, CustomDateRangePicker, CustomButton } from '../../components/elements';
import { ICustomer } from '../../models/Customer';
import ApiService from '../../services/apiService';
import { IDeliveryPartner } from '../../models/DeliveryPartner';
import { IArea } from '../../models/Area';
import { ISubarea } from '../../models/Subarea';
import AddCustomerModal from './modals/AddCustomerModal';
import { ITrial } from '../../models/Trials';
import { IOrder } from '../../models/Order';
import { IProduct } from '../../models/Product';

const { Option } = Select;

const AllCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [expandedRowKey, setExpandedRowKey] = useState<number | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [data, setData] = useState<ICustomer[]>([]);
  const [trials, setTrials] = useState<ITrial[]>([]);
  const [filteredData, setFilteredData] = useState<ICustomer[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [deliveryPartners, setDeliveryPartners] = useState<IDeliveryPartner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [areas, setAreas] = useState<IArea[]>([]);
  const [subareas, setSubareas] = useState<ISubarea[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productsData, setProductsData] = useState<IProduct[]>([]);
  const [products, setProducts] = useState<{ [key: string]: { name: string; size: string } }>({});

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await ApiService.get<IProduct[]>('/products');
      setProductsData(response);
      const productMap = response.reduce((acc, product) => {
        if (product.id !== undefined) {
          acc[product.id] = { name: product.name, size: product.size };
        }
        return acc;
      }, {} as { [key: string]: { name: string; size: string } });
      setProducts(productMap);
    } catch (error) {
      message.error('Failed to load products');
    }
  };

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

  // Fetch trials
  const fetchTrials = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<ITrial[]>('/trials');
      setTrials(response);
    } catch (error) {
      message.error('Failed to load trials');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<ICustomer[]>('/customers');
      setData(response);
      setFilteredData(response);
    } catch (error) {
      message.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch delivery partners
  const fetchDeliveryPartners = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<IDeliveryPartner[]>('/delivery_boys');
      setDeliveryPartners(response);
    } catch (error) {
      message.error('Failed to fetch delivery partners');
    } finally {
      setLoading(false);
    }
  };

  // Fetch areas
  const fetchAreas = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<IArea[]>('/areas');
      setAreas(response);
    } catch (error) {
      message.error('Failed to fetch areas');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subareas
  const fetchSubareas = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<ISubarea[]>('/sub_areas');
      setSubareas(response);
    } catch (error) {
      message.error('Failed to fetch subareas');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Delivery Partners
  const handleToggleStatus = async (id: number) => {
    setLoading(true);
    try {
      await ApiService.patch<any>(`/customers/${id}/toggle_active_status`);
      fetchCustomers();
    } catch (error) {
      message.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryBoyChange = async (deliveryBoyId: number, customerId: number) => {
    // Find the customer that needs to be updated
    const customerToUpdate = filteredData.find((customer) => customer.id === customerId);
    if (!customerToUpdate) return;

    // Create a copy of the customer data without the `fcm` key
    const { fcm, ...customerDataWithoutFcm } = customerToUpdate;
    const updatedCustomerData = { ...customerDataWithoutFcm, delivery_boy_id: deliveryBoyId };

    setLoading(true);
    try {
      await ApiService.put('/customers', updatedCustomerData);
      message.success('Customer updated successfully');

      // Update the local state with the new delivery boy ID
      setFilteredData((prevData) =>
        prevData.map((customer) =>
          customer.id === customerId ? { ...customer, delivery_boy_id: deliveryBoyId } : customer
        )
      );
    } catch (error) {
      message.error('Failed to update customer');
      console.error('Error updating customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatedFromChange = (value: string, id: number) => {
    setFilteredData((prevData) =>
      prevData.map((customer) =>
        customer.id === id ? { ...customer, added_from: value as ICustomer['added_from'] } : customer
      )
    );
  };

  // Calculate total amount for each order
  const calculateTotalAmount = (items: IOrder['items'] | undefined) => {
    // Use an empty array as a fallback for undefined items
    return (items || []).reduce((total, item) => {
      const product = getProductDetails(item.product_id);
      return total + item.quantity * product.price;
    }, 0);
  };

  // Get product details by ID
  const getProductDetails = (productId: number) => {
    return productsData.find((product) => product.id === productId) || { name: 'Unknown', price: 0 };
  };

  useEffect(() => {
    fetchCustomers();
    fetchTrials();
    fetchProducts();
    fetchOrders();
    fetchDeliveryPartners();
    fetchAreas();
    fetchSubareas();
  }, []);

  const columns: ColumnsType<ICustomer> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: number) => (
        <a className='link' onClick={() => navigate(`/customer/${id}/profile`)}>{`C-${id.toString().padStart(3, '0')}`}</a>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string, record) => {
        const area = areas.find(a => a.id === record.area_id)?.name;
        const subarea = subareas.find(s => s.id === record.subarea_id)?.name;

        return (
          <span>
            {area && (
              <>
                <strong>{area}</strong>
              </>
            )}
            {subarea && (
              <>
                , <strong>{subarea}</strong> &nbsp;
              </>
            )}
            - {address}
          </span>
        );
      },
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      width: 150
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 150,
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id as number)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: 'Delivery Boy',
      dataIndex: 'delivery_boy_id',
      key: 'delivery_boy_id',
      width: 200,
      render: (deliveryBoyId: number, record) => (
        <Select
          defaultValue={deliveryBoyId}
          style={{ width: '100%' }}
          onChange={(value) => handleDeliveryBoyChange(value, record.id as number)}
        >
          {deliveryPartners.map((partner) => (
            <Option key={partner.id} value={partner.id}>
              {partner.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250
    },
    {
      title: 'Created From',
      dataIndex: 'added_from',
      key: 'added_from',
      width: 150,
      render: (addedFrom: string, record) => (
        <Select
          disabled
          defaultValue={addedFrom}
          style={{ width: 120 }}
          onChange={(value) => {
            if (record.id !== undefined) {
              handleCreatedFromChange(value, record.id)
            }
          }
          }
        >
          <Option value="admin_panel">Admin</Option>
          <Option value="android">Android</Option>
          <Option value="ios">iOS</Option>
          <Option value="web">Web</Option>
        </Select>
      ),
    },
    {
      title: 'App Version',
      dataIndex: 'app_version',
      key: 'app_version',
      width: 130
    },
    {
      title: 'Created On',
      dataIndex: 'creation_date',
      key: 'creation_date',
      width: 200,
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY hh:mm A'),
    },
  ];

  // Nested Table Columns for Trials
  const nestedTrialColumns: ColumnsType<ITrial> = [
    {
      title: 'Product',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 300, 
      render: (product_id: string) => {
        const product = products[product_id];
        return product ? `${product.name} (${product.size})` : 'Unknown';
      },
    },
    {
      title: 'Packaging',
      dataIndex: 'packaging',
      key: 'packaging',
      width: 150,
    },
    {
      title: 'Payment',
      dataIndex: 'is_cod',
      key: 'is_cod',
      width: 150,
      render: (is_cod: boolean) => (is_cod ? 'COD' : 'Paid'),
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
      render: (status: string) => (
        <span
          style={{
            color: status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange',
          }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
  ];

  // Nested Table Columns for Orders
  const nestedOrderColumns: ColumnsType<IOrder> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Products',
      dataIndex: 'items',
      key: 'items',
      width: 300, 
      render: (_, record) => (
        <div>
          {(record.items || []).map((item) => {
            const product = getProductDetails(item.product_id);
            return (
              <Tag key={item.product_id} color="blue" style={{ marginBottom: '8px' }}>
                {product.name} - Qty: {item.quantity}, Price: ₹{product.price.toFixed(2)} / pc
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Total Amount',
      key: 'totalAmount',
      width: 130,
      render: (_, record) => `₹${calculateTotalAmount(record.items).toFixed(2)}`,
    },
    {
      title: 'Payment',
      dataIndex: 'is_cod',
      key: 'is_cod',
      width: 120,
      render: (is_cod: boolean) => (is_cod ? 'COD' : 'Paid'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const getTagColor = (status: string) => {
          switch (status) {
            case 'confirmed':
              return 'blue'; // Blue for confirmed
            case 'delivered':
              return 'green'; // Green for delivered
            case 'cancelled':
              return 'red'; // Red for cancelled
            case 'rejected':
              return 'orange'; // Orange for rejected
            default:
              return 'default'; // Default grey for other statuses
          }
        };

        return (
          <Tooltip title={`Status: ${status}`}>
            <Tag color={getTagColor(status)}>{status.toUpperCase()}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Order Date',
      dataIndex: 'creation_date',
      key: 'creation_date',
      width: 150,
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
    },
    {
      title: 'Delivery Date',
      dataIndex: 'delivery_date',
      key: 'delivery_date',
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
    },
  ];

  const expandedRowRender = (record: ICustomer) => {
    const customerTrials = trials.filter((trial) => trial.customer_id === record.id);
    const customerOrders = orders.filter((order) => order.customer_id === record.id);
  
    return (
      <div className="expanded-row">
        {customerTrials.length > 0 && (
          <>
            <div className="expanded-header">Trials</div>
            <Table
              className="expanded-table"
              columns={nestedTrialColumns}
              dataSource={customerTrials}
              pagination={false}
              rowKey="id"
              bordered
              scroll={{ x: undefined }}
            />
          </>
        )}
        {customerOrders.length > 0 && (
          <>
            <div className="expanded-header" style={{ marginTop: '20px' }}>Orders</div>
            <Table
              className="expanded-table"
              columns={nestedOrderColumns}
              dataSource={customerOrders}
              pagination={false}
              rowKey="id"
              bordered
              scroll={{ x: undefined }}
            />
          </>
        )}
      </div>
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = data.filter((customer) =>
      customer.name.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleExpand = (expanded: boolean, record: ICustomer) => {
    setExpandedRowKey(expanded ? record.id ?? null : null);
  };

  const handleDateRangeChange = (
    value: [Dayjs | null, Dayjs | null] | null,
    dateString: [string, string] | string
  ) => {
    setDateRange(value as [Dayjs | null, Dayjs | null]);
  };

  return (
    <div>
      <h5>All Customers</h5>
      <div className="filter-container">
        <Row gutter={16}>
          <Col span={6}>
            <CustomInput
              placeholder="Search by name"
              value={searchText}
              onChange={handleSearch}
            />
          </Col>
          <Col span={6}>
            <CustomDateRangePicker value={dateRange} onChange={handleDateRangeChange} />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <CustomButton
              text="Add Customer"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            />
            <CustomButton
              text="Export"
              icon={<DownloadOutlined />}
              onClick={() => alert('Export triggered')}
            />
          </Col>
        </Row>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
        loading={loading}
        rowKey="id"
        expandable={{
          expandedRowRender,
          expandRowByClick: true, 
          indentSize: 0,
          expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
          onExpand: handleExpand,
        }}
        bordered
        scroll={{ x: 2000 }}
      />
      <AddCustomerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={(customerData) => console.log(customerData)}
        areas={areas}
        subareas={subareas}
        deliveryPartners={deliveryPartners}
      />
    </div>
  );
};

export default AllCustomer;