import { Table } from "antd";
import { useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import { useTasksStore } from "@/store/zustand/tasks-store";
import { GetTasks } from "@/services/tasks/get-tasks";
import Spinner from "../spinner";
import { formatDateTime } from "@/utils/retype";

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
      console.log("filters in table:", filters);
      setIsLoading(true);
      const response = await GetTasks({
        query: { ...filters, page: currentPage, pageSize: pageSize },
      });
      
      console.log("Task API response:", response);
      
      // Backend response structure: { result: { data: [], totalRecords: 240 } }
      const result = response.result || response;
      const taskData = result.data || [];
      const transformedData = taskData
        .filter((item: any) => item != null)
        .map((item: any, index: number) => ({
          key: index + 1,
          Id: item?.id || null,
          Code: item?.code || null,
          ProjectId: item?.projectId || null,
          ProjectCode: item?.projectCode || null,
          ParentTaskId: item?.parentTaskId || null,
          Title: item?.title || "Başlık Yok",
          Description: item?.description || "-",
          Status: item?.status || "Todo",
          CreatedAt: item?.createdAt || "-",
          CreatedById: item?.createdById || null,
          UpdatedAt: item?.updatedAt || null,
          UpdatedById: item?.updatedById || null,
          PlannedHours: item?.plannedHours || null,
          ActualHours: item?.actualHours || null,
          AssignedUsers: item?.assignedUsers || [],
        }));
            
      setTasks(transformedData);
      setTotalItems(result.totalRecords || 0);
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
      dataIndex: "Code",
      key: "Code",
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text || "-"}</span>,
    },
    {
      title: <HeaderWithTooltip title="Başlık" maxWidth={250} />,
      dataIndex: "Title",
      key: "Title",
      width: 250,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: <HeaderWithTooltip title="Açıklama" maxWidth={200} />,
      dataIndex: "Description",
      key: "Description",
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: <HeaderWithTooltip title="Proje Kodu" maxWidth={100} />,
      dataIndex: "ProjectCode",
      key: "ProjectCode",
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
      dataIndex: "Status",
      key: "Status",
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
                : text;
        return (
          <span title={label} style={{fontWeight: "bold" }}>
            {label}
          </span>
        );
      },
    },
    {
      title: <HeaderWithTooltip title="Planlanan Saat" maxWidth={130} />,
      dataIndex: "PlannedHours",
      key: "PlannedHours",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      render: (text: number) => (
        <span title={text?.toString()}>{text || "-"}</span>
      ),
    },
    {
      title: <HeaderWithTooltip title="Gerçek Saat" maxWidth={120} />,
      dataIndex: "ActualHours",
      key: "ActualHours",
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
      dataIndex: "CreatedAt",
      key: "CreatedAt",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{formatDateTime(text)}</span>,
    },
  ];

  function onRowClick(record: any) {
    console.log(record);
    
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
            const isSelected = selectedTask?.key === record.key;

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
