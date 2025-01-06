import React, { useEffect, useState } from 'react';
import { Col, Row, Table, message } from 'antd';
import ApiService from '../../services/apiService';
import { IDeliveryPartner } from '../../models/DeliveryPartner';
import { IArea } from '../../models/Area';
import { ISubarea } from '../../models/Subarea';
import { PlusOutlined } from '@ant-design/icons';
import CustomInput from '../../components/elements/CustomInput';
import CustomButton from '../../components/elements/CustomButton';
import AddEditDeliveryPartner from './AddEditDeliveryPartner';

const DeliveryPartner: React.FC = () => {
    const [deliveryPartners, setDeliveryPartners] = useState<IDeliveryPartner[]>([]);
    const [areas, setAreas] = useState<IArea[]>([]);
    const [subareas, setSubareas] = useState<ISubarea[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingPartner, setEditingPartner] = useState<IDeliveryPartner | null>(null);

    // Fetch data from the API
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

    const fetchAreas = async () => {
        try {
            const response = await ApiService.get<IArea[]>('/areas');
            setAreas(response);
        } catch (error) {
            message.error('Failed to fetch areas');
            console.error('Failed to fetch areas:', error);
        }
    };

    const fetchSubareas = async () => {
        try {
            const response = await ApiService.get<ISubarea[]>('/sub_areas');
            setSubareas(response);
        } catch (error) {
            message.error('Failed to fetch subareas');
            console.error('Failed to fetch subareas:', error);
        }
    };

    useEffect(() => {
        fetchDeliveryPartners();
        fetchAreas();
        fetchSubareas();
    }, []);

    // Create area and subarea mappings for easy lookup
    const areaNameMap = areas.reduce((acc, area) => {
        if (area.id) acc[area.id] = area.name;
        return acc;
    }, {} as Record<number, string>);

    const subareaNameMap = subareas.reduce((acc, subarea) => {
        if (subarea.id) acc[subarea.id] = subarea.name;
        return acc;
    }, {} as Record<number, string>);

    // Search function
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const filteredDeliveryPartners = deliveryPartners.filter(partner =>
        partner.name.toLowerCase().includes(searchText.toLowerCase())
    );

    // Handle add/edit actions
    const handleAddPartner = () => {
        setEditingPartner(null); // Clear any editing partner data
        setIsModalVisible(true);
    };

    const handleEditPartner = (partner: IDeliveryPartner) => {
        setEditingPartner(partner); // Set the partner to be edited
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        fetchDeliveryPartners(); // Refresh data after add/edit
    };

    // Define columns for the table
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: IDeliveryPartner) => (
                <a className='click' onClick={() => handleEditPartner(record)}>{text}</a>
            ),
        },
        {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',
        },
        {
            title: 'ID Type',
            dataIndex: 'id_type',
            key: 'id_type',
            render: (text: string) => (text === 'aadhar' ? 'Aadhar' : 'Driving License'),
        },
        {
            title: 'Area',
            dataIndex: 'area_id',
            key: 'area_id',
            render: (areaId: number) => areaNameMap[areaId] || 'Unknown',
        },
        {
            title: 'Subarea',
            dataIndex: 'subarea_id',
            key: 'subarea_id',
            render: (subareaId: number) => subareaNameMap[subareaId] || 'Unknown',
        },
    ];

    return (
        <>
            <h5 className='page-heading'>Delivery Partners</h5>
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
                        <div className='buttons-container'>
                            <CustomButton
                                text="Add Partner"
                                className='primary-button'
                                icon={<PlusOutlined />}
                                onClick={handleAddPartner}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
            <div className='tab-container'>
                <Table
                    bordered
                    dataSource={filteredDeliveryPartners}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </div>

            {/* Add/Edit Modal */}
            <AddEditDeliveryPartner
                visible={isModalVisible}
                onClose={handleModalClose}
                partner={editingPartner}
            />
        </>
    );
};

export default DeliveryPartner;