# Custom styling — Customize the Tasklist user interface

To customize the user interface, override specific design tokens in a `custom.css` file. For example, you can override the `--background` token to change the Tasklist UI background color.

Place the `custom.css` file in the `config` directory, which is on the Camunda classpath:

| Installation type    | File location                               |
| :------------------- | :------------------------------------------ |
| Docker image         | `/usr/local/camunda/config/custom.css`      |
| Distribution archive | `camunda-zeebe-<version>/config/custom.css` |

Camunda serves the file at `<context-path>/custom.css` and reads it once at startup. Restart Camunda after you create or change the file.

A typical workflow to customize the Tasklist UI is as follows:

1. **Identify design tokens**: Review your own visual identity guidelines and identify the [design tokens](#common-design-tokens) you want to update.

2. **Override the tokens in custom.css**: Add or modify token values in the `custom.css` file. The syntax for styling is plain CSS. For example, to change the background color, use the following syntax, replacing the `--background` values with your own colors:

   ```css
   /* Light theme customization */
   html .c4-ui {
     --background: #ffff00;
   }

   /* Dark theme customization */
   html .c4-ui.dark,
   html .dark .c4-ui {
     --background: #008000;
   }
   ```

   The `html` prefix makes your selectors more specific than the default token definitions, so your values take precedence regardless of the order in which the stylesheets load.

3. **Test your custom styles**: Test your custom styles in both light and dark modes to verify that they are applied correctly across all Tasklist UI components.

4. **Validate accessibility and visual contrast**: Check that your custom styles maintain good visual contrast between elements. For example, verify that text is easily readable against backgrounds, buttons are distinguishable, and important elements such as links and icons stand out properly. Contrast is especially important for accessibility and readability in both light and dark modes.

5. **Iterate based on results**: If necessary, refine your customizations based on the results of your testing. Adjust values in the `custom.css` file to ensure a consistent look and feel throughout the Tasklist UI.

**Note**
If you don't provide a `custom.css` file, or the file contains no custom CSS configuration, the Tasklist UI defaults to its original visual identity.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/tasklist/tasklist-custom-styling
