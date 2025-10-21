import React, { useEffect, useMemo, useState } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import type { CSSProperties } from "react";
import type { DefaultOptionType } from "antd/es/select";
import getMultiSelectSearch from "@/services/projects/get-multi-select-search";

export interface MultiSelectOption extends DefaultOptionType {
  value: string;
  label: string;
  key: string;
  [key: string]: any;
}

const mergeOptionArrays = (
  existing: MultiSelectOption[],
  incoming: MultiSelectOption[]
) => {
  const map = new Map<string, MultiSelectOption>();
  existing.forEach(option => map.set(String(option.value), option));
  incoming.forEach(option => map.set(String(option.value), option));
  return Array.from(map.values());
};

interface MultiSelectSearchProps {
  placeholder?: string;
  onChange?: (values: string[]) => void;
  value?: string[];
  apiUrl: string;
  className?: string;
  size?: "small" | "middle" | "large";
  disabled?: boolean;
  style?: CSSProperties;
  initialOptions?: MultiSelectOption[];
  tagRender?: SelectProps["tagRender"];
  onOptionsChange?: (options: MultiSelectOption[]) => void;
}

const MultiSelectSearch: React.FC<MultiSelectSearchProps> = ({
  placeholder = "Üst proje ara ve seç...",
  onChange,
  value = [],
  apiUrl,
  className = "",
  size = "middle",
  disabled = false,
  style,
  initialOptions,
  tagRender,
  onOptionsChange,
}) => {
  const [options, setOptions] = useState<MultiSelectOption[]>(initialOptions || []);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (!initialOptions) {
      return;
    }

    if (initialOptions.length === 0) {
      setOptions([]);
      return;
    }

    setOptions(prev => mergeOptionArrays(initialOptions, prev));
  }, [initialOptions]);

  const loadAllOptions = async () => {
    if (disabled) {
      return;
    }

    setLoading(true);

    try {
      console.log("🔍 Tüm seçenekler yükleniyor:", apiUrl);

      const response = await getMultiSelectSearch("", apiUrl);

      console.log("✅ Tüm seçenekler API yanıtı:", response.data);

      const apiResult =
        response.data?.result?.data || response.data?.data || response.data;

      console.log("🔍 Parsed data:", apiResult);

      if (!Array.isArray(apiResult)) {
        console.error("❌ API yanıtı array formatında değil:", apiResult);
        setOptions(initialOptions ? [...initialOptions] : []);
        return;
      }

      const formattedOptions: MultiSelectOption[] = apiResult.map((item: any) => {
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

        const resolvedColor =
          item?.color ??
          item?.Color ??
          item?.hexColor ??
          item?.HexColor ??
          item?.hex ??
          item?.Hex ??
          item?.colour ??
          item?.Colour;

        const resolvedDescription =
          item?.description ??
          item?.Description ??
          item?.desc ??
          item?.Desc;

        return {
          value: value,
          label: label,
          key: id,
          color: resolvedColor,
          description: resolvedDescription,
          ...item,
        };
      });

      console.log("✅ Tüm formatted options:", formattedOptions);
      setOptions(prev => {
        const merged = mergeOptionArrays(prev, formattedOptions);
        if (onOptionsChange) {
          onOptionsChange(merged);
        }
        return merged;
      });
    } catch (error: any) {
      console.error("❌ Tüm seçenekler yükleme hatası:", error);

      if (error.code === "ERR_NETWORK") {
        console.error("🔥 Network hatası: Backend çalışmıyor olabilir!");
        console.error("🔧 Çözüm: Backend'i başlatın veya URL'yi kontrol edin");
      } else if (error.code === "ERR_EMPTY_RESPONSE") {
        console.error("📭 Boş yanıt: API endpoint'i yanıt vermiyor");
      }

      setOptions(initialOptions ? [...initialOptions] : []);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchText: string) => {
    if (disabled) {
      return;
    }

    setSearchValue(searchText);

    if (!searchText || searchText.trim().length === 0) {
      // Boş arama için tüm listeyi yükle
      await loadAllOptions();
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

      const formattedOptions: MultiSelectOption[] = apiResult.map((item: any) => {
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

        const resolvedColor =
          item?.color ??
          item?.Color ??
          item?.hexColor ??
          item?.HexColor ??
          item?.hex ??
          item?.Hex ??
          item?.colour ??
          item?.Colour;

        const resolvedDescription =
          item?.description ??
          item?.Description ??
          item?.desc ??
          item?.Desc;

        return {
          value: value,
          label: label,
          key: id,
          color: resolvedColor,
          description: resolvedDescription,
          ...item,
        };
      });

      console.log("✅ Formatted options:", formattedOptions);
      setOptions(prev => {
        const merged = mergeOptionArrays(prev, formattedOptions);
        if (onOptionsChange) {
          onOptionsChange(merged);
        }
        return merged;
      });
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
    if (disabled) {
      return;
    }
    onChange?.(selectedValues);
  };

  const handleOpenChange = async (open: boolean) => {
    if (open && !disabled) {
      // Dropdown açıldığında tüm listeyi yükle
      await loadAllOptions();
    } else if (!open) {
      setSearchValue("");
    }
  };

  const resolvedTagRender = useMemo<SelectProps["tagRender"] | undefined>(() => {
    if (!tagRender) {
      return undefined;
    }

    return tagProps => {
      const matchedOption =
        options.find(option => String(option.value) === String(tagProps.value)) ||
        (tagProps as any)?.option;

      const enhancedProps = {
        ...tagProps,
        option: matchedOption,
        item: matchedOption,
        data: matchedOption,
      } as typeof tagProps & { item: MultiSelectOption; data: MultiSelectOption };

      return tagRender(enhancedProps);
    };
  }, [options, tagRender]);

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
    disabled,
    loading: loading,
    notFoundContent: loading ? (
      <div className="flex justify-center items-center py-4">
        <Spin size="small" />
        <span className="ml-2 text-gray-500">Aranıyor...</span>
      </div>
    ) : searchValue ? (
      <div className="flex justify-center items-center py-4 text-gray-500">
        Sonuç bulunamadı
      </div>
    ) : (
      <div className="flex justify-center items-center py-4 text-gray-400">
        Liste yükleniyor...
      </div>
    ),
    options: options,
    maxTagCount: "responsive",
    style: { width: "100%", ...(style || {}) },
    className: `${className}`,
    tagRender: resolvedTagRender,
  };  

  return (
    <div className="w-full">
      <Select {...selectProps} />
    </div>
  );
};

export default MultiSelectSearch;
