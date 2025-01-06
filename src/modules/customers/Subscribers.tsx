import React, { ReactNode, useEffect, useState } from "react";
import { Table, Row, Col, Tag, Switch, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ISubscription } from "../../models/Subscription";
import { ICustomer } from "../../models/Customer";
import { IProduct } from "../../models/Product";
import ApiService from "../../services/apiService";
import CustomInput from "../../components/elements/CustomInput";
import CustomButton from "../../components/elements/CustomButton";
import dayjs from "dayjs";
import { ColumnsType } from "antd/es/table";
import AddEditSubscription from "./modals/AddEditSubscription";

const Subscribers: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const safeDayjs = (date: any) => (date ? (dayjs(date).isValid() ? dayjs(date) : null) : null);

  const handleAddSubscription = () => {
    setEditingData(null); // Clear editing data
    setIsEdit(false); // Set to Add mode
    setIsModalVisible(true);
  };

  const preprocessWeek = (week: string): string => {
    return week
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/([a-zA-Z0-9_]+):/g, '"$1":'); // Add quotes around keys if missing
  };

  const handleEdit = (data: ISubscription) => {
    const sanitizedWeek = data.week ? preprocessWeek(data.week) : null;
  
    const formattedData = {
      ...data,
      week: sanitizedWeek,
      start_date: safeDayjs(data.start_date),
      end_date: safeDayjs(data.end_date),
    };
  
    setEditingData(formattedData);
    setIsEdit(true);
    setIsModalVisible(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (isEdit) {
        // Include editingData.id in the payload
        const payload = { ...data, id: editingData.id };
  
        await ApiService.put('/subscriptions', payload);
        message.success("Subscriber updated successfully!");
      } else {
        await ApiService.post("/subscriptions", data);
        message.success("Subscriber added successfully!");
      }
      setIsModalVisible(false);
      // Reload data
      fetchData();
    } catch (error) {
      message.error("Failed to save subscriber.");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, custRes, prodRes] = await Promise.all([
        ApiService.get<ISubscription[]>("/subscriptions"),
        ApiService.get<ICustomer[]>("/customers"),
        ApiService.get<IProduct[]>("/products"),
      ]);

      setSubscriptions(subRes);
      setCustomers(custRes);
      setProducts(prodRes);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get customer name and mobile from customer ID
  const getCustomerName = (id: number): string => {
    const customer = customers.find((customer) => customer.id === id);
    if (customer) {
      const { name, mobile } = customer;
      return `${name} (${mobile || "No Mobile"})`;
    }
    return "Unknown";
  };

  // Get product details from product ID
  const getProductDetails = (id: number) =>
    products.find((product) => product.id === id) || { name: "Unknown", thumbnail: "" };

  // Group subscriptions by customer ID
  const groupedSubscriptions = subscriptions.reduce((acc, sub) => {
    const customer = getCustomerName(sub.customer_id);
    if (!acc[customer]) {
      acc[customer] = [];
    }
    acc[customer].push(sub);
    return acc;
  }, {} as { [key: string]: ISubscription[] });

  const nestedColumns: ColumnsType<ISubscription> = [
    {
      title: "Product Name",
      dataIndex: "product_id",
      key: "product_name",
      width: 250,
      render: (productId: number, record: ISubscription): React.ReactNode => {
        const { name } = getProductDetails(productId);
        return <a className="link" onClick={() => handleEdit(record)}>{name}</a>;
      },
    },
    {
      title: "Quantity",
      dataIndex: "week",
      key: "quantity",
      width: 120,
      render: (week: string, record: ISubscription): React.ReactNode => {
        try {
          if (!week || typeof week !== "string") {
            return "Invalid Data";
          }
    
          const preprocessWeek = (week: string): any => {
            const formattedWeek = week
              .replace(/'/g, '"') // Replace single quotes with double quotes
              .replace(/([a-zA-Z]+):/g, '"$1":'); // Add quotes around keys
    
            // Validate JSON before parsing
            try {
              return JSON.parse(formattedWeek); // Parse the preprocessed JSON string
            } catch {
              return null; // Return null if parsing fails
            }
          };
    
          const weekData = preprocessWeek(week);
          if (!weekData || typeof weekData !== "object") {
            return "Invalid Data";
          }
    
          // Convert the object to an array of day-quantity pairs
          const weekArray = Object.entries(weekData);
    
          if (record.frequency === "daily" || record.frequency === "alternate_days") {
            const firstDay = weekArray[0];
            const quantity = firstDay ? firstDay[1] : "N/A";
            return quantity as React.ReactNode;
          } else if (record.frequency === "custom") {
            return weekArray.map(([dayName, qty]) => (
              <Tag color="blue" key={dayName}>
                {`${dayName} - ${qty}`}
              </Tag>
            ));
          } else {
            return "N/A";
          }
        } catch (error) {
          console.error("Error parsing week data:", error, "Raw week value:", week);
          return "Invalid Data";
        }
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number): React.ReactNode => `₹${price.toFixed(2)}`,
    },
    {
      title: "Frequency",
      dataIndex: "frequency",
      key: "frequency",
      width: 150,
      render: (frequency: string): React.ReactNode => {
        const frequencyMap: { [key: string]: string } = {
          daily: "Daily",
          weekly: "Weekly",
          monthly: "Monthly",
          alternate_days: "Alternate Days",
          custom: "Custom",
        };
        return frequencyMap[frequency] || "Unknown";
      },
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      width: 120,
      render: (date: string): React.ReactNode => dayjs(date).format("DD-MMM-YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
      render: (date: string): React.ReactNode => (date ? dayjs(date).format("DD-MMM-YYYY") : "Ongoing"),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={() => console.log(record.id as number)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
  ];

  // Table columns for customers
  const columns: ColumnsType<{ customer: string; subscriptions: ISubscription[] }> = [
    {
      title: "Customer Name",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Subscriptions",
      key: "subscriptions",
      render: (_, { subscriptions }, rowIndex) => (
        <div className='nested-table'>
          {rowIndex === 0 && (
            <Table
              columns={nestedColumns}
              dataSource={subscriptions}
              rowKey={(record) => record.id || ""}
              pagination={false}
              bordered
              size="small"
              showHeader={true}
            />
          )}
          {rowIndex !== 0 && (
            <Table
              columns={nestedColumns}
              dataSource={subscriptions}
              rowKey={(record) => record.id || ""}
              pagination={false}
              bordered
              size="small"
              showHeader={false}
            />
          )}
        </div>
      ),
    },
  ];

  // Table data
  const tableData = Object.keys(groupedSubscriptions).map((customer) => ({
    customer,
    subscriptions: groupedSubscriptions[customer],
  }));

  return (
    <>
      <h5 className="page-heading">Subscribed Customers</h5>
      <div className="filter-container">
        <Row gutter={16}>
          <Col span={12}>
            <CustomInput
              placeholder="Search by name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <div className="buttons-container">
              <CustomButton
                text="Add Subscriber"
                className="primary-button"
                icon={<PlusOutlined />}
                onClick={handleAddSubscription}
              />
            </div>
          </Col>
        </Row>
      </div>
      <div className="tab-container">
        <Table
          columns={columns}
          dataSource={tableData}
          rowKey={(record) => record.customer}
          loading={loading}
          bordered
          pagination={{ pageSize: 50 }}
          scroll={{ x: 1400 }}
        />
      </div>
      <AddEditSubscription
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingData}
        isEdit={isEdit}
      />
    </>
  );
};

export default Subscribers;