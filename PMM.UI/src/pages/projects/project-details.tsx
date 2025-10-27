

import { List, Avatar, Progress, Tag, Button, Tree, Tabs } from 'antd';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, ProjectOutlined, FileTextOutlined, CheckSquareOutlined } from '@ant-design/icons';
import ProjectOrganizationDiagram from '../../components/projects/project-details/project-organization-diagram';
// Çoklu parent destekli, sadeleştirilmiş ve "PRT-800 ↛ PGM-900" ayrımı yapılmış veri
// 🌳 Kurumsal ağaç üst seviyesi eklendi: ENT-100
// PRJ-001, hem PGM-900 (Program) hem PRT-800 (Portföy) altında yer alıyor;
// bu iki üst katman da artık ENT-100 stratejisinin altında. Böylece PRJ-001 orta katmanda konumlandı.

// 🔎 ODAK: PRJ-001-FE-WEB (Web Uygulaması) — tam ağaç görünümü

const projectData = {
// 🔎 ODAK AĞAÇ: PRJ-001-FE-WEB (Web Uygulaması) — TÜM AĞAÇ, GÜNCELLENMİŞ
  // ======================================
  // 🎯 Focus Node
  // ======================================
  id: 1021,
  code: 'PRJ-001-FE-WEB',
  name: 'Web Uygulaması',
  description:
    'Proje yönetim modülünün web arayüzü (React) — temel modüller, DS entegrasyonu, performans ve erişilebilirlik.',
  status: 'Devam Ediyor',
  startDate: '2025-04-01',
  endDate: '2025-12-01',
  progress: 62,
  priority: 'Yüksek',

  // ⬆️ Güncellendi: FE-WEB artık 2 parent’a bağlı (PRJ-001-FE ve UXP-310)
  parentIds: [102, 1310],
  parentProjects: [
    {
      id: 102,
      code: 'PRJ-001-FE',
      name: 'Frontend Modülü',
      status: 'Devam Ediyor',
      startDate: '2025-02-01',
      endDate: '2025-12-15',
      progress: 60,
      priority: 'Yüksek',

      parentIds: [1],
      parentProjects: [
        {
          id: 1,
          code: 'PRJ-001',
          name: 'Proje Yönetim Modülü Geliştirme',
          status: 'Devam Ediyor',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          progress: 65,
          priority: 'Yüksek',

          // PRJ-001’in üst katmanları (DAG)
          parentIds: [900, 800],
          parentProjects: [
            {
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
              parentIds: [100],
              parentProjects: [
                {
                  id: 100,
                  code: 'ENT-100',
                  name: 'Kurumsal Dönüşüm Stratejisi',
                  description:
                    'Şirket genelinde dijitalleşme, verimlilik ve yönetişim hedeflerine yönelik çok yıllı dönüşüm stratejisi.',
                  status: 'Devam Ediyor',
                  startDate: '2024-01-01',
                  endDate: '2027-12-31',
                  progress: 52,
                  priority: 'Kritik',
                  parentIds: [], // kök
                },
              ],
              siblingProjects: [
                { id: 45, code: 'PRJ-045-FIN', name: 'Finans Entegrasyon Çerçevesi', status: 'Devam Ediyor' },
                { id: 62, code: 'PRJ-062-SSO', name: 'Kurumsal SSO / IAM İyileştirmeleri', status: 'Planlandı' },
              ],
            },
            {
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
              parentIds: [100],
              parentProjects: [
                {
                  id: 100,
                  code: 'ENT-100',
                  name: 'Kurumsal Dönüşüm Stratejisi',
                  status: 'Devam Ediyor',
                },
              ],
              siblingProjects: [
                { id: 77, code: 'PRJ-077-ML', name: 'Tahminleme (ML) Platformu', status: 'Devam Ediyor' },
                { id: 81, code: 'PRJ-081-CRM', name: 'CRM Yenileme', status: 'Beklemede' },
              ],
            },
          ],

          // PRJ-001 alt ağaç
          subprojects: [
            // --- Backend ---
            {
              id: 101,
              code: 'PRJ-001-BE',
              name: 'Backend Modülü',
              status: 'Devam Ediyor',
              startDate: '2025-01-15',
              endDate: '2025-11-30',
              progress: 70,
              priority: 'Yüksek',
              parentIds: [1],

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
                  parentIds: [101],

                  subprojects: [
                    {
                      id: 10111,
                      code: 'PRJ-001-BE-SVC-API',
                      name: 'Public API Katmanı',
                      status: 'Devam Ediyor',
                      startDate: '2025-09-15',
                      endDate: '2025-11-10',
                      progress: 60,
                      priority: 'Yüksek',
                      parentIds: [1011],
                      subprojects: [],
                      tasks: [
                        {
                          id: 1011101,
                          title: 'API versiyonlama ve backward-compat',
                          status: 'Devam Ediyor',
                          assignee: 'Ahmet Yılmaz',
                          priority: 'Orta',
                          dueDate: '2025-11-08',
                          estimatedHours: 20,
                          loggedHours: 8,
                          subtasks: [
                            { id: 10111011, title: 'v1 -> v2 geçiş stratejisi', status: 'Devam Ediyor' },
                          ],
                          activities: [
                            { id: 101110101, description: 'ADR yazımı', duration: '1 saat', date: '2025-10-24' },
                          ],
                        },
                      ],
                      members: [{ id: 1, name: 'Ahmet Yılmaz', role: 'Backend Developer', avatar: null }],
                    },
                  ],
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
                        { id: 1011012, title: 'Durum makineleri', status: 'Devam Ediyor' },
                      ],
                      activities: [
                        { id: 10110101, description: 'Domain model tasarımı', duration: '2 saat', date: '2025-10-16' },
                      ],
                    },
                    {
                      id: 101102,
                      title: 'Zaman Takip Servisi',
                      status: 'Planlandı',
                      assignee: 'Caner Usta',
                      priority: 'Orta',
                      dueDate: '2025-11-25',
                      estimatedHours: 28,
                      loggedHours: 0,
                      subtasks: [
                        { id: 1011021, title: 'Timesheet veri modeli', status: 'Planlandı' },
                        { id: 1011022, title: 'REST & webhook tasarımı', status: 'Planlandı' },
                      ],
                      activities: [],
                    },
                  ],
                  members: [
                    { id: 1, name: 'Ahmet Yılmaz', role: 'Backend Developer', avatar: null },
                    { id: 5, name: 'Caner Usta', role: 'DevOps Engineer', avatar: null },
                  ],
                },
                {
                  id: 1012,
                  code: 'PRJ-001-BE-REP',
                  name: 'Raporlama Servisi',
                  status: 'Planlandı',
                  startDate: '2025-10-28',
                  endDate: '2025-12-05',
                  progress: 0,
                  priority: 'Orta',
                  parentIds: [101],
                  subprojects: [],
                  tasks: [
                    {
                      id: 101201,
                      title: 'Metri̇k şeması',
                      status: 'Planlandı',
                      assignee: 'Fatma Çelik',
                      priority: 'Orta',
                      dueDate: '2025-11-12',
                      estimatedHours: 16,
                      loggedHours: 0,
                      subtasks: [],
                      activities: [],
                    },
                  ],
                  members: [{ id: 4, name: 'Fatma Çelik', role: 'QA Engineer', avatar: null }],
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
                  ],
                },
              ],
              members: [
                { id: 1, name: 'Ahmet Yılmaz', role: 'Backend Developer', avatar: null },
                { id: 5, name: 'Caner Usta', role: 'DevOps Engineer', avatar: null },
              ],
            },

            // --- Frontend (buradaki çocuklardan biri ODAK düğüm) ---
            {
              id: 102,
              code: 'PRJ-001-FE',
              name: 'Frontend Modülü',
              status: 'Devam Ediyor',
              startDate: '2025-02-01',
              endDate: '2025-12-15',
              progress: 60,
              priority: 'Yüksek',
              parentIds: [1],

              subprojects: [
                // 🎯 ODAK: Web Uygulaması — ⬆️ Ek parent UXP-310 ile güncellendi
                {
                  id: 1021,
                  code: 'PRJ-001-FE-WEB',
                  name: 'Web Uygulaması',
                  status: 'Devam Ediyor',
                  startDate: '2025-04-01',
                  endDate: '2025-12-01',
                  progress: 62,
                  priority: 'Yüksek',

                  // ⬆️ GÜNCEL
                  parentIds: [102, 1310],
                  parentProjects: [
                    { id: 102, code: 'PRJ-001-FE', name: 'Frontend Modülü', status: 'Devam Ediyor' },
                    {
                      id: 1310,
                      code: 'UXP-310',
                      name: 'Ön Uç Deneyim Mükemmellik Programı',
                      description:
                        'Kurumsal çapta UX/UI standartları, erişilebilirlik, performans ve bileşen ekosistemi olgunlaştırma programı.',
                      status: 'Devam Ediyor',
                      startDate: '2024-06-01',
                      endDate: '2026-06-30',
                      progress: 47,
                      priority: 'Yüksek',
                      parentIds: [], // kök, yeni hat
                    },
                  ],

                  subprojects: [
                    {
                      id: 10211,
                      code: 'PRJ-001-FE-WEB-DS',
                      name: 'Design System (UI Kit)',
                      status: 'Devam Ediyor',
                      startDate: '2025-08-15',
                      endDate: '2025-11-20',
                      progress: 55,
                      priority: 'Yüksek',
                      parentIds: [1021],
                      subprojects: [],
                      tasks: [
                        {
                          id: 1021101,
                          title: 'Bileşen kütüphanesi',
                          status: 'Devam Ediyor',
                          assignee: 'Ayşe Kaya',
                          priority: 'Yüksek',
                          dueDate: '2025-11-10',
                          estimatedHours: 30,
                          loggedHours: 19,
                          subtasks: [{ id: 10211011, title: 'Button, Input, Modal', status: 'Devam Ediyor' }],
                          activities: [
                            { id: 102110101, description: 'UI token çalışması', duration: '2 saat', date: '2025-10-22' },
                          ],
                        },
                      ],
                      members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],
                    },
                  ],
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
                      subtasks: [{ id: 1021011, title: 'Bileşen kütüphanesi', status: 'Devam Ediyor' }],
                      activities: [{ id: 10210101, description: 'UI token çalışması', duration: '2 saat', date: '2025-10-22' }],
                    },
                  ],
                  members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],
                },
              ],
              tasks: [
                {
                  id: 10202,
                  title: 'Task listesi bileşeni',
                  status: 'Devam Ediyor',
                  assignee: 'Ayşe Kaya',
                  priority: 'Yüksek',
                  dueDate: '2025-11-01',
                  estimatedHours: 20,
                  loggedHours: 9,
                  subtasks: [{ id: 102021, title: 'Sıralama/ filtreleme', status: 'Devam Ediyor' }],
                  activities: [{ id: 1020211, description: 'Performans profili', duration: '1 saat', date: '2025-10-23' }],
                },
              ],
              members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],
            },

            // --- QA (⬆️ Ek parent QMS-420 ile güncellendi) ---
            {
              id: 103,
              code: 'PRJ-001-QA',
              name: 'Kalite ve Test Modülü',
              status: 'Planlandı',
              startDate: '2025-09-15',
              endDate: '2025-12-20',
              progress: 10,
              priority: 'Orta',

              // ⬆️ GÜNCEL
              parentIds: [1, 1420],
              parentProjects: [
                { id: 1, code: 'PRJ-001', name: 'Proje Yönetim Modülü Geliştirme', status: 'Devam Ediyor' },
                {
                  id: 1420,
                  code: 'QMS-420',
                  name: 'Kalite Yönetim Sistemi Uyum Girişimi',
                  description:
                    'ISO 9001 / IEC uyumu, TMMi olgunluk arttırımı ve izlenebilirlik (traceability) iyileştirmeleri.',
                  status: 'Devam Ediyor',
                  startDate: '2024-03-01',
                  endDate: '2026-03-31',
                  progress: 51,
                  priority: 'Yüksek',
                  parentIds: [], // kök, yeni hat
                },
              ],

              subprojects: [
                {
                  id: 1031,
                  code: 'PRJ-001-QA-AUTO',
                  name: 'Test Otomasyonu',
                  status: 'Planlandı',
                  startDate: '2025-10-30',
                  endDate: '2025-12-20',
                  progress: 0,
                  priority: 'Orta',
                  parentIds: [103],
                  subprojects: [],
                  tasks: [
                    {
                      id: 103101,
                      title: 'E2E senaryoları',
                      status: 'Planlandı',
                      assignee: 'Fatma Çelik',
                      priority: 'Orta',
                      dueDate: '2025-11-25',
                      estimatedHours: 24,
                      loggedHours: 0,
                      subtasks: [],
                      activities: [],
                    },
                  ],
                  members: [{ id: 4, name: 'Fatma Çelik', role: 'QA Engineer', avatar: null }],
                },
              ],
              tasks: [
                {
                  id: 10301,
                  title: 'Test stratejisi',
                  status: 'Planlandı',
                  assignee: 'Fatma Çelik',
                  priority: 'Orta',
                  dueDate: '2025-11-05',
                  estimatedHours: 8,
                  loggedHours: 0,
                  subtasks: [],
                  activities: [],
                },
              ],
              members: [{ id: 4, name: 'Fatma Çelik', role: 'QA Engineer', avatar: null }],
            },

            // --- Mobil ---
            {
              id: 104,
              code: 'PRJ-001-MOB',
              name: 'Mobil Uygulama',
              status: 'Planlandı',
              startDate: '2025-09-01',
              endDate: '2025-12-31',
              progress: 5,
              priority: 'Orta',
              parentIds: [1],
              subprojects: [],
              tasks: [
                {
                  id: 10401,
                  title: 'React Native temel çatı',
                  status: 'Planlandı',
                  assignee: 'Ayşe Kaya',
                  priority: 'Orta',
                  dueDate: '2025-11-18',
                  estimatedHours: 18,
                  loggedHours: 0,
                  subtasks: [],
                  activities: [],
                },
              ],
              members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],
            },

            // --- Entegrasyonlar ---
            {
              id: 105,
              code: 'PRJ-001-INT',
              name: 'Entegrasyonlar',
              status: 'Devam Ediyor',
              startDate: '2025-06-01',
              endDate: '2025-12-15',
              progress: 40,
              priority: 'Yüksek',
              parentIds: [1],
              subprojects: [
                {
                  id: 1051,
                  code: 'PRJ-001-INT-ERP',
                  name: 'ERP Entegrasyonu',
                  status: 'Devam Ediyor',
                  startDate: '2025-07-01',
                  endDate: '2025-11-30',
                  progress: 50,
                  priority: 'Yüksek',
                  parentIds: [105],
                  subprojects: [],
                  tasks: [
                    {
                      id: 105101,
                      title: 'GL ve proje kod eşlemesi',
                      status: 'Devam Ediyor',
                      assignee: 'Caner Usta',
                      priority: 'Yüksek',
                      dueDate: '2025-11-12',
                      estimatedHours: 22,
                      loggedHours: 7,
                      subtasks: [],
                      activities: [],
                    },
                  ],
                  members: [{ id: 5, name: 'Caner Usta', role: 'DevOps Engineer', avatar: null }],
                },
              ],
              tasks: [
                {
                  id: 10501,
                  title: 'SSO / IAM entegrasyonu',
                  status: 'Beklemede',
                  assignee: 'Ahmet Yılmaz',
                  priority: 'Orta',
                  dueDate: '2025-11-22',
                  estimatedHours: 12,
                  loggedHours: 0,
                  subtasks: [],
                  activities: [],
                },
              ],
              members: [
                { id: 1, name: 'Ahmet Yılmaz', role: 'Backend Developer', avatar: null },
                { id: 5, name: 'Caner Usta', role: 'DevOps Engineer', avatar: null },
              ],
            },

            // --- Raporlama & Analitik ---
            {
              id: 106,
              code: 'PRJ-001-ANA',
              name: 'Raporlama & Analitik',
              status: 'Devam Ediyor',
              startDate: '2025-08-01',
              endDate: '2025-12-20',
              progress: 35,
              priority: 'Orta',
              parentIds: [1],
              subprojects: [
                {
                  id: 1061,
                  code: 'PRJ-001-ANA-DWH',
                  name: 'Veri Ambarı',
                  status: 'Devam Ediyor',
                  startDate: '2025-08-10',
                  endDate: '2025-12-10',
                  progress: 40,
                  priority: 'Orta',
                  parentIds: [106],
                  subprojects: [
                    {
                      id: 10611,
                      code: 'PRJ-001-ANA-ETL',
                      name: 'ETL Boru Hattı',
                      status: 'Devam Ediyor',
                      startDate: '2025-09-01',
                      endDate: '2025-11-30',
                      progress: 45,
                      priority: 'Orta',
                      parentIds: [1061],
                      subprojects: [],
                      tasks: [
                        {
                          id: 1061101,
                          title: 'Kaynak eşleme',
                          status: 'Devam Ediyor',
                          assignee: 'Mehmet Korkmaz',
                          priority: 'Orta',
                          dueDate: '2025-11-05',
                          estimatedHours: 26,
                          loggedHours: 12,
                          subtasks: [],
                          activities: [],
                        },
                      ],
                      members: [{ id: 7, name: 'Mehmet Korkmaz', role: 'Data Engineer', avatar: null }],
                    },
                  ],
                  tasks: [
                    {
                      id: 106101,
                      title: 'Boyutsal modelleme',
                      status: 'Planlandı',
                      assignee: 'Mehmet Korkmaz',
                      priority: 'Orta',
                      dueDate: '2025-11-14',
                      estimatedHours: 20,
                      loggedHours: 0,
                      subtasks: [],
                      activities: [],
                    },
                  ],
                  members: [{ id: 7, name: 'Mehmet Korkmaz', role: 'Data Engineer', avatar: null }],
                },
              ],
              tasks: [
                {
                  id: 10601,
                  title: 'BI raporları temel set',
                  status: 'Planlandı',
                  assignee: 'Fatma Çelik',
                  priority: 'Orta',
                  dueDate: '2025-11-28',
                  estimatedHours: 18,
                  loggedHours: 0,
                  subtasks: [],
                  activities: [],
                },
              ],
              members: [
                { id: 4, name: 'Fatma Çelik', role: 'QA Engineer', avatar: null },
                { id: 7, name: 'Mehmet Korkmaz', role: 'Data Engineer', avatar: null },
              ],
            },
          ],

          // PRJ-001 üst düzey görevler ve meta
          tasks: [
            {
              id: 1,
              title: 'Backend API Geliştirme',
              status: 'Tamamlandı',
              assignee: 'Ahmet Yılmaz',
              subtasks: [
                { id: 11, title: 'User API endpoints', status: 'Tamamlandı' },
                { id: 12, title: 'Project API endpoints', status: 'Tamamlandı' },
              ],
              activities: [{ id: 111, description: 'API tasarım toplantısı', duration: '2 saat', date: '2025-10-20' }],
            },
            {
              id: 2,
              title: 'Frontend Tasarımı',
              status: 'Devam Ediyor',
              assignee: 'Ayşe Kaya',
              subtasks: [
                { id: 21, title: 'Dashboard tasarımı', status: 'Tamamlandı' },
                { id: 22, title: 'Task listesi bileşeni', status: 'Devam Ediyor' },
              ],
              activities: [{ id: 221, description: 'UI mockup hazırlama', duration: '3 saat', date: '2025-10-22' }],
            },
            {
              id: 3,
              title: 'Güvenlik Gözden Geçirme',
              status: 'Planlandı',
              assignee: 'Zeynep Demir',
              subtasks: [{ id: 31, title: 'Tehdit modellemesi', status: 'Planlandı' }],
              activities: [],
            },
          ],
          members: [
            { id: 1, name: 'Ahmet Yılmaz', role: 'Backend Developer', avatar: null },
            { id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null },
            { id: 4, name: 'Fatma Çelik', role: 'QA Engineer', avatar: null },
            { id: 5, name: 'Caner Usta', role: 'DevOps Engineer', avatar: null },
            { id: 6, name: 'Elif Arslan', role: 'Product Owner', avatar: null },
            { id: 7, name: 'Mehmet Korkmaz', role: 'Data Engineer', avatar: null },
            { id: 8, name: 'Zeynep Demir', role: 'Security Engineer', avatar: null },
            { id: 9, name: 'Burak Yıldız', role: 'Scrum Master', avatar: null },
            { id: 10, name: 'Selin Acar', role: 'UX Designer', avatar: null },
          ],
          milestones: [
            { id: 'M1', name: 'MVP hazır', date: '2025-11-30', status: 'Planlandı' },
            { id: 'M2', name: 'Genel Kullanıma Açılış (GA)', date: '2025-12-20', status: 'Planlandı' },
          ],
          risks: [
            {
              id: 'R1',
              title: 'SSO entegrasyonu gecikebilir',
              probability: 'Orta',
              impact: 'Yüksek',
              status: 'Açık',
              mitigation: 'Ön üretimde mock SSO ile ilerleme',
            },
            {
              id: 'R2',
              title: 'Design System kapsamı genişleyebilir',
              probability: 'Yüksek',
              impact: 'Orta',
              status: 'Açık',
              mitigation: 'Sprint başına kapsam kontrolü',
            },
          ],
          issues: [
            {
              id: 'I1',
              title: 'Staging ortamında throttling',
              severity: 'Orta',
              status: 'Açık',
              owner: 'Caner Usta',
              createdAt: '2025-10-21',
            },
          ],
          dependencies: [
            { id: 'D1', type: 'blockedBy', relatedCode: 'PRJ-062-SSO', description: 'Kurumsal SSO/IAM iyileştirmeleri tamamlanmalı' },
            { id: 'D2', type: 'blocks', relatedCode: 'PRJ-081-CRM', description: 'CRM Yenileme, proje modülünün API’larına bağımlı' },
            { id: 'D3', type: 'relatesTo', relatedCode: 'PRJ-045-FIN', description: 'Finans entegrasyon çerçevesi ile veri sözleşmesi' },
          ],
          budget: {
            currency: 'TRY',
            capex: 420000,
            opex: 180000,
            spent: 285000,
            forecastEoY: 585000,
          },
          sprints: [
            { id: 12, name: 'Sprint 12', start: '2025-10-20', end: '2025-11-03', goal: 'Auth + DS stabilizasyonu' },
            { id: 13, name: 'Sprint 13', start: '2025-11-04', end: '2025-11-17', goal: 'Zaman takibi + raporlama temeli' },
          ],
          releases: [
            { id: 'REL-1', name: 'v0.9.0-MVP', date: '2025-11-30', scope: ['BE-SVC', 'FE-WEB-DS'] },
            { id: 'REL-2', name: 'v1.0.0-GA', date: '2025-12-20', scope: ['Auth', 'Timesheet', 'BI temel'] },
          ],
          tags: ['PMO', 'Portfolio', 'Program', 'OrtaKatman', 'Mikroservis', 'DesignSystem'],
          documents: [
            { id: 'DOC-ADR-01', title: 'ADR-01: Kimlik Doğrulama Kararları', type: 'ADR', url: '/docs/adr-01-auth' },
            { id: 'DOC-ARCH', title: 'Mimari Diyagram', type: 'Diagram', url: '/docs/arch-diagram' },
          ],
        },
      ],
      // FE seviyesindeki görevler ve ekip
      tasks: [
        {
          id: 10202,
          title: 'Task listesi bileşeni',
          status: 'Devam Ediyor',
          assignee: 'Ayşe Kaya',
          priority: 'Yüksek',
          dueDate: '2025-11-01',
          estimatedHours: 20,
          loggedHours: 9,
          subtasks: [{ id: 102021, title: 'Sıralama/ filtreleme', status: 'Devam Ediyor' }],
          activities: [{ id: 1020211, description: 'Performans profili', duration: '1 saat', date: '2025-10-23' }],
        },
      ],
      members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],
    },

    // 🔼 Yeni, ikinci parent — kök bir hat:
    {
      id: 1310,
      code: 'UXP-310',
      name: 'Ön Uç Deneyim Mükemmellik Programı',
      description:
        'Kurumsal çapta UX/UI standartları, erişilebilirlik, performans ve bileşen ekosistemi olgunlaştırma programı.',
      status: 'Devam Ediyor',
      startDate: '2024-06-01',
      endDate: '2026-06-30',
      progress: 47,
      priority: 'Yüksek',
      parentIds: [], // kök
    },
  ],

  // ======================================
  // ⬇️ Focus düğüm alt ağaç (tam)
  // ======================================
  subprojects: [
    {
      id: 10211,
      code: 'PRJ-001-FE-WEB-DS',
      name: 'Design System (UI Kit)',
      status: 'Devam Ediyor',
      startDate: '2025-08-15',
      endDate: '2025-11-20',
      progress: 55,
      priority: 'Yüksek',
      parentIds: [1021],
      subprojects: [],
      tasks: [
        {
          id: 1021101,
          title: 'Bileşen kütüphanesi',
          status: 'Devam Ediyor',
          assignee: 'Ayşe Kaya',
          priority: 'Yüksek',
          dueDate: '2025-11-10',
          estimatedHours: 30,
          loggedHours: 19,
          subtasks: [{ id: 10211011, title: 'Button, Input, Modal', status: 'Devam Ediyor' }],
          activities: [{ id: 102110101, description: 'UI token çalışması', duration: '2 saat', date: '2025-10-22' }],
        },
      ],
      members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],
    },
  ],
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
      subtasks: [{ id: 1021011, title: 'Bileşen kütüphanesi', status: 'Devam Ediyor' }],
      activities: [{ id: 10210101, description: 'UI token çalışması', duration: '2 saat', date: '2025-10-22' }],
    },
  ],
  members: [{ id: 2, name: 'Ayşe Kaya', role: 'Frontend Developer', avatar: null }],

  // ======================================
  // 🧭 Yol işaretleri (kolay gezinim için)
  // ======================================
  focusPathCandidates: [
    // ENT-100 → PGM-900 → PRJ-001 → PRJ-001-FE → PRJ-001-FE-WEB
    [100, 900, 1, 102, 1021],
    // ENT-100 → PRT-800 → PRJ-001 → PRJ-001-FE → PRJ-001-FE-WEB
    [100, 800, 1, 102, 1021],
    // UXP-310 → PRJ-001-FE-WEB (yeni hat)
    [1310, 1021],
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
                {projectData.parentProjects && projectData.parentProjects.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Üst Proje: </span>
                    <Tag color="purple" className="text-xs">{projectData.parentProjects[0].code} - {projectData.parentProjects[0].name}</Tag>
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
