import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, message, Spin, Switch, Select, Row, Col } from 'antd';
import { ICustomer } from '../../../models/Customer';
import ApiService from '../../../services/apiService';
import { IDeliveryPartner } from '../../../models/DeliveryPartner';
import { IArea } from '../../../models/Area';
import { ISubarea } from '../../../models/Subarea';

const { Option } = Select;

const Profile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [loading, setLoading] = useState(true);
    const [areas, setAreas] = useState<IArea[]>([]);
    const [subareas, setSubareas] = useState<ISubarea[]>([]);
    const [filteredSubareas, setFilteredSubareas] = useState<ISubarea[]>([]);
    const [deliveryPartners, setDeliveryPartners] = useState<IDeliveryPartner[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
    
                const [areasData, subareasData, deliveryPartnersData] = await Promise.all([
                    ApiService.get<IArea[]>('/areas'),
                    ApiService.get<ISubarea[]>('/sub_areas'),
                    ApiService.get<IDeliveryPartner[]>('/delivery_boys'),
                ]);
    
                setAreas(areasData);
                setSubareas(subareasData);
                setDeliveryPartners(deliveryPartnersData);
    
                // Now fetch the customer data
                const customerData = await ApiService.get<ICustomer>(`/customers/${id}`);
                setCustomer(customerData);
                form.setFieldsValue(customerData);
    
                // Populate filteredSubareas based on the customer's area_id
                if (customerData.area_id) {
                    const filtered = subareasData.filter(
                        (subarea) => (subarea.area_id).toString() === (customerData.area_id).toString()
                    );
                    setFilteredSubareas(filtered);
                }
            } catch (error) {
                message.error('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [id, form]);

    const handleToggleStatus = async () => {
        setLoading(true);
        try {
            await ApiService.patch<any>(`/customers/${id}/toggle_active_status`);
            message.success('Status updated');
        } catch (error) {
            message.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleAreaChange = (areaId: number) => {
        // Filter subareas based on selected area_id
        const filtered = subareas.filter((subarea) => (subarea.area_id).toString() === areaId.toString());
        setFilteredSubareas(filtered);
        form.setFieldsValue({ subarea_id: null });
    };

    const handleUpdate = async (values: ICustomer) => {
        setLoading(true);
        try {
            const updatedData = { ...values, id: customer?.id };
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
            style={{ padding: '0 20px' }}
        >
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="ID" name="id">
                        <Input disabled value={`C-${customer.id?.toString().padStart(3, '0')}`} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter the name' }]}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Mobile" name="mobile" rules={[{ required: true, message: 'Please enter the mobile number' }]}>
                        <Input disabled />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Enter a valid email' }]}>
                        <Input disabled />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="App Version" name="app_version">
                        <Input disabled />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Status" name="is_active" valuePropName="checked">
                        <Switch
                            onChange={() => handleToggleStatus()}
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="State" name="state">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="City" name="city">
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Pincode" name="pin">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item label="Area" name="area_id" rules={[{ required: true, message: 'Please select an area' }]}>
                        <Select placeholder="Select Area" onChange={handleAreaChange}>
                            {areas.map(area => (
                                <Option key={area.id} value={area.id}>
                                    {area.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Subarea" name="subarea_id" rules={[{ required: true, message: 'Please select a subarea' }]}>
                        <Select placeholder="Select Subarea" disabled={!filteredSubareas.length}>
                            {filteredSubareas.map(subarea => (
                                <Option key={subarea.id} value={subarea.id}>
                                    {subarea.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
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

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Update
                </Button>
            </Form.Item>
        </Form>
    );
};

export default Profile;