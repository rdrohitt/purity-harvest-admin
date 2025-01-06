import React, { useEffect, useState } from 'react';
import { Table, message, Tooltip, Row, Col } from 'antd';
import { ColumnsType } from 'antd/es/table';
import ApiService from '../../services/apiService';
import { ICustomer } from '../../models/Customer';
import CustomInput from '../../components/elements/CustomInput';
import CustomButton from '../../components/elements/CustomButton';
import { PlusOutlined } from '@ant-design/icons';
import CustomDateRangePicker from '../../components/elements/CustomDateRangePicker';
import dayjs from 'dayjs';
import AddEditVacationModal from './modals/AddEditVacationModal';
import { IVacation } from '../../models/Vacation';

const Vacations: React.FC = () => {
  const [vacations, setVacations] = useState<IVacation[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(''); // Missing state
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentVacation, setCurrentVacation] = useState<Partial<IVacation> | null>(null);

  // Fetch vacation data
  const fetchVacations = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get<IVacation[]>('/vacations'); // Replace with your API endpoint
      setVacations(response);
    } catch (error) {
      message.error('Failed to fetch vacations.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer data
  const fetchCustomers = async () => {
    try {
      const response = await ApiService.get<ICustomer[]>('/customers'); // Replace with your API endpoint
      setCustomers(response);
    } catch (error) {
      message.error('Failed to fetch customers.');
    }
  };

  // Get customer name by ID
  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // Handle date range filtering
  const handleDateRangeChange = (value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(value as [dayjs.Dayjs | null, dayjs.Dayjs | null]);
  };

  // Add vacation handler
  const handleAddVacation = () => {
    setCurrentVacation(null);
    setIsModalVisible(true);
  };

  // Filtered data based on search and date range
  const filteredVacations = vacations.filter((vacation) => {
    const customerName = getCustomerName(vacation.customer_id).toLowerCase();
    const isInSearch = customerName.includes(searchText);
    const isInDateRange =
      (!dateRange[0] || dayjs(vacation.start_date).isAfter(dateRange[0])) &&
      (!dateRange[1] || dayjs(vacation.end_date).isBefore(dateRange[1]));
    return isInSearch && isInDateRange;
  });

  const handleSaveVacation = (vacation: IVacation) => {
    fetchVacations();
  };

  const handleEditVacation = (vacation: IVacation) => {
    setCurrentVacation(vacation);
    setIsModalVisible(true);
  };

  useEffect(() => {
    fetchVacations();
    fetchCustomers();
  }, []);

  const columns: ColumnsType<IVacation> = [
    {
      title: 'Customer Name',
      dataIndex: '',
      key: '',
      render: (record) => (
        <a className='link' onClick={() => handleEditVacation(record)}>{getCustomerName(record.customer_id)}</a>
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
      render: (date: string | null) => (date ? dayjs(date).format('DD-MMM-YYYY') : 'NA'),
    },
    {
      title: 'Creation Date',
      dataIndex: 'creation_date',
      key: 'creation_date',
      render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
    },
  ];

  return (
    <div>
      <h5 className="page-heading">Paused Subscriptions</h5>
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
              text="Add Vacation"
              className="primary-button"
              icon={<PlusOutlined />}
              onClick={handleAddVacation}
            />
          </Col>
        </Row>
      </div>
      <div className="tab-container">
        <Table
          columns={columns}
          dataSource={filteredVacations}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 50 }}
        />
      </div>
      <AddEditVacationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveVacation}
        vacationData={currentVacation || undefined}
      />
    </div>
  );
};

export default Vacations;