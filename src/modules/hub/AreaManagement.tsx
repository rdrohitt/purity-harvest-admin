import React, { useEffect, useState } from 'react';
import { Table, Col, Row, message } from 'antd';
import ApiService from '../../services/apiService';
import { IArea } from '../../models/Area';
import { ISubarea } from '../../models/Subarea';
import CustomButton from '../../components/elements/CustomButton';
import { PlusOutlined } from '@ant-design/icons';
import AddSubArea from './AddSubArea';
import AddArea from './Addarea';

const AreaManagement: React.FC = () => {
    const [areas, setAreas] = useState<IArea[]>([]);
    const [subareas, setSubareas] = useState<ISubarea[]>([]);
    const [loadingAreas, setLoadingAreas] = useState<boolean>(true);
    const [loadingSubareas, setLoadingSubareas] = useState<boolean>(true);
    const [isAreaModalVisible, setIsAreaModalVisible] = useState<boolean>(false);
    const [isSubareaModalVisible, setIsSubareaModalVisible] = useState<boolean>(false);
    const [editingArea, setEditingArea] = useState<IArea | null>(null);
    const [editingSubarea, setEditingSubarea] = useState<ISubarea | null>(null);

    const handleAddArea = () => {
        setEditingArea(null);
        setIsAreaModalVisible(true);
    };

    const handleEditArea = (area: IArea) => {
        setEditingArea(area);
        setIsAreaModalVisible(true);
    };

    const handleAreaModalClose = () => {
        setIsAreaModalVisible(false);
    };

    const handleAreaModalSubmit = () => {
        fetchAreas(); // Refresh areas data
    };

    const handleAddSubarea = () => {
        setEditingSubarea(null);
        setIsSubareaModalVisible(true);
    };

    const handleEditSubarea = (subarea: ISubarea) => {
        setEditingSubarea(subarea);
        setIsSubareaModalVisible(true);
    };

    const handleSubareaModalClose = () => {
        setIsSubareaModalVisible(false);
    };

    const handleSubareaModalSubmit = () => {
        fetchSubareas(); // Refresh subareas data
    };

    // Fetch areas data
    const fetchAreas = async () => {
        setLoadingAreas(true);
        try {
            const response = await ApiService.get<IArea[]>('/areas'); // Replace '/areas' with your actual endpoint
            setAreas(response);
        } catch (error) {
            message.error('Failed to fetch areas');
            console.error('Failed to fetch areas:', error);
        } finally {
            setLoadingAreas(false);
        }
    };

    // Fetch subareas data
    const fetchSubareas = async () => {
        setLoadingSubareas(true);
        try {
            const response = await ApiService.get<ISubarea[]>('/sub_areas'); // Replace '/subareas' with your actual endpoint
            setSubareas(response);
        } catch (error) {
            message.error('Failed to fetch subareas');
            console.error('Failed to fetch subareas:', error);
        } finally {
            setLoadingSubareas(false);
        }
    };

    useEffect(() => {
        fetchAreas();
        fetchSubareas();
    }, []);

    // Create a mapping of area_id to area name for easy lookup
    const areaNameMap: Record<number, string> = areas.reduce((acc, area) => {
        if (area.id !== undefined) {  // Ensure area.id is defined
            acc[area.id] = area.name;
        }
        return acc;
    }, {} as Record<number, string>);

    // Define columns for the Area table
    const areaColumns = [
        {
            title: 'Area',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: IArea) => (
                <a className='link' onClick={() => handleEditArea(record)}>{text}</a>
            ),
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
        },
        {
            title: 'PIN',
            dataIndex: 'pin',
            key: 'pin',
        }
    ];

    // Define columns for the Subarea table
    const subareaColumns = [
        {
            title: 'Subarea',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: ISubarea) => (
                <a className='link' onClick={() => handleEditSubarea(record)}>{text}</a>
            ),
        },
        {
            title: 'Area',
            dataIndex: 'area_id',
            key: 'area_id',
            render: (area_id: number) => areaNameMap[area_id] || 'Unknown',
        }
    ];

    return (
        <Row gutter={16}>
            <Col span={12}>
                <h5 className='page-heading'>Areas</h5>
                <div className="filter-container">
                    <Row gutter={16}>
                        <Col span={12}></Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <div className='buttons-container'>
                                <CustomButton
                                    text="Add Area"
                                    className='primary-button'
                                    icon={<PlusOutlined />}
                                    onClick={handleAddArea}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className='tab-container'>
                    <Table
                        bordered
                        dataSource={areas}
                        columns={areaColumns}
                        loading={loadingAreas}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </Col>

            <Col span={12}>
                <h5 className='page-heading'>Sub-areas</h5>
                <div className="filter-container">
                    <Row gutter={16}>
                        <Col span={12}></Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                            <div className='buttons-container'>
                                <CustomButton
                                    text="Add Subarea"
                                    className='primary-button'
                                    icon={<PlusOutlined />}
                                    onClick={handleAddSubarea}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className='tab-container'>
                    <Table
                        bordered
                        dataSource={subareas}
                        columns={subareaColumns}
                        loading={loadingSubareas}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </Col>

         
            <AddArea
                visible={isAreaModalVisible}
                onClose={handleAreaModalClose}
                onSubmit={handleAreaModalSubmit}
                area={editingArea || undefined}
            />

            <AddSubArea
                visible={isSubareaModalVisible}
                onClose={handleSubareaModalClose}
                onSubmit={handleSubareaModalSubmit}
                areas={areas}
                subarea={editingSubarea || undefined}
            />
        </Row>
    );
};

export default AreaManagement;