Angular Project Rules
Architecture & Framework

## This is an Angular signals-based application
- Must use angular 18 or higher feature:  new control flow sintax, inject() function, new input() and output() api, queries as signal and standalone components.
- Use Angular Material and Tailwind CSS
- All services, components, pipes, and other artifacts must be signals-based

## Code Standards
- Use ES2022+ features for improved clarity and performance
- Strictly adhere to SOLID principles to ensure robust, maintainable, and scalable architecture
- Prioritize signals over observables in all implementations

## Styling Guidelines:
- Use only Tailwind CSS as the base for styling
- Every component must have his own style file

## Implementation Requirements:
- All reactive state management should use Angular signals
- Services should expose signals instead of observables where possible
- Maintain clean, production-ready code without debugging artifacts
- Use smart and dumb components architecture
- Garantir que todos os componente sejam encapsulation: ViewEncapsulation.None e changeDetection: ChangeDetectionStrategy.OnPush.
