import React, { useEffect, useState } from 'react';
import { Table, Switch, Button, Modal, Form, Input, Upload, Row, Col, Popconfirm, message, InputNumber } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import ApiService, { BASE_URL } from '../../services/apiService';
import CustomButton from '../../components/elements/CustomButton';
import { TrashFill } from 'react-bootstrap-icons';
import { IBanner } from '../../models/Banner';

const Banners: React.FC = () => {
    const [bannersData, setBannersData] = useState<IBanner[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingBanner, setEditingBanner] = useState<IBanner | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [form] = Form.useForm();

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await ApiService.delete(`/banners/${id}`);
            setBannersData(bannersData.filter(cat => cat.id !== id));
        } catch (error) {
            console.error('Failed to delete banner:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get<IBanner[]>('/banners');
            setBannersData(response);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleFinish = async (values: IBanner) => {
        const formData = new FormData();

        const payload = {
            name: values.name,
            position: values.position,
            is_visible: values.is_visible,
            ...(editingBanner?.id && { id: editingBanner.id })
        };
        formData.append('banner', JSON.stringify(payload));

        if (imageFile) {
            formData.append('image', imageFile, imageFile.name);
        }

        try {
            if (editingBanner && editingBanner.id) {
                await ApiService.put('/banners', formData);
                setBannersData(bannersData.map(cat =>
                    cat.id === editingBanner.id
                        ? { ...cat, ...values, image: imagePreview || editingBanner.image }
                        : cat
                ));
            } else {
                const newCategory = await ApiService.post<IBanner>('/banners', formData);
                setBannersData([...bannersData, newCategory]);
            }

            setIsModalVisible(false);
            form.resetFields();
            setImageFile(null);
            setImagePreview(null);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save banner:', error);
        }
    };

    const handleFileChange = (
        file: any,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG, JPEG, or PNG files!');
            return Upload.LIST_IGNORE;
        }

        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file.originFileObj || file);

        setFile(file.originFileObj || file);
        return false;
    };

    const openModal = (banner: IBanner | null = null) => {
        setEditingBanner(banner);
        setIsModalVisible(true);

        if (banner) {
            form.setFieldsValue({
                ...banner,
                is_visible: banner.is_visible,
            });
            setImagePreview(banner.image ? `${BASE_URL}/${banner.image}` : null);
            setImageFile(null);
        } else {
            form.setFieldsValue({
                name: '',
                position: 0,
                is_visible: false,
            });
            setImagePreview(null);
            setImageFile(null);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: IBanner) => (
                <a className='link' onClick={() => openModal(record)}>{text}</a>
            ),
        },
        {
            title: 'Position',
            dataIndex: 'position',
            key: 'position',
        },
        {
            title: 'Visible',
            dataIndex: 'is_visible',
            key: 'is_visible',
            render: (isVisible: boolean) => (
                <Switch checked={isVisible} />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 50,
            render: (record: IBanner) => (
                <>
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id || 0)}>
                        <TrashFill className='trash-icon' />
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <>
            <h5 className='page-heading'>Banners</h5>
            <div className="filter-container">
                <Row gutter={16}>
                    <Col span={12}></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <div className='buttons-container'>
                            <CustomButton
                                text="Add Banner"
                                className='primary-button'
                                icon={<PlusOutlined />}
                                onClick={() => openModal(null)}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
            <div className='tab-container'>
                <Table
                    bordered
                    dataSource={bannersData}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <Modal
                title={editingBanner ? 'Edit Banner' : 'Add Banner'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => form.submit()}>
                        {editingBanner ? 'Update' : 'Add'}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the banner name' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="position" label="Position" rules={[{ required: true, message: 'Please enter the position' }]}>
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item label="Banner Image" name="image">
                        <Upload
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={(file) => handleFileChange(file, setImageFile, setImagePreview)}
                            onRemove={() => setImagePreview(null)}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Banner Preview"
                                    style={{
                                        width: '100%',
                                        maxWidth: '100px',
                                        maxHeight: '100px',
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : (
                                <UploadOutlined />
                            )}
                        </Upload>
                    </Form.Item>

                    {editingBanner && (
                        <Form.Item name="is_visible" label="Visible" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </>
    );
};

export default Banners;