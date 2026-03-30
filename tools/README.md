# Tools

Python scripts for deterministic execution. Each script handles one task: API calls, data transformations, file operations, or database queries.

## Conventions

- Scripts read credentials from `.env` (use `python-dotenv`)
- Accept inputs via CLI args or stdin
- Output results to stdout or write to `.tmp/`
- Exit with non-zero code on failure

## Adding a New Tool

1. Create `tools/your_tool_name.py`
2. Add a docstring describing inputs, outputs, and any rate limits
3. Reference it in the relevant workflow
