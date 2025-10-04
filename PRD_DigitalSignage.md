# Digital Signage System - Product Requirement Document (PRD)

**Version:** 1.0  
**Date:** October 4, 2025  
**Status:** Phase 1 Complete / Phase 2 In Development  

---

## 1. Executive Summary

### 1.1 Product Overview
Digital Signage System is a comprehensive enterprise-grade solution for managing digital display networks across multiple locations. The system provides centralized content management, device monitoring, scheduling, and user-based content delivery through a modern web interface and robust API infrastructure.

### 1.2 Business Objectives
- **Centralized Management**: Single platform to manage hundreds of digital displays
- **User-Centric Content**: Personalized content delivery based on user authentication
- **Real-time Operations**: Live monitoring and instant content updates
- **Scalable Architecture**: Support for enterprise-level deployments
- **Security First**: Role-based access control with comprehensive audit trails

### 1.3 Target Users
- **System Administrators**: Full system management and configuration
- **Content Managers**: Media upload, playlist creation, scheduling
- **End Users**: Personal schedule and content access
- **IT Operations**: Device monitoring and technical management

---

## 2. Technical Architecture

### 2.1 System Architecture
- **Backend**: .NET 8 Web API with Clean Architecture
- **Frontend**: Next.js 15 with React Server Components
- **Database**: PostgreSQL 14+ with Entity Framework Core
- **Storage**: AWS S3 for media files with presigned URLs
- **Real-time**: SignalR WebSockets for live updates
- **Authentication**: JWT with refresh token rotation

### 2.2 Performance Requirements
- **Response Time**: < 200ms for API calls
- **Concurrent Users**: Support 500+ simultaneous admin users
- **Device Capacity**: Support 10,000+ devices per instance
- **Uptime**: 99.9% availability SLA
- **Media Streaming**: < 3s content load time on devices

---

## 3. Core Features & Requirements

### 3.1 Authentication & User Management

#### 3.1.1 User Authentication
- **JWT-based Authentication** with secure token rotation
- **Role-based Access Control**: Admin, User, Device roles
- **Multi-factor Authentication** support (future enhancement)
- **Session Management** with automatic logout

#### 3.1.2 User Roles & Permissions
```
Admin Role:
├── Full system access
├── User management (CRUD)
├── Device provisioning
├── System configuration
└── Analytics & reporting

User Role:
├── Personal content management
├── Assigned device access
├── Schedule viewing/editing
└── Media upload (personal)

Device Role:
├── Content retrieval
├── Status reporting
└── Heartbeat communication
```

### 3.2 Device Management

#### 3.2.1 Device Registration
- **QR Code Registration**: Scan QR code for instant provisioning
- **PIN-based Registration**: Manual device registration with 6-digit PIN
- **Admin Approval Workflow**: Pending → Approved → Active states
- **Device Authentication**: Unique device keys for API access

#### 3.2.2 Device Monitoring
- **Real-time Status**: Online/Offline/Error/Maintenance states
- **Heartbeat System**: 30-second device health checks
- **Hardware Information**: Model, resolution, Android version tracking
- **Performance Metrics**: CPU, memory, storage monitoring
- **Remote Diagnostics**: Log collection and error reporting

#### 3.2.3 Device Groups & Hierarchy
- **Hierarchical Organization**: Tree structure with unlimited depth
- **Path-based Addressing**: `/Company/Building/Floor/Room`
- **Bulk Operations**: Apply settings to entire groups
- **Permission Inheritance**: Group-based access control

### 3.3 Content & Media Management

#### 3.3.1 Media Library
- **File Types**: Images (PNG, JPG), Videos (MP4, WebM), HTML content
- **Storage**: AWS S3 integration with CDN distribution
- **Metadata Management**: Tags, descriptions, categories
- **Preview System**: Thumbnail generation and media preview
- **Bulk Upload**: Multiple file upload with progress tracking

#### 3.3.2 Content Organization
- **Folder Structure**: Hierarchical media organization
- **Search & Filter**: Full-text search with advanced filters
- **Version Control**: Media versioning and rollback capability
- **Access Control**: User-specific media permissions

### 3.4 Scheduling System

#### 3.4.1 Schedule Management
- **Time-based Scheduling**: Start/end times with timezone support
- **Recurring Schedules**: Daily, weekly, monthly patterns
- **Priority System**: 3-tier priority (User → Group → Default)
- **Conflict Resolution**: Automatic schedule conflict handling

#### 3.4.2 User-Based Content Assignment
- **Personal Schedules**: Individual user content assignment
- **Email-based Matching**: Automatic user identification
- **Replace Semantics**: New assignments replace existing ones
- **Real-time Updates**: Instant schedule changes via WebSocket

#### 3.4.3 Playlist Management
- **Content Sequencing**: Ordered media playback
- **Duration Control**: Per-item display duration
- **Fallback Content**: Default content when no schedule active
- **Dynamic Playlists**: Condition-based content selection

### 3.5 Real-time Communication

#### 3.5.1 WebSocket Infrastructure
- **SignalR Integration**: Bi-directional real-time communication
- **Connection Management**: Automatic reconnection and failover
- **Message Broadcasting**: Group-based message distribution
- **Authentication**: JWT-secured WebSocket connections

#### 3.5.2 Live Updates
- **Device Status**: Real-time online/offline notifications
- **Content Changes**: Instant schedule and playlist updates
- **System Alerts**: Hardware issues and error notifications
- **Admin Notifications**: Registration requests and system events

### 3.6 Analytics & Reporting

#### 3.6.1 Dashboard Metrics
- **Device Statistics**: Online/offline counts and trends
- **Content Performance**: View counts and engagement metrics
- **System Health**: Performance and error rate monitoring
- **User Activity**: Login patterns and usage statistics

#### 3.6.2 Audit Trail
- **Complete Audit Log**: All system changes tracked
- **User Context**: Link all actions to authenticated users
- **DateTime Compliance**: PostgreSQL-compatible timestamp handling
- **Export Capability**: CSV/PDF report generation

---

## 4. User Interface Requirements

### 4.1 Admin Dashboard
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live data refresh without page reload
- **Interactive Charts**: Device status and analytics visualization
- **Dark/Light Mode**: User preference-based theme switching

### 4.2 Navigation Structure
```
Dashboard
├── Overview & Analytics
├── Real-time Device Status
└── Quick Actions

Devices
├── Device List & Management
├── Registration Approval
└── Remote Diagnostics

Device Groups
├── Hierarchical Tree View
├── Group Management (CRUD)
└── Bulk Operations

Media
├── Media Library & Upload
├── Content Organization
└── Preview & Metadata

Playlists
├── Playlist Creation
├── Content Sequencing
└── Schedule Assignment

Schedules
├── Schedule Management
├── User Assignment
└── Conflict Resolution

Users
├── User Management (CRUD)
├── Role Assignment
└── Permission Control

Analytics
├── Performance Metrics
├── Usage Reports
└── System Monitoring

Settings
├── System Configuration
├── Integration Settings
└── Security Policies
```

### 4.3 Form & Data Entry
- **React Hook Form**: Optimized form handling
- **Zod Validation**: Type-safe schema validation
- **Auto-save**: Draft preservation for long forms
- **Bulk Operations**: Multi-select actions across tables

---

## 5. Security Requirements

### 5.1 Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Token Rotation**: Automatic refresh token cycling
- **Session Timeout**: Configurable inactivity timeout
- **Brute Force Protection**: Login attempt rate limiting

### 5.2 Authorization Framework
- **Role-Based Access Control (RBAC)**: Granular permission system
- **Resource-Level Permissions**: Per-device/group access control
- **API Security**: All endpoints require authentication
- **Device Authentication**: Unique device key validation

### 5.3 Data Protection
- **Encryption at Rest**: Database and S3 storage encryption
- **Encryption in Transit**: TLS 1.3 for all communications
- **Secure URLs**: Presigned URLs with 24-hour expiration
- **Audit Logging**: Complete activity trail for compliance

---

## 6. Integration Specifications

### 6.1 Android TV Client
- **Self-Registration**: QR code and PIN-based registration
- **Content Synchronization**: Automatic media download and caching
- **Offline Operation**: Continue displaying cached content when disconnected
- **Remote Control**: WebSocket-based remote management

### 6.2 External Integrations
- **AWS S3**: Media storage and CDN distribution
- **SignalR**: Real-time communication infrastructure
- **PostgreSQL**: Primary data persistence
- **Email Service**: User notifications and alerts (future)

---

## 7. Performance & Scalability

### 7.1 Performance Targets
- **API Response**: < 200ms average response time
- **Media Loading**: < 3s content load on devices
- **Concurrent Users**: 500+ simultaneous admin sessions
- **Database Performance**: < 10% overhead for audit logging

### 7.2 Scalability Architecture
- **Horizontal Scaling**: Multi-instance deployment support
- **Database Optimization**: Connection pooling and query optimization
- **Media CDN**: Global content distribution network
- **Caching Strategy**: Redis integration for session management

---

## 8. Development Status & Roadmap

### 8.1 Phase 1 - Completed ✅
- ✅ Core authentication and user management
- ✅ Device registration and monitoring
- ✅ Basic content management
- ✅ Schedule system implementation
- ✅ Admin dashboard interface
- ✅ WebSocket real-time updates

### 8.2 Phase 2 - In Progress 🚧
- 🚧 Advanced device grouping
- 🚧 User-based content assignment
- 🚧 Enhanced analytics dashboard
- 🚧 Audit trail system
- 🚧 Performance optimization

### 8.3 Phase 3 - Planned 📋
- 📋 Multi-tenant support
- 📋 Advanced reporting system
- 📋 Mobile application
- 📋 API rate limiting
- 📋 Multi-language support

---

## 9. Quality Assurance

### 9.1 Testing Strategy
- **Unit Tests**: 80%+ code coverage target
- **Integration Tests**: API endpoint validation
- **E2E Tests**: Playwright automated testing
- **Performance Tests**: Load testing with realistic data

### 9.2 Monitoring & Alerting
- **Application Monitoring**: Real-time performance tracking
- **Error Tracking**: Automated error collection and alerts
- **Health Checks**: System availability monitoring
- **Usage Analytics**: User behavior and system utilization

---

## 10. Deployment & Operations

### 10.1 Deployment Architecture
- **Containerized Deployment**: Docker + Kubernetes support
- **Environment Separation**: Dev → Staging → Production
- **Database Migration**: Automated schema updates
- **Zero-Downtime Deployment**: Blue-green deployment strategy

### 10.2 Maintenance & Support
- **Automated Backups**: Daily database and media backups
- **Log Management**: Centralized logging with rotation
- **Update Mechanism**: Automated system updates
- **Support Documentation**: Comprehensive admin guides

---

**Document Maintained By:** Digital Signage Development Team  
**Last Updated:** October 4, 2025  
**Next Review:** November 2025