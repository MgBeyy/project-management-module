

import { List, Avatar, Progress, Tag, Button, Tree, Tabs } from 'antd';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, ProjectOutlined, FileTextOutlined, CheckSquareOutlined } from '@ant-design/icons';
import ProjectOrganizationDiagram from '../../components/projects/project-details/project-organization-diagram';

const projectData = {
  id: 1,
  code: 'PRJ-001',
  name: 'Proje Yönetim Modülü Geliştirme',
  description:
    'Bu proje, proje yönetimi için kapsamlı bir modül geliştirmeyi amaçlar. Görev atama, zaman takibi, raporlama ve ekip yönetimi özelliklerini içerir.',
  status: 'Devam Ediyor',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  progress: 65,
  priority: 'Yüksek',
  parentId: 900, // doğrudan parent id'si
  parentProject: {
    id: 900,
    code: 'PGM-900',
    name: 'Kurumsal PMO Programı',
    description:
      'Kurumsal düzeyde proje/portföy yönetimi süreçlerinin standartlaştırılması ve merkezi PMO araçlarının devreye alınması.',
    status: 'Devam Ediyor',
    startDate: '2024-10-01',
    endDate: '2026-03-31',
    progress: 58,
    priority: 'Yüksek',
    parentId: 800,
    // parent → parent (yukarı doğru recursive)
    parentProject: {
      id: 800,
      code: 'PRT-800',
      name: 'Dijital Dönüşüm Portföyü',
      description:
        'Şirket genelindeki dijital dönüşüm girişimlerinin portföy düzeyinde planlanması, finansmanı ve takibi.',
      status: 'Devam Ediyor',
      startDate: '2024-01-01',
      endDate: '2026-12-31',
      progress: 61,
      priority: 'Kritik',
      parentId: null,
      parentProject: null,
      // parent projelerde de task/subtask/activity var
      tasks: [
        {
          id: 8001,
          title: 'Portföy Strateji Uyum Kontrolü',
          status: 'Devam Ediyor',
          assignee: 'Selin Aras',
          priority: 'Yüksek',
          dueDate: '2025-11-15',
          estimatedHours: 40,
          loggedHours: 22,
          subtasks: [
            { id: 80011, title: 'Stratejik hedef matrisi', status: 'Tamamlandı' },
            { id: 80012, title: 'Girişim/ hedef eşleştirme', status: 'Devam Ediyor' },
          ],
          activities: [
            { id: 800111, description: 'Kick-off atölyesi', duration: '3 saat', date: '2025-09-29' },
            { id: 800112, description: 'İş birimleri görüşmeleri', duration: '5 saat', date: '2025-10-07' },
          ],
        },
        {
          id: 8002,
          title: 'Portföy Risk Değerlendirmesi',
          status: 'Devam Ediyor',
          assignee: 'Mert Ekinci',
          priority: 'Orta',
          dueDate: '2025-12-05',
          estimatedHours: 32,
          loggedHours: 10,
          subtasks: [
            { id: 80021, title: 'Risk kayıtları güncelleme', status: 'Devam Ediyor' },
            { id: 80022, title: 'Heatmap oluşturma', status: 'Bekliyor' },
          ],
          activities: [
            { id: 800211, description: 'Risk toplama oturumu', duration: '2 saat', date: '2025-10-10' },
          ],
        },
      ],
      members: [
        { id: 201, name: 'Selin Aras', role: 'Portfolio Manager', avatar: null },
        { id: 202, name: 'Mert Ekinci', role: 'Risk Analyst', avatar: null },
      ],
    },
    tasks: [
      {
        id: 9001,
        title: 'PMO Süreç Tanımı',
        status: 'Tamamlandı',
        assignee: 'Ebru Deniz',
        priority: 'Orta',
        dueDate: '2025-06-30',
        estimatedHours: 60,
        loggedHours: 62,
        subtasks: [
          { id: 90011, title: 'Şablon ve politikalar', status: 'Tamamlandı' },
          { id: 90012, title: 'Onay süreçleri', status: 'Tamamlandı' },
        ],
        activities: [
          { id: 900111, description: 'Süreç çalıştayı', duration: '4 saat', date: '2025-04-12' },
          { id: 900112, description: 'CIO onayı', duration: '1 saat', date: '2025-06-27' },
        ],
      },
      {
        id: 9002,
        title: 'Kaynak Planlama Çerçevesi',
        status: 'Devam Ediyor',
        assignee: 'Selin Aras',
        priority: 'Yüksek',
        dueDate: '2025-11-22',
        estimatedHours: 48,
        loggedHours: 18,
        subtasks: [
          { id: 90021, title: 'Yük tahmin modeli', status: 'Devam Ediyor' },
          { id: 90022, title: 'On-call politikası', status: 'Bekliyor' },
        ],
        activities: [
          { id: 900211, description: 'Modelleme toplantısı', duration: '2 saat', date: '2025-10-15' },
        ],
      },
    ],
    members: [
      { id: 301, name: 'Ebru Deniz', role: 'Program Manager', avatar: null },
      { id: 201, name: 'Selin Aras', role: 'Portfolio Manager', avatar: null },
    ],
  },

  // ↓↓↓ proje (id:1) için alt projeler (aşağı doğru recursive)
  subprojects: [
    {
      id: 101,
      code: 'PRJ-001-BE',
      name: 'Backend Modülü',
      status: 'Devam Ediyor',
      startDate: '2025-01-15',
      endDate: '2025-11-30',
      progress: 70,
      priority: 'Yüksek',
      parentId: 1,
      parentProject: null, // üstte already represented
      subprojects: [
        {
          id: 1011,
          code: 'PRJ-001-BE-SVC',
          name: 'Task Service (Mikroservis)',
          status: 'Devam Ediyor',
          startDate: '2025-08-01',
          endDate: '2025-11-15',
          progress: 65,
          priority: 'Yüksek',
          parentId: 101,
          parentProject: null,
          subprojects: [],
          tasks: [
            {
              id: 101101,
              title: 'Görev CRUD & İş Kuralları',
              status: 'Devam Ediyor',
              assignee: 'Ahmet Yılmaz',
              priority: 'Yüksek',
              dueDate: '2025-11-05',
              estimatedHours: 36,
              loggedHours: 20,
              subtasks: [
                { id: 1011011, title: 'CRUD endpointleri', status: 'Tamamlandı' },
                { id: 1011012, title: 'Durum makineleri (state machine)', status: 'Devam Ediyor' },
                { id: 1011013, title: 'Validasyon kuralları', status: 'Devam Ediyor' },
              ],
              activities: [
                { id: 10110101, description: 'Domain model tasarımı', duration: '2 saat', date: '2025-10-16' },
                { id: 10110102, description: 'State machine PoC', duration: '3 saat', date: '2025-10-24' },
              ],
            },
            {
              id: 101102,
              title: 'Queue & Event Entegrasyonu',
              status: 'Bekliyor',
              assignee: 'Ahmet Yılmaz',
              priority: 'Orta',
              dueDate: '2025-11-12',
              estimatedHours: 20,
              loggedHours: 0,
              subtasks: [
                { id: 1011021, title: 'Event şemaları', status: 'Bekliyor' },
                { id: 1011022, title: 'Retry/ DLQ stratejisi', status: 'Bekliyor' },
              ],
              activities: [],
            },
          ],
          members: [
            { id: 1, name: 'Ahmet Yılmaz', role: 'Backend Developer', avatar: null },
            { id: 5, name: 'Caner Usta', role: 'DevOps Engineer', avatar: null },
          ],
        },
      ],
      tasks: [
        {
          id: 10101,
          title: 'Kimlik Doğrulama (Auth) Servisi',
          status: 'Devam Ediyor',
          assignee: 'Ahmet Yılmaz',
          priority: 'Yüksek',
          dueDate: '2025-10-31',
          estimatedHours: 24,
          loggedHours: 17,
          subtasks: [
            { id: 101011, title: 'JWT akışı', status: 'Tamamlandı' },
            { id: 101012, title: 'OAuth2/ OpenID Connect', status: 'Devam Ediyor' },
          ],
          activities: [
            { id: 1010111, description: 'Güvenlik tasarımı', duration: '2 saat', date: '2025-10-20' },
            { id: 1010112, description: 'Token yenileme implementasyonu', duration: '2 saat', date: '2025-10-23' },
          ],
        },
        {
          id: 10102,
          title: 'Bildirim Servisi',
          status: 'Bekliyor',
          assignee: 'Mehmet Demir',
          priority: 'Orta',
          dueDate: '2025-11-20',
          estimatedHours: 18,
          loggedHours: 0,
          subtasks: [
            { id: 101021, title: 'E-posta şablonları', status: 'Bekliyor' },
            { id: 101022, title: 'Webhook altyapısı', status: 'Bekliyor' },
          ],
          activities: [],
        },
        {
          id: 10103,
          title: 'CI/CD Pipeline',
          status: 'Tamamlandı',
          assignee: 'Caner Usta',
          priority: 'Orta',
          dueDate: '2025-03-31',
          estimatedHours: 20,
          loggedHours: 22,
          subtasks: [
            { id: 101031, title: 'Build + Test aşamaları', status: 'Tamamlandı' },
            { id: 101032, title: 'Staging deploy', status: 'Tamamlandı' },
          ],
          activities: [
            { id: 1010311, description: 'GitHub Actions tasarımı', duration: '1 saat', date: '2025-03-15' },
          ],
        },
      ],
      members: [
        { id: 1, name: 'Ahmet Yılmaz', role: 'Backend Developer', avatar: null },
        { id: 3, name: 'Mehmet Demir', role: 'Database Administrator', avatar: null },
        { id: 5, name: 'Caner Usta', role: 'DevOps Engineer', avatar: null },
      ],
    },
    {
      id: 102,
      code: 'PRJ-001-FE',
      name: 'Frontend Modülü',
      status: 'Devam Ediyor',
      startDate: '2025-02-01',
      endDate: '2025-12-15',
      progress: 60,
      priority: 'Yüksek',
      parentId: 1,
      parentProject: null,
      subprojects: [
        {
          id: 1021,
          code: 'PRJ-001-FE-WEB',
          name: 'Web Uygulaması',
          status: 'Devam Ediyor',
          startDate: '2025-04-01',
          endDate: '2025-12-01',
          progress: 62,
          priority: 'Yüksek',
          parentId: 102,
          parentProject: null,
          subprojects: [],
          tasks: [
            {
              id: 102101,
              title: 'Tasarım Sistemi (Design System)',
              status: 'Devam Ediyor',
              assignee: 'Ayşe Kaya',
              priority: 'Yüksek',
              dueDate: '2025-11-10',
              estimatedHours: 30,
              loggedHours: 19,
              subtasks: [
                { id: 1021011, title: 'Bileşen kütüphanesi', status: 'Devam Ediyor' },
                { id: 1021012, title: 'Erişilebilirlik (a11y)', status: 'Bekliyor' },
              ],
              activities: [
                { id: 10210101, description: 'UI token çalışması', duration: '2 saat', date: '2025-10-22' },
              ],
            },
            {
              id: 102102,
              title: 'Durum Yönetimi (State)',
              status: 'Devam Ediyor',
              assignee: 'Ayşe Kaya',
              priority: 'Orta',
              dueDate: '2025-11-20',
              estimatedHours: 24,
              loggedHours: 8,
              subtasks: [
                { id: 1021021, title: 'Query katmanı', status: 'Devam Ediyor' },
                { id: 1021022, title: 'Cache stratejisi', status: 'Bekliyor' },
              ],
              activities: [
                { id: 10210201, description: 'Store yapısı POC', duration: '1 saat', date: '2025-10-23' },
              ],
            },
          ],
          members: [
            { id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null },
          ],
        },
        {
          id: 1022,
          code: 'PRJ-001-FE-ADMIN',
          name: 'Admin Paneli',
          status: 'Bekliyor',
          startDate: '2025-11-10',
          endDate: '2025-12-10',
          progress: 0,
          priority: 'Orta',
          parentId: 102,
          parentProject: null,
          subprojects: [],
          tasks: [
            {
              id: 102201,
              title: 'Rol & Yetki Ekranları',
              status: 'Bekliyor',
              assignee: 'Ayşe Kaya',
              priority: 'Orta',
              dueDate: '2025-12-05',
              estimatedHours: 16,
              loggedHours: 0,
              subtasks: [
                { id: 1022011, title: 'Rol listesi', status: 'Bekliyor' },
                { id: 1022012, title: 'Yetki matrisi', status: 'Bekliyor' },
              ],
              activities: [],
            },
          ],
          members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],
        },
      ],
      tasks: [
        {
          id: 10201,
          title: 'Dashboard tasarımı',
          status: 'Tamamlandı',
          assignee: 'Ayşe Kaya',
          priority: 'Orta',
          dueDate: '2025-07-15',
          estimatedHours: 14,
          loggedHours: 16,
          subtasks: [
            { id: 102011, title: 'Wireframe', status: 'Tamamlandı' },
            { id: 102012, title: 'High-fidelity mockup', status: 'Tamamlandı' },
          ],
          activities: [
            { id: 1020111, description: 'Kullanıcı görüşmeleri', duration: '2 saat', date: '2025-06-20' },
          ],
        },
        {
          id: 10202,
          title: 'Task listesi bileşeni',
          status: 'Devam Ediyor',
          assignee: 'Ayşe Kaya',
          priority: 'Yüksek',
          dueDate: '2025-11-01',
          estimatedHours: 20,
          loggedHours: 9,
          subtasks: [
            { id: 102021, title: 'Sıralama/ filtreleme', status: 'Devam Ediyor' },
            { id: 102022, title: 'Sanal listeleme (virtualization)', status: 'Bekliyor' },
          ],
          activities: [
            { id: 1020211, description: 'Performans profili', duration: '1 saat', date: '2025-10-23' },
          ],
        },
        {
          id: 10203,
          title: 'Calendar view',
          status: 'Bekliyor',
          assignee: 'Ayşe Kaya',
          priority: 'Orta',
          dueDate: '2025-11-15',
          estimatedHours: 18,
          loggedHours: 0,
          subtasks: [
            { id: 102031, title: 'Drag&drop etkileşimleri', status: 'Bekliyor' },
            { id: 102032, title: 'Tatil/mesai takvimi', status: 'Bekliyor' },
          ],
          activities: [],
        },
      ],
      members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],
    },
    {
      id: 103,
      code: 'PRJ-001-ANL',
      name: 'Raporlama ve Analitik',
      status: 'Devam Ediyor',
      startDate: '2025-06-01',
      endDate: '2025-12-20',
      progress: 55,
      priority: 'Orta',
      parentId: 1,
      parentProject: null,
      subprojects: [],
      tasks: [
        {
          id: 10301,
          title: 'BI Dashboardları',
          status: 'Devam Ediyor',
          assignee: 'Mehmet Demir',
          priority: 'Orta',
          dueDate: '2025-11-25',
          estimatedHours: 26,
          loggedHours: 12,
          subtasks: [
            { id: 103011, title: 'ETL akışları', status: 'Devam Ediyor' },
            { id: 103012, title: 'KPI tanımları', status: 'Bekliyor' },
          ],
          activities: [
            { id: 1030111, description: 'ETL PoC', duration: '2 saat', date: '2025-10-18' },
          ],
        },
      ],
      members: [{ id: 3, name: 'Mehmet Demir', role: 'Database Administrator', avatar: null }],
    },
    {
      id: 104,
      code: 'PRJ-001-MOB',
      name: 'Mobil Uygulama',
      status: 'Bekliyor',
      startDate: '2025-11-01',
      endDate: '2025-12-31',
      progress: 0,
      priority: 'Düşük',
      parentId: 1,
      parentProject: null,
      subprojects: [],
      tasks: [
        {
          id: 10401,
          title: 'React Native Kurulum',
          status: 'Bekliyor',
          assignee: 'Zeynep Aksoy',
          priority: 'Düşük',
          dueDate: '2025-11-05',
          estimatedHours: 8,
          loggedHours: 0,
          subtasks: [
            { id: 104011, title: 'Proje iskeleti', status: 'Bekliyor' },
            { id: 104012, title: 'CI entegrasyonu', status: 'Bekliyor' },
          ],
          activities: [],
        },
      ],
      members: [{ id: 6, name: 'Zeynep Aksoy', role: 'Mobile Developer', avatar: null }],
    },
  ],

  // Orijinal görevler (sende gelen mock veriden)
  tasks: [
    {
      id: 1,
      title: 'Backend API Geliştirme',
      status: 'Tamamlandı',
      assignee: 'Ahmet Yılmaz',
      subtasks: [
        { id: 11, title: 'User API endpoints', status: 'Tamamlandı' },
        { id: 12, title: 'Project API endpoints', status: 'Tamamlandı' },
        { id: 13, title: 'Task API endpoints', status: 'Tamamlandı' },
      ],
      activities: [
        { id: 111, description: 'API tasarım toplantısı', duration: '2 saat', date: '2025-10-20' },
        { id: 112, description: 'Endpoint implementasyonu', duration: '4 saat', date: '2025-10-21' },
      ],
    },
    {
      id: 2,
      title: 'Frontend Tasarımı',
      status: 'Devam Ediyor',
      assignee: 'Ayşe Kaya',
      subtasks: [
        { id: 21, title: 'Dashboard tasarımı', status: 'Tamamlandı' },
        { id: 22, title: 'Task listesi bileşeni', status: 'Devam Ediyor' },
        { id: 23, title: 'Calendar view', status: 'Bekliyor' },
      ],
      activities: [
        { id: 221, description: 'UI mockup hazırlama', duration: '3 saat', date: '2025-10-22' },
        { id: 222, description: 'React bileşenleri geliştirme', duration: '6 saat', date: '2025-10-23' },
      ],
    },
    {
      id: 3,
      title: 'Veritabanı Tasarımı',
      status: 'Tamamlandı',
      assignee: 'Mehmet Demir',
      subtasks: [
        { id: 31, title: 'Schema tasarımı', status: 'Tamamlandı' },
        { id: 32, title: 'Migration scripts', status: 'Tamamlandı' },
      ],
      activities: [
        { id: 331, description: 'Database schema planlama', duration: '2 saat', date: '2025-10-18' },
        { id: 332, description: 'Migration yazma', duration: '3 saat', date: '2025-10-19' },
      ],
    },
    {
      id: 4,
      title: 'Test ve Kalite Güvence',
      status: 'Bekliyor',
      assignee: 'Fatma Çelik',
      subtasks: [
        { id: 41, title: 'Unit test yazma', status: 'Bekliyor' },
        { id: 42, title: 'Integration test', status: 'Bekliyor' },
        { id: 43, title: 'E2E test', status: 'Bekliyor' },
      ],
      activities: [
        { id: 441, description: 'Test planı hazırlama', duration: '1 saat', date: '2025-10-25' },
      ],
    },
  ],

  // Üyeler (ana projede genişletildi)
  members: [
    { id: 1, name: 'Ahmet Yılmaz', role: 'Backend Developer', avatar: null },
    { id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null },
    { id: 3, name: 'Mehmet Demir', role: 'Database Administrator', avatar: null },
    { id: 4, name: 'Fatma Çelik', role: 'QA Engineer', avatar: null },
    { id: 5, name: 'Caner Usta', role: 'DevOps Engineer', avatar: null },
    { id: 6, name: 'Zeynep Aksoy', role: 'Mobile Developer', avatar: null },
  ],
};


const buildProjectTree = (project: any) => {
  // 1) Kök parent'tan current projeye kadar zinciri çıkar
  const getAncestorChain = (proj: any): any[] => {
    const chain: any[] = [];
    let cur = proj;
    while (cur) {
      chain.unshift(cur); // kök en başta
      cur = cur.parentProject;
    }
    return chain;
  };

  // Ortak: Task düğümlerini oluştur
  const buildTaskNodes = (tasks: any[] = []) =>
    tasks.map((task: any) => ({
      title: `${task.title} - ${task.assignee} [${task.priority || '-'}] (${task.status}) - ${task.loggedHours || 0}h/${task.estimatedHours || 0}h`,
      key: `task-${task.id}`,
      icon: <FileTextOutlined />,
      children: [
        ...(task.subtasks || []).map((subtask: any) => ({
          title: `${subtask.title} (${subtask.status})`,
          key: `subtask-${subtask.id}`,
          icon: <CheckSquareOutlined />,
        })),
        ...(task.activities || []).map((activity: any) => ({
          title: `${activity.description} (${activity.duration})`,
          key: `activity-${activity.id}`,
          icon: <ClockCircleOutlined />,
        })),
      ],
    }));

  // Ortak: Proje düğümü başlığı
  const makeProjectTitle = (proj: any, isCurrent: boolean) =>
    isCurrent ? (
      <span className="bg-blue-100 px-2 py-1 rounded font-semibold text-blue-800">
        {`${proj.code} - ${proj.name} (${proj.status}) [${proj.priority}]`}
      </span>
    ) : `${proj.code} - ${proj.name} (${proj.status}) [${proj.priority}]`;

  // 2) Proje düğümü oluşturucu
  // isCurrent=true ise subprojects'leri de derinlemesine ekler.
  const buildProjectNode = (proj: any, opts?: { isCurrent?: boolean }): any => {
    const isCurrent = !!opts?.isCurrent;
    const node: any = {
      title: makeProjectTitle(proj, isCurrent),
      key: `project-${proj.id}`,
      icon: <ProjectOutlined />,
    };

    const children: any[] = [];

    // a) Sadece current nodeda alt projeleri tam ağaç olarak ekle
    if (isCurrent && proj.subprojects?.length) {
      children.push(
        ...proj.subprojects.map((sp: any) => buildFullSubtree(sp))
      );
    }

    // b) Her projede kendi task'larını göster
    if (proj.tasks?.length) {
      children.push(...buildTaskNodes(proj.tasks));
    }

    if (children.length) node.children = children;
    return node;
  };

  // 3) Alt ağaç (current veya onun altındaki projeler için)
  const buildFullSubtree = (proj: any): any => {
    const node: any = {
      title: makeProjectTitle(proj, false),
      key: `project-${proj.id}`,
      icon: <ProjectOutlined />,
    };

    const children: any[] = [];
    if (proj.subprojects?.length) {
      children.push(...proj.subprojects.map((sp: any) => buildFullSubtree(sp)));
    }
    if (proj.tasks?.length) {
      children.push(...buildTaskNodes(proj.tasks));
    }

    if (children.length) node.children = children;
    return node;
  };

  // 4) Zinciri yukarıdan aşağı doğru birbirine ekle
  const chain = getAncestorChain(project);
  if (chain.length === 0) {
    // güvenlik: hiç parent yoksa sadece current
    return [buildProjectNode(project, { isCurrent: true })];
  }

  // İlk olarak current node'u (zincirin sonu) tam alt ağacıyla kur
  let assembled = buildProjectNode(chain[chain.length - 1], { isCurrent: true });

  // Sonra geriye doğru gidip her parent'ın çocuğu olarak "assembled"ı ekle
  for (let i = chain.length - 2; i >= 0; i--) {
    const ancestorNode = buildProjectNode(chain[i], { isCurrent: false });

    // ancestorNode'un mevcut çocukları varsa, current'a giden dalı en başa koy
    const existingChildren = ancestorNode.children || [];
    ancestorNode.children = [assembled, ...existingChildren];

    assembled = ancestorNode;
  }

  // En üst parent kök olur
  return [assembled];
};


