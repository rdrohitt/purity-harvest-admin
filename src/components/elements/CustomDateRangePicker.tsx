import React from 'react';
import { DatePicker } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface CustomDateRangePickerProps {
  value: [Dayjs | null, Dayjs | null];
  onChange: RangePickerProps['onChange'];
}

const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({ value, onChange }) => {
  return <RangePicker value={value} onChange={onChange} style={{ width: '100%' }} />;
};

export default CustomDateRangePicker;