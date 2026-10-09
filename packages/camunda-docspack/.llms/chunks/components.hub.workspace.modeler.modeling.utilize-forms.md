# Utilize forms

Learn how to use, model, and deploy Camunda Forms.

Beginner
Time estimate: 15 minutes


## About

The Camunda Forms feature allows you to easily design and configure forms. Once configured, they can be connected to a user task or start event to implement a task form in your application.

After deploying a diagram with a linked form, Tasklist imports this form schema and uses it to render the form on every task assigned to it.


## Quickstart

### Create new form

To start building a form, log in to your [Camunda 8](https://camunda.io) account, and take the following steps:

1. In Camunda Hub, open a workspace.
2. In the workspace, create or open a project.
3. In the project, click **Create new > Form**.

### Rename your form

Now you can start to build your form by dragging elements from the palette to the canvas, or by using the AI Form Generator at the bottom of the palette. For the purpose of this guide, we'll build a form from scratch.

Right after creating your form, rename it:

1. In the top breadcrumb navigation, next to **New form**, click the vertical ellipsis menu.
2. Click **Rename**.
3. Enter `email-form`.
4. Click **Rename**.

In this example, we'll build a form to help with a task in obtaining an email message.

### Build your form

Within Forms, can add text fields, numerical values, checkboxes, radio elements, selection menus, text components, and buttons.

1. From the **Components** palette on the left, drag and drop a **Text area** to the **Form definition** editor.
2. Select the **Text area**.
3. In the properties panel on the right, open the **General** section.
4. Provide the following data:
   - **Field label:** "Email content"
   - **Field description:** "The content of the email message"

**Tip**
Refer to the [camunda forms reference](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference) to explore all form elements and configuration options in detail.

### Save your form

To save your form in Camunda 8, you don't have to do anything. Camunda Hub autosaves every change you make.

### Link your form to a BPMN diagram {#connect-your-form-to-a-bpmn-diagram}

Implement a task form into a diagram. In tandem, link your form to a user task or start event:

1. In the same workspace that contains your form, open any project. This does not have to be the same project where you saved the form.
2. In the project, select the diagram where you'd like to apply your form.
3. Select the user task requiring the help of a form.
4. In the floating menu, select the **Link form** icon.
5. Navigate to the form you want to link and click **Link**.

When using Camunda Forms, any submit button present in the form schema is hidden so we can control when a user can complete a task.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/utilize-forms
