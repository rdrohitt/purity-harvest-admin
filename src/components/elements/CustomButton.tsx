import React from 'react';
import { Button } from 'antd';
import { ButtonProps } from 'antd/es/button';

interface CustomButtonProps extends ButtonProps {
  text: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ text, icon, className, onClick, ...rest }) => {
  return (
    <Button icon={icon} className={className} onClick={onClick} {...rest}>
      {text}
    </Button>
  );
};

export default CustomButton;