# VietHeritage AI - Package Descriptions

| No | Package | Description |
|:---:|:---|:---|
| 1 | **Config (`be_config`)** | Contains application configuration modules, including database connection (MongoDB/Mongoose), CORS policy, environment variables, and third-party service settings. |
| 2 | **Controller (`be_controllers`)** | Handles incoming HTTP requests, validates request payloads, invokes business services, and formats appropriate JSON API responses. |
| 3 | **Route (`be_routes`)** | Defines application API endpoints, maps RESTful URL paths to designated controllers, and chains security/validation middlewares. |
| 4 | **Middleware (`be_middleware`)** | Intercepts HTTP requests for JWT token authentication, role-based authorization (RBAC), multipart file uploads (Multer), and centralized error handling. |
| 5 | **Model (`be_models`)** | Defines MongoDB schemas and data persistence entities using Mongoose ODM, including data validations, indexes, and document relationships. |
| 6 | **Service (`be_services`)** | Encapsulates core domain business logic, Heritage Knowledge synthesis engine, Google Gemini AI RAG pipeline, quiz generation, and Nodemailer email dispatching. |
| 7 | **API Gateway (`be_api`)** | Serves as the centralized backend entry point that mounts modular route collections under the `/api` namespace with global health check endpoints. |
| 8 | **Sockets (`be_sockets`)** | Manages WebSocket connections for bidirectional real-time communication, instant notification broadcasts, and live client updates. |
| 9 | **Pages (`pages`)** | Top-level view container components rendered by React Router, including Home, Explore, Folk Literature, Literature Map, Heritage Quiz, Profile, Auth, and Admin Dashboard. |
| 10 | **Components (`components`)** | Modular and reusable UI elements divided into domain sub-packages (Admin, Auth, Common, Customer, Literature, and AI chat interfaces). |
| 11 | **Context (`fe_context`)** | Manages global React state via Context API, including user authentication session (`AuthContext`) and the corner AI chat widget state (`AiChatContext`). |
| 12 | **Frontend Services (`fe_services`)** | Client-side HTTP abstraction layer utilizing Axios instances with interceptors to execute asynchronous API communication with backend endpoints. |
| 13 | **Hooks (`fe_hooks`)** | Reusable custom React hooks providing stateful logic for debounced full-text search, window resize observation, modal toggles, and local storage synchronization. |
| 14 | **Utils (`fe_utils`)** | Client-side helper functions for Vietnamese tone normalization, date-time formatting, URL query serialization, and client validation rules. |
| 15 | **Styles (`fe_styles`)** | Global stylesheets, Tailwind CSS directives, typography definitions (Heritage serif/sans fonts), and custom UI keyframe animations. |
| 16 | **Database (`MongoDB`)** | Document-oriented NoSQL database system providing high-performance persistent storage for user accounts, literature archives, bookmarks, and content contributions. |
