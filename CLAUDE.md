# ALSaqr Social Media App

## Tech Stack 
- React 18.3.1
- Typescript 5.5.3
- Eslint 9.9.0
- Typescript eslint 8.0.1
- Vite 5.4.1
- Playwright +1.56.1
- Framer Motion 7.6.18
- Mobx +6.13.6
- Formik 2.4.6
- Tailwind CSS 4.1.14
- Gradio Javascript client +2.0.0
- Supabase Client +2.58.0
- React Router +7.2.1

## Architectural Principles
- Routing with tan-stack router
- Components seperated by features, components, layout, and common folder.
- environment variables held in .env files
    - .env on prod
    - .env.local on dev
- playwright tests are in tests folder.
- web workers for loading data on app initialization. 
- check session on initialization of web application.
- mobx store in stores folder.
- typescript models, and enums in the models folder
- typings.d.ts has common use models, excluding enums.
- utils folder would hold utility function that are used in multiple components.
    - utils folder holds api client files that will responsible for communicating with server.

## Code Standards
- DRY
- useMemo, and useCallback react hooks for variable declaration that is not state.
- use the useState hook for components that load data unique to an entity. Such as a post page that will load a specific post.
- For upserting data, use Formik components. 
    - Use mobx store to control the form between steps in a wizard, in  use cases when a wizard needs to be used.
- Use tailwind css classes for styling components, prevent using inline styles unless specified. 
- camelCase naming convention for all non component variables.
- PascalCase naming convention for React components.

## SDD Workflow 
### Specification 
- Client side application where users can login using oauth, they can create posts, lists, communities, community discussions, direct message other users, follow other users, save items to list. 
- Post can be liked, bookmarked, and reposted by a user. 
- User can create a post which is considered a comment, which is considered a reply.
- A user profile contains their recent posts, bookmarked posts, liked posts, reposted posts, and replied posts(comments that were created in response to a post).
- Items that can be saved to a list is posts, communities, community discussions, and users.
- Users can post on posts, which would be considered a comment. 

### Technical Planning
- When loading data use store when you need the data to be set. 
- In cases when a distinct page needs to be loaded such as a post page, profile info, community page, community discussion page, etc, use the api client data access object from the api client files.
### Task Breakdown
- The project is complete. Do not scaffold new features from scratch; follow the user prompt for maintenance, fixes or enhancements only, respecting the conventions above.
### Implementation
- Completed. All features described in the Specification are implementated and integrated.
### Validation
- Complete. Validated via the playwright test suite (~90% coverage) located in the tests folder. Run the suite before merging any change.