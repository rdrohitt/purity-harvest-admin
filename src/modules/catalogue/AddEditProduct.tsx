import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, Upload, Row, Col, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { IProduct } from '../../models/Product';
import { BASE_URL } from '../../services/apiService';
import { ICategory } from '../../models/Category';

const { Option } = Select;

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (productData: FormData) => void;
  product?: IProduct;
  categories: ICategory[];
}

const AddEditProduct: React.FC<ProductModalProps> = ({
  visible,
  onClose,
  onSubmit,
  product,
  categories,
}) => {
  const [form] = Form.useForm();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(product?.thumbnail || null);

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        category_id: product.category_id,
      });
      setThumbnailPreview(product.thumbnail || null);
    } else {
      form.resetFields();
      setThumbnailFile(null);
      setThumbnailPreview(null);
    }
  }, [product, form]);

  const handleFinish = (values: any) => {
    const formData = new FormData();

    const productData = {
      id: product?.id || undefined,
      name: values.name,
      description: values.description,
      category_id: values.category_id
    };

    formData.append('product', JSON.stringify(productData));

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile, thumbnailFile.name);
    }

    onSubmit(formData);
    onClose();
  };

  const handleFileChange = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG or PNG files!');
      return Upload.LIST_IGNORE;
    }

    const reader = new FileReader();
    reader.onload = () => setThumbnailPreview(reader.result as string);
    reader.readAsDataURL(file.originFileObj || file);

    setThumbnailFile(file.originFileObj || file);

    return false;
  };

  return (
    <Modal
      title={product ? 'Edit Product' : 'Add Product'}
      open={visible}
      onCancel={onClose}
      width={600}
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
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter the product name' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
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
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter the product description' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Thumbnail">
          <Upload
            listType="picture-card"
            showUploadList={false}
            beforeUpload={handleFileChange}
          >
            {thumbnailPreview ? (
              <img
                src={product ? `${BASE_URL}/${thumbnailPreview}` : thumbnailPreview}
                alt="Thumbnail"
                style={{ width: '100%', maxHeight: '100px', objectFit: 'contain' }}
              />
            ) : (
              <div>
                <PlusOutlined />
                <div>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddEditProduct;