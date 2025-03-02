import React, { useEffect, useState } from "react";
import { Table, Row, Col, Tag, Switch, message, Tooltip } from "antd";
import { CopyOutlined, PlusOutlined } from "@ant-design/icons";
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, custRes, prodRes] = await Promise.all([
        ApiService.get<ISubscription[]>("/subscriptions"),
        ApiService.get<ICustomer[]>("/customers?filter=active_Subscribers"),
        ApiService.get<IProduct[]>("/products"),
      ]);

      const filteredSubscriptions = subRes.filter(sub =>
        custRes.some(cust => cust.id === sub.customer_id)
      );

      setSubscriptions(filteredSubscriptions);
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

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c) => c.id === customerId);
    return (
      <div>
        <span>
          {customer ? customer?.name : 'Unknown Customer'}
        </span>
        <div style={{ fontSize: "12px", color: "gray" }}>
          <a href={`tel:${customer?.mobile}`}>{customer?.mobile}</a>
          <Tooltip title="Copy">
            <CopyOutlined
              style={{ marginLeft: 8, cursor: 'pointer' }}
              onClick={() => {
                navigator.clipboard.writeText(customer?.mobile || '');
                message.success('Copied to clipboard');
              }}
            />
          </Tooltip> | {customer?.state} | {customer?.city} | {customer?.pin || 'NA'} | {customer?.address}
        </div>
      </div>
    )
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
  const groupedSubscriptions: Record<number, ISubscription[]> = subscriptions.reduce(
    (acc: Record<number, ISubscription[]>, sub) => {
      const customerId = sub.customer_id;
      if (!acc[customerId]) acc[customerId] = [];
      acc[customerId].push(sub);
      return acc;
    },
    {}
  );

  const tableData = Object.keys(groupedSubscriptions).map((customerId) => ({
    customer: getCustomerName(Number(customerId)),
    subscriptions: groupedSubscriptions[Number(customerId)],
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
      <h5 className="page-heading">Active Subscribers</h5>

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
          { title: "Customer", dataIndex: "customer", key: "customer", width: 200 },
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