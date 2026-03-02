
Study Project – Phase 2 Document
(Design & Proof of Concept)
________________________________________
# Cover Page

**Course Title**: Study Project  
**Project Title**: SyncSpend — Privacy-First UPI Expense Intelligence  
**Student Name(s)**:  Aarya Patil  , Prathmesh Bhardwaj  
**Student ID(s)**:  2023EBCS778  , 2023EBCS614  
**Project Advisor / Supervisor**: Preethy P Johny
**Date of Submission**: February 16, 2026  

________________________________________

## 1. Introduction

### 1.1 Purpose of Phase 2
The objective of Phase 2 is to translate the problem definition from Phase 1 into a concrete system design and demonstrate feasibility through a Proof of Concept (PoC). This phase focuses on:
- Designing a privacy-first, on-device architecture for UPI expense tracking.
- Defining the data flow from Android SMS inbox to a local persistent database.
- Validating the core technology (SMS reading and regex parsing) via a working operational prototype.

### 1.2 Scope of Phase 2
Phase 2 includes:
- **System Architecture**: Detailed design of the mobile application, including the new local SQLite database layer.
- **Module Design**: Specification of functional modules (SMS Reader, UPI Parser, Database Service, UI components).
- **Data Design**: Schema for local storage and data flow diagrams.
- **Proof of Concept**: A fully functional React Native application that reads SMS, identifies UPI transactions, and displays a spend summary.

________________________________________

## 2. System Overview

### 2.1 Product Perspective
SyncSpend is a standalone Android mobile application. It operates entirely offline, using the device’s internal SMS inbox as its primary data source. It does not rely on any external backend server or cloud API, ensuring 100% user privacy.

### 2.2 Major System Functions
- **SMS Scanning**: securely accessing the Android SMS inbox with user permission.
- **UPI Transaction Parsing**: Identifying financial transactions using regex patterns.
- **Data Persistence**: Storing parsed transactions locally in SQLite for historical analysis.
- **Expense Dashboard**: Visualizing total spending, income, and transaction history.
- **Privacy Assurance**: Operating without network permissions (Zero Knowledge architecture).

### 2.3 User Classes and Characteristics
- **End Users**: Individuals who use UPI for daily payments and want to track expenses without manually entering data or sharing financial details with third-party servers.

________________________________________

## 3. Functional Requirements

### FR1: SMS Access & Security
- The system shall request `READ_SMS` permission explicitly at runtime.
- The system shall only read messages from the 'inbox' folder.
- The system must not transmit any SMS data over the network.

### FR2: Transaction Parsing
- The system shall identify UPI transactions using keywords (e.g., "debited", "credited", "UPI", "VPA").
- The system shall extract transaction amount, date, valid merchant/payee name, and bank name.
- The system shall differentiate between 'Debit' and 'Credit' transactions.

### FR3: Data Persistence (Phase 2)
- The system shall store parsed transactions in a local SQLite database.
- The system shall check for new messages since the last scan timestamp to avoid duplicates.

### FR4: User Interface
- The system shall display a "Spend Summary" card showing Total Spent and Total Received.
- The system shall provide a scrollable list of individual transactions.

________________________________________

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **Scan Speed**: Must parse at least 200 SMS messages per second.
- **Launch Time**: Dashboard should load cached data in < 1 second.

### 4.2 Security Requirements
- **Data Privacy**: No data shall leave the device.
- **Permissions**: Minimize permissions to only `READ_SMS`.

### 4.3 Usability Requirements
- **Automation**: Users should not need to manually input any transaction details.
- **Clarity**: Parsed merchant names should be readable (e.g., "SWIGGY" instead of "VPA-SWIGGY@HDFC").

________________________________________

## 5. System Architecture and Design

### 5.1 System Architecture Diagram
The system follows a 3-layer on-device architecture:

1.  **Presentation Layer**: React Native UI (Home, Dashboard).
2.  **Business Logic Layer**: Services for SMS reading (`react-native-get-sms-android`), Parsing (Regex Engine), and Database management.
3.  **Data Layer**: Android SMS Content Provider (Source) and SQLite Database (Storage).


### 5.2 Module-wise Design
- **SMS Reader Service**: Bridges Native Android APIs to JavaScript.
- **UPI Parser Engine**: Contains logic to regex-match and extract fields.
- **Database Service**: Manages SQLite tables for `transactions` and `metadata`.
- **UI Components**: Glassmorphism-styled cards and lists.


### 5.3 Data Flow Design
1.  **Input**: Raw SMS JSON from Android OS.
2.  **Process**: Filter -> Regex Extract -> Clean/Format.
3.  **Storage**: INSERT into SQLite `transactions` table.
4.  **Output**: SELECT aggregated SUMs for Dashboard.


### 5.4 Database Design
The system uses a rigid SQLite schema:
- **Table `transactions`**: Stores `id`, `amount`, `merchant`, `date`, `type`, `bank`.
- **Table `metadata`**: Stores operational state like `last_scan_timestamp`.


________________________________________

## 6. Technology Stack and Justification

### Frontend
- **React Native (Expo)**: Cross-platform framework allowing rapid UI development with hot-reload.
- **TypeScript**: Ensures type safety for transaction data models.

### Backend / Storage
- **SQLite (expo-sqlite)**: Robust, SQL-based local storage for querying transaction history.
- **No Remote Backend**: Chosen deliberately for privacy and zero operational cost.

### Utils
- **react-native-get-sms-android**: Specialized library for accessing Android inbox.


________________________________________

## 7. Proof of Concept (PoC)

### 7.1 PoC Description
We have implemented a **functional MVP (Minimum Viable Product)** that validates the core technical risk: accessing and parsing SMS on Android devices.
- **Implemented**: Full SMS reading pipeline, Regex parsing engine (90%+ accuracy on standard formats), and the React Native UI.
- **Validation**: The PoC successfully reads real SMS messages on a physical device permissions and displays the correct total spend.

### 7.2 PoC Demonstration Details
- **Current Capability**:
    - App installs on Android.
    - Requests Permissions.
    - Scans Inbox (last 1000 messages).
    - Displays "Total Spent" and "Total Received".
    - Lists individual transactions with correct Merchant names.
- **Limitations**:
    - Data is currently held in-memory (RAM) and lost on app close (Persistence is the immediate next step).
    - Categorization is not yet implemented.

________________________________________

## 8. Testing and Validation Strategy

- **Unit Testing**: Jest tests for the Regex Parser logic (validating against sample SMS strings).
- **Manual Testing**: Installing the APK on different Android devices (Samsung, Pixel, Xiaomi) to verify SMS format compatibility.
- **Performance Testing**: Measuring scan time for large inboxes (5000+ messages).

________________________________________

## 9. Risks, Challenges, and Mitigation

- **Risk**: SMS formats change by banks.
    - *Mitigation*: flexible regex patterns and "Unknown" fallback.
- **Risk**: Android Permission policy changes.
    - *Mitigation*: Keeping `targetSdkVersion` updated and complying with Google Play policies for SMS apps.
- **Risk**: Performance on low-end devices.
    - *Mitigation*: Parsing in batches (pagination) and using SQLite for indexing.

________________________________________

## 10. Phase 2 Outcomes and Readiness for Phase 3

### 10.1 Current Status (What is Implemented)
We have successfully built the **Standalone MVP (Minimum Viable Product)**.
- [x] **SMS Reading Engine**: Native Android bridge to securely access inbox.
- [x] **Regex Parser**: Intelligent extraction of Amount, Merchant, and Reference ID.
- [x] **Local Persistence**: Designed and partially implemented SQLite storage for history.
- [x] **UI/UX**: Complete React Native implementation with Glassmorphism design.

### 10.2 Future Scope (Phase 3 Implementation)
The next phase transforms the "MVP" into the "Full Product" by adding connectivity and intelligence.

**1. Cloud Backend & Sync**
- **Objective**: Allow users to switch devices without losing data.
- **Tech Stack**: Node.js + PostgreSQL.
- **Implementation**:
    - Develop REST API for `POST /sync` and `GET /restore`.
    - Implement End-to-End Encryption (keys remain on device).

**2. Smart Categorization**
- **Objective**: Auto-label "Swiggy" as "Food" and "Uber" as "Travel".
- **Implementation**:
    - Build a crowdsourced mapping database (anonymized merchant names).
    - Update the local parser to query this map.

**3. Advanced Analytics**
- **Objective**: Monthly budgeting, category breakdown, and alerts.
- **Implementation**: Visual charts (Victory Native) within the Dashboard.

________________________________________

## 11. Supervisor Review and Approval
**Advisor Feedback**:  
**Supervisor Comments**:  
**Recommendations**:  

**Signature**: ___________________________  
**Date**: _______________________________
