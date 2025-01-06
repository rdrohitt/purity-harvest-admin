import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Row, Col, Select, Table, Button, Tooltip, DatePicker, message, Popconfirm } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { IOrder, IOrderItem } from '../../models/Order';
import { IProduct } from '../../models/Product';
import { ColumnsType } from 'antd/es/table';
import ApiService from '../../services/apiService';
import dayjs from 'dayjs';
import './Orders.scss';
import { ICoupon } from '../../models/Coupon';

const { Option } = Select;

interface OrderModalProps {
  visible: boolean;
  orderData: Partial<IOrder>;
  onClose: () => void;
  onSave: (data: IOrder) => void;
  selectedOrderId: number;
}

const EditOrders: React.FC<OrderModalProps> = ({ visible, orderData, onClose, onSave, selectedOrderId }) => {
  const [form] = Form.useForm();
  const [modalData, setModalData] = useState<Partial<IOrder>>({});
  const [modalItems, setModalItems] = useState<IOrderItem[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [customers, setCustomers] = useState<{ id: number; name: string }[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<{ id: number; name: string }[]>([]);
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalData({ ...orderData });

      ApiService.get<IProduct[]>('/products').then((productData) => {
        setProducts(productData);

        const items = orderData.items
          ? orderData.items.map((item) => {
            // Match item product_id with product data to set the price
            const product = productData.find((product) => product.id === item.product_id);
            return {
              ...item,
              price: product?.price || 0, // Use product price or default to 0
              quantity: item.quantity || 1,
              discount: item.discount || 0,
            };
          })
          : [];
        setModalItems(items);
      });
    }
  }, [orderData, visible]);

  useEffect(() => {
    // Fetch data for dropdowns only when modal is visible
    const fetchDropdownData = async () => {
      try {
        const [customerResponse, deliveryBoyResponse, productResponse, couponResponse] = await Promise.all([
          ApiService.get<{ id: number; name: string }[]>('/customers'),
          ApiService.get<{ id: number; name: string }[]>('/delivery_boys'),
          ApiService.get<IProduct[]>('/products'),
          ApiService.get<ICoupon[]>('/coupons'),
        ]);

        setCustomers(customerResponse);
        setDeliveryBoys(deliveryBoyResponse);
        setProducts(productResponse);
        setCoupons(couponResponse);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };

    if (visible) fetchDropdownData();
  }, [visible]);

  const calculateSubtotal = () => {
    return modalItems.reduce((total, item) => {
      const product = products.find((product) => product.id === item.product_id);
      const price = product?.price || 0; // Fetch price from products data
      const itemTotal = price * item.quantity - (item.discount || 0);
      return total + itemTotal;
    }, 0);
  };

  const calculateCouponDiscount = () => {
    if (!modalData.coupon_id) return 0;

    const coupon = coupons.find((coupon) => coupon.id === modalData.coupon_id);
    if (!coupon) return 0;

    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * coupon.discount) / 100;
    return Math.min(discountAmount, coupon.max_discount);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = modalData.discount || 0;
    const deliveryCharges = modalData.delivery_charges || 0;
    const couponDiscount = calculateCouponDiscount(); // Fetch coupon discount
    return subtotal - discount - couponDiscount + deliveryCharges;
  };

  const formatDataForAPI = (): Partial<IOrder> => {
    return {
      id: orderData.id,
      status: modalData.status,
      discount: modalData.discount || 0,
      delivery_charges: modalData.delivery_charges || 0,
      customer_id: modalData.customer_id || 0,
      coupon_id: modalData.coupon_id || null,
      delivery_boy_id: modalData.delivery_boy_id || null,
      creation_date: dayjs(modalData.creation_date).format('YYYY-MM-DDTHH:mm:ss'),
      delivery_date: dayjs(modalData.delivery_date).format('YYYY-MM-DDTHH:mm:ss'),
      items: modalItems.map((item) => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        packaging: item.packaging,
        discount: item.discount || 0,
      })),
    };
  };

  const handleSave = async () => {
    const formattedData = formatDataForAPI();

    try {
      setLoading(true);
      await ApiService.put('/orders', formattedData);
      message.success('Order updated successfully!');

      onSave(formattedData as IOrder); // Notify parent component
      onClose(); // Close the modal
    } catch (error) {
      console.error('Failed to save order:', error);
      message.error('Failed to save order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: number, index: number) => {
    try {
      await ApiService.delete(`/orders/${id}/item`);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
    setModalItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleProductSelect = (productId: number, index: number) => {
    const selectedProduct = products.find((product) => product.id === productId);

    if (selectedProduct) {
      setModalItems((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? {
              ...item,
              product_id: productId,
              name: selectedProduct.name,
              price: selectedProduct.price,
            }
            : item
        )
      );
    }
  };

  const itemColumns: ColumnsType<IOrderItem> = [
    {
      title: 'Product Name',
      dataIndex: 'product_id',
      key: 'product_id',
      render: (_, record, index) => (
        <Select
          value={record.product_id || undefined}
          onChange={(value: number) => handleProductSelect(value, index)}
          style={{ width: '100%' }}
          placeholder="Select Product"
        >
          {products.map((product) => (
            <Option key={product.id} value={product.id}>
              {product.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => {
        const product = products.find((product) => product.id === record.product_id);
        return `₹${(product?.price || price || 0).toFixed(2)}`;
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record, index) => (
        <Input
          type="number"
          value={quantity}
          onChange={(e) =>
            setModalItems((prev) =>
              prev.map((item, idx) =>
                idx === index ? { ...item, quantity: Number(e.target.value) } : item
              )
            )
          }
        />
      ),
    },
    {
      title: 'Packaging',
      dataIndex: 'packaging',
      key: 'packaging',
      render: (packaging: 'packet' | 'bottle', record, index) => (
        <Select
          disabled
          value={packaging}
          onChange={(value) =>
            setModalItems((prev) =>
              prev.map((item, idx) =>
                idx === index ? { ...item, packaging: value } : item
              )
            )
          }
          style={{ width: '100%' }}
        >
          <Option value="packet">Packet</Option>
          <Option value="bottle">Bottle</Option>
        </Select>
      ),
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: number, record, index) => (
        <Input
          type="number"
          value={discount}
          onChange={(e) =>
            setModalItems((prev) =>
              prev.map((item, idx) =>
                idx === index ? { ...item, discount: Number(e.target.value) } : item
              )
            )
          }
        />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      render: (record) => {
        const product = products.find((product) => product.id === record.product_id);
        const price = product?.price || 0;
        const quantity = record.quantity || 0; // Default to 0 if quantity is undefined
        const discount = record.discount || 0; // Default to 0 if discount is undefined

        const total = price * quantity - discount;

        return `₹${total.toFixed(2)}`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record, __, index) => (
        <Popconfirm
          title="Are you sure you want to delete this item?"
          onConfirm={() => handleDeleteItem(record.id, index)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={orderData.id ? `Edit Order - ${orderData.id}` : 'Add Order'}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save Order"
      confirmLoading={loading} // Add loading state
      width={1000}
    >
      <Form layout="vertical" form={form}>

        <Row gutter={16}>
          {/* Row with 4 fields */}
          <Col span={6}>
            <Form.Item label="Customer Name">
              <Select
                disabled
                value={modalData.customer_id}
                onChange={(value) => setModalData((prevData) => ({ ...prevData, customer_id: value }))}
                placeholder="Select Customer"
              >
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Delivery Boy">
              <Select
                value={modalData.delivery_boy_id}
                onChange={(value) => setModalData((prevData) => ({ ...prevData, delivery_boy_id: value }))}
                placeholder="Select Delivery Boy"
              >
                {deliveryBoys.map((boy) => (
                  <Option key={boy.id} value={boy.id}>
                    {boy.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Order Date">
              <DatePicker
                style={{ width: '100%' }}
                value={modalData.creation_date ? dayjs(modalData.creation_date) : null}
                onChange={(date) => setModalData((prevData) => ({ ...prevData, creation_date: date?.toISOString() }))}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Delivery Date">
              <DatePicker
                style={{ width: '100%' }}
                value={modalData.delivery_date ? dayjs(modalData.delivery_date) : null}
                onChange={(date) => setModalData((prevData) => ({ ...prevData, delivery_date: date?.toISOString() }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Row with 3 fields */}
          <Col span={8}>
            <Form.Item label="Coupon">
              <Select
                value={modalData.coupon_id}
                onChange={(value) => setModalData((prevData) => ({ ...prevData, coupon_id: value }))}
                placeholder="Select Coupon"
              >
                {coupons.map((coupon) => (
                  <Option key={coupon.id} value={coupon.id}>
                    {coupon.code}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Delivery Charges">
              <Input
                type="number"
                value={modalData.delivery_charges}
                onChange={(e) =>
                  setModalData((prevData) => ({
                    ...prevData,
                    delivery_charges: Number(e.target.value),
                  }))
                }
                placeholder="Enter Delivery Charges"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Discount">
              <Input
                type="number"
                value={modalData.discount}
                onChange={(e) =>
                  setModalData((prevData) => ({
                    ...prevData,
                    discount: Number(e.target.value),
                  }))
                }
                placeholder="Enter Discount"
              />
            </Form.Item>
          </Col>
        </Row>

        <Table
          columns={itemColumns}
          dataSource={modalItems}
          pagination={false}
          bordered
          rowKey={(record) => record.product_id}
        />
        <div className="bill-summary">
          <h3 className="bill-summary-heading">Bill Summary</h3>
          <Row gutter={16} className="bill-summary-details">
            <Col span={12}>
              <p>Subtotal:</p>
              <p>Discount:</p>
              <p>Coupon Applied:</p>
              <p>Delivery Charges:</p>
              <div className="dotted-line"></div>
              <p className="total">Total:</p>
            </Col>
            <Col span={12} className="bill-summary-amounts">
              <p>₹{calculateSubtotal().toFixed(2)}</p>
              <p className="green">₹{modalData.discount || 0}</p>
              <p className="green">
                {modalData.coupon_id
                  ? `₹${calculateCouponDiscount().toFixed(2)}`
                  : 'N/A'}
              </p>
              <p>₹{modalData.delivery_charges || 0}</p>
              <div className="dotted-line"></div>
              <p className="total">₹{calculateGrandTotal().toFixed(2)}</p>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default EditOrders;