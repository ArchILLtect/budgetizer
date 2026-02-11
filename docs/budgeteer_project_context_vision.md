# Budgeteer — Project Context & Vision

## Overview

**Budgeteer** is a privacy-aware personal finance application designed to help individuals and families **plan**, **track**, and **understand** their finances without giving up control of their data.

The app focuses on **clarity, safety, and intentional structure**, rather than automation-heavy or opaque “black box” finance tools.

Budgeteer is built as a **showcase-quality application**, but with architectural decisions that would scale cleanly into a real production system if needed.

---

## Core Goals

1. **Planning First**  
   Budgeteer emphasizes *forward-looking planning* rather than only retroactive expense tracking.

2. **Privacy-Aware by Design**  
   - No bank scraping or credential storage
   - Users import CSVs they already control
   - Sensitive identifiers are minimized or transformed

3. **Clear Separation of Concerns**  
   - UI components are declarative and lightweight
   - Business logic lives in domain/services layers
   - Infrastructure is shared safely across apps

4. **Incremental Complexity**  
   The app is designed so users can start simple and grow into more advanced workflows over time.

---

## Key Features (Planned & In Progress)

### 1) Budget Planner (Core Feature)

The **Planner** helps users model their finances *before* committing to them.

- Monthly income estimation (hourly, salary, multiple jobs)
- Tax-aware net income estimation (state + filing status)
- Expense modeling
- Savings allocation (fixed %, custom, or none)
- Multiple **scenarios** ("What if I move?", "What if I change jobs?")

The planner is intentionally deterministic and explainable — no hidden magic.

---

### 2) Accounts

Accounts represent *logical financial buckets*, not bank integrations.

- User-defined account names (Checking, Savings, Credit Card, etc.)
- Accounts act as containers for imported transactions
- Designed to avoid storing raw bank account numbers where possible

Accounts exist to provide structure and grouping, not automation.

---

### 3) Transaction Imports

Budgeteer relies on **user-controlled CSV imports** instead of direct bank connections.

- Supports repeated monthly imports
- Idempotent ingestion (re-importing the same file creates no duplicates)
- Deterministic transaction keys
- Preview → stage → apply workflow
- Undo window and import history

This design prioritizes transparency, safety, and debuggability.

---

### 4) Import History & Staging

Each import session is tracked explicitly:

- New vs duplicate transactions
- Staged vs applied state
- Time-limited undo
- Auto-expiration rules

This makes bulk imports safe, auditable, and reversible.

---

### 5) Tracker

The **Tracker** provides insight *after the fact*:

- Monthly breakdowns
- Category aggregation
- Comparisons against planned budgets
- Clear separation between planned vs actual spending

The tracker complements the planner — it does not replace it.

---

### 6) Authentication & Identity

Budgeteer uses **AWS Cognito** via Amplify for authentication.

- Shared user pool with sibling app(s)
- Secure, managed auth
- No custom password handling
- Future support for demo/temporary users

Auth is intentionally boring and reliable.

---

## Architecture Overview

### Frontend

- React + Vite + TypeScript
- Chakra UI (v3+) for layout and components
- Minimal custom CSS
- Component-first UI architecture

### State Management

- Zustand
- Intentional, explicit state shape
- Clear distinction between UI state and domain state

### Backend (Shared)

- AWS Amplify Gen 1
- Cognito (Auth)
- AppSync GraphQL API
- DynamoDB

Budgeteer **consumes** a shared backend but does not manage it directly.

---

## Shared Backend Philosophy

Budgeteer shares authentication and core data models (e.g. `UserProfile`) with a sibling application.

Key rules:

- One repo is the backend source of truth
- Budgeteer is a client-only consumer
- Backend changes are intentional and centralized
- No schema drift or duplicated truths

This mirrors real-world multi-app enterprise setups.

---

## Data & Security Principles

- Avoid storing raw bank account numbers when possible
- Prefer derived identifiers and user-confirmed mapping
- Strong boundaries between auth, domain data, and UI
- Assume imports may contain sensitive information

Security is treated as a **design constraint**, not an afterthought.

---

## What Budgeteer Is *Not*

- Not a bank replacement
- Not a fintech automation platform
- Not a data-harvesting app
- Not designed to hide logic from users

Budgeteer is intentionally transparent and user-controlled.

---

## Intended Audience

- Individuals who want to understand their finances
- Families planning monthly budgets together
- Developers reviewing architecture and patterns
- Recruiters evaluating real-world frontend + cloud integration

---

## Project Status

- Core UI scaffolding complete
- Authentication wired and functional
- Planner logic partially implemented
- Import pipeline architected and validated
- Backend integration active (read/write)

The project is evolving incrementally with a strong architectural foundation.

---

## Guiding Principle

> **Make the right thing easy, the wrong thing hard, and the system understandable.**

That principle informs nearly every decision in Budgeteer.

