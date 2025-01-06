import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, message, Row, Col } from 'antd';
import { IOffers } from '../../models/Offers';
import { ICategory } from '../../models/Category';
import ApiService from '../../services/apiService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    offer: IOffers | null;
    categories: ICategory[];
    onRefresh: () => void;
}

const AddEditOfferModal: React.FC<Props> = ({ isOpen, onClose, offer, categories, onRefresh }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (isOpen) {
            if (offer) {
                // If editing an offer, populate the form with offer data
                form.setFieldsValue(offer);
            } else {
                // If adding a new offer, reset the form fields
                form.resetFields();
            }
        }
    }, [isOpen, offer]);

    const handleSubmit = async (values: IOffers) => {
        try {
            if (offer) {
                // Update Offer - Pass offer.id in the payload, not in the URL
                await ApiService.put('/offers', { ...values, id: offer.id });
                message.success('Offer updated successfully');
            } else {
                // Add Offer
                await ApiService.post('/offers', values);
                message.success('Offer added successfully');
            }
            onClose();
            onRefresh();
        } catch (error) {
            message.error('Failed to save offer');
        }
    };

    return (
        <Modal
            title={offer ? 'Edit Offer' : 'Add Offer'}
            open={isOpen}
            onCancel={onClose}
            onOk={() => form.submit()}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Row 1: Name and Buy */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            label="Name" 
                            name="name" 
                            rules={[{ required: true, message: 'Please enter a name' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            label="Buy" 
                            name="buy" 
                            rules={[{ required: true, message: 'Please enter buy amount' }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Row 2: Get and Category */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item 
                            label="Get" 
                            name="get" 
                            rules={[{ required: true, message: 'Please enter get amount' }]}
                        >
                            <Input type="number" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item 
                            label="Category" 
                            name="category_id" 
                            rules={[{ required: true, message: 'Please select a category' }]}
                        >
                            <Select placeholder="Select a category">
                                {categories.map((category) => (
                                    <Select.Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Last Row: Is Active */}
                <Row>
                    <Col span={24}>
                        <Form.Item 
                            label="Is Active" 
                            name="is_active" 
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddEditOfferModal;