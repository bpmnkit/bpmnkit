# Integrate a built-in connector — Import a diagram

1. Download the following files:
   - `submit-expense.bpmn`: A process for submitting expenses for approval.
   - `upload-receipt.form`: A form for uploading receipts.
   - `approve-receipt.form`: A form for approving receipts.
2. Log in to your Camunda 8 account.
3. In your Camunda Hub workspace, click **Create project**, and name your project `Expense process`.
4. In your project, delete the default diagram, and click **Create new > Upload files**.
5. Upload `submit-expense.bpmn`, `upload-receipt.form`, and `approve-receipt.form`.

Open **submit-expense** to see the process you'll be working with throughout this tutorial:

Diagram (BPMN): Submit expense
  start "Receipt ready" → user task "Upload receipt" → "Notify manager of receipt" → user task "Review receipt" → exclusive gateway "Receipt approved?"
    — [Approved: =approve_receipt = true] manual task "Reimburse employee" → exclusive gateway → end "Expense reviewed"
    — [Not approved: =approve_receipt = false] manual task "Request additional details" → (back to exclusive gateway)

**Note**
To learn more about building your own BPMN diagram from scratch, visit our guide on [automating a process using BPMN](https://docs.camunda.io/docs/next/components/modeler/bpmn/automating-a-process-using-bpmn).

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/configuring-out-of-the-box-connector
