import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Avatar, Tabs } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import UpcomingDeliveries from './Deliveries';
import Subscription from './Subscription';
import Transaction from './Transactions';
import Invoice from './Invoice';
import CustomerOrders from './CustomerOrders';
import Profile from './Profile';

const { TabPane } = Tabs;

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('1');
    const [overviewActiveTab, setOverviewActiveTab] = useState('1');

    const customerDetails = {
        id,
        name: id === 'C001' ? 'Rohit Dahiya' : 'Anil Yadav',
        group: id === 'C001' ? '32' : '45',
        address: id === 'C001' ? 'New York, USA' : 'London, UK',
        deliveryBoy: id === 'C001' ? 'Mike' : 'David',
        mobile: id === 'C001' ? '123-456-7890' : '987-654-3210',
    };

    // Handle main tab change
    const handleTabChange = (key: string) => {
        setActiveTab(key);
    };

    // Handle overview tab change
    const handleOverviewTabChange = (key: string) => {
        setOverviewActiveTab(key);
        navigate(`/customer/${id}/${key}`);
    };

    return (
        <div>
            {/* Back Icon */}
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() =>  navigate('/customers/all')}
                size='large'
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
                                    {customerDetails.name}
                                </div>
                                <div className="edit">
                                    {/* <Button color="primary" variant="link">
                                        Edit
                                    </Button> */}
                                </div>
                            </div>

                            {/* Vertical Tabs */}
                            <div className="profile-tabs">
                                <Tabs
                                    tabPosition="left"
                                    defaultActiveKey="1"
                                    onChange={handleTabChange}
                                >
                                    <TabPane tab="Overview" key="1" />
                                    <TabPane tab="Invoices" key="2" />
                                    <TabPane tab="Transactions" key="3" />
                                    <TabPane tab="Orders" key="4" />
                                    <TabPane tab="Notification Logs" key="5" />
                                </Tabs>
                            </div>

                            <div className="portlet light bordered">
                                <div className="row list-separated profile-stat">
                                    <div className="col-md-12 col-sm-12 col-xs-12">
                                        <div className="uppercase profile-stat-title"> 7,350 /- </div>
                                        <div className="uppercase profile-stat-text">Total DUE </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content Area */}
                    <div className="col-md-10">
                        <div className="profile-content">
                            {activeTab === '1' && (
                                <div>
                                    <Tabs defaultActiveKey="profile" type='card' onChange={handleOverviewTabChange}>
                                        <TabPane tab="Profile" key="profile">
                                           <Profile />
                                        </TabPane>
                                        <TabPane tab="Subscriptions" key="subscription">
                                            <div><Subscription /></div>
                                        </TabPane>
                                        <TabPane tab="Deliveries" key="deliveries">
                                            <div><UpcomingDeliveries /></div>
                                        </TabPane>
                                        <TabPane tab="Wallet" key="wallet">
                                            <div>Details content goes here...</div>
                                        </TabPane>
                                        <TabPane tab="Container Details" key="container-details">
                                            <div>Details content goes here...</div>
                                        </TabPane>
                                        <TabPane tab="Vacations" key="vacations">
                                            <div>Vacations content goes here...</div>
                                        </TabPane>
                                        <TabPane tab="Tickets" key="tickets">
                                            <div>Details content goes here...</div>
                                        </TabPane>
                                    </Tabs>
                                </div>
                            )}
                            {activeTab === '2' && <div><Invoice /></div>}
                            {activeTab === '3' && <div><Transaction /></div>}
                            {activeTab === '4' && <div><CustomerOrders /></div>}
                            {activeTab === '6' && <div>Notification Logs content goes here...</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;