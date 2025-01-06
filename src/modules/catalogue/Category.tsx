import React, { useEffect, useState } from 'react';
import { Table, Switch, Button, Modal, Form, Input, Upload, Row, Col, Popconfirm, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import ApiService, { BASE_URL } from '../../services/apiService';
import { ICategory } from '../../models/Category';
import CustomButton from '../../components/elements/CustomButton';
import { TrashFill } from 'react-bootstrap-icons';

const Category: React.FC = () => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [form] = Form.useForm();

    const handleDelete = async (id: number) => {
        try {
            setLoading(true);
            await ApiService.delete(`/categories/${id}`);
            setCategories(categories.filter(cat => cat.id !== id));
        } catch (error) {
            console.error('Failed to delete category:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get<ICategory[]>('/categories');
            setCategories(response);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleFinish = async (values: ICategory) => {
        const formData = new FormData();

        const payload = {
            name: values.name,
            is_visible: values.is_visible,
            ...(editingCategory?.id && { id: editingCategory.id })
        };
        formData.append('category', JSON.stringify(payload));

        if (imageFile) {
            formData.append('image', imageFile, imageFile.name);
        }

        try {
            if (editingCategory && editingCategory.id) {
                await ApiService.put('/categories', formData);
                setCategories(categories.map(cat =>
                    cat.id === editingCategory.id
                        ? { ...cat, ...values, image: imagePreview || editingCategory.image }
                        : cat
                ));
            } else {
                const newCategory = await ApiService.post<ICategory>('/categories', formData);
                setCategories([...categories, newCategory]);
            }

            setIsModalVisible(false);
            form.resetFields();
            setImageFile(null);
            setImagePreview(null);
            fetchCategories();
        } catch (error) {
            console.error('Failed to save category:', error);
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

    const openModal = (category: ICategory | null = null) => {
        setEditingCategory(category);
        setIsModalVisible(true);

        if (category) {
            form.setFieldsValue({
                ...category,
                is_visible: category.is_visible,
            });
            setImagePreview(category.image ? `${BASE_URL}/${category.image}` : null);
            setImageFile(null);
        } else {
            form.setFieldsValue({
                name: '',
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
            render: (text: string, record: ICategory) => (
                <a className='link' onClick={() => openModal(record)}>{text}</a>
            ),
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
            render: (record: ICategory) => (
                <>
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id || 0)}>
                        <TrashFill className='trash-icon' />
                    </Popconfirm>
                </>
            ),
        }
    ];

    return (
        <>
            <h5 className='page-heading'>Product Categories</h5>
            <div className="filter-container">
                <Row gutter={16}>
                    <Col span={12}></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <div className='buttons-container'>
                            <CustomButton
                                text="Add Category"
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
                    dataSource={categories}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <Modal
                title={editingCategory ? 'Edit Category' : 'Add Category'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => form.submit()}>
                        {editingCategory ? 'Update' : 'Add'}
                    </Button>,
                ]}
            >
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the category name' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Image" name="image">
                        <Upload
                            listType="picture-card"
                            showUploadList={false}
                            beforeUpload={(file) => handleFileChange(file, setImageFile, setImagePreview)}
                            onRemove={() => setImagePreview(null)}
                        >
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Category Preview"
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

                    <Form.Item name="is_visible" label="Visible" valuePropName="checked" initialValue={false}>
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default Category;