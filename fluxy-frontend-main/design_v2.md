# UI/UX Design Guidelines for Fluxy.id

## 1. Project Overview & Visual Identity
Fluxy.id is an AI-Powered Workforce platform (SaaS) designed for SMEs, e-commerce, and social media specialists. The system features four specific "AI Employees" to handle creative design, social media scheduling, analytics, and sales automation.

**Key Characteristics & Branding:**
*   **Platform Type:** B2B SaaS Web Application (Multi-tenant).
*   **Target Audience:** SME owners, e-commerce managers, social media freelancers.
*   **Vibe/Tone:** Professional, futuristic yet accessible, trustworthy, and efficient.
*   **Brand Colors:** Primary accents are Violet `#7c3aed` (violet-600) and Blue `#3b82f6` (blue-500), matching the landing page hero and CTA gradients. Gradients blending these two colors (`from-violet-600 to-blue-600`) are used for primary action buttons, active states, and highlighted headings.
*   **Theme Mode:** Light Mode is the default view across the app (landing page and post-login areas alike), with a fully compatible Dark Mode toggle.
*   **AI Personification:** The system already has avatars for the four AI Employees (Pixel, Maya, Echo, Kai). These avatars must be integrated prominently into their respective module headers, chat interfaces, and system notifications to reinforce the "virtual employee" concept.

## 2. Core Layout & Navigation Structure
*   **Authentication & Onboarding:**
    *   Clean, split-screen or centered card design accommodating Google OAuth and Email/Password.
    *   **Pending State:** After registration, users will be directed to a static "Menunggu Persetujuan" (Pending Approval) screen. This screen should be minimalist, displaying only the clear status message without any complex dashboard widgets.
*   **Tenant Workspace Layout:** 
    *   **Left Sidebar Navigation:** The primary navigation menu will be positioned as a persistent Left Sidebar. It will house the Dashboard/Home, the 4 AI Employees (using their avatars/icons), and Settings/Billing limit overviews.
    *   **Top Bar:** Contains the User Profile, Notification Bell (critical for Kai's "human handover" and Maya's post failures), and Subscription Status indicator.
*   **Admin Panel Layout:** Data-heavy layout with data tables, status badges, and quick-action buttons for subscription management.

## 3. UI Requirements per Module (AI Employees)

### 3.1. Pixel (Creative Designer)
*   **Primary Function:** AI image generation & editing.
*   **Key UI Components:**
    *   **Header:** Features Pixel's avatar.
    *   **Input Area:** Drag-and-drop zone for product photos (single/multiple).
    *   **Prompt Box:** Text area for design style/brief.
    *   **Settings:** Toggle/Radio buttons for aspect ratio (1:1 Feed vs. 9:16 Story).
    *   **Action Button:** "Generate with Pixel" (utilizing the #E920FC to #2622F2 gradient).
    *   **Output/Gallery:** Grid layout (masonry or standard) displaying generated images. Hover states for "Download", "Delete", and "Regenerate".

### 3.2. Maya (Social Media Manager & Publisher)
*   **Primary Function:** Content scheduling and publishing to Instagram & TikTok.
*   **Key UI Components:**
    *   **Header:** Features Maya's avatar.
    *   **Integration Status:** Badges showing linked IG/TikTok accounts.
    *   **Composer:** File uploader (or selection from Pixel's gallery), text area for captions, platform selector toggles.
    *   **Scheduling Controls:** Date/Time picker (non-recurring). Buttons for "Post Now" vs. "Schedule".
    *   **Content Calendar View:** A monthly/weekly calendar grid showing scheduled posts with status colors (Scheduled = Blue, Published = Green, Failed = Red). 
    *   **List View:** Alternative to calendar for quick editing/canceling of upcoming posts.

### 3.3. Echo (Social Media Analyst)
*   **Primary Function:** Analytics dashboard.
*   **Key UI Components:**
    *   **Header:** Features Echo's avatar.
    *   **Filters:** Date range picker, Platform selector (IG/TikTok/All).
    *   **KPI Cards:** High-level metrics (Total Reach, Likes, Comments, Shares, Views).
    *   **Charts:** Line/Bar charts for account performance over time.
    *   **Content Performance Table:** List of recent posts with specific metrics per post.
    *   **Export Actions:** "Export to PDF" and "Export to Excel" buttons.

### 3.4. Kai (Sales Development Representative)
*   **Primary Function:** WhatsApp Broadcasts & Chatbot automation.
*   **Key UI Components:**
    *   **Header:** Features Kai's avatar.
    *   **Setup/Config:** WABA connection status, CSV file upload zone for Product Data (Name, Stock, Price).
    *   **Broadcast Interface:** Contact/Group selector, message text area, "Send Broadcast" button, and historical broadcast table (Sent/Failed).
    *   **Chat/Inbox View:** WhatsApp-web style interface for viewing chatbot conversation history per lead. The chatbot's messages should feature Kai's avatar.
    *   **Human Handover Alerts:** Prominent UI alerts/banners when a lead reaches the pre-payment stage and requires human intervention.

## 4. Super Admin Panel (Admin Fluxy)
*   **Tenant Management Table:** Columns for Business Name, Contact, Status (Pending, Active, Expired, Suspended), Subscription Expiry Date, and Actions.
*   **Tenant Detail View:** A drawer or dedicated page showing usage statistics against their limits.
*   **Approval Workflow:** Modals for Approving (requires setting active/expiry dates) and Rejecting (requires inputting a reason) new registrations.
*   **Usage Dashboard:** Aggregate charts showing total API usage/limits across the platform.

## 5. Global UI States & System Constraints
*   **Empty States:** Provide friendly, illustrative empty states for new tenants (e.g., "Welcome to Fluxy. Let's create your first image with Pixel!").
*   **Usage Limit Indicators:** Progress bars in the UI showing monthly quotas (e.g., "45/50 Images Generated", "800/1000 Broadcasts Sent"). 
*   **Expired State:** If the subscription is expired, dim/disable all AI Employee action modules and display a persistent banner directing them to contact Admin.
