# Start all projects

```bash
pnpm install
pnpm dev
```

# Run individual sub-projects

```bash
pnpm --filter docs dev
pnpm --filter vue-playground dev
pnpm --filter react-playground dev
```

# Some build commands
```bash
pnpm run build --filter @mache-hangar/components
pnpm run build --filter @mache-hangar/xml-editor
```

## About Turbo (Turborepo)

1. Turbo's real strength is mainly in the incremental execution and caching of "completable tasks", not in "long-running service orchestration".

## Key Strengths

1. Task Orchestration: Parallel execution with automatic dependency detection
  You don't need to write complex scripts. Turbo automatically analyzes:
  What depends on what
  What can run in parallel
  What must run sequentially
  What are global tasks
  For example:
    docs depends on components
    components depends on utils
  Turbo automatically:
    utils → components → docs

2. 4 Key Highlights:

    1. Incremental builds (only affected packages)
    If you change one package, it won't run the entire repository. It will only run relevant tasks based on the dependency graph.

    2. Task caching (local/remote)
    For tasks like build/test/lint/typecheck, if the inputs haven't changed, it directly hits the cache, almost instantly.

    3. Dependency graph scheduling
    dependsOn can automate "libraries first, then applications" build order, eliminating manual command chaining.

    4. Unified entry point
    One command from the root directory can batch execute multiple package tasks with logs aggregated by package for more stable team collaboration.

Summary:
Turbo's main value is making CI and daily build/test faster and more stable;
it's not a replacement for process orchestrators to handle "start this after service is ready".

pnpm --filter react-playground build
pnpm --filter react-playground preview