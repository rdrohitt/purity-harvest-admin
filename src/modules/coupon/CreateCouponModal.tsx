import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, message } from 'antd';
import ApiService from '../../services/apiService';
import dayjs from 'dayjs';

interface CreateCouponModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to refresh data after successful creation or edit
  mode: 'add' | 'edit'; // Mode: 'add' or 'edit'
  initialValues?: any; // Pre-fill form for editing
}

const CreateCouponModal: React.FC<CreateCouponModalProps> = ({
  visible,
  onClose,
  onSuccess,
  mode,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      // Pre-fill the form with initialValues for editing
      form.setFieldsValue({
        ...initialValues,
        expiry_date: initialValues.expiry_date ? dayjs(initialValues.expiry_date) : null,
      });
    } else {
      form.resetFields();
    }
  }, [mode, initialValues, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        expiry_date: values.expiry_date.toISOString(),
      };

      if (mode === 'add') {
        await ApiService.post('/coupons', payload);
        message.success('Coupon added successfully!');
      } else if (mode === 'edit') {
        const editpayload = {
          ...values,
          expiry_date: values.expiry_date.toISOString(),
          id: initialValues.id
        };
        await ApiService.put('/coupons', editpayload);
        message.success('Coupon updated successfully!');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      message.error(`Failed to ${mode === 'add' ? 'add' : 'edit'} coupon.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={mode === 'add' ? 'Create Coupon' : 'Edit Coupon'}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="code"
          label="Coupon Code"
          rules={[{ required: true, message: 'Please enter the coupon code' }]}
        >
          <Input
            placeholder="Enter coupon code"
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              form.setFieldsValue({ code: value });
            }}
          />
        </Form.Item>
        <Form.Item
          name="min_order_value"
          label="Minimum Order Value"
          rules={[{ required: true, message: 'Please enter the minimum order value' }]}
        >
          <InputNumber placeholder="Enter minimum order value" style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item
          name="discount"
          label="Discount (%)"
          rules={[{ required: true, message: 'Please enter the discount percentage' }]}
        >
          <InputNumber placeholder="Enter discount percentage" style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item
          name="max_discount"
          label="Maximum Discount"
          rules={[{ required: true, message: 'Please enter the maximum discount' }]}
        >
          <InputNumber placeholder="Enter maximum discount" style={{ width: '100%' }} min={0} />
        </Form.Item>
        <Form.Item
          name="expiry_date"
          label="Expiry Date"
          rules={[{ required: true, message: 'Please select the expiry date' }]}
        >
          <DatePicker placeholder="Select expiry date" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateCouponModal;