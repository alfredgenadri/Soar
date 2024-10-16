# Changes

LoginForm.tsx:

Added storage of the username in localStorage upon successful login.
Implemented useNavigate to redirect the user to the chatbot page after login.
ChatbotPage.tsx:

Retrieved the stored username from localStorage.
Displayed "Currently logged in as 'Username'" under the welcome message.
Checked for the JWT token; redirected to the login page if not found.
Added a logout button to clear localStorage and redirect to the login page.
Updated Directory Structure:

Organized components, pages, and services directories.
CSS files are modularized where necessary (e.g., MainMenuPage.module.css).

# Directory
```
frontend/
│
src/
├── components/
│ ├── LoginForm.css # Styles for the login form
│ ├── LoginForm.tsx # Login form component
│ ├── Navbar.tsx # Navigation bar component
│ ├── RegisterForm.tsx # Registration form component
│
├── pages/
│ ├── AuthPage.css # Styles for the authentication page
│ ├── AuthPage.tsx # Auth page that toggles between login and registration
│ ├── ChatbotPage.tsx # Chatbot page component
│ ├── MainMenuPage.module.css# CSS module for main menu page
│ ├── MainMenuPage.tsx # Main landing page
│
├── services/
│ └── api.ts # API services like login, register, etc.
│
├── App.css # Global App styling
├── App.tsx # Main app entry component
├── index.css # Global index styling
└── index.tsx # React app entry point
```
