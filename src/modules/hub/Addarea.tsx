// AddArea.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { IArea } from '../../models/Area';
import ApiService from '../../services/apiService';

interface AddAreaProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    area?: IArea;
}

const AddArea: React.FC<AddAreaProps> = ({ visible, onClose, onSubmit, area }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (area) {
            form.setFieldsValue(area);
        } else {
            form.resetFields();
        }
    }, [area, form]);

    const handleFinish = async (values: IArea) => {
        try {
            if (area && area.id) {
                // Update existing area with id in the payload
                const payload = { ...values, id: area.id };
                await ApiService.put('/areas', payload);
                message.success('Area updated successfully');
            } else {
                // Add new area
                await ApiService.post('/areas', values);
                message.success('Area added successfully');
            }
            onSubmit(); // Trigger data refresh in parent component
            onClose(); // Close modal
        } catch (error) {
            message.error('Failed to save area');
            console.error('Failed to save area:', error);
        }
    };

    return (
        <Modal
            title={area ? 'Edit Area' : 'Add Area'}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    {area ? 'Update' : 'Add'}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label="Area Name"
                    rules={[{ required: true, message: 'Please enter the area name' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="state"
                    label="State"
                    rules={[{ required: true, message: 'Please enter the state' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: 'Please enter the city' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="pin"
                    label="PIN Code"
                    rules={[{ required: true, message: 'Please enter the PIN code' }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddArea;