
Alumni Connect — System Architecture (High-Level)
1. System Purpose

Alumni Connect is a school-owned alumni relationship management system designed to help academic programs maintain long-term, accurate records of students and alumni while preserving privacy, data integrity, and institutional control.

The system is intentionally designed to separate directory records from login accounts, reflecting how real academic systems operate.

2. Core Architectural Principle
Records ≠ Accounts

The system distinguishes between:

AlumniProfile (Record)
A directory entry representing a person who studied and studies  in the program.
Created and managed by faculty/admin.
Exists even if the person has no login account.

User (Account)
A login identity with credentials and role (admin, faculty, alumni).
Controls what actions the person can perform in the system.

This separation prevents:

duplicate accounts

unauthorized self-registration

loss of institutional data when users leave

3. Roles and Responsibilities
Admin (System Owner)

Represents school administration or IT.

Bootstrapped once during initial deployment

Creates faculty and additional admin accounts

Oversees system access and governance

Faculty (Teachers)

Represents instructors within the academic program.

Create and manage alumni profile records

View the alumni directory

Send invite links to alumni

(Next phase) Add private notes and track changes

Alumni (Students / Graduates)

Represents former or current students.

Cannot self-register

Can only create an account by claiming an invite

Can view and update only their own profile

Cannot see the directory or faculty notes

4. Authentication & Authorization Model

Authentication uses JWT stored in httpOnly cookies

Cookies are verified on every request (requireAuth)

Role-based access control is enforced server-side (requireRole)

Frontend never stores tokens in localStorage

This ensures:

protection against XSS

centralized access control

consistent enforcement of permissions

5. Alumni Onboarding Lifecycle (Invite / Claim)

This reflects a realistic school workflow.

Step 1 — Profile creation

Faculty or Admin creates an alumni profile record:

POST /profiles


At this stage:

the person exists in the directory

no login account exists yet

Step 2 — Invite generation

Faculty/Admin generates a one-time invite:

POST /profiles/:id/invite


A secure random token is generated

Only the hash is stored in the database

Token has an expiry and single-use limit

Invite link is sent (email integration later)

Step 3 — Invite claim

Alumni claims the invite:

POST /auth/claim


This:

validates the token

creates a User account with role alumni

links the account to the existing AlumniProfile

logs the alumni in automatically

From this point onward, the alumni can access only their own profile.

6. Directory Model

The alumni directory is simply the collection of AlumniProfile records.

Faculty/Admin:

GET /profiles → list directory

GET /profiles/:id → view profile

Alumni:

GET /profiles/me → view own profile only

PATCH /profiles/me → update own profile

The directory is not derived from user accounts, which ensures records remain even if alumni never log in.

7. Current Backend Feature Coverage
Authentication

Login / logout / session restore

One-time admin bootstrap

Invite-only alumni account creation

Authorization

Role-based route protection

Ownership checks for alumni profile access

Profiles

Faculty/Admin: create & view directory records

Alumni: view & update own profile

Invites

Secure, one-time, expiring claim tokens

Profile-linked onboarding

8. Planned Architectural Extensions
Upcoming modules:

Faculty private notes (per-faculty, never visible to alumni)

Change tracking / alerts when alumni update profiles

CSV bulk import for alumni records

Email delivery for invites and periodic nudges

Frontend dashboards for each role

