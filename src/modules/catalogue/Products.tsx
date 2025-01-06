import React, { useEffect, useState } from 'react';
import { Col, Row, Table, Switch, Popconfirm } from 'antd';
import ApiService from '../../services/apiService';
import { IProduct } from '../../models/Product';
import { ICategory } from '../../models/Category';
import { PlusOutlined } from '@ant-design/icons';
import { TrashFill } from 'react-bootstrap-icons';
import CustomButton from '../../components/elements/CustomButton';
import CustomInput from '../../components/elements/CustomInput';
import AddEditProduct from './AddEditProduct';

const Products: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await ApiService.get<IProduct[]>('/products');
      setProducts(response);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await ApiService.get<ICategory[]>('/categories');
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Fetch categories on component load
  }, []);

  // Filter products based on search text
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Open modal for adding a new product
  const handleAddProduct = () => {
    setEditingProduct(null); // Clear any existing product for adding
    setIsModalVisible(true);
  };

  // Open modal for editing an existing product
  const handleEditProduct = (product: IProduct) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  // Handle product submission from modal
  const handleProductSubmit = async (formData: FormData) => {
    try {
      const productId = formData.get('product') && JSON.parse(formData.get('product') as string)?.id;
      if (productId) {
        // Update existing product
        await ApiService.put('/products', formData);
      } else {
        // Add new product
        await ApiService.post('/products', formData);
      }

      // Refetch products to reflect updates
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      await ApiService.delete<IProduct>(`/products/${id}`);
      fetchProducts();
    } catch (e) {
      console.log('Error deleting product:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IProduct) => (
        <a className='link' onClick={() => handleEditProduct(record)}>{text}</a>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Category',
      dataIndex: 'category_id', // Changed to `category_id` if using category ID here
      key: 'category',
      render: (categoryId: number) => categories.find(cat => cat.id === categoryId)?.name || 'Unknown',
    },
    {
      title: 'Actual Price',
      dataIndex: 'mrp',
      key: 'mrp',
    },
    {
      title: 'Discounted Price',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (text: number) => `${text}%`,
    },
    {
      title: 'Visible',
      dataIndex: 'is_visible',
      key: 'is_visible',
      render: (isVisible: boolean) => (
        <Switch
          checked={isVisible}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 50,
      render: (record: IProduct) => (
        <>
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id || 0)}>
            <TrashFill className='trash-icon' />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <h5 className='page-heading'>Products</h5>
      <div className="filter-container">
        <Row gutter={16}>
          <Col span={12}>
            <CustomInput
              placeholder="Search by name"
              value={searchText}
              onChange={handleSearch}
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <div className='buttons-container'>
              <CustomButton
                text="Add Product"
                className='primary-button'
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
              />
            </div>
          </Col>
        </Row>
      </div>
      <div className='tab-container'>
        <Table
          bordered
          dataSource={filteredProducts}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 50 }}
        />
        <AddEditProduct
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleProductSubmit}
          product={editingProduct || undefined}
          categories={categories} // Pass categories to the modal
        />
      </div>
    </>
  );
};

export default Products;