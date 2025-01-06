// AddSubArea.tsx
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { ISubarea } from '../../models/Subarea';
import { IArea } from '../../models/Area';
import ApiService from '../../services/apiService';

interface AddSubAreaProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    areas: IArea[];
    subarea?: ISubarea;
}

const AddSubArea: React.FC<AddSubAreaProps> = ({ visible, onClose, onSubmit, areas, subarea }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (subarea) {
            form.setFieldsValue(subarea);
        } else {
            form.resetFields();
        }
    }, [subarea, form]);

    const handleFinish = async (values: ISubarea) => {
        try {
            if (subarea && subarea.id) {
                // Update existing subarea with id in payload
                const payload = { ...values, id: subarea.id };
                await ApiService.put('/sub_areas', payload);
                message.success('Subarea updated successfully');
            } else {
                // Add new subarea
                await ApiService.post('/sub_areas', values);
                message.success('Subarea added successfully');
            }
            onSubmit(); // Trigger refresh in parent component
            onClose(); // Close modal
        } catch (error) {
            message.error('Failed to save subarea');
            console.error('Failed to save subarea:', error);
        }
    };

    return (
        <Modal
            title={subarea ? 'Edit Subarea' : 'Add Subarea'}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    {subarea ? 'Update' : 'Add'}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="name"
                    label="Subarea Name"
                    rules={[{ required: true, message: 'Please enter the subarea name' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="area_id"
                    label="Area"
                    rules={[{ required: true, message: 'Please select an area' }]}
                >
                    <Select placeholder="Select Area">
                        {areas.map((area) => (
                            <Select.Option key={area.id} value={area.id}>
                                {area.name}
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddSubArea;