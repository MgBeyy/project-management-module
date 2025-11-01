import { Table, Tag, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";

import {
  ProjectSortKey,
  ProjectSortOrder,
  useProjectsStore,
} from "@/store/zustand/projects-store";
import { GetProjects } from "@/services/projects/get-projects";
import Spinner from "../common/spinner";
import { fromMillis } from "@/utils/retype";
import { ResizableTitle } from "../common/resizable";

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
      setProjects(result.data || []);
      setTotalItems(result.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching project data:", error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pageSize, currentPage, refreshTrigger, sortBy, sortOrder]);

  /** Başlangıç sütunları */
  const baseColumns = useMemo<ColumnsType<any>>(
    () => [
      {
        title: <SortableHeader title="Kod" maxWidth={130} dataIndex="code" />,
        dataIndex: "code",
        key: "code",
        width: 130,
        ellipsis: { showTitle: false },
        render: (text: string, record: any) => (
          <Link to={`/pm-module/projects/${record.id}`} title={text}>
            {text}
          </Link>
        ),
      },
      {
        title: <SortableHeader title="Etiketler" maxWidth={200} dataIndex="labels" />,
        dataIndex: "labels",
        key: "labels",
        width: 120,
        render: (labels: any[]) => (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {labels && labels.length > 0 ? (
              labels.map((label: any) => (
                <Tooltip key={label.id} title={label.description || label.name} placement="top">
                  <Tag color={label.color} style={{ margin: 0, borderRadius: "4px", cursor: "pointer" }}>
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
        title: <SortableHeader title="Başlık" maxWidth={250} dataIndex="title" />,
        dataIndex: "title",
        key: "title",
        width: 250,
        ellipsis: { showTitle: false },
        render: (text: string) => <span title={text}>{text}</span>,
      },
      {
        title: (
          <SortableHeader title="Planlanan Başlangıç Tarihi" maxWidth={170} dataIndex="plannedStartDate" />
        ),
        dataIndex: "plannedStartDate",
        key: "plannedStartDate",
        width: 170,
        ellipsis: { showTitle: false },
        render: (text: string) => <span title={text}>{fromMillis(text)?.format("DD.MM.YYYY")}</span>,
      },
      {
        title: (
          <SortableHeader title="Planlanan Bitiş Tarihi" maxWidth={170} dataIndex="plannedDeadline" />
        ),
        dataIndex: "plannedDeadline",
        key: "plannedDeadline",
        width: 170,
        ellipsis: { showTitle: false },
        render: (text: string) => <span title={text}>{fromMillis(text)?.format("DD.MM.YYYY")}</span>,
      },
      {
        title: <SortableHeader title="Planlanan Çalışma Saati" maxWidth={120} dataIndex="plannedHours" />,
        dataIndex: "plannedHours",
        key: "plannedHours",
        width: 120,
        ellipsis: { showTitle: false },
        render: (text: number) => (
          <span title={text?.toString()}>{text === 0 || text === null ? "-" : text} saat</span>
        ),
      },
      {
        title: <SortableHeader title="Başlangıç Zamanı" maxWidth={150} dataIndex="startedAt" />,
        dataIndex: "startedAt",
        key: "startedAt",
        width: 150,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <span title={text || "Başlanmadı"}>{fromMillis(text)?.format("DD.MM.YYYY") || "Başlanmadı"}</span>
        ),
      },
      {
        title: <SortableHeader title="Bitiş Zamanı" maxWidth={150} dataIndex="endAt" />,
        dataIndex: "endAt",
        key: "endAt",
        width: 150,
        ellipsis: { showTitle: false },
        render: (text: string) => (
          <span title={text || "Devam ediyor"}>{fromMillis(text)?.format("DD.MM.YYYY") ?? ""}</span>
        ),
      },
      {
        title: <SortableHeader title="Durum" maxWidth={120} dataIndex="status" />,
        dataIndex: "status",
        key: "status",
        width: 120,
        ellipsis: { showTitle: false },
        render: (text: string) => {
          const label =
            text === "Active"
              ? "Aktif"
              : text === "Inactive"
              ? "Pasif"
              : text === "Planned"
              ? "Planlandı"
              : text === "Completed"
              ? "Tamamlandı"
              : text === "WaitingForApproval"
              ? "Onay Bekliyor"
              : "Bilinmiyor";
          return <span title={text} style={{ fontWeight: "bold" }}>{label}</span>;
        },
      },
      {
        title: <SortableHeader title="Öncelik" maxWidth={100} dataIndex="priority" />,
        dataIndex: "priority",
        key: "priority",
        width: 100,
        ellipsis: { showTitle: false },
        render: (text: string) => {
          const label =
            text === "High"
              ? "Yüksek"
              : text === "Regular"
              ? "Orta"
              : text === "Low"
              ? "Düşük"
              : "Bilinmiyor";
          return <span title={text} style={{ fontWeight: "bold" }}>{label}</span>;
        },
      },
    ],
    [sortBy, sortOrder]
  );

  /** Sütun genişliklerini state’te tutalım */
  const [cols, setCols] = useState(
    () =>
      baseColumns.map((c) => ({
        ...c,
        width: typeof c.width === "number" ? c.width : 150,
        minWidth: 80,
        maxWidth: 600,
      })) as ColumnsType<any>
  );

  // baseColumns değişirse (örn. sıralama başlığı render’ı) mevcut genişlikleri koru
  useEffect(() => {
    setCols((prev) =>
      baseColumns.map((bc) => {
        const match = prev.find((p: any) => p.key === (bc as any).key || p.dataIndex === (bc as any).dataIndex) as any;
        return {
          ...bc,
          width:
            typeof match?.width === "number"
              ? match.width
              : typeof (bc as any).width === "number"
              ? (bc as any).width
              : 150,
          minWidth: match?.minWidth ?? 80,
          maxWidth: match?.maxWidth ?? 600,
        };
      }) as ColumnsType<any>
    );
  }, [baseColumns]);

  /** Resize handler */
  const handleResize =
    (index: number) =>
    (_: unknown, { size }: { size: { width: number; height: number } }) => {
      setCols((prev) => {
        const next = [...prev];
        const col: any = { ...(next[index] as any) };
        const minW = col.minWidth ?? 80;
        const maxW = col.maxWidth ?? 600;
        col.width = Math.max(minW, Math.min(size.width, maxW));
        next[index] = col;
        return next as ColumnsType<any>;
      });
    };

  /** onHeaderCell ile ResizableTitle'a props ver */
  const resizableColumns = cols.map((col, index) => ({
    ...col,
    onHeaderCell: (column: any) => ({
      width: column.width,
      minWidth: column.minWidth,
      maxWidth: column.maxWidth,
      onResize: handleResize(index),
    }),
  }));

  function onRowClick(record: any) {
    setSelectedProject(record);
  }

  // scroll.x için toplam genişlik
  const totalWidth = resizableColumns.reduce(
    (sum: number, c: any) => sum + (typeof c.width === "number" ? c.width : 150),
    0
  );

  return (
    <>
      {isLoading ? (
        <div className="h-[50vh] flex justify-center items-center ">
          <Spinner />
        </div>
      ) : (
        <Table
          dataSource={projects}
          rowKey={(r) => r.id ?? r.code}
          columns={resizableColumns as any}
          bordered
          size="small"
          tableLayout="fixed"
          components={{
            header: { cell: ResizableTitle },
          }}
          scroll={{ x: totalWidth, y: "35vh" }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
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
            const isSelected = selectedProject?.id === record.id;

            return {
              onClick: () => {
                console.log("Row clicked:", record, "\n", rowIndex);
                onRowClick(record);
              },
              className: isSelected ? "selected-table-row" : "table-row-hover",
              style: isSelected
                ? {
                    backgroundColor: "#E6F4FF",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }
                : {
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  },
            };
          }}
        />
      )}
    </>
  );
}
