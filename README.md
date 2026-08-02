# 🌿 LENPA Web Client | Event Scheduling Portal

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)

The official web client for the Laboratory of Native Species and Environmental Practices (LENPA). This Single Page Application (SPA) provides a dual-experience platform: a responsive, nature-themed public portal for visitors to explore and book events, and a secure, feature-rich dashboard for administrators to manage operations. 

> ⚙️ **Back-end API**
> 
> This repository contains the Front-end application built with Angular. The data processing and business logic are handled by our Spring Boot API. **[CLICK HERE TO ACCESS THE BACK-END REPOSITORY](https://github.com/FeltrinLM/LENPA_backend)**.

---

## 🌟 Key Features

The application is divided into two main environments with distinct use cases:

### 👤 Public Portal (Visitors)
*   **Event Catalog:** Browse active events and workshops with real-time seat availability.
*   **Public Scheduling:** Seamlessly book individual or group attendance through intuitive pop-up forms.
*   **Responsive Design:** Optimized for both desktop and mobile viewing.

### 🔐 Administrative Dashboard (Scholars & Admins)
*   **Secure Authentication:** Dedicated login gateway for authorized personnel.
*   **Activity Management:** Create, edit, and delete activities (workshops, exhibitions), defining dates, locations, and capacity.
*   **Attendance & Check-in:** Manage attendee lists, register private appointments, and perform manual check-ins.
*   **Data Analytics:** Generate statistical reports and visualize visitor demographics via interactive pie charts based on specific timeframes.
*   **User Management:** Master administrators can easily onboard new scholars or revoke access to the system.

---

## 🎥 Application Demo

Watch the video below to see the application in action, including the public scheduling flow and the administrative dashboard.



https://github.com/user-attachments/assets/7526dff8-3742-48b6-bff6-1bb9199bc295



---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) installed
*   [Angular CLI](https://angular.io/cli) installed (`npm install -g @angular/cli`)

### Installation & Execution

1. Clone the repository:
   ```bash
   git clone [https://github.com/FeltrinLM/LENPA-frontend.git](https://github.com/FeltrinLM/LENPA-frontend.git)
   ```
2. Navigate to the project directory:
   ```bash
   cd LENPA-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure the environment:
   * Open `src/environments/environment.ts` and set the back-end API URL.
5. Start the development server:
   ```bash
   ng serve
   ```
6. Open your browser and navigate to `http://localhost:4200/`.
