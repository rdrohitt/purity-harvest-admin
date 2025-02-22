import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Button, Row, Col, message, Switch } from "antd";
import { ICustomer } from "../../../models/Customer";
import { IProduct, IVariant } from "../../../models/Product";
import ApiService from "../../../services/apiService";
import dayjs from "dayjs";

const { Option } = Select;

interface SubscriberModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialValues?: any;
  isEdit?: boolean;
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
  const [variants, setVariants] = useState<IVariant[]>([]);
  const [weekQuantities, setWeekQuantities] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

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

        if (initialValues.product_id) {
          handleProductChange(initialValues.product_id, initialValues.variant_id);
        }
      } else {
        form.resetFields();
      }
      initializeWeekQuantities();
    }
  }, [visible, isEdit, initialValues, form]);

  const initializeWeekQuantities = () => {
    if (initialValues?.week) {
      try {
        const parsedWeek = JSON.parse(initialValues.week);
        setWeekQuantities(parsedWeek);
      } catch (error) {
        setWeekQuantities(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0 }), {}));
      }
    } else {
      setWeekQuantities(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0 }), {}));
    }
  };

  const handleProductChange = (productId: number, variantId?: number) => {
    const selectedProduct = products.find((product) => product.id === productId);
    if (selectedProduct) {
      setVariants(selectedProduct.variants || []);
      form.setFieldsValue({ variant_id: variantId ?? undefined });
    }
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

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      start_date: values.start_date ? dayjs(values.start_date).format("YYYY-MM-DDTHH:mm:ss") : null,
      end_date: values.end_date ? dayjs(values.end_date).format("YYYY-MM-DDTHH:mm:ss") : null,
      week: JSON.stringify(weekQuantities),
      is_active: values?.is_active ?? true,
    };
    onSubmit(formattedValues);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    setWeekQuantities(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: 0 }), {}));
    onClose();
  };

  return (
    <Modal
      open={visible}
      title={isEdit ? "Edit Subscription" : "Add Subscription"}
      onCancel={handleCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {isEdit ? "Save Changes" : "Add Subscription"}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customer_id"
              label="Customer Name"
              rules={[{ required: true, message: "Please select a customer" }]}
            >
              <Select placeholder="Select a customer" loading={loading} disabled={isEdit}>
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
              label="Product Name"
              rules={[{ required: true, message: "Please select a product" }]}
            >
              <Select
                placeholder="Select a product"
                onChange={(value) => handleProductChange(value)}
                loading={loading}
                disabled={isEdit}
              >
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
              name="variant_id"
              label="Variant Name"
              rules={[{ required: true, message: "Please select a variant" }]}
            >
              <Select placeholder="Select a variant" loading={loading} disabled={isEdit}>
                {variants.map((variant) => (
                  <Option key={variant.id} value={variant.id}>
                    {variant.name}
                  </Option>
                ))}
              </Select>
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
        <Col span={8}>
            <Form.Item
              name="type"
              label="Payment Type"
              rules={[{ required: true, message: "Please select a type" }]}
            >
              <Select placeholder="Select type">
                <Option value="prepaid">Prepaid</Option>
                <Option value="postpaid">Postpaid</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="price" label="Price">
              <Input type="number" placeholder="Enter price" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="is_active" label="Status" valuePropName="checked">
              <Switch
                checkedChildren="Active"
                unCheckedChildren="Inactive"
                onChange={(checked) => form.setFieldsValue({ is_active: checked })}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Week">
              <div className="week-container">
                {daysOfWeek.map((day) => (
                  <div key={day} className="week-day-box">
                    <div className="day-label">{day}</div>
                    <div className="quantity-controls">
                      <Button
                        onClick={() => handleDecrement(day)}
                        size="small"
                        className="quantity-btn"
                      >
                        -
                      </Button>
                      <span className="quantity-value">{weekQuantities[day]}</span>
                      <Button
                        onClick={() => handleIncrement(day)}
                        size="small"
                        className="quantity-btn"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddEditSubscription;