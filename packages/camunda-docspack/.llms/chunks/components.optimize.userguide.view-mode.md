# Monitor dashboards

Monitor your dashboards and visualize your processes data with the View mode.

Monitor your dashboards and visualize your processes data with the **View mode**. It provides interactive charts, raw data tables, and sharing features.


## Supported features

View mode provides the following features for monitoring your processes:

- **Full-screen**: Display the dashboard in full-screen mode to focus solely on the reports, hiding the header, control panel, and footer. While in full-screen mode, toggle between the default light theme and a dark theme using the Toggle Theme button.

- **Auto-refresh**: Periodically updates the dashboard with the latest data. You can customize the update frequency from one to 60 minutes. An animation indicates the timing of the next update. You can disable this feature if you no longer wish to use it.

**Note**
The refresh rate will not be saved unless it is selected in the [edit mode](https://docs.camunda.io/docs/next/components/optimize/userguide/edit-mode) of the dashboard.
If it was selected in the view mode, the refresh rate will not be saved when refreshing the dashboard page manually or switching to another page in between.

- **Alerts**: For dashboards within a collection, create and manage alerts for reports inside the dashboard.

![process performance overview](./img/dashboard-viewMode-monitorFeatures.png)

- **Description**: Displayed beneath the dashboard name, the description can be expanded or collapsed using the **More/Less** button for longer texts.

![dashboard description](./img/dashboard-showMoreDescription.png)

- **Sharing**: To share or embed the dashboard, use the **Share** button. After turning the **Enable sharing** switch on, a link is generated for those without Optimize access. Include applied filters in the shared version by enabling the **Share with current filters applied** checkbox. If the checkbox is not checked, the shared dashboard will include the default filters if any have been set.

![sharing](./img/dashboard-sharingPopover.png)

**Important**
Dashboard shared versions only allow you to view the dashboard. You cannot alter it or use any other Optimize features. To revoke the sharing, disable the share switch.

- **Embedding**: Click the **Embed Link** button to copy a code to paste into your webpage. Everyone that views the webpage can then see the content of the dashboard.

To hide the header of the shared dashboard or specific part of it, add the following parameter to the share URL:

`header : titleOnly / linkOnly / hidden`

For example, to completely hide the header from the shared dashboard, add `header=hidden` as shown:

`http://<dashboard share url>?header=hidden`

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/view-mode
