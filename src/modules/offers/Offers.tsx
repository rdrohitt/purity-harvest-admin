import React, { useEffect, useState } from 'react';
import { Col, Row, Table, message } from 'antd';
import ApiService from '../../services/apiService';
import { PlusOutlined } from '@ant-design/icons';
import CustomButton from '../../components/elements/CustomButton';
import { IOffers } from '../../models/Offers';
import { ICategory } from '../../models/Category';
import AddEditOfferModal from './AddEditOfferModal';

const Offers: React.FC = () => {
    const [offers, setOffers] = useState<IOffers[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editOffer, setEditOffer] = useState<IOffers | null>(null);

    // Fetch Offers from API
    const fetchOffers = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get<IOffers[]>('/offers');
            setOffers(response);
        } catch (error) {
            message.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Categories from API
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get<ICategory[]>('/categories');
            setCategories(response);
        } catch (error) {
            message.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    // Get category name by id
    const getCategoryName = (categoryId: number) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : 'N/A';
    };

    useEffect(() => {
        fetchOffers();
        fetchCategories();
    }, []);

    // Open Add/Edit Offer Modal
    const handleOpenModal = (offer?: IOffers) => {
        setEditOffer(offer || null);
        setIsModalOpen(true);
    };

    // Close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditOffer(null);
    };

    // Refresh offers after Add/Edit
    const handleRefreshOffers = () => {
        fetchOffers();
    };

    // Define columns for Ant Design Table
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: IOffers) => (
                <a className='link' onClick={() => handleOpenModal(record)}>
                    {name}
                </a>
            ),
        },
        {
            title: 'Is Active',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active: boolean) => (is_active ? 'Yes' : 'No'),
        },
        {
            title: 'Buy',
            dataIndex: 'buy',
            key: 'buy',
        },
        {
            title: 'Get',
            dataIndex: 'get',
            key: 'get',
        },
        {
            title: 'Category Name',
            dataIndex: 'category_id',
            key: 'category_id',
            render: (category_id: number) => getCategoryName(category_id),
        },
        {
            title: 'Creation Date',
            dataIndex: 'creation_date',
            key: 'creation_date',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <div>
            <h5 className="page-heading">Offers</h5>
            <div className="filter-container">
                <Row gutter={16}>
                    <Col span={12}></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <CustomButton
                            text="Add Offer"
                            className="primary-button"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenModal()}
                        />
                    </Col>
                </Row>
            </div>
            <div className="tab-container">
                <Table
                    dataSource={offers}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <AddEditOfferModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                offer={editOffer}
                categories={categories}
                onRefresh={handleRefreshOffers}
            />
        </div>
    );
};

export default Offers;