// src/types/dealSetting.ts
import type { Paginated } from "@/lib";

export interface DealOptionConfig {
  value: boolean;
  note: string;
  activeNote: boolean;
  showNoteWhen: "on" | "off" | "always";
}

export interface DealSetting {
  id: string;
  fastDelivery: DealOptionConfig;
  scheduledDelivery: DealOptionConfig;
  cashPayment: DealOptionConfig;
  bankTransfer: DealOptionConfig;
}

export type DealSettingPaginate = Paginated<DealSetting>;
