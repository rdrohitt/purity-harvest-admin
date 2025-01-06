import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Table, InputNumber, Popconfirm, Tooltip, Button } from 'antd';
import { IDelivery } from '../../models/DeliverySheet';
import { IProduct } from '../../models/Product';
import { CheckCircleOutlined, CloseCircleOutlined, UndoOutlined, StopOutlined } from '@ant-design/icons';
import ApiService from '../../services/apiService';

interface ItemData {
  key: string;
  item: string; // Product name
  qty: number;
  rate: number;
  totalAmt: number;
  status?: string;
}

interface OrderEditModalProps {
  visible: boolean;
  onClose: () => void;
  orderDetails: IDelivery;
  products: IProduct[];
  onUpdate: (updatedOrder: IDelivery, newStatus?: string) => void;
  date: string;
}

const EditOrderModal: React.FC<OrderEditModalProps> = ({
  visible,
  onClose,
  orderDetails,
  products,
  onUpdate,
  date
}) => {
  const [form] = Form.useForm();
  const [itemsData, setItemsData] = useState<ItemData[]>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);

  // Memoize product mapping to avoid unnecessary re-renders
  const productMapping = useMemo(
    () =>
      products.reduce((map, product) => {
        if (product.id !== undefined) {
          map[product.id] = product.name;
        }
        return map;
      }, {} as { [key: number]: string }),
    [products]
  );

  useEffect(() => {
    if (orderDetails && orderDetails.items) {
      const transformedItems: ItemData[] = orderDetails.items.map((item: any, index: number) => ({
        key: index.toString(),
        item: productMapping[item.product_id] || `Unknown Product`,
        qty: item.qty_ordered,
        rate: item.price,
        totalAmt: item.qty_ordered * item.price,
        status: item.status,
      }));
      setItemsData(transformedItems);
    }
  }, [orderDetails, productMapping]);

  const handleQuantityChange = (key: string, value: number | null) => {
    const updatedItems = itemsData.map((item) =>
      item.key === key ? { ...item, qty: value || 0, totalAmt: (value || 0) * item.rate } : item
    );
    setItemsData(updatedItems);
  };

  const toggleEditMode = (key: string) => {
    setEditingRow(editingRow === key ? null : key);
  };

  const handleSaveRow = async (record: ItemData) => {
    const isFutureDate = new Date(date) > new Date(); // Check if the date is in the future
  
    // Find the original item from the order details
    const originalItem = orderDetails.items.find(
      (originalItem) => productMapping[originalItem.product_id] === record.item
    );
  
    // Construct the base updatedItem object
    
    // const updatedItem: any = {
    //   product_id: originalItem?.product_id || 0,
    //   qty_ordered: record.qty,
    //   price: record.rate,
    //   status: record.status || "pending",
    //   qty_delivered: originalItem?.qty_delivered || 0,
    //   is_modified: true,
    //   type: originalItem?.type || "order",
    // };

    const updatedItem: any = {
      product_id: originalItem?.product_id || 0,
      qty_ordered: originalItem?.qty_ordered,
      price: record.rate,
      status: record.status || "pending",
      qty_delivered: record?.qty || 0,
      is_modified: true,
      type: originalItem?.type || "order",
    };
  
    // Conditionally add properties for future dates
    if (isFutureDate) {
      updatedItem.order_id = originalItem?.order_id || 0;
      updatedItem.subscription_id = originalItem?.subscription_id || 0;
    }
  
    const updatedItems = orderDetails.items.map((item) =>
      productMapping[item.product_id] === record.item
        ? { ...updatedItem }
        : { ...item }
    );
  
    // Create the updated IDelivery object
    let updatedOrder: IDelivery = {
      ...orderDetails,
      date, // Override the `date` key with the `date` prop
      items: updatedItems, // Keep the updated items
    };

    if (isFutureDate) {
      updatedOrder = JSON.parse(
        JSON.stringify(updatedOrder, (key, value) =>
          key === "id" && value === null ? undefined : value
        )
      );
    }
  
    if (isFutureDate) {
      console.log("Updated Order for Future Date:", updatedOrder);
      await ApiService.put<any[]>(
        '/deliveries/modify?modifier=admin',
        updatedOrder
      );
    } else {
      console.log("Hitting regular API with updated order:", updatedOrder);
      onUpdate(updatedOrder);
    }
  
    // Exit edit mode for the current row
    setEditingRow(null);
  };

  const handleAction = (record: ItemData, newStatus: string) => {
    const updatedItems = itemsData.map((item) => {
      const originalItem = orderDetails.items.find(
        (originalItem) => productMapping[originalItem.product_id] === item.item
      );

      return {
        product_id: originalItem?.product_id || 0, // Retrieve product_id from originalItem or fallback
        qty_ordered: item.qty,
        price: item.rate,
        status: item.key === record.key ? newStatus : item.status || "pending", // Ensure status is always a string
        qty_delivered: originalItem?.qty_delivered || 0,
        is_modified: true, // Assuming all edits modify the item
        type: originalItem?.type || "order", // Default to 'order' if type is missing
      };
    });

    const updatedOrder: IDelivery = {
      ...orderDetails,
      items: updatedItems,
    };
    onUpdate(updatedOrder, newStatus);
  };

  const itemColumns = [
    {
      title: 'Item Name',
      dataIndex: 'item',
      key: 'item',
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      render: (qty: number, record: ItemData) => (
        <InputNumber
          min={1}
          value={qty}
          disabled={editingRow !== record.key} // Enable input only in edit mode
          onChange={(value) => handleQuantityChange(record.key, value)}
        />
      ),
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmt',
      key: 'totalAmt',
      render: (text: number) => <span>{text.toFixed(2)}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: ItemData) => {
        const isFutureDate = new Date(date) > new Date(); // Check if the date is in the future

        return (
          <div style={{ display: 'flex', gap: '5px' }}>
            {editingRow === record.key ? (
              <Button type="primary" onClick={() => handleSaveRow(record)}>
                Save
              </Button>
            ) : (
              <Button type="default" onClick={() => toggleEditMode(record.key)}>
                Edit
              </Button>
            )}
            {!isFutureDate && (
              <>
                <Tooltip title="Mark Delivered">
                  <Popconfirm
                    title="Are you sure you want to mark this as delivered?"
                    onConfirm={() => handleAction(record, 'delivered')}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      icon={<CheckCircleOutlined style={{ color: 'green' }} />}
                      style={{ border: '1px solid green', borderRadius: '5px' }}
                    />
                  </Popconfirm>
                </Tooltip>
                <Tooltip title="Mark Reject">
                  <Popconfirm
                    title="Are you sure you want to reject this item?"
                    onConfirm={() => handleAction(record, 'rejected')}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      icon={<StopOutlined style={{ color: 'red' }} />}
                      style={{ border: '1px solid red', borderRadius: '5px' }}
                    />
                  </Popconfirm>
                </Tooltip>
                <Tooltip title="Mark as Undelivered">
                  <Popconfirm
                    title="Are you sure you want to mark this as undelivered?"
                    onConfirm={() => handleAction(record, 'undelivered')}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      icon={<UndoOutlined style={{ color: 'orange' }} />}
                      style={{ border: '1px solid orange', borderRadius: '5px' }}
                    />
                  </Popconfirm>
                </Tooltip>
              </>
            )}
            <Tooltip title="Cancel Item">
              <Popconfirm
                title="Are you sure you want to cancel this item?"
                onConfirm={() => handleAction(record, 'cancelled')}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  icon={<CloseCircleOutlined style={{ color: 'gray' }} />}
                  style={{ border: '1px solid gray', borderRadius: '5px' }}
                />
              </Popconfirm>
            </Tooltip>
          </div>
        );
      },
    }
  ];

  return (
    <Modal
      title="Edit Order Details"
      open={visible}
      onCancel={onClose}
      footer={null} // Remove default footer buttons
      width={1000}
    >
      <Form form={form} layout="vertical">
        <Table
          columns={itemColumns}
          dataSource={itemsData}
          pagination={false}
          bordered
          size="small"
          rowKey="key"
        />
      </Form>
    </Modal>
  );
};

export default EditOrderModal;