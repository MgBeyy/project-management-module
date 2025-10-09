import React, { useState } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import getMultiSelectSearch from "../services/get-multi-select-search";

interface ProjectOption {
  value: string;
  label: string;
  key: string;
}

interface MultiSelectSearchProps {
  placeholder?: string;
  onChange?: (values: string[]) => void;
  value?: string[];
  apiUrl: string;
  className?: string;
  size?: "small" | "middle" | "large";
}

const MultiSelectSearch: React.FC<MultiSelectSearchProps> = ({
  placeholder = "Üst proje ara ve seç...",
  onChange,
  value = [],
  apiUrl,
  className = "",
  size = "middle",
}) => {
  const [options, setOptions] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = async (searchText: string) => {
    setSearchValue(searchText);

    if (!searchText || searchText.trim().length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);

    try {
      console.log(
        "🔍 API isteği gönderiliyor:",
        `${apiUrl}?Search=${searchText.trim()}`
      );

      const response = await getMultiSelectSearch(searchText, apiUrl);

      console.log("✅ API yanıtı alındı:", response.data);

      const apiResult =
        response.data?.result?.data || response.data?.data || response.data;

      console.log("🔍 Parsed data:", apiResult);

      if (!Array.isArray(apiResult)) {
        console.error("❌ API yanıtı array formatında değil:", apiResult);
        setOptions([]);
        return;
      }

      const formattedOptions: ProjectOption[] = apiResult.map((item: any) => {
        const id = item.id?.toString() || Math.random().toString();
        let value = id;
        let label = "";

        if (apiUrl.includes("/Label")) {
          label = item.name || item.title || item.label || `Label ${id}`;
        } else if (apiUrl.includes("/Project")) {
          if (item.code && item.title) {
            label = `${item.code} - ${item.title}`;
          } else {
            label = item.title || item.name || `Project ${id}`;
          }
        } else if (apiUrl.includes("/Client")) {
          label =
            item.name ||
            item.companyName ||
            `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
            `Client ${id}`;
        } else {
          label =
            item.name ||
            item.title ||
            item.label ||
            item.displayName ||
            `Item ${id}`;
        }

        return {
          value: value,
          label: label,
          key: id,
        };
      });

      console.log("✅ Formatted options:", formattedOptions);
      setOptions(formattedOptions);
    } catch (error: any) {
      console.error("❌ Üst proje arama hatası:", error);

      if (error.code === "ERR_NETWORK") {
        console.error("🔥 Network hatası: Backend çalışmıyor olabilir!");
        console.error("🔧 Çözüm: Backend'i başlatın veya URL'yi kontrol edin");
      } else if (error.code === "ERR_EMPTY_RESPONSE") {
        console.error("📭 Boş yanıt: API endpoint'i yanıt vermiyor");
      }

      setOptions([]);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (selectedValues: string[]) => {
    onChange?.(selectedValues);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSearchValue("");
    }
  };

  const selectProps: SelectProps = {
    mode: "multiple",
    value: value,
    placeholder: placeholder,
    onSearch: handleSearch,
    onChange: handleChange,
    onOpenChange: handleOpenChange,
    filterOption: false,
    showSearch: true,
    allowClear: true,
    size: size,
    loading: loading,
    notFoundContent: loading ? (
      <div className="flex justify-center items-center py-4">
        <Spin size="small" />
        <span className="ml-2 text-gray-500">Aranıyor...</span>
      </div>
    ) : searchValue && searchValue.length >= 2 ? (
      <div className="flex justify-center items-center py-4 text-gray-500">
        Üst proje bulunamadı
      </div>
    ) : (
      <div className="flex justify-center items-center py-4 text-gray-400">
        En az 2 karakter yazın
      </div>
    ),
    options: options,
    maxTagCount: "responsive",
    style: { width: "100%" },
    className: `${className}`,
  };

  return (
    <div className="w-full">
      <Select {...selectProps} />
    </div>
  );
};

export default MultiSelectSearch;
