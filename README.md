# 🏨 DISTRIBUTED RESERVATION INFRASTRUCTURE

A scalable, secure, and fault-tolerant **microservice-based hotel booking platform** built to handle concurrent reservations, ensure data integrity, and deliver seamless user experiences across distributed systems.

## 🚀 Overview
**Distributed Reservation Infrastructure** is architected with a service-oriented design to ensure reliability, scalability, and maintainability.  
It leverages **Go**, **TypeScript**, **Redis**, and **PostgreSQL** to deliver consistent booking operations and asynchronous event handling — even under high concurrency.

## 🧩 Architecture Highlights
- **Microservice Architecture** — Independently deployable services for booking, authentication, notifications, and reviews, ensuring modularity and ease of scaling.
- **Go-Powered Authentication Gateway** — Central gateway with JWT authentication and reverse-proxy routing to securely manage and unify access across all backend services.
- **Express.js + TypeScript Services** — Lightweight, type-safe services for bookings, reviews, and notifications with clear separation of concerns.

## 🔐 Reliability & Data Integrity
- **Exactly-Once Booking Guarantee** — Uses **idempotency keys** and **Redis Redlock distributed locking** to prevent race conditions and eliminate double-booking risks.
- **Database Migrations** — Enforces versioned schema changes for safe, traceable data evolution.
- **Automated Inventory Management** — Cron-driven room inventory generation keeps future availability continuously accurate and up to date.

## ⚡ Asynchronous & Event-Driven Flows
- **Redis-Backed Queues** — Asynchronous notification delivery for non-blocking user interactions and improved responsiveness.
- **Event-Driven Review Service** — Updates hotel ratings dynamically based on booking and review events without affecting checkout latency.

## 🧠 Key Benefits
- Secure, token-based user access across services  
- Fault-tolerant design supporting horizontal scalability  
- Consistent booking logic under high concurrency  
- Clean separation of concerns through microservice boundaries  

---

### 🛠️ Tech Stack
- **Languages:** Go, TypeScript  
- **Frameworks:** Express.js  
- **Datastore:** Redis, PostgreSQL  
- **Patterns:** Microservices, Event-Driven Architecture, Idempotent APIs, Distributed Locking  
- **Automation:** Cron Jobs, Database Migrations  
- **Deployment:** Docker-ready, horizontally scalable architecture  

---

> **Distributed Reservation Infrastructure** demonstrates advanced backend design principles — combining scalability, data safety, and distributed systems thinking to power reliable hotel bookings at scale.
