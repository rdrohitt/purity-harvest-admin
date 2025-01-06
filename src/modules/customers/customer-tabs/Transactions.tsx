import React, { useState } from 'react';
import { Col, Row, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface TransactionData {
  key: string;
  id: string;
  transactionId: string;
  type: string;
  paymentVia: string;
  amount: number;
  refund: boolean;
  status: string;
  transactionDate: string;
}

const Transaction: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([
    {
      key: '1',
      id: 'T001',
      transactionId: 'TRX12345',
      type: 'Credit',
      paymentVia: 'Payment Gateway',
      amount: 500,
      refund: false,
      status: 'Completed',
      transactionDate: '2024-09-15',
    },
    {
      key: '2',
      id: 'T002',
      transactionId: 'TRX12346',
      type: 'Debit',
      paymentVia: 'Cash',
      amount: 200,
      refund: true,
      status: 'Pending',
      transactionDate: '2024-09-18',
    },
  ]);

  const columns: ColumnsType<TransactionData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Payment via',
      dataIndex: 'paymentVia',
      key: 'paymentVia',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Refund',
      dataIndex: 'refund',
      key: 'refund',
      render: (refund: boolean) => (refund ? 'Yes' : 'No'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'Pending') {
          color = 'orange';
        } else if (status === 'Failed') {
          color = 'red';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Transaction Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
    },
  ];

  return (
    <div>
       <Row align="middle" justify="space-between">
        <Col>
          <h5 className="page-heading left-text left-20">Transactions</h5>
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
        dataSource={transactions}
        pagination={{ pageSize: 10 }}
        rowKey="key"
        bordered
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default Transaction;