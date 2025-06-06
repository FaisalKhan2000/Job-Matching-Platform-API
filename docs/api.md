**Legend:**

- `(P)`: Public (No authentication required, or basic API key if you implement that later)
- `(U)`: Authenticated User (Any logged-in user, role might be checked in handler)
- `(R)`: Recruiter Authenticated
- `(A)`: Admin Authenticated
- `{param}`: A path parameter (e.g., `{userId}`)

---

**I. Authentication & User Self-Service**

1.  **User Registration:**
    - `POST /auth/register` (P)
      - Body: `email`, `password`, `first_name`, `last_name`, `role` (e.g., 'recruiter')
      - _If role is 'recruiter', might trigger subsequent company/profile creation steps or require company association._
2.  **User Login:**
    - `POST /auth/login` (P)
      - Body: `email`, `password`
      - Response: Access token (JWT)
3.  **User Logout:**
    - `POST /auth/logout` (U)
      - _Might involve blacklisting token if using JWTs._
4.  **Get Current User Profile:**
    - `GET /users/me` (U)
      - Returns profile information for the logged-in user.
5.  **Update Current User Profile:**
    - `PUT /users/me` (U)
      - Body: `first_name`, `last_name`, (potentially email with verification), etc.
6.  **Change Current User Password:**
    - `PUT /users/me/password` (U)
      - Body: `current_password`, `new_password`
7.  **Request Password Reset:**
    - `POST /auth/password-reset/request` (P)
      - Body: `email`
8.  **Reset Password:**
    - `POST /auth/password-reset/confirm` (P)
      - Body: `reset_token`, `new_password`
9.  **Verify Email:**
    - `GET /auth/verify-email/{verificationToken}` (P) - Link clicked from email
    - `POST /auth/verify-email/resend` (U) - If user needs to resend verification

---

**II. Company Management**

1.  **Create Company:**
    - `POST /companies` (R)
      - Body: Company details (`name`, `website`, `description`, `logo_url`, `industry_ids` etc.).
      - _Often done by the first recruiter from that company, or an admin._
2.  **Get Company (Public View):**
    - `GET /companies/{companyId}` (P)
3.  **List Companies (Public View with Search/Filters):**
    - `GET /companies` (P)
      - Query params: `page`, `limit`, `search_term`, `industry_id`, `location_id` (for HQ), `is_verified`.
4.  **Get Recruiter's Own Company Details:**
    - `GET /recruiters/me/company` (R)
5.  **Update Company (by associated Recruiter/Admin):**
    - `PUT /companies/{companyId}` (R/A)
      - _Authorization: Recruiter must be associated with this company, or user is admin._
      - Body: Fields to update.
6.  **Admin: Verify Company:**
    - `PATCH /admin/companies/{companyId}/verify` (A)
      - Body: `{ "is_verified": true/false }`
7.  **Admin: List Companies (for admin panel):**
    - `GET /admin/companies` (A)
      - Query params: `page`, `limit`, `search_term`, `is_verified`.

---

**III. Recruiter Profile Management**

- _Note: Some recruiter profile data might be part of the generic `Users` table. This section is for recruiter-specific data in `RecruiterProfiles`._

1.  **Get Own Recruiter Profile Specifics:**
    - `GET /recruiters/me/profile` (R)
      - Returns data from `RecruiterProfiles` linked to the `Users.user_id`.
2.  **Update Own Recruiter Profile Specifics:**
    - `PUT /recruiters/me/profile` (R)
      - Body: `job_title` (at their company), `phone_number`, `linkedin_profile_url`.
      - _Association with `company_id` might be set here or during initial company creation/joining flow._

---

**IV. Job Posting Management**

1.  **Create Job Posting:**
    - `POST /jobs` (R)
      - Body: All `JobPostings` fields (`title`, `description`, `responsibilities`, `qualifications`, `job_type`, `work_model`, `salary_min`, `salary_max`, `skill_ids: []`, `location_ids: []`, etc.).
      - _`company_id` and `posted_by_recruiter_id` derived from authenticated recruiter._
2.  **Get Job Posting (Public View):**
    - `GET /jobs/{jobId}` (P)
3.  **List Job Postings (Public View with Search/Filters):**
    - `GET /jobs` (P)
      - Query params: `page`, `limit`, `search_term`, `company_id`, `skill_id`, `location_id`, `job_type`, `work_model`, `experience_level`, `is_featured`, `status='open'`.
4.  **List Recruiter's/Company's Job Postings:**
    - `GET /recruiters/me/jobs` (R)
      - Query params: `page`, `limit`, `status` (draft, open, closed, etc.).
5.  **Get Recruiter's Specific Job Posting (for editing):**
    - `GET /recruiters/me/jobs/{jobId}` (R)
      - _Authorization: Ensure job belongs to recruiter's company._
6.  **Update Job Posting:**
    - `PUT /jobs/{jobId}` (R)
      - _Authorization: Ensure job belongs to recruiter's company._
      - Body: Fields to update.
7.  **Delete Job Posting:**
    - `DELETE /jobs/{jobId}` (R)
      - _Authorization: Ensure job belongs to recruiter's company._
8.  **Update Job Posting Status:**
    - `PATCH /jobs/{jobId}/status` (R)
      - _Authorization: Ensure job belongs to recruiter's company._
      - Body: `{ "status": "closed" }` (or "filled", "expired")
9.  **Feature/Unfeature Job Posting (Admin or based on subscription):**
    - `PATCH /jobs/{jobId}/feature` (R/A)
      - Body: `{ "is_featured": true/false }`

---

**V. Master Data (Skills, Industries, Locations)**

- _Primarily for populating dropdowns, search filters, and admin management._

1.  **List Skills:**
    - `GET /skills` (P)
      - Query params: `search_term` (for typeahead).
2.  **List Industries:**
    - `GET /industries` (P)
      - Query params: `search_term`.
3.  **List Locations:**
    - `GET /locations` (P)
      - Query params: `search_term`, `country`.
4.  **Admin: CRUD for Skills:** (A)
    - `POST /admin/skills`
    - `GET /admin/skills`
    - `GET /admin/skills/{skillId}`
    - `PUT /admin/skills/{skillId}`
    - `DELETE /admin/skills/{skillId}`
5.  **Admin: CRUD for Industries:** (A) (Similar to Skills)
    - `POST /admin/industries`
    - ...
6.  **Admin: CRUD for Locations:** (A) (Similar to Skills)
    - `POST /admin/locations`
    - ...

---

**VI. Subscription & Billing Management**

1.  **List Available Subscription Plans:**
    - `GET /subscription-plans` (P/R)
2.  **Get Details of a Specific Subscription Plan:**
    - `GET /subscription-plans/{planId}` (P/R)
3.  **Company Subscribes to a Plan / Initiates Checkout:**
    - `POST /companies/{companyId}/subscriptions` (R)
      - _Authorization: Recruiter must manage this company._
      - Body: `{ "plan_id": "...", "payment_method_token": "..." }` (or redirect to payment gateway).
4.  **Get Company's Current/Active Subscription:**
    - `GET /companies/{companyId}/subscriptions/current` (R)
5.  **List Company's Subscription History:**
    - `GET /companies/{companyId}/subscriptions` (R)
6.  **Cancel Company's Subscription (or manage auto-renew):**
    - `PATCH /companies/{companyId}/subscriptions/{companySubscriptionId}` (R)
      - Body: `{ "auto_renew": false }` or `{ "status": "cancelled" }` (depending on logic).
    - `DELETE /companies/{companyId}/subscriptions/{companySubscriptionId}` (R) - If direct cancellation is allowed.
7.  **Payment Gateway Webhook:**
    - `POST /webhooks/payments` (P)
      - _Secured by signature verification. Handles events like `payment_succeeded`, `invoice_paid`, `subscription_updated`._
8.  **Admin: CRUD for Subscription Plans:** (A)
    - `POST /admin/subscription-plans`
    - `GET /admin/subscription-plans`
    - `GET /admin/subscription-plans/{planId}`
    - `PUT /admin/subscription-plans/{planId}`
    - `DELETE /admin/subscription-plans/{planId}`
9.  **Admin: Manage Company Subscriptions:** (A)
    - `GET /admin/company-subscriptions`
    - `GET /admin/company-subscriptions/{companySubscriptionId}`
    - `PUT /admin/company-subscriptions/{companySubscriptionId}` (e.g., manually extend, update status).

---

**VII. Admin User Management**

1.  **List All Users:**
    - `GET /admin/users` (A)
      - Query params: `page`, `limit`, `role`, `search_term`, `is_active`.
2.  **Get Specific User Details:**
    - `GET /admin/users/{userId}` (A)
3.  **Update User Details (by Admin):**
    - `PUT /admin/users/{userId}` (A)
      - Body: `role`, `is_active`, `first_name`, `last_name`, etc.
4.  **Delete User (by Admin):**
    - `DELETE /admin/users/{userId}` (A)

---

**VIII. (Future) Job Seeker & Application Routes**

- _These would be added if you expand to the job seeker side._
- **Job Seeker Profile:**
  - `GET /seekers/me/profile` (Job Seeker Auth)
  - `PUT /seekers/me/profile` (Job Seeker Auth)
- **Apply for Job:**
  - `POST /jobs/{jobId}/applications` (Job Seeker Auth)
    - Body: `cover_letter_text`, `resume_snapshot_url` (or resume data).
- **Job Seeker: List Own Applications:**
  - `GET /seekers/me/applications` (Job Seeker Auth)
- **Recruiter: List Applications for a Job:**
  - `GET /jobs/{jobId}/applications` (R)
    - _Authorization: Recruiter must own/manage the job._
- **Recruiter: Get Specific Application Details:**
  - `GET /applications/{applicationId}` (R)
- **Recruiter: Update Application Status:**
  - `PATCH /applications/{applicationId}/status` (R)
    - Body: `{ "status": "shortlisted" }`
- **Messaging Routes (if direct messaging is implemented):**
  - `POST /messages` (U)
  - `GET /messages/conversations` (U)
  - `GET /messages/conversations/{conversationId}` (U)
- **Notification Routes:**
  - `GET /notifications` (U)
  - `PATCH /notifications/{notificationId}/read` (U)
  - `POST /notifications/mark-all-read` (U)

---

This is a very comprehensive list. You'll likely implement them in stages based on priority. Remember to include proper error handling, input validation, and security measures for each route.
