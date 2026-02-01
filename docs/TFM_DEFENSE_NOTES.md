# TFM Defense Notes: Authentication Strategy

## 🎯 Key Talking Points
1.  **Production-Grade Security**: The application implements a complete Email/Password authentication system using robust standards (Bcrypt hashing, JWT tokens).
2.  **Infrastructure Realities**: We implemented Google OAuth 2.0 to demonstrate advanced integration capabilities. However, modern security policies (COOP) require a verified top-level domain for this to function in a cross-origin production environment.
3.  **Scope Management**: Investing in a custom domain and SSL verification was outside the scope/budget of this academic project.
4.  **Verification**: We have provided video proof of the Google Auth flow working correctly in the development environment.

## 📸 Proof of Implementation
The following artifacts demonstrate the working feature:
- **Login Page (UI Integration)**: `google_login_page_proof_1769947163172.png`
- **Dashboard Access (Post-Login)**: `dashboard_proof_post_login_1769948005803.png`
- **Full Flow Video**: `google_auth_demo_localhost_1769947156030.webp`

## 🚀 Live Demo Instructions
For the live demonstration before the tribunal:
1.  Navigate to the deployed URL.
2.  Select **"Registrarse"** (Register).
3.  Create a new account (e.g., `tribunal@demo.com`).
4.  Showcase the PDF Analysis features.
5.  If asked about Google Login, refer to the "Known Limitations" section in the documentation.
