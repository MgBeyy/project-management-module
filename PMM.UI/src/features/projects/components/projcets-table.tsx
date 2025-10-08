import { Table } from "antd";
import { useEffect, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { GetProjects } from "../services/get-projects";
import Spinner from "../../../components/spinner";
import { useSelector } from "react-redux";
export default function CustomTable() {
  // const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const filtersValue = useSelector((state: any) => state.projects.value);

  useEffect(() => {
    async function getProjectData() {
      try {
        const resulte = await GetProjects({
          query: filtersValue,
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
  }, [filtersValue]);
  const dataSource = (data || [])
    .filter(item => item != null) // null/undefined öğeleri filtrele
    .map((item, index) => {
      // ✅ Her bir property için güvenli erişim
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

  // Header component with tooltip for long titles
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

  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
  //     console.log("Selected Row Keys:", selectedRowKeys);
  //     console.log("Selected Rows:", selectedRows);
  //     setSelectedRowKeys(selectedRowKeys);
  //   },
  //   onSelect: (record: any, selected: boolean, selectedRows: any[]) => {
  //     console.log(
  //       "Record:",
  //       record,
  //       "Selected:",
  //       selected,
  //       "Selected Rows:",
  //       selectedRows
  //     );
  //   },
  //   onSelectAll: (
  //     selected: boolean,
  //     selectedRows: any[],
  //     changeRows: any[]
  //   ) => {
  //     console.log(
  //       "Select All:",
  //       selected,
  //       "Selected Rows:",
  //       selectedRows,
  //       "Change Rows:",
  //       changeRows
  //     );
  //   },
  // };
  const [selectedRowKey, setSelectedRowKey] = useState(null);

  function onRowClick(record: any) {
    setSelectedRowKey(record.key); // ya da record.key, veri yapına bağlı
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
          // rowSelection={rowSelection}

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
              setPageSize(size || 10);
            },
            onShowSizeChange: (_current, size) => {
              setCurrentPage(1); // Reset to first page when changing page size
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
              // ✅ Sadece inline style kullanıyoruz
              style: {
                backgroundColor: isSelected ? "#E6F4FF" : "transparent", // ✅ transparent kullan
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              },
              onMouseEnter: e => {
                if (isSelected) {
                  e.currentTarget.style.backgroundColor = "#D6E4FF"; // Seçili + hover
                } else {
                  e.currentTarget.style.backgroundColor = "#F1F5FF"; // ✅ Normal hover
                }
              },
              onMouseLeave: e => {
                if (isSelected) {
                  e.currentTarget.style.backgroundColor = "#E6F4FF"; // Seçili rengine dön
                } else {
                  e.currentTarget.style.backgroundColor = "transparent"; // ✅ transparent'a dön
                }
              },
            };
          }}
        />
      )}
    </>
  );
}
