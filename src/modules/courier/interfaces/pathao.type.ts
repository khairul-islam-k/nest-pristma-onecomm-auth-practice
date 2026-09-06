export type PathaoStoreData = {
  store_id?: number;
  [key: string]: unknown;
};

export type PathaoCreateStoreResponse = {
  code?: number;
  type?: string;
  message?: string;
  data?: PathaoStoreData;
};

export type PathaoErrorResponse = {
  code?: number;
  type?: string;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export type PathaoCity = {
  city_id: number;
  city_name: string;
};

export type PathaoCityListResponse = {
  message: string;
  type: string;
  code: number;
  data: {
    data: PathaoCity[];
  };
};

export type PathaoCityErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export type PathaoZone = {
  zone_id: number;
  zone_name: string;
};

export type PathaoZoneListResponse = {
  message: string;
  type: string;
  code: number;
  data: {
    data: PathaoZone[];
  };
};

export type PathaoZoneErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export type PathaoArea = {
  area_id: number;
  area_name: string;
  home_delivery_available: boolean;
  pickup_available: boolean;
};

export type PathaoAreaListResponse = {
  message: string;
  type: string;
  code: number;
  data: {
    data: PathaoArea[];
  };
};

export type PathaoAreaErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

export type PathaoOrderData = {
  consignment_id: string;
  merchant_order_id: string | null;
  order_status: string;
  delivery_fee: number;
};

export type PathaoCreateOrderResponse = {
  message: string;
  type: string;
  code: number;
  data: PathaoOrderData;
};

export type PathaoOrderErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[] | string>;
  code?: number;
  type?: string;
};

export type PathaoOrderInfo = {
  consignment_id: string;
  merchant_order_id: string | null;
  order_status: string;
  order_status_slug: string;
  updated_at: string;
  invoice_id: string | null;
};

export type PathaoOrderInfoResponse = {
  message: string;
  type: string;
  code: number;
  data: PathaoOrderInfo;
};

export type PathaoOrderInfoErrorResponse = {
  message?: string;
  error?: string;
  errors?: Record<string, string[] | string>;
  code?: number;
  type?: string;
};
