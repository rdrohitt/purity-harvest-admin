import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col, message } from "antd";
import { ICustomer } from "../../../models/Customer";
import { IProduct } from "../../../models/Product";
import ApiService from "../../../services/apiService";
import dayjs from "dayjs";

const { Option } = Select;

interface SubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialValues?: any; // Pass initial values for editing
  isEdit?: boolean; // True if the modal is for editing
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AddEditSubscription: React.FC<SubscriberModalProps> = ({
  visible,
  onClose,
  onSubmit,
  initialValues,
  isEdit = false,
}) => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [weekQuantities, setWeekQuantities] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  const preprocessWeek = (week: string): string => {
    return week
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/([a-zA-Z0-9_]+):/g, '"$1":'); // Add quotes around keys if missing
  };

  const initializeWeekQuantities = () => {
    if (initialValues?.week) {
      try {
        const sanitizedWeek = preprocessWeek(initialValues.week);
        const parsedWeek = JSON.parse(sanitizedWeek); // Parse sanitized string
  
        // Handle object format (e.g., {"Mon": 3, "Tue": 1}) and convert to array format
        const weekArray = Array.isArray(parsedWeek)
          ? parsedWeek
          : Object.entries(parsedWeek).map(([day, qty]) => ({ [day]: qty }));
  
        const weekQuantities = daysOfWeek.reduce((acc, day) => {
          const dayData = weekArray.find((item: any) => Object.keys(item)[0] === day);
          acc[day] = dayData ? Number(Object.values(dayData)[0]) : 0;
          return acc;
        }, {} as { [key: string]: number });
  
        setWeekQuantities(weekQuantities);
      } catch (error) {
        console.error("Failed to parse week data:", error);
        // Default to all 0 in case of error
        setWeekQuantities(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0 }), {}));
      }
    } else {
      // Default to all 0 if no week data is present
      setWeekQuantities(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0 }), {}));
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        const [customerRes, productRes] = await Promise.all([
          ApiService.get<ICustomer[]>("/customers"),
          ApiService.get<IProduct[]>("/products"),
        ]);
        setCustomers(customerRes);
        setProducts(productRes);
      } catch (error) {
        message.error("Failed to fetch dropdown data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (visible) {
      if (isEdit && initialValues) {
        const formattedValues = {
          ...initialValues,
          start_date: initialValues.start_date ? dayjs(initialValues.start_date) : null,
          end_date: initialValues.end_date ? dayjs(initialValues.end_date) : null,
        };
        form.setFieldsValue(formattedValues);
      } else {
        form.resetFields(); // Reset fields for Add mode
      }
      initializeWeekQuantities(); // Populate week quantities
    }
  }, [visible, isEdit, initialValues, form]);

  const handleFinish = (values: any) => {
    const weekString = JSON.stringify(weekQuantities);
    const isActive = initialValues?.is_active ?? true; // Default to true if is_active is not available
  
    const formattedValues = {
      ...values,
      start_date: values.start_date?  dayjs(values.start_date).format('YYYY-MM-DDTHH:mm:ss') : null,
      end_date: values.end_date ? dayjs(values.end_date).format('YYYY-MM-DDTHH:mm:ss') : null,
      week: weekString,
      is_active: isActive,
    };
  
    onSubmit(formattedValues);
    form.resetFields();
  };


  const handleProductChange = (productId: number) => {
    // Find the selected product
    const selectedProduct = products.find((product) => product.id === productId);
    if (selectedProduct) {
      // Update the form's price field with the product's price
      form.setFieldsValue({ price: selectedProduct.price });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setWeekQuantities(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0 }), {}));
    onClose();
  };

  const handleIncrement = (day: string) => {
    setWeekQuantities((prev) => ({ ...prev, [day]: prev[day] + 1 }));
  };

  const handleDecrement = (day: string) => {
    setWeekQuantities((prev) => ({
      ...prev,
      [day]: prev[day] > 0 ? prev[day] - 1 : 0,
    }));
  };

  return (
    <Modal
      open={visible}
      title={isEdit ? "Edit Subscriber" : "Add Subscriber"}
      onCancel={handleCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {isEdit ? "Save Changes" : "Add Subscriber"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customer_id"
              label="Customer Name"
              rules={[{ required: true, message: "Please select a customer" }]}
            >
              <Select placeholder="Select a customer" loading={loading} disabled={isEdit ? true : false}>
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.mobile || "No Mobile"})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="product_id"
              label="Product"
              rules={[{ required: true, message: "Please select a product" }]}
            >
              <Select placeholder="Select a product" onChange={handleProductChange} loading={loading} disabled={isEdit ? true : false}>
                {products.map((product) => (
                  <Option key={product.id} value={product.id}>
                    {product.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true, message: "Please enter a price" }]}
            >
              <Input type="number" placeholder="Enter price" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[{ required: true, message: "Please select a frequency" }]}
            >
              <Select placeholder="Select frequency">
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="alternate_days">Alternate Days</Option>
                <Option value="custom">Custom</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="start_date"
              label="Start Date"
              rules={[{ required: true, message: "Please select a start date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="end_date" label="End Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Week">
              <Row gutter={[16, 16]}>
                {daysOfWeek.map((day) => (
                  <Col key={day} span={3} style={{ textAlign: "center" }}>
                    <div>{day}</div>
                    <div>
                      <Button
                        onClick={() => handleDecrement(day)}
                        size="small"
                        style={{ margin: "0 5px" }}
                      >
                        -
                      </Button>
                      <span>{weekQuantities[day]}</span>
                      <Button
                        onClick={() => handleIncrement(day)}
                        size="small"
                        style={{ margin: "0 5px" }}
                      >
                        +
                      </Button>
                    </div>
                  </Col>
                ))}
              </Row>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddEditSubscription;