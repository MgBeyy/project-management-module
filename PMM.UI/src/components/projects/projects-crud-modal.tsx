import { Button, Divider, Dropdown } from "antd";
import { useState } from "react";
import type { ConfigProviderProps } from "antd";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineEye,
} from "react-icons/ai";
import DeleteConfirmModal from "./modals/delete-confirm-modal";
import CreateProjectModal from "./modals/create-project-modal";
import { useProjectsStore } from "@/store/zustand/projects-store";
import { useNotification } from "@/hooks/useNotification";
import { deleteProject } from "@/services/projects/delete-project";
import { ProjectDto } from "@/types";
import { DownOutlined } from "@ant-design/icons";
import { getReport } from "@/services/projects/get-report";
import { saveAs } from "file-saver";

type SizeType = ConfigProviderProps["componentSize"];

export default function CrudModal() {
  const [size] = useState<SizeType>("middle");
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const notification = useNotification();
  const { filters } = useProjectsStore();
  const [loadings, setLoadings] = useState<boolean[]>([false, false]);
  const { selectedProject, clearSelectedProject, triggerRefresh } = useProjectsStore();

  const handleCreateClick = () => {
    setModalMode('create');
    setProjectModalVisible(true);
  };

  const handleUpdateClick = () => {
    if (!selectedProject || !selectedProject.code) {
      notification.warning("Uyarı", "Lütfen güncellemek için bir proje seçin.");
      return;
    }
    setModalMode('edit');
    setProjectModalVisible(true);
  };

  const handleViewClick = () => {
    if (!selectedProject || !selectedProject.code) {
      notification.warning("Uyarı", "Lütfen görüntülemek için bir proje seçin.");
      return;
    }
    setModalMode('view');
    setProjectModalVisible(true);
  };

  const handleDeleteClick = () => {
    if (!selectedProject || !selectedProject.code) {
      notification.warning("Uyarı", "Lütfen silmek için bir proje seçin.");
      return;
    }
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject || !selectedProject.id) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(selectedProject.id);
      notification.success("Başarılı", `"${selectedProject.title}" projesi başarıyla silindi.`);
      setDeleteModalVisible(false);
      clearSelectedProject();
      triggerRefresh(); // Tabloyu yenile


    } catch (error: any) {
      console.error("Proje silinirken hata:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const handleProjectModalSuccess = () => {
    triggerRefresh();
  };

  const downloadMenu = [
    {
      key: '1',
      label: 'Excel 1',
      onClick: () => {
        getReport({ query: { ...filters, pageSize: null, page: null } }).then(({ blob, fileName }) => { saveAs(blob, fileName); });
      }
    },
    {
      key: '2',
      label: 'CSV 2',
      onClick: () => { console.log('CSV export clicked'); }
    },
  ];


  return (
    <>
      <div className="flex justify-between w-full">
        <div className="m-4 flex items-center justify-around rounded-3xl bg-[#F1F5FF] gap-4">
          <span>Projeler</span>
          <Divider type="vertical" className="h-6" />
          <Button
            type="primary"
            icon={<AiOutlinePlus />}
            size={size}
            onClick={handleCreateClick}
          />
          <Button
            type="primary"
            icon={<AiOutlineEdit />}
            size={size}
            onClick={handleUpdateClick}
          />
          <Button
            type="primary"
            icon={<AiOutlineEye />}
            size={size}
            onClick={handleViewClick}
          />
          <Button
            type="primary"
            icon={<AiOutlineDelete />}
            size={size}
            onClick={handleDeleteClick}
            loading={isDeleting}
            danger
          />
        </div>
        <Dropdown.Button
          icon={<DownOutlined />}
          loading={loadings[0]}
          menu={{ items: downloadMenu }}
          onClick={() => downloadMenu[0].onClick()}
          style={{ width: "auto" }}
          className="m-4"
        >
          Dışa Aktar
        </Dropdown.Button>


      </div>
      <CreateProjectModal
        visible={projectModalVisible}
        onClose={() => setProjectModalVisible(false)}
        onSuccess={handleProjectModalSuccess}
        projectData={selectedProject as ProjectDto}
        mode={modalMode}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        projectTitle={selectedProject?.title}
      />
    </>

  );
}
