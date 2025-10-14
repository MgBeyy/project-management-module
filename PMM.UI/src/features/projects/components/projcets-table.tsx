import { Table } from "antd";
import { useEffect } from "react";
import type { ColumnsType } from "antd/es/table";
import { GetProjects } from "../services/get-projects";
import Spinner from "../../../components/spinner";
import { useProjectsStore } from "@/store/zustand/projects-store";

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
    setProjects,
    setSelectedProject,
    setCurrentPage,
    setPageSize,
    setTotalItems,
    setIsLoading,
  } = useProjectsStore();

  async function getProjectData() {
    try {
      console.log("filters in table:", filters);
      setIsLoading(true);
      const result = await GetProjects({
        query: { ...filters, page: currentPage, pageSize: pageSize },
      });
      
      const transformedData = (result.data || [])
        .filter((item: any) => item != null)
        .map((item: any, index: number) => ({
          key: index + 1,
          Id: item?.id || null,
          Code: item?.code || "N/A",
          Title: item?.title || "Başlık Yok",
          PlannedStartDate: item?.plannedStartDate || "-",
          PlannedDeadLine: item?.plannedDeadLine || "-",
          PlannedHourse: typeof item?.plannedHourse === "number" ? item.plannedHourse : 0,
          StartedAt: item?.startedAt || null,
          EndAt: item?.endAt || null,
          Status: item?.status || "Belirtilmemiş",
          Priority: item?.priority || "Düşük",
        }));
      
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
      title: <HeaderWithTooltip title="Kod" maxWidth={130} />,
      dataIndex: "Code",
      key: "Code",
      width: 130,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => <span title={text}>{text}</span>,
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
      title: (
        <HeaderWithTooltip title="Planlanan Başlangıç Tarihi" maxWidth={170} />
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
        <HeaderWithTooltip title="Planlanan Bitiş Tarihi" maxWidth={170} />
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
      title: <HeaderWithTooltip title="Planlanan Saat" maxWidth={120} />,
      dataIndex: "PlannedHourse",
      key: "PlannedHourse",
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (text: number) => (
        <span title={text?.toString()}>{text} saat</span>
      ),
    },
    {
      title: <HeaderWithTooltip title="Başlangıç Zamanı" maxWidth={150} />,
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
      title: <HeaderWithTooltip title="Bitiş Zamanı" maxWidth={150} />,
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
      title: <HeaderWithTooltip title="Durum" maxWidth={120} />,
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
      title: <HeaderWithTooltip title="Öncelik" maxWidth={100} />,
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
