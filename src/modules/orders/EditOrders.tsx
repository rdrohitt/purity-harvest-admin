import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Row, Col, Select, Table, Button, Tooltip, DatePicker, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { IOrder, IOrderItem } from '../../models/Order';
import { IProduct, IVariant } from '../../models/Product';
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
            const product = productData.find((product) => product.id === item.product_id);
            const variant = product?.variants.find((v) => v.id === item.variant_id);
            return {
              ...item,
              price: variant?.price || 0,
            };
          })
          : [];
        setModalItems(items);
      });
    }
  }, [orderData, visible]);

  useEffect(() => {
    if (visible) {
      const fetchDropdownData = async () => {
        try {
          const [customerResponse, deliveryBoyResponse, couponResponse] = await Promise.all([
            ApiService.get<{ id: number; name: string }[]>('/customers'),
            ApiService.get<{ id: number; name: string }[]>('/delivery_boys'),
            ApiService.get<ICoupon[]>('/coupons'),
          ]);

          setCustomers(customerResponse);
          setDeliveryBoys(deliveryBoyResponse);
          setCoupons(couponResponse);
        } catch (error) {
          message.error('Failed to fetch dropdown data.');
        }
      };

      fetchDropdownData();
    }
  }, [visible]);

  const calculateSubtotal = () => {
    return modalItems.reduce((total, item) => {
      const product = products.find((product) => product.id === item.product_id);
      const variant = product?.variants.find((v) => v.id === item.variant_id);
      return total + (variant?.price || 0) * item.quantity - (item.discount || 0);
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
    const couponDiscount = calculateCouponDiscount();
    return subtotal - discount - couponDiscount + deliveryCharges;
  };

  const formatDataForAPI = (): Partial<IOrder> => ({
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
      variant_id: item.variant_id,
      quantity: item.quantity,
      packaging: item.packaging,
      discount: item.discount || 0,
    })),
  });

  const handleSave = async () => {
    const formattedData = formatDataForAPI();

    try {
      setLoading(true);
      await ApiService.put('/orders', formattedData);
      message.success('Order updated successfully!');
      onSave(formattedData as IOrder);
      onClose();
    } catch (error) {
      console.error('Failed to save order:', error);
      message.error('Failed to save order.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = (index: number) => {
    setModalItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleProductSelect = (productId: number, variantId: number, index: number) => {
    const selectedProduct = products.find((product) => product.id === productId);
    const selectedVariant = selectedProduct?.variants.find((variant) => variant.id === variantId);

    if (selectedProduct && selectedVariant) {
      setModalItems((prev) =>
        prev.map((item, idx) =>
          idx === index
            ? {
              ...item,
              product_id: productId,
              variant_id: variantId,
              price: selectedVariant.price || 0,
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
          style={{ width: '100%' }}
          placeholder="Select Product"
          value={`${record.product_id}-${record.variant_id}`}
          onChange={(value) => {
            const [productId, variantId] = value.split('-').map(Number);
            handleProductSelect(productId, variantId, index);
          }}
        >
          {products.map((product) =>
            product.variants.map((variant) => (
              <Option key={`${product.id}-${variant.id}`} value={`${product.id}-${variant.id}`}>
                {`${product.name} - ${variant.size}`}
              </Option>
            ))
          )}
        </Select>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (_, record) => {
        const product = products.find((product) => product.id === record.product_id);
        const variant = product?.variants.find((v) => v.id === record.variant_id);
        return `₹${variant?.price?.toFixed(2) || '0.00'}`;
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity, record, index) => (
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
      title: 'Total',
      key: 'total',
      render: (_, record) => {
        const product = products.find((product) => product.id === record.product_id);
        const variant = product?.variants.find((v) => v.id === record.variant_id);
        return `₹${((variant?.price || 0) * record.quantity).toFixed(2)}`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record, index) => (
        <Popconfirm title="Are you sure to delete this item?" onConfirm={() => handleDeleteItem(index)}>
          <Tooltip title="Delete">
            <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={`Edit Order - ${selectedOrderId}`}
      open={visible}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save"
      confirmLoading={loading}
      width={1000}
    >
      <Form layout="vertical" form={form}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Customer">
              <Select
                value={modalData.customer_id}
                onChange={(value) => setModalData((prev) => ({ ...prev, customer_id: value }))}
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
                onChange={(value) => setModalData((prev) => ({ ...prev, delivery_boy_id: value }))}
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
                value={modalData.creation_date ? dayjs(modalData.creation_date) : null}
                onChange={(date) => setModalData((prev) => ({ ...prev, creation_date: date?.toISOString() }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Delivery Date">
              <DatePicker
                value={modalData.delivery_date ? dayjs(modalData.delivery_date) : null}
                onChange={(date) => setModalData((prev) => ({ ...prev, delivery_date: date?.toISOString() }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Table
          columns={itemColumns}
          dataSource={modalItems}
          rowKey={(record) => `${record.product_id}-${record.variant_id}-${record.quantity}`}
          pagination={false}
          bordered
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
              <p>₹ {calculateSubtotal().toFixed(2)}</p>
              <p className="green">₹ {(modalData.discount ?? 0).toFixed(2)}</p>
              <p className="green">
                ₹{calculateCouponDiscount().toFixed(2)}
              </p>
              <p>₹ {(modalData.delivery_charges ?? 0).toFixed(2)}</p>
              <div className="dotted-line"></div>
              <p className="total">₹ {calculateGrandTotal().toFixed(2)}</p>
            </Col>
          </Row>
        </div>
        {/* 
        <div className="bill-summary">
          <h3>Bill Summary</h3>
          <Row gutter={16}>
            <Col span={12}>
              <p>Subtotal:</p>
              <p>Discount:</p>
              <p>Coupon Applied:</p>
              <p>Delivery Charges:</p>
              <p>Total:</p>
            </Col>
            <Col span={12}>
              <p>₹{calculateSubtotal().toFixed(2)}</p>
              <p>₹{modalData.discount || 0}</p>
              <p>₹{calculateCouponDiscount().toFixed(2)}</p>
              <p>₹{modalData.delivery_charges || 0}</p>
              <p>₹{calculateGrandTotal().toFixed(2)}</p>
            </Col>
          </Row>
        </div> */}
      </Form>
    </Modal>
  );
};

export default EditOrders;