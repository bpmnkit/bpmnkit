# Diagram Converter — Analyze your diagrams using the web interface

Open the Diagram Converter:

- For a local installation, open [http://localhost:8080/](http://localhost:8080/).
- For the hosted SaaS version, open [https://diagram-converter.camunda.io/](https://diagram-converter.camunda.io/).

Upload one or more BPMN, DMN, or `.form` files, then configure the conversion target:

![Upload your diagrams](../../img/analyzer-screenshot-1.png)

In **Configure conversion**, select the target Camunda 8 version. The default is the latest stable version, and you can select other supported versions to estimate migration impact for that target runtime.

If needed, expand **Advanced options** to fine-tune conversion behavior before starting the run.

Click **Analyze and convert to Camunda 8.x**.

Review the results:

![See results](../../img/analyzer-screenshot-2.png)

On this screen you can:

- See the total number of findings for the selected target version
- Review findings per file, and open a preview for BPMN, DMN, or form files
- Download converted files individually, or download all converted files as a ZIP
- Download the analyzer results as a Microsoft Excel file (XLSX)
- Download the analyzer results as a CSV file
- Download the analyzer results as a JSON file for AI-assisted migration tooling

Analysis results contain a list of items where each row represents an action item required for migrating your solution to Camunda 8. Findings are calculated for the selected target Camunda 8 version and grouped by severity:

- **INFO**: No action needed. Diagram conversion can successfully map attributes to the Camunda 8 implementation.
- **REVIEW**: The conversion will modify some expressions or attributes. Please verify that the intended functionality remains unchanged.
- **WARNING**: A Camunda 7 concept cannot be directly mapped to a Camunda 8 equivalent. Consider reviewing the Camunda 8 roadmap or exploring possible workarounds.
- **TASK**: Manual changes are required to make the diagram work in Camunda 8.

This allows you to focus on the most important findings. Tasks can also be grouped by type. For example, changing a `JavaDelegate` to a `JobWorker` might appear 100 times in your codebase, but still represents just one recurring pattern.

Pivot tables can help you identify tasks that appear multiple times across different files, providing a comprehensive overview of migration efforts.

Next, you'll learn how to use those results.

### Download JSON analysis results

Download the analysis results as a JSON file to use them with AI-assisted migration tools or other automation.

- In the web interface, click **Download JSON**.
- In the CLI, add `--json` to your command.

### Analyze results in Microsoft Excel

![The MS Excel result](../../img/analyzer-result-excel.png)

The XLSX file includes three tabs:

- **AnalysisSummary**: Pivot tables and charts that summarize typical migration tasks.
- **PivotTable**: A large pivot table for dynamic data exploration.
- **AnalysisResults**: The raw data from the analysis, which you can copy, import, or process further.

You can open the file using Microsoft Excel (desktop or Office 365).

### Analyze results in Google Sheets or LibreOffice

You can also open the XLSX file in Google Sheets, LibreOffice, OpenOffice, or similar tools. The raw data will be imported correctly, but pivot tables won't be preserved.

Alternatively, download the results as a CSV file, and import them directly into your preferred tool.

In this case, either:

- Create your own pivot table in the tool.
- Copy the contents of the **AnalysisResults** tab into your own spreadsheet.

For Google Sheets, consider using this [Google Spreadsheet template](https://docs.google.com/spreadsheets/d/1ZUxGhj1twgTnXadbopw1CvZg_ZvDnB2VXRQDSrKtmcM/edit?gid=6013418#gid=6013418) created by Camunda consultants.

![The Google Sheet](../../img/analyzer-screenshot.png)

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter
