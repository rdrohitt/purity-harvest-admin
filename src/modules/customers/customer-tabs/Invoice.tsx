import React, { useState } from 'react';
import { Table, Tag, Button, Select, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { WhatsAppOutlined, FilePdfOutlined } from '@ant-design/icons';

const { Option } = Select;

interface InvoiceData {
  key: string;
  invoiceId: string;
  month: string;
  dueDate: string;
  amount: number;
  status: string;
  generatedOn: string;
}

const Invoice: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([
    {
      key: '1',
      invoiceId: 'INV001',
      month: 'September',
      dueDate: '2024-09-30',
      amount: 2500,
      status: 'Paid',
      generatedOn: '2024-09-10',
    },
    {
      key: '2',
      invoiceId: 'INV002',
      month: 'October',
      dueDate: '2024-10-31',
      amount: 3900,
      status: 'Due',
      generatedOn: '2024-10-05',
    },
  ]);

  const columns: ColumnsType<InvoiceData> = [
    {
      title: 'Invoice ID',
      dataIndex: 'invoiceId',
      key: 'invoiceId',
      fixed: 'left',
      width: 120
    },
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount: number) => `Rs ${amount.toFixed(2)} /-`,
      },
    {
      title: 'Invoice',
      dataIndex: '',
      key: '',
      render: () => (
        <Button
          type="link"
          icon={<FilePdfOutlined style={{ fontSize: '20px', color: 'red' }}/>}
          onClick={() => alert('Send invoice via WhatsApp')}
        />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'Due') {
          color = 'red';
        } else if (status === 'Pending') {
          color = 'orange';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Generated On',
      dataIndex: 'generatedOn',
      key: 'generatedOn',
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button
          type="link"
          icon={<WhatsAppOutlined style={{ fontSize: '20px', color: '#25D366' }} />}
          onClick={() => alert('Send invoice via WhatsApp')}
        />
      ),
    },
  ];

  return (
    <div>
     <Row align="middle" justify="space-between">
        <Col>
          <h5 className="page-heading left-text left-20">Invoices</h5>
        </Col>
        <Col>
          <Select
            defaultValue="2024"
            style={{ width: 120, marginRight: '20px' }}
            onChange={(value) => alert(`Selected year: ${value}`)}
          >
            <Option value="2024">2024</Option>
            <Option value="2023">2023</Option>
            <Option value="2022">2022</Option>
          </Select>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={invoices}
        pagination={{ pageSize: 10 }}
        rowKey="key"
        bordered
      />
    </div>
  );
};

export default Invoice;