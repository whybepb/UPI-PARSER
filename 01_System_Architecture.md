# SyncSpend - System Architecture Documentation

## 1. Overview

SyncSpend is a **privacy-first, offline-capable expense tracking and subscription intelligence mobile application**. The system is designed as a **three-tier architecture** with:

1. **Mobile Application Layer** (React Native)
2. **Backend API Layer** (Node.js + Express)
3. **Data Persistence Layer** (SQLite local + PostgreSQL cloud)

## 2. High-Level Architecture Diagram

```mermaid
graph LR
    subgraph "Mobile Layer"
        UI[React Native UI]
        LocalDB[(SQLite Local)]
        SyncEngine[Sync Engine]
        OfflineQueue[Offline Queue]
    end
    
    subgraph "Backend Layer"
        API[REST API - Express.js]
        Auth[Auth Service - JWT]
        ExpenseService[Expense Service]
        SubsService[Subscription Detection]
        AnalyticsEngine[Analytics Engine]
    end
    
    subgraph "Data Layer"
        CloudDB[(PostgreSQL)]
        Cache[(Redis Cache)]
    end
    
    UI --> LocalDB
    UI --> SyncEngine
    SyncEngine --> OfflineQueue
    OfflineQueue --> API
    
    API --> Auth
    API --> ExpenseService
    API --> SubsService
    API --> AnalyticsEngine
    
    ExpenseService --> CloudDB
    SubsService --> CloudDB
    AnalyticsEngine --> Cache
    CloudDB --> Cache
    
    style UI fill:#4A90E2,stroke:#2C3E50,stroke-width:2px,color:white
    style LocalDB fill:#50C878,stroke:#27AE60,stroke-width:2px,color:black
    style API fill:#FF6B6B,stroke:#C0392B,stroke-width:2px,color:black
    style CloudDB fill:#9B59B6,stroke:#8E44AD,stroke-width:2px,color:white
```

## 3. Offline-First Architecture

```mermaid
sequenceDiagram
    participant User
    participant MobileApp
    participant LocalSQLite
    participant SyncQueue
    participant Backend
    participant CloudDB
    
    User->>MobileApp: Add Expense (Offline)
    MobileApp->>LocalSQLite: Save Locally
    LocalSQLite-->>MobileApp: Saved ✓
    MobileApp->>SyncQueue: Queue for Sync
    
    Note over MobileApp: Network Available
    
    SyncQueue->>Backend: Sync Pending Data
    Backend->>CloudDB: Persist Data
    CloudDB-->>Backend: Success
    Backend-->>SyncQueue: Sync Complete
    SyncQueue->>LocalSQLite: Mark as Synced
```

## 4. Component Architecture

### 4.1 Mobile Application Components

```mermaid
graph LR
    subgraph "Presentation Layer"
        AuthUI[Auth Screens]
        DashboardUI[Dashboard]
        ExpenseUI[Expense Screens]
        SubsUI[Subscription Screens]
    end
    
    subgraph "Business Logic"
        ExpenseManager[Expense Manager]
        SubsDetector[Subscription Detector]
        BudgetTracker[Budget Tracker]
        SyncManager[Sync Manager]
    end
    
    subgraph "Data Layer"
        LocalStorage[Local Storage - SQLite]
        AsyncStorage[AsyncStorage - User Prefs]
    end
    
    AuthUI --> ExpenseManager
    DashboardUI --> BudgetTracker
    ExpenseUI --> ExpenseManager
    SubsUI --> SubsDetector
    
    ExpenseManager --> LocalStorage
    SubsDetector --> LocalStorage
    BudgetTracker --> LocalStorage
    SyncManager --> LocalStorage
    SyncManager --> AsyncStorage
    
    style AuthUI fill:#4A90E2
    style LocalStorage fill:#50C878
```

### 4.2 Backend Services Components

```mermaid
graph TB
    subgraph "API Gateway"
        Router[Express Router]
        Middleware[Auth Middleware]
    end
    
    subgraph "Core Services"
        UserService[User Service]
        ExpenseService[Expense Service]
        SubService[Subscription Service]
        BudgetService[Budget Service]
        AnalyticsService[Analytics Service]
    end
    
    subgraph "Intelligence Layer"
        SubDetection[Subscription Detection Engine]
        AnomalyDetection[Anomaly Detection]
        BudgetForecasting[Budget Forecasting]
    end
    
    Router --> Middleware
    Middleware --> UserService
    Middleware --> ExpenseService
    Middleware --> SubService
    Middleware --> BudgetService
    Middleware --> AnalyticsService
    
    ExpenseService --> SubDetection
    ExpenseService --> AnomalyDetection
    BudgetService --> BudgetForecasting
    
    style Router fill:#FF6B6B
    style SubDetection fill:#F39C12
    style AnomalyDetection fill:#E74C3C
```

## 5. Data Flow Diagrams

### 5.1 Expense Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant LocalDB
    participant SyncEngine
    participant API
    participant SubDetector
    participant CloudDB
    
    User->>UI: Enter Expense Details
    UI->>UI: Client-side Validation
    UI->>LocalDB: Save Expense (Offline)
    LocalDB-->>UI: Success + Local ID
    UI->>SyncEngine: Queue for Sync
    
    Note over SyncEngine: When Online
    
    SyncEngine->>API: POST /api/expenses
    API->>API: Validate & Authenticate
    API->>CloudDB: Insert Expense
    CloudDB-->>API: Server ID
    API->>SubDetector: Check for Subscription Pattern
    SubDetector-->>API: Pattern Result
    API-->>SyncEngine: Response (Server ID + Sub Info)
    SyncEngine->>LocalDB: Update with Server ID
    SyncEngine->>UI: Sync Complete
```

### 5.2 Subscription Detection Flow

```mermaid
graph TB
    A[New Expense Added] --> B{Amount Similar to<br/>Previous Expense?}
    B -->|Yes| C{Same Merchant?}
    B -->|No| Z[Mark as One-time]
    C -->|Yes| D{Time Interval<br/>Regular?}
    C -->|No| Z
    D -->|Yes 28-32 days| E[Flag as Monthly Subscription]
    D -->|Yes ~7 days| F[Flag as Weekly Subscription]
    D -->|Yes ~365 days| G[Flag as Yearly Subscription]
    D -->|No| Z
    
    E --> H[Create Subscription Record]
    F --> H
    G --> H
    H --> I[Schedule Renewal Reminder]
    
    style E fill:#27AE60
    style F fill:#3498DB
    style G fill:#9B59B6
    style H fill:#E74C3C
```

## 6. Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        LocalEnc[Local DB Encryption - SQLCipher]
        SecureStore[Secure Storage - Keychain/Keystore]
        SSLPin[SSL Pinning]
    end
    
    subgraph "Transport Security"
        HTTPS[HTTPS/TLS 1.3]
        CertPin[Certificate Pinning]
    end
    
    subgraph "Server Security"
        JWT[JWT Authentication]
        RBAC[Role-Based Access Control]
        RateLimit[Rate Limiting]
        Sanitization[Input Sanitization]
        Encryption[Data Encryption at Rest]
    end
    
    LocalEnc --> HTTPS
    SecureStore --> HTTPS
    SSLPin --> HTTPS
    HTTPS --> JWT
    CertPin --> JWT
    JWT --> RBAC
    RBAC --> RateLimit
    RateLimit --> Sanitization
    Sanitization --> Encryption
    
    style LocalEnc fill:#E74C3C
    style JWT fill:#3498DB
    style Encryption fill:#9B59B6
```

## 7. Deployment Architecture

```mermaid
graph TB
    subgraph "User Devices"
        Android[Android App]
        iOS[iOS App]
    end
    
    subgraph "Load Balancer"
        LB[NGINX / Cloud LB]
    end
    
    subgraph "Application Servers"
        API1[API Server 1]
        API2[API Server 2]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL Primary)]
        PGR[(PostgreSQL Read Replica)]
        RedisCache[(Redis)]
    end
    
    subgraph "Storage"
        S3[Object Storage - Optional]
    end
    
    Android --> LB
    iOS --> LB
    LB --> API1
    LB --> API2
    
    API1 --> PG
    API1 --> RedisCache
    API2 --> PG
    API2 --> RedisCache
    
    PG --> PGR
    API1 --> S3
    API2 --> S3
    
    style Android fill:#3DDC84
    style iOS fill:#147EFB
    style LB fill:#F39C12
    style PG fill:#336791
```

## 8. Technology Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile Frontend** | React Native | Cross-platform mobile development |
| **Local Database** | SQLite + SQLCipher | Offline storage with encryption |
| **Backend API** | Node.js + Express | RESTful API server |
| **Cloud Database** | PostgreSQL | Primary data persistence |
| **Caching** | Redis | Session & query caching |
| **Authentication** | JWT + bcrypt | Secure auth with password hashing |
| **Hosting** | Render / Railway / AWS | Cloud deployment |

## 9. Key Architectural Decisions

### 9.1 Offline-First Design
**Decision**: All data operations work offline by default  
**Rationale**: Users need to track expenses even without internet connectivity  
**Implementation**: Local SQLite database with background sync queue

### 9.2 Privacy-First Approach
**Decision**: Data minimization and local-first processing  
**Rationale**: Build user trust and comply with privacy expectations  
**Implementation**: 
- All sensitive analytics run locally
- Cloud sync is optional
- No third-party analytics SDKs

### 9.3 Hybrid Intelligence
**Decision**: Simple rule-based detection, not ML  
**Rationale**: 
- ML requires large datasets (privacy conflict)
- Rule-based is explainable and transparent
- Sufficient for MVP phase

**Implementation**:
- Pattern matching for subscriptions
- Threshold-based anomaly detection
- Time-series analysis for budgets

## 10. Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| App Launch Time | < 2s | Time to interactive |
| Expense Entry | < 500ms | Save to local DB |
| Sync Time | < 5s | For 100 expenses |
| API Response Time | < 200ms | P95 latency |
| Offline Capability | 100% | All core features |
| Database Size | < 50MB | For 1 year data |

## 11. Scalability Considerations

- **Horizontal Scaling**: Stateless API servers behind load balancer
- **Database**: Read replicas for analytics queries
- **Caching**: Redis for frequently accessed data
- **CDN**: Static assets served via CDN (future)
- **Microservices**: Monolith for MVP, modular for future split

## 12. Future Architecture Extensions

```mermaid
graph TB
    Current[Current: Monolithic Backend]
    
    Future1[Subscription Microservice]
    Future2[Analytics Microservice]
    Future3[Notification Service]
    Future4[ML Service - Anomaly Detection]
    
    Current -.Phase 2.-> Future1
    Current -.Phase 2.-> Future2
    Current -.Phase 3.-> Future3
    Current -.Phase 4.-> Future4
    
    style Current fill:#3498DB
    style Future1 fill:#95A5A6
    style Future2 fill:#95A5A6
    style Future3 fill:#95A5A6
    style Future4 fill:#95A5A6
```

---

**Document Version**: 1.0  
**Last Updated**: February 12, 2026  
**Authors**: Aarya Patil, Prathmesh Bhardwaj  
**Project**: SyncSpend - Privacy-First Expense Intelligence
