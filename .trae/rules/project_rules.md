Angular Project Rules
Architecture & Framework

This is an Angular signals-based application
Use Angular Material and Tailwind CSS
All services, components, pipes, and other artifacts must be signals-based
All template files must use signals-based approach
Prioritize signals over observables in all implementations

Code Standards

Use ES2022+ features for improved clarity and performance
Strictly adhere to SOLID principles to ensure robust, maintainable, and scalable architecture
No comments or console.log statements in the code
Follow Angular best practices and conventions

Styling Guidelines

Use only Tailwind CSS as the base for styling
Use SCSS when needed (not pure CSS)
Exception: Pure CSS is allowed only for splash-screen implementation
No custom CSS outside of Tailwind utilities and SCSS when necessary

Implementation Requirements

All reactive state management should use Angular signals
Components should leverage signal-based change detection
Services should expose signals instead of observables where possible
Templates should bind to signals using the new syntax
Maintain clean, production-ready code without debugging artifacts