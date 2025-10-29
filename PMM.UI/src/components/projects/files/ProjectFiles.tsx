// src/components/projects/files/ProjectFiles.tsx
import { useCallback, useEffect, useState, KeyboardEvent } from "react";
import { Button, Image, Spin } from "antd";
import {
  AiOutlineCloudUpload,
  AiOutlineFile,
  AiOutlineFileExcel,
  AiOutlineFilePdf,
  AiOutlineFileText,
  AiOutlineFileWord,
  AiOutlineFileZip,
} from "react-icons/ai";
import { showNotification } from "@/utils/notification";
import { getProjectFiles } from "@/services/files/get-project-files";
import { uploadProjectFile } from "@/services/files/upload-project-file";
import { downloadProjectFile } from "@/services/files/download-project-file";
import type { ProjectFileDto } from "@/types";
import { saveAs } from "file-saver";

/** Helpers (bileşene özel kalsın ki parent sadeleşsin) */
const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "webp",
  "svg",
  "tiff",
  "ico",
]);

const extractExtension = (value?: string | null): string | null => {
  if (!value || typeof value !== "string") return null;
  const sanitized = value.split(/[?#]/)[0];
  const match = /\.([a-zA-Z0-9]+)$/.exec(sanitized);
  return match ? match[1].toLowerCase() : null;
};

const resolveFileExtension = (file: ProjectFileDto): string | null => {
  return extractExtension(file.file) ?? extractExtension(file.title) ?? null;
};

const isImageFile = (file: ProjectFileDto): boolean => {
  const ext = resolveFileExtension(file);
  return Boolean(ext && IMAGE_EXTENSIONS.has(ext));
};

const getFileIconByExtension = (extension: string | null) => {
  const baseClass = "h-8 w-8";
  switch (extension) {
    case "pdf":
      return <AiOutlineFilePdf className={baseClass} />;
    case "doc":
    case "docx":
      return <AiOutlineFileWord className={baseClass} />;
    case "xls":
    case "xlsx":
    case "csv":
      return <AiOutlineFileExcel className={baseClass} />;
    case "zip":
    case "rar":
    case "7z":
      return <AiOutlineFileZip className={baseClass} />;
    case "txt":
    case "md":
    case "json":
      return <AiOutlineFileText className={baseClass} />;
    default:
      return <AiOutlineFile className={baseClass} />;
  }
};

type ProjectFilesProps = {
  /** Proje ID; yoksa yükleme kapalı olur ve uyarı gösterilir */
  projectId: number | null;
  /** Parent edit modda mı? (true => yükleme açık) */
  editable?: boolean;
  /** İsteğe bağlı class */
  className?: string;
  /** Dosya başarıyla yüklendiğinde tetiklenir (opsiyonel) */
  onUploaded?: (file: ProjectFileDto) => void;
};

export default function ProjectFiles({
  projectId,
  editable = false,
  className,
  onUploaded,
}: ProjectFilesProps) {
  const [files, setFiles] = useState<ProjectFileDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const canOperate = Boolean(projectId);

  const loadFiles = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { files } = await getProjectFiles({ projectId, pageSize: 100 });
      setFiles(files);
    } catch (error) {
      console.error("Proje dosyaları yüklenirken hata:", error);
      showNotification.error("Dosyalar yüklenemedi", "Proje dosyaları yüklenirken bir hata oluştu.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      setFiles([]);
      setLoading(false);
      return;
    }
    loadFiles();
  }, [projectId, loadFiles]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!projectId) {
        showNotification.error("Proje bulunamadı", "Dosya yüklemek için önce projeyi seçin.");
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      try {
        const uploaded = await uploadProjectFile({
          projectId,
          file,
          title: file.name,
          onProgress: (p) => setUploadProgress(p),
        });
        showNotification.success("Dosya yüklendi", `"${uploaded.title}" başarıyla yüklendi.`);
        onUploaded?.(uploaded);
        await loadFiles();
      } catch (error) {
        console.error("Dosya yükleme hatası:", error);
        showNotification.error("Dosya yüklenemedi", "Dosya yüklenirken bir hata oluştu.");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [projectId, loadFiles, onUploaded]
  );

  const handleFileDownload = useCallback(async (file: ProjectFileDto) => {
    try {
      const { blob, fileName } = await downloadProjectFile(file.id);
      const resolvedName = fileName || file.title || `project-file-${file.id}`;
      saveAs(blob, resolvedName);
    } catch (error) {
      console.error("Dosya indirme hatası:", error);
      showNotification.error("Dosya indirilemedi", "Dosya indirilirken bir hata oluştu.");
    }
  }, []);

  // drag-n-drop
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!editable || !canOperate) return;
    setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!editable || !canOperate) return;
    setDragOver(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!editable || !canOperate) return;
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0]);
  };
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) handleFileUpload(files[0]);
    e.target.value = "";
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-2 pt-0 transition-colors duration-200 ${className || ""}`}
      style={{
        borderColor: dragOver ? "#1890ff" : "#d9d9d9",
        backgroundColor: dragOver ? "#f0f8ff" : "transparent",
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {!canOperate && (
        <div className="text-center py-6 text-gray-500">Önce bir proje seçin</div>
      )}

      {canOperate && uploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Dosya yükleniyor...</span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {canOperate && editable && !uploading && (
        <div className="text-center">
          <AiOutlineCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-0" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Dosyalarınızı sürükleyip bırakın veya</p>
            <div className="flex justify-center mb-0">
              <Button
                type="primary"
                size="small"
                onClick={() => document.getElementById("project-files-input")?.click()}
              >
                Dosya Seç
              </Button>
            </div>
            <input
              id="project-files-input"
              type="file"
              className="hidden"
              onChange={onSelectFile}
              accept="*/*"
            />
          </div>
        </div>
      )}

      {canOperate && (
        <div className="mt-2">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Spin size="small" />
              <span className="ml-2">Dosyalar yükleniyor...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {editable ? "Henüz dosya yüklenmemiş" : "Dosya bulunmuyor"}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto">
              {files.map((file) => {
                const extension = resolveFileExtension(file);
                const displayName = file.title || `Dosya #${file.id}`;
                const imagePreview = isImageFile(file);
                const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleFileDownload(file);
                  }
                };
                return (
                  <div
                    key={file.id}
                    role="button"
                    tabIndex={0}
                    className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-500 hover:shadow-md focus:border-blue-500 focus:shadow-md focus:outline-none flex-shrink-0 w-32"
                    onClick={() => handleFileDownload(file)}
                    onKeyDown={handleKeyDown}
                    title="İndirmek için tıklayın"
                  >
                    <div className="flex items-center justify-center">
                      {imagePreview ? (
                        <Image
                          src={`${import.meta.env.VITE_APP_API_URL}${file.file}`}
                          alt={displayName}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-md object-cover"
                          preview={false}
                        />
                      ) : (
                        <span className="flex h-16 w-16 items-center justify-center rounded-md bg-blue-50 text-blue-500">
                          {getFileIconByExtension(extension)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="truncate text-sm font-medium text-gray-900" title={displayName}>
                        {displayName}
                      </span>
                      {extension && (
                        <span className="text-xs uppercase text-gray-500">.{extension}</span>
                      )}
                      {file.description && (
                        <span className="text-xs text-gray-500">{file.description}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
