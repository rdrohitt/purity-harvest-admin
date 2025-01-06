import React, { useState } from 'react';
import { Table, Tooltip, Popconfirm, Button, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, UndoOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons';
import ApiService from '../../services/apiService';
import { ICustomer } from '../../models/Customer';
import { IDelivery } from '../../models/DeliverySheet';
import { IProduct } from '../../models/Product';
import './DeliverySheet.scss';
import EditOrderModal from './EditOrderModal';

interface OrderItem {
  key: string;
  item: string;
  qty: number;
  qty_delivered: number;
  rate: number;
  type: string;
  totalAmt: number;
}

interface SubscriberDetailProps {
  deliveries: {
    customer: ICustomer;
    delivery: IDelivery;
  }[];
  products: IProduct[];
  fetchDeliverySheet: () => void;
  date: string;
}

const SubscriberDetail: React.FC<SubscriberDetailProps> = ({ deliveries, products, fetchDeliverySheet, date }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Map product IDs to product names
  const productMapping = products.reduce((map, product) => {
    if (product.id !== undefined) { // Ensure product.id is defined
      map[product.id] = product.name;
    }
    return map;
  }, {} as { [key: number]: string });

  // Transform delivery data into the format required by the table
  const transformedData = deliveries.map((d, index) => ({
    key: index.toString(),
    name: d.customer.name,
    address: d.customer.address,
    orderDetails: d.delivery.items.map((item, itemIndex) => ({
      key: itemIndex.toString(),
      item: productMapping[item.product_id] || `Product ID: ${item.product_id}`, // Show name or fallback to ID
      qty: item.qty_ordered,
      qty_delivered: item.qty_delivered,
      rate: item.price,
      type: item.type,
      totalAmt: item.qty_ordered * item.price,
    })),
    grandTotal: d.delivery.items.reduce((total, item) => total + item.qty_ordered * item.price, 0),
    delivery: d.delivery, // Include the full delivery object for access in columns
  }));

  const handleEditOrder = (orderDetails: IDelivery) => {
    setSelectedOrder(orderDetails);
    setIsModalVisible(true);
  };

  const handleApiCall = async (delivery: IDelivery, newStatus?: string) => {
    try {
      const updatedDelivery: IDelivery = {
        ...delivery,
        status: newStatus || delivery.status, // Use existing status if newStatus is undefined
        items: delivery.items.map(item => ({
          ...item,
          status: newStatus || item.status, // Use existing status if newStatus is undefined
        })),
      };
  
      if (delivery.id) {
        // PUT request
        await ApiService.put<any[]>(
          '/deliveries',
          updatedDelivery
        );
        message.success(`Delivery and items updated successfully!`);
      } else {
        // POST request
        await ApiService.post<any[]>(
          `/deliveries`,
          updatedDelivery
        );
        message.success(`Delivery and items created successfully!`);
      }
      fetchDeliverySheet();
    } catch (error) {
      message.error('Error updating delivery');
    }
  };

  const orderDetailsColumns = [
    {
      title: 'Item',
      dataIndex: '',
      key: '',
      render: (orderDetails: OrderItem) => (
        <span>
          {`${orderDetails.item} - ${orderDetails.type === 'subscription' ? 'S' : 'O'}` }
        </span>
      ),
    },
    {
      title: 'Ordered',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: 'Delivered',
      dataIndex: 'qty_delivered',
      key: 'qty_delivered',
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => `${rate.toFixed(2)} /-`,
    },
    {
      title: 'Amt',
      dataIndex: 'totalAmt',
      key: 'totalAmt',
      render: (totalAmt: number) => `${totalAmt.toFixed(2)} /-`,
    },
  ];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (text: any, record: any) => {
        // Determine the status text and corresponding color
        const getStatusProps = () => {
          switch (record.delivery.status) {
            case 'pending':
              return { label: 'Undelivered', color: 'rgba(255, 165, 0, 0.6)' }; // Light orange
            case 'delivered':
              return { label: 'Delivered', color: 'rgba(0, 128, 0, 0.6)' }; // Light green
            case 'rejected':
              return { label: 'Rejected', color: 'rgba(255, 0, 0, 0.6)' }; // Light red
            case 'cancelled':
              return { label: 'Cancelled', color: 'rgba(128, 128, 128, 0.6)' }; // Light gray
            default:
              return { label: '', color: 'rgba(0, 0, 0, 0.6)' }; // Light black
          }
        };
    
        const { label, color } = getStatusProps();
    
        return (
          <div className="cell-container watermarked-row">
            {label && (
              <div
                className="watermark"
                style={{
                  color: color,
                }}
              >
                {label}
              </div>
            )}
            {text}
          </div>
        );
      },
    },
    {
      title: 'Order Details',
      dataIndex: 'orderDetails',
      key: 'orderDetails',
      width: 600,
      render: (orderDetails: OrderItem[]) => (
        <div className="nested-table">
          <Table
            columns={orderDetailsColumns}
            dataSource={orderDetails}
            pagination={false}
            bordered
            size="small"
            rowKey="key"
          />
        </div>
      ),
    },
    {
      title: 'Grand Total',
      key: 'grandTotal',
      width: 200,
      render: (record: any) => {
        const subtotal = record.grandTotal;
        const discount = record.delivery.discount;
        const status = record.delivery.status;
        const totalAmount = subtotal - discount;

        return (
          <div className="daily-bill-summary">
            <div className="bill-row">
              <span className="bill-label">Subtotal:</span>
              <span className="bill-value">Rs {subtotal.toFixed(2)}</span>
            </div>
            <div className="bill-row">
              <span className="bill-label">Discount: </span>
              <span className="bill-value">Rs {discount.toFixed(2)}</span>
            </div>
            <div className="bill-row total">
              <span className="bill-label">Total Amt:</span>
              <span className="bill-value">Rs {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (record: { delivery: IDelivery }) => {
        const { status } = record.delivery;
        const isFutureDate = new Date(date) > new Date();
    
        const actions = [
          {
            title: 'Mark Delivered',
            condition: !isFutureDate && status !== 'delivered',
            onConfirm: () => handleApiCall(record.delivery, 'delivered'),
            icon: <CheckCircleOutlined style={{ color: 'green' }} />,
            style: { border: '1px solid green', borderRadius: '5px' },
          },
          {
            title: 'Mark Reject',
            condition: !isFutureDate && status !== 'rejected',
            onConfirm: () => handleApiCall(record.delivery, 'rejected'),
            icon: <StopOutlined style={{ color: 'red' }} />,
            style: { border: '1px solid red', borderRadius: '5px' },
          },
          {
            title: 'Mark as Undelivered',
            condition: !isFutureDate && status !== 'pending',
            onConfirm: () => handleApiCall(record.delivery, 'pending'),
            icon: <UndoOutlined style={{ color: 'orange' }} />,
            style: { border: '1px solid orange', borderRadius: '5px' },
          },
          {
            title: 'Cancel Order',
            condition: status !== 'cancelled',
            onConfirm: () => handleApiCall(record.delivery, 'cancelled'),
            icon: <CloseCircleOutlined style={{ color: 'gray' }} />,
            style: { border: '1px solid gray', borderRadius: '5px' },
          },
          {
            title: 'Edit Order',
            condition: true, // Always show the edit button
            onClick: () => handleEditOrder(record.delivery),
            icon: <EyeOutlined style={{ color: 'blue' }} />,
            style: { border: '1px solid blue', borderRadius: '5px' },
            skipConfirm: true, // Flag to skip Popconfirm
          },
        ];
    
        return (
          <div style={{ display: 'flex', gap: '5px' }}>
            {actions
              .filter(action => action.condition)
              .map((action, index) => (
                <Tooltip title={action.title} key={index}>
                  {action.onConfirm && !action.skipConfirm ? (
                    <Popconfirm
                      title={`Are you sure you want to ${action.title.toLowerCase()}?`}
                      onConfirm={action.onConfirm}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button type="text" icon={action.icon} style={action.style} />
                    </Popconfirm>
                  ) : (
                    <Button
                      type="text"
                      icon={action.icon}
                      onClick={action.onClick}
                      style={action.style}
                    />
                  )}
                </Tooltip>
              ))}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={transformedData}
        pagination={false}
        rowKey="key"
        bordered
      />
      {isModalVisible && selectedOrder && (
        <EditOrderModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          orderDetails={selectedOrder}
          products={products}
          onUpdate={handleApiCall}
          date={date}
        />
      )}
    </>
  );
};

export default SubscriberDetail;