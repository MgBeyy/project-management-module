import { MultiSelectOption } from "../common";
import { LabelDto } from "./api";

export const normalizeLabelOption = (label: LabelDto): MultiSelectOption | null => {
  if (!label) return null;
  return {
    ...label,
    value: label?.id,
    label: label?.name ?? "",
    key: String(label?.id),
    color: label?.color ?? "#1890ff",
    description: label?.description ?? "",
  };
};