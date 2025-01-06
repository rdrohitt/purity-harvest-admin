import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, Row, Col, Select, Table, Button, Tooltip, DatePicker, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { IOrderItem } from '../../models/Order';
import { IProduct } from '../../models/Product';
import { ColumnsType } from 'antd/es/table';
import ApiService from '../../services/apiService';
import dayjs from 'dayjs';
import { ICoupon } from '../../models/Coupon';

const { Option } = Select;

interface AddOrderModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (orderData: any) => void;
}

const AddOrders: React.FC<AddOrderModalProps> = ({ visible, onClose, onSave }) => {
    const [form] = Form.useForm();
    const [orderItems, setOrderItems] = useState<IOrderItem[]>([]);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [customers, setCustomers] = useState<{ id: number; name: string, delivery_boy_id: number }[]>([]);
    const [deliveryBoys, setDeliveryBoys] = useState<{ id: number; name: string }[]>([]);
    const [coupons, setCoupons] = useState<ICoupon[]>([]);
    const [deliveryCharges, setDeliveryCharges] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);

    useEffect(() => {
        if (visible) {
            const fetchDropdownData = async () => {
                try {
                    const [productResponse, customerResponse, deliveryBoyResponse, couponResponse] = await Promise.all([
                        ApiService.get<IProduct[]>('/products'),
                        ApiService.get<{ id: number; name: string; delivery_boy_id: number }[]>('/customers'),
                        ApiService.get<{ id: number; name: string }[]>('/delivery_boys'),
                        ApiService.get<ICoupon[]>('/coupons'),
                    ]);

                    setProducts(productResponse);
                    setCustomers(customerResponse);
                    setDeliveryBoys(deliveryBoyResponse);
                    setCoupons(couponResponse);
                } catch (error) {
                    message.error('Failed to fetch dropdown data.');
                }
            };
            fetchDropdownData();
        } else {
            // Clear form and modal state when closing
            form.resetFields();
            setOrderItems([]);
            setDeliveryCharges(0);
            setDiscount(0);
        }
    }, [visible]);

    const handleAddItem = () => {
        setOrderItems((prev) => [
            ...prev,
            {
                key: Date.now(), // Add a unique key for the row
                product_id: 0,
                quantity: 1,
                discount: 0,
                packaging: 'packet',
            },
        ]);
    };

    const handleDeleteItem = (index: number) => {
        setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleProductSelect = (productId: number, index: number) => {
        const selectedProduct = products.find((product) => product.id === productId);
        if (selectedProduct) {
            setOrderItems((prev) =>
                prev.map((item, idx) =>
                    idx === index
                        ? { ...item, product_id: productId, name: selectedProduct.name, price: selectedProduct.price }
                        : item
                )
            );
        }
    };

    const calculateSubtotal = () =>
        orderItems.reduce((total, item) => {
            const product = products.find((p) => p.id === item.product_id);
            return total + (product?.price || 0) * item.quantity - (item.discount || 0);
        }, 0);

    const calculateCouponDiscount = () => {
        const couponId = form.getFieldValue('coupon_id'); // Get selected coupon_id from form
        if (!couponId) return 0;

        const coupon = coupons.find((coupon) => coupon.id === couponId);
        if (!coupon) return 0;

        const subtotal = calculateSubtotal();
        const discountAmount = (subtotal * coupon.discount) / 100; // Calculate discount based on percentage
        return Math.min(discountAmount, coupon.max_discount); // Apply max discount limit
    };

    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const couponDiscount = calculateCouponDiscount(); // Calculate the coupon discount
        return subtotal - discount - couponDiscount + deliveryCharges;
    };

    const handleSave = async () => {
        try {
            const modalData = form.getFieldsValue();
            const modalItems = orderItems;

            if (!modalData.customer_id || !modalData.delivery_boy_id || !modalData.creation_date || !modalData.delivery_date) {
                message.error('Customer, Delivery Boy, Order Date, and Delivery Date are mandatory.');
                return;
            }

            const postData = {
                discount: discount || 0,
                delivery_charges: deliveryCharges || 0,
                customer_id: modalData.customer_id,
                coupon_id: modalData.coupon_id || null,
                delivery_boy_id: modalData.delivery_boy_id,
                creation_date: dayjs(modalData.creation_date).format('YYYY-MM-DDTHH:mm:ss'),
                delivery_date: dayjs(modalData.delivery_date).format('YYYY-MM-DDTHH:mm:ss'),
                items: modalItems.map((item) => ({
                    quantity: item.quantity,
                    packaging: item.packaging,
                    discount: item.discount || 0,
                    product_id: item.product_id,
                })),
            };

            await ApiService.post('/orders', postData);
            message.success('Order added successfully!');
            onSave(postData); // Refresh orders in parent component
            onClose(); // Close modal
        } catch (error) {
            message.error('Failed to save order.');
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
                    onChange={(value) => handleProductSelect(value, index)}
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
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity: number, record, index) => (
                <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                        setOrderItems((prev) =>
                            prev.map((item, idx) =>
                                idx === index ? { ...item, quantity: Number(e.target.value) } : item
                            )
                        )
                    }
                />
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
                        setOrderItems((prev) =>
                            prev.map((item, idx) =>
                                idx === index ? { ...item, discount: Number(e.target.value) } : item
                            )
                        )
                    }
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (index) => (
                <Tooltip title="Delete">
                    <DeleteOutlined
                        style={{ color: 'red', cursor: 'pointer' }}
                        onClick={() => handleDeleteItem(index)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <Modal
            title="Add Order"
            open={visible}
            onCancel={onClose}
            onOk={handleSave}
            width={1000}
        >
            <Form layout="vertical" form={form}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item
                            label="Customer Name"
                            name="customer_id"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Select
                                placeholder="Select Customer"
                                onChange={(value) => {
                                    const selectedCustomer = customers.find((customer) => customer.id === value);
                                    if (selectedCustomer) {
                                        form.setFieldsValue({ delivery_boy_id: selectedCustomer.delivery_boy_id });
                                    }
                                }}
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
                        <Form.Item
                            label="Delivery Boy"
                            name="delivery_boy_id"
                            rules={[{ required: true, message: 'Required' }]}
                        >
                            <Select placeholder="Select Delivery Boy">
                                {deliveryBoys.map((boy) => (
                                    <Option key={boy.id} value={boy.id}>
                                        {boy.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Order Date" name="creation_date" rules={[{ required: true, message: 'Required' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Delivery Date" name="delivery_date" rules={[{ required: true, message: 'Required' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item label="Coupon" name="coupon_id">
                            <Select placeholder="Select Coupon">
                                {coupons.map((coupon) => (
                                    <Option key={coupon.id} value={coupon.id}>
                                        {coupon.code}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Delivery Charges">
                            <Input
                                type="number"
                                value={deliveryCharges}
                                onChange={(e) => setDeliveryCharges(Number(e.target.value))}
                                placeholder="Enter Delivery Charges"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Discount">
                            <Input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                placeholder="Enter Discount"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Table
                    columns={itemColumns}
                    dataSource={orderItems}
                    pagination={false}
                    bordered
                    rowKey={(record) => `${record.product_id}-${record.quantity}`}
                    footer={() => (
                        <Button onClick={handleAddItem} type="dashed" icon={<PlusOutlined />}>
                            Add Item
                        </Button>
                    )}
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
                            <p className="green">₹ {discount.toFixed(2)}</p>
                            <p className="green">
                                {form.getFieldValue('coupon_id')
                                    ? `₹${calculateCouponDiscount().toFixed(2)}`
                                    : 'N/A'}
                            </p>
                            <p>₹ {deliveryCharges.toFixed(2)}</p>
                            <div className="dotted-line"></div>
                            <p className="total">₹ {calculateGrandTotal().toFixed(2)}</p>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Modal>
    );
};

export default AddOrders;