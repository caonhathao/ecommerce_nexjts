export interface provinceResponse {
  success: boolean;
  data: {
    code: string;
    name: string;
    type: string;
  }[];
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface districtResponse {
  success: boolean;
  data: {
    code: string;
    name: string;
    type: string;
    province_code: string;
  }[];

  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface wardResponse {
  success: boolean;
  data: {
    code: string;
    name: string;
    type: string;
    district_code: string;
    province_code: string;
  }[];
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}
