import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import ApiService from "../../services/apiService";
import DriverPickUpSheet from './DriverPickUpSheet';
import { IDeliverySheet } from '../../models/DeliverySheet';
import SubscriberDetail from './SubscriberDetail';
import { Dayjs } from 'dayjs';
import { IProduct } from '../../models/Product';

interface MainProps {
  selectedDate: Dayjs;
  products: IProduct[];
}

const Main: React.FC<MainProps> = ({ selectedDate, products }) => {
  const [deliverySheetData, setDeliverySheetData] = useState<IDeliverySheet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDeliverySheet = async () => {
    setLoading(true);
    try {
      const response = await ApiService.get<IDeliverySheet[]>(
        `/delivery_boys/delivery_sheets?date=${selectedDate.format('YYYY-MM-DD')}`
      );
      setDeliverySheetData(response);
    } catch (error) {
      console.error('Failed to fetch delivery sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverySheet();
  }, [selectedDate]);

  return (
    <div style={{ background: 'bisque' }}>
      {deliverySheetData.map((sheet, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <div className="filter-container" style={{ marginBottom: '0px', borderRadius: '0px', paddingBottom: '5px' }}>
            <h5 className="page-heading center">
              <strong>{sheet.delivery_boy.name}</strong> <em>({sheet.delivery_boy.mobile})</em>
            </h5>
          </div>

          <div className="tab-container" style={{ marginBottom: '0px', borderRadius: '0px' }}>
            <Row gutter={16}>
              <Col span={24}>
                {sheet.delivery_boy && (
                  <DriverPickUpSheet
                    deliveryBoyId={sheet.delivery_boy.id || 0}
                    date={selectedDate.format('YYYY-MM-DD')}
                    products={products}
                  />
                )}
              </Col>
            </Row>
          </div>

          <div className="tab-container" style={{ marginBottom: '0px', borderRadius: '0px' }}>
            <Row gutter={16}>
              <Col span={24}>
                {sheet.deliveries && <SubscriberDetail
                 deliveries={sheet.deliveries}
                products={products}
                fetchDeliverySheet={fetchDeliverySheet}
                date={selectedDate.format('YYYY-MM-DD')}
                />}
              </Col>
            </Row>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Main;