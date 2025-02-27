import React, { useEffect, useState } from 'react';
import { Col, Row, Table, Tag, message } from 'antd';
import ApiService from '../../services/apiService';
import { ITrial } from '../../models/Trials';
import { IProduct } from '../../models/Product';
import dayjs from 'dayjs';
import { ITransaction } from '../../models/Transactions';
import CustomInput from '../../components/elements/CustomInput';
import { CustomButton } from '../../components/elements';
import { PlusOutlined } from "@ant-design/icons";

const Trials: React.FC = () => {
    const [trials, setTrials] = useState<ITrial[]>([]);
    const [productMap, setProductMap] = useState<{ [key: string]: { name: string; variants: { [key: string]: string } } }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<Record<string, string>>({});
    const [searchText, setSearchText] = useState<string>("");

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

    // Fetch transactions
    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get<ITransaction[]>('/payments');
            const txnMap = response.reduce((acc, txn) => {
                acc[txn.txn_id] = txn.status;
                return acc;
            }, {} as Record<string, string>);
            setTransactions(txnMap);
        } catch (error) {
            message.error('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTrials();
        fetchProducts();
        fetchTransactions();
    }, []);

    const columns = [
        {
            title: 'Trial ID',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (id: number) => `Trial-${id}`,
        },
        {
            title: 'Product',
            dataIndex: 'product_id',
            key: 'product_id',
            render: (_: any, record: ITrial) => {
                const product = productMap[record.product_id];
                const variant = product?.variants[record.variant_id];
                return product && (
                    <div key={record.product_id}>
                        <span className="link">
                            {product?.name || 'Unknown Product'}
                        </span>
                        <div style={{ fontSize: "12px", color: "gray" }}>
                            {variant} | {record.packaging} | Qty - {record.quantity}
                        </div>
                    </div>
                )
            },
        },
        {
            title: 'Order Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
        {
            title: 'Payment',
            dataIndex: 'is_cod',
            key: 'is_cod',
            render: (is_cod: boolean) => (is_cod ? 'COD' : 'Paid'),
        },
        {
            title: 'Payment Status',
            dataIndex: 'txn_id',
            key: 'status',
            width: 150,
            render: (txn_id: string) => (
                <Tag color={transactions[txn_id] === 'success' ? 'green' : 'red'}>
                    {transactions[txn_id] ? transactions[txn_id].toUpperCase() : 'N/A'}
                </Tag>
            ),
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
        <>
            <h5 className="page-heading">Trials</h5>
            <div className="filter-container">
                <Row gutter={16}>
                    <Col span={12}>
                        <CustomInput
                            placeholder="Search by Id"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Col>
                    <Col span={12} style={{ textAlign: "right" }}>
                        <CustomButton
                            text="Add Trial"
                            className="primary-button"
                            icon={<PlusOutlined />}
                        //   onClick={() => {
                        //     setIsEdit(false);
                        //     setIsModalVisible(true);
                        //   }}
                        />
                    </Col>
                </Row>
            </div>
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
        </>
    );
};

export default Trials;