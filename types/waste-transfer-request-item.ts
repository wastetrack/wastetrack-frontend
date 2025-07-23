// types/waste-transfer-item-offerings.ts
import { PagingInfo } from './waste-drop-request-item';

export interface WasteTransferItemOffering {
  id: string;
  transfer_form_id: string;
  waste_type_id: string;
  offering_weight: number;
  offering_price_per_kgs: number;
  accepted_weight: number;
  accepted_price_per_kgs: number;
  verified_weight: number;
}

export interface WasteTransferItemOfferingsListParams {
  transfer_form_id?: string;
  waste_type_id?: string;
  page?: number;
  size?: number;
}

export interface WasteTransferItemOfferingsListResponse {
  data: WasteTransferItemOffering[];
  paging: PagingInfo;
}

export interface WasteTransferItemOfferingsDetailResponse {
  data: WasteTransferItemOffering;
}
