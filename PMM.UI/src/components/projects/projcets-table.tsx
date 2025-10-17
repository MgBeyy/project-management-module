import { Table, Tag, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";

import {
  ProjectSortKey,
  ProjectSortOrder,
  useProjectsStore,
} from "@/store/zustand/projects-store";
import { GetProjects } from "@/services/projects/get-projects";
import { formatDate, formatDateTime, mapStatusToString } from "@/utils/retype";
import Spinner from "../spinner";

type SortableColumnKey = ProjectSortKey;
type SortOrder = ProjectSortOrder;

export default function CustomTable() {
  const {
    projects,
    selectedProject,
    currentPage,
    pageSize,
    totalItems,
    isLoading,
    filters,
    refreshTrigger,
    sortBy,
    sortOrder,
    setProjects,
    setSelectedProject,
    setCurrentPage,
    setPageSize,
    setTotalItems,
    setIsLoading,
    setSortOptions,
  } = useProjectsStore();

  const handleSort = (dataIndex: SortableColumnKey) => {
    const nextOrder: SortOrder =
      sortBy !== dataIndex
        ? "ascend"
        : sortOrder === "ascend"
          ? "descend"
          : sortOrder === "descend"
            ? null
            : "ascend";

    setSortOptions(nextOrder ? dataIndex : null, nextOrder);
  };

  const SortableHeader = ({
    title,
    maxWidth,
    dataIndex,
  }: {
    title: string;
    maxWidth: number;
    dataIndex: SortableColumnKey;
  }) => {
    const isActive = sortBy === dataIndex;
    const currentOrder = isActive ? sortOrder : null;

    return (
      <button
        type="button"
        onClick={() => handleSort(dataIndex)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
          textAlign: "left",
        }}
        title={title}
      >
        <span
          style={{
            maxWidth: maxWidth - 26,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1,
          }}
        >
          <CaretUpOutlined
            style={{
              fontSize: 10,
              color: currentOrder === "ascend" ? "#1677ff" : "#bfbfbf",
            }}
          />
          <CaretDownOutlined
            style={{
              fontSize: 10,
              color: currentOrder === "descend" ? "#1677ff" : "#bfbfbf",
            }}
          />
        </span>
      </button>
    );
  };

  async function getProjectData() {
    try {
      setIsLoading(true);

      const sortParams =
        sortBy && sortOrder
          ? { SortBy: sortBy, SortDesc: sortOrder === "descend" }
          : sortBy
            ? { SortBy: sortBy, SortDesc: false }
            : {};

      const result = await GetProjects({
        query: {
          ...filters,
          page: currentPage,
          pageSize,
          ...sortParams,
        },
      });
      
      const transformedData = (result.data || [])
        .filter((item: any) => item != null)
        .map((item: any, index: number) => {
          const labelsArray = Array.isArray(item?.labels) ? item.labels : [];
          const normalizedLabelIds = Array.isArray(item?.labelIds)
            ? item.labelIds
                .map((id: any) =>
                  id !== null && id !== undefined ? String(id) : null
                )
                .filter((id: string | null): id is string => Boolean(id))
            : labelsArray
                .map((label: any) =>
                  label?.id !== null && label?.id !== undefined
                    ? String(label.id)
                    : null
                )
                .filter((id: string | null): id is string => Boolean(id));

          return {
            key: index + 1,
            Id: item?.id || null,
            Code: item?.code || "N/A",
            Labels: labelsArray,
            LabelIds: normalizedLabelIds,
            Title: item?.title || "Başlık Yok",
            PlannedStartDate: formatDate(item?.plannedStartDate),
            PlannedDeadLine: formatDate(item?.plannedDeadline || item?.plannedDeadLine),
            PlannedHours: typeof item?.plannedHours === "number" ? item.plannedHours : (typeof item?.plannedHours === "number" ? item.plannedHours : 0),
            StartedAt: formatDateTime(item?.startedAt),
            EndAt: formatDateTime(item?.endAt),
            Status: mapStatusToString(item?.status),
            Priority: item?.priority || "Düşük",
            // Store raw values for editing
            rawPlannedStartDate: item?.plannedStartDate || null,
            rawPlannedDeadline: item?.plannedDeadline || item?.plannedDeadLine || null,
            rawStartedAt: item?.startedAt || null,
            rawEndAt: item?.endAt || null,
            rawStatus: typeof item?.status === "number" ? item.status : null,
          };
        });
      
      setProjects(transformedData);
      setTotalItems(result.totalRecords || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setProjects([]);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getProjectData();
  }, [filters, pageSize, currentPage, refreshTrigger, sortBy, sortOrder]);

  const columns: ColumnsType<any> = [
    {
      title: <SortableHeader title="Kod" maxWidth={130} dataIndex="Code" />,
      dataIndex: "Code",
      key: "Code",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Link to={`/pm-module/projects/${encodeURIComponent(text)}`} title={text}>
          {text}
        </Link>
      ),
    },
    {
      title: <SortableHeader title="Etiketler" maxWidth={200} dataIndex="Labels" />,
      dataIndex: "Labels",
      key: "Labels",
      width: 120,
      render: (labels: any[]) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {labels && labels.length > 0 ? (
            labels.map((label: any) => (
              <Tooltip 
                key={label.id} 
                title={label.description || label.name}
                placement="top"
              >
                <Tag
                  color={label.color}
                  style={{
                    margin: 0,
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {label.name}
                </Tag>
              </Tooltip>
            ))
          ) : (
            <span style={{ color: "#999" }}>-</span>
          )}
        </div>
      ),
    },
    {
      title: <SortableHeader title="Başlık" maxWidth={250} dataIndex="Title" />,
      dataIndex: "Title",
      key: "Title",
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: (
        <SortableHeader
          title="Planlanan Başlangıç Tarihi"
          maxWidth={170}
          dataIndex="PlannedStartDate"
        />
      ),
      dataIndex: "PlannedStartDate",
      key: "PlannedStartDate",
      width: 170,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: (
        <SortableHeader
          title="Planlanan Bitiş Tarihi"
          maxWidth={170}
          dataIndex="PlannedDeadLine"
        />
      ),
      dataIndex: "PlannedDeadLine",
      key: "PlannedDeadLine",
      width: 170,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: <SortableHeader title="Planlanan Saat" maxWidth={120} dataIndex="PlannedHours" />,
      dataIndex: "PlannedHours",
      key: "PlannedHours",
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text: number) => (
        <span title={text?.toString()}>{text} saat</span>
      ),
    },
    {
      title: <SortableHeader title="Başlangıç Zamanı" maxWidth={150} dataIndex="StartedAt" />,
      dataIndex: "StartedAt",
      key: "StartedAt",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <span title={text || "Başlanmadı"}>{text || "-"}</span>
      ),
    },
    {
      title: <SortableHeader title="Bitiş Zamanı" maxWidth={150} dataIndex="EndAt" />,
      dataIndex: "EndAt",
      key: "EndAt",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <span title={text || "Devam ediyor"}>{text || "-"}</span>
      ),
    },
    {
      title: <SortableHeader title="Durum" maxWidth={120} dataIndex="Status" />,
      dataIndex: "Status",
      key: "Status",
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => {
        const color =
          text === "Tamamlandı"
            ? "#52c41a"
            : text === "Devam Ediyor"
              ? "#1890ff"
              : text === "Beklemede"
                ? "#faad14"
                : "#666";
        return (
          <span title={text} style={{ color }}>
            {text}
          </span>
        );
      },
    },
    {
      title: <SortableHeader title="Öncelik" maxWidth={100} dataIndex="Priority" />,
      dataIndex: "Priority",
      key: "Priority",
      width: 100,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => {
        const color =
          text === "Kritik"
            ? "#ff4d4f"
            : text === "Yüksek"
              ? "#fa8c16"
              : text === "Orta"
                ? "#1890ff"
                : text === "Düşük"
                  ? "#52c41a"
                  : "#666";
        return (
          <span title={text} style={{ color, fontWeight: "bold" }}>
            {text}
          </span>
        );
      },
    },
  ];

  function onRowClick(record: any) {
    setSelectedProject(record);
  }

  return (
    <>
      {isLoading === true ? (
        <div className="h-[50vh] flex justify-center items-center ">
          <Spinner />
        </div>
      ) : (
        <Table
          dataSource={projects}
          columns={columns}
          bordered
          size="small"
          scroll={{ x: 1200, y: "35vh" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ["50", "100", "150", "200"],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 50);
            },
            onShowSizeChange: (_current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            },
          }}
          onRow={(record, rowIndex) => {
            const isSelected = selectedProject?.key === record.key;

            return {
              onClick: () => {
                console.log("Row clicked:", record, "\n", rowIndex);
                onRowClick(record);
              },
              style: {
                backgroundColor: isSelected ? "#E6F4FF" : "transparent",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              },
              onMouseEnter: e => {
                if (isSelected) {
                  e.currentTarget.style.backgroundColor = "#D6E4FF";
                } else {
                  e.currentTarget.style.backgroundColor = "#F1F5FF";
                }
              },
              onMouseLeave: e => {
                if (isSelected) {
                  e.currentTarget.style.backgroundColor = "#E6F4FF";
                } else {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              },
            };
          }}
        />
      )}
    </>
  );
}
