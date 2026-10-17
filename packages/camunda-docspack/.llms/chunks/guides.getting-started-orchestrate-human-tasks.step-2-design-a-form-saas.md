# Get started with human task orchestration — Step 2: Design a form — saas

1. Select the user task you created in **[Step 1](#step-1-create-a-new-process)**.
1. In the floating menu, click the link icon. A menu expands that allows you to create a new form.
   
1. Click **Create new form**. A form will be created and opened in the form editor. The form is automatically named.
1. In the left **Components** pane, under **Presentation**, click and drag the **Text view** component to the empty form.
   

1. On the right side of the modeling interface, in the properties panel, open the **General** section, and enter a **Text** value, such as `What's for dinner?`.
1. In the left **Components** pane, under **Selection**, click and drag the **Radio group** component to the form. In the properties panel, enter the following:
   - **Field label**: `Meal*`
   - **Key**: `meal`. The key maps to a process variable. The value of the component will be stored in this variable, and it can be read by the process that uses this form. You use `meal` here because you already used this key for the conditions you set up in the process.

   

1. Scroll down to the **Static options** section of the properties panel to add radio options. Since there are two options for the dinner, add an extra value by clicking on the plus sign. Enter the value `Chicken` with the same label as `Chicken` and enter the value `Salad` with the label as `Salad` in the other value. The `meal="<OPTION>"` conditions you configured earlier are case-sensitive. Make sure the values you set here match those exactly.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks
