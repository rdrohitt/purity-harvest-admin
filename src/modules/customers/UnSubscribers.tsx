import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Select, message, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { CustomInput, CustomDateRangePicker, CustomButton } from '../../components/elements';
import { ICustomer } from '../../models/Customer';
import ApiService from '../../services/apiService';
import { IDeliveryPartner } from '../../models/DeliveryPartner';
import { IArea } from '../../models/Area';
import { ISubarea } from '../../models/Subarea';

const { Option } = Select;

const UnSubscribers: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ICustomer[]>([]);
  const [filteredData, setFilteredData] = useState<ICustomer[]>([]);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [deliveryPartners, setDeliveryPartners] = useState<IDeliveryPartner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [areas, setAreas] = useState<IArea[]>([]);
  const [subareas, setSubareas] = useState<ISubarea[]>([]);

  // Fetch Delivery Partners
  const fetchDeliveryPartners = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<IDeliveryPartner[]>('/delivery_boys');
      setDeliveryPartners(response);
    } catch (error) {
      message.error('Failed to fetch delivery partners');
      console.error('Failed to fetch delivery partners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer data from the API
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<ICustomer[]>(`/customers?filter=inactive_subscribers`);
      setData(response);
      setFilteredData(response);
    } catch (error) {
      message.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
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

  useEffect(() => {
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

    fetchAreas();
    fetchSubareas();
    fetchDeliveryPartners();
    fetchCustomers();
  }, []);

  const columns: ColumnsType<ICustomer> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left',
      render: (id: number) => (
        <a className='link' onClick={() => navigate(`/customer/${id}/profile`)}>{`C-${id.toString().padStart(3, '0')}`}</a>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = data.filter((customer) =>
      customer.name.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const handleDateRangeChange = (
    value: [Dayjs | null, Dayjs | null] | null,
    dateString: [string, string] | string,
  ) => {
    setDateRange(value as [Dayjs | null, Dayjs | null]);
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

  return (
    <div>
      <h5 className='page-heading'>UnSubscribed Customers</h5>
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
        </Row>
      </div>

      <div className='tab-container'>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 50 }}
          loading={loading}
          rowKey="id"
          bordered
          scroll={{ x: 2000 }}
        />
      </div>
    </div>
  );
};

export default UnSubscribers;