import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/apiService';
import logo from '../../assets/images/logo.png';
import { ILogin } from '../../models/Login';
import './Login.scss';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (values: { username: string; password: string; remember?: boolean }) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);
      formData.append('remember_me', values.remember?.toString() || 'false');

      const response = await ApiService.post<ILogin>('/auth/login', formData);
      if (response) {
        localStorage.setItem('bearer', response.access_token);
        if (localStorage.getItem('bearer')) {
          navigate('/dashboard');
        } else {
          console.error('Failed to store token in localStorage');
        }
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('bearer')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Logo" className="logo" />
        <Form onFinish={handleLogin} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" initialValue={false}>
            <Checkbox>Remember me (optional)</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" size="large" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;