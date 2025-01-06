import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import ApiService from '../../services/apiService';
import { IPickup } from '../../models/Pickup';
import { IProduct } from '../../models/Product';
import { Dayjs } from 'dayjs';

interface TotalItemPickupProps {
  selectedDate: Dayjs;
  products: IProduct[];
}

const TotalItemPickup: React.FC<TotalItemPickupProps> = ({ products, selectedDate }) => {
  const [pickupData, setPickupData] = useState<IPickup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPickupData = async () => {
    setLoading(true);
    try {
      const pickupData = await ApiService.get<IPickup[]>(`/pickups/pickup_sheets?date=${selectedDate.format('YYYY-MM-DD')}`);
      setPickupData(pickupData);
    } catch (error) {
      console.error('Error fetching pickup data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickupData();
  }, [selectedDate]);

  const getProductDetails = (id: number) =>
    products.find((product) => product.id === id) || { name: 'Unknown' };

  const groupedData = pickupData
    .flatMap((pickup) => pickup.items)
    .reduce((acc, item) => {
      const existingItem = acc.find((entry) => entry.product_id === item.product_id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
        existingItem.picked_up += item.picked_up;
      } else {
        acc.push({ ...item });
      }
      return acc;
    }, [] as typeof pickupData[0]['items']);

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'product_id',
      key: 'product_name',
      render: (productId: number): React.ReactNode => {
        const { name } = getProductDetails(productId);
        return name;
      },
    },
    {
      title: 'Total Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Given',
      dataIndex: 'picked_up',
      key: 'picked_up',
    },
    {
      title: 'In Hand',
      key: 'inhand',
      render: (_: any, record: any): number => record.quantity - record.picked_up,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
  ];

  return (
    <Table
      loading={loading}
      columns={columns}
      dataSource={groupedData.map((item) => ({ ...item, key: item.product_id }))}
      pagination={{ pageSize: 50 }}
      bordered
    />
  );
};

export default TotalItemPickup;