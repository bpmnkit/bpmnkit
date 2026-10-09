# Manage file versions — Compare versions

You can compare any two entries in the version history, including entries that are not next to each other in the history.

The version history page has two tabs:

- **Versions**: the version history of every entry for the file.
- **Compare versions**: the comparison of two entries you select.

To compare two entries:

1. Open the version history for your file.
1. Select the **Compare versions** tab.
1. Select the first entry you want to compare.
1. Select the second entry you want to compare.

The comparison shows the older entry against the newer one, ordered by time regardless of the order you selected them. The selected pair is written to the URL as `/<file-type>/<id>/versions/<olderEntryId>...<newerEntryId>`, so you can share or bookmark a specific comparison.

### Compare versions in visual view

To view BPMN diagram changes visually, select the **Visual view** tab.

- Differences between the versions are highlighted visually on the diagram. For example, if an element was added, this change is highlighted in green with a plus symbol. Hover over a change to view more details.
- Only differences that affect the execution of the BPMN process are highlighted.
- The sidebar **Changes** list shows the details of each change, including the type and identifier. Select a change to highlight it.

**Note**

DMN comparisons are available in the **Code view** only. The **Visual view** tab is disabled with the hint "Visual view is not supported for DMN comparisons".

### Compare versions in code view

To view BPMN and DMN diagram changes as code in an XML diff layout, select the **Code view** tab.

- The XML for the older entry is shown on the left, with the newer entry shown on the right.
- Differences between the versions are highlighted in the XML. For example, if an element was added, this change is highlighted in green.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/versions
