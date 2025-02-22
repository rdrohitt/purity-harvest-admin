import React, { useState } from 'react';
import {
  Modal,
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  Upload,
  Row,
  Col,
  message,
  Select,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { IVariant } from '../../models/Product';
import { BASE_URL } from '../../services/apiService';
import ApiService from '../../services/apiService';

const { Option } = Select;

interface VariantManagerProps {
  visible: boolean;
  onClose: () => void;
  variants: IVariant[];
  onVariantsChange: (updatedVariants: IVariant[]) => void;
}

const AddEditProductVariant: React.FC<VariantManagerProps> = ({
  visible,
  onClose,
  variants,
  onVariantsChange,
}) => {
  const [form] = Form.useForm();
  const [editingVariant, setEditingVariant] = useState<IVariant | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [newImages, setNewImages] = useState<{ file: File; url: string }[]>([]);
  const [existingImages, setExistingImages] = useState<{ path: string; id: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle variant edit
  const handleVariantEdit = (variant: IVariant) => {
    setEditingVariant(variant);
    setThumbnailPreview(variant.thumbnail ? `${BASE_URL}/${variant.thumbnail}` : null);
    // Map existing images properly
    setExistingImages(
      variant.images.map((image: any) => ({
        path: image.path,
        id: image.id,
      }))
    );
    setNewImages([]); // Clear new images
    form.setFieldsValue(variant);
  };

  // Delete variant
  const handleVariantDelete = async (id: number) => {
    try {
      await ApiService.delete(`/variants/${id}`);
      onVariantsChange(variants.filter((variant) => variant.id !== id));
      message.success('Variant deleted successfully!');
    } catch (error) {
      console.error('Error deleting variant:', error);
      message.error('Failed to delete variant. Please try again.');
    }
  };

  // Handle image upload for new images
  const handleMultipleImagesUpload = (file: File) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('You can only upload JPG or PNG files!');
      return false;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setNewImages((prev) => [...prev, { file, url: reader.result as string }]);
    reader.readAsDataURL(file);
    return false;
  };

  // Handle new image deletion
  const handleDeleteNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle existing image deletion
  const handleDeleteExistingImage = async (id: number) => {
    try {
      await ApiService.delete(`/images/${id}`);
      setExistingImages((prev) => prev.filter((image) => image.id !== id));
      message.success('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      message.error('Failed to delete image. Please try again.');
    }
  };

  // const handleVariantSave = async (values: any) => {
  //   const formData = new FormData();

  //   const productIdFromVariants = variants.length > 0 ? variants[0].product_id : null;
  //   if (!productIdFromVariants) {
  //     message.error('Product ID is missing. Please ensure at least one variant exists.');
  //     return;
  //   }

  //   const payload: any = {
  //     size: values.size,
  //     name: values.name,
  //     discount: values.discount || 0,
  //     packaging: values.packaging,
  //     price: values.price,
  //     product_id: editingVariant?.product_id || productIdFromVariants,
  //     mrp: values.mrp,
  //     thumbnail: '',
  //     is_visible: values.is_visible || false,
  //   };

  //   if (editingVariant?.id) {
  //     payload.id = editingVariant.id;
  //   }

  //   formData.append('variant', JSON.stringify(payload));

  //   if (thumbnailPreview) {
  //     const thumbnailFile = await fetch(thumbnailPreview)
  //       .then((res) => res.blob())
  //       .then((blob) => new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
  //     formData.append('thumbnail', thumbnailFile);
  //   }

  //   // Append new images
  //   newImages.forEach(({ file }) => {
  //     formData.append('images', file);
  //   });

  //   try {
  //     setLoading(true);
  //     if (editingVariant?.id) {
  //       await ApiService.put('/variants', formData);
  //       onVariantsChange(
  //         variants.map((variant) =>
  //           variant.id === editingVariant.id
  //             ? { ...variant, ...values, thumbnail: thumbnailPreview, images: [...existingImages, ...newImages] }
  //             : variant
  //         )
  //       );
  //       message.success('Variant updated successfully!');
  //     } else {
  //       const newVariant = await ApiService.post<IVariant>('/variants', formData);
  //       onVariantsChange([...variants, newVariant]);
  //       message.success('Variant added successfully!');
  //     }
  //     setEditingVariant(null);
  //     setThumbnailPreview(null);
  //     setNewImages([]);
  //     form.resetFields();
  //   } catch (error) {
  //     console.error('Error saving variant:', error);
  //     message.error('Failed to save variant. Please try again.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleVariantSave = async (values: any) => {
    const formData = new FormData();

    const productIdFromVariants = variants.length > 0 ? variants[0].product_id : null;
    if (!productIdFromVariants) {
      message.error('Product ID is missing. Please ensure at least one variant exists.');
      return;
    }

    const payload: any = {
      size: values.size,
      name: values.name,
      discount: values.discount || 0,
      packaging: values.packaging,
      price: values.price,
      product_id: editingVariant?.product_id || productIdFromVariants,
      mrp: values.mrp,
      is_visible: values.is_visible || false,
      thumbnail: '',
    };

    // Include ID only if updating (PUT request)
    if (editingVariant?.id) {
      payload.id = editingVariant.id;
    }

    // Append JSON payload
    formData.append('variant', JSON.stringify(payload));

    // Handle thumbnail and images ONLY for new variants (POST request)
    if (!editingVariant?.id) {
      if (thumbnailPreview) {
        const thumbnailFile = await fetch(thumbnailPreview)
          .then((res) => res.blob())
          .then((blob) => new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
        formData.append('thumbnail', thumbnailFile);
      }

      newImages.forEach(({ file }) => {
        formData.append('images', file);
      });
    }

    try {
      setLoading(true);
      if (editingVariant?.id) {
        // PUT request (Exclude thumbnail and images)
        await ApiService.put('/variants', formData);
        onVariantsChange(
          variants.map((variant) =>
            variant.id === editingVariant.id
              ? { ...variant, ...values }
              : variant
          )
        );
        message.success('Variant updated successfully!');
      } else {
        // POST request (Includes thumbnail and images)
        const newVariant = await ApiService.post<IVariant>('/variants', formData);
        onVariantsChange([...variants, newVariant]);
        message.success('Variant added successfully!');
      }

      setEditingVariant(null);
      setThumbnailPreview(null);
      setNewImages([]);
      form.resetFields();
    } catch (error) {
      console.error('Error saving variant:', error);
      message.error('Failed to save variant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setEditingVariant(null);
    setThumbnailPreview(null);
    setNewImages([]);
    form.resetFields();
  };

  const handleImageUpload = (
    file: File,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isImage) {
      message.error('You can only upload JPG or PNG files!');
      return false;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <Modal
      title="Manage Variants"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <Table
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Size', dataIndex: 'size', key: 'size' },
          { title: 'MRP', dataIndex: 'mrp', key: 'mrp' },
          { title: 'Discounted Price', dataIndex: 'price', key: 'price' },
          { title: 'Packaging', dataIndex: 'packaging', key: 'packaging' },
          {
            title: 'Visible',
            dataIndex: 'is_visible',
            key: 'is_visible',
            render: (isVisible: boolean) => <Switch checked={isVisible} />,
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (record: IVariant) => (
              <>
                <Button type="link" onClick={() => handleVariantEdit(record)}>
                  Edit
                </Button>
                <Button type="link" danger onClick={() => handleVariantDelete(record.id || 0)}>
                  Delete
                </Button>
              </>
            ),
          },
        ]}
        dataSource={variants}
        rowKey="id"
        bordered
        pagination={false}
      />
      <Button
        type="dashed"
        onClick={handleAddVariant}
        style={{ width: '100%', marginTop: '16px' }}
      >
        Add Variant
      </Button>
      <Form
        form={form}
        onFinish={handleVariantSave}
        layout="vertical"
        style={{ marginTop: '16px' }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is required' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="size"
              label="Size"
              rules={[{ required: true, message: 'Size is required' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="packaging"
              label="Packaging"
              rules={[{ required: true, message: 'Packaging is required' }]}
            >
              <Select placeholder="Select Packaging">
                <Option value="packet">Packet</Option>
                <Option value="bottle">Bottle</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="mrp"
              label="MRP"
              rules={[{ required: true, message: 'MRP is required' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="discount"
              label="Discount"
              rules={[{ required: true, message: 'Discount is required' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="price"
              label="Discounted Price"
              rules={[{ required: true, message: 'Price is required' }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="is_visible" label="Visible" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Thumbnail">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={(file) =>
                  handleImageUpload(file, setThumbnailPreview)
                }
              >
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    style={{ width: '100%', maxHeight: '100px' }}
                  />
                ) : (
                  <div>
                    <UploadOutlined />
                    <div>Upload Thumbnail</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Additional Images">
              <Upload
                listType="picture-card"
                multiple
                showUploadList={false}
                beforeUpload={handleMultipleImagesUpload}
              >
                <UploadOutlined />
                <div>Upload Images</div>
              </Upload>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {newImages.map(({ url }, index) => (
                  <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={url}
                      alt={`New ${index}`}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                      }}
                      onClick={() => handleDeleteNewImage(index)}
                    />
                  </div>
                ))}
                {existingImages.map((image) => (
                  <div key={image.id} style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={`${BASE_URL}/${image.path}`}
                      alt={`Existing ${image.id}`}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <Button
                      shape="circle"
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                      }}
                      onClick={() => handleDeleteExistingImage(image.id)}
                    />
                  </div>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          htmlType="submit"
          style={{ marginTop: '16px' }}
          loading={loading}
        >
          Save Variant
        </Button>
      </Form>
    </Modal>
  );
};

export default AddEditProductVariant;