export default function ProjectDetails() {
  // Tüm projelerdeki task'ları topla
  const collectAllTasks = (proj: any): any[] => {
    let tasks = [...(proj.tasks || [])];

    // Alt projelerdeki task'ları da ekle
    if (proj.subprojects) {
      proj.subprojects.forEach((sub: any) => {
        tasks = tasks.concat(collectAllTasks(sub));
      });
    }

    return tasks;
  };

  const allTasks = collectAllTasks(projectData);
  const tabItems = [
    {
      key: 'overview',
      label: 'Genel Bakis',
      children: (
        <>
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{projectData.code} - {projectData.name}</h1>
                  <Tag color="blue" className="text-sm">{projectData.status}</Tag>
                  <Tag color={projectData.priority === 'Yüksek' ? 'orange' : projectData.priority === 'Kritik' ? 'red' : 'green'} className="text-sm">
                    {projectData.priority}
                  </Tag>
                </div>
                {projectData.parentProject && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Üst Proje: </span>
                    <Tag color="purple" className="text-xs">{projectData.parentProject.code} - {projectData.parentProject.name}</Tag>
                  </div>
                )}
                <p className="text-gray-600 mb-4 max-w-3xl">{projectData.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarOutlined />
                    <span>{projectData.startDate} - {projectData.endDate}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">{projectData.progress}%</div>
                <div className="w-24">
                  <Progress percent={projectData.progress} showInfo={false} strokeColor="#2563eb" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Tamamlanma</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ProjectOutlined className="text-blue-600" />
                    Proje Yapisi
                  </h2>
                </div>
                <div className="p-6">
                  <Tree
                    treeData={buildProjectTree(projectData)}
                    defaultExpandAll
                    showIcon
                    className="bg-gray-50 p-4 rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ProjectOutlined className="text-purple-600" />
                    Alt Projeler Durumu
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectData.subprojects.map((subproject) => (
                      <div key={subproject.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">
                            {subproject.code} - {subproject.name}
                          </h3>
                          <div className="flex gap-1">
                            <Tag color="purple">{subproject.status}</Tag>
                            <Tag
                              color={
                                subproject.priority === 'YǬksek'
                                  ? 'orange'
                                  : subproject.priority === 'Kritik'
                                    ? 'red'
                                    : 'green'
                              }
                              className="text-xs"
                            >
                              {subproject.priority}
                            </Tag>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">İlerleme</span>
                          <span className="text-sm font-medium text-gray-900">{subproject.progress || 0}%</span>
                        </div>
                        <Progress percent={subproject.progress || 0} size="small" strokeColor="#8b5cf6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2 text-green-600" />
                    <span className="text-lg font-semibold">Proje Ekibi</span>
                  </div>
                </div>
                <div className="p-6">
                  <List
                    dataSource={projectData.members}
                    renderItem={(member: any) => (
                      <List.Item className="border-0 px-0">
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size={48}
                              style={{
                                background: `linear-gradient(135deg, ${['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'][member.id % 6]}, ${['#764ba2', '#667eea', '#f5576c', '#f093fb', '#00f2fe', '#4facfe'][member.id % 6]})`,
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            >
                              {member.name.split(' ').map((n: string) => n[0]).join('')}
                            </Avatar>
                          }
                          title={<span className="font-semibold text-gray-800">{member.name}</span>}
                          description={<span className="text-gray-600">{member.role}</span>}
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <CheckSquareOutlined className="mr-2 text-orange-600" />
                    <span className="text-lg font-semibold">Hızlı İşlemler</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <Button
                      type="primary"
                      block
                      size="large"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <FileTextOutlined className="mr-2" />
                      Yeni Görev Ekle
                    </Button>
                    <Button
                      block
                      size="large"
                      className="bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
                    >
                      <UserOutlined className="mr-2" />
                      Üye Ekle
                    </Button>
                    <Button
                      block
                      size="large"
                      className="bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-green-400 hover:text-green-600 transition-all duration-300"
                    >
                      <ProjectOutlined className="mr-2" />
                      Rapor Oluştur
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">İstatistikler</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{allTasks.length}</div>
                      <div className="text-sm text-gray-600">Toplam Görev</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {allTasks.filter((t: any) => t.status === 'Tamamland��').length}
                      </div>
                      <div className="text-sm text-gray-600">Tamamlanan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {allTasks.filter((t: any) => t.status === 'Devam Ediyor').length}
                      </div>
                      <div className="text-sm text-gray-600">Devam Eden</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {allTasks.filter((t: any) => t.status === 'Bekliyor').length}
                      </div>
                      <div className="text-sm text-gray-600">Bekleyen</div>
                    </div>
                    <div className="text-center col-span-2">
                      <div className="text-lg font-bold text-purple-600">
                        {allTasks.reduce((sum: number, t: any) => sum + (t.loggedHours || 0), 0)} / {allTasks.reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0)} saat
                      </div>
                      <div className="text-sm text-gray-600">Harcanan / Tahmini Saat</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: 'organization',
      label: 'Organizasyon Semasi',
      children: (
        <div className="py-1">
          <ProjectOrganizationDiagram project={projectData} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4">
      {/* Compact Header */}

      <Tabs
        defaultActiveKey="overview"
        tabBarGutter={16}
        items={tabItems}
        className="project-details-tabs"
      />
    </div>
  );
}
