# PMM - Enterprise Project Management Module (ERP Ecosystem Integration)

PMM is an enterprise-grade Project Management Module designed to integrate into a broader ERP (Enterprise Resource Planning) ecosystem. In modern enterprises, project management is often isolated in siloed platforms (such as Jira, Trello, or Asana), leaving resource allocation, timesheets, scheduling deviations, and client billing disconnected from core operational data.

PMM addresses this critical gap by serving as a centralized, highly connected module that bridges project planning with real-world ERP resources. It delivers an interactive Gantt scheduling timeline, real-time Agile burn-up calculations, hierarchical multi-level project mapping, and automated NPOI-driven rich-text Excel reports. PMM enables businesses to monitor scheduling deviations, manage task dependencies programmatically, prevent circular project mappings, and optimize resource usage—all with a stunning, high-performance web interface.

## Live Project Links

*   **Live Web Application:** [https://pmm.zeyd.dev](https://pmm.zeyd.dev)
*   **Interactive API Documentation (Swagger):** [https://api-pmm.zeyd.dev/swagger](https://api-pmm.zeyd.dev/swagger)

## Project Previews

PMM features a sleek, responsive dashboard designed to present complex project hierarchies and progress graphs clearly.

<img width="1920" height="1032" alt="Project Dashboard View" src="https://github.com/user-attachments/assets/c07e93fc-18df-48fe-a470-32600c1cfae1" />

*Figure 1: Project List View showcasing custom query filtering, pagination, and visual labels.*

<img width="1920" height="1032" alt="Interactive Gantt Timeline & Burn-up Chart" src="https://github.com/user-attachments/assets/73ab8822-d9be-4631-a9e3-a5172a0eff07" />

*Figure 2: The Activities screen where project team members can enter details such as their working hours and the tasks they are working on*

<img width="1920" height="1032" alt="Task Board & Dependencies" src="https://github.com/user-attachments/assets/c65a27b9-669a-4cc1-964f-5d067b1a28a7" />

*Figure 3: A temporary screen where we can enter details (such as user information) that should be imported from other ERP modules*

---   

## Key Features

*   **Hierarchical Project & Subproject Relationships:** Build nested, multi-level parent-child project structures (e.g., Program -> Project -> Sub-project). The backend implements programmatic graph traversal to detect and prevent circular dependencies on updates, ensuring database integrity.
*   **Dynamic Gantt Chart Timeline:** A custom, fully interactive Gantt timeline displaying task planned start-end dates, actual durations, progress meters, and task blockages/dependencies.
*   **Agile Burn-Up Engine:** An advanced analytical system that dynamically aggregates project scope (cumulative planned hours) against actual completed work from timesheet logs, comparing them against a mathematically calculated "Ideal Trend" line to gauge project velocity.
*   **Custom NPOI Excel Reporting:** A server-side report exporter that compiles detailed project/task logs. It calculates scheduling deviations (early/late/on-time) and injects color-coded RichText fonts (green for early, red for delayed) directly into the generated spreadsheet cells without any desktop dependencies.
*   **Granular Task & Subtask Hierarchies:** Support for parent-child task grouping and assignment controls. It provides a highly interactive modal for bulk status updates (Todo, In Progress, Done, Inactive, Waiting for Approval).
*   **Visual Organization Diagrams:** Leverages `@ant-design/graphs` to render real-time project organization charts showing assigned team members, managers, and operational roles.
*   **Comprehensive Timesheet Activity Logging:** Granular timesheet interface allowing employees to record work hours directly against task items, automatically recalculating actual work metrics at both the task and project levels.
*   **High-Fidelity Sandbox Seeding:** An automatic seeder engine (`DummyDataController`) that populates the PostgreSQL database with highly relational and proportional datasets for testing and demonstration.

---

## Tech Stack

PMM is built using a modern, robust, and highly scalable enterprise tech stack.

| Layer | Technology / Library | Purpose & Description |
| :--- | :--- | :--- |
| **Backend Core** | .NET 8 (C#) Web API | Enterprise-grade, high-performance, cross-platform RESTful API. |
| **ORM** | Entity Framework Core 8 | Code-first database persistence utilizing fluent mappings (`ClassMaps`). |
| **Database** | PostgreSQL 15 | Secure, transactional, and relational database. |
| **Dependency Injection**| Autofac | Advanced IoC container supporting modular service registration. |
| **Excel Library** | NPOI | High-performance port for creating styled and rich Excel spreadsheets. |
| **Logging** | Serilog | Structured file and console logging pipeline. |
| **Response Wrapper** | AutoWrapper | Consistent global JSON response schemas across all controllers. |
| **Testing** | xUnit, FluentAssertions, Moq | Test suite covering automated unit and integration tests. |
| **Frontend Framework**| React 19 + TypeScript + Vite 7 | Fast, lightweight, and type-safe Single Page Application environment. |
| **UI Components** | Ant Design v5 | Premium, responsive, and robust component library. |
| **Styling** | TailwindCSS v4 | Utility-first, responsive, and rapid UI styling. |
| **State Management** | Zustand | Highly performant, flux-based minimal global state management. |
| **Routing** | React Router DOM v7 | Single Page Application route management and layouts. |
| **Charts & Graphs** | Recharts & `@ant-design/graphs`| Dynamic SVG-based project metrics and interactive network diagrams. |
| **Client Utilities** | Axios, DayJS, odata-query | REST integration with error interceptors, date parsing, and OData queries. |
| **Infrastructure** | Docker & Docker Compose | Multi-container environment orchestration for simple deployment. |
| **Web Server** | Nginx | Web server hosting compiled SPA static files with router fallback rules. |

---

## Project Architecture and Folder Structure

PMM follows **Clean Architecture** (Onion Architecture) principles combined with Domain-Driven Design (DDD) patterns. This design isolates core business policies from concrete databases, frameworks, and client UIs, enforcing a strict one-way dependency flow.

```
                    ┌──────────────────────────────┐
                    │            PMM.API           │  (Presentation)
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │           PMM.Core           │  (Application)
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │           PMM.Domain         │  (Domain - Core Rules)
                    └──────────────┬───────────────┘
                                   ▲
                                   │
                    ┌──────────────┴───────────────┐
                    │           PMM.Data           │  (Infrastructure Persistence)
                    └──────────────────────────────┘
```

### Folder Layout and Responsibilities

```
project-management-module/
├── PMM.API/                  # Presentation Layer (ASP.NET Core Web API)
│   ├── Controllers/          # REST Endpoint Controllers (Project, Task, Reports, etc.)
│   ├── Extensions/           # Bootstrapping & DI Service Extensions
│   ├── Filters/              # Global Exception & Validation Filters
│   ├── ModelBinders/         # Custom DateOnly / DateTime parameter binders
│   ├── Program.cs            # API Application Bootstrapper
│   └── Dockerfile            # Multi-stage .NET 8 production build
├── PMM.Core/                 # Application Core Layer (Business Logic & Services)
│   ├── Services/             # Business services implementation (ProjectService, TaskService)
│   ├── Validators/           # Command & Form Validation logic
│   ├── Mappers/              # DTO-Entity mappings (using AutoMapper principles)
│   ├── Helpers/              # NPOI Excel & Date Calculators
│   └── Autofac/              # Application Dependency Registration Module
├── PMM.Domain/               # Enterprise Domain Layer (Entities & Contracts)
│   ├── Entities/             # POCO Domain Entities (Project, TaskEntity, User, Client)
│   ├── Interfaces/           # Service & Repository Interfaces (Contracts)
│   ├── Forms/                # Request/Command Objects (Create/Update Forms)
│   └── DTOs/                 # Data Transfer Objects
├── PMM.Data/                 # Infrastructure Persistence Layer (EF Core & Postgres)
│   ├── Contexts/             # ApplicationDbContext & Entity Fluent Mappings (ClassMaps)
│   ├── Repositories/         # Repository Pattern implementation (inheriting generic _BaseRepository)
│   └── Migrations/           # EF Core Database Migrations
├── PMM.UI/                   # Client Layer (React 19 SPA)
│   ├── src/
│   │   ├── components/       # Reusable UI Components (Gantt, Org Diagram, Tables, Dashboard)
│   │   ├── pages/            # Page Views (Dashboard, Details, Projects, Tasks, Activities)
│   │   ├── services/         # Axios-based API client wrappers per domain
│   │   ├── store/            # Global Zustand State Stores
│   │   └── routes.tsx        # React Router routes mapping
│   ├── Dockerfile            # Multi-stage Node build with SPA Nginx configuration
│   └── vite.config.ts        # Vite configuration
├── PMM.UnitTests/            # Automated Unit Test Suite (xUnit)
├── PMM.IntegrationTests/     # Automated Integration Test Suite (xUnit)
└── docker-compose.yaml       # Multi-container orchestration configurations
```

---

## Installation & Setup

### Prerequisites

*   [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
*   [Node.js 20+](https://nodejs.org/)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required for containerized runtime)
*   [PostgreSQL Database](https://www.postgresql.org/) (Required for local non-docker development)

---

### Option A: Running with Docker Compose (Recommended)

This is the fastest way to run the entire stack (React SPA, .NET API, PostgreSQL Database, and Hangfire background engine) inside a unified container network.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MgBeyy/project-management-module.git
    cd project-management-module
    ```

2.  **Create the required docker network:**
    ```bash
    docker network create proxy_network
    ```

3.  **Spin up the containers:**
    ```bash
    docker-compose up -d --build
    ```

4.  **Verify running services:**
    *   **Frontend UI:** `http://localhost:80` (or the port defined in your docker setups)
    *   **Backend API Swagger:** `http://localhost:5000/swagger`
    *   **Hangfire Dashboard:** `http://localhost:5000/hangfire`

---

### Option B: Running Locally (Development Mode)

If you are debugging the code or making modifications, run the backend and frontend separately.

#### 1. Database Setup
Ensure PostgreSQL is running locally and create a database named `pmm_db`.

#### 2. Backend Configuration & Startup
1. Navigate to the API project directory:
   ```bash
   cd PMM.API
   ```
2. Configure your connection string in `appsettings.json` or set it in your local environment variables:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=pmm_db;Username=your_username;Password=your_password"
   }
   ```
3. Run migrations to seed the database schema:
   ```bash
   dotnet ef database update --project ../PMM.Data/PMM.Data.csproj --startup-project PMM.API.csproj
   ```
4. Start the backend server:
   ```bash
   dotnet run
   ```
   *The API will be hosted at `https://localhost:7196` or `http://localhost:5292` (view Swagger for detail).*

#### 3. Frontend Configuration & Startup
1. Navigate to the UI project directory:
   ```bash
   cd ../PMM.UI
   ```
2. Create a `.env` file using the example:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and set the backend API URL:
   ```env
   VITE_APP_API_URL=https://localhost:7196
   ```
4. Install all dependencies and start the Vite server:
   ```bash
   npm install
   npm run dev
   ```
   *The client interface will boot up locally at `http://localhost:5173`.*

---

### 4. Seeding Sandbox Data
To quickly explore the dashboards, use the database seeder:
1. Open the Swagger UI (`/swagger`).
2. Locate the `/api/DummyData/seed-all/{count}` POST endpoint.
3. Provide a count parameter (e.g., `10`) and execute the request.
4. The seeder will automatically inject proportional, relational records across all tables (users, projects, tasks, project assignments, timesheet logs, and labels).

---

## Key Takeaways & Technical Decisions

*   **Clean Architecture Onion Flow:** High decoupling is maintained between layers. The `PMM.Domain` project contains pure POCO definitions and interface contracts, meaning it has zero dependencies on databases (EF Core) or web frameworks (ASP.NET Core), making the core enterprise code future-proof.
*   **Repository and Base Repository Abstract Patterns:** Database operations are centralized inside `_BaseRepository<T>`. Common database mechanics (soft deletion, audit fields via `IAuditable` and `ISoftDeletable`) are captured globally. When saving records, created/modified/deleted tracking fields are automatically populated by overriding EF Core's `SaveChangesAsync`.
*   **Algorithmic Circular Dependency Checks:** To support infinite levels of subproject hierarchies while protecting Kestrel/IIS serialization from infinite cycles, the `ProjectRelationRepository` implements a custom graph traversal method `HasCircularDependencyAsync(int projectId, int parentId)`. This validates relation paths on every update, blocking loops before records persist.
*   **Enterprise-Grade Excel Generation (NPOI):** Creating reports on the server side using the open-source NPOI framework ensures high performance and zero reliance on MS Excel dependencies. Using rich-text calculations, the server color-codes cells dynamically (highlighting delayed deliverables) and saves reports to the filesystem while registering the download records in PostgreSQL.
*   **Agile Burn-Up Engine Logic:** The calculation in `DetailedProjectDto` uses efficient LINQ and dates indexing. It aggregates all task planned hours to define scope boundaries, scans the `Activity` log to compute cumulative completed hours on each calendar day, and calculates the `IdealTrend` rate (Scope / Duration) to plot precise velocity comparisons on a custom Recharts SVG.
*   **Decoupled Request Forms:** Controllers never accept Database Entities directly. By mapping incoming payloads via strictly validated request Forms (e.g. `CreateProjectForm`) and outputting standard DTOs via AutoMapper-equivalent mappings, the API protects internal databases from over-posting vulnerabilities.
*   **Asynchronous Background Tasks:** Offloading maintenance or report exports to a dedicated Hangfire task server ensures that the main Kestrel HTTP thread remains lightweight and available, maintaining excellent response latencies.
*   **Dockerized Reverse Proxy Alignment:** The `docker-compose.yaml` file configures the frontend and backend on an internal network (`proxy_network`) designed to reside behind an SSL-terminating gateway (like Nginx Proxy Manager). Static assets are served via a multi-stage Nginx container configured with single-page routing fallbacks.

---

## Future Roadmap

- [ ] **Comprehensive CI/CD Pipeline:** Configure GitHub Actions to automate code formatting, run lints (`eslint` & `dotnet format`), execute unit and integration tests, and build Docker containers on every pull request.
- [ ] **Increase Test Coverage:** Expand unit testing on `ProjectService` and `TaskService` to 85%+ to secure complex business rules against future refactoring.
- [ ] **Kubernetes (K8s) Orchestration:** Provide Helm charts to enable horizontal scaling of backend API pods and Nginx client pods under heavy ERP web traffic.
- [ ] **Advanced OData Filtering:** Expand OData querying logic on backend repository endpoints to support highly configurable, user-customized search tables on the frontend.
- [ ] **Real-Time Collaboration (SignalR):** Integrate WebSockets to sync team member Gantt edits or timesheet activities instantly, pushing live alerts without page reloads.
- [ ] **Application Observability:** Integrate OpenTelemetry, Prometheus, and Grafana to track database query latencies, request error rates, and API performance metrics in production.

---

## Contact

*   **Developer Name:** Zaid Almoughrabi
*   **LinkedIn Profile:** [linkedin.com/in/zaidalmoughrabi](https://linkedin.com/in/zaidalmoughrabi/)
*   **Email Address:** [zaidalmoughrabi@gmail.com](mailto:[zaidalmoughrabi@gmail.com])
*   **GitHub Repository:** [github.com/MgBeyy/project-management-module](https://github.com/MgBeyy/project-management-module)
