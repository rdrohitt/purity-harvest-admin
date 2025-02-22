import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Avatar, Tabs, Spin, message } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import ApiService from '../../../services/apiService';
import UpcomingDeliveries from './Deliveries';
import Subscription from './Subscription';
import Transaction from './Transactions';
import Invoice from './Invoice';
import CustomerOrders from './CustomerOrders';
import Profile from './Profile';
import { ICustomer } from '../../../models/Customer';
import { IWallet } from '../../../models/Wallet';

const { TabPane } = Tabs;

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('1');
    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [wallet, setWallet] = useState<IWallet | null>(null);
    const [loading, setLoading] = useState(true);
    const [walletLoading, setWalletLoading] = useState(true);

    // Fetch customer data
    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                setLoading(true);
                const data = await ApiService.get<ICustomer>(`/customers/${id}`);
                setCustomer(data);
            } catch (error) {
                message.error('Failed to fetch customer details');
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [id]);

    // Fetch wallet balance
    useEffect(() => {
        const fetchWallet = async () => {
            if (!id) return;
            try {
                setWalletLoading(true);
                const data = await ApiService.get<IWallet>(`/customers/${id}/wallet`);
                setWallet(data);
            } catch (error) {
                message.error('Failed to fetch wallet details');
            } finally {
                setWalletLoading(false);
            }
        };

        fetchWallet();
    }, [id]);

    // Handle main tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div>
            {/* Back Button */}
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/customers/all')}
                size="large"
                style={{ marginBottom: '16px' }}
            />

            <div className="container">
                <div className="row profile">
                    <div className="col-md-2">
                        <div className="profile-sidebar">
                            <div className="profile-userpic">
                                <Avatar style={{ backgroundColor: '#9c7709' }} icon={<UserOutlined />} />
                            </div>
                            <div className="profile-usertitle">
                                <div className="profile-usertitle-name">
                                    {/* Show fetched customer name */}
                                    {customer ? customer.name : 'Customer Name'}
                                </div>
                            </div>

                            {/* Vertical Tabs */}
                            <div className="profile-tabs">
                                <Tabs tabPosition="left" defaultActiveKey="1" onChange={handleTabChange}>
                                    <TabPane tab="Overview" key="1" />
                                    <TabPane tab="Invoices" key="2" />
                                    <TabPane tab="Transactions" key="3" />
                                    <TabPane tab="Orders" key="4" />
                                </Tabs>
                            </div>
                        </div>

                        {/* Wallet Balance */}
                        <div className="portlet light bordered">
                            <div className="row list-separated profile-stat">
                                <div className="col-md-12 col-sm-12 col-xs-12">
                                    <div
                                        className="uppercase profile-stat-title"
                                        style={{
                                            color: wallet && wallet.balance >= 0 ? 'green' : 'red',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {walletLoading ? (
                                            <Spin size="small" />
                                        ) : (
                                            `${wallet?.balance?.toLocaleString()} /-`
                                        )}
                                    </div>
                                    <div className="uppercase profile-stat-text">Wallet Balance</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content Area */}
                    <div className="col-md-10">
                        <div className="profile-content">
                            {activeTab === '1' && (
                                <Tabs defaultActiveKey="profile" type="card">
                                    <TabPane tab="Profile" key="profile">
                                        <Profile />
                                    </TabPane>
                                    <TabPane tab="Subscriptions" key="subscription">
                                        <Subscription />
                                    </TabPane>
                                    <TabPane tab="Deliveries" key="deliveries">
                                        <UpcomingDeliveries />
                                    </TabPane>
                                    <TabPane tab="Wallet" key="wallet">
                                        Wallet content goes here...
                                    </TabPane>
                                    <TabPane tab="Container Details" key="container-details">
                                        Container details go here...
                                    </TabPane>
                                    <TabPane tab="Vacations" key="vacations">
                                        Vacations content goes here...
                                    </TabPane>
                                    <TabPane tab="Tickets" key="tickets">
                                        Tickets content goes here...
                                    </TabPane>
                                </Tabs>
                            )}
                            {activeTab === '2' && <Invoice />}
                            {activeTab === '3' && <Transaction />}
                            {activeTab === '4' && <CustomerOrders />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;