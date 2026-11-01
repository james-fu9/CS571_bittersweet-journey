# CS571 course alignment

This project follows the client-side React approach taught in CS571: Building
User Interfaces, Fall 2026. The references below are to the course lecture PDFs;
the slides themselves are not redistributed in this repository.

| Application pattern | Course evidence |
| --- | --- |
| Vite builds a client-side React application. | Week 8, `lec14-ai-assisted-dev.pdf`, pages 4–5: use Vite; avoid Create React App and server components for static Pages hosting. |
| Reusable functional JSX components receive props and event callbacks. | Week 4, `lec06-webdev1.pdf`, pages 20–33. The course does not cover class components. |
| React state drives the interface, with immutable updates. | Week 4, `lec06-webdev1.pdf`, pages 34–35 and 43. |
| Effects synchronize external systems, including browser storage and the retained imperative atlas engine. | Week 5, `lec08-webdev2.pdf`, pages 9–13. Derived progress counts should be calculated, rather than copied into extra state through effects. |
| Chapter and seal lists use stable chapter IDs as keys. | Week 5, `lec08-webdev2.pdf`, pages 17–20. |
| Shared language and journey progress use React context and state, with localStorage persistence. | Week 6, `lec10-webdev3.pdf`, pages 6–25. Storage alone does not trigger a React render. |
| Declarative React Router routes use HashRouter for static hosting and programmatic navigation when completing a chapter. | Week 6, `lec10-webdev3.pdf`, pages 29–35; Week 8, `lec14-ai-assisted-dev.pdf`, page 17. HashRouter is explicitly recommended for Pages SPAs. |
| A ref holds the atlas DOM container; its lifecycle is managed by an effect with cleanup. | Week 7, `lec12-webdev4.pdf`, page 23 introduces `useRef`; Week 5 covers effects and the component lifecycle. |
| The generated build bundle, rather than untransformed JSX, is deployed. | Week 7, `lec12-webdev4.pdf`, page 44; Week 8, `lec14-ai-assisted-dev.pdf`, page 12. |

The course uses React Bootstrap as one layout option. This migration preserves
the original atlas styling and uses semantic HTML and CSS for its surrounding
React components. No third-party state management library or backend is needed
for the current milestone. TypeScript is optional in the course; the lectures
explicitly permit exploring it in the Web Project.

## Publish milestone

Week 4, `lec99-webproject 1.pdf`, pages 3 and 6, specifies November 2, 2026 at
11:59 p.m. for Publish and allows GitLab Pages or another web host. The syllabus,
pages 8–9, confirms the date and a deployed React application as the milestone.
GitHub Pages serves the client-side build for this repository.

The syllabus, pages 4–5 and 9, permits and encourages generative AI on this Web
Project. It also expects each student to explain and maintain the resulting code.
That policy is specific to the Web Project and differs from the homework and
in-class activity rules.

## State helper acceptance contract

The independent tests in `tests/progress.test.js` specify the current journey
rules:

- Use the versioned storage key `bittersweet-journey:v1` and recover safely from
  malformed data, unsupported versions, blocked reads, or failed writes.
- Keep the selected English/Chinese language and valid atlas location.
- Only the implemented My Hometown reader can award a seal during this milestone.
- Count a completed chapter once and keep updates immutable.
- A saved onboarding flag cannot bypass the introduction without its completed
  chapter; only a literal saved boolean is accepted.
- Restore the completed introductory journey as exactly 1/9.
- Require nine distinct known chapters for the eventual ending. Sanitization
  prevents injected completion for unavailable readers from unlocking it now.

These unit tests complement browser tests of navigation, atlas interactions,
responsive layouts, asset loading, and the deployed site.
