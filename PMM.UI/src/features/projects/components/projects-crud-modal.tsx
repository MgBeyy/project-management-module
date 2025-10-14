import { Button, Divider, notification } from "antd";
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
import { deleteProject } from "../services/delete-project";
import { useProjectsStore } from "@/store/zustand/projects-store";

type SizeType = ConfigProviderProps["componentSize"];

export default function CrudModal() {
  const [size] = useState<SizeType>("middle");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { selectedProject, clearSelectedProject, triggerRefresh } = useProjectsStore();

  const handleDeleteClick = () => {
    if (!selectedProject || !selectedProject.Code) {
      notification.warning({
        message: "Uyarı",
        description: "Lütfen silmek için bir proje seçin.",
        placement: "topRight",
      });
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
      
      notification.success({
        message: "Başarılı",
        description: `"${selectedProject.Title}" projesi başarıyla silindi.`,
        placement: "topRight",
      });
      setDeleteModalVisible(false);
      clearSelectedProject();
      triggerRefresh(); // Tabloyu yenile
      

    } catch (error: any) {
      console.error("Proje silinirken hata:", error);
      notification.error({
        message: "Hata",
        description: error.response?.data?.message || "Proje silinirken bir hata oluştu.",
        placement: "topRight",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  return (
    <>
      <div className="m-4 flex items-center justify-around rounded-3xl bg-[#F1F5FF] gap-4">
        <span>Projeler</span>
        <Divider type="vertical" className="h-6" />
        <Link to="/pm-module/projects/create">
          <Button type="primary" icon={<AiOutlinePlus />} size={size} />
        </Link>
        <Link to="/pm-module/projects/edit">
          <Button type="primary" icon={<AiOutlineEdit />} size={size} />
        </Link>
        <Link to="/pm-module/projects/view">
          <Button type="primary" icon={<AiOutlineEye />} size={size} />
        </Link>
        <Button
          type="primary"
          icon={<AiOutlineDelete />}
          size={size}
          onClick={handleDeleteClick}
          loading={isDeleting}
          danger
        />
      </div>

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        projectTitle={selectedProject?.Title}
      />
    </>
  );
}
