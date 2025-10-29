import { Table, Tag, Tooltip } from "antd";
import { useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { GetTasks } from "@/services/tasks/get-tasks";
import Spinner from "../common/spinner";
import { formatDateTime } from "@/utils/retype";
import { TaskDto } from "@/types";

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
        query: { ...filters, page: currentPage, pageSize: pageSize },
      });
      const taskData = response.data || [];
      console.log(taskData);
      
      setTasks(taskData);
      
      setTotalItems(response.totalRecords || 0);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching task data:", error);
      setTasks([]);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getTaskData();
  }, [filters, pageSize, currentPage, refreshTrigger]);

  const HeaderWithTooltip = ({
    title,
    maxWidth,
  }: {
    title: string;
    maxWidth: number;
  }) => (
    <div
      style={{
        maxWidth: maxWidth - 20,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      title={title}
    >
      {title}
    </div>
  );

  const columns: ColumnsType<any> = [
    {
      title: <HeaderWithTooltip title="Görev Kodu" maxWidth={120} />,
      dataIndex: "code",
      key: "code",
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: <HeaderWithTooltip title="Başlık" maxWidth={250} />,
      dataIndex: "title",
      key: "title",
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: <HeaderWithTooltip title="Açıklama" maxWidth={200} />,
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: <HeaderWithTooltip title="Etiketler" maxWidth={200} />,
      dataIndex: "labels",
      key: "labels",
      width: 130,
      render: (labels: any[]) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {Array.isArray(labels) && labels.length > 0 ? (
            labels.map((label: any) => (
              <Tooltip
                key={label?.id ?? label?.name}
                title={label?.description || label?.name}
                placement="top"
              >
                <Tag
                  color={label?.color}
                  style={{
                    margin: 0,
                    borderRadius: "4px",
                    cursor: "default",
                  }}
                >
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
      ellipsis: {
        showTitle: false,
      },
      render: (text: number) => <span title={text?.toString()}>
        <a href={`/pm-module/projects/${text}`}>
        {text}
        </a>
        </span>,
    },
    {
      title: <HeaderWithTooltip title="Durum" maxWidth={120} />,
      dataIndex: "status",
      key: "status",
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => {
        const label =
          text === "Done"
            ? "Tamamlandı"
            : text === "InProgress"
              ? "Devam Ediyor"
              : text === "Todo"
                ? "Yapılacak"
                : text === "Inactive"
                  ? "Pasif"
                  : text;
        return (
          <span title={label} style={{fontWeight: "bold" }}>
            {label}
          </span>
        );
      },
    },
    {
      title: <HeaderWithTooltip title="Planlanan Çalışma Saati" maxWidth={130} />,
      dataIndex: "plannedHours",
      key: "plannedHours",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      render: (text: number) => (
        <span title={text?.toString()}>{text || "-"}</span>
      ),
    },
    {
      title: <HeaderWithTooltip title="Gerçek Çalışma Saati" maxWidth={120} />,
      dataIndex: "actualHours",
      key: "actualHours",
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text: number) => (
        <span title={text?.toString()}>{text || "-"}</span>
      ),
    },
    {
      title: <HeaderWithTooltip title="Oluşturulma" maxWidth={150} />,
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{formatDateTime(text)}</span>,
    },
  ];

  function onRowClick(record: TaskDto) {    
    setSelectedTask(record);
  }

  return (
    <>
      {isLoading === true ? (
        <div className="h-[50vh] flex justify-center items-center ">
          <Spinner />
        </div>
      ) : (
        <Table
          dataSource={tasks}
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
            const isSelected = selectedTask?.id === record.id;

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
