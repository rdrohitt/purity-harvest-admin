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
import { IOrder, IOrderItem } from '../../models/Order';
import { IProduct } from '../../models/Product';
import { ITransaction } from '../../models/Transactions';

const { Option } = Select;

const AllCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [expandedRowKey, setExpandedRowKey] = useState<number | null>(null);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<ICustomer[]>([]);
  const [trials, setTrials] = useState<ITrial[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<IDeliveryPartner[]>([]);
  const [areas, setAreas] = useState<IArea[]>([]);
  const [subareas, setSubareas] = useState<ISubarea[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [transactions, setTransactions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        customersData,
        ordersData,
        trialsData,
        deliveryPartnersData,
        areasData,
        subareasData,
        productsData,
        transactionsData,
      ] = await Promise.all([
        ApiService.get<ICustomer[]>('/customers'),
        ApiService.get<IOrder[]>('/orders'),
        ApiService.get<ITrial[]>('/trials'),
        ApiService.get<IDeliveryPartner[]>('/delivery_boys'),
        ApiService.get<IArea[]>('/areas'),
        ApiService.get<ISubarea[]>('/sub_areas'),
        ApiService.get<IProduct[]>('/products'),
        ApiService.get<ITransaction[]>('/payments'),
      ]);

      setCustomers(customersData);
      setFilteredCustomers(customersData);
      setOrders(ordersData);
      setTrials(trialsData);
      setDeliveryPartners(deliveryPartnersData);
      setAreas(areasData);
      setSubareas(subareasData);
      setProducts(productsData);

      const txnMap = transactionsData.reduce((acc, txn) => {
        acc[txn.txn_id] = txn.status;
        return acc;
      }, {} as Record<string, string>);
      setTransactions(txnMap);
    } catch (error) {
      message.error('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all necessary data
  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddCustomer = async (data: Omit<ICustomer, 'id'>) => {
    try {
      setLoading(true);
      await ApiService.post<ICustomer>('/customers', data);
      fetchAllData();
      message.success('Customer added successfully.');

      setIsModalVisible(false);
    } catch (error) {
      message.error('Failed to add customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: number) => {
    try {
      setLoading(true);
      await ApiService.patch(`/customers/${id}/toggle_active_status`);
      message.success('Status updated successfully.');
      const updatedCustomers = customers.map((customer) =>
        customer.id === id ? { ...customer, is_active: !customer.is_active } : customer
      );
      setCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers);
    } catch (error) {
      message.error('Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delivery boy assignment
  const handleDeliveryBoyChange = async (deliveryBoyId: number, customerId: number) => {
    try {
      setLoading(true);
      await ApiService.put(`/customers/${customerId}`, { delivery_boy_id: deliveryBoyId });
      message.success('Delivery boy updated successfully.');
      const updatedCustomers = customers.map((customer) =>
        customer.id === customerId ? { ...customer, delivery_boy_id: deliveryBoyId } : customer
      );
      setCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers);
    } catch (error) {
      message.error('Failed to update delivery boy.');
    } finally {
      setLoading(false);
    }
  };

  // Filter customers
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(value)
    );
    setFilteredCustomers(filtered);
  };

  // Expanded row render logic
  const expandedRowRender = (record: ICustomer) => {
    const customerTrials = trials.filter((trial) => trial.customer_id === record.id);
    const customerOrders = orders.filter((order) => order.customer_id === record.id);

    return (
      <div className="expanded-row">
        {customerTrials.length > 0 && (
          <>
            <div className="expanded-header">Trials</div>
            <Table
              columns={[
                {
                  title: 'Product',
                  key: 'product',
                  dataIndex: 'product_id',
                  width: 250,
                  render: (productId: number, record: ITrial) => {
                    const product = products.find((p) => p.id === productId);
                    const variant = product?.variants.find((v) => v.id === record.variant_id);
                    const qty = product?.variants.find((v) => v.id === record.quantity);

                    return product ? (
                        <Tag color="blue" style={{ marginBottom: '8px' }}>
                        {product.name} {variant && `(${variant.size})`} {qty && `Qty: ${qty}`}
                        </Tag>
                    ) : (
                      <Tag color="red" style={{ marginBottom: '8px' }}>
                        N/A
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Packaging',
                  dataIndex: 'packaging',
                  key: 'packaging',
                  width: 150,
                  render: (packaging: 'packet' | 'bottle') => (
                    <span style={{ textTransform: 'capitalize' }}>{packaging}</span>
                  ),
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
              ]}
              dataSource={customerTrials}
              pagination={false}
              rowKey="id"
              bordered
            />
          </>
        )}
        {customerOrders.length > 0 && (
          <>
            <div className="expanded-header">Orders</div>
            <Table
              columns={[
                {
                  title: 'Product Name',
                  key: 'productName',
                  dataIndex: 'items',
                  width: 200,
                  render: (items: IOrderItem[]) =>
                    items.map((item) => {
                      const product = products.find((p) => p.id === item.product_id);
                      return product ? (
                        <Tag key={item.id} color="blue" style={{ marginBottom: '8px' }}>
                          {product.name}
                        </Tag>
                      ) : (
                        <Tag key={item.id} color="red" style={{ marginBottom: '8px' }}>
                          N/A
                        </Tag>
                      );
                    }),
                },
                {
                  title: 'Variant Name',
                  key: 'variantName',
                  dataIndex: 'items',
                  width: 200,
                  render: (items: IOrderItem[]) =>
                    items.map((item) => {
                      const product = products.find((p) => p.id === item.product_id);
                      const variant = product?.variants.find((v) => v.id === item.variant_id);
                      return variant ? (
                        <Tag key={item.variant_id} color="green" style={{ marginBottom: '8px' }}>
                          {variant.name}, Qty - {item.quantity}
                        </Tag>
                      ) : (
                        <Tag key={item.variant_id} color="red" style={{ marginBottom: '8px' }}>
                          N/A
                        </Tag>
                      );
                    }),
                },
                {
                  title: 'Packaging',
                  key: 'packaging',
                  dataIndex: 'items',
                  width: 150,
                  render: (items: IOrderItem[]) =>
                    items.map((item) => (
                      <Tag key={item.id} color="orange" style={{ marginBottom: '8px' }}>
                        {item.packaging.charAt(0).toUpperCase() + item.packaging.slice(1)}
                      </Tag>
                    )),
                },
                {
                  title: 'Order Amount',
                  key: 'amount',
                  dataIndex: 'amount',
                  width: 150,
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
                  width: 150,
                  render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
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
              ]}
              dataSource={customerOrders}
              pagination={false}
              rowKey="id"
              bordered
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <h5>All Customers</h5>
      <Row gutter={16} className="filter-container">
        <Col span={6}>
          <CustomInput
            placeholder="Search by name"
            value={searchText}
            onChange={handleSearch}
          />
        </Col>
        <Col span={6}>
          <CustomDateRangePicker
            value={dateRange}
            onChange={(dates, dateStrings) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
          />
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
            onClick={() => message.success('Export triggered')}
          />
        </Col>
      </Row>
      <Table
        columns={[
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => (
              <a className='link' onClick={() => navigate(`/customer/${id}/profile`)}>{`C-${id.toString().padStart(3, '0')}`}</a>
            ),
            },
            { title: 'Name', dataIndex: 'name', key: 'name', width: 150 },
            { title: 'Mobile', dataIndex: 'mobile', key: 'mobile', width: 120 },
            {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: (address: string, record) => {
              const area = areas.find(a => a.id === record.area_id)?.name;
              const subarea = subareas.find(s => s.id === record.subarea_id)?.name;
              const state = record.state;
              const city = record.city;
              const pin = record.pin;

              return (
              <span>
                {state && (
                <>
                   <strong>{state}</strong> &nbsp;
                </>
                )}
                {city && (
                <>
                  , <strong>{city}</strong> {pin && `- (${pin})`} &nbsp;
                </>
                )}
                - {address}
              </span>
              );
            },
            },
            {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive, record) => (
              <Switch
              checked={isActive}
              onChange={() => record.id !== undefined && handleToggleStatus(record.id)}
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
        ]}
        dataSource={filteredCustomers}
        rowKey="id"
        expandable={{
          expandedRowRender,
          expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
          onExpand: (expanded, record) =>
            setExpandedRowKey(expanded ? record.id ?? null : null),
        }}
        bordered
        pagination={{ pageSize: 20 }}
        scroll={{ x: 2000 }}
        loading={loading}
      />
      <AddCustomerModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddCustomer}
        areas={areas}
        subareas={subareas}
        deliveryPartners={deliveryPartners}
      />
    </div>
  );
};

export default AllCustomer;