import React, { useState } from 'react';
import { Calendar, Card, Table, Input, Button } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

interface Order {
  id: string;
  productName: string;
  quantity: number;
}

const UpcomingDeliveries: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [orders, setOrders] = useState<Order[]>([]);

  // Sample orders for different dates
  const orderData: Record<string, Order[]> = {
    '2024-09-25': [
      { id: 'O001', productName: 'Cow Milk', quantity: 2 },
      { id: 'O002', productName: 'Buffalo Milk', quantity: 3 },
    ],
    '2024-09-26': [
      { id: 'O003', productName: 'Cow Milk', quantity: 1 },
    ],
  };

  // Handle date selection from the calendar
  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    const dateString = date.format('YYYY-MM-DD');
    setOrders(orderData[dateString] || []);
  };

  // Handle quantity change for an order
  const handleQuantityChange = (orderId: string, newQuantity: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, quantity: newQuantity } : order
      )
    );
  };

  // Handle update button click
  const handleUpdate = (orderId: string) => {
    alert(`Order ${orderId} updated with new quantity`);
    // You can add logic to save the updated quantity, e.g., calling an API
  };

  // Define table columns
  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: Order) => (
        <Input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => handleQuantityChange(record.id, parseInt(e.target.value))}
          style={{ width: '80px' }}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: Order) => (
        <Button type="primary" onClick={() => handleUpdate(record.id)}>
          Update
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Calendar */}
      <Card style={{ marginBottom: '16px' }}>
        <Calendar
          fullscreen={false}
          value={selectedDate}
          onSelect={handleDateSelect}
        />
      </Card>

      {/* Orders for Selected Date */}
      <Card title={`Orders for ${selectedDate.format('YYYY-MM-DD')}`}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default UpcomingDeliveries;