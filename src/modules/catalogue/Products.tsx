import React, { useEffect, useState } from 'react';
import { Col, Row, Table, Switch, Popconfirm } from 'antd';
import ApiService, { BASE_URL } from '../../services/apiService';
import { IProduct, IVariant } from '../../models/Product';
import { ICategory } from '../../models/Category';
import { PlusOutlined } from '@ant-design/icons';
import { TrashFill } from 'react-bootstrap-icons';
import CustomButton from '../../components/elements/CustomButton';
import CustomInput from '../../components/elements/CustomInput';
import AddEditProduct from './AddEditProduct';
import AddEditProductVariant from './AddEditProductVariant';

const Products: React.FC = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isProductModalVisible, setIsProductModalVisible] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  const [isVariantModalVisible, setIsVariantModalVisible] = useState<boolean>(false);
  const [currentVariants, setCurrentVariants] = useState<IVariant[]>([]);
  const [currentProductName, setCurrentProductName] = useState<string>('');

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
    fetchCategories();
  }, []);

  // Handle product search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Open modal for adding a new product
  const handleAddProduct = () => {
    setEditingProduct(null); // Clear editing product
    setIsProductModalVisible(true);
  };

  // Open modal for editing an existing product
  const handleEditProduct = (product: IProduct) => {
    setEditingProduct(product);
    setIsProductModalVisible(true);
  };

  // Open modal for managing variants
  const handleManageVariants = (product: IProduct) => {
    setCurrentVariants(product.variants || []);
    setCurrentProductName(product.name);
    setIsVariantModalVisible(true);
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
      console.error('Error deleting product:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantsChange = (updatedVariants: IVariant[]) => {
    setCurrentVariants(updatedVariants);
    // Update the product's variants locally
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.name === currentProductName ? { ...product, variants: updatedVariants } : product
      )
    );
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Thumbnail',
      dataIndex: 'thumbnail',
      render: (thumbnail: string) => (
        <img src={`${BASE_URL}/${thumbnail}`} alt="Thumbnail" width={50} />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IProduct) => (
        <a className="link" onClick={() => handleEditProduct(record)}>
          {text}
        </a>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId: number) =>
        categories.find((cat) => cat.id === categoryId)?.name || 'Unknown',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 50,
      render: (record: IProduct) => (
        <>
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.id || 0)}
          >
            <TrashFill className="trash-icon" />
          </Popconfirm>
        </>
      ),
    },
  ];

  const expandedRowRender = (record: IProduct) => {
    const variantColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text: string) => (
          <a
            className="link"
            onClick={() => handleManageVariants(record)}
          >
            {text}
          </a>
        ),
      },
      {
        title: 'Size',
        dataIndex: 'size',
        key: 'size',
      },
      {
        title: 'MRP',
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
        render: (discount: number) => `${discount}`,
      },
      {
        title: 'Packaging',
        dataIndex: 'packaging',
        key: 'packaging',
      },
      {
        title: 'Visible',
        dataIndex: 'is_visible',
        key: 'is_visible',
        render: (isVisible: boolean) => <Switch checked={isVisible} />,
      },
    ];

    return (
      <div className="subscription-expanded-row">
        <Table
          bordered
          className="expanded-table"
          columns={variantColumns}
          dataSource={record.variants}
          rowKey="id"
          pagination={false}
        />
      </div>
    );
  };

  return (
    <>
      <h5 className="page-heading">Products</h5>
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
            <div className="buttons-container">
              <CustomButton
                text="Add Product"
                className="primary-button"
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
              />
            </div>
          </Col>
        </Row>
      </div>
      <div className="tab-container">
        <Table
          bordered
          dataSource={filteredProducts}
          columns={columns}
          loading={loading}
          rowKey="id"
          expandable={{
            expandedRowRender,
          }}
          pagination={{ pageSize: 50 }}
        />
        <AddEditProduct
          visible={isProductModalVisible}
          onClose={() => setIsProductModalVisible(false)}
          onSubmit={handleProductSubmit}
          product={editingProduct || undefined}
          categories={categories}
        />
        <AddEditProductVariant
          visible={isVariantModalVisible}
          onClose={() => setIsVariantModalVisible(false)}
          variants={currentVariants}
          onVariantsChange={handleVariantsChange}
        />
      </div>
    </>
  );
};

export default Products;