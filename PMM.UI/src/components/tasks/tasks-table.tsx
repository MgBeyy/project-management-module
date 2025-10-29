import { Table, Tag, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { GetTasks } from "@/services/tasks/get-tasks";
import Spinner from "../common/spinner";
import { formatDateTime } from "@/utils/retype";
import { TaskDto } from "@/types";
import { ResizableTitle } from "../common/resizable";


export default function TasksCustomTable() {
  const {
    tasks,
    selectedTask,
    currentPage,
    pageSize,
    totalItems,
    isLoading,
    filters,
    refreshTrigger,
    setTasks,
    setSelectedTask,
    setCurrentPage,
    setPageSize,
    setTotalItems,
    setIsLoading,
  } = useTasksStore();

  async function getTaskData() {
    try {
      setIsLoading(true);
      const response = await GetTasks({
        query: { ...filters, page: currentPage, pageSize },
      });
      setTasks(response.data || []);
      setTotalItems(response.totalRecords || 0);
    } catch (e) {
      console.error(e);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getTaskData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pageSize, currentPage, refreshTrigger]);

  const HeaderWithTooltip = ({ title, maxWidth }: { title: string; maxWidth: number }) => (
    <div style={{ maxWidth: maxWidth - 20, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={title}>
      {title}
    </div>
  );

  const baseColumns = useMemo<ColumnsType<any>>(
    () => [
      { title: <HeaderWithTooltip title="Görev Kodu" maxWidth={120} />, dataIndex: "code", key: "code", width: 120, ellipsis: { showTitle: false }, render: (t: string) => <span title={t}>{t || "-"}</span> },
      { title: <HeaderWithTooltip title="Başlık" maxWidth={250} />, dataIndex: "title", key: "title", width: 250, ellipsis: { showTitle: false }, render: (t: string) => <span title={t}>{t}</span> },
      { title: <HeaderWithTooltip title="Açıklama" maxWidth={200} />, dataIndex: "description", key: "description", width: 200, ellipsis: { showTitle: false }, render: (t: string) => <span title={t}>{t}</span> },
      {
        title: <HeaderWithTooltip title="Etiketler" maxWidth={200} />,
        dataIndex: "labels",
        key: "labels",
        width: 130,
        render: (labels: any[]) => (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {Array.isArray(labels) && labels.length ? (
              labels.map((label: any) => (
                <Tooltip key={label?.id ?? label?.name} title={label?.description || label?.name} placement="top">
                  <Tag color={label?.color} style={{ margin: 0, borderRadius: 4, cursor: "default" }}>
                    {label?.name ?? "-"}
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
        title: <HeaderWithTooltip title="Proje Kodu" maxWidth={100} />,
        dataIndex: "projectCode",
        key: "projectCode",
        width: 100,
        ellipsis: { showTitle: false },
        render: (n: number) => (
          <span title={n?.toString()}>
            <a href={`/pm-module/projects/${n}`}>{n}</a>
          </span>
        ),
      },
      {
        title: <HeaderWithTooltip title="Durum" maxWidth={120} />,
        dataIndex: "status",
        key: "status",
        width: 120,
        ellipsis: { showTitle: false },
        render: (t: string) => {
          const label = t === "Done" ? "Tamamlandı" : t === "InProgress" ? "Devam Ediyor" : t === "Todo" ? "Yapılacak" : t === "Inactive" ? "Pasif" : t;
          return <span title={label} style={{ fontWeight: "bold" }}>{label}</span>;
        },
      },
      { title: <HeaderWithTooltip title="Planlanan Çalışma Saati" maxWidth={130} />, dataIndex: "plannedHours", key: "plannedHours", width: 130, ellipsis: { showTitle: false }, render: (n: number) => <span title={n?.toString()}>{n || "-"}</span> },
      { title: <HeaderWithTooltip title="Gerçek Çalışma Saati" maxWidth={120} />, dataIndex: "actualHours", key: "actualHours", width: 120, ellipsis: { showTitle: false }, render: (n: number) => <span title={n?.toString()}>{n || "-"}</span> },
      { title: <HeaderWithTooltip title="Oluşturulma" maxWidth={150} />, dataIndex: "createdAt", key: "createdAt", width: 150, ellipsis: { showTitle: false }, render: (s: string) => <span title={s}>{formatDateTime(s)}</span> },
    ],
    []
  );

  // genişlik state’i
  const [cols, setCols] = useState(
    () =>
      baseColumns.map((c) => ({
        ...c,
        width: typeof c.width === "number" ? c.width : 150,
        minWidth: 80,
        maxWidth: 600,
      })) as ColumnsType<any>
  );

  useEffect(() => {
    setCols((prev) =>
      baseColumns.map((bc) => {
        const match = prev.find((p: any) => p.key === (bc as any).key || p.dataIndex === (bc as any).dataIndex) as any;
        return {
          ...bc,
          width: typeof match?.width === "number" ? match.width : (typeof (bc as any).width === "number" ? (bc as any).width : 150),
          minWidth: match?.minWidth ?? 80,
          maxWidth: match?.maxWidth ?? 600,
        };
      }) as ColumnsType<any>
    );
  }, [baseColumns]);

  const handleResize = (index: number) => (_: unknown, { size }: { size: { width: number; height: number } }) => {
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


  const resizableColumns = cols.map((col, index) => ({
    ...col,
    onHeaderCell: (column: any) => ({
      width: column.width,
      minWidth: column.minWidth,
      maxWidth: column.maxWidth,
      onResize: handleResize(index),
    }),
  }));

  function onRowClick(record: TaskDto) {
    setSelectedTask(record);
  }

  const totalWidth = resizableColumns.reduce((sum: number, c: any) => sum + (typeof c.width === "number" ? c.width : 150), 0);

  return isLoading ? (
    <div className="h-[50vh] flex justify-center items-center">
      <Spinner />
    </div>
  ) : (
    <Table
      dataSource={tasks}
      columns={resizableColumns as any}
      rowKey={(r) => r.id}
      bordered
      size="small"
      components={{
        header: {
          cell: ResizableTitle,
        },
      }}
      tableLayout="fixed"    
      scroll={{ x: totalWidth, y: "35vh" }}
      pagination={{
        current: currentPage,
        pageSize,
        total: totalItems,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ["50", "100", "150", "200"],
        onChange: (page, size) => {
          setCurrentPage(page);
          setPageSize(size || 50);
        },
        onShowSizeChange: (_c, size) => {
          setCurrentPage(1);
          setPageSize(size);
        },
      }}
      onRow={(record) => {
        const isSelected = selectedTask?.id === record.id;
        return {
          onClick: () => onRowClick(record),
          style: {
            backgroundColor: isSelected ? "#E6F4FF" : "transparent",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          },
          onMouseEnter: (e) => {
            e.currentTarget.style.backgroundColor = isSelected ? "#D6E4FF" : "#F1F5FF";
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.backgroundColor = isSelected ? "#E6F4FF" : "transparent";
          },
        };
      }}
    />
  );
}
