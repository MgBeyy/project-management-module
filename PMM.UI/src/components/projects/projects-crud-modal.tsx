import { Button, Divider } from "antd";
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
import { ProjectData, useProjectsStore } from "@/store/zustand/projects-store";
import { useNotification } from "@/hooks/useNotification";
import { deleteProject } from "@/services/projects/delete-project";

type SizeType = ConfigProviderProps["componentSize"];

export default function CrudModal() {
  const [size] = useState<SizeType>("middle");
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const notification  = useNotification();
  
  const { selectedProject, clearSelectedProject, triggerRefresh } = useProjectsStore();

  const handleCreateClick = () => {
    setModalMode('create');
    setProjectModalVisible(true);
  };

  const handleUpdateClick = () => {
    if (!selectedProject || !selectedProject.Code) {
      notification.warning("Uyarı", "Lütfen güncellemek için bir proje seçin.");
      return;
    }
    setModalMode('edit');
    setProjectModalVisible(true);
  };
  
  const handleViewClick = () => {
    if (!selectedProject || !selectedProject.Code) {
      notification.warning("Uyarı", "Lütfen görüntülemek için bir proje seçin.");
      return;
    }
    setModalMode('view');
    setProjectModalVisible(true);
  };

  const handleDeleteClick = () => {
    if (!selectedProject || !selectedProject.Code) {
      notification.warning("Uyarı", "Lütfen silmek için bir proje seçin.");
      return;
    }
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject || !selectedProject.Id) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject(selectedProject.Id);
      notification.success("Başarılı", `"${selectedProject.Title}" projesi başarıyla silindi.`);
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

  return (
    <>
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

      <CreateProjectModal
        visible={projectModalVisible}
        onClose={() => setProjectModalVisible(false)}
        onSuccess={handleProjectModalSuccess}
        projectData={selectedProject as ProjectData}
        mode={modalMode}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        projectTitle={selectedProject?.Title}
      />
    </>
  );
}
