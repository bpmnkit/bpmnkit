# Utilize forms

Learn how to use, model, and deploy Camunda Forms.

Beginner
Time estimate: 15 minutes


## About

The Camunda Forms feature allows you to easily design and configure forms. Once configured, they can be connected to a user task or start event to implement a task form in your application.

After deploying a diagram with a linked form, Tasklist imports this form schema and uses it to render the form on every task assigned to it.


## Quickstart

### Create new form

To start building a form in Desktop Modeler, click **File > New file > Form (Camunda 8)**.

In this example, you'll build a form to help with a task in obtaining an email message.

### Build your form

Within Forms, you can add text fields, numerical values, checkboxes, radio elements, selection menus, text components, and buttons.

1. From the **Components** palette on the left, drag and drop a **Text area** to the **Form definition** editor.
1. Select the **Text area**.
1. In the properties panel on the right, open the **General** section.
1. Provide the following data:
   - **Field label:** "Email content"
   - **Field description:** "The content of the email message"
1. Deselect the text area, so the form's properties are shown in the properties panel.
1. In the **General** section, copy the form's ID. You'll use this when you link the form to a user task.
1. Click **File > Save File As...**
1. Name the file `email-form`.

**Tip**
Refer to the [camunda forms reference](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference) to explore all form elements and configuration options in detail.

### Link your form to a BPMN diagram

Implement a task form into a diagram. In tandem, link your form to a user task or start event:

1. Open the diagram where you'd like to apply your form.
1. Select the user task requiring the help of a form.
1. In the properties panel on the right, in the **Form** section, select type **Camunda Form**.
1. For the **Form ID**, paste the ID you copied when you built your form.
1. Save your BPMN file.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/utilize-forms
