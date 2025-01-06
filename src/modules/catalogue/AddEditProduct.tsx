import React, { useEffect, useState } from 'react';
import { Modal, Input, Form, InputNumber, Switch, Button, Upload, Row, Col, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { IProduct } from '../../models/Product';
import { ICategory } from '../../models/Category';
import { BASE_URL } from '../../services/apiService';

const { Option } = Select;

interface AddEditProductProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (productData: FormData) => void;
  product?: IProduct;
  categories: ICategory[];
}

const AddEditProduct: React.FC<AddEditProductProps> = ({ visible, onClose, onSubmit, product, categories }) => {
  const [form] = Form.useForm();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(product?.thumbnail || null);
  const [frontImagePreview, setFrontImagePreview] = useState<string | null>(product?.front_image || null);
  const [backImagePreview, setBackImagePreview] = useState<string | null>(product?.back_image || null);


  useEffect(() => {
    if (product) {
      form.setFieldsValue(product);
      setThumbnailPreview(product.thumbnail || null);
      setFrontImagePreview(product.front_image || null);
      setBackImagePreview(product.back_image || null);
    } else {
      form.resetFields();
      setThumbnailFile(null);
      setFrontImageFile(null);
      setThumbnailPreview(null);
      setFrontImagePreview(null);
      setBackImagePreview(null);
    }
  }, [product, form]);

  const handleFinish = (values: IProduct) => {
    const formData = new FormData();

    const productData = {
      id: product?.id || undefined,
      name: values.name,
      size: values.size,
      description: values.description,
      mrp: values.mrp,
      price: values.price,
      discount: values.discount,
      category_id: values.category_id,
      is_visible: values.is_visible,
    };

    formData.append('product', JSON.stringify(productData));

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile, thumbnailFile.name);
    }

    if (frontImageFile) {
      formData.append('front_image', frontImageFile, frontImageFile.name);
    }

    if (backImageFile) {
      formData.append('back_image', backImageFile, backImageFile.name);
    }

    onSubmit(formData);
    onClose();
  };

  const handleFileChange = (
    file: any,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG, JPEG, or PNG files!');
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file.originFileObj || file);

    setFile(file.originFileObj || file);

    return false;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      title={product ? 'Edit Product' : 'Add Product'}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => form.submit()}>
          {product ? 'Update' : 'Add'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Three input fields in a row */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter the product name' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="size"
              label="Size"
              rules={[{ required: true, message: 'Please enter the size' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: 'Please select a category' }]}
            >
              <Select placeholder="Select Category">
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Description in a single row */}
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter the product description' }]}
        >
          <Input.TextArea rows={4} placeholder="Enter product description" />
        </Form.Item>

        {/* Prices and discount in a row */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="mrp"
              label="Actual Price"
              rules={[{ required: true, message: 'Please enter the actual price' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="price"
              label="Discounted Price"
              rules={[{ required: true, message: 'Please enter the discounted price' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="discount"
              label="Discount (%)"
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Thumbnail">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) => handleFileChange(file, setThumbnailFile, setThumbnailPreview)}
                onRemove={() => setThumbnailPreview(null)}
              >
                {thumbnailPreview ? (
                  <img
                    src={product ? `${BASE_URL}/${thumbnailPreview}` : thumbnailPreview}
                    alt="Thumbnail"
                    style={{
                      width: '100%',
                      maxWidth: '100px',
                      maxHeight: '100px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Front Image">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) => handleFileChange(file, setFrontImageFile, setFrontImagePreview)}
                onRemove={() => setFrontImagePreview(null)}
              >
                {frontImagePreview ? (
                  <img
                    src={product ? `${BASE_URL}/${frontImagePreview}` : frontImagePreview}
                    alt="Front Image"
                    style={{
                      width: '100%',
                      maxWidth: '100px',
                      maxHeight: '100px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Back Image">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) => handleFileChange(file, setBackImageFile, setBackImagePreview)}
                onRemove={() => setBackImagePreview(null)}
              >
                {backImagePreview ? (
                  <img
                    src={product ? `${BASE_URL}/${backImagePreview}` : backImagePreview}
                    alt="Back Image"
                    style={{
                      width: '100%',
                      maxWidth: '100px',
                      maxHeight: '100px',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        {/* Visibility toggle */}
        <Form.Item name="is_visible" label="Visible" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditProduct;