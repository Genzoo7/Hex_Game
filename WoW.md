# Way of Working (WoW) – 2D Strategy Web Game Project

## Scrum Ceremonies
- **Daily Stand-up (15 min)**: Each team member shares what they did, what they plan to do, and any blockers.
- **Sprint Planning (2h every 2 weeks)**: Team selects and plans backlog items for the upcoming sprint.
- **Sprint Review (1h at the end of each sprint)**: Showcase of the working version of the game.
- **Sprint Retrospective (1h)**: Reflection on what went well and what could be improved.
- **Backlog Refinement (1h weekly)**: Updating and clarifying backlog items.

## Tools and Platforms
- **Project Management**: Jira
- **Version Control**: Git
- **Game Engine**: Web Browser
- **Communication**: Discord

## Version Control and Git Guidelines

### Branch Naming
- Each developer creates a new branch for every task.
- Use feature branches: `feature/<task-key>-short-description`
  - Example: `feature/SCRUM-123-unit-combat-system`
- Use bugfix branches: `bugfix/<task-key>-short-description`
  - Example: `bugfix/SCRUM-145-ui-resource-display`

### Commit Message Format
Use tags in square brackets to indicate the type of change. The format is:

#### Accepted Tags:
- `[feature]` – new functionality
- `[fix]` – bug fix
- `[refactor]` – code improvement with no behavior change
- `[doc]` – documentation

#### Examples:
- `[feature] PROJ-123: added unit movement system`
- `[fix] PROJ-145: fixed incorrect resource counter`
- `[doc] PROJ-130: updated README with install steps`

## Team Agreements
- Each sprint must result in a playable version with new or improved functionality.
- Pull Requests must be reviewed by at least one developer.
- Use a shared Definition of Done (see DoD document).
- Backlog items should be estimated (e.g., Story Points).
- Sprints are 2 weeks long.

### Merge Requests
- Once the task is complete, the developer creates a **Merge Request (MR)** into the `main` branch.
- Title should match the main commit message format.
- Description should include a link to the corresponding Jira task.
- MRs must be reviewed and approved by at least one other team member.
