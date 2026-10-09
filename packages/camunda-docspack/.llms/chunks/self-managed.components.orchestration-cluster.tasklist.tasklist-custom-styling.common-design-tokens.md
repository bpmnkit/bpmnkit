# Custom styling — Common design tokens

You can override the following commonly used design tokens to customize the Tasklist UI.

Most tokens have separate values for the light and dark themes, so override them in both the light and dark selectors. The `--ring` and `--radius` tokens are only defined once, so an override in the light theme selector applies to both themes.

| Design token                  | Description                                                                        |
| :---------------------------- | :--------------------------------------------------------------------------------- |
| `--background`                | Default background color of the Tasklist UI.                                       |
| `--foreground`                | Primary color for body text.                                                       |
| `--border`                    | Color for dividers and card outlines.                                              |
| `--popover`                   | Background color for floating surfaces, such as popovers, dropdowns, and tooltips. |
| `--popover-foreground`        | Text color on floating surfaces.                                                   |
| `--input`                     | Border color for input fields.                                                     |
| `--input-background`          | Fill color for input fields.                                                       |
| `--ring`                      | Color for the keyboard focus ring. Defaults to `--accent-foreground-subtle`.       |
| `--radius`                    | Base corner radius for components such as buttons, inputs, and cards.              |
| `--primary-action-default`    | Fill color for primary buttons.                                                    |
| `--primary-action-hover`      | Hover state color for primary buttons.                                             |
| `--primary-action-active`     | Active state color for primary buttons.                                            |
| `--primary-action-disabled`   | Color for disabled primary buttons.                                                |
| `--primary-action-foreground` | Text and icon color on primary buttons.                                            |
| `--accent-action-default`     | Fill color for selected or checked controls, such as checkboxes and switches.      |
| `--accent-action-hover`       | Hover state color for accent controls.                                             |
| `--accent-action-foreground`  | Text and icon color on accent controls.                                            |
| `--accent-foreground-subtle`  | Accent color for text and icons.                                                   |
| `--neutral-action-default`    | Fill color for secondary actions.                                                  |
| `--neutral-action-hover`      | Hover state color for secondary actions.                                           |
| `--neutral-background-subtle` | Background color for elevated surfaces, such as containers, panels, and cards.     |
| `--neutral-background-strong` | Background color for stronger fills, such as selected rows and table headers.      |
| `--neutral-foreground-subtle` | Secondary color for less prominent text and icons.                                 |
| `--neutral-foreground-strong` | Color for emphasized text and icons.                                               |
| `--neutral-border-subtle`     | Color for subtle borders.                                                          |
| `--neutral-border-strong`     | Color for stronger borders.                                                        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/tasklist/tasklist-custom-styling
