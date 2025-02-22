import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Switch, Select, Row, Col } from 'antd';
import { ICustomer } from '../../../models/Customer';
import ApiService from '../../../services/apiService';
import { IDeliveryPartner } from '../../../models/DeliveryPartner';

const { Option } = Select;

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [loading, setLoading] = useState(true);
    const [deliveryPartners, setDeliveryPartners] = useState<IDeliveryPartner[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch customer data and delivery partners
                const [customerData, deliveryPartnersData] = await Promise.all([
                    ApiService.get<ICustomer>(`/customers/${id}`),
                    ApiService.get<IDeliveryPartner[]>('/delivery_boys'),
                ]);

                setCustomer(customerData);
                setDeliveryPartners(deliveryPartnersData);

                // Set form values
                form.setFieldsValue({
                    ...customerData,
                    referal_code: customerData.referal_code || '',
                    credit_limit: customerData.credit_limit || '',
                });
            } catch (error) {
                message.error('Failed to fetch customer data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, form]);

    // Toggle Active Status
    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            await ApiService.patch<any>(`/customers/${id}/toggle_active_status`);
            message.success('Status updated');
            setCustomer((prev) => prev ? { ...prev, is_active: !prev.is_active } : prev);
        } catch (error) {
            message.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    // Handle Form Submission
    const handleUpdate = async (values: Partial<ICustomer>) => {
        setLoading(true);
        try {
            const updatedData = {
                ...values,
                id: customer?.id,
                area_id: customer?.area_id, // Ensure area_id is sent
                subarea_id: customer?.subarea_id, // Ensure subarea_id is sent
            };

            await ApiService.put('/customers', updatedData);
            message.success('Customer updated successfully');
        } catch (error) {
            message.error('Failed to update customer');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spin size="large" />;
    if (!customer) return <p>No customer data available</p>;

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdate}
            style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}
        >
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="ID" name="id">
                        <Input disabled value={`C-${customer.id?.toString().padStart(3, '0')}`} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter the name' }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Mobile" name="mobile">
                        <Input disabled />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Email" name="email">
                        <Input disabled />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="App Version" name="app_version">
                        <Input disabled />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Status" name="is_active" valuePropName="checked">
                        <Switch
                            onChange={handleToggleStatus}
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="State" name="state">
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="City" name="city">
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Pincode" name="pin">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Credit Limit" name="credit_limit">
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Referral Code" name="referal_code">
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Delivery Boy" name="delivery_boy_id">
                        <Select placeholder="Select Delivery Boy">
                            {deliveryPartners.map(partner => (
                                <Option key={partner.id} value={partner.id}>
                                    {partner.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item label="Address" name="address">
                <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item style={{ textAlign: 'center' }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Update
                </Button>
            </Form.Item>
        </Form>
    );
};

export default Profile;