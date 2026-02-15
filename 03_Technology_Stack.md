# SyncSpend - Technology Stack Justification

## Executive Summary

This document provides a detailed justification for the technology choices made for the SyncSpend project. Each technology has been evaluated based on **project requirements**, **team expertise**, **scalability**, **cost-effectiveness**, and **industry best practices**.

---

## Technology Selection Criteria

We evaluated technologies based on:

1. **Alignment with Project Requirements** - Offline-first, privacy-focused, cross-platform
2. **Learning Value** - Academic and career relevance
3. **Development Speed** - Rapid prototyping and iteration
4. **Cost** - Free tier availability for students
5. **Community Support** - Documentation and ecosystem maturity
6. **Scalability** - Future-proof architecture
7. **Team Familiarity** - Existing knowledge and learning curve

---

## Technology Stack Overview

| Layer | Technology | Version | License |
|-------|-----------|---------|---------|
| **Mobile Framework** | React Native | 0.73+ | MIT |
| **Mobile UI Library** | React Native Paper | 5.x | MIT |
| **Mobile Navigation** | React Navigation | 6.x | MIT |
| **Local Database** | SQLite + SQLCipher | 3.x | Public Domain / BSD |
| **Backend Runtime** | Node.js | 20.x LTS | MIT |
| **Backend Framework** | Express.js | 4.x | MIT |
| **Cloud Database** | PostgreSQL | 16.x | PostgreSQL License |
| **Caching** | Redis | 7.x | BSD |
| **Authentication** | JWT + bcrypt | Latest | MIT |
| **API Documentation** | Swagger/OpenAPI | 3.0 | Apache 2.0 |
| **Version Control** | Git + GitHub | - | Free |
| **Deployment** | Render / Railway | - | Free Tier |

---

## 1. Mobile Application Stack

### 1.1 React Native

**Choice**: React Native  
**Alternatives Considered**: Flutter, Native (Swift/Kotlin)

#### Justification

✅ **Pros**:
- **Cross-platform**: Single codebase for Android and iOS (50% development time saved)
- **JavaScript**: Leverages existing web development knowledge
- **Large ecosystem**: 100,000+ npm packages available
- **Hot reload**: Faster development iteration
- **Community**: 116k+ GitHub stars, active community
- **Industry adoption**: Used by Facebook, Instagram, Airbnb, Tesla
- **Learning value**: Highly relevant for mobile development careers

❌ **Cons**:
- Slightly lower performance than native (not critical for our use case)
- Occasional native module issues (mitigated by expo-managed workflow)

#### Why Not Flutter?
- Dart is less industry-standard than JavaScript
- Smaller ecosystem compared to React Native
- Team has existing React knowledge

#### Why Not Native?
- Would require separate codebases for Android (Kotlin) and iOS (Swift)
- Doubles development time and maintenance effort
- Not feasible within semester timeline

#### Performance Considerations
- React Native performance is sufficient for our app (no heavy graphics/gaming)
- Native modules available for performance-critical operations (encryption, database)

---

### 1.2 React Native Paper

**Choice**: React Native Paper  
**Alternatives Considered**: React Native Elements, Native Base

#### Justification

✅ **Material Design 3 compliance** - Modern, professional UI
✅ **Theming support** - Easy light/dark mode
✅ **Accessibility built-in** - Screen reader support
✅ **Well-documented** - Extensive examples and guides
✅ **TypeScript support** - Better developer experience

#### Comparison

| Feature | Paper | Elements | Native Base |
|---------|-------|----------|-------------|
| Material Design | ✓ | ✗ | ✗ |
| Theme Engine | ✓ | ✓ | ✓ |
| Component Count | 50+ | 30+ | 40+ |
| Bundle Size | Medium | Small | Large |
| Documentation | Excellent | Good | Good |

**Decision**: Paper wins due to Material Design compliance and superior theming.

---

### 1.3 SQLite + SQLCipher

**Choice**: SQLite with SQLCipher encryption  
**Alternatives Considered**: Realm, IndexedDB, AsyncStorage

#### Justification

✅ **Offline-first**: Works completely offline (core requirement)
✅ **Performance**: Faster than network calls, optimized for mobile
✅ **Encryption**: SQLCipher provides AES-256 encryption (privacy requirement)
✅ **SQL**: Standard SQL syntax (team familiar)
✅ **Storage**: Efficient for relational data (expenses, budgets, subscriptions)
✅ **React Native support**: `react-native-sqlite-storage` library

#### Why Not AsyncStorage?
- **Limitation**: Key-value store only, not suitable for complex queries
- **No relationships**: Cannot efficiently query related data
- **No encryption**: Stores data in plain text

#### Why Not Realm?
- **Learning curve**: Proprietary query language
- **Bundle size**: Larger than SQLite
- **Overkill**: Advanced features not needed for our use case

#### Storage Capacity
- SQLite can handle databases up to **281 TB** (far exceeds our needs)
- Expected database size: **~10-50 MB** for 1 year of data

---

## 2. Backend Stack

### 2.1 Node.js + Express.js

**Choice**: Node.js with Express framework  
**Alternatives Considered**: Django (Python), Spring Boot (Java), FastAPI (Python)

#### Justification

✅ **JavaScript everywhere**: Same language as mobile app (code reuse)
✅ **Non-blocking I/O**: Excellent for API servers with many concurrent requests
✅ **NPM ecosystem**: Largest package registry (2M+ packages)
✅ **Fast development**: Minimal boilerplate, rapid prototyping
✅ **JSON native**: Natural fit for REST APIs
✅ **Learning value**: Node.js is industry-standard for backend APIs
✅ **Team expertise**: Both team members familiar with JavaScript

#### Performance Comparison

| Runtime | Req/sec (Benchmark) | Startup Time | Memory Usage |
|---------|---------------------|--------------|--------------|
| Node.js + Express | 15,000+ | < 1s | Low |
| Django (Python) | 5,000 | ~2s | Medium |
| Spring Boot (Java) | 20,000+ | ~5s | High |
| FastAPI (Python) | 10,000 | ~1s | Medium |

**Analysis**:
- Spring Boot has better throughput but slow startup (not ideal for serverless/containers)
- FastAPI is fast but Python is slower than Node.js for I/O-bound operations
- Node.js offers the best balance for our API-centric architecture

#### Why Not Django?
- **Language fragmentation**: Would require Python + JavaScript (no code reuse)
- **Slower**: Python is slower for I/O operations
- **Overkill**: Full-featured framework with ORM, admin panel (not needed)

#### Why Not FastAPI?
- **Async complexity**: Requires understanding of Python async/await
- **Less mature ecosystem** for authentication, ORMs compared to Node.js

---

### 2.2 PostgreSQL

**Choice**: PostgreSQL  
**Alternatives Considered**: MySQL, MongoDB, Firebase Firestore

#### Justification

✅ **ACID compliance**: Strong data integrity (financial data requires consistency)
✅ **Relational model**: Perfect fit for our data structure (users ↔ expenses ↔ subscriptions)
✅ **Advanced features**: JSON support, full-text search, complex queries
✅ **Open source**: No licensing costs
✅ **Scalability**: Handles millions of rows efficiently
✅ **Industry standard**: #1 choice for production apps
✅ **Free hosting**: Render, Railway, Supabase offer free tiers

#### Why Not MySQL?
- PostgreSQL has better JSON support (useful for flexible metadata)
- More advanced features (CTEs, window functions for analytics)
- Better standards compliance

#### Why Not MongoDB?
- **Schema-less**: Financial data benefits from strict schema
- **No ACID transactions** (until recent versions)
- **Over-engineering**: NoSQL advantages (horizontal scaling) not needed at our scale
- **SQL skills**: PostgreSQL teaches valuable SQL skills

#### Why Not Firebase Firestore?
- **Vendor lock-in**: Tied to Google ecosystem
- **Pricing**: Can become expensive with scaling
- **Less control**: Managed service limits customization
- **Learning value**: PostgreSQL is more transferable skill

---

### 2.3 Redis

**Choice**: Redis  
**Alternatives Considered**: Memcached, In-memory caching (Node)

#### Justification

✅ **Speed**: Sub-millisecond latency (perfect for session caching)
✅ **Data structures**: Supports strings, hashes, lists, sets (flexible)
✅ **Persistence**: Optional disk persistence (sessions survive restarts)
✅ **Pub/Sub**: Can be used for real-time features (future notification system)
✅ **Free tier**: Render offers free Redis (75 MB)

#### Use Cases in SyncSpend
1. **Session storage**: JWT refresh token blacklist
2. **Query caching**: Analytics results (expensive aggregations)
3. **Rate limiting**: Track API request counts per user
4. **Future**: Real-time notifications via Pub/Sub

#### Why Not Memcached?
- Redis offers more data structures (not just key-value)
- Redis supports persistence (Memcached is memory-only)

#### Why Not In-Memory (Node)?
- Not shared across multiple server instances
- Data lost on server restart

---

## 3. Security & Authentication Stack

### 3.1 JWT (JSON Web Tokens)

**Choice**: JWT with `jsonwebtoken` library  
**Alternatives Considered**: Session cookies, OAuth2

#### Justification

✅ **Stateless**: No server-side session storage needed (scales horizontally)
✅ **Mobile-friendly**: Easy to store and send with API requests
✅ **Standard**: Industry-standard for API authentication (RFC 7519)
✅ **Payload**: Can include user metadata (reduces database queries)
✅ **Cross-domain**: Works across different domains (future web app)

#### Security Measures
- **Short expiration**: Access tokens expire in 15 minutes
- **Refresh tokens**: Long-lived (7 days), stored securely
- **Secret key**: Strong 256-bit secret, environment variable
- **HTTPS only**: Tokens never sent over HTTP

#### Why Not Session Cookies?
- **Stateful**: Requires server-side session storage (Redis overhead)
- **Mobile limitations**: Cookies are web-centric, not ideal for mobile apps

#### Why Not OAuth2?
- **Overkill**: We're not integrating third-party logins (yet)
- **Complexity**: OAuth2 requires authorization server setup
- **Future**: Can add Google/Apple sign-in later (JWT still used internally)

---

### 3.2 bcrypt

**Choice**: bcrypt for password hashing  
**Alternatives Considered**: Argon2, PBKDF2, SHA-256

#### Justification

✅ **Adaptive**: Cost factor increases with hardware improvements
✅ **Salt built-in**: Automatically handles salting
✅ **Industry standard**: Widely trusted and battle-tested
✅ **Slow by design**: Resistant to brute-force attacks (10 rounds = ~100ms)

#### Security Comparison

| Algorithm | Brute-force Time (8-char password) | Memory Hard | Industry Adoption |
|-----------|-------------------------------------|-------------|-------------------|
| bcrypt | ~10 years (10 rounds) | No | Very High |
| Argon2 | ~100 years | Yes | Growing |
| PBKDF2 | ~5 years (100k iterations) | No | High |
| SHA-256 | < 1 hour | No | Low (unsuitable) |

**Why Not Argon2?**
- Newer (2015), less battle-tested
- Slightly more complex to configure
- bcrypt is sufficient for our security needs

**Why Not SHA-256?**
- Not designed for passwords (too fast)
- Vulnerable to rainbow table attacks without salting

---

## 4. Development & Deployment Stack

### 4.1 Version Control: Git + GitHub

**Choice**: Git with GitHub hosting  
**Justification**:
✅ **Industry standard**: Used by 90%+ of developers
✅ **Collaboration**: Pull requests, code reviews, issue tracking
✅ **Free**: Unlimited private repositories for students
✅ **Learning value**: Essential skill for any developer
✅ **CI/CD**: GitHub Actions for automated testing (future)

---

### 4.2 Deployment: Render / Railway

**Choice**: Render (primary) with Railway as backup  
**Alternatives Considered**: Heroku, AWS, Vercel, DigitalOcean

#### Justification

✅ **Free tier**: PostgreSQL + Redis + Web service free for students
✅ **Auto-deploy**: Git push to deploy (CI/CD built-in)
✅ **Zero config**: Automatic HTTPS, environment variables
✅ **Logs**: Built-in logging and monitoring
✅ **PostgreSQL**: Managed database with automatic backups

#### Comparison

| Platform | Free Tier | PostgreSQL | Redis | Ease of Use | Auto-Deploy |
|----------|-----------|------------|-------|-------------|-------------|
| **Render** | ✓ | ✓ | ✓ | Excellent | ✓ |
| **Railway** | ✓ | ✓ | ✓ | Excellent | ✓ |
| Heroku | ✗ (ended 2022) | Paid | Paid | Excellent | ✓ |
| AWS | Complex | Paid | Paid | Difficult | Manual |
| Vercel | ✓ (web only) | ✗ | ✗ | Excellent | ✓ |

**Decision**: Render for simplicity and complete free tier.

---

### 4.3 API Documentation: Swagger/OpenAPI

**Choice**: Swagger + `swagger-jsdoc` + `swagger-ui-express`  
**Justification**:
✅ **Interactive**: Test endpoints directly in browser
✅ **Auto-generated**: From code comments (stays in sync)
✅ **Standardized**: OpenAPI 3.0 specification
✅ **Client generation**: Can generate mobile API client
✅ **Team collaboration**: Clear API contract

---

## 5. Testing Stack (Future Phase)

While not in MVP scope, we've selected:

| Testing Type | Tool | Justification |
|--------------|------|---------------|
| **Backend Unit Tests** | Jest | JavaScript standard, built-in mocking |
| **Backend Integration Tests** | Supertest | Easy API endpoint testing |
| **Mobile Unit Tests** | Jest + React Native Testing Library | Component testing |
| **Mobile E2E Tests** | Detox | Automated UI testing on simulators |
| **Database Tests** | Jest + in-memory SQLite | Fast, isolated tests |

---

## 6. Cost Analysis

### Development Phase (Semester)

| Service | Cost | Notes |
|---------|------|-------|
| Development machines | $0 | Personal laptops |
| Render (PostgreSQL + Redis + API) | $0 | Free tier sufficient |
| GitHub | $0 | Student account |
| Google Play Console | $25 | One-time fee (optional for MVP) |
| Apple Developer | $0 | Not deploying to App Store in MVP |
| **Total** | **$0-25** | Minimal investment |

### Post-Deployment (100 users)

| Service | Cost/month | Notes |
|---------|------------|-------|
| Render (Database + API) | $0 | Still within free tier |
| Redis | $0 | Free tier 75 MB |
| Domain name | $10-15 | Optional |
| **Total** | **$0-15** | Highly affordable |

### Scaling (1,000+ users)

| Service | Cost/month | Notes |
|---------|------------|-------|
| Render (Paid plan) | $7 | PostgreSQL |
| Render (Web service) | $7 | API server |
| Redis | $10 | Upstash paid tier |
| **Total** | **$24** | Still very affordable |

---

## 7. Technology Risk Assessment

| Technology | Risk Level | Mitigation |
|-----------|------------|------------|
| React Native | Low | Mature, large community |
| Node.js + Express | Low | Battle-tested, stable APIs |
| PostgreSQL | Low | Industry standard, well-documented |
| SQLite | Low | Embedded, reliable |
| JWT | Medium | Proper secret management + HTTPS |
| Redis | Low | Optional (graceful degradation without cache) |
| Render/Railway | Medium | Have backup deployment option |

---

## 8. Learning Outcomes

By using this stack, the team will gain:

1. **Full-stack development**: Mobile + Backend + Database
2. **Industry-relevant skills**: React Native, Node.js, PostgreSQL
3. **Cloud deployment**: DevOps basics, CI/CD
4. **Security**: Authentication, encryption, API security
5. **Database design**: Relational modeling, SQL, indexing
6. **Software architecture**: Offline-first, sync patterns, REST APIs
7. **Mobile development**: Cross-platform development, offline storage

---

## 9. Alternative Stacks Considered

### Stack Option 2: Flutter + Firebase

| Component | Technology |
|-----------|-----------|
| Mobile | Flutter |
| Backend | Firebase (BaaS) |
| Database | Firestore |
| Auth | Firebase Auth |

**Why Not Chosen**:
- ❌ Vendor lock-in (Google)
- ❌ Less control over backend logic
- ❌ Limited learning (no backend development)
- ❌ Pricing concerns at scale
- ✅ Faster MVP (only pro)

### Stack Option 3: Native + Spring Boot

| Component | Technology |
|-----------|-----------|
| Mobile Android | Kotlin |
| Mobile iOS | Swift |
| Backend | Spring Boot (Java) |
| Database | PostgreSQL |

**Why Not Chosen**:
- ❌ Double development time (2 mobile codebases)
- ❌ Team not familiar with Java/Kotlin/Swift
- ❌ Overkill for project scope
- ✅ Best performance (only pro)

---

## 10. Final Recommendation

The **React Native + Node.js + PostgreSQL** stack is the optimal choice because:

1. ✅ **Meets all requirements**: Offline-first, privacy-focused, cross-platform
2. ✅ **Balanced**: Performance, development speed, learning value
3. ✅ **Cost-effective**: Free for development and initial deployment
4. ✅ **Industry-relevant**: Skills transferable to job market
5. ✅ **Risk-appropriate**: Mature technologies with large communities
6. ✅ **Scalable**: Can handle growth from 10 to 10,000+ users
7. ✅ **Team-aligned**: Builds on existing JavaScript knowledge

---

**Document Version**: 1.0  
**Last Updated**: February 12, 2026  
**Authors**: Aarya Patil, Prathmesh Bhardwaj  
**Project**: SyncSpend - Technology Stack Justification
