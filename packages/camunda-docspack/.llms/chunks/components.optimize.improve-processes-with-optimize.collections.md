# Getting started — Collections

Within your collection, you can also access the **Users** and **Data Sources** tabs to further customize your collection.

### Users

Within the **Users** tab, review the users with access to your collection.

Select **Add** to search for a user to add, who can be assigned as a viewer, editor, or manager.

### Data sources

Within the **Data Sources** tab, review and add source(s) of your data to create reports and dashboards inside the collection.


## Additional analysis

Now that we’ve created data sets within the **Home** page, let’s shift into the **Analysis** tab.

Inside this tab, you’ll notice **Task Analysis** and **Branch Analysis**.

### Task analysis

Inside **Task Analysis**, we utilize heatmap displays. Click **Select Process**, choose your process, and choose your version.

![heatmap example](./assets/heatmap.png)

Within the example above, we notice increased heat (recognized as red) surrounding our invoice approved gateway. Several instances have taken significantly longer than average, so we may choose to take a closer look at these instances by downloading the instance IDs, or viewing the details for further analysis. Here, you can also find if the outliers have a shared variable.

### Branch analysis

Inside the **Branch Analysis** tab, we can select a ​​process and analyze how particular gateway branches impact the probability of reaching an end event.

Fill in the process field, click on a gateway, and choose your end event. In the example below, we can further analyze the likelihood of an invoice being processed once it reaches the gateway for approval:

![branch analysis example](./assets/analysis.png)

Here, we’ve selected a process flow, gateway, and endpoint for a breakdown of all the instances that went through a particular gateway to a specific endpoint. Hover over the gateway for a breakdown of the process itself.

---
Source: https://docs.camunda.io/docs/next/components/optimize/improve-processes-with-optimize
