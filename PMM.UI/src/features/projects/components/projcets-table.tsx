import { Table } from "antd";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { GetProjects } from "../services/get-projects";
import Spinner from "../../../components/spinner";
import { useDispatch, useSelector } from "react-redux";
import { editProjectsRowInfo } from "@/store/slices/projects-select-row-info-slice";
export default function CustomTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filtersValue = useSelector((state: any) => state.projects.value);

  useEffect(() => {
    async function getProjectData() {
      try {
        console.log("filtersValue in table:", filtersValue);
        const resulte = await GetProjects({
          query: { ...filtersValue, page: currentPage, pageSize: pageSize },
        });
        setTotalItems(resulte.totalRecords || 0);
        setData(resulte.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setData([]);
      }
    }
    getProjectData();
  }, [filtersValue, pageSize, currentPage]);
  const dataSource = (data || [])
    .filter(item => item != null)
    .map((item, index) => {
      return {
        key: index + 1,
        Code: item?.code || "N/A",
        Title: item?.title || "Başlık Yok",
        PlannedStartDate: item?.plannedStartDate || "-",
        PlannedDeadLine: item?.plannedDeadLine || "-",
        PlannedHourse:
          typeof item?.plannedHourse === "number" ? item.plannedHourse : 0,
        StartedAt: item?.startedAt || null,
        EndAt: item?.endAt || null,
        Status: item?.status || "Belirtilmemiş",
        Priority: item?.priority || "Düşük",
      };
    });

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

  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const dispatch = useDispatch();
  function onRowClick(record: any) {
    setSelectedRowKey(record.key);
    dispatch(editProjectsRowInfo(record));
  }

  return (
    <>
      {isLoading === true ? (
        <div className="h-[50vh] flex justify-center items-center ">
          <Spinner />
        </div>
      ) : (
        <Table
          dataSource={dataSource}
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
            const isSelected = record.key === selectedRowKey;

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
