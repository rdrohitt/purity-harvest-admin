import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, DatePicker, Row, Col, InputNumber } from 'antd';
import { useParams } from 'react-router-dom';
import { ISubscription } from '../../../../models/Subscription';
import ApiService from '../../../../services/apiService';
import { IProduct } from '../../../../models/Product';

const { Option } = Select;

interface AddSubscriptionModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (subscription: Omit<ISubscription, 'id'>) => void;
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ visible, onClose, onAdd }) => {
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [products, setProducts] = useState<IProduct[]>([]);

    // Fetch products for the Name dropdown
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await ApiService.get<IProduct[]>('/products');
                setProducts(response);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };

        if (visible) {
            fetchProducts();
        }
    }, [visible]);

    const handleFormSubmit = () => {
        form
            .validateFields()
            .then((values) => {
                // Add customerId and product_id to values
                const payload = {
                    ...values,
                    customer_id: Number(id),
                    product_id: values.product_id,
                };
                onAdd(payload);
                form.resetFields();
                onClose();
            })
            .catch((info) => {
                console.error('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title="Add New Subscription"
            open={visible}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleFormSubmit}>
                    Add Subscription
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={8}>
                    <Form.Item name="product_id" label="Product Name" rules={[{ required: true }]}>
                            <Select placeholder="Select Product">
                                {products.map((product) => (
                                    <Option key={product.id} value={product.id}>
                                        {product.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="price" label="Price" rules={[{ required: true, type: 'number', min: 0 }]}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="quantity" label="Quantity" rules={[{ required: true, type: 'number', min: 1 }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="packaging" label="Type" rules={[{ required: true }]}>
                            <Select placeholder="Select Type">
                                <Option value="packet">Packet</Option>
                                <Option value="bottle">Bottle</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
                            <Select placeholder="Select Frequency">
                                <Option value="daily">Daily</Option>
                                <Option value="weekly">Weekly</Option>
                                <Option value="monthly">Monthly</Option>
                                <Option value="alternate_days">Alternate Days</Option>
                                <Option value="custom">Custom</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="start_date" label="Start Date" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="end_date" label="End Date">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="week" label="Week">
                            <Input placeholder="Enter Week" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="discount" label="Discount" rules={[{ type: 'number', min: 0 }]}>
                            <Input type="number" placeholder="Enter Discount" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddSubscriptionModal;