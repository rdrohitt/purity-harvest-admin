import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, message } from 'antd';
import ApiService from '../../../services/apiService';
import { ICustomer } from '../../../models/Customer';
import dayjs from 'dayjs';
import { IVacation } from '../../../models/Vacation';

const { Option } = Select;

interface AddEditVacationProps {
  visible: boolean;
  onClose: () => void;
  onSave: (vacation: IVacation) => void;
  vacationData?: Partial<IVacation>;
}

const AddEditVacationModal: React.FC<AddEditVacationProps> = ({ visible, onClose, onSave, vacationData }) => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const response = await ApiService.get<ICustomer[]>('/customers');
      setCustomers(response);
    } catch (error) {
      message.error('Failed to fetch customers.');
    }
  };

  useEffect(() => {
    fetchCustomers();
    if (vacationData) {
      const parsedStartDate = vacationData.start_date ? dayjs(vacationData.start_date) : null;
      const parsedEndDate = vacationData.end_date ? dayjs(vacationData.end_date) : null;

      form.setFieldsValue({
        customer_id: vacationData.customer_id,
        start_date: parsedStartDate,
        end_date: parsedEndDate,
      });

      setStartDate(parsedStartDate); // Initialize the start date
    } else {
      form.resetFields();
      setStartDate(null); // Reset the start date
    }
  }, [vacationData, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload: IVacation = {
        ...vacationData,
        customer_id: values.customer_id,
        start_date: dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss'),
        end_date: dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss'),
      };

      if (vacationData?.id) {
        await ApiService.put('/vacations', payload);
        message.success('Vacation updated successfully!');
      } else {
        await ApiService.post('/vacations', payload);
        message.success('Vacation added successfully!');
      }

      onSave(payload);
      onClose();
    } catch (error) {
      message.error('Failed to save vacation.');
    }
  };

  const disableEndDate = (current: dayjs.Dayjs) => {
    if (!startDate) return true; // Disable all dates if no start date is selected
    return current.isBefore(startDate, 'day'); // Disable dates before the selected start date
  };

  return (
    <Modal
      title={vacationData?.id ? 'Edit Vacation' : 'Add Vacation'}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      confirmLoading={loading}
      okText={vacationData?.id ? 'Update' : 'Add'}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Customer Name"
          name="customer_id"
          rules={[{ required: true, message: 'Please select a customer!' }]}
        >
          <Select placeholder="Select Customer">
            {customers.map((customer) => (
              <Option key={customer.id} value={customer.id}>
                {customer.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Start Date"
          name="start_date"
          rules={[{ required: true, message: 'Please select a start date!' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            onChange={(date) => {
              setStartDate(date); // Update the start date state
              form.setFieldsValue({ end_date: null }); // Reset end date when start date changes
            }}
          />
        </Form.Item>
        <Form.Item
          label="End Date"
          name="end_date"
          rules={[
            { required: true, message: 'Please select an end date!' },
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabled={!startDate} // Disable the end date picker until start date is selected
            disabledDate={disableEndDate} // Dynamically disable dates before the start date
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditVacationModal;