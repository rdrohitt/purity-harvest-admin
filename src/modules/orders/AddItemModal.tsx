import React, { useState } from 'react';
import { Modal, Input, Form, Select, message } from 'antd';
import { IProduct } from '../../models/Product';
import ApiService from '../../services/apiService';

const { Option } = Select;

interface AddItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (item: any) => void; // Callback to pass the saved item back to the parent
    products: IProduct[];
    orderId: number;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ visible, onClose, onSave, products, orderId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleProductChange = (productId: number) => {
        const selectedProduct = products.find((product) => product.id === productId);
        if (selectedProduct) {
            // Auto-select the first variant's price
            const price = selectedProduct.variants?.[0]?.price || 0;
            form.setFieldsValue({ price });
        }
    };

    const handleSave = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();

            // Exclude the price field from the API payload
            const { price, ...payload } = values;

            setLoading(true);

            // Make API call to save the item
            await ApiService.post(`/orders/${orderId}/item`, payload);

            message.success('Item added successfully!');
            onSave({ ...payload, price }); // Pass the saved item back to the parent
            onClose(); // Close the modal
        } catch (error) {
            console.error('Failed to add item:', error);
            message.error('Failed to add item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Add Item"
            open={visible}
            onCancel={onClose}
            onOk={handleSave}
            okText="Save"
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Product Name"
                    name="product_id"
                    rules={[{ required: true, message: 'Please select a product' }]}
                >
                    <Select
                        placeholder="Select Product"
                        onChange={handleProductChange}
                    >
                        {products.map((product) => (
                            <Option key={product.id} value={product.id}>
                                {product.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Price"
                    name="price"
                    rules={[{ required: true, message: 'Please enter the price' }]}
                >
                    <Input type="number" disabled placeholder="Price will auto-populate" />
                </Form.Item>
                <Form.Item
                    label="Quantity"
                    name="quantity"
                    rules={[{ required: true, message: 'Please enter the quantity' }]}
                >
                    <Input type="number" placeholder="Enter Quantity" />
                </Form.Item>
                <Form.Item
                    label="Packaging"
                    name="packaging"
                    rules={[{ required: true, message: 'Please select packaging' }]}
                >
                    <Select placeholder="Select Packaging">
                        <Option value="packet">Packet</Option>
                        <Option value="bottle">Bottle</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Discount" name="discount">
                    <Input type="number" placeholder="Enter Discount" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddItemModal;