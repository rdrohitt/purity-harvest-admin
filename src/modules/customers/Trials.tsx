import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import ApiService from '../../services/apiService';
import { ITrial } from '../../models/Trials';
import { IProduct } from '../../models/Product';
import dayjs from 'dayjs';

const Trials: React.FC = () => {
    const [trials, setTrials] = useState<ITrial[]>([]);
    const [productMap, setProductMap] = useState<{ [key: string]: { name: string; variants: { [key: string]: string } } }>({});
    const [customers, setCustomers] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(false);

    // Fetch trials
    const fetchTrials = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get<ITrial[]>('/trials');
            setTrials(response);
        } catch (error) {
            message.error('Failed to load trials');
        } finally {
            setLoading(false);
        }
    };

    // Fetch products
    const fetchProducts = async () => {
        try {
            const response = await ApiService.get<IProduct[]>('/products');
            const productMap = response.reduce((acc, product) => {
                if (!product.id) return acc; // Skip if product.id is undefined
                acc[product.id] = {
                    name: product.name,
                    variants: product.variants.reduce((variantAcc, variant) => {
                        if (variant.id) { // Ensure variant.id exists
                            variantAcc[variant.id] = variant.size;
                        }
                        return variantAcc;
                    }, {} as { [key: string]: string }),
                };
                return acc;
            }, {} as { [key: string]: { name: string; variants: { [key: string]: string } } });
            setProductMap(productMap);
        } catch (error) {
            message.error('Failed to load products');
        }
    };

    // Fetch customers
    const fetchCustomers = async () => {
        try {
            const response = await ApiService.get<{ id: string; name: string }[]>('/customers');
            const customerMap = response.reduce((acc, customer) => {
                acc[customer.id] = customer.name;
                return acc;
            }, {} as { [key: string]: string });
            setCustomers(customerMap);
        } catch (error) {
            message.error('Failed to load customers');
        }
    };

    useEffect(() => {
        fetchTrials();
        fetchProducts();
        fetchCustomers();
    }, []);

    const columns = [
        {
            title: 'Customer',
            dataIndex: 'customer_id',
            key: 'customer_id',
            render: (customer_id: string) => customers[customer_id] || 'Unknown',
        },
        {
            title: 'Product',
            dataIndex: 'product_id',
            key: 'product_id',
            render: (_: any, record: ITrial) => {
                const product = productMap[record.product_id];
                const variant = product?.variants[record.variant_id];
                return product
                    ? `${product.name} - ${variant || 'Unknown'}`
                    : 'Unknown Product';
            },
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Packaging',
            dataIndex: 'packaging',
            key: 'packaging',
            render: (packaging: 'packet' | 'bottle') => packaging.charAt(0).toUpperCase() + packaging.slice(1),
        },
        {
            title: 'Payment',
            dataIndex: 'is_cod',
            key: 'is_cod',
            render: (is_cod: boolean) => (is_cod ? 'COD' : 'Paid'),
        },
        {
            title: 'Start Date',
            dataIndex: 'start_date',
            key: 'start_date',
            render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
        },
        {
            title: 'End Date',
            dataIndex: 'end_date',
            key: 'end_date',
            render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span
                    style={{
                        color: status === 'active' ? 'green' : status === 'ended' ? 'red' : 'orange',
                    }}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            ),
        },
    ];

    return (
        <div>
            <h5 className="page-heading">Trials</h5>
            <div className="tab-container">
                <Table
                    dataSource={trials}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    bordered
                    pagination={{ pageSize: 10 }}
                />
            </div>
        </div>
    );
};

export default Trials;