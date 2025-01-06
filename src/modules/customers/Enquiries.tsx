import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import ApiService from '../../services/apiService';
import { IEnquiry } from '../../models/Enquiry';
import dayjs from 'dayjs';

const Enquiries: React.FC = () => {
    const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
    const [products, setProducts] = useState<{ [key: string]: { name: string; size: string } }>({});
    const [areas, setAreas] = useState<{ [key: string]: string }>({});
    const [subareas, setSubareas] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(false);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const response = await ApiService.get<IEnquiry[]>('/enquiries');
            setEnquiries(response);
        } catch (error) {
            message.error('Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await ApiService.get<{ id: string; name: string; size: string }[]>('/products');
            const productMap = response.reduce((acc, product) => {
                acc[product.id] = { name: product.name, size: product.size };
                return acc;
            }, {} as { [key: string]: { name: string; size: string } });
            setProducts(productMap);
        } catch (error) {
            message.error('Failed to load products');
        }
    };

    const fetchAreas = async () => {
        try {
            const response = await ApiService.get<{ id: string; name: string }[]>('/areas');
            const areaMap = response.reduce((acc, area) => {
                acc[area.id] = area.name;
                return acc;
            }, {} as { [key: string]: string });
            setAreas(areaMap);
        } catch (error) {
            message.error('Failed to load areas');
        }
    };

    const fetchSubareas = async () => {
        try {
            const response = await ApiService.get<{ id: string; name: string }[]>('/sub_areas');
            const subareaMap = response.reduce((acc, subarea) => {
                acc[subarea.id] = subarea.name;
                return acc;
            }, {} as { [key: string]: string });
            setSubareas(subareaMap);
        } catch (error) {
            message.error('Failed to load subareas');
        }
    };

    useEffect(() => {
        fetchEnquiries();
        fetchProducts();
        fetchAreas();
        fetchSubareas();
    }, []);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',
        },
        {
            title: 'Product',
            dataIndex: 'product_id',
            key: 'product_id',
            render: (product_id: string) => {
                const product = products[product_id];
                return product ? `${product.name} (${product.size})` : 'Unknown';
            },
        },
        {
            title: 'Area Name',
            dataIndex: 'area_id',
            key: 'area_id',
            render: (area_id: string) => areas[area_id] || 'Unknown',
        },
        {
            title: 'Subarea Name',
            dataIndex: 'subarea_id',
            key: 'subarea_id',
            render: (subarea_id: string) => subareas[subarea_id] || 'Unknown',
        },
        {
            title: 'Creation Date',
            dataIndex: 'creation_date',
            key: 'creation_date',
            render: (date: string) => dayjs(date).format('DD-MMM-YYYY'),
        },
    ];

    return (
        <div>
            <h5 className="page-heading">Enquiries</h5>
            <div className="tab-container">
                <Table
                    dataSource={enquiries}
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

export default Enquiries;