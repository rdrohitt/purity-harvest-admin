import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message, Row, Col } from 'antd';
import { IComplain } from '../../models/Complain';
import ApiService from '../../services/apiService';
import dayjs from 'dayjs';

const { Option } = Select;

interface ICustomer {
  id: number;
  name: string;
}

interface AddEditComplaintProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  complaintData?: IComplain | null;
}

const AddEditComplaint: React.FC<AddEditComplaintProps> = ({ visible, onClose, onSave, complaintData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<ICustomer[]>([]);

  useEffect(() => {
    // Fetch customers
    const fetchCustomers = async () => {
      try {
        const response = await ApiService.get<ICustomer[]>('/customers'); // Replace with your customer API endpoint
        setCustomers(response);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    if (complaintData) {
      form.setFieldsValue({
        ...complaintData,
        customer_id: complaintData.customer_id, // Set customer_id for the dropdown
        complain_date: complaintData.complain_date ? dayjs(complaintData.complain_date) : null,
        resolution_date: complaintData.resolution_date ? dayjs(complaintData.resolution_date) : null,
      });
    } else {
      form.resetFields();
    }
  }, [complaintData, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = complaintData ? { ...values, id: complaintData.id } : values;

      if (complaintData) {
        // Update complaint
        await ApiService.put('/complains', payload);
        message.success('Complaint updated successfully!');
      } else {
        // Add new complaint
        await ApiService.post('/complains', payload);
        message.success('Complaint added successfully!');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving complaint:', error);
      message.error('Failed to save complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title={complaintData ? 'Edit Complaint' : 'Add Complaint'}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: 'open',
        }}
      >
        {/* First Row - Customer Name Dropdown */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Customer Name"
              name="customer_id"
              rules={[{ required: true, message: 'Please select a customer' }]}
            >
              <Select placeholder="Select Customer" showSearch optionFilterProp="children">
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Complaint Date"
              name="complain_date"
              rules={[{ required: true, message: 'Please select a complaint date' }]}
            >
              <DatePicker format="DD-MMM-YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: 'Please enter a category' }]}
            >
              <Input placeholder="Enter Category" />
            </Form.Item>
          </Col>
        </Row>

        {/* Second Row */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Sub-Category"
              name="sub_category"
              rules={[{ required: true, message: 'Please enter a sub-category' }]}
            >
              <Input placeholder="Enter Sub-Category" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select a status' }]}
            >
              <Select placeholder="Select Status">
                <Option value="open">Open</Option>
                <Option value="resolved">Resolved</Option>
                <Option value="in_process">In Progress</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Resolution Date" name="resolution_date">
              <DatePicker format="DD-MMM-YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {/* Last Row */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Comments" name="comments">
              <Input.TextArea placeholder="Enter Comments" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Remarks" name="remarks">
              <Input.TextArea placeholder="Enter Remarks" />
            </Form.Item>
          </Col>
        </Row>

        {/* Footer Buttons */}
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {complaintData ? 'Update' : 'Add'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddEditComplaint;