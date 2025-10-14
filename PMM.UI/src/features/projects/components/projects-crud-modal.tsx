import { Button, Divider } from "antd";
import { useState } from "react";
import type { ConfigProviderProps } from "antd";
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineDelete,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import DeleteConfirmModal from "./modals/delete-confirm-modal";
import UpdateProjectModal from "./modals/update-project-modal";
import { deleteProject } from "../services/delete-project";
import { useProjectsStore } from "@/store/zustand/projects-store";
import { useNotification } from "@/hooks/useNotification";

type SizeType = ConfigProviderProps["componentSize"];

export default function CrudModal() {
  const [size] = useState<SizeType>("middle");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const notification  = useNotification();
  
  const { selectedProject, clearSelectedProject, triggerRefresh } = useProjectsStore();

  const handleUpdateClick = () => {
    if (!selectedProject || !selectedProject.Code) {
      notification.warning("Uyarı", "Lütfen güncellemek için bir proje seçin.");
      return;
    }
    setUpdateModalVisible(true);
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
      notification.error("Hata", error?.message || "Proje silinirken bir hata oluştu.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const handleUpdateSuccess = () => {
    triggerRefresh();
  };

  return (
    <>
      <div className="m-4 flex items-center justify-around rounded-3xl bg-[#F1F5FF] gap-4">
        <span>Projeler</span>
        <Divider type="vertical" className="h-6" />
        <Link to="/pm-module/projects/create">
          <Button type="primary" icon={<AiOutlinePlus />} size={size} />
        </Link>
        <Button 
          type="primary" 
          icon={<AiOutlineEdit />} 
          size={size}
          onClick={handleUpdateClick}
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

      <UpdateProjectModal
        visible={updateModalVisible}
        onClose={() => setUpdateModalVisible(false)}
        onSuccess={handleUpdateSuccess}
        projectData={selectedProject}
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
