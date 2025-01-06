import React, { useState } from 'react';
import { Modal, Form, Input, Select, Row, Col, Button, message } from 'antd';
import { ICustomer } from '../../../models/Customer';
import { IArea } from '../../../models/Area';
import { IDeliveryPartner } from '../../../models/DeliveryPartner';
import { ISubarea } from '../../../models/Subarea';

const { Option } = Select;

interface AddCustomerModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (customerData: Omit<ICustomer, 'id'>) => void;
    areas: IArea[];
    subareas: ISubarea[];
    deliveryPartners: IDeliveryPartner[];
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
    visible,
    onClose,
    onSubmit,
    areas,
    subareas,
    deliveryPartners,
}) => {
    const [form] = Form.useForm();
    const [filteredSubareas, setFilteredSubareas] = useState<ISubarea[]>([]);

    const handleFormSubmit = () => {
        form.validateFields()
            .then((values) => {
                // Set email and app_version to null if not provided
                const customerData = {
                    ...values,
                    email: values.email || null,
                    app_version: values.app_version || null,
                };
                onSubmit(customerData);
                form.resetFields();
                onClose();
            })
            .catch((errorInfo) => {
                console.error("Validation failed:", errorInfo.errorFields);
                message.error("Please fill in all required fields.");
            });
    };

    const handleAreaChange = (value: number) => {
        const filtered = subareas.filter((subarea) => (subarea.area_id).toString() === value.toString());
        setFilteredSubareas(filtered);
        form.setFieldsValue({ subarea_id: null });
    };

    return (
        <Modal
            title="Add New Customer"
            open={visible}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="cancel" onClick={onClose}>Cancel</Button>,
                <Button key="submit" type="primary" onClick={handleFormSubmit}>Submit</Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    state: 'Haryana',
                    city: 'Gurugram',
                }}
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="mobile" label="Mobile" rules={[{ required: true, message: 'Mobile is required' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="email" label="Email">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Address is required' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="state" label="State">
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="city" label="City">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="pin" label="PIN" rules={[{ required: true, message: 'PIN is required' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="area_id" label="Area" rules={[{ required: true, message: 'Area is required' }]}>
                            <Select placeholder="Select Area" onChange={handleAreaChange}>
                                {areas.map((area) => (
                                    <Option key={area.id} value={area.id}>{area.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="subarea_id" label="Subarea" rules={[{ required: true, message: 'Subarea is required' }]}>
                            <Select placeholder="Select Subarea" disabled={!filteredSubareas.length}>
                                {filteredSubareas.map((subarea) => (
                                    <Option key={subarea.id} value={subarea.id}>{subarea.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="delivery_boy_id" label="Delivery Partner" rules={[{ required: true, message: 'Delivery Partner is required' }]}>
                            <Select placeholder="Select Delivery Boy">
                                {deliveryPartners.map((partner) => (
                                    <Option key={partner.id} value={partner.id}>{partner.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="added_from" label="Created From" initialValue="admin_panel" rules={[{ required: true, message: 'Created From is required' }]}>
                            <Select>
                                <Option value="admin_panel">Admin Panel</Option>
                                <Option value="android">Android</Option>
                                <Option value="ios">iOS</Option>
                                <Option value="web">Web</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="app_version" label="App Version">
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddCustomerModal;