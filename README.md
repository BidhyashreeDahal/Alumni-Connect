# Alumni Connect

Alumni Connect is a role-based alumni engagement platform for institutions. It brings alumni records, student access, mentorship, events, reminders, settings, and analytics into one connected system for `admin`, `faculty`, `student`, and `alumni` users.

## Current Status

The system is in a strong MVP state.

- Core RBAC flows are implemented.
- Main dashboards exist for all roles.
- Directory, profile, mentorship, invite/claim, settings, analytics, reminders, and admin operations are working.
- Frontend currently builds successfully.

## What's Done

### Authentication and RBAC

- Login, logout, current-user session flow
- Cookie-based auth
- Role-based route protection for:
  - `admin`
  - `faculty`
  - `student`
  - `alumni`
- Role-aware sidebar, header, dashboards, reminders, and settings access

### Profiles and Directory

- Alumni and student profile pages
- Profile editing for student and alumni users
- Role-aware profile viewing for admin/faculty
- Profile photo upload
- Profile completion logic and profile-ready badge
- Directory listing with:
  - pagination
  - server-side search
  - program filter
  - graduation year filter
  - claimed/unclaimed support
- Safer null-handling for unlinked student rows

### Invite and Claim Flow

- Invite generation for alumni and student profiles
- Reissue invite flow
- Claim-account flow
- Protection against claiming an already linked profile
- Invite status management page

### Mentorship

- Student mentorship request flow
- Alumni accept / reject flow
- Student view of their requests
- Alumni incoming request view
- Popular mentors endpoint for student dashboard

### Events

- Event creation for admin/faculty
- Event listing for authenticated users
- Student/alumni event registration and cancellation
- Alumni dashboard event quality cleanup for valid upcoming items

### Admin and Faculty Operations

- Admin management page
- Role changes and activation/deactivation
- Self-protection so admin cannot demote/deactivate own account incorrectly
- Bulk import page
- Pagination on admin user listing

### Settings

- Settings page redesigned to match the app
- Role-aware preferences UI
- Password change flow
- Settings backend route/controller support
- Current settings preference structure includes:
  - profile visibility
  - email mentorship updates
  - email event updates
  - email announcement updates

### Dashboards and Analytics

- Admin dashboard redesigned
- Faculty dashboard redesigned
- Student dashboard redesigned
- Alumni dashboard redesigned
- Analytics page redesigned for institutional reporting
- Data corrections for analytics:
  - mentorship acceptance logic
  - top hiring companies cleanup
  - alumni by graduation year cleanup

### Reminders

- RBAC reminders backend implemented
- Reminder page implemented as a role-aware feed
- Uses live system data instead of hardcoded reminders

### UI and Layout System

- Sidebar and topbar improved
- Typography and shell consistency improved
- Page-start spacing improved on several pages
- Settings page aligned with system style
- Story page redesigned for expo presentation

## What's Left

### High Priority

- Final end-to-end QA across all roles
- Real-user onboarding plan for expo/demo
- Professional invite email and follow-up strategy
- Final consistency pass on copy, empty states, and page polish
- Stable deployment setup for external user access

### Medium Priority

- Admin activity log / audit trail
- Stronger announcement workflow
- Reminder copy and micro-interactions refinement if needed
- More realistic seeded or real expo data
- Better production error handling and backend monitoring

### Production Readiness

- Deployment and environment hardening
- File upload constraints and validation review
- Security review
- Logging and observability
- Performance improvement / chunk splitting
- Automated tests

## Open Product Questions

- After a mentorship request is accepted, what is the preferred communication model?
  - in-platform only
  - external meeting link
  - email follow-up
  - calendar integration later

- How visible should unclaimed profiles be across roles?
  - visible in limited form
  - visible only to admin/faculty
  - hidden until claimed

- What is the final professional invite process?
  - manual invite links only
  - branded email invite
  - timed nudges / reminder emails

## Possible Post-MVP Enhancements

- Google Calendar integration for mentorship scheduling
- Professional email invite templates and invite nudges
- Admin activity log
- More advanced analytics and school reporting
- Better export/reporting workflows

## Current Reality

This is no longer a rough prototype. It is a strong institutional MVP with most core product areas in place.

The biggest remaining gaps are not the existence of features, but:

- production hardening
- final business-rule QA
- real-user onboarding polish
- admin operational maturity
