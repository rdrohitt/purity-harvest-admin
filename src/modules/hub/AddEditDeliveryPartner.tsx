import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Upload, Row, Col } from 'antd';
import { IDeliveryPartner } from '../../models/DeliveryPartner';
import { IArea } from '../../models/Area';
import { ISubarea } from '../../models/Subarea';
import ApiService, { BASE_URL } from '../../services/apiService';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';

interface AddEditDeliveryPartnerProps {
    visible: boolean;
    onClose: () => void;
    partner?: IDeliveryPartner | null;
}

const AddEditDeliveryPartner: React.FC<AddEditDeliveryPartnerProps> = ({ visible, onClose, partner }) => {
    const [form] = Form.useForm();
    const [areas, setAreas] = useState<IArea[]>([]);
    const [subareas, setSubareas] = useState<ISubarea[]>([]);
    const [areaIdFile, setAreaIdFile] = useState<File | null>(null);
    const [subareaIdFile, setSubareaIdFile] = useState<File | null>(null);
    const [areaIdPreview, setAreaIdPreview] = useState<string | null>(null);
    const [subareaIdPreview, setSubareaIdPreview] = useState<string | null>(null);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const response = await ApiService.get<IArea[]>('/areas');
                setAreas(response);
            } catch (error) {
                message.error('Failed to fetch areas');
                console.error('Failed to fetch areas:', error);
            }
        };
        fetchAreas();
    }, []);

    useEffect(() => {
        if (partner) {
            // Set area_id and subarea_id fields in edit mode
            form.setFieldsValue({
                ...partner,
                area_id: {
                    value: partner.area_id,
                    label: areas.find(area => area.id === partner.area_id)?.name || '',
                },
            });

            // Fetch subareas based on the partner's area_id
            const fetchSubareasByAreaId = async () => {
                try {
                    const response = await ApiService.get<ISubarea[]>(`/areas/${partner.area_id}/subareas`);
                    setSubareas(response);

                    // Set subarea_id field in edit mode after fetching relevant subareas
                    form.setFieldsValue({
                        subarea_id: {
                            value: partner.subarea_id,
                            label: response.find(subarea => subarea.id === partner.subarea_id)?.name || '',
                        },
                    });
                } catch (error) {
                    message.error('Failed to fetch subareas');
                    console.error('Failed to fetch subareas:', error);
                }
            };
            fetchSubareasByAreaId();

            // Set preview URLs with the base URL for edit mode
            setAreaIdPreview(partner.id_front ? `${BASE_URL}/${partner.id_front}` : null);
            setSubareaIdPreview(partner.id_back ? `${BASE_URL}/${partner.id_back}` : null);
        } else {
            // Reset form and file states when adding a new partner
            form.resetFields();
            setAreaIdFile(null);
            setSubareaIdFile(null);
            setAreaIdPreview(null);
            setSubareaIdPreview(null);
        }
    }, [partner, areas, form]);

    const handleAreaChange = (area: { value: number }) => {
        form.setFieldsValue({ subarea_id: undefined });
        fetchSubareasByArea(area.value);
    };

    const fetchSubareasByArea = async (areaId: number) => {
        try {
            const response = await ApiService.get<ISubarea[]>(`/areas/${areaId}/subareas`);
            setSubareas(response);
        } catch (error) {
            message.error('Failed to fetch subareas');
            console.error('Failed to fetch subareas:', error);
        }
    };

    const handleFileChange = (
        file: File,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG files!');
            return Upload.LIST_IGNORE;
        }

        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        setFile(file);
        return false;
    };

    const handleFinish = async (values: any) => {
        try {
            const formData = new FormData();
            const payload = {
                name: values.name,
                mobile: values.mobile,
                area_id: values.area_id.value,
                subarea_id: values.subarea_id.value,
                id_type: values.id_type,
                ...(partner?.id && { id: partner.id })
            };

            formData.append('delivery_boy', JSON.stringify(payload));

            if (areaIdFile) {
                formData.append('id_front', areaIdFile, areaIdFile.name);
            }
            if (subareaIdFile) {
                formData.append('id_back', subareaIdFile, subareaIdFile.name);
            }

            if (partner && partner.id) {
                await ApiService.put('/delivery_boys', formData);
                message.success('Delivery partner updated successfully');
            } else {
                await ApiService.post('/delivery_boys', formData);
                message.success('Delivery partner added successfully');
            }
            onClose();
        } catch (error) {
            message.error('Failed to save delivery partner');
            console.error('Failed to save delivery partner:', error);
        }
    };

    return (
        <Modal
            title={partner ? 'Edit Delivery Partner' : 'Add Delivery Partner'}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={() => form.submit()}>
                    {partner ? 'Update' : 'Add'}
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter the name' }]}>
                    <Input />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="mobile" label="Mobile" rules={[{ required: true, message: 'Please enter the mobile number' }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="id_type" label="ID Type" rules={[{ required: true, message: 'Please select the ID type' }]}>
                            <Select placeholder="Select ID Type">
                                <Select.Option value="aadhar">Aadhar</Select.Option>
                                <Select.Option value="driving_license">Driving License</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="area_id" label="Area" rules={[{ required: true, message: 'Please select an area' }]}>
                            <Select placeholder="Select Area" onChange={handleAreaChange} allowClear labelInValue>
                                {areas.map((area) => (
                                    <Select.Option key={area.id} value={area.id}>
                                        {area.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="subarea_id" label="Subarea" rules={[{ required: true, message: 'Please select a subarea' }]}>
                            <Select placeholder="Select Subarea" allowClear labelInValue>
                                {subareas.map((subarea) => (
                                    <Select.Option key={subarea.id} value={subarea.id}>
                                        {subarea.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="ID Front" name="id_front" rules={[{ required: true, message: 'Please upload ID front image' }]}>
                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                                beforeUpload={(file) => handleFileChange(file, setAreaIdFile, setAreaIdPreview)}
                                onRemove={() => setAreaIdPreview(null)}
                            >
                                {areaIdPreview ? (
                                    <img
                                        src={areaIdPreview}
                                        alt="ID Front"
                                        style={{
                                            width: '100%',
                                            maxWidth: '100px',
                                            maxHeight: '100px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                ) : (
                                    <UploadOutlined />
                                )}
                            </Upload>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="ID Back" name="id_back" rules={[{ required: true, message: 'Please upload ID back image' }]}>
                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                                beforeUpload={(file) => handleFileChange(file, setSubareaIdFile, setSubareaIdPreview)}
                                onRemove={() => setSubareaIdPreview(null)}
                            >
                                {subareaIdPreview ? (
                                    <img
                                        src={subareaIdPreview}
                                        alt="ID Back"
                                        style={{
                                            width: '100%',
                                            maxWidth: '100px',
                                            maxHeight: '100px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                ) : (
                                    <UploadOutlined />
                                )}
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddEditDeliveryPartner;