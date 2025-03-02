import React, { useState, useEffect } from 'react';
import { Table, Row, Col, Select, message, Switch, Input, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { CustomInput, CustomDateRangePicker, CustomButton } from '../../components/elements';
import { ICustomer } from '../../models/Customer';
import ApiService from '../../services/apiService';
import { IDeliveryPartner } from '../../models/DeliveryPartner';
import { IWallet } from '../../models/Wallet';

const { Option } = Select;

const LowWallet: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<ICustomer[]>([]);
    const [filteredData, setFilteredData] = useState<ICustomer[]>([]);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
    const [deliveryPartners, setDeliveryPartners] = useState<IDeliveryPartner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [minBalance, setMinBalance] = useState<number>(500);
    const [wallets, setWallets] = useState<IWallet[]>([]);

    // Fetch Delivery Partners
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

    // Fetch customer data from the API
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get<ICustomer[]>(`/customers?filter=has_low_balance&min_balance=${minBalance}`);
            setData(response);
            setFilteredData(response);
        } catch (error) {
            message.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    // Fetch wallet data from the API
    const fetchWallets = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get<IWallet[]>('/wallets');
            setWallets(response);
        } catch (error) {
            message.error('Failed to fetch wallets');
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

    // Get customer name by ID
    const getCustomerName = (customerId: number) => {
        const customer = data.find((c) => c.id === customerId);
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

    useEffect(() => {
        fetchDeliveryPartners();
        fetchCustomers();
        fetchWallets();
    }, [minBalance]);

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
            title: 'Customer Name',
            dataIndex: 'id',
            key: 'customer_name',
            width: 300,
            render: (id) => getCustomerName(id),
        },
        {
            title: 'Wallet Details',
            dataIndex: 'id',
            key: 'wallet_details',
            width: 250,
            render: (id: number) => {
                const wallet = wallets.find(w => w.customer_id === id);
                return wallet ? (
                    <div>
                        <div>Balance: {wallet.balance}</div>
                        <div>Autopay: {wallet.autopay ? 'Yes' : 'No'}</div>
                        <div>Autopay Amount: {wallet.autopay_amount}</div>
                    </div>
                ) : 'N/A';
            },
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
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
            <h5 className='page-heading'>Low Wallet</h5>
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
                    <Col span={6}>
                        <Input
                            placeholder="Min Balance"
                            value={minBalance}
                            onChange={(e) => setMinBalance(Number(e.target.value))}
                        />
                    </Col>
                    <Col span={6}>
                        <CustomButton
                            text="Fetch Customers"
                            className="primary-button"
                            onClick={fetchCustomers}
                        />
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
                    scroll={{ x: 1500 }}
                />
            </div>
        </div>
    );
};

export default LowWallet;