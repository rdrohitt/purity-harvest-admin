import React, { useEffect, useState } from "react";
import { Table, Row, Col, Tag, Switch, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { ISubscription } from "../../models/Subscription";
import { ICustomer } from "../../models/Customer";
import { IProduct, IVariant } from "../../models/Product";
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

  useEffect(() => {
    fetchData();
  }, []);

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

  // Get customer name and mobile
  const getCustomerName = (id: number): string => {
    const customer = customers.find((c) => c.id === id);
    return customer ? `${customer.name} (${customer.mobile || "No Mobile"})` : "Unknown";
  };

  // Get product variant details
  const getVariantDetails = (variantId: number) => {
    for (const product of products) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) {
        return {
          productName: product.name,
          variantName: variant.name,
          size: variant.size,
          packaging: variant.packaging,
        };
      }
    }
    return { productName: "Unknown", variantName: "Unknown", size: "N/A", packaging: "N/A" };
  };

  // Process week data
  const renderWeekData = (week: string, frequency: string) => {
    try {
      if (!week || typeof week !== "string") return "Invalid Data";
      const parsedWeek = JSON.parse(week.replace(/'/g, '"').replace(/([a-zA-Z]+):/g, '"$1":'));

      if (frequency === "daily" || frequency === "alternate_days") {
        return parsedWeek ? Object.values(parsedWeek)[0] : "N/A";
      } else if (frequency === "custom") {
        return Object.entries(parsedWeek).map(([day, qty]) => (
          <Tag color="blue" key={day}>{`${day} - ${qty}`}</Tag>
        ));
      }
      return "N/A";
    } catch (error) {
      console.error("Error parsing week data:", error);
      return "Invalid Data";
    }
  };

  // Handle subscription edit
  const handleEdit = (data: ISubscription) => {
    setEditingData({
      ...data,
      start_date: dayjs(data.start_date),
      end_date: data.end_date ? dayjs(data.end_date) : null,
    });
    setIsEdit(true);
    setIsModalVisible(true);
  };

  // Handle submission of subscription data
  const handleSubmit = async (data: any) => {
    try {
      if (isEdit) {
        await ApiService.put("/subscriptions", { ...data, id: editingData.id });
        message.success("Subscription updated successfully!");
      } else {
        await ApiService.post("/subscriptions", data);
        message.success("Subscription added successfully!");
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      message.error("Failed to save subscription.");
    }
  };

  // Group subscriptions by customer
  const groupedSubscriptions: Record<string, ISubscription[]> = subscriptions.reduce(
    (acc: Record<string, ISubscription[]>, sub) => {
      const customer = getCustomerName(sub.customer_id);
      if (!acc[customer]) acc[customer] = [];
      acc[customer].push(sub);
      return acc;
    },
    {}
  );

  const tableData = Object.keys(groupedSubscriptions).map((customer) => ({
    customer,
    subscriptions: groupedSubscriptions[customer],
  }));

  // Nested columns
  const nestedColumns: ColumnsType<ISubscription> = [
    {
      title: "Product",
      dataIndex: "variant_id",
      key: "product",
      width: 300,
      render: (variantId: number, record: ISubscription) => {
        const { productName, variantName, size, packaging } = getVariantDetails(variantId);
        return (
          <div>
            <a className="link" onClick={() => handleEdit(record)}>
              {productName}
            </a>
            <div style={{ fontSize: "12px", color: "gray" }}>
              {variantName} | {packaging}
            </div>
          </div>
        );
      },
    },
    {
      title: "Quantity",
      dataIndex: "week",
      key: "quantity",
      width: 150,
      render: (week, record) => <>{renderWeekData(week, record.frequency) as React.ReactNode}</>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number) => `₹${price.toFixed(2)}`,
    },
    {
      title: "Frequency",
      dataIndex: "frequency",
      key: "frequency",
      width: 150,
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      width: 150,
      render: (date: string) => dayjs(date).format("DD-MMM-YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      width: 150,
      render: (date: string) => (date ? dayjs(date).format("DD-MMM-YYYY") : "Ongoing"),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive) => (
        <Switch checked={isActive} checkedChildren="Active" unCheckedChildren="Inactive" />
      ),
    },
  ];

  return (
    <>
      <h5 className="page-heading">Subscribed Customers</h5>

      {/* Filter Section */}
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
            <CustomButton
              text="Add Subscriber"
              className="primary-button"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsEdit(false);
                setIsModalVisible(true);
              }}
            />
          </Col>
        </Row>
      </div>

      {/* Subscription Table */}
      <Table
        columns={[
          { title: "Customer", dataIndex: "customer", key: "customer" },
          {
            title: "Subscriptions",
            key: "subscriptions",
            render: (_, { subscriptions }) => (
              <div className="subscription-expanded-row ">
              <Table columns={nestedColumns} dataSource={subscriptions} pagination={false} bordered />
              </div>
            ),
          },
        ]}
        dataSource={tableData}
        rowKey="customer"
        loading={loading}
        bordered
      />

      <AddEditSubscription visible={isModalVisible} onClose={() => setIsModalVisible(false)} onSubmit={handleSubmit} initialValues={editingData} isEdit={isEdit} />
    </>
  );
};

export default Subscribers;