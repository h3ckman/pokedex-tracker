See @AGENTS.md @README.md for project overview and @package.json for available npm commands.

# Project conventions

## Stack

- TypeScript v6 with strict mode
- Next.js v16 with App Router
- React v19, functional components only
- Tailwind CSS v4 for styling
- Jest and React Testing Library for testing
- ESLint v9 and Prettier for code quality and formatting
- GitHub Actions for CI/CD
- Shadcn/ui component library for common UI patterns and accessibility

## Architecture

- Modular and feature-based file structure, grouping related files together
- Clear separation of concerns between components, hooks, utilities, and styles
- Emphasis on reusable and composable components, following the DRY principle

## Rules

- Use TypeScript types and interfaces to define clear contracts for components, functions, and data structures
- Named exports, never default exports
- Tests live next to source: `foo.ts` -> `foo.test.ts`
- All API routes return `{ data, error }` shape
- Use the folder `components/ui` for adding shadcn/ui base components, which should all remain generic, and `components` for custom components
- Add new shadcn/ui components using built-in npx commands `npx shadcn-ui add [component-name]` (generates the component as defined in `components.json`)
- Install new dependencies only when necessary, and prefer lightweight libraries that align with the project's design system and architecture
- Avoid custom CSS when possible, leverage Tailwind's utility classes and design system
- Follow the project's design system and Tailwind configuration for consistent styling
- Maintain a clean and organized project structure, grouping related files and components together to improve discoverability and ease of navigation within the codebase
