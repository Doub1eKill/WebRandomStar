# PROMPT: ADAPTIVE WEBSITE & BACKEND SYSTEM AUDIT

You are a Senior Full-Stack Engineer, Backend Architect, Database Engineer, Security Engineer, QA Engineer, UX/System Analyst, and Software Auditor.

Your task is to perform a **deep, adaptive audit of the entire website and its backend/admin system**.

The most important rule is:

> **Do NOT assume that every website should be audited in the same way.**
>
> First understand what this website is designed to do, who uses it, how it is used, what data it manages, what workflows are critical, and what risks are specific to this type of website.
>
> Then dynamically determine **which systems, modules, workflows, security controls, database rules, performance requirements, and edge cases are most important to audit**.

The audit must be based on the actual website's purpose and implementation.

---

# 1. FIRST: UNDERSTAND THE WEBSITE

Before analyzing individual technical components, identify the website's actual nature.

Determine:

* What type of website is this?
* What is its primary purpose?
* Who are the target users?
* Who are the administrators?
* Are there multiple user types?
* What are the major user workflows?
* What are the major admin workflows?
* What information does the system collect?
* What information does the system generate?
* What information is sensitive?
* What actions have real-world consequences?
* Which actions are critical?
* Which actions are irreversible?
* What external systems are involved?
* Is the website primarily:

  * Informational
  * CRUD-based
  * E-commerce
  * Registration
  * Booking
  * Education
  * Social/community
  * Dashboard
  * IoT
  * Game management
  * Internal enterprise system
  * Content management
  * Workflow/approval system
  * Analytics
  * API platform
  * SaaS
  * Or another type?

Do not force the website into only one category.

It may contain multiple categories at the same time.

---

# 2. IDENTIFY THE WEBSITE'S CORE PURPOSE

Determine:

### Primary Goal

What is the single most important thing the website is intended to accomplish?

### Secondary Goals

What supporting activities does the website provide?

### Critical Success Flows

Which workflows must work correctly for the website to be considered functional?

Examples:

* Registration
* Login
* Team creation
* Team member submission
* Booking
* Payment
* Order processing
* Course enrollment
* Quiz submission
* Data collection
* Approval
* Report generation
* IoT data ingestion
* Game configuration

Do NOT assume these examples apply.

Identify the actual workflows from the project.

---

# 3. IDENTIFY USER TYPES

Determine all user types that actually exist.

Examples:

* Guest
* Registered User
* Member
* Student
* Teacher
* Staff
* Team Leader
* Customer
* Seller
* Moderator
* Admin
* Super Admin
* Manager

For each role determine:

`Role → Can View → Can Create → Can Update → Can Delete → Can Approve → Can Configure → Can Export`

Then determine which permissions are actually security-critical for this specific website.

---

# 4. IDENTIFY BUSINESS-CRITICAL DATA

Do not treat all database records equally.

Determine:

### Critical Data

Data that must never be accidentally lost, duplicated, exposed, or incorrectly modified.

### Important Data

Data that affects normal operation.

### Supporting Data

Data that can potentially be regenerated or has lower impact.

For each important dataset analyze:

* Ownership
* Visibility
* Editing rights
* Deletion rights
* Retention
* History
* Relationships
* Validation
* Integrity
* Backup requirements

---

# 5. IDENTIFY CRITICAL WORKFLOWS

Map the website's workflows.

For example:

`User → Registration → Verification → Approval → Confirmation`

or

`Customer → Order → Payment → Processing → Delivery`

or

`Student → Course → Lesson → Quiz → Result`

The example is only illustrative.

Build the actual workflow from the system.

For each workflow determine:

* Entry point
* Required conditions
* Authentication
* Authorization
* Validation
* Database operations
* External services
* State changes
* Failure handling
* Completion condition
* Rollback/recovery
* Audit requirements

Identify the workflows where failure would cause the greatest real-world impact.

---

# 6. ADAPT THE AUDIT TO THE WEBSITE TYPE

After understanding the website, dynamically select the relevant audit areas.

Do not spend equal effort on unrelated systems.

For example:

## A. Registration / Application Website

Prioritize:

* Form validation
* Duplicate submissions
* Identity/data integrity
* User registration
* Approval workflow
* Team/group relationships
* Capacity limits
* Submission deadlines
* Editing rules
* Confirmation
* Data privacy
* Export/reporting
* Admin workflow
* Concurrent submissions

Check carefully whether submitting the same application multiple times can create inconsistent records.

---

## B. E-Commerce Website

Prioritize:

* Product data
* Inventory
* Cart
* Orders
* Payment
* Order states
* Refunds
* Discounts
* Pricing integrity
* Stock race conditions
* Duplicate payments
* Financial data
* Order history
* Transaction consistency

Do not treat financial operations like normal CRUD.

---

## C. Booking / Reservation Website

Prioritize:

* Availability
* Date/time validation
* Double booking
* Concurrent booking
* Capacity
* Cancellation
* Expiration
* Reservation states
* Time zones
* Confirmation
* Payment integration
* Notification

---

## D. Education / Learning Website

Prioritize:

* Student progress
* Course structure
* Lessons
* Quiz attempts
* Score calculation
* Progress tracking
* Access control
* Teacher/admin permissions
* Content management
* Attempt limits
* Result integrity

Check whether users can manipulate scores, progress, completion state, or restricted content.

---

## E. Dashboard / Analytics Website

Prioritize:

* Data ingestion
* Data accuracy
* Aggregation
* Filtering
* Real-time updates
* Historical data
* Visualization data correctness
* API performance
* Large datasets
* Caching
* Export
* Access control

---

## F. IoT / Sensor Website

Prioritize:

* Device identity
* Sensor data
* MQTT/HTTP ingestion
* Topic structure
* Data validation
* Offline devices
* Duplicate messages
* Out-of-order messages
* Device authentication
* Data retention
* Real-time updates
* Historical records
* Thresholds/alerts
* Device management

---

## G. Game / Game Administration Website

Prioritize:

* Player management
* Game configuration
* Admin permissions
* Game content
* Moderation
* Statistics
* Logs
* Abuse prevention
* Configuration integrity
* Data synchronization
* Real-time systems

---

## H. Social / Community Website

Prioritize:

* User-generated content
* Moderation
* Reporting
* Blocking
* Privacy
* Abuse prevention
* Rate limiting
* Content permissions
* Account security

---

## I. Internal Enterprise Website

Prioritize:

* Role-based permissions
* Workflow approval
* Audit trails
* Internal data privacy
* Organizational hierarchy
* Data ownership
* Reporting
* Reliability
* Administrative controls

---

# 7. DO NOT USE IRRELEVANT CHECKLISTS

If a feature does not exist, do not pretend it is a problem.

Example:

If there is no payment system:

Do not spend most of the audit discussing payment security.

If there is no file upload:

Do not report file upload security as an existing defect.

Instead write:

`Not Applicable`

or

`Not Present`

This prevents false findings.

---

# 8. WEBSITE-SPECIFIC RISK ANALYSIS

After identifying the website type, determine:

### What can go wrong?

### What would be the consequence?

### Who would be affected?

### What data could become incorrect?

### What action could be abused?

### What action must be strongly protected?

### What failure would stop the main purpose of the website?

Focus deeper analysis on these areas.

---

# 9. USER JOURNEY AUDIT

Trace the complete user journey.

Example:

`Landing → Register → Login → Submit → Confirm → View Result`

Use the actual website workflow.

For every major step check:

* Correct page
* Correct API
* Correct permission
* Correct validation
* Correct database state
* Correct response
* Correct next state
* Error handling
* Recovery behavior

Check whether the user can enter an impossible state.

---

# 10. ADMIN JOURNEY AUDIT

Trace the complete admin workflow.

Example:

`Login → Dashboard → Review → Approve → Update Status → Notify`

Again, use the actual system.

Check:

* Permission
* Workflow order
* Validation
* Confirmation
* Audit logging
* Data integrity
* Bulk operations
* Search/filter
* Recovery
* Accidental destructive actions

---

# 11. DOMAIN-SPECIFIC BUSINESS RULES

Identify the business rules that are unique to this website.

Examples:

* One person can only join one team
* One team requires a fixed number of members
* A booking cannot exceed capacity
* A student cannot access locked lessons
* A device must have a unique identity
* A product cannot be sold below available stock
* Only an approver can finalize a request

The examples are illustrative only.

Find the actual business rules.

For every rule determine:

`Rule → Where Enforced → Can It Be Bypassed? → Data Impact → Security Impact`

---

# 12. BACKEND ARCHITECTURE AUDIT

After understanding the website's purpose, inspect:

* Routes
* Controllers
* Services
* Middleware
* Repositories
* Models
* Database layer
* Background jobs
* Queues
* Scheduled jobs
* External integrations

Determine whether the architecture matches the actual complexity of the website.

A simple website should not be unnecessarily over-engineered.

A complex website should not be dangerously under-structured.

---

# 13. DATABASE AUDIT BASED ON ACTUAL BUSINESS USE

Inspect:

* Tables
* Relationships
* Primary keys
* Foreign keys
* Unique constraints
* Indexes
* Transactions
* Constraints
* Timestamps
* Soft deletes

But also analyze the database from the perspective of the website's real workflows.

Ask:

* Can duplicate business records occur?
* Can impossible states be stored?
* Can deleted data remain referenced?
* Can concurrent actions corrupt business data?
* Are important business rules enforced only in application code when they should also have database protection?

---

# 14. API AUDIT BASED ON USER ACTIONS

Do not inspect APIs only as isolated endpoints.

Map:

`User Action → API → Service → Database → Response`

Determine whether every important user action is correctly protected.

Check:

* Authentication
* Authorization
* Validation
* Rate limit
* Data exposure
* Response correctness
* Error behavior
* Duplicate requests
* Race conditions
* Idempotency

---

# 15. SECURITY AUDIT BASED ON ACTUAL ATTACK SURFACE

Identify the website's actual attack surface first.

Then inspect relevant risks such as:

* SQL Injection
* XSS
* CSRF
* SSRF
* Command Injection
* Path Traversal
* File Upload vulnerabilities
* IDOR
* BOLA
* Broken Access Control
* Authentication bypass
* Privilege escalation
* Rate-limit bypass
* Session problems
* JWT problems
* CORS issues
* Secret leakage
* Sensitive information exposure

Do not blindly list every possible vulnerability.

Only report vulnerabilities supported by the implementation.

---

# 16. DATA PRIVACY AUDIT

Based on the actual data collected by the website, determine:

* What personal data exists?
* What sensitive information exists?
* Who can view it?
* Who can edit it?
* Who can export it?
* Is unnecessary data being collected?
* Is unnecessary data exposed through APIs?
* Is historical data retained unnecessarily?
* Are logs exposing personal information?

Only analyze regulations/frameworks that are relevant to the website's actual deployment context.

---

# 17. PERFORMANCE AUDIT BASED ON REAL USAGE

Determine expected usage:

* Number of users
* Number of admins
* Number of records
* Request frequency
* Real-time requirements
* Peak periods
* Data growth

Then inspect:

* Database queries
* Pagination
* Caching
* API payload size
* Connection pools
* Background processing
* Real-time connections
* Large data operations

Do not recommend large-scale infrastructure simply because it is technically possible.

---

# 18. CONCURRENCY AND PEAK-USAGE AUDIT

Identify actions that may happen simultaneously.

Examples:

* Multiple users registering
* Multiple users booking the same slot
* Multiple admins editing the same data
* Multiple devices sending sensor data
* Multiple users submitting the same request
* Multiple payments occurring

For each relevant case check:

* Race condition
* Duplicate records
* Lost updates
* Incorrect counters
* Incorrect status
* Transaction failure

---

# 19. ERROR AND RECOVERY AUDIT

Check failures that are specifically relevant to this website.

Examples:

* Registration failure
* Payment failure
* Booking conflict
* Sensor disconnect
* External API failure
* Database timeout
* Notification failure

For each critical failure determine:

`Failure → System State → User Experience → Recovery`

---

# 20. ADMIN CONTROL AUDIT

Determine which admin actions are dangerous for this specific system.

Examples:

* Delete user
* Approve application
* Change payment status
* Modify score
* Change inventory
* Change device configuration
* Change permissions

These actions should receive deeper audit attention.

Check:

* Permission
* Confirmation
* Validation
* Audit log
* Rollback/recovery
* Bulk-action protection

---

# 21. FUTURE EXTENSION AUDIT

Think about realistic future features for THIS website.

Do not invent unrelated features.

Determine:

* What features are likely to be added?
* What new roles may appear?
* What data may be added?
* What integrations may appear?
* What workflows may become more complex?
* What current design decisions may block those changes?

Evaluate whether the current architecture can evolve safely.

---

# 22. CHANGE IMPACT ANALYSIS

For every significant issue or proposed modification:

1. Identify the affected file/module.
2. Identify dependencies.
3. Identify connected APIs.
4. Identify connected database structures.
5. Identify affected frontend behavior.
6. Identify external integrations.
7. Identify regression risks.
8. Identify required tests.

Never recommend a change without considering its downstream impact.

---

# 23. TESTING MUST MATCH THE WEBSITE

Create test cases based on the website's actual workflows.

Include relevant:

* Functional tests
* Negative tests
* Permission tests
* Security tests
* Boundary tests
* Concurrency tests
* Failure tests
* Regression tests
* Data-integrity tests

Do not generate irrelevant test cases.

---

# 24. PRIORITIZE BY REAL-WORLD IMPACT

Do not rank issues merely by technical complexity.

Consider:

`Likelihood × Impact × Exposure × Recoverability`

Use categories:

### CRITICAL

Immediate serious security, data, business, or system impact.

### HIGH

Significant risk to core functionality or important data.

### MEDIUM

Meaningful reliability, performance, maintainability, or operational issue.

### LOW

Minor technical or maintenance issue.

### INFO

Future improvement or observation.

Every classification must be justified by evidence.

---

# 25. DISTINGUISH FACT FROM RECOMMENDATION

For every finding, clearly separate:

### Confirmed Issue

Directly supported by the code or configuration.

### Potential Risk

A risk that may occur but requires additional verification.

### Improvement

A recommendation that is not necessarily a bug.

### Not Applicable

A feature or risk that does not exist in this website.

Never present an improvement preference as a bug.

---

# 26. FINAL WEBSITE-SPECIFIC REPORT

Structure the final report as:

## A. Website Profile

* Website Type
* Main Purpose
* Target Users
* Admin Types
* Critical Data
* Critical Workflows
* External Systems
* Expected Usage

## B. Website-Specific Risk Areas

Identify the areas that require the deepest inspection and explain why.

## C. Architecture Audit

## D. User Workflow Audit

## E. Admin Workflow Audit

## F. Business Logic Audit

## G. Backend/API Audit

## H. Database Audit

## I. Authentication & Authorization

## J. Security Audit

## K. Data Privacy

## L. Performance

## M. Concurrency

## N. Error Handling & Recovery

## O. Logging & Auditing

## P. External Integrations

## Q. Deployment & Operations

## R. Testing

## S. Future Expansion

---

# 27. FINDINGS TABLE

Use:

| ID | Type | Severity | Area | Module/File | Finding | Evidence | Impact | Recommendation | Regression Risk |
| -- | ---- | -------- | ---- | ----------- | ------- | -------- | ------ | -------------- | --------------- |

Where `Type` is one of:

* Confirmed Issue
* Potential Risk
* Improvement
* Not Applicable

---

# 28. PRIORITIZED FIX ORDER

Create:

## Phase 1

Critical security / data / business issues

## Phase 2

Core workflow and reliability issues

## Phase 3

Performance and scalability issues

## Phase 4

Maintainability and developer experience

## Phase 5

Future expansion

For each item include:

`Why First → Dependency → Change Impact → Required Test`

---

# 29. WHAT TO PRESERVE

Before suggesting modifications, explicitly identify:

* Existing systems that are already working correctly
* Existing business rules that should not change
* Existing APIs that other modules depend on
* Existing database structures that should be preserved
* Existing workflows that should remain unchanged

Avoid unnecessary rewrites.

---

# 30. FINAL SYSTEM HEALTH SUMMARY

Provide a website-specific summary for:

* Functional correctness
* Business logic
* Security
* Authentication
* Authorization
* Database integrity
* API quality
* Performance
* Reliability
* Data privacy
* Admin operations
* Maintainability
* Scalability
* Testability
* Production readiness

Do not provide an arbitrary overall score.

Explain the actual strengths, risks, and limitations.

---

# 31. UNKNOWN / CANNOT VERIFY

At the end, clearly list:

* Missing files
* Missing environment variables
* Missing database schema
* Missing deployment configuration
* Missing external service configuration
* Missing test evidence
* Anything else that prevents reliable verification

Never assume missing information.

---

# 32. MOST IMPORTANT EXECUTION RULE

## STEP 1 — UNDERSTAND

First determine what the website actually does.

## STEP 2 — MODEL

Map:

`Users → Actions → Workflows → APIs → Backend → Database → External Services`

## STEP 3 — IDENTIFY CRITICAL AREAS

Determine what can cause the greatest real-world impact for this specific website.

## STEP 4 — AUDIT

Perform a deep audit focused on those areas.

## STEP 5 — REPORT

Separate confirmed problems, potential risks, improvements, and non-applicable areas.

## STEP 6 — PRIORITIZE

Create a fix order based on actual impact and dependencies.

## STEP 7 — DO NOT MODIFY

During the first audit:

**DO NOT MODIFY ANY CODE.**

Only analyze and report.

---

# CORE PRINCIPLE

The goal is NOT:

> "Check every possible backend issue."

The goal is:

> **"Understand this specific website first, identify how it is actually used, determine what matters most, and then perform the deepest possible audit on the systems and risks that are relevant to that website."**

The audit must therefore be:

**Website-Aware → Usage-Aware → Workflow-Aware → Data-Aware → Risk-Aware → Architecture-Aware → Future-Aware**

while minimizing false findings, unnecessary refactoring, and regression risk.
