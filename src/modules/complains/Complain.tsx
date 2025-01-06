import React, { useEffect, useState } from 'react';
import { Col, message, Row, Table, Tag } from 'antd';
import ApiService from '../../services/apiService';
import dayjs from 'dayjs';
import { IComplain } from '../../models/Complain';
import CustomButton from '../../components/elements/CustomButton';
import { PlusOutlined } from '@ant-design/icons';
import CustomInput from '../../components/elements/CustomInput';
import AddEditComplaint from './AddEditComplain';
import { Popconfirm, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface ICustomer {
    id: number;
    name: string;
}

const Complain: React.FC = () => {
    const [data, setData] = useState<IComplain[]>([]);
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingComplaint, setEditingComplaint] = useState<IComplain | null>(null);

    const handleAddComplaint = () => {
        setEditingComplaint(null);
        setIsModalVisible(true);
    };

    const handleEditComplaint = (complaint: IComplain) => {
        setEditingComplaint(complaint); // Set the complaint to be edited
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleDeleteComplaint = async (complaintId: number) => {
        try {
            await ApiService.delete(`/complains/${complaintId}`); // Call API to delete the complaint
            message.success('Complaint deleted successfully!');
            fetchData(); // Refresh the data after successful deletion
        } catch (error) {
            console.error('Error deleting complaint:', error);
            message.error('Failed to delete the complaint. Please try again.');
        }
    };

    const fetchData = async () => {
        try {
            const [complaintsResponse, customersResponse] = await Promise.all([
                ApiService.get<IComplain[]>('/complains'),
                ApiService.get<ICustomer[]>('/customers'),
            ]);

            setData(complaintsResponse);
            setCustomers(customersResponse);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data and customer list
    useEffect(() => {
        fetchData();
    }, []);

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        // Optionally, implement search filtering here
    };

    // Map customer ID to customer name
    const getCustomerName = (customerId: number): string => {
        const customer = customers.find((cust) => cust.id === customerId);
        return customer ? customer.name : 'Unknown';
    };

    // Define table columns
    const columns = [
        {
            title: 'Customer Name',
            dataIndex: 'customer_id',
            key: 'customer_id',
            render: (customerId: number, record: IComplain) => (
                <a
                    className="link"
                    onClick={() => handleEditComplaint(record)} // Trigger modal on click
                >
                    {getCustomerName(customerId)}
                </a>
            ),
        },
        {
            title: 'Complaint Date',
            dataIndex: 'complain_date',
            key: 'complain_date',
            render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Sub-Category',
            dataIndex: 'sub_category',
            key: 'sub_category',
        },
        {
            title: 'Comments',
            dataIndex: 'comments',
            key: 'comments',
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const color = status === 'resolved' ? 'green' : 'orange';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Resolution Date',
            dataIndex: 'resolution_date',
            key: 'resolution_date',
            render: (date: string | null) => (date ? dayjs(date).format('DD-MMM-YYYY') : 'NA'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: IComplain) => (
                <Popconfirm
                    title="Are you sure to delete this complaint?"
                    onConfirm={() => handleDeleteComplaint(record.id || 0)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="link" icon={<DeleteOutlined  style={{color: 'red'}}/>} />
                </Popconfirm>
            ),
        },
    ];

    return (
        <>
            <h5 className="page-heading">Complaints List</h5>
            <div className="filter-container">
                <Row gutter={16}>
                    <Col span={12}>
                        <CustomInput
                            placeholder="Search by name"
                            value={searchText}
                            onChange={handleSearch}
                        />
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <div className="buttons-container">
                            <CustomButton
                                text="Add Complaint"
                                className="primary-button"
                                icon={<PlusOutlined />}
                                onClick={handleAddComplaint}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
            <div className="tab-container">
                <Table
                    dataSource={data}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 50 }}
                    scroll={{x: 1500}}
                />
            </div>
            <AddEditComplaint
                visible={isModalVisible}
                onClose={handleModalClose}
                onSave={() => fetchData()} // Refresh data after saving
                complaintData={editingComplaint}
            />
        </>
    );
};

export default Complain;