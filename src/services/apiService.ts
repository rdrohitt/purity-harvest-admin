import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Modal } from 'antd';

// export const BASE_URL = 'https://test.purityharvest.in/'
  export const BASE_URL = 'https://api.purityharvest.in/'

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
    });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });
  }

  getAuthToken(): string | null {
    return localStorage.getItem('bearer');
  }

  private handleResponse<T>(response: AxiosResponse<T>): T {
    return response.data;
  }

  onOkClick = () => {
    localStorage.removeItem('bearer');
    window.location.reload();
  }

  private handleError(error: AxiosError<any>): never {
    if (error.response?.status === 404) {
      throw console.warn('no record found');
    }
    if (error.response?.status === 401) {
      Modal.error({
        title: 'Please Review',
        content: JSON.parse(error.request?.response).detail,
        onOk: this.onOkClick
      });
      throw error.response.status || 'An error occurred';
    } else if (error.request?.status === 409) {
      Modal.info({
        title: JSON.parse(error.request?.response).detail,
        content: 'Please review and make any necessary changes',
      });
      throw 'No response received from the server';
    }
    else if (error.request) {
      Modal.info({
        title: 'It seems there"s a problem with the data you provided. ',
        content: 'Please ensure all fields are filled out correctly and try again',
      });
      throw 'No response received from the server';
    } else {
      Modal.error({
        title: 'Our apologies. We encountered an unexpected error.',
        content: 'Please refresh the page or try again later. If the problem persists, please contact support.',
      });
      throw error;
    }
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, { params });
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }


  async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  async delete<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }
}

export default new ApiService();
