import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { IPickup, IPickupItem } from '../../models/Pickup';
import { IProduct } from '../../models/Product';
import ApiService from "../../services/apiService";

interface DriverPickUpSheetProps {
  deliveryBoyId: number;
  date: string;
  products: IProduct[];
}

const DriverPickUpSheet: React.FC<DriverPickUpSheetProps> = ({ deliveryBoyId, date, products }) => {
  const [driverPickUpSheet, setDriverPickupSheet] = useState<IPickupItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDriverPickupSheet = async () => {
    setLoading(true);
    try {
      const pickupData = await ApiService.get<IPickup>(
        `/pickups/pickup_sheet?delivery_boy_id=${deliveryBoyId}&date=${date}`
      );

      if (pickupData?.items) {
        const allItems = pickupData.items.map((item) => ({
          ...item,
          pickup_date: pickupData.pickup_date,
        }));
        setDriverPickupSheet(allItems);
      } else {
        console.error('Unexpected response format: Missing items array');
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get product details from product ID
  const getProductDetails = (id: number) =>
    products.find((product) => product.id === id) || { name: "" };

  const calculateTotals = () => {
    const totalQuantity = driverPickUpSheet.reduce((sum, item) => sum + item.quantity, 0);
    const totalPickedUp = driverPickUpSheet.reduce((sum, item) => sum + item.picked_up, 0);
    const totalRejected = driverPickUpSheet.reduce((sum, item) => sum + item.picked_up, 0);
    const totalPending = driverPickUpSheet.reduce((sum, item) => sum + (item.quantity - item.picked_up), 0);

    return {
      product_name: "Total",
      quantity: totalQuantity,
      picked_up: totalPickedUp,
      rejected: totalRejected,
      pending: totalPending,
      isTotalRow: true, // Add a flag for the total row
    };
  };

  const totalsRow = calculateTotals();

  useEffect(() => {
    fetchDriverPickupSheet();
  }, [date]);

  const columns = [
    {
      title: "Product Name",
      dataIndex: "product_id",
      key: "product_name",
      width: 300,
      render: (productId: number, record: any): React.ReactNode => {
        const { name } = getProductDetails(productId);
        return record.isTotalRow ? <strong></strong> : name;
      },
      className: "no-bg-color",
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Delivered',
      dataIndex: 'picked_up',
      key: 'picked_up',
    },
    {
      title: 'Rejected',
      dataIndex: 'rejected',
      key: 'rejected',
    },
    {
      title: 'Pending',
      render: (_: any, record: any): number => record.quantity - record.picked_up,
      key: 'pending',
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: IPickupItem) => (
        <>{`${record.picked_up} item(s) picked`}</>
      ),
    },
  ];

  return (
    <Table
      dataSource={[...driverPickUpSheet, totalsRow]}
      columns={columns}
      pagination={false}
      loading={loading}
      rowKey={(record) =>
        'product_id' in record ? `${record.product_id}-${record.pickup_id}` : 'total-row'
      }
      rowClassName={(record: any) => (record.isTotalRow ? 'total-row' : '')}
      bordered
    />
  );
};

export default DriverPickUpSheet;