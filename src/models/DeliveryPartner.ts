export interface IDeliveryPartner {
    id?: number;
    name: string;
    mobile: string;
    id_type: 'aadhar' | 'driving_license';
    area_id: number;
    subarea_id: number;
    id_front: string;
    id_back: string;
  }