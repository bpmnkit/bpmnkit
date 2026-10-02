// AUTO-GENERATED — DO NOT EDIT. Run `pnpm update-connectors` to regenerate.
// Source: https://marketplace.cloud.camunda.io/api/v1/ootb-connectors
// What @bpmnkit/core/connectors leaves out of each template, by template id.
import type { TemplatePanelParts } from "../panel-parts.js";

export const TEMPLATE_PANEL_PARTS: Record<string, TemplatePanelParts> = {
  "io.camunda.connectors.ServiceNowIncident.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "sn",
          "label": "ServiceNow"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "HTTP endpoint"
        },
        {
          "id": "timeout",
          "label": "Connection timeout"
        },
        {
          "id": "payload",
          "label": "Payload"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjAxIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6bXVsdGlwbHkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yNTUuOTA1IDQyMS40NDJDMTgxLjk1OCA0MjEuNDQyIDEzMS4zMzggMzY1LjcxNSAxMzEuMzM4IDI5Ni43ODdDMTMxLjMzOCAyMjcuODI3IDE4MS45NTggMTcxLjE2NyAyNTUuOTA1IDE3MS4xNjdDMzI5Ljg5MiAxNzEuMTY3IDM4MC40NzEgMjI3LjgyNyAzODAuNDcxIDI5Ni43ODdDMzgwLjQ3MSAzNjUuNzE1IDMyOS44OTIgNDIxLjQ0MiAyNTUuOTA1IDQyMS40NDJaTTI1Ny4zNjIgNDYuMDM3MUMxMjAuODM4IDQ1LjI0NzUgNy45MjUyOCAxNTcuMDQ5IDYuNzcyMDcgMjk0LjE5M0M2LjE4NTM1IDM2Ni43OSAzNi4zNzExIDQzMi4zMzMgODUuMDI4MyA0NzguNDE5QzEwMi43MzEgNDk1LjE3MSAxMzAuMDg0IDQ5Ni44IDE0OS4yNjQgNDgxLjgyQzE3Ny42MjkgNDU5LjY1OSAyMTQuMDQ2IDQ0Ni40NTggMjU1LjkwNSA0NDYuNDU4QzI5Ny43NjQgNDQ2LjQ1OCAzMzQuMTgxIDQ1OS42NjcgMzYyLjU0NiA0ODEuODJDMzgxLjkwOCA0OTYuOTI2IDQwOS4zNjIgNDk0Ljk4OSA0MjcuMTY2IDQ3OC4wNTVDNDc1LjExNSA0MzIuNDQ0IDUwNS4wNTggMzY3Ljg2NiA1MDUuMDU4IDI5Ni4zMDVDNTA1LjA1OCAxNTguNTgzIDM5NC4yNjkgNDYuODI4OCAyNTcuMzYyIDQ2LjAzNzFaIiBmaWxsPSIjNkFDNjNGIi8+CjxjaXJjbGUgY3g9IjM4MC42MTgiIGN5PSIxNDQuNTI1IiByPSIxMjQuNjE4IiBmaWxsPSIjREExRTI4Ii8+CjxwYXRoIGQ9Ik0zMDUuNDg1IDE3MC40OTRMMzIwLjQ3OCAxOTYuNTA5TDM2NS4xOTQgMTcwLjY1MlYyMTkuNzIzSDM5NS4xOFYxNzAuNjQzTDQ0MC4zOTQgMTk2Ljc4OEw0NTUuMzg2IDE3MC43NzJMNDEwLjE4MyAxNDQuNjM0TDQ1NS4yMzkgMTE4LjU4MUw0NDAuMjQ2IDkyLjU2NjFMMzk1LjE4IDExOC42MjdWNjkuNTU3N0gzNjUuMTk0VjExOC42MkwzMjAuMjEzIDkyLjYxMTFMMzA1LjIyMSAxMTguNjI2TDM1MC4yMDEgMTQ0LjYzNEwzMDUuNDg1IDE3MC40OTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "timeout"
      },
      {
        "group": "timeout"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.Twilio.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' preserveAspectRatio='xMidYMid' viewBox='0 0 256 256' id='twilio'%3E%3Cg fill='%23CF272D'%3E%3Cpath d='M127.86 222.304c-52.005 0-94.164-42.159-94.164-94.163 0-52.005 42.159-94.163 94.164-94.163 52.004 0 94.162 42.158 94.162 94.163 0 52.004-42.158 94.163-94.162 94.163zm0-222.023C57.245.281 0 57.527 0 128.141 0 198.756 57.245 256 127.86 256c70.614 0 127.859-57.244 127.859-127.859 0-70.614-57.245-127.86-127.86-127.86z'%3E%3C/path%3E%3Cpath d='M133.116 96.297c0-14.682 11.903-26.585 26.586-26.585 14.683 0 26.585 11.903 26.585 26.585 0 14.684-11.902 26.586-26.585 26.586-14.683 0-26.586-11.902-26.586-26.586M133.116 159.983c0-14.682 11.903-26.586 26.586-26.586 14.683 0 26.585 11.904 26.585 26.586 0 14.683-11.902 26.586-26.585 26.586-14.683 0-26.586-11.903-26.586-26.586M69.431 159.983c0-14.682 11.904-26.586 26.586-26.586 14.683 0 26.586 11.904 26.586 26.586 0 14.683-11.903 26.586-26.586 26.586-14.682 0-26.586-11.903-26.586-26.586M69.431 96.298c0-14.683 11.904-26.585 26.586-26.585 14.683 0 26.586 11.902 26.586 26.585 0 14.684-11.903 26.586-26.586 26.586-14.682 0-26.586-11.902-26.586-26.586'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "filter",
          "label": "Filter"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {},
      {},
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {},
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "filter"
      },
      {
        "group": "filter"
      },
      {
        "group": "filter"
      },
      {
        "group": "filter"
      },
      {
        "group": "filter"
      },
      {
        "group": "filter"
      },
      {},
      {},
      {},
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.AWSEventBridge.startEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "API destination"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 256 256'%3E%3Cdefs%3E%3ClinearGradient id='logosAwsEventbridge0' x1='0%25' x2='100%25' y1='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23B0084D'/%3E%3Cstop offset='100%25' stop-color='%23FF4F8B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23logosAwsEventbridge0)' d='M0 0h256v256H0z'/%3E%3Cpath fill='%23FFF' d='M171.702 211.2c-6.858 0-12.44-5.61-12.44-12.509s5.582-12.509 12.44-12.509c6.857 0 12.438 5.61 12.438 12.51c0 6.898-5.581 12.508-12.438 12.508Zm-27.278-54.4h-33.071L94.815 128l16.538-28.8h33.071L160.96 128l-16.535 28.8ZM88.387 69.818c-6.857 0-12.438-5.61-12.438-12.51c0-6.898 5.581-12.508 12.438-12.508c6.861 0 12.443 5.61 12.443 12.509s-5.582 12.509-12.443 12.509Zm83.315 109.964c-2.362 0-4.614.458-6.699 1.261l-13.514-22.931l-.713.426L167.39 129.6a3.226 3.226 0 0 0 0-3.2l-18.374-32a3.177 3.177 0 0 0-2.755-1.6h-33.435l.13-.077l-12.39-21.03c4.047-3.469 6.628-8.627 6.628-14.384c0-10.426-8.436-18.909-18.807-18.909c-10.367 0-18.803 8.483-18.803 18.909c0 10.425 8.436 18.909 18.803 18.909c2.365 0 4.618-.458 6.702-1.261l11.567 19.625L88.384 126.4a3.226 3.226 0 0 0 0 3.2l18.377 32c.57.992 1.62 1.6 2.756 1.6h36.744c.264 0 .521-.042.77-.102l12.496 21.21c-4.051 3.468-6.629 8.626-6.629 14.383c0 10.426 8.433 18.909 18.804 18.909c10.37 0 18.803-8.483 18.803-18.909c0-10.425-8.433-18.909-18.803-18.909Zm18.968-77.05c-6.857 0-12.436-5.609-12.436-12.508c0-6.9 5.579-12.509 12.436-12.509c6.858 0 12.44 5.61 12.44 12.509c0 6.9-5.582 12.509-12.44 12.509Zm23.303 23.668l-12.08-21.04c4.592-3.453 7.58-8.944 7.58-15.136c0-10.426-8.432-18.909-18.803-18.909c-2.638 0-5.152.554-7.433 1.549l-9.849-17.155a3.18 3.18 0 0 0-2.756-1.6h-39.448v6.4h37.612l9.11 15.872c-3.703 3.456-6.036 8.374-6.036 13.843c0 10.426 8.433 18.909 18.8 18.909c1.932 0 3.8-.298 5.556-.845L207.545 128l-15.892 27.674l5.512 3.2l16.808-29.274a3.21 3.21 0 0 0 0-3.2Zm-146.04 50.39c-6.86 0-12.442-5.612-12.442-12.508c0-6.9 5.581-12.51 12.442-12.51c6.857 0 12.439 5.61 12.439 12.51c0 6.896-5.582 12.508-12.44 12.508Zm10.393 3.236c5.062-3.392 8.41-9.181 8.41-15.744c0-10.426-8.436-18.91-18.803-18.91c-3.004 0-5.833.73-8.353 1.994L48.458 128l18.428-32.093l-5.515-3.2L42.027 126.4a3.21 3.21 0 0 0 0 3.2l12.388 21.568c-3.268 3.405-5.289 8.022-5.289 13.114c0 10.425 8.436 18.908 18.807 18.908c1.562 0 3.074-.214 4.528-.579l10.15 17.68c.57.989 1.62 1.6 2.757 1.6h39.451v-6.4H87.204l-8.878-15.465Z'/%3E%3C/svg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.webhook.WebhookConnector.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook Configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable Mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg id='icon' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 32 32'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: none; %7D %3C/style%3E%3C/defs%3E%3Cpath d='M24,26a3,3,0,1,0-2.8164-4H13v1a5,5,0,1,1-5-5V16a7,7,0,1,0,6.9287,8h6.2549A2.9914,2.9914,0,0,0,24,26Z'/%3E%3Cpath d='M24,16a7.024,7.024,0,0,0-2.57.4873l-3.1656-5.5395a3.0469,3.0469,0,1,0-1.7326.9985l4.1189,7.2085.8686-.4976a5.0006,5.0006,0,1,1-1.851,6.8418L17.937,26.501A7.0005,7.0005,0,1,0,24,16Z'/%3E%3Cpath d='M8.532,20.0537a3.03,3.03,0,1,0,1.7326.9985C11.74,18.47,13.86,14.7607,13.89,14.708l.4976-.8682-.8677-.497a5,5,0,1,1,6.812-1.8438l1.7315,1.002a7.0008,7.0008,0,1,0-10.3462,2.0356c-.457.7427-1.1021,1.8716-2.0737,3.5728Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.message.end.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "default",
          "label": "Properties"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZwogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHdpZHRoPSIyMDAwIgogICBoZWlnaHQ9IjIwMDAiCiAgIHZpZXdCb3g9IjAgMCAyMDAwIDIwMDAiCiAgIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KICA8cGF0aAogICAgIHN0eWxlPSJjb2xvcjojMDAwMDAwIgogICAgIGQ9Im0gMCwyODQgMjAwMCwwIC0xMDAwLDU1NCB6Ii8+CiAgPHBhdGgKICAgICBzdHlsZT0iY29sb3I6IzAwMDAwMCIKICAgICBkPSJtIDAsNDUyIDEwMDAsNTQ4IDEwMDAsLTU0OCAwLDEwOTYgLTIwMDAsMCB6Ii8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.AutomationAnywhere": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "timeout",
          "label": "Timeout"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgNjUyIDY1Micgc3R5bGU9J2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjUyIDY1MjsnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+CiAgICA8ZGVmcz4KICAgICAgICA8c3R5bGUgdHlwZT0ndGV4dC9jc3MnPi5zdDB7Y2xpcC1wYXRoOnVybCgjU1ZHSURfMl8pO2ZpbGw6dXJsKCNTVkdJRF8zXyk7fSAuc3Qxe29wYWNpdHk6MC4zO30KICAgICAgICAgICAgLnN0MntjbGlwLXBhdGg6dXJsKCNTVkdJRF81Xyk7ZmlsbDp1cmwoI1NWR0lEXzZfKTt9IC5zdDN7ZmlsbDojNDA0MDQxO30gLnN0NHtmaWxsOiNGNzk4Mzc7fQogICAgICAgIDwvc3R5bGU+CiAgICA8L2RlZnM+CiAgICA8ZyBzdHlsZT0nJyB0cmFuc2Zvcm09J21hdHJpeCgyLjgzODk0NiwgMCwgMCwgMi44MDcxMjYsIC00NC41MzQzNjMsIC01NzguMzQzMzg0KSc+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxkZWZzPgogICAgICAgICAgICAgICAgPHBhdGggaWQ9J1NWR0lEXzFfJwogICAgICAgICAgICAgICAgICAgICAgZD0nTTE5OS41LDQxMi43bC0wLjItMC41bC0wLjUtMWwtMTEuNy0zMS41YzExLjEsNS4xLDIxLjQsMTEuOCwzMC43LDIwLjFsMCwwYzEuMiwwLjksMi4yLDIuMiwzLDMuNyBjMC45LDEuNywxLjQsMy41LDEuNCw1LjVjMCw2LjQtNS4yLDExLjYtMTEuNiwxMS42QzIwNS41LDQyMC42LDIwMS4xLDQxNy40LDE5OS41LDQxMi43IE0xMDMuMywyMjkuNmMxLjUtNC4xLDQuOS02LjksOC43LTcgYzAsMCwwLjEsMCwwLjEsMGMzLjgsMC4yLDcuMiwyLjksOC43LDdsNDguMywxMzIuNmMtMTAuNy0yLjctMjEuNy00LjEtMzIuOS00LjFjLTIzLjUsMC00Ni43LDYuMi02Ni45LDE4IGMtOS44LDUuNy0xOC44LDEyLjctMjYuOSwyMC42TDEwMy4zLDIyOS42eiBNMTEwLjksMjEyYy03LjgsMC42LTE0LjcsNi0xNy42LDE0TDIxLDQyNC41Yy0xLDIuOCwwLjQsNS44LDMuMiw2LjggYzAuNiwwLjIsMS4yLDAuMywxLjgsMC4zYzEuNywwLDMuMy0wLjgsNC4zLTIuMmMwLjItMC4yLDAuMy0wLjQsMC41LTAuN2MxMC43LTE4LDI1LjgtMzMuMSw0My45LTQzLjYgYzE4LjYtMTAuOCwzOS45LTE2LjYsNjEuNi0xNi42YzEyLjksMCwyNS42LDIsMzcuNiw1LjlsMTUuMyw0MS4xbDAuNSwwLjljMy4yLDguOCwxMS41LDE0LjcsMjAuOSwxNC43YzEyLjMsMCwyMi4yLTEwLDIyLjItMjIuMiBjMC0zLjYtMC45LTcuMy0yLjYtMTAuNWMtMC43LTEuMi0xLjQtMi4zLTIuMi0zLjRjLTAuMy0wLjUtMC42LTEtMS0xLjRjLTEzLjEtMTIuMi0yOC40LTIxLjUtNDQuOS0yNy42bC0xLjEtMi44bC0wLjEsMCBMMTMwLjgsMjI2Yy0yLjktNy45LTkuNy0xMy4zLTE3LjYtMTRjLTAuMywwLTAuNi0wLjEtMC45LTAuMWMtMC4xLDAtMC4yLDAtMC4yLDBjLTAuMSwwLTAuMiwwLTAuMiwwIEMxMTEuNSwyMTEuOSwxMTEuMiwyMTIsMTEwLjksMjEyJy8+CiAgICAgICAgICAgIDwvZGVmcz4KICAgICAgICAgICAgPGNsaXBQYXRoIGlkPSdTVkdJRF8yXyc+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSdNMTk5LjUsNDEyLjdsLTAuMi0wLjVsLTAuNS0xbC0xMS43LTMxLjVjMTEuMSw1LjEsMjEuNCwxMS44LDMwLjcsMjAuMWwwLDBjMS4yLDAuOSwyLjIsMi4yLDMsMy43IGMwLjksMS43LDEuNCwzLjUsMS40LDUuNWMwLDYuNC01LjIsMTEuNi0xMS42LDExLjZDMjA1LjUsNDIwLjYsMjAxLjEsNDE3LjQsMTk5LjUsNDEyLjcgTTEwMy4zLDIyOS42YzEuNS00LjEsNC45LTYuOSw4LjctNyBjMCwwLDAuMSwwLDAuMSwwYzMuOCwwLjIsNy4yLDIuOSw4LjcsN2w0OC4zLDEzMi42Yy0xMC43LTIuNy0yMS43LTQuMS0zMi45LTQuMWMtMjMuNSwwLTQ2LjcsNi4yLTY2LjksMTggYy05LjgsNS43LTE4LjgsMTIuNy0yNi45LDIwLjZMMTAzLjMsMjI5LjZ6IE0xMTAuOSwyMTJjLTcuOCwwLjYtMTQuNyw2LTE3LjYsMTRMMjEsNDI0LjVjLTEsMi44LDAuNCw1LjgsMy4yLDYuOCBjMC42LDAuMiwxLjIsMC4zLDEuOCwwLjNjMS43LDAsMy4zLTAuOCw0LjMtMi4yYzAuMi0wLjIsMC4zLTAuNCwwLjUtMC43YzEwLjctMTgsMjUuOC0zMy4xLDQzLjktNDMuNiBjMTguNi0xMC44LDM5LjktMTYuNiw2MS42LTE2LjZjMTIuOSwwLDI1LjYsMiwzNy42LDUuOWwxNS4zLDQxLjFsMC41LDAuOWMzLjIsOC44LDExLjUsMTQuNywyMC45LDE0LjdjMTIuMywwLDIyLjItMTAsMjIuMi0yMi4yIGMwLTMuNi0wLjktNy4zLTIuNi0xMC41Yy0wLjctMS4yLTEuNC0yLjMtMi4yLTMuNGMtMC4zLTAuNS0wLjYtMS0xLTEuNGMtMTMuMS0xMi4yLTI4LjQtMjEuNS00NC45LTI3LjZsLTEuMS0yLjhsLTAuMSwwIEwxMzAuOCwyMjZjLTIuOS03LjktOS43LTEzLjMtMTcuNi0xNGMtMC4zLDAtMC42LTAuMS0wLjktMC4xYy0wLjEsMC0wLjIsMC0wLjIsMGMtMC4xLDAtMC4yLDAtMC4yLDAgQzExMS41LDIxMS45LDExMS4yLDIxMiwxMTAuOSwyMTInCiAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm09J21hdHJpeCgxLCAwLCAwLCAxLCAwLCAwKScgc3R5bGU9J292ZXJmbG93OiB2aXNpYmxlOycvPgogICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9J1NWR0lEXzNfJyBncmFkaWVudFVuaXRzPSd1c2VyU3BhY2VPblVzZScgeDE9Jy00LjkzOCcgeTE9Jzc0My4wMjAzJyB4Mj0nMS45NzkyJwogICAgICAgICAgICAgICAgICAgICAgICAgICAgeTI9Jzc0My4wMjAzJyBncmFkaWVudFRyYW5zZm9ybT0nbWF0cml4KDMwLjY1OCAwIDAgLTMwLjY1OCAxNzIuMDgwMyAyMzEwMS4zNDE4KSc+CiAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9JzAnIHN0eWxlPSdzdG9wLWNvbG9yOiNGRkREMTUnLz4KICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0nMC4wMzQzJyBzdHlsZT0nc3RvcC1jb2xvcjojRkVEMjE3Jy8+CiAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9JzAuMTY2Mycgc3R5bGU9J3N0b3AtY29sb3I6I0ZBQUQxQycvPgogICAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PScwLjMwNDknIHN0eWxlPSdzdG9wLWNvbG9yOiNGNjhGMjAnLz4KICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0nMC40NScgc3R5bGU9J3N0b3AtY29sb3I6I0YzNzgyNCcvPgogICAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PScwLjYwNDUnIHN0eWxlPSdzdG9wLWNvbG9yOiNGMTY3MjYnLz4KICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0nMC43NzQ3JyBzdHlsZT0nc3RvcC1jb2xvcjojRjA1RDI4Jy8+CiAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9JzAuOTkxJyBzdHlsZT0nc3RvcC1jb2xvcjojRjA1QTI4Jy8+CiAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9JzEnIHN0eWxlPSdzdG9wLWNvbG9yOiNGMDVBMjgnLz4KICAgICAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgICAgICAgICAgPHJlY3QgeD0nMjAnIHk9JzIxMS45JyBjbGFzcz0nc3QwJyB3aWR0aD0nMjEyLjgnIGhlaWdodD0nMjE5LjcnLz4KICAgICAgICA8L2c+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxnIGNsYXNzPSdzdDEnPgogICAgICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICAgICAgPGc+CiAgICAgICAgICAgICAgICAgICAgICAgIDxkZWZzPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggaWQ9J1NWR0lEXzRfJwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZD0nTTE4Ny4zLDM4MC4zYzExLjEsNS4xLDIxLjQsMTEuOCwzMC43LDIwbDAsMGMxLjIsMSwyLjIsMi4yLDMsMy43YzAuOSwxLjcsMS40LDMuNSwxLjQsNS41SDIzMyBjMC0zLjYtMC45LTcuMy0yLjYtMTAuNWMtMC42LTEuMi0xLjQtMi4zLTIuMi0zLjRjLTAuMy0wLjUtMC42LTEtMS0xLjRjLTEzLjEtMTIuMi0yOC40LTIxLjUtNDQuOS0yNy42TDE4Ny4zLDM4MC4zeiBNNjkuNSwzNzYuN2MtOS44LDUuNy0xOC44LDEyLjctMjYuOSwyMC42bC0xMi4yLDMyLjhjMC4yLTAuMiwwLjMtMC40LDAuNS0wLjdjMTAuNy0xOCwyNS45LTMzLjEsNDMuOS00My42IGMxOC42LTEwLjgsMzkuOS0xNi42LDYxLjYtMTYuNmMxMi4xLDAsMjUuMSwxLjksMzcuNiw1LjlsLTQuNy0xMi40Yy0xMC43LTIuNy0yMS43LTQuMS0zMi45LTQuMSBDMTEyLjksMzU4LjcsODkuOCwzNjQuOSw2OS41LDM3Ni43Jy8+CiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGVmcz4KICAgICAgICAgICAgICAgICAgICAgICAgPGNsaXBQYXRoIGlkPSdTVkdJRF81Xyc+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPSdNMTg3LjMsMzgwLjNjMTEuMSw1LjEsMjEuNCwxMS44LDMwLjcsMjBsMCwwYzEuMiwxLDIuMiwyLjIsMywzLjdjMC45LDEuNywxLjQsMy41LDEuNCw1LjVIMjMzIGMwLTMuNi0wLjktNy4zLTIuNi0xMC41Yy0wLjYtMS4yLTEuNC0yLjMtMi4yLTMuNGMtMC4zLTAuNS0wLjYtMS0xLTEuNGMtMTMuMS0xMi4yLTI4LjQtMjEuNS00NC45LTI3LjZMMTg3LjMsMzgwLjN6IE02OS41LDM3Ni43Yy05LjgsNS43LTE4LjgsMTIuNy0yNi45LDIwLjZsLTEyLjIsMzIuOGMwLjItMC4yLDAuMy0wLjQsMC41LTAuN2MxMC43LTE4LDI1LjktMzMuMSw0My45LTQzLjYgYzE4LjYtMTAuOCwzOS45LTE2LjYsNjEuNi0xNi42YzEyLjEsMCwyNS4xLDEuOSwzNy42LDUuOWwtNC43LTEyLjRjLTEwLjctMi43LTIxLjctNC4xLTMyLjktNC4xIEMxMTIuOSwzNTguNyw4OS44LDM2NC45LDY5LjUsMzc2LjcnCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm09J21hdHJpeCgxLCAwLCAwLCAxLCAwLCAwKScgc3R5bGU9J292ZXJmbG93OiB2aXNpYmxlOycvPgogICAgICAgICAgICAgICAgICAgICAgICA8L2NsaXBQYXRoPgogICAgICAgICAgICAgICAgICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9J1NWR0lEXzZfJyBncmFkaWVudFVuaXRzPSd1c2VyU3BhY2VPblVzZScgeDE9Jy01LjQwNDInIHkxPSc3NDEuNDczJwogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeDI9JzEuNTEzMScgeTI9Jzc0MS40NzMnCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmFkaWVudFRyYW5zZm9ybT0nbWF0cml4KDI5LjI3NDggMCAwIC0yOS4yNzQ4IDE4OC43MTUyIDIyMTAwLjg0NzcpJz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0nMCcgc3R5bGU9J3N0b3AtY29sb3I6I0ZGRkZGRicvPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PScwLjMyODUnIHN0eWxlPSdzdG9wLWNvbG9yOiNGRkZGRkYnLz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0nMC4zNzQ1JyBzdHlsZT0nc3RvcC1jb2xvcjojRkJGQkZCJy8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9JzAuNDIzMycgc3R5bGU9J3N0b3AtY29sb3I6I0VFRUVFRScvPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PScwLjQ3MzUnIHN0eWxlPSdzdG9wLWNvbG9yOiNEOUQ5RDknLz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0nMC41MjQ2JyBzdHlsZT0nc3RvcC1jb2xvcjojQkNCQkJCJy8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9JzAuNTc2NCcgc3R5bGU9J3N0b3AtY29sb3I6Izk2OTU5NScvPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PScwLjYyODgnIHN0eWxlPSdzdG9wLWNvbG9yOiM2ODY2NjYnLz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0nMC42ODA4JyBzdHlsZT0nc3RvcC1jb2xvcjojMzMyRjMwJy8+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9JzAuNjk0OCcgc3R5bGU9J3N0b3AtY29sb3I6IzIzMUYyMCcvPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PScwLjkzMDEnIHN0eWxlPSdzdG9wLWNvbG9yOiNGRkZGRkYnLz4KICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD0nMScgc3R5bGU9J3N0b3AtY29sb3I6I0ZGRkZGRicvPgogICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCB4PSczMC41JyB5PSczNTguNycgY2xhc3M9J3N0Micgd2lkdGg9JzE4JyBoZWlnaHQ9JzE4Jy8+CiAgICAgICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgICAgIDxnLz4KICAgIDwvZz4KPC9zdmc+"
      }
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "configuration"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "timeout"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.inbound.Slack.StartEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20%20viewBox%3D%220%200%20127%20127%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d%3D%22M27.2%2080c0%207.3-5.9%2013.2-13.2%2013.2C6.7%2093.2.8%2087.3.8%2080c0-7.3%205.9-13.2%2013.2-13.2h13.2V80zm6.6%200c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2v33c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V80z%22%20fill%3D%22%23E01E5A%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M47%2027c-7.3%200-13.2-5.9-13.2-13.2C33.8%206.5%2039.7.6%2047%20.6c7.3%200%2013.2%205.9%2013.2%2013.2V27H47zm0%206.7c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H13.9C6.6%2060.1.7%2054.2.7%2046.9c0-7.3%205.9-13.2%2013.2-13.2H47z%22%20fill%3D%22%2336C5F0%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M99.9%2046.9c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H99.9V46.9zm-6.6%200c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V13.8C66.9%206.5%2072.8.6%2080.1.6c7.3%200%2013.2%205.9%2013.2%2013.2v33.1z%22%20fill%3D%22%232EB67D%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M80.1%2099.8c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3%200-13.2-5.9-13.2-13.2%200-7.3%205.9-13.2%2013.2-13.2h33.1c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H80.1z%22%20fill%3D%22%23ECB22E%22%2F%3E%0A%3C%2Fsvg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.AWSSNS.Receive.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": [
          "receive event",
          "receive message"
        ]
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "subscription",
          "label": "Subscription Configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTgnIGhlaWdodD0nMTgnIHZpZXdCb3g9JzAgMCA4MCA4MCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnCiAgICAgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPjwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNjQgKDkzNTM3KSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT5JY29uLUFyY2hpdGVjdHVyZS82NC9BcmNoX0FXUy1TaW1wbGUtTm90aWZpY2F0aW9uLVNlcnZpY2VfNjQ8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9JzAlJyB5MT0nMTAwJScgeDI9JzEwMCUnIHkyPScwJScgaWQ9J2xpbmVhckdyYWRpZW50LTEnPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPScjQjAwODREJyBvZmZzZXQ9JzAlJz48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyNGRjRGOEInIG9mZnNldD0nMTAwJSc+PC9zdG9wPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8L2RlZnM+CiAgICA8ZyBpZD0nSWNvbi1BcmNoaXRlY3R1cmUvNjQvQXJjaF9BV1MtU2ltcGxlLU5vdGlmaWNhdGlvbi1TZXJ2aWNlXzY0JyBzdHJva2U9J25vbmUnIHN0cm9rZS13aWR0aD0nMScgZmlsbD0nbm9uZScKICAgICAgIGZpbGwtcnVsZT0nZXZlbm9kZCc+CiAgICAgICAgPGcgaWQ9J0ljb24tQXJjaGl0ZWN0dXJlLUJHLzY0L0FwcGxpY2F0aW9uLUludGVncmF0aW9uJyBmaWxsPSd1cmwoI2xpbmVhckdyYWRpZW50LTEpJz4KICAgICAgICAgICAgPHJlY3QgaWQ9J1JlY3RhbmdsZScgeD0nMCcgeT0nMCcgd2lkdGg9JzgwJyBoZWlnaHQ9JzgwJz48L3JlY3Q+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGQ9J00xNywzOCBDMTguMTAzLDM4IDE5LDM4Ljg5NyAxOSw0MCBDMTksNDEuMTAzIDE4LjEwMyw0MiAxNyw0MiBDMTUuODk3LDQyIDE1LDQxLjEwMyAxNSw0MCBDMTUsMzguODk3IDE1Ljg5NywzOCAxNywzOCBMMTcsMzggWiBNNDEsNjQgQzI5LjMxNCw2NCAxOS4yODksNTUuNDY2IDE3LjE5NCw0My45OCBDMTguOTY1LDQzLjg5NCAyMC40MjcsNDIuNjU5IDIwLjg1Nyw0MSBMMjcsNDEgTDI3LDM5IEwyMC44NTcsMzkgQzIwLjQyNywzNy4zNDIgMTguOTY2LDM2LjEwNyAxNy4xOTUsMzYuMDIgQzE5LjI4NSwyNC43MSAyOS41MTEsMTYgNDEsMTYgQzQ1LjMxMywxNiA0OS44MzIsMTcuNjIyIDU0LjQyOSwyMC44MjEgTDU1LjU3MSwxOS4xNzkgQzUwLjYzMywxNS43NDMgNDUuNzMsMTQgNDEsMTQgQzI4LjI3LDE0IDE2Ljk0OSwyMy44NjUgMTUuMDYzLDM2LjUyMSBDMTMuODM5LDM3LjIwNyAxMywzOC41IDEzLDQwIEMxMyw0MS41IDEzLjgzOSw0Mi43OTMgMTUuMDYzLDQzLjQ3OCBDMTYuOTcsNTYuMzQxIDI4LjA1Niw2NiA0MSw2NiBDNDYuNDA3LDY2IDUxLjk0Miw2NC4xNTcgNTYuNTg1LDYwLjgxMSBMNTUuNDE1LDU5LjE4OSBDNTEuMTEsNjIuMjkyIDQ1Ljk5MSw2NCA0MSw2NCBMNDEsNjQgWiBNMzAuMTAxLDM2LjQ0MiBDMzEuOTU1LDM2Ljg5NSAzNC4yNzUsMzcgMzYsMzcgQzM3LjY0MiwzNyAzOS44MjMsMzYuOTA1IDQxLjYyOSwzNi41MDYgTDM3LjEwNSw0NS41NTMgQzM3LjAzNiw0NS42OTEgMzcsNDUuODQ1IDM3LDQ2IEwzNyw1MC40NTMgQzM2LjE5OSw1MC45NjQgMzQuODMzLDUxLjgxMiAzNCw1MS45ODYgTDM0LDQ2IEMzNCw0NS44NjggMzMuOTc0LDQ1LjczNyAzMy45MjMsNDUuNjE1IEwzMC4xMDEsMzYuNDQyIFogTTM2LDMzIEM0MC4wMjUsMzMgNDIuMTc0LDMzLjYwNCA0Mi44NDEsMzQgQzQyLjE3NCwzNC4zOTYgNDAuMDI1LDM1IDM2LDM1IEMzMS45NzUsMzUgMjkuODI2LDM0LjM5NiAyOS4xNTksMzQgQzI5LjgyNiwzMy42MDQgMzEuOTc1LDMzIDM2LDMzIEwzNiwzMyBaIE0zMyw1NCBMMzQsNTQgQzM0LjA0Myw1NCAzNC4wODYsNTMuOTk3IDM0LjEyOCw1My45OTIgQzM1LjM1Miw1My44MzMgMzYuOTA5LDUyLjg4NyAzOC4yNzIsNTIuMDEzIEwzOC41MzUsNTEuODQ1IEMzOC44MjQsNTEuNjYxIDM5LDUxLjM0MiAzOSw1MSBMMzksNDYuMjM2IEw0NC41NTksMzUuMTIgQzQ0LjgzMywzNC44MDEgNDUsMzQuNDM0IDQ1LDM0IEM0NSwzMS4zOSAzOS4zNjEsMzEgMzYsMzEgQzMyLjYzOSwzMSAyNywzMS4zOSAyNywzNCBDMjcsMzQuMzY2IDI3LjEyLDM0LjY4NCAyNy4zMiwzNC45NjcgTDMyLDQ2LjIgTDMyLDUzIEMzMiw1My41NTIgMzIuNDQ3LDU0IDMzLDU0IEwzMyw1NCBaIE02Miw1MyBDNjMuMTAzLDUzIDY0LDUzLjg5NyA2NCw1NSBDNjQsNTYuMTAzIDYzLjEwMyw1NyA2Miw1NyBDNjAuODk3LDU3IDYwLDU2LjEwMyA2MCw1NSBDNjAsNTMuODk3IDYwLjg5Nyw1MyA2Miw1MyBMNjIsNTMgWiBNNjIsMjMgQzYzLjEwMywyMyA2NCwyMy44OTcgNjQsMjUgQzY0LDI2LjEwMyA2My4xMDMsMjcgNjIsMjcgQzYwLjg5NywyNyA2MCwyNi4xMDMgNjAsMjUgQzYwLDIzLjg5NyA2MC44OTcsMjMgNjIsMjMgTDYyLDIzIFogTTY0LDM4IEM2NS4xMDMsMzggNjYsMzguODk3IDY2LDQwIEM2Niw0MS4xMDMgNjUuMTAzLDQyIDY0LDQyIEM2Mi44OTcsNDIgNjIsNDEuMTAzIDYyLDQwIEM2MiwzOC44OTcgNjIuODk3LDM4IDY0LDM4IEw2NCwzOCBaIE01NCw0MSBMNjAuMTQzLDQxIEM2MC41ODksNDIuNzIgNjIuMTQyLDQ0IDY0LDQ0IEM2Ni4yMDYsNDQgNjgsNDIuMjA2IDY4LDQwIEM2OCwzNy43OTQgNjYuMjA2LDM2IDY0LDM2IEM2Mi4xNDIsMzYgNjAuNTg5LDM3LjI4IDYwLjE0MywzOSBMNTQsMzkgTDU0LDI2IEw1OC4xNDMsMjYgQzU4LjU4OSwyNy43MiA2MC4xNDIsMjkgNjIsMjkgQzY0LjIwNiwyOSA2NiwyNy4yMDYgNjYsMjUgQzY2LDIyLjc5NCA2NC4yMDYsMjEgNjIsMjEgQzYwLjE0MiwyMSA1OC41ODksMjIuMjggNTguMTQzLDI0IEw1MywyNCBDNTIuNDQ3LDI0IDUyLDI0LjQ0OCA1MiwyNSBMNTIsMzkgTDQ1LDM5IEw0NSw0MSBMNTIsNDEgTDUyLDU1IEM1Miw1NS41NTIgNTIuNDQ3LDU2IDUzLDU2IEw1OC4xNDMsNTYgQzU4LjU4OSw1Ny43MiA2MC4xNDIsNTkgNjIsNTkgQzY0LjIwNiw1OSA2Niw1Ny4yMDYgNjYsNTUgQzY2LDUyLjc5NCA2NC4yMDYsNTEgNjIsNTEgQzYwLjE0Miw1MSA1OC41ODksNTIuMjggNTguMTQzLDU0IEw1NCw1NCBMNTQsNDEgWicKICAgICAgICAgICAgICBpZD0nQVdTLVNpbXBsZS1Ob3RpZmljYXRpb24tU2VydmljZV9JY29uXzY0X1NxdWlkJyBmaWxsPScjRkZGRkZGJz48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.MSFT.O365.Mail.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "server",
          "label": "Server"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "requestBody",
          "label": "Request"
        },
        {
          "id": "parameters",
          "label": "Parameters"
        },
        {
          "id": "url",
          "label": "URL"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' height='16' width='16' viewBox='-274.66275 -425.834 2380.4105 2555.004'%3E%3Cpath d='M1831.083 894.25a40.879 40.879 0 00-19.503-35.131h-.213l-.767-.426-634.492-375.585a86.175 86.175 0 00-8.517-5.067 85.17 85.17 0 00-78.098 0 86.37 86.37 0 00-8.517 5.067l-634.49 375.585-.766.426c-19.392 12.059-25.337 37.556-13.278 56.948a41.346 41.346 0 0014.257 13.868l634.492 375.585a95.617 95.617 0 008.517 5.068 85.17 85.17 0 0078.098 0 95.52 95.52 0 008.517-5.068l634.492-375.585a40.84 40.84 0 0020.268-35.685z' fill='%230A2767'/%3E%3Cpath d='M520.453 643.477h416.38v381.674h-416.38zM1745.917 255.5V80.908c1-43.652-33.552-79.862-77.203-80.908H588.204C544.552 1.046 510 37.256 511 80.908V255.5l638.75 170.333z' fill='%230364B8'/%3E%3Cpath d='M511 255.5h425.833v383.25H511z' fill='%230078D4'/%3E%3Cpath d='M1362.667 255.5H936.833v383.25L1362.667 1022h383.25V638.75z' fill='%2328A8EA'/%3E%3Cpath d='M936.833 638.75h425.833V1022H936.833z' fill='%230078D4'/%3E%3Cpath d='M936.833 1022h425.833v383.25H936.833z' fill='%230364B8'/%3E%3Cpath d='M520.453 1025.151h416.38v346.969h-416.38z' fill='%2314447D'/%3E%3Cpath d='M1362.667 1022h383.25v383.25h-383.25z' fill='%230078D4'/%3E%3ClinearGradient gradientTransform='matrix(1 0 0 -1 0 1705.333)' y2='1.998' x2='1128.458' y1='811.083' x1='1128.458' gradientUnits='userSpaceOnUse' id='a'%3E%3Cstop offset='0' stop-color='%2335b8f1'/%3E%3Cstop offset='1' stop-color='%2328a8ea'/%3E%3C/linearGradient%3E%3Cpath d='M1811.58 927.593l-.809.426-634.492 356.848c-2.768 1.703-5.578 3.321-8.517 4.769a88.437 88.437 0 01-34.407 8.517l-34.663-20.27a86.706 86.706 0 01-8.517-4.897L447.167 906.003h-.298l-21.036-11.753v722.384c.328 48.196 39.653 87.006 87.849 86.7h1230.914c.724 0 1.363-.341 2.129-.341a107.79 107.79 0 0029.808-6.217 86.066 86.066 0 0011.966-6.217c2.853-1.618 7.75-5.152 7.75-5.152a85.974 85.974 0 0034.833-68.772V894.25a38.323 38.323 0 01-19.502 33.343z' fill='url(%23a)'/%3E%3Cpath d='M1797.017 891.397v44.287l-663.448 456.791-686.87-486.174a.426.426 0 00-.426-.426l-63.023-37.899v-31.938l25.976-.426 54.932 31.512 1.277.426 4.684 2.981s645.563 368.346 647.267 369.197l24.698 14.478c2.129-.852 4.258-1.703 6.813-2.555 1.278-.852 640.879-360.681 640.879-360.681z' fill='%230A2767' opacity='.5'/%3E%3Cpath d='M1811.58 927.593l-.809.468-634.492 356.848c-2.768 1.703-5.578 3.321-8.517 4.769a88.96 88.96 0 01-78.098 0 96.578 96.578 0 01-8.517-4.769l-634.49-356.848-.766-.468a38.326 38.326 0 01-20.057-33.343v722.384c.305 48.188 39.616 87.004 87.803 86.7h1229.64c48.188.307 87.5-38.509 87.807-86.696 0-.001 0 0 0 0V894.25a38.33 38.33 0 01-19.504 33.343z' fill='%231490DF'/%3E%3Cpath d='M1185.52 1279.629l-9.496 5.323a92.806 92.806 0 01-8.517 4.812 88.173 88.173 0 01-33.47 8.857l241.405 285.479 421.107 101.476a86.785 86.785 0 0026.7-33.343z' opacity='.1'/%3E%3Cpath d='M1228.529 1255.442l-52.505 29.51a92.806 92.806 0 01-8.517 4.812 88.173 88.173 0 01-33.47 8.857l113.101 311.838 549.538 74.989a86.104 86.104 0 0034.407-68.815v-9.326z' opacity='.05'/%3E%3Cpath d='M514.833 1703.333h1228.316a88.316 88.316 0 0052.59-17.033l-697.089-408.331a86.706 86.706 0 01-8.517-4.897L447.125 906.088h-.298l-20.993-11.838v719.914c-.048 49.2 39.798 89.122 88.999 89.169-.001 0-.001 0 0 0z' fill='%2328A8EA'/%3E%3Cpath d='M1022 418.722v908.303c-.076 31.846-19.44 60.471-48.971 72.392a73.382 73.382 0 01-28.957 5.962H425.833V383.25H511v-42.583h433.073c43.019.163 77.834 35.035 77.927 78.055z' opacity='.1'/%3E%3Cpath d='M979.417 461.305v908.302a69.36 69.36 0 01-6.388 29.808c-11.826 29.149-40.083 48.273-71.54 48.417H425.833V383.25h475.656a71.493 71.493 0 0135.344 8.943c26.104 13.151 42.574 39.883 42.584 69.112z' opacity='.2'/%3E%3Cpath d='M979.417 461.305v823.136c-.208 43-34.928 77.853-77.927 78.225H425.833V383.25h475.656a71.493 71.493 0 0135.344 8.943c26.104 13.151 42.574 39.883 42.584 69.112z' opacity='.2'/%3E%3Cpath d='M936.833 461.305v823.136c-.046 43.067-34.861 78.015-77.927 78.225H425.833V383.25h433.072c43.062.023 77.951 34.951 77.927 78.013a.589.589 0 01.001.042z' opacity='.2'/%3E%3ClinearGradient gradientTransform='matrix(1 0 0 -1 0 1705.333)' y2='324.259' x2='774.086' y1='1383.074' x1='162.747' gradientUnits='userSpaceOnUse' id='b'%3E%3Cstop offset='0' stop-color='%231784d9'/%3E%3Cstop offset='.5' stop-color='%23107ad5'/%3E%3Cstop offset='1' stop-color='%230a63c9'/%3E%3C/linearGradient%3E%3Cpath d='M78.055 383.25h780.723c43.109 0 78.055 34.947 78.055 78.055v780.723c0 43.109-34.946 78.055-78.055 78.055H78.055c-43.109 0-78.055-34.947-78.055-78.055V461.305c0-43.108 34.947-78.055 78.055-78.055z' fill='url(%23b)'/%3E%3Cpath d='M243.96 710.631a227.05 227.05 0 0189.17-98.495 269.56 269.56 0 01141.675-35.515 250.91 250.91 0 01131.114 33.683 225.014 225.014 0 0186.742 94.109 303.751 303.751 0 0130.405 138.396 320.567 320.567 0 01-31.299 144.783 230.37 230.37 0 01-89.425 97.388 260.864 260.864 0 01-136.011 34.578 256.355 256.355 0 01-134.01-34.067 228.497 228.497 0 01-87.892-94.28 296.507 296.507 0 01-30.745-136.735 329.29 329.29 0 0130.276-143.845zm95.046 231.227a147.386 147.386 0 0050.163 64.812 131.028 131.028 0 0078.353 23.591 137.244 137.244 0 0083.634-24.358 141.156 141.156 0 0048.715-64.812 251.594 251.594 0 0015.543-90.404 275.198 275.198 0 00-14.649-91.554 144.775 144.775 0 00-47.182-67.537 129.58 129.58 0 00-82.91-25.55 135.202 135.202 0 00-80.184 23.804 148.626 148.626 0 00-51.1 65.365 259.759 259.759 0 00-.341 186.728z' fill='%23FFF'/%3E%3Cpath d='M1362.667 255.5h383.25v383.25h-383.25z' fill='%2350D9FF'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "server"
      },
      {
        "group": "operation"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {},
      {
        "group": "requestBody"
      },
      {
        "group": "url"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.agenticai.a2a.client.polling.receive.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "connection",
          "label": "Connection"
        },
        {
          "id": "clientResponse",
          "label": "Client Response"
        },
        {
          "id": "options",
          "label": "Options",
          "openByDefault": false
        },
        {
          "id": "polling",
          "label": "Polling",
          "openByDefault": false
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMTguNSIgdmlld0JveD0iMyA5IDMwIDE4LjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTguNyAxNC43MjVDOC41MTY2NyAxNC45MDgzIDguMjgzMzMgMTUgOCAxNUM3LjcxNjY3IDE1IDcuNDc1IDE0LjkwODMgNy4yNzUgMTQuNzI1QzcuMDkxNjcgMTQuNTI1IDcgMTQuMjgzMyA3IDE0QzcgMTMuNzE2NyA3LjA5MTY3IDEzLjQ4MzMgNy4yNzUgMTMuM0M3LjQ3NSAxMy4xIDcuNzE2NjcgMTMgOCAxM0M4LjI4MzMzIDEzIDguNTE2NjcgMTMuMSA4LjcgMTMuM0M4LjkgMTMuNDgzMyA5IDEzLjcxNjcgOSAxNEM5IDE0LjI4MzMgOC45IDE0LjUyNSA4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMTQuNyAxNC43MjVDMTQuNTE2NyAxNC45MDgzIDE0LjI4MzMgMTUgMTQgMTVDMTMuNzE2NyAxNSAxMy40NzUgMTQuOTA4MyAxMy4yNzUgMTQuNzI1QzEzLjA5MTcgMTQuNTI1IDEzIDE0LjI4MzMgMTMgMTRDMTMgMTMuNzE2NyAxMy4wOTE3IDEzLjQ4MzMgMTMuMjc1IDEzLjNDMTMuNDc1IDEzLjEgMTMuNzE2NyAxMyAxNCAxM0MxNC4yODMzIDEzIDE0LjUxNjcgMTMuMSAxNC43IDEzLjNDMTQuOSAxMy40ODMzIDE1IDEzLjcxNjcgMTUgMTRDMTUgMTQuMjgzMyAxNC45IDE0LjUyNSAxNC43IDE0LjcyNVoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTIyLjcgMTQuNzI1QzIyLjUxNjcgMTQuOTA4MyAyMi4yODMzIDE1IDIyIDE1QzIxLjcxNjcgMTUgMjEuNDc1IDE0LjkwODMgMjEuMjc1IDE0LjcyNUMyMS4wOTE3IDE0LjUyNSAyMSAxNC4yODMzIDIxIDE0QzIxIDEzLjcxNjcgMjEuMDkxNyAxMy40ODMzIDIxLjI3NSAxMy4zQzIxLjQ3NSAxMy4xIDIxLjcxNjcgMTMgMjIgMTNDMjIuMjgzMyAxMyAyMi41MTY3IDEzLjEgMjIuNyAxMy4zQzIyLjkgMTMuNDgzMyAyMyAxMy43MTY3IDIzIDE0QzIzIDE0LjI4MzMgMjIuOSAxNC41MjUgMjIuNyAxNC43MjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0yOC43IDE0LjcyNUMyOC41MTY3IDE0LjkwODMgMjguMjgzMyAxNSAyOCAxNUMyNy43MTY3IDE1IDI3LjQ3NSAxNC45MDgzIDI3LjI3NSAxNC43MjVDMjcuMDkxNyAxNC41MjUgMjcgMTQuMjgzMyAyNyAxNEMyNyAxMy43MTY3IDI3LjA5MTcgMTMuNDgzMyAyNy4yNzUgMTMuM0MyNy40NzUgMTMuMSAyNy43MTY3IDEzIDI4IDEzQzI4LjI4MzMgMTMgMjguNTE2NyAxMy4xIDI4LjcgMTMuM0MyOC45IDEzLjQ4MzMgMjkgMTMuNzE2NyAyOSAxNEMyOSAxNC4yODMzIDI4LjkgMTQuNTI1IDI4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTUgMTRDNSAxMi4zNDMxIDYuMzQzMTUgMTEgOCAxMUgxNEMxNC43NzYgMTEgMTUuMjg0IDExLjE1MzcgMTUuNjQgMTEuMzgxOEMxNS44NTg5IDEwLjc5NCAxNi4xNTE3IDEwLjE3MDkgMTYuNTU1IDkuNTk3OTVDMTUuODc5NyA5LjIxMTUzIDE1LjAzODYgOSAxNCA5SDhDNS4yMzg1OCA5IDMgMTEuMjM4NiAzIDE0QzMgMTYuNzYxMiA1LjIzNzU5IDE5IDcuOTk5MjYgMTlIMTRDMTUuNzYzNCAxOSAxNi45NTczIDE4LjM5MDIgMTcuNzM3NSAxNy4zNUMxOC40MjI4IDE2LjQzNjMgMTguNzE0OCAxNS4yNjYgMTguOTQ4MyAxNC4zMjk5TDE4Ljk3MDEgMTQuMjQyNUMxOS4yMzI3IDEzLjE5MjQgMTkuNDQ0MiAxMi40MDc3IDE5Ljg2MjUgMTEuODVDMjAuMjA3MyAxMS4zOTAyIDIwLjc2MzQgMTEgMjIgMTFIMjguMDAwNUMyOS42NTcyIDExIDMxIDEyLjM0MyAzMSAxNEMzMSAxNS42NTY5IDI5LjY1NjkgMTcgMjggMTdIMjJDMjEuMjI0IDE3IDIwLjcxNiAxNi44NDYzIDIwLjM2IDE2LjYxODJDMjAuMTQxMSAxNy4yMDYgMTkuODQ4MyAxNy44MjkxIDE5LjQ0NSAxOC40MDJDMjAuMTIwMyAxOC43ODg1IDIwLjk2MTQgMTkgMjIgMTlIMjhDMzAuNzYxNCAxOSAzMyAxNi43NjE0IDMzIDE0QzMzIDExLjIzODggMzAuNzYyMSA5IDI4LjAwMDUgOUgyMkMyMC4yMzY2IDkgMTkuMDQyNyA5LjYwOTc5IDE4LjI2MjUgMTAuNjVDMTcuNTc3MiAxMS41NjM3IDE3LjI4NTIgMTIuNzM0IDE3LjA1MTcgMTMuNjcwMUwxNy4wMjk5IDEzLjc1NzVDMTYuNzY3MyAxNC44MDc2IDE2LjU1NTggMTUuNTkyMyAxNi4xMzc1IDE2LjE1QzE1Ljc5MjcgMTYuNjA5OCAxNS4yMzY2IDE3IDE0IDE3SDcuOTk5MjZDNi4zNDI2NSAxNyA1IDE1LjY1NzEgNSAxNFoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTcgMjMuNUM2LjcxNjY3IDIzLjUgNi40NzUgMjMuNDA4MyA2LjI3NSAyMy4yMjVDNi4wOTE2NyAyMy4wMjUgNiAyMi43ODMzIDYgMjIuNUM2IDIyLjIxNjcgNi4wOTE2NyAyMS45ODMzIDYuMjc1IDIxLjhDNi40NzUgMjEuNiA2LjcxNjY3IDIxLjUgNyAyMS41SDEyQzEyLjI4MzMgMjEuNSAxMi41MTY3IDIxLjYgMTIuNyAyMS44QzEyLjkgMjEuOTgzMyAxMyAyMi4yMTY3IDEzIDIyLjVDMTMgMjIuNzgzMyAxMi45IDIzLjAyNSAxMi43IDIzLjIyNUMxMi41MTY3IDIzLjQwODMgMTIuMjgzMyAyMy41IDEyIDIzLjVIN1pNNSAyNy41QzQuNzE2NjcgMjcuNSA0LjQ3NSAyNy40MDgzIDQuMjc1IDI3LjIyNUM0LjA5MTY3IDI3LjAyNSA0IDI2Ljc4MzMgNCAyNi41QzQgMjYuMjE2NyA0LjA5MTY3IDI1Ljk4MzMgNC4yNzUgMjUuOEM0LjQ3NSAyNS42IDQuNzE2NjcgMjUuNSA1IDI1LjVIOEM4LjI4MzMzIDI1LjUgOC41MTY2NyAyNS42IDguNyAyNS44QzguOSAyNS45ODMzIDkgMjYuMjE2NyA5IDI2LjVDOSAyNi43ODMzIDguOSAyNy4wMjUgOC43IDI3LjIyNUM4LjUxNjY3IDI3LjQwODMgOC4yODMzMyAyNy41IDggMjcuNUg1Wk0xMiAyNy41QzExLjcxNjcgMjcuNSAxMS40NzUgMjcuNDA4MyAxMS4yNzUgMjcuMjI1QzExLjA5MTcgMjcuMDI1IDExIDI2Ljc4MzMgMTEgMjYuNUMxMSAyNi4yMTY3IDExLjA5MTcgMjUuOTgzMyAxMS4yNzUgMjUuOEMxMS40NzUgMjUuNiAxMS43MTY3IDI1LjUgMTIgMjUuNUgyMEMyMC4yODMzIDI1LjUgMjAuNTE2NyAyNS42IDIwLjcgMjUuOEMyMC45IDI1Ljk4MzMgMjEgMjYuMjE2NyAyMSAyNi41QzIxIDI2Ljc4MzMgMjAuOSAyNy4wMjUgMjAuNyAyNy4yMjVDMjAuNTE2NyAyNy40MDgzIDIwLjI4MzMgMjcuNSAyMCAyNy41SDEyWk0yOCAyNy41QzI3LjcxNjcgMjcuNSAyNy40NzUgMjcuNDA4MyAyNy4yNzUgMjcuMjI1QzI3LjA5MTcgMjcuMDI1IDI3IDI2Ljc4MzMgMjcgMjYuNUMyNyAyNi4yMTY3IDI3LjA5MTcgMjUuOTgzMyAyNy4yNzUgMjUuOEMyNy40NzUgMjUuNiAyNy43MTY3IDI1LjUgMjggMjUuNUgzMkMzMi4yODMzIDI1LjUgMzIuNTE2NyAyNS42IDMyLjcgMjUuOEMzMi45IDI1Ljk4MzMgMzMgMjYuMjE2NyAzMyAyNi41QzMzIDI2Ljc4MzMzMi45IDI3LjAyNSAzMi43IDI3LjIyNUMzMi41MTY3IDI3LjQwODMgMzIuMjgzMyAyNy41IDMyIDI3LjVIMjhaTTE2IDIzLjVDMTUuNzE2NyAyMy41IDE1LjQ3NSAyMy40MDgzIDE1LjI3NSAyMy4yMjVDMTUuMDkxNyAyMy4wMjUgMTUgMjIuNzgzMyAxNSAyMi41QzE1IDIyLjIxNjcgMTUuMDkxNyAyMS45ODMzIDE1LjI3NSAyMS44QzE1LjQ3NSAyMS42IDE1LjcxNjcgMjEuNSAxNiAyMS41QzE2LjI4MzMgMjEuNSAxNi41MTY3IDIxLjYgMTYuNyAyMS44QzE2LjkgMjEuOTgzMyAxNyAyMi4yMTY3IDE3IDIyLjVDMTcgMjIuNzgzMyAxNi45IDIzLjAyNSAxNi43IDIzLjIyNUMxNi41MTY3IDIzLjQwODMgMTYuMjgzMyAyMy41IDE2IDIzLjVaTTI0IDI3LjVDMjMuNzE2NyAyNy41IDIzLjQ3NSAyNy40MDgzIDIzLjI3NSAyNy4yMjVDMjMuMDkxNyAyNy4wMjUgMjMgMjYuNzgzMyAyMyAyNi41QzIzIDI2LjIxNjcgMjMuMDkxNyAyNS45ODMzIDIzLjI3NSAyNS44QzIzLjQ3NSAyNS42IDIzLjcxNjcgMjUuNSAyNCAyNS41QzI0LjI4MzMgMjUuNSAyNC41MTY3IDI1LjYgMjQuNyAyNS44QzI0LjkgMjUuOTgzMyAyNSAyNi4yMTY3IDI1IDI2LjVDMjUgMjYuNzgzMyAyNC45IDI3LjAyNSAyNC43IDI3LjIyNUMyNC41MTY3IDI3LjQwODMgMjQuMjgzMyAyNy41IDI0IDI3LjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0xOS4yNzUgMjMuMjI1QzE5LjQ3NSAyMy40MDgzIDE5LjcxNjcgMjMuNSAyMCAyMy41SDIzQzIzLjI4MzMgMjMuNSAyMy41MTY3IDIzLjQwODMgMjMuNyAyMy4yMjVDMjMuOSAyMy4wMjUgMjQgMjIuNzgzMyAyNCAyMi41QzI0IDIyLjIxNjcgMjMuOSAyMS45ODMzIDIzLjcgMjEuOEMyMy41MTY3IDIxLjYgMjMuMjgzMyAyMS41IDIzIDIxLjVIMjBDMTkuNzE2NyAyMS41IDE5LjQ3NSAyMS42IDE5LjI3NSAyMS44QzE5LjA5MTcgMjEuOTgzMyAxOSAyMi4yMTY3IDE5IDIyLjVDMTkgMjIuNzgzMyAxOS4wOTE3IDIzLjAyNSAxOS4yNzUgMjMuMjI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMjYuMjc1IDIzLjIyNUMyNi40NzUgMjMuNDA4MyAyNi43MTY3IDIzLjUgMjcgMjMuNUgzMEMzMC4yODMzIDIzLjUgMzAuNTE2NyAyMy40MDgzIDMwLjcgMjMuMjI1QzMwLjkgMjMuMDI1IDMxIDIyLjc4MzMgMzEgMjIuNUMzMSAyMi4yMTY3IDMwLjkgMjEuOTgzMyAzMC43IDIxLjhDMzAuNTE2NyAyMS42IDMwLjI4MzMgMjEuNSAzMCAyMS41SDI3QzI2LjcxNjcgMjEuNSAyNi40NzUgMjEuNiAyNi4yNzUgMjEuOEMyNi4wOTE3IDIxLjk4MzMgMjYgMjIuMjE2NyAyNiAyMi41QzI2IDIyLjc4MzMgMjYuMDkxNyAyMy4wMjUgMjYuMjc1IDIzLjIyNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "clientResponse"
      },
      {},
      {
        "group": "options"
      },
      {
        "group": "polling"
      },
      {
        "group": "polling"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.KAFKA.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "kafka",
          "label": "Kafka"
        },
        {
          "id": "message",
          "label": "Message"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='18' height='18' viewBox='0 0 256 416' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M201.816 230.216c-16.186 0-30.697 7.171-40.634 18.461l-25.463-18.026c2.703-7.442 4.255-15.433 4.255-23.797 0-8.219-1.498-16.076-4.112-23.408l25.406-17.835c9.936 11.233 24.409 18.365 40.548 18.365 29.875 0 54.184-24.305 54.184-54.184 0-29.879-24.309-54.184-54.184-54.184-29.875 0-54.184 24.305-54.184 54.184 0 5.348.808 10.505 2.258 15.389l-25.423 17.844c-10.62-13.175-25.911-22.374-43.333-25.182v-30.64c24.544-5.155 43.037-26.962 43.037-53.019C124.171 24.305 99.862 0 69.987 0 40.112 0 15.803 24.305 15.803 54.184c0 25.708 18.014 47.246 42.067 52.769v31.038C25.044 143.753 0 172.401 0 206.854c0 34.621 25.292 63.374 58.355 68.94v32.774c-24.299 5.341-42.552 27.011-42.552 52.894 0 29.879 24.309 54.184 54.184 54.184 29.875 0 54.184-24.305 54.184-54.184 0-25.883-18.253-47.553-42.552-52.894v-32.775a69.965 69.965 0 0 0 42.6-24.776l25.633 18.143c-1.423 4.84-2.22 9.946-2.22 15.24 0 29.879 24.309 54.184 54.184 54.184 29.875 0 54.184-24.305 54.184-54.184 0-29.879-24.309-54.184-54.184-54.184zm0-126.695c14.487 0 26.27 11.788 26.27 26.271s-11.783 26.27-26.27 26.27-26.27-11.787-26.27-26.27c0-14.483 11.783-26.271 26.27-26.271zm-158.1-49.337c0-14.483 11.784-26.27 26.271-26.27s26.27 11.787 26.27 26.27c0 14.483-11.783 26.27-26.27 26.27s-26.271-11.787-26.271-26.27zm52.541 307.278c0 14.483-11.783 26.27-26.27 26.27s-26.271-11.787-26.271-26.27c0-14.483 11.784-26.27 26.271-26.27s26.27 11.787 26.27 26.27zm-26.272-117.97c-20.205 0-36.642-16.434-36.642-36.638 0-20.205 16.437-36.642 36.642-36.642 20.204 0 36.641 16.437 36.641 36.642 0 20.204-16.437 36.638-36.641 36.638zm131.831 67.179c-14.487 0-26.27-11.788-26.27-26.271s11.783-26.27 26.27-26.27 26.27 11.787 26.27 26.27c0 14.483-11.783 26.271-26.27 26.271z' style='fill:%23231f20'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "message"
      },
      {
        "group": "message"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.Twilio.Webhook.Boundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook Configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable Mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' preserveAspectRatio='xMidYMid' viewBox='0 0 256 256' id='twilio'%3E%3Cg fill='%23CF272D'%3E%3Cpath d='M127.86 222.304c-52.005 0-94.164-42.159-94.164-94.163 0-52.005 42.159-94.163 94.164-94.163 52.004 0 94.162 42.158 94.162 94.163 0 52.004-42.158 94.163-94.162 94.163zm0-222.023C57.245.281 0 57.527 0 128.141 0 198.756 57.245 256 127.86 256c70.614 0 127.859-57.244 127.859-127.859 0-70.614-57.245-127.86-127.86-127.86z'%3E%3C/path%3E%3Cpath d='M133.116 96.297c0-14.682 11.903-26.585 26.586-26.585 14.683 0 26.585 11.903 26.585 26.585 0 14.684-11.902 26.586-26.585 26.586-14.683 0-26.586-11.902-26.586-26.586M133.116 159.983c0-14.682 11.903-26.586 26.586-26.586 14.683 0 26.585 11.904 26.585 26.586 0 14.683-11.902 26.586-26.585 26.586-14.683 0-26.586-11.903-26.586-26.586M69.431 159.983c0-14.682 11.904-26.586 26.586-26.586 14.683 0 26.586 11.904 26.586 26.586 0 14.683-11.903 26.586-26.586 26.586-14.682 0-26.586-11.903-26.586-26.586M69.431 96.298c0-14.683 11.904-26.585 26.586-26.585 14.683 0 26.586 11.902 26.586 26.585 0 14.684-11.903 26.586-26.586 26.586-14.682 0-26.586-11.902-26.586-26.586'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.AWSDynamoDB.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='18' height='18' viewBox='0 0 256 289' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M165.258 288.501h3.508l57.261-28.634.953-1.347V29.964l-.953-1.354L168.766 0h-3.551l.043 288.501' fill='%235294CF'/%3E%3Cpath d='M90.741 288.501h-3.557l-57.212-28.634-1.161-1.997-.589-226.742 1.75-2.518L87.184 0h3.601l-.044 288.501' fill='%231F5B98'/%3E%3Cpath d='M87.285 0h81.426v288.501H87.285V0z' fill='%232D72B8'/%3E%3Cpath d='M256 137.769l-1.935-.429-27.628-2.576-.41.204-57.312-2.292h-81.43l-57.313 2.292V91.264l-.06.032.06-.128 57.313-13.28h81.43l57.312 13.28 21.069 11.199v-7.2l8.904-.974-.922-1.798-28.192-20.159-.859.279-57.312-17.759h-81.43L29.972 72.515V28.61L0 63.723v30.666l.232-.168 8.672.946v7.348L0 107.28v30.513l.232-.024 8.672.128v12.807l-7.482.112L0 150.68v30.525l8.904 4.788v7.433l-8.531.942-.373-.28v30.661l29.972 35.118v-43.901l57.313 17.759h81.43l57.481-17.811.764.335 27.821-19.862 1.219-1.979-8.904-.982v-7.284l-1.167-.466-19.043 10.265-.69 1.44-57.481 13.203v.016h-81.43v-.016l-57.313-13.259v-43.864l57.313 2.284v.056h81.43l57.312-2.34 1.305.6 26.779-2.306 1.889-.923-8.904-.128v-12.807l8.904-.128' fill='%231A476F'/%3E%3Cpath d='M226.027 215.966v43.901L256 224.749v-30.461l-29.8 21.626-.173.052M226.027 197.421l.173-.04 29.8-16.028v-30.649l-29.973 2.757v43.96M226.2 91.208l-.173-.04v43.8L256 137.769v-30.634l-29.8-15.927M226.2 72.687L256 94.193V63.731L226.027 28.61v43.905l.173.06v.112' fill='%232D72B8'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.HttpJson.v2": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20viewBox%3D%220%200%2018%2018%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M17.0335%208.99997C17.0335%2013.4475%2013.4281%2017.0529%208.98065%2017.0529C4.53316%2017.0529%200.927765%2013.4475%200.927765%208.99997C0.927765%204.55248%204.53316%200.947083%208.98065%200.947083C13.4281%200.947083%2017.0335%204.55248%2017.0335%208.99997Z%22%20fill%3D%22%23505562%22%2F%3E%0A%3Cpath%20d%3D%22M4.93126%2014.1571L6.78106%203.71471H10.1375C11.1917%203.71471%2011.9824%203.98323%2012.5095%204.52027C13.0465%205.04736%2013.315%205.73358%2013.315%206.57892C13.315%207.44414%2013.0714%208.15522%2012.5841%208.71215C12.1067%209.25913%2011.4553%209.63705%2010.6298%209.8459L12.0619%2014.1571H10.3315L9.03364%2010.0249H7.24351L6.51254%2014.1571H4.93126ZM7.49711%208.59281H9.24248C9.99832%208.59281%2010.5901%208.42374%2011.0177%208.08561C11.4553%207.73753%2011.6741%207.26513%2011.6741%206.66842C11.6741%206.19106%2011.5249%205.81811%2011.2265%205.54959C10.9282%205.27113%2010.4558%205.1319%209.80936%205.1319H8.10874L7.49711%208.59281Z%22%20fill%3D%22white%22%2F%3E%0A%3C%2Fsvg%3E%0A"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "HTTP endpoint"
        },
        {
          "id": "input",
          "label": "Payload"
        },
        {
          "id": "timeout",
          "label": "Connect timeout"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "timeout"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.AWSEventBridge.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "eventDetails",
          "label": "Event Details"
        },
        {
          "id": "eventPayload",
          "label": "Event Payload"
        },
        {
          "id": "output",
          "label": "Output Mapping"
        },
        {
          "id": "errors",
          "label": "Error Handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 256 256'%3E%3Cdefs%3E%3ClinearGradient id='logosAwsEventbridge0' x1='0%25' x2='100%25' y1='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23B0084D'/%3E%3Cstop offset='100%25' stop-color='%23FF4F8B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23logosAwsEventbridge0)' d='M0 0h256v256H0z'/%3E%3Cpath fill='%23FFF' d='M171.702 211.2c-6.858 0-12.44-5.61-12.44-12.509s5.582-12.509 12.44-12.509c6.857 0 12.438 5.61 12.438 12.51c0 6.898-5.581 12.508-12.438 12.508Zm-27.278-54.4h-33.071L94.815 128l16.538-28.8h33.071L160.96 128l-16.535 28.8ZM88.387 69.818c-6.857 0-12.438-5.61-12.438-12.51c0-6.898 5.581-12.508 12.438-12.508c6.861 0 12.443 5.61 12.443 12.509s-5.582 12.509-12.443 12.509Zm83.315 109.964c-2.362 0-4.614.458-6.699 1.261l-13.514-22.931l-.713.426L167.39 129.6a3.226 3.226 0 0 0 0-3.2l-18.374-32a3.177 3.177 0 0 0-2.755-1.6h-33.435l.13-.077l-12.39-21.03c4.047-3.469 6.628-8.627 6.628-14.384c0-10.426-8.436-18.909-18.807-18.909c-10.367 0-18.803 8.483-18.803 18.909c0 10.425 8.436 18.909 18.803 18.909c2.365 0 4.618-.458 6.702-1.261l11.567 19.625L88.384 126.4a3.226 3.226 0 0 0 0 3.2l18.377 32c.57.992 1.62 1.6 2.756 1.6h36.744c.264 0 .521-.042.77-.102l12.496 21.21c-4.051 3.468-6.629 8.626-6.629 14.383c0 10.426 8.433 18.909 18.804 18.909c10.37 0 18.803-8.483 18.803-18.909c0-10.425-8.433-18.909-18.803-18.909Zm18.968-77.05c-6.857 0-12.436-5.609-12.436-12.508c0-6.9 5.579-12.509 12.436-12.509c6.858 0 12.44 5.61 12.44 12.509c0 6.9-5.582 12.509-12.44 12.509Zm23.303 23.668l-12.08-21.04c4.592-3.453 7.58-8.944 7.58-15.136c0-10.426-8.432-18.909-18.803-18.909c-2.638 0-5.152.554-7.433 1.549l-9.849-17.155a3.18 3.18 0 0 0-2.756-1.6h-39.448v6.4h37.612l9.11 15.872c-3.703 3.456-6.036 8.374-6.036 13.843c0 10.426 8.433 18.909 18.8 18.909c1.932 0 3.8-.298 5.556-.845L207.545 128l-15.892 27.674l5.512 3.2l16.808-29.274a3.21 3.21 0 0 0 0-3.2Zm-146.04 50.39c-6.86 0-12.442-5.612-12.442-12.508c0-6.9 5.581-12.51 12.442-12.51c6.857 0 12.439 5.61 12.439 12.51c0 6.896-5.582 12.508-12.44 12.508Zm10.393 3.236c5.062-3.392 8.41-9.181 8.41-15.744c0-10.426-8.436-18.91-18.803-18.91c-3.004 0-5.833.73-8.353 1.994L48.458 128l18.428-32.093l-5.515-3.2L42.027 126.4a3.21 3.21 0 0 0 0 3.2l12.388 21.568c-3.268 3.405-5.289 8.022-5.289 13.114c0 10.425 8.436 18.908 18.807 18.908c1.562 0 3.074-.214 4.528-.579l10.15 17.68c.57.989 1.62 1.6 2.757 1.6h39.451v-6.4H87.204l-8.878-15.465Z'/%3E%3C/svg%3E%0A"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "eventDetails"
      },
      {
        "group": "eventDetails"
      },
      {
        "group": "eventDetails"
      },
      {
        "group": "eventPayload"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.Asana.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='781.361 0 944.893 873.377'%3E%3CradialGradient id='a' cx='943.992' cy='1221.416' r='.663' gradientTransform='matrix(944.8934 0 0 -873.3772 -890717.875 1067234.75)' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%23ffb900'/%3E%3Cstop offset='.6' stop-color='%23f95d8f'/%3E%3Cstop offset='.999' stop-color='%23f95353'/%3E%3C/radialGradient%3E%3Cpath fill='url(%23a)' d='M1520.766 462.371c-113.508 0-205.508 92-205.508 205.488 0 113.499 92 205.518 205.508 205.518 113.489 0 205.488-92.019 205.488-205.518 0-113.488-91.999-205.488-205.488-205.488zm-533.907.01c-113.489.01-205.498 91.99-205.498 205.488 0 113.489 92.009 205.498 205.498 205.498 113.498 0 205.508-92.009 205.508-205.498 0-113.499-92.01-205.488-205.518-205.488h.01zm472.447-256.883c0 113.489-91.999 205.518-205.488 205.518-113.508 0-205.508-92.029-205.508-205.518S1140.31 0 1253.817 0c113.489 0 205.479 92.009 205.479 205.498h.01z'/%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "operation"
      },
      {},
      {
        "group": "operation"
      },
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "operation"
      },
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.agenticai.aiagent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "provider",
          "label": "Model provider",
          "openByDefault": false
        },
        {
          "id": "model",
          "label": "Model",
          "openByDefault": false
        },
        {
          "id": "systemPrompt",
          "label": "System prompt",
          "tooltip": "A system prompt is a set of foundational instructions given to a model before any user interaction begins. It defines the AI agent’s role, behavior, tone, and communication style, ensuring that responses remain consistent and aligned with the AI agent’s intended purpose. These instructions help shape how the model interprets and responds to user input throughout the conversation.",
          "openByDefault": false
        },
        {
          "id": "userPrompt",
          "label": "User prompt",
          "tooltip": "A user prompt is the message or question you give to the AI to start or continue a conversation. It tells the AI what you need, whether it's information, help with a task, or just a chat. The AI uses your prompt to understand how to respond.",
          "openByDefault": false
        },
        {
          "id": "tools",
          "label": "Tools",
          "tooltip": "Tools are optional features the AI Agent can use to perform specific tasks. Configure this if the agent should participate in a tools feedback loop.",
          "openByDefault": false
        },
        {
          "id": "memory",
          "label": "Memory",
          "tooltip": "Configuration of the Agent's short-term/conversational memory.",
          "openByDefault": false
        },
        {
          "id": "limits",
          "label": "Limits",
          "openByDefault": false
        },
        {
          "id": "response",
          "label": "Response",
          "tooltip": "Configuration of the model response format and how to map the model response to the connector result.<br><br>Depending on the selection, the model response will be available as <code>response.responseText</code> or <code>response.responseJson</code>.<br><br>See <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent/\">documentation</a> for details.",
          "openByDefault": false
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNBNTZFRkYiLz4KPG1hc2sgaWQ9InBhdGgtMi1vdXRzaWRlLTFfMTg1XzYiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjQiIHk9IjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iYmxhY2siPgo8cmVjdCBmaWxsPSJ3aGl0ZSIgeD0iNCIgeT0iNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuMDEwNSAxMi4wOTg3QzE4LjQ5IDEwLjU4OTQgMTcuMTU5NCA4LjEwODE0IDE2LjE3OTkgNi4wMTEwM0MxNi4xNTIgNi4wMDQ1MSAxNi4xMTc2IDYgMTYuMDc5NCA2QzE2LjA0MTEgNiAxNi4wMDY2IDYuMDA0NTEgMTUuOTc4OCA2LjAxMTA0QzE0Ljk5OTQgOC4xMDgxNCAxMy42Njk3IDEwLjU4ODkgMTIuMTQ4MSAxMi4wOTgxQzEwLjYyNjkgMTMuNjA3MSA4LjEyNTY4IDE0LjkyNjQgNi4wMTE1NyAxNS44OTgxQzYuMDA0NzQgMTUuOTI2MSA2IDE1Ljk2MTEgNiAxNkM2IDE2LjAzODcgNi4wMDQ2OCAxNi4wNzM2IDYuMDExNDQgMTYuMTAxNEM4LjEyNTE5IDE3LjA3MjkgMTAuNjI2MiAxOC4zOTE5IDEyLjE0NzcgMTkuOTAxNkMxMy42Njk3IDIxLjQxMDcgMTQuOTk5NiAyMy44OTIgMTUuOTc5MSAyNS45ODlDMTYuMDA2OCAyNS45OTU2IDE2LjA0MTEgMjYgMTYuMDc5MyAyNkMxNi4xMTc1IDI2IDE2LjE1MTkgMjUuOTk1NCAxNi4xNzk2IDI1Ljk4OUMxNy4xNTkxIDIzLjg5MiAxOC40ODg4IDIxLjQxMSAyMC4wMDk5IDE5LjkwMjFNMjAuMDA5OSAxOS45MDIxQzIxLjUyNTMgMTguMzk4NyAyMy45NDY1IDE3LjA2NjkgMjUuOTkxNSAxNi4wODI0QzI1Ljk5NjUgMTYuMDU5MyAyNiAxNi4wMzEgMjYgMTUuOTk5N0MyNiAxNS45Njg0IDI1Ljk5NjUgMTUuOTQwMyAyNS45OTE1IDE1LjkxNzFDMjMuOTQ3NCAxNC45MzI3IDIxLjUyNTkgMTMuNjAxIDIwLjAxMDUgMTIuMDk4NyIvPgo8L21hc2s+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuMDEwNSAxMi4wOTg3QzE4LjQ5IDEwLjU4OTQgMTcuMTU5NCA4LjEwODE0IDE2LjE3OTkgNi4wMTEwM0MxNi4xNTIgNi4wMDQ1MSAxNi4xMTc2IDYgMTYuMDc5NCA2QzE2LjA0MTEgNiAxNi4wMDY2IDYuMDA0NTEgMTUuOTc4OCA2LjAxMTA0QzE0Ljk5OTQgOC4xMDgxNCAxMy42Njk3IDEwLjU4ODkgMTIuMTQ4MSAxMi4wOTgxQzEwLjYyNjkgMTMuNjA3MSA4LjEyNTY4IDE0LjkyNjQgNi4wMTE1NyAxNS44OTgxQzYuMDA0NzQgMTUuOTI2MSA2IDE1Ljk2MTEgNiAxNkM2IDE2LjAzODcgNi4wMDQ2OCAxNi4wNzM2IDYuMDExNDQgMTYuMTAxNEM4LjEyNTE5IDE3LjA3MjkgMTAuNjI2MiAxOC4zOTE5IDEyLjE0NzcgMTkuOTAxNkMxMy42Njk3IDIxLjQxMDcgMTQuOTk5NiAyMy44OTIgMTUuOTc5MSAyNS45ODlDMTYuMDA2OCAyNS45OTU2IDE2LjA0MTEgMjYgMTYuMDc5MyAyNkMxNi4xMTc1IDI2IDE2LjE1MTkgMjUuOTk1NCAxNi4xNzk2IDI1Ljk4OUMxNy4xNTkxIDIzLjg5MiAxOC40ODg4IDIxLjQxMSAyMC4wMDk5IDE5LjkwMjFNMjAuMDA5OSAxOS45MDIxQzIxLjUyNTMgMTguMzk4NyAyMy45NDY1IDE3LjA2NjkgMjUuOTkxNSAxNi4wODI0QzI1Ljk5NjUgMTYuMDU5MyAyNiAxNi4wMzEgMjYgMTUuOTk5N0MyNiAxNS45Njg0IDI1Ljk5NjUgMTUuOTQwMyAyNS45OTE1IDE1LjkxNzFDMjMuOTQ3NCAxNC45MzI3IDIxLjUyNTkgMTMuNjAxIDIwLjAxMDUgMTIuMDk4NyIgZmlsbD0id2hpdGUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMC4wMTA1IDEyLjA5ODdDMTguNDkgMTAuNTg5NCAxNy4xNTk0IDguMTA4MTQgMTYuMTc5OSA2LjAxMTAzQzE2LjE1MiA2LjAwNDUxIDE2LjExNzYgNiAxNi4wNzk0IDZDMTYuMDQxMSA2IDE2LjAwNjYgNi4wMDQ1MSAxNS45Nzg4IDYuMDExMDRDMTQuOTk5NCA4LjEwODE0IDEzLjY2OTcgMTAuNTg4OSAxMi4xNDgxIDEyLjA5ODFDMTAuNjI2OSAxMy42MDcxIDguMTI1NjggMTQuOTI2NCA2LjAxMTU3IDE1Ljg5ODFDNi4wMDQ3NCAxNS45MjYxIDYgMTUuOTYxMSA2IDE2QzYgMTYuMDM4NyA2LjAwNDY4IDE2LjA3MzYgNi4wMTE0NCAxNi4xMDE0QzguMTI1MTkgMTcuMDcyOSAxMC42MjYyIDE4LjM5MTkgMTIuMTQ3NyAxOS45MDE2QzEzLjY2OTcgMjEuNDEwNyAxNC45OTk2IDIzLjg5MiAxNS45NzkxIDI1Ljk4OUMxNi4wMDY4IDI1Ljk5NTYgMTYuMDQxMSAyNiAxNi4wNzkzIDI2QzE2LjExNzUgMjYgMTYuMTUxOSAyNS45OTU0IDE2LjE3OTYgMjUuOTg5QzE3LjE1OTEgMjMuODkyIDE4LjQ4ODggMjEuNDExIDIwLjAwOTkgMTkuOTAyMU0yMC4wMDk5IDE5LjkwMjFDMjEuNTI1MyAxOC4zOTg3IDIzLjk0NjUgMTcuMDY2OSAyNS45OTE1IDE2LjA4MjRDMjUuOTk2NSAxNi4wNTkzIDI2IDE2LjAzMSAyNiAxNS45OTk3QzI2IDE1Ljk2ODQgMjUuOTk2NSAxNS45NDAzIDI1Ljk5MTUgMTUuOTE3MUMyMy45NDc0IDE0LjkzMjcgMjEuNTI1OSAxMy42MDEgMjAuMDEwNSAxMi4wOTg3IiBzdHJva2U9IiM0OTFEOEIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgbWFzaz0idXJsKCNwYXRoLTItb3V0c2lkZS0xXzE4NV82KSIvPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider",
        "tooltip": "Configure a custom OpenAI compatible API endpoint to use the connector with an OpenAI compatible API. Typically ends in <code>/v1</code>."
      },
      {
        "group": "provider"
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "The maximum number of tokens per request to generate before stopping. <br><br>Details in the <a href=\"https://docs.anthropic.com/en/api/messages#body-max-tokens\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. The higher the number, the more randomness will be injected into the response. <br><br>Details in the <a href=\"https://docs.anthropic.com/en/api/messages#body-temperature\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://docs.anthropic.com/en/api/messages#body-top-p\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Integer greater than 0. Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://docs.anthropic.com/en/api/messages#body-top-k\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "The maximum number of tokens per request to allow in the generated response. <br><br>Details in the <a href=\"https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InferenceConfiguration.html\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. The higher the number, the more randomness will be injected into the response. <br><br>Details in the <a href=\"https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InferenceConfiguration.html\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InferenceConfiguration.html\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "The maximum number of tokens per request to generate before stopping. <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_completion_tokens\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 2. The higher the number, the more randomness will be injected into the response. <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_p\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "systemPrompt"
      },
      {
        "group": "systemPrompt",
        "tooltip": "Map parameters in the prompt using the <code>{{parameter}}</code> format. Default parameters: <code>current_date</code>, <code>current_time</code>, <code>current_date_time</code>"
      },
      {
        "group": "userPrompt"
      },
      {
        "group": "userPrompt",
        "tooltip": "Map parameters in the prompt using the <code>{{parameter}}</code> format. Default parameters: <code>current_date</code>, <code>current_time</code>, <code>current_date_time</code>"
      },
      {
        "group": "userPrompt",
        "tooltip": "Referenced documents will be automatically added to the user prompt. <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent/\" target=\"_blank\">See documentation</a> for details and supported file types."
      },
      {
        "group": "tools",
        "tooltip": "Add an ad-hoc sub-process ID to attach the AI agent to the tools. Ensure your process includes a tools feedback loop routing into the ad-hoc sub-process and back to the AI agent connector. <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent/\" target=\"_blank\">See documentation</a> for details."
      },
      {
        "group": "tools",
        "tooltip": "This defines where to handle tool call results returned by the ad-hoc sub-process. Model this as part of your process and route it into the tools feedback loop. <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent/\" target=\"_blank\">See documentation</a> for details."
      },
      {
        "group": "memory",
        "tooltip": "The agent context variable containing all relevant data for the agent to support the feedback loop between user requests, tool calls and LLM responses. Make sure this variable points to the <code>context</code> variable which is returned from the agent response. <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent/\" target=\"_blank\">See documentation</a> for details."
      },
      {
        "group": "memory"
      },
      {
        "group": "memory",
        "tooltip": "Will use the cluster default TTL (time-to-live) if not specified. Make sure to set this value to a reasonable duration matching your process lifecycle."
      },
      {
        "group": "memory"
      },
      {
        "group": "memory",
        "tooltip": "Use this to limit the number of messages which are sent to the model. The agent will only send the most recent messages up to the configured limit to the LLM. Older messages will be kept in the conversation store, but not sent to the model. <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent/\" target=\"_blank\">See documentation</a> for details."
      },
      {
        "group": "limits"
      },
      {
        "group": "response"
      },
      {
        "group": "response",
        "tooltip": "Use this option in combination with models which don't support native JSON mode/structured tool calling (e.g. Anthropic). Make sure to instruct the model to return valid JSON in the system prompt. The parsed JSON will be available as <code>response.responseJson</code>.<br><br>If parsing fails, <code>null</code> will be returned as JSON response, but the text content will still be available as <code>response.responseText</code>."
      },
      {
        "group": "response",
        "tooltip": "If supported by the model, the response will be structured according to the provided schema. A parsed version of the response will be available as <code>response.responseJson</code>."
      },
      {
        "group": "response"
      },
      {
        "group": "response",
        "tooltip": "In addition to the text content, the assistant message may include multiple additional content blocks and metadata (such as token usage). The message will be available as <code>response.responseMessage</code>."
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.inbound.EmailBoundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "protocol",
          "label": "Imap Details"
        },
        {
          "id": "listenerInfos",
          "label": "Listener information"
        },
        {
          "id": "unseenPollingConfig",
          "label": "After process"
        },
        {
          "id": "allPollingConfig",
          "label": "After process"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzkwXzI0MjApIj4KPHBhdGggZD0iTTguMzM4MzUgOS45NTM2NUwxMC4zODk0IDEyLjAxMDRMOC4zMzI2MiAxNC4wNjcyTDkuMTQ2MTYgMTQuODc1TDEyLjAxMDcgMTIuMDEwNEw5LjE0NjE2IDkuMTQ1ODNMOC4zMzgzNSA5Ljk1MzY1WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEyLjM0ODggOS45NTM2NUwxNC4zOTk4IDEyLjAxMDRMMTIuMzQzIDE0LjA2NzJMMTMuMTU2NiAxNC44NzVMMTYuMDIxMiAxMi4wMTA0TDEzLjE1NjYgOS4xNDU4M0wxMi4zNDg4IDkuOTUzNjVaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMy45NzIgMTEuNDM3NUgxLjEyNTMzVjIuNzkyMTlMNy42NzM3NiA3LjMyMzk2QzcuNzY5NjcgNy4zOTA0OSA3Ljg4MzYgNy40MjYxNCA4LjAwMDMyIDcuNDI2MTRDOC4xMTcwNSA3LjQyNjE0IDguMjMwOTggNy4zOTA0OSA4LjMyNjg5IDcuMzIzOTZMMTQuODc1MyAyLjc5MjE5VjhIMTYuMDIxMlYyLjI3MDgzQzE2LjAyMTIgMS45NjY5NCAxNS45MDA0IDEuNjc1NDkgMTUuNjg1NiAxLjQ2MDYxQzE1LjQ3MDcgMS4yNDU3MiAxNS4xNzkyIDEuMTI1IDE0Ljg3NTMgMS4xMjVIMS4xMjUzM0MwLjgyMTQzMiAxLjEyNSAwLjUyOTk4NCAxLjI0NTcyIDAuMzE1MDk5IDEuNDYwNjFDMC4xMDAyMTQgMS42NzU0OSAtMC4wMjA1MDc4IDEuOTY2OTQgLTAuMDIwNTA3OCAyLjI3MDgzVjExLjQzNzVDLTAuMDIwNTA3OCAxMS43NDE0IDAuMTAwMjE0IDEyLjAzMjggMC4zMTUwOTkgMTIuMjQ3N0MwLjUyOTk4NCAxMi40NjI2IDAuODIxNDMyIDEyLjU4MzMgMS4xMjUzMyAxMi41ODMzSDMuOTcyVjExLjQzNzVaTTEzLjYxNDkgMi4yNzA4M0w4LjAwMDMyIDYuMTU1MjFMMi4zODU3NCAyLjI3MDgzSDEzLjYxNDlaIiBmaWxsPSIjRkM1RDBEIi8+CjxwYXRoIGQ9Ik00LjI4MjEgOS45NTM2NUw2LjMzMzE0IDEyLjAxMDRMNC4yNzYzNyAxNC4wNjcyTDUuMDg5OTEgMTQuODc1TDcuOTU0NDkgMTIuMDEwNEw1LjA4OTkxIDkuMTQ1ODNMNC4yODIxIDkuOTUzNjVaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzkwXzI0MjAiPgo8cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication",
        "tooltip": "Enter your full email address (e.g., user@example.com) or the username provided by your email service. This is used to authenticate your access to the mail server."
      },
      {
        "group": "authentication",
        "tooltip": "Enter the password associated with your email account. Keep your password secure and do not share it with others."
      },
      {
        "group": "protocol",
        "tooltip": "Enter the address of the IMAP server used to retrieve your emails. This server allows you to sync your messages across multiple devices. (e.g., imap.example.com)"
      },
      {
        "group": "protocol",
        "tooltip": "Enter the port number for connecting to the IMAP server. Common ports are 993 for secure connections using SSL/TLS, or 143 for non-secure connections."
      },
      {
        "group": "protocol",
        "tooltip": "Select the encryption protocol for email security."
      },
      {
        "group": "listenerInfos",
        "tooltip": "Enter the names of the folder you wish to monitor. If left blank, the listener will default to monitoring the 'INBOX' folder."
      },
      {
        "group": "listenerInfos",
        "tooltip": "The duration for which the task will wait for a message to arrive in the mailbox before correlating"
      },
      {
        "group": "listenerInfos"
      },
      {
        "group": "unseenPollingConfig",
        "tooltip": "Chose the desired handling strategy"
      },
      {
        "group": "unseenPollingConfig",
        "tooltip": "Specify the destination folder to which the emails will be moved. To create a new folder or a hierarchy of folders, use a dot-separated path (e.g., 'Archive' or 'Projects.2023.January'). If any part of the path does not exist, it will be created automatically."
      },
      {
        "group": "allPollingConfig",
        "tooltip": "Chose the desired handling strategy"
      },
      {
        "group": "allPollingConfig",
        "tooltip": "Specify the destination folder to which the emails will be moved. To create a new folder or a hierarchy of folders, use a dot-separated path (e.g., 'Archive' or 'Projects.2023.January'). If any part of the path does not exist, it will be created automatically."
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.AWSSNS.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "topicProperties",
          "label": "Topic properties"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "input",
          "label": "Input message data"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 80 80' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/64/Arch_AWS-Simple-Notification-Service_64%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/64/Arch_AWS-Simple-Notification-Service_64' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/64/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='80' height='80'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M17,38 C18.103,38 19,38.897 19,40 C19,41.103 18.103,42 17,42 C15.897,42 15,41.103 15,40 C15,38.897 15.897,38 17,38 L17,38 Z M41,64 C29.314,64 19.289,55.466 17.194,43.98 C18.965,43.894 20.427,42.659 20.857,41 L27,41 L27,39 L20.857,39 C20.427,37.342 18.966,36.107 17.195,36.02 C19.285,24.71 29.511,16 41,16 C45.313,16 49.832,17.622 54.429,20.821 L55.571,19.179 C50.633,15.743 45.73,14 41,14 C28.27,14 16.949,23.865 15.063,36.521 C13.839,37.207 13,38.5 13,40 C13,41.5 13.839,42.793 15.063,43.478 C16.97,56.341 28.056,66 41,66 C46.407,66 51.942,64.157 56.585,60.811 L55.415,59.189 C51.11,62.292 45.991,64 41,64 L41,64 Z M30.101,36.442 C31.955,36.895 34.275,37 36,37 C37.642,37 39.823,36.905 41.629,36.506 L37.105,45.553 C37.036,45.691 37,45.845 37,46 L37,50.453 C36.199,50.964 34.833,51.812 34,51.986 L34,46 C34,45.868 33.974,45.737 33.923,45.615 L30.101,36.442 Z M36,33 C40.025,33 42.174,33.604 42.841,34 C42.174,34.396 40.025,35 36,35 C31.975,35 29.826,34.396 29.159,34 C29.826,33.604 31.975,33 36,33 L36,33 Z M33,54 L34,54 C34.043,54 34.086,53.997 34.128,53.992 C35.352,53.833 36.909,52.887 38.272,52.013 L38.535,51.845 C38.824,51.661 39,51.342 39,51 L39,46.236 L44.559,35.12 C44.833,34.801 45,34.434 45,34 C45,31.39 39.361,31 36,31 C32.639,31 27,31.39 27,34 C27,34.366 27.12,34.684 27.32,34.967 L32,46.2 L32,53 C32,53.552 32.447,54 33,54 L33,54 Z M62,53 C63.103,53 64,53.897 64,55 C64,56.103 63.103,57 62,57 C60.897,57 60,56.103 60,55 C60,53.897 60.897,53 62,53 L62,53 Z M62,23 C63.103,23 64,23.897 64,25 C64,26.103 63.103,27 62,27 C60.897,27 60,26.103 60,25 C60,23.897 60.897,23 62,23 L62,23 Z M64,38 C65.103,38 66,38.897 66,40 C66,41.103 65.103,42 64,42 C62.897,42 62,41.103 62,40 C62,38.897 62.897,38 64,38 L64,38 Z M54,41 L60.143,41 C60.589,42.72 62.142,44 64,44 C66.206,44 68,42.206 68,40 C68,37.794 66.206,36 64,36 C62.142,36 60.589,37.28 60.143,39 L54,39 L54,26 L58.143,26 C58.589,27.72 60.142,29 62,29 C64.206,29 66,27.206 66,25 C66,22.794 64.206,21 62,21 C60.142,21 58.589,22.28 58.143,24 L53,24 C52.447,24 52,24.448 52,25 L52,39 L45,39 L45,41 L52,41 L52,55 C52,55.552 52.447,56 53,56 L58.143,56 C58.589,57.72 60.142,59 62,59 C64.206,59 66,57.206 66,55 C66,52.794 64.206,51 62,51 C60.142,51 58.589,52.28 58.143,54 L54,54 L54,41 Z' id='AWS-Simple-Notification-Service_Icon_64_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "topicProperties"
      },
      {
        "group": "topicProperties"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.Salesforce.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgZmlsbD0icmdiKDAlLDAlLDAlKSIgeG1sbnM6dj0iaHR0cHM6Ly92ZWN0YS5pby9uYW5vIj48cGF0aCBkPSJNNC44MiAzLjA3NEMzLjM4MyAzLjE5MSAyLjE1NiA0LjE0MSAxLjcwNyA1LjVhMi44MSAyLjgxIDAgMCAwLS4xNzIgMS4wNTkgMi40NCAyLjQ0IDAgMCAwIC4xMjUuOTFsLjA1MS4xNzYtLjI4NS4yODFDLjkxOCA4LjQzNC42MzcgOC45NDUuNSA5LjYyMWE0LjAxIDQuMDEgMCAwIDAgLjAxMiAxLjIwMyAzLjEzIDMuMTMgMCAwIDAgLjg5MSAxLjYyNWMuNDYxLjQ2MS45NjEuNzM0IDEuNTgyLjg3MS4xODguMDM5LjY3Mi4wOS43MjcuMDc0LjAxNi0uMDA4LjA5LS4wMTYuMTYtLjAybC4xMzMtLjAxNi4xMzMuMjI3Yy45MDIgMS41MTIgMi43NTggMi4wMjcgNC4yNjYgMS4xODRhMy40OSAzLjQ5IDAgMCAwIDEuMDgyLTEuMDA0bC4xNDgtLjIzLjIzLjA3YTIuMTMgMi4xMyAwIDAgMCAuODgzLjEzMyAyLjg0IDIuODQgMCAwIDAgMS41Mi0uNSAzLjUyIDMuNTIgMCAwIDAgLjc4MS0uNzYyYy4wNzQtLjEwNS4xNDgtLjE4Ny4xNi0uMTg3cy4xMzMuMDEyLjI2Mi4wMjNjLjI2Mi4wMjcuNjA5LjAwNC45NjUtLjA2NmEzLjk5IDMuOTkgMCAwIDAgMi40OC0xLjY4NCAzLjkgMy45IDAgMCAwIC4xMTMtNC4xMjUgMy45MyAzLjkzIDAgMCAwLTIuNTIzLTEuODUyIDMuMzUgMy4zNSAwIDAgMC0xLjg3OS4wODZsLS4yNS4wN2EyLjI2IDIuMjYgMCAwIDEtLjA5NC0uMTI1IDMuODMgMy44MyAwIDAgMC0uNjIxLS42MDljLS40NTctLjM0NC0xLjA0Ny0uNTU1LTEuNjQxLS41ODItLjcxNS0uMDM5LTEuNDguMjU4LTIuMDUxLjc4MWwtLjE2NC4xNTItLjExMy0uMTIxYy0uNTgyLS42NDUtMS40NjUtMS4wOTQtMi4yNTgtMS4xNTItLjM0OC0uMDI3LS40MTQtLjAyNy0uNjEzLS4wMTJ6bS44NzkuNzdjLjc2Mi4xNzYgMS4zNzEuNjEzIDEuODMyIDEuMzEzbC4yMDcuMjk3Yy4wMTIgMCAuMTAyLS4xMTMuMjAzLS4yNTRhNC40MiA0LjQyIDAgMCAxIC4zNC0uNDAyYy44OTgtLjg4MyAyLjM1NS0uODc5IDMuMjUuMDE2LjE2NC4xNjQuMzEzLjM2Ny40NTcuNjI1LjA0My4wODIuMDkuMTQ1LjA5OC4xNDVzLjEwNS0uMDM1LjIwNy0uMDgyYTMuMjYgMy4yNiAwIDAgMSAxLjYyOS0uMjg1YzEuMjY2LjEyMSAyLjI4NS45MDIgMi43MzggMi4wOTRhNC41NCA0LjU0IDAgMCAxIC4xMDkuMzc1Yy4wNTkuMjMuMDU5LjI3LjA2My43MDcgMCAuNTEyLS4wMi42NDgtLjE1MiAxLjA0N2EzLjE2IDMuMTYgMCAwIDEtLjc3IDEuMjM0IDMuMTYgMy4xNiAwIDAgMS0xLjU1NS44NTljLS4zNC4wODItLjg1Mi4wOTQtMS4yNS4wMzFsLS4zMDEtLjAzOWE1LjY1IDUuNjUgMCAwIDAtLjEwOS4yMDdjLS4zMDUuNTk4LS44MjQgMS4wMzUtMS40MzQgMS4yMTEtLjU5LjE3Mi0xLjE2OC4xMDktMS43NS0uMTg0YTEuMTkgMS4xOSAwIDAgMC0uMTk1LS4wODJjLS4wMTEgMC0uMDgyLjExMy0uMTQ4LjI1LS4yNTQuNTYzLS42MjEuOTY1LTEuMTEzIDEuMjM4YTIuNTggMi41OCAwIDAgMS0yLjM3NSAwYy0uNTM1LS4yOTMtLjkyNi0uNzU4LTEuMTY4LTEuMzc1LS4wODYtLjIyMy0uMDYyLS4yMTEtLjQzNy0uMTQ4YTIuODggMi44OCAwIDAgMS0xLjAwNC0uMDI3Yy0xLjU0Ny0uMzg3LTIuMzQ4LTIuMDg2LTEuNjU2LTMuNTA4YTIuNTggMi41OCAwIDAgMSAuOTAyLTEuMDE2bC4yMTEtLjE0MWExLjU3IDEuNTcgMCAwIDAtLjA4Mi0uMjQyYy0uMTg0LS40OTYtLjI0Ni0uOTA2LS4xOTktMS4zNDguMTMzLTEuMzA1IDEuMDc4LTIuMzE2IDIuMzgzLTIuNTQ3YTMuOTQgMy45NCAwIDAgMSAxLjA3LjAzMXptLjExNyAzLjUxOWEzMi44MyAzMi44MyAwIDAgMC0uMDA0IDEuMDdsLjAwNCAxLjAzOS4xMzcuMDA0Yy4wOTguMDA0LjE0NSAwIC4xNTYtLjAyYTM2LjkzIDM2LjkzIDAgMCAwIC4wMDgtMi4wODIuMzkuMzkgMCAwIDAtLjMwMS0uMDEyem00LjMwOS0uMDA0Yy0uMTg3LjA0Ny0uMzMyLjE5NS0uMzk1LjQwMmEuODIuODIgMCAwIDAtLjA0My4xNzZjMCAuMDktLjAyMy4xMDktLjE0MS4xMDloLS4xMTNsLS4wMjMuMTA1YS44My44MyAwIDAgMC0uMDIzLjEyOWMwIC4wMTYuMDUxLjAyMy4xMTcuMDIzLjA3OCAwIC4xMTcuMDA4LjExNy4wMjNzLS4wNTEuMzAxLS4xMDUuNjI5Yy0uMTcyLjkzOC0uMTkxLjk4NC0uNDQ1Ljk4NEg4LjkzbC0uMDI3LjA3OGMtLjA0Ny4xMjUtLjAzOS4xNDUuMDYzLjE3Mi4xOTkuMDU1LjQ2MS0uMDI3LjU3NC0uMTguMTAyLS4xNDUuMTQ1LS4yOTcuMjctMS4wMDhsLjEyNS0uNjkxLjE3Mi0uMDA4Yy4xNjgtLjAxMi4xNjgtLjAxMi4xODQtLjA3NGEuNzguNzggMCAwIDAgLjAxNi0uMTI1bC4wMDQtLjA1OUg5Ljk4bC4wMTYtLjEwMmMuMDItLjE0MS4wODItLjI3Ny4xNDUtLjMwOS4wMjctLjAxNi4xMDUtLjAyNy4xOC0uMDIzbC4xMjkuMDA0LjAzOS0uMTA5YS4zOC4zOCAwIDAgMCAuMDI3LS4xMTdjLS4wNDMtLjA0My0uMjctLjA1OS0uMzkxLS4wMzF6bS02LjgwOS43MTFjLS4zNTkuMDgyLS40OTYuNDMtLjI1NC42NDguMDY2LjA1OS4xNDEuMDk0LjMzNi4xNTYuMzQ0LjEwNS40MTQuMTg0LjI4NS4zMTYtLjAzNS4wMzktLjA3LjA0My0uMjE5LjA0M3MtLjE5NS0uMDA4LS4zMjQtLjA3Yy0uMDgyLS4wMzktLjE1Mi0uMDYyLS4xNi0uMDUxYS45LjkgMCAwIDAtLjA1NS4xMDlsLS4wMzEuMDkuMTMzLjA2M2MuMzc5LjE3Ni44MzYuMTEzLjk2OS0uMTM3LjA1MS0uMTAyLjA1NS0uMjU0LjAwNC0uMzUycy0uMTQ1LS4xNTYtLjQzLS4yNWMtLjE5NS0uMDY2LS4yNjYtLjA5OC0uMjk3LS4xNDUtLjA0My0uMDU1LS4wNDMtLjA1OS0uMDA4LS4xMTMuMDItLjAzMS4wNjMtLjA2Ni4wOTQtLjA3OC4wNzQtLjAzMS4yNzMtLjAwOC40MjYuMDQ3LjA2Ni4wMjMuMTI5LjAzNS4xMzcuMDIzcy4wMzEtLjA1MS4wNTEtLjA5NGwuMDMxLS4wODItLjA2Ni0uMDQzYTEuMDEgMS4wMSAwIDAgMC0uNjIxLS4wODJ6bTEuNDExLS4wMDRjLS4xNTYuMDIzLS4yNzcuMDYzLS4zMi4wOTRzLS4wMzkuMDMxLjAwOC4xMjljLjAzNS4wODYuMDUxLjEwMi4wNzguMDkuMTg0LS4wNzQuNDY5LS4xMDIuNTktLjA1NS4wNzguMDI3LjEyNS4xMDIuMTI1LjE5NXYuMDc0bC0uMjI3LS4wMDhjLS4yODktLjAwOC0uNDI2LjAzMS0uNTU5LjE1Ni0uMTA1LjEwNS0uMTQ4LjIyMy0uMTI5LjM1OS4wNTUuMzQuNDUzLjQ1NyAxLjEwMi4zMTZsLjEwNS0uMDIzLjAxNi0uMzA5Yy4wMzUtLjY3Ni0uMDMxLS44OTUtLjI4NS0uOTg0YTEuMjYgMS4yNiAwIDAgMC0uNTA0LS4wMzV6bS40MTQuNzQybC4wNjYuMDEydi4zOThsLS4wOTguMDE2Yy0uMjUuMDMxLS40My0uMDA0LS40OC0uMDlhLjM4LjM4IDAgMCAxLS4wMjMtLjEyOWMwLS4wOTQuMDYzLS4xNjQuMTY0LS4xOTlhMS4zIDEuMyAwIDAgMSAuMzcxLS4wMDh6bTEuODItLjczNGMtLjM0LjA5OC0uNTA0LjM0NC0uNDg0Ljc0Mi4wMTYuMzE2LjEzNy41MDQuNDAyLjYwNS4yMjcuMDkuODM2LjA0Ny44MzYtLjA1OWEuODIuODIgMCAwIDAtLjA3NC0uMjAzbC0uMTA5LjAzMWExLjA2IDEuMDYgMCAwIDEtLjI3My4wMzVjLS4yMjMuMDA0LS4zNDgtLjA1NS0uNDE0LS4xOTUtLjAzMS0uMDUxLS4wNTEtLjExMy0uMDUxLS4xNDVWOC44NGwuNDg4LS4wMDQuNDg4LS4wMDh2LS4xNmMwLS4yNzMtLjExNy0uNDY5LS4zMjgtLjU2MmEuOTEuOTEgMCAwIDAtLjQ4LS4wMzF6bS4zMjQuMjQyYS4yOS4yOSAwIDAgMSAuMTc2LjIzNGwuMDA4LjA2My0uMzEyLjAwOGMtLjE2OCAwLS4zMiAwLS4zMzYtLjAwNC0uMDMxLS4wMTIuMDE2LS4xNzIuMDc0LS4yMzQuMDg2LS4wOTguMjQ2LS4xMjUuMzkxLS4wNjZ6bTAgMCIvPjxwYXRoIGQ9Ik04LjQzOCA4LjA3Yy0uMjAzLjA0Ny0uMzI0LjE1Ni0uMzU5LjMyLS4wNTUuMjIzLjA3NC4zNjcuNDEuNDczLjM0NC4xMDUuNDA2LjE0OC4zNjMuMjYyLS4wNTUuMTQ1LS4zMzIuMTYtLjU5OC4wMzUtLjA3OC0uMDM1LS4xNDUtLjA1OS0uMTUyLS4wNDdzLS4wMzEuMDU1LS4wNTUuMTA5bC0uMDMxLjA5LjEzMy4wNjNjLjQ4NC4yMjcgMS4wMTIuMDU5IDEuMDEyLS4zMi0uMDA0LS4yMDctLjEwNS0uMzAxLS40NjktLjQxOGExLjI4IDEuMjggMCAwIDEtLjI3My0uMTA5LjE0LjE0IDAgMCAxIC4wMDQtLjE5NWMuMDY2LS4wNTUuMzA5LS4wNTEuNDguMDEyLjA3LjAyMy4xMzMuMDM5LjE0NS4wMjdzLjAyNy0uMDUxLjA0Ny0uMDk0bC4wMzEtLjA4Mi0uMDY2LS4wNDNhMS4wMSAxLjAxIDAgMCAwLS42MjEtLjA4MnptMi40MS0uMDA0Yy0uMjcuMDU5LS40NTMuMjY2LS40OTYuNTYzLS4wNDcuMzQuMDg2LjY0NS4zMzYuNzc3LjExNy4wNTkuMzIuMDg2LjQ3My4wNTUuMjMtLjAzOS4zNzEtLjE0MS40NzMtLjMzMi4wNTEtLjA5OC4wNTUtLjEyNS4wNTUtLjM2M3MtLjAwNC0uMjY2LS4wNTUtLjM2N2MtLjA3LS4xMzMtLjE3Mi0uMjMtLjMwMS0uMjg1LS4xMTMtLjA1MS0uMzUyLS4wNzQtLjQ4NC0uMDQ3em0uMzcxLjI3N2MuMTE3LjA2Ni4xNDguMTU2LjE0OC40MjIgMCAuMTk1LS4wMDQuMjQ2LS4wNDMuMzA5LS4wNy4xMjEtLjE0NS4xNi0uMzAxLjE2cy0uMjI3LS4wMzktLjI5Ny0uMTcyYy0uMDYyLS4xMTctLjA2Mi0uNDczLS4wMDQtLjU5NC4wODYtLjE3Mi4zMTMtLjIyNy40OTYtLjEyNXptMS4yNS0uMjY1YS43NS43NSAwIDAgMC0uMTM3LjA2M2MtLjA3LjA0Ny0uMDc0LjA0My0uMDc0LS4wMiAwLS4wNTUtLjAwNC0uMDU1LS4xNDUtLjA1MWwtLjE0NS4wMDh2MS4zOTVoLjMwMWwuMDA4LS40NjFjLjAxMi0uMzkxLjAyLS40NzMuMDUxLS41MzEuMDU5LS4xMDkuMTUyLS4xNTYuMzA1LS4xNTZoLjEzM2wuMDM1LS4wOWMuMDU1LS4xNDUuMDQ3LS4xNTYtLjA2Mi0uMTc2LS4xMzctLjAxNi0uMTgtLjAxNi0uMjcuMDJ6bTAgMCIvPjxwYXRoIGQ9Ik0xMy4zOTUgOC4wODJjLS4zMDUuMDgyLS40NzMuMjk3LS40OTIuNjQ1LS4wMjcuNTcuNDA2Ljg2MyAxLjA0My43MDcuMTAyLS4wMjMuMTA1LS4wMzkuMDU1LS4xNjQtLjAyNy0uMDY2LS4wNDMtLjA4Ni0uMDctLjA3NGExLjI2IDEuMjYgMCAwIDEtLjQzNy4wMTJjLS4xODQtLjA2Mi0uMjctLjIwMy0uMjctLjQ0MSAwLS4xOC4wNDctLjI5Ny4xNDgtLjM4My4wOTQtLjA3OC4xNDEtLjA4Ni4zODMtLjA3NGwuMjA3LjAxNi4wMzktLjEwMmMuMDQzLS4xMTcuMDM5LS4xMjEtLjE0NS0uMTUyLS4xNzYtLjAzMS0uMzItLjAyNy0uNDYxLjAxMnptMCAwIi8+PHBhdGggZD0iTTE0LjYxNyA4LjA3OGMtLjMzMi4wOTQtLjQ5Mi4zNTUtLjQ2OS43NTguMDE2LjMwOS4xNjQuNTEyLjQ0MS41OTguMjM4LjA3Ljc5Ny4wMjMuNzk3LS4wN2EuODIuODIgMCAwIDAtLjA3NC0uMjAzbC0uMTA1LjAzMWMtLjA1OS4wMi0uMTg3LjAzNS0uMjgxLjAzNS0uMjc3IDAtLjQxNC0uMDk0LS40NDktLjMwNWwtLjAxNi0uMDgyLjQ4OC0uMDA0LjQ4OC0uMDA4di0uMTcyYy0uMDA0LS4yNy0uMTEzLS40NTMtLjMyNC0uNTUxLS4xMjUtLjA1NS0uMzUyLS4wNjYtLjQ5Ni0uMDI3em0uMzQuMjM4YS4yOS4yOSAwIDAgMSAuMTc2LjIzNGwuMDA4LjA2My0uMzEyLjAwOGMtLjE2OCAwLS4zMiAwLS4zMzYtLjAwNHMtLjAyLS4wMjctLjAwNC0uMDgyYy4wNzgtLjIyMy4yNTQtLjMwNS40NjktLjIxOXptMCAwIi8+PC9zdmc+"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "Instance"
        },
        {
          "id": "input",
          "label": "Operation"
        },
        {
          "id": "timeout",
          "label": "Connect timeout"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {},
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {},
      {
        "group": "input"
      },
      {},
      {},
      {
        "group": "input"
      },
      {
        "group": "authentication"
      },
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {},
      {
        "group": "timeout"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.agenticai.aiagent.jobworker.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": [
          "AI",
          "AI Agent",
          "agentic orchestration"
        ]
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "provider",
          "label": "Model provider",
          "openByDefault": false
        },
        {
          "id": "model",
          "label": "Model",
          "openByDefault": false
        },
        {
          "id": "systemPrompt",
          "label": "System prompt",
          "tooltip": "A system prompt is a set of foundational instructions given to a model before any user interaction begins. It defines the AI agent’s role, behavior, tone, and communication style, ensuring that responses remain consistent and aligned with the AI agent’s intended purpose. These instructions help shape how the model interprets and responds to user input throughout the conversation.",
          "openByDefault": false
        },
        {
          "id": "userPrompt",
          "label": "User prompt",
          "tooltip": "A user prompt is the message or question you give to the AI to start or continue a conversation. It tells the AI what you need, whether it's information, help with a task, or just a chat. The AI uses your prompt to understand how to respond.",
          "openByDefault": false
        },
        {
          "id": "tools",
          "label": "Tools",
          "tooltip": "Tools are optional features the AI Agent can use to perform specific tasks. Configure this if the agent should participate in a tools feedback loop.",
          "openByDefault": false
        },
        {
          "id": "memory",
          "label": "Memory",
          "tooltip": "Configuration of the Agent's short-term/conversational memory.",
          "openByDefault": false
        },
        {
          "id": "limits",
          "label": "Limits",
          "openByDefault": false
        },
        {
          "id": "events",
          "label": "Event handling",
          "openByDefault": false
        },
        {
          "id": "response",
          "label": "Response",
          "tooltip": "Configuration of the model response format and how to map the model response to the connector result.<br><br>Depending on the selection, the model response will be available as <code>response.responseText</code> or <code>response.responseJson</code>.<br><br>See <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-process/#response\">documentation</a> for details.",
          "openByDefault": false
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNBNTZFRkYiLz4KPG1hc2sgaWQ9InBhdGgtMi1vdXRzaWRlLTFfMTg1XzYiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjQiIHk9IjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iYmxhY2siPgo8cmVjdCBmaWxsPSJ3aGl0ZSIgeD0iNCIgeT0iNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuMDEwNSAxMi4wOTg3QzE4LjQ5IDEwLjU4OTQgMTcuMTU5NCA4LjEwODE0IDE2LjE3OTkgNi4wMTEwM0MxNi4xNTIgNi4wMDQ1MSAxNi4xMTc2IDYgMTYuMDc5NCA2QzE2LjA0MTEgNiAxNi4wMDY2IDYuMDA0NTEgMTUuOTc4OCA2LjAxMTA0QzE0Ljk5OTQgOC4xMDgxNCAxMy42Njk3IDEwLjU4ODkgMTIuMTQ4MSAxMi4wOTgxQzEwLjYyNjkgMTMuNjA3MSA4LjEyNTY4IDE0LjkyNjQgNi4wMTE1NyAxNS44OTgxQzYuMDA0NzQgMTUuOTI2MSA2IDE1Ljk2MTEgNiAxNkM2IDE2LjAzODcgNi4wMDQ2OCAxNi4wNzM2IDYuMDExNDQgMTYuMTAxNEM4LjEyNTE5IDE3LjA3MjkgMTAuNjI2MiAxOC4zOTE5IDEyLjE0NzcgMTkuOTAxNkMxMy42Njk3IDIxLjQxMDcgMTQuOTk5NiAyMy44OTIgMTUuOTc5MSAyNS45ODlDMTYuMDA2OCAyNS45OTU2IDE2LjA0MTEgMjYgMTYuMDc5MyAyNkMxNi4xMTc1IDI2IDE2LjE1MTkgMjUuOTk1NCAxNi4xNzk2IDI1Ljk4OUMxNy4xNTkxIDIzLjg5MiAxOC40ODg4IDIxLjQxMSAyMC4wMDk5IDE5LjkwMjFNMjAuMDA5OSAxOS45MDIxQzIxLjUyNTMgMTguMzk4NyAyMy45NDY1IDE3LjA2NjkgMjUuOTkxNSAxNi4wODI0QzI1Ljk5NjUgMTYuMDU5MyAyNiAxNi4wMzEgMjYgMTUuOTk5N0MyNiAxNS45Njg0IDI1Ljk5NjUgMTUuOTQwMyAyNS45OTE1IDE1LjkxNzFDMjMuOTQ3NCAxNC45MzI3IDIxLjUyNTkgMTMuNjAxIDIwLjAxMDUgMTIuMDk4NyIvPgo8L21hc2s+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuMDEwNSAxMi4wOTg3QzE4LjQ5IDEwLjU4OTQgMTcuMTU5NCA4LjEwODE0IDE2LjE3OTkgNi4wMTEwM0MxNi4xNTIgNi4wMDQ1MSAxNi4xMTc2IDYgMTYuMDc5NCA2QzE2LjA0MTEgNiAxNi4wMDY2IDYuMDA0NTEgMTUuOTc4OCA2LjAxMTA0QzE0Ljk5OTQgOC4xMDgxNCAxMy42Njk3IDEwLjU4ODkgMTIuMTQ4MSAxMi4wOTgxQzEwLjYyNjkgMTMuNjA3MSA4LjEyNTY4IDE0LjkyNjQgNi4wMTE1NyAxNS44OTgxQzYuMDA0NzQgMTUuOTI2MSA2IDE1Ljk2MTEgNiAxNkM2IDE2LjAzODcgNi4wMDQ2OCAxNi4wNzM2IDYuMDExNDQgMTYuMTAxNEM4LjEyNTE5IDE3LjA3MjkgMTAuNjI2MiAxOC4zOTE5IDEyLjE0NzcgMTkuOTAxNkMxMy42Njk3IDIxLjQxMDcgMTQuOTk5NiAyMy44OTIgMTUuOTc5MSAyNS45ODlDMTYuMDA2OCAyNS45OTU2IDE2LjA0MTEgMjYgMTYuMDc5MyAyNkMxNi4xMTc1IDI2IDE2LjE1MTkgMjUuOTk1NCAxNi4xNzk2IDI1Ljk4OUMxNy4xNTkxIDIzLjg5MiAxOC40ODg4IDIxLjQxMSAyMC4wMDk5IDE5LjkwMjFNMjAuMDA5OSAxOS45MDIxQzIxLjUyNTMgMTguMzk4NyAyMy45NDY1IDE3LjA2NjkgMjUuOTkxNSAxNi4wODI0QzI1Ljk5NjUgMTYuMDU5MyAyNiAxNi4wMzEgMjYgMTUuOTk5N0MyNiAxNS45Njg0IDI1Ljk5NjUgMTUuOTQwMyAyNS45OTE1IDE1LjkxNzFDMjMuOTQ3NCAxNC45MzI3IDIxLjUyNTkgMTMuNjAxIDIwLjAxMDUgMTIuMDk4NyIgZmlsbD0id2hpdGUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMC4wMTA1IDEyLjA5ODdDMTguNDkgMTAuNTg5NCAxNy4xNTk0IDguMTA4MTQgMTYuMTc5OSA2LjAxMTAzQzE2LjE1MiA2LjAwNDUxIDE2LjExNzYgNiAxNi4wNzk0IDZDMTYuMDQxMSA2IDE2LjAwNjYgNi4wMDQ1MSAxNS45Nzg4IDYuMDExMDRDMTQuOTk5NCA4LjEwODE0IDEzLjY2OTcgMTAuNTg4OSAxMi4xNDgxIDEyLjA5ODFDMTAuNjI2OSAxMy42MDcxIDguMTI1NjggMTQuOTI2NCA2LjAxMTU3IDE1Ljg5ODFDNi4wMDQ3NCAxNS45MjYxIDYgMTUuOTYxMSA2IDE2QzYgMTYuMDM4NyA2LjAwNDY4IDE2LjA3MzYgNi4wMTE0NCAxNi4xMDE0QzguMTI1MTkgMTcuMDcyOSAxMC42MjYyIDE4LjM5MTkgMTIuMTQ3NyAxOS45MDE2QzEzLjY2OTcgMjEuNDEwNyAxNC45OTk2IDIzLjg5MiAxNS45NzkxIDI1Ljk4OUMxNi4wMDY4IDI1Ljk5NTYgMTYuMDQxMSAyNiAxNi4wNzkzIDI2QzE2LjExNzUgMjYgMTYuMTUxOSAyNS45OTU0IDE2LjE3OTYgMjUuOTg5QzE3LjE1OTEgMjMuODkyIDE4LjQ4ODggMjEuNDExIDIwLjAwOTkgMTkuOTAyMU0yMC4wMDk5IDE5LjkwMjFDMjEuNTI1MyAxOC4zOTg3IDIzLjk0NjUgMTcuMDY2OSAyNS45OTE1IDE2LjA4MjRDMjUuOTk2NSAxNi4wNTkzIDI2IDE2LjAzMSAyNiAxNS45OTk3QzI2IDE1Ljk2ODQgMjUuOTk2NSAxNS45NDAzIDI1Ljk5MTUgMTUuOTE3MUMyMy45NDc0IDE0LjkzMjcgMjEuNTI1OSAxMy42MDEgMjAuMDEwNSAxMi4wOTg3IiBzdHJva2U9IiM0OTFEOEIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgbWFzaz0idXJsKCNwYXRoLTItb3V0c2lkZS0xXzE4NV82KSIvPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider"
      },
      {
        "group": "provider",
        "tooltip": "Specify an endpoint to use the connector with an OpenAI compatible API. "
      },
      {
        "group": "provider",
        "tooltip": "Leave blank if using HTTP headers for authentication.<br>If an Authorization header is specified in the headers, then the API key is ignored."
      },
      {
        "group": "provider"
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "The maximum number of tokens per request to generate before stopping. <br><br>Details in the <a href=\"https://docs.anthropic.com/en/api/messages#body-max-tokens\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. The higher the number, the more randomness will be injected into the response. <br><br>Details in the <a href=\"https://docs.anthropic.com/en/api/messages#body-temperature\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://docs.anthropic.com/en/api/messages#body-top-p\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Integer greater than 0. Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://docs.anthropic.com/en/api/messages#body-top-k\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "The maximum number of tokens per request to allow in the generated response. <br><br>Details in the <a href=\"https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InferenceConfiguration.html\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. The higher the number, the more randomness will be injected into the response. <br><br>Details in the <a href=\"https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InferenceConfiguration.html\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_InferenceConfiguration.html\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "The maximum number of tokens per request to generate before stopping. <br><br>Details in the <a href=\"https://learn.microsoft.com/en-us/azure/ai-foundry/openai/reference#request-body\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 2. The higher the number, the more randomness will be injected into the response. <br><br>Details in the <a href=\"https://learn.microsoft.com/en-us/azure/ai-foundry/openai/reference#request-body\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://learn.microsoft.com/en-us/azure/ai-foundry/openai/reference#request-body\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "Maximum number of tokens that can be generated in the response. <br><br>Details in the <a href=\"https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Controls the degree of randomness in token selection. <br><br>Details in the <a href=\"https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 1. Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Integer greater than 0. Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "The maximum number of tokens per request to generate before stopping. <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_completion_tokens\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 2. The higher the number, the more randomness will be injected into the response. <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_p\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model"
      },
      {
        "group": "model",
        "tooltip": "The maximum number of tokens per request to generate before stopping. <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-max_completion_tokens\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Floating point number between 0 and 2. The higher the number, the more randomness will be injected into the response. <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-temperature\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model",
        "tooltip": "Recommended for advanced use cases only (you usually only need to use temperature). <br><br>Details in the <a href=\"https://platform.openai.com/docs/api-reference/chat/create#chat-create-top_p\" target=\"_blank\">documentation</a>."
      },
      {
        "group": "model"
      },
      {
        "group": "systemPrompt"
      },
      {
        "group": "userPrompt"
      },
      {
        "group": "userPrompt",
        "tooltip": "Referenced documents will be automatically added to the user prompt. <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-process/\" target=\"_blank\">See documentation</a> for details and supported file types."
      },
      {
        "group": "memory",
        "tooltip": "The agent context variable containing all relevant data for the agent to support the feedback loop between user requests, tool calls and LLM responses. Make sure this variable points to the <code>context</code> variable which is returned from the agent response. <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-process/\" target=\"_blank\">See documentation</a> for details."
      },
      {
        "group": "memory"
      },
      {
        "group": "memory",
        "tooltip": "Will use the cluster default TTL (time-to-live) if not specified. Make sure to set this value to a reasonable duration matching your process lifecycle."
      },
      {
        "group": "memory"
      },
      {
        "group": "memory"
      },
      {
        "group": "memory"
      },
      {
        "group": "memory",
        "tooltip": "Use this to limit the number of messages which are sent to the model. The agent will only send the most recent messages up to the configured limit to the LLM. Older messages will be kept in the conversation store, but not sent to the model. <a href=\"https://docs.camunda.io/docs/8.8/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-process/\" target=\"_blank\">See documentation</a> for details."
      },
      {
        "group": "limits"
      },
      {
        "group": "events"
      },
      {
        "group": "response"
      },
      {
        "group": "response",
        "tooltip": "Use this option in combination with models which don't support native JSON mode/structured tool calling (e.g. Anthropic). Make sure to instruct the model to return valid JSON in the system prompt. The parsed JSON will be available as <code>response.responseJson</code>.<br><br>If parsing fails, <code>null</code> will be returned as JSON response, but the text content will still be available as <code>response.responseText</code>."
      },
      {
        "group": "response",
        "tooltip": "If supported by the model, the response will be structured according to the provided schema. A parsed version of the response will be available as <code>response.responseJson</code>."
      },
      {
        "group": "response"
      },
      {
        "group": "response",
        "tooltip": "In addition to the text content, the assistant message may include multiple additional content blocks and metadata (such as token usage). The message will be available as <code>response.responseMessage</code>."
      },
      {
        "group": "response",
        "tooltip": "Use this option if you need to re-inject the previous agent context into a future agent execution, for example when modeling a user feedback loop between an agent and a user task."
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.agenticai.aiagent.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "model",
          "label": "Model"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "context",
          "label": "Context"
        },
        {
          "id": "systemPrompt",
          "label": "System Prompt"
        },
        {
          "id": "userPrompt",
          "label": "User Prompt"
        },
        {
          "id": "tools",
          "label": "Tools"
        },
        {
          "id": "memory",
          "label": "Memory"
        },
        {
          "id": "guardrails",
          "label": "Guardrails"
        },
        {
          "id": "parameters",
          "label": "Parameters"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNBNTZFRkYiLz4KPG1hc2sgaWQ9InBhdGgtMi1vdXRzaWRlLTFfMTg1XzYiIG1hc2tVbml0cz0idXNlclNwYWNlT25Vc2UiIHg9IjQiIHk9IjQiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iYmxhY2siPgo8cmVjdCBmaWxsPSJ3aGl0ZSIgeD0iNCIgeT0iNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuMDEwNSAxMi4wOTg3QzE4LjQ5IDEwLjU4OTQgMTcuMTU5NCA4LjEwODE0IDE2LjE3OTkgNi4wMTEwM0MxNi4xNTIgNi4wMDQ1MSAxNi4xMTc2IDYgMTYuMDc5NCA2QzE2LjA0MTEgNiAxNi4wMDY2IDYuMDA0NTEgMTUuOTc4OCA2LjAxMTA0QzE0Ljk5OTQgOC4xMDgxNCAxMy42Njk3IDEwLjU4ODkgMTIuMTQ4MSAxMi4wOTgxQzEwLjYyNjkgMTMuNjA3MSA4LjEyNTY4IDE0LjkyNjQgNi4wMTE1NyAxNS44OTgxQzYuMDA0NzQgMTUuOTI2MSA2IDE1Ljk2MTEgNiAxNkM2IDE2LjAzODcgNi4wMDQ2OCAxNi4wNzM2IDYuMDExNDQgMTYuMTAxNEM4LjEyNTE5IDE3LjA3MjkgMTAuNjI2MiAxOC4zOTE5IDEyLjE0NzcgMTkuOTAxNkMxMy42Njk3IDIxLjQxMDcgMTQuOTk5NiAyMy44OTIgMTUuOTc5MSAyNS45ODlDMTYuMDA2OCAyNS45OTU2IDE2LjA0MTEgMjYgMTYuMDc5MyAyNkMxNi4xMTc1IDI2IDE2LjE1MTkgMjUuOTk1NCAxNi4xNzk2IDI1Ljk4OUMxNy4xNTkxIDIzLjg5MiAxOC40ODg4IDIxLjQxMSAyMC4wMDk5IDE5LjkwMjFNMjAuMDA5OSAxOS45MDIxQzIxLjUyNTMgMTguMzk4NyAyMy45NDY1IDE3LjA2NjkgMjUuOTkxNSAxNi4wODI0QzI1Ljk5NjUgMTYuMDU5MyAyNiAxNi4wMzEgMjYgMTUuOTk5N0MyNiAxNS45Njg0IDI1Ljk5NjUgMTUuOTQwMyAyNS45OTE1IDE1LjkxNzFDMjMuOTQ3NCAxNC45MzI3IDIxLjUyNTkgMTMuNjAxIDIwLjAxMDUgMTIuMDk4NyIvPgo8L21hc2s+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjAuMDEwNSAxMi4wOTg3QzE4LjQ5IDEwLjU4OTQgMTcuMTU5NCA4LjEwODE0IDE2LjE3OTkgNi4wMTEwM0MxNi4xNTIgNi4wMDQ1MSAxNi4xMTc2IDYgMTYuMDc5NCA2QzE2LjA0MTEgNiAxNi4wMDY2IDYuMDA0NTEgMTUuOTc4OCA2LjAxMTA0QzE0Ljk5OTQgOC4xMDgxNCAxMy42Njk3IDEwLjU4ODkgMTIuMTQ4MSAxMi4wOTgxQzEwLjYyNjkgMTMuNjA3MSA4LjEyNTY4IDE0LjkyNjQgNi4wMTE1NyAxNS44OTgxQzYuMDA0NzQgMTUuOTI2MSA2IDE1Ljk2MTEgNiAxNkM2IDE2LjAzODcgNi4wMDQ2OCAxNi4wNzM2IDYuMDExNDQgMTYuMTAxNEM4LjEyNTE5IDE3LjA3MjkgMTAuNjI2MiAxOC4zOTE5IDEyLjE0NzcgMTkuOTAxNkMxMy42Njk3IDIxLjQxMDcgMTQuOTk5NiAyMy44OTIgMTUuOTc5MSAyNS45ODlDMTYuMDA2OCAyNS45OTU2IDE2LjA0MTEgMjYgMTYuMDc5MyAyNkMxNi4xMTc1IDI2IDE2LjE1MTkgMjUuOTk1NCAxNi4xNzk2IDI1Ljk4OUMxNy4xNTkxIDIzLjg5MiAxOC40ODg4IDIxLjQxMSAyMC4wMDk5IDE5LjkwMjFNMjAuMDA5OSAxOS45MDIxQzIxLjUyNTMgMTguMzk4NyAyMy45NDY1IDE3LjA2NjkgMjUuOTkxNSAxNi4wODI0QzI1Ljk5NjUgMTYuMDU5MyAyNiAxNi4wMzEgMjYgMTUuOTk5N0MyNiAxNS45Njg0IDI1Ljk5NjUgMTUuOTQwMyAyNS45OTE1IDE1LjkxNzFDMjMuOTQ3NCAxNC45MzI3IDIxLjUyNTkgMTMuNjAxIDIwLjAxMDUgMTIuMDk4NyIgZmlsbD0id2hpdGUiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yMC4wMTA1IDEyLjA5ODdDMTguNDkgMTAuNTg5NCAxNy4xNTk0IDguMTA4MTQgMTYuMTc5OSA2LjAxMTAzQzE2LjE1MiA2LjAwNDUxIDE2LjExNzYgNiAxNi4wNzk0IDZDMTYuMDQxMSA2IDE2LjAwNjYgNi4wMDQ1MSAxNS45Nzg4IDYuMDExMDRDMTQuOTk5NCA4LjEwODE0IDEzLjY2OTcgMTAuNTg4OSAxMi4xNDgxIDEyLjA5ODFDMTAuNjI2OSAxMy42MDcxIDguMTI1NjggMTQuOTI2NCA2LjAxMTU3IDE1Ljg5ODFDNi4wMDQ3NCAxNS45MjYxIDYgMTUuOTYxMSA2IDE2QzYgMTYuMDM4NyA2LjAwNDY4IDE2LjA3MzYgNi4wMTE0NCAxNi4xMDE0QzguMTI1MTkgMTcuMDcyOSAxMC42MjYyIDE4LjM5MTkgMTIuMTQ3NyAxOS45MDE2QzEzLjY2OTcgMjEuNDEwNyAxNC45OTk2IDIzLjg5MiAxNS45NzkxIDI1Ljk4OUMxNi4wMDY4IDI1Ljk5NTYgMTYuMDQxMSAyNiAxNi4wNzkzIDI2QzE2LjExNzUgMjYgMTYuMTUxOSAyNS45OTU0IDE2LjE3OTYgMjUuOTg5QzE3LjE1OTEgMjMuODkyIDE4LjQ4ODggMjEuNDExIDIwLjAwOTkgMTkuOTAyMU0yMC4wMDk5IDE5LjkwMjFDMjEuNTI1MyAxOC4zOTg3IDIzLjk0NjUgMTcuMDY2OSAyNS45OTE1IDE2LjA4MjRDMjUuOTk2NSAxNi4wNTkzIDI2IDE2LjAzMSAyNiAxNS45OTk3QzI2IDE1Ljk2ODQgMjUuOTk2NSAxNS45NDAzIDI1Ljk5MTUgMTUuOTE3MUMyMy45NDc0IDE0LjkzMjcgMjEuNTI1OSAxMy42MDEgMjAuMDEwNSAxMi4wOTg3IiBzdHJva2U9IiM0OTFEOEIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgbWFzaz0idXJsKCNwYXRoLTItb3V0c2lkZS0xXzE4NV82KSIvPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {
        "group": "model"
      },
      {
        "group": "model"
      },
      {
        "group": "model"
      },
      {
        "group": "model"
      },
      {
        "group": "model"
      },
      {
        "group": "model"
      },
      {
        "group": "model"
      },
      {
        "group": "model"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "context"
      },
      {
        "group": "systemPrompt"
      },
      {
        "group": "systemPrompt"
      },
      {
        "group": "userPrompt"
      },
      {
        "group": "userPrompt"
      },
      {
        "group": "userPrompt",
        "tooltip": "Referenced documents will be transparently added to the user prompt."
      },
      {
        "group": "tools"
      },
      {
        "group": "tools"
      },
      {
        "group": "memory"
      },
      {
        "group": "guardrails"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.AWSSQS.startmessage.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "queueProperties",
          "label": "Queue properties"
        },
        {
          "id": "messagePollingProperties",
          "label": "Message polling properties"
        },
        {
          "id": "input",
          "label": "Use next attribute names for activation condition"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 40 40' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/32/Arch_AWS-Simple-Queue-Service_32%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/32/Arch_AWS-Simple-Queue-Service_32' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/32/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='40' height='40'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M14.3422051,22.3493786 L15.8466767,20.9061074 C15.9428347,20.8141539 15.9969235,20.687218 15.9999285,20.5552846 C16.0019317,20.4223517 15.9518495,20.2934168 15.8596981,20.1984648 L14.3552264,18.6432502 L13.6350433,19.3378994 L14.311154,20.037546 L11.9913429,20.037546 L11.9913429,21.0370413 L14.2650783,21.0370413 L13.6480647,21.6287425 L14.3422051,22.3493786 Z M26.3579452,22.3533765 L27.9074909,20.9001104 C28.0066538,20.8081569 28.0627459,20.679222 28.0647492,20.5442901 C28.0667525,20.4093583 28.0136653,20.2784244 27.918509,20.1834724 L26.3689633,18.6372532 L25.6607999,19.3438963 L26.3549403,20.037546 L24.0110896,20.037546 L24.0110896,21.0370413 L26.2988481,21.0370413 L25.671818,21.6247445 L26.3579452,22.3533765 Z M17.5875367,23.3608678 C18.3387708,23.0570212 19.1621235,22.8941035 20.0045074,22.8941035 C20.8468913,22.8941035 21.670244,23.0570212 22.4214781,23.3608678 C21.7523789,21.5897622 21.7523789,19.3898731 22.4214781,17.6187675 C20.9190098,18.2264606 19.090005,18.2264606 17.5875367,17.6187675 C18.2566359,19.3898731 18.2566359,21.5897622 17.5875367,23.3608678 L17.5875367,23.3608678 Z M15.6443443,25.3408679 C15.546183,25.2439168 15.4971024,25.1159814 15.4971024,24.988046 C15.4971024,24.8601106 15.546183,24.7321753 15.6443443,24.6342247 C17.5845317,22.6982024 17.5845317,18.2824324 15.6443443,16.3454106 C15.546183,16.2484595 15.4971024,16.1205241 15.4971024,15.9925912 C15.4971024,15.8646534 15.546183,15.736718 15.6443443,15.6387674 C15.8396652,15.4438659 16.1571868,15.4438659 16.3525077,15.6387674 C17.2740216,16.5583031 18.6052086,17.0860366 20.0045074,17.0860366 C21.4048079,17.0860366 22.7359948,16.5583031 23.6575088,15.6387674 C23.8528296,15.4438659 24.1703513,15.4438659 24.3656722,15.6387674 C24.4628318,15.736718 24.5119124,15.8646534 24.5119124,15.9925912 C24.5119124,16.1205241 24.4628318,16.2484595 24.3656722,16.3454106 C22.4244831,18.2824324 22.4244831,22.6982024 24.3656722,24.6342247 C24.4628318,24.7321753 24.5119124,24.8601106 24.5119124,24.988046 C24.5119124,25.1159814 24.4628318,25.2439168 24.3656722,25.3408679 C24.2675109,25.4388184 24.1393003,25.4877937 24.0110896,25.4877937 C23.882879,25.4877937 23.7546684,25.4388184 23.6575088,25.3408679 C22.7359948,24.4213322 21.4048079,23.8935987 20.0045074,23.8935987 C18.6052086,23.8935987 17.2740216,24.4213322 16.3525077,25.3408679 C16.1571868,25.5357694 15.8396652,25.5357694 15.6443443,25.3408679 L15.6443443,25.3408679 Z M32.5421049,19.4358499 C32.236603,19.1320033 31.8369464,18.9800801 31.4362882,18.9800801 C31.0366316,18.9800801 30.636975,19.1320033 30.3314731,19.4358499 C29.721471,20.0445425 29.721471,21.0340428 30.3314731,21.6417359 C30.9414753,22.2504285 31.9321027,22.2504285 32.5421049,21.6417359 C33.1511054,21.0340428 33.1511054,20.0445425 32.5421049,19.4358499 L32.5421049,19.4358499 Z M33.2502683,22.3493786 C32.7504472,22.8481267 32.0933677,23.0980005 31.4362882,23.0980005 C30.7802103,23.0980005 30.1231309,22.8481267 29.6233097,22.3493786 C28.6236675,21.3508828 28.6236675,19.7277025 29.6233097,18.7292068 C30.622952,17.7317105 32.250626,17.7317105 33.2502683,18.7292068 C34.2499106,19.7277025 34.2499106,21.3508828 33.2502683,22.3493786 L33.2502683,22.3493786 Z M9.66852687,19.4468443 C9.36302497,19.1429978 8.96336839,18.9910745 8.56271017,18.9910745 C8.16305359,18.9910745 7.76339701,19.1429978 7.45789511,19.4468443 C6.84889461,20.055537 6.84889461,21.0450373 7.45789511,21.6527304 C8.06789726,22.261423 9.05852472,22.261423 9.66852687,21.6527304 C10.2775274,21.0450373 10.2775274,20.055537 9.66852687,19.4468443 L9.66852687,19.4468443 Z M10.3766903,22.3593735 C9.87686914,22.8581217 9.21978965,23.1079955 8.56271017,23.1079955 C7.90663232,23.1079955 7.24955284,22.8581217 6.7497317,22.3593735 C5.75008943,21.3618773 5.75008943,19.738697 6.7497317,18.7402012 C7.74937397,17.7427049 9.37704801,17.7427049 10.3766903,18.7402012 C11.3763325,19.738697 11.3763325,21.3618773 10.3766903,22.3593735 L10.3766903,22.3593735 Z M27.4337125,28.9100654 C25.4364313,30.903059 22.7820705,32.0005047 19.9574301,32.0005047 C17.1327896,32.0005047 14.4784288,30.903059 12.4821492,28.9100654 C11.165987,27.5977281 10.4077413,26.469298 9.94498104,25.1359713 L8.99842599,25.4628063 C9.50726193,26.9290658 10.3626672,28.2104187 11.7739858,29.6167086 C13.9585748,31.7986067 16.8663519,33 19.9574301,33 C23.0495099,33 25.9562853,31.7986067 28.1418759,29.6167086 C29.2827502,28.4782835 30.4206196,27.1869356 31.0115905,25.4608073 L30.0640338,25.1379703 C29.5391715,26.6701966 28.4894469,27.8565974 27.4337125,28.9100654 L27.4337125,28.9100654 Z M9.94498104,15.8596559 L8.99842599,15.5318214 C9.51026687,14.0645624 10.3656722,12.7832095 11.7759891,11.3759202 C16.2863991,6.87519304 23.6264578,6.87419354 28.1378694,11.3759202 C29.2186449,12.4533761 30.4035916,13.7897012 31.0115905,15.5318214 L30.0640338,15.8596559 C29.5241468,14.3094387 28.4293482,13.0800596 27.4297059,12.0825633 C25.434428,10.0915688 22.7810689,8.99612197 19.9574301,8.99612197 C17.1337912,8.99612197 14.4804321,10.0915688 12.4851542,12.0825633 C11.1870215,13.3779092 10.4037347,14.5423211 9.94498104,15.8596559 L9.94498104,15.8596559 Z' id='AWS-Simple-Queue-Service_Icon_32_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "messagePollingProperties"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.agenticai.a2a.client.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "connection",
          "label": "HTTP Connection",
          "tooltip": "Configure the HTTP connection to the remote A2A server for retrieving the Agent Card. Setting authentication headers is not supported yet."
        },
        {
          "id": "connectorMode",
          "label": "Connector mode",
          "tooltip": "Select how this connector is used. When the connector is used as an AI agent tool, select the <code>AI Agent tool</code> mode."
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMTguNSIgdmlld0JveD0iMyA5IDMwIDE4LjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTguNyAxNC43MjVDOC41MTY2NyAxNC45MDgzIDguMjgzMzMgMTUgOCAxNUM3LjcxNjY3IDE1IDcuNDc1IDE0LjkwODMgNy4yNzUgMTQuNzI1QzcuMDkxNjcgMTQuNTI1IDcgMTQuMjgzMyA3IDE0QzcgMTMuNzE2NyA3LjA5MTY3IDEzLjQ4MzMgNy4yNzUgMTMuM0M3LjQ3NSAxMy4xIDcuNzE2NjcgMTMgOCAxM0M4LjI4MzMzIDEzIDguNTE2NjcgMTMuMSA4LjcgMTMuM0M4LjkgMTMuNDgzMyA5IDEzLjcxNjcgOSAxNEM5IDE0LjI4MzMgOC45IDE0LjUyNSA4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMTQuNyAxNC43MjVDMTQuNTE2NyAxNC45MDgzIDE0LjI4MzMgMTUgMTQgMTVDMTMuNzE2NyAxNSAxMy40NzUgMTQuOTA4MyAxMy4yNzUgMTQuNzI1QzEzLjA5MTcgMTQuNTI1IDEzIDE0LjI4MzMgMTMgMTRDMTMgMTMuNzE2NyAxMy4wOTE3IDEzLjQ4MzMgMTMuMjc1IDEzLjNDMTMuNDc1IDEzLjEgMTMuNzE2NyAxMyAxNCAxM0MxNC4yODMzIDEzIDE0LjUxNjcgMTMuMSAxNC43IDEzLjNDMTQuOSAxMy40ODMzIDE1IDEzLjcxNjcgMTUgMTRDMTUgMTQuMjgzMyAxNC45IDE0LjUyNSAxNC43IDE0LjcyNVoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTIyLjcgMTQuNzI1QzIyLjUxNjcgMTQuOTA4MyAyMi4yODMzIDE1IDIyIDE1QzIxLjcxNjcgMTUgMjEuNDc1IDE0LjkwODMgMjEuMjc1IDE0LjcyNUMyMS4wOTE3IDE0LjUyNSAyMSAxNC4yODMzIDIxIDE0QzIxIDEzLjcxNjcgMjEuMDkxNyAxMy40ODMzIDIxLjI3NSAxMy4zQzIxLjQ3NSAxMy4xIDIxLjcxNjcgMTMgMjIgMTNDMjIuMjgzMyAxMyAyMi41MTY3IDEzLjEgMjIuNyAxMy4zQzIyLjkgMTMuNDgzMyAyMyAxMy43MTY3IDIzIDE0QzIzIDE0LjI4MzMgMjIuOSAxNC41MjUgMjIuNyAxNC43MjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0yOC43IDE0LjcyNUMyOC41MTY3IDE0LjkwODMgMjguMjgzMyAxNSAyOCAxNUMyNy43MTY3IDE1IDI3LjQ3NSAxNC45MDgzIDI3LjI3NSAxNC43MjVDMjcuMDkxNyAxNC41MjUgMjcgMTQuMjgzMyAyNyAxNEMyNyAxMy43MTY3IDI3LjA5MTcgMTMuNDgzMyAyNy4yNzUgMTMuM0MyNy40NzUgMTMuMSAyNy43MTY3IDEzIDI4IDEzQzI4LjI4MzMgMTMgMjguNTE2NyAxMy4xIDI4LjcgMTMuM0MyOC45IDEzLjQ4MzMgMjkgMTMuNzE2NyAyOSAxNEMyOSAxNC4yODMzIDI4LjkgMTQuNTI1IDI4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTUgMTRDNSAxMi4zNDMxIDYuMzQzMTUgMTEgOCAxMUgxNEMxNC43NzYgMTEgMTUuMjg0IDExLjE1MzcgMTUuNjQgMTEuMzgxOEMxNS44NTg5IDEwLjc5NCAxNi4xNTE3IDEwLjE3MDkgMTYuNTU1IDkuNTk3OTVDMTUuODc5NyA5LjIxMTUzIDE1LjAzODYgOSAxNCA5SDhDNS4yMzg1OCA5IDMgMTEuMjM4NiAzIDE0QzMgMTYuNzYxMiA1LjIzNzU5IDE5IDcuOTk5MjYgMTlIMTRDMTUuNzYzNCAxOSAxNi45NTczIDE4LjM5MDIgMTcuNzM3NSAxNy4zNUMxOC40MjI4IDE2LjQzNjMgMTguNzE0OCAxNS4yNjYgMTguOTQ4MyAxNC4zMjk5TDE4Ljk3MDEgMTQuMjQyNUMxOS4yMzI3IDEzLjE5MjQgMTkuNDQ0MiAxMi40MDc3IDE5Ljg2MjUgMTEuODVDMjAuMjA3MyAxMS4zOTAyIDIwLjc2MzQgMTEgMjIgMTFIMjguMDAwNUMyOS42NTcyIDExIDMxIDEyLjM0MyAzMSAxNEMzMSAxNS42NTY5IDI5LjY1NjkgMTcgMjggMTdIMjJDMjEuMjI0IDE3IDIwLjcxNiAxNi44NDYzIDIwLjM2IDE2LjYxODJDMjAuMTQxMSAxNy4yMDYgMTkuODQ4MyAxNy44MjkxIDE5LjQ0NSAxOC40MDJDMjAuMTIwMyAxOC43ODg1IDIwLjk2MTQgMTkgMjIgMTlIMjhDMzAuNzYxNCAxOSAzMyAxNi43NjE0IDMzIDE0QzMzIDExLjIzODggMzAuNzYyMSA5IDI4LjAwMDUgOUgyMkMyMC4yMzY2IDkgMTkuMDQyNyA5LjYwOTc5IDE4LjI2MjUgMTAuNjVDMTcuNTc3MiAxMS41NjM3IDE3LjI4NTIgMTIuNzM0IDE3LjA1MTcgMTMuNjcwMUwxNy4wMjk5IDEzLjc1NzVDMTYuNzY3MyAxNC44MDc2IDE2LjU1NTggMTUuNTkyMyAxNi4xMzc1IDE2LjE1QzE1Ljc5MjcgMTYuNjA5OCAxNS4yMzY2IDE3IDE0IDE3SDcuOTk5MjZDNi4zNDI2NSAxNyA1IDE1LjY1NzEgNSAxNFoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTcgMjMuNUM2LjcxNjY3IDIzLjUgNi40NzUgMjMuNDA4MyA2LjI3NSAyMy4yMjVDNi4wOTE2NyAyMy4wMjUgNiAyMi43ODMzIDYgMjIuNUM2IDIyLjIxNjcgNi4wOTE2NyAyMS45ODMzIDYuMjc1IDIxLjhDNi40NzUgMjEuNiA2LjcxNjY3IDIxLjUgNyAyMS41SDEyQzEyLjI4MzMgMjEuNSAxMi41MTY3IDIxLjYgMTIuNyAyMS44QzEyLjkgMjEuOTgzMyAxMyAyMi4yMTY3IDEzIDIyLjVDMTMgMjIuNzgzMyAxMi45IDIzLjAyNSAxMi43IDIzLjIyNUMxMi41MTY3IDIzLjQwODMgMTIuMjgzMyAyMy41IDEyIDIzLjVIN1pNNSAyNy41QzQuNzE2NjcgMjcuNSA0LjQ3NSAyNy40MDgzIDQuMjc1IDI3LjIyNUM0LjA5MTY3IDI3LjAyNSA0IDI2Ljc4MzMgNCAyNi41QzQgMjYuMjE2NyA0LjA5MTY3IDI1Ljk4MzMgNC4yNzUgMjUuOEM0LjQ3NSAyNS42IDQuNzE2NjcgMjUuNSA1IDI1LjVIOEM4LjI4MzMzIDI1LjUgOC41MTY2NyAyNS42IDguNyAyNS44QzguOSAyNS45ODMzIDkgMjYuMjE2NyA5IDI2LjVDOSAyNi43ODMzIDguOSAyNy4wMjUgOC43IDI3LjIyNUM4LjUxNjY3IDI3LjQwODMgOC4yODMzMyAyNy41IDggMjcuNUg1Wk0xMiAyNy41QzExLjcxNjcgMjcuNSAxMS40NzUgMjcuNDA4MyAxMS4yNzUgMjcuMjI1QzExLjA5MTcgMjcuMDI1IDExIDI2Ljc4MzMgMTEgMjYuNUMxMSAyNi4yMTY3IDExLjA5MTcgMjUuOTgzMyAxMS4yNzUgMjUuOEMxMS40NzUgMjUuNiAxMS43MTY3IDI1LjUgMTIgMjUuNUgyMEMyMC4yODMzIDI1LjUgMjAuNTE2NyAyNS42IDIwLjcgMjUuOEMyMC45IDI1Ljk4MzMgMjEgMjYuMjE2NyAyMSAyNi41QzIxIDI2Ljc4MzMgMjAuOSAyNy4wMjUgMjAuNyAyNy4yMjVDMjAuNTE2NyAyNy40MDgzIDIwLjI4MzMgMjcuNSAyMCAyNy41SDEyWk0yOCAyNy41QzI3LjcxNjcgMjcuNSAyNy40NzUgMjcuNDA4MyAyNy4yNzUgMjcuMjI1QzI3LjA5MTcgMjcuMDI1IDI3IDI2Ljc4MzMgMjcgMjYuNUMyNyAyNi4yMTY3IDI3LjA5MTcgMjUuOTgzMyAyNy4yNzUgMjUuOEMyNy40NzUgMjUuNiAyNy43MTY3IDI1LjUgMjggMjUuNUgzMkMzMi4yODMzIDI1LjUgMzIuNTE2NyAyNS42IDMyLjcgMjUuOEMzMi45IDI1Ljk4MzMgMzMgMjYuMjE2NyAzMyAyNi41QzMzIDI2Ljc4MzMzMi45IDI3LjAyNSAzMi43IDI3LjIyNUMzMi41MTY3IDI3LjQwODMgMzIuMjgzMyAyNy41IDMyIDI3LjVIMjhaTTE2IDIzLjVDMTUuNzE2NyAyMy41IDE1LjQ3NSAyMy40MDgzIDE1LjI3NSAyMy4yMjVDMTUuMDkxNyAyMy4wMjUgMTUgMjIuNzgzMyAxNSAyMi41QzE1IDIyLjIxNjcgMTUuMDkxNyAyMS45ODMzIDE1LjI3NSAyMS44QzE1LjQ3NSAyMS42IDE1LjcxNjcgMjEuNSAxNiAyMS41QzE2LjI4MzMgMjEuNSAxNi41MTY3IDIxLjYgMTYuNyAyMS44QzE2LjkgMjEuOTgzMyAxNyAyMi4yMTY3IDE3IDIyLjVDMTcgMjIuNzgzMyAxNi45IDIzLjAyNSAxNi43IDIzLjIyNUMxNi41MTY3IDIzLjQwODMgMTYuMjgzMyAyMy41IDE2IDIzLjVaTTI0IDI3LjVDMjMuNzE2NyAyNy41IDIzLjQ3NSAyNy40MDgzIDIzLjI3NSAyNy4yMjVDMjMuMDkxNyAyNy4wMjUgMjMgMjYuNzgzMyAyMyAyNi41QzIzIDI2LjIxNjcgMjMuMDkxNyAyNS45ODMzIDIzLjI3NSAyNS44QzIzLjQ3NSAyNS42IDIzLjcxNjcgMjUuNSAyNCAyNS41QzI0LjI4MzMgMjUuNSAyNC41MTY3IDI1LjYgMjQuNyAyNS44QzI0LjkgMjUuOTgzMyAyNSAyNi4yMTY3IDI1IDI2LjVDMjUgMjYuNzgzMyAyNC45IDI3LjAyNSAyNC43IDI3LjIyNUMyNC41MTY3IDI3LjQwODMgMjQuMjgzMyAyNy41IDI0IDI3LjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0xOS4yNzUgMjMuMjI1QzE5LjQ3NSAyMy40MDgzIDE5LjcxNjcgMjMuNSAyMCAyMy41SDIzQzIzLjI4MzMgMjMuNSAyMy41MTY3IDIzLjQwODMgMjMuNyAyMy4yMjVDMjMuOSAyMy4wMjUgMjQgMjIuNzgzMyAyNCAyMi41QzI0IDIyLjIxNjcgMjMuOSAyMS45ODMzIDIzLjcgMjEuOEMyMy41MTY3IDIxLjYgMjMuMjgzMyAyMS41IDIzIDIxLjVIMjBDMTkuNzE2NyAyMS41IDE5LjQ3NSAyMS42IDE5LjI3NSAyMS44QzE5LjA5MTcgMjEuOTgzMyAxOSAyMi4yMTY3IDE5IDIyLjVDMTkgMjIuNzgzMyAxOS4wOTE3IDIzLjAyNSAxOS4yNzUgMjMuMjI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMjYuMjc1IDIzLjIyNUMyNi40NzUgMjMuNDA4MyAyNi43MTY3IDIzLjUgMjcgMjMuNUgzMEMzMC4yODMzIDIzLjUgMzAuNTE2NyAyMy40MDgzIDMwLjcgMjMuMjI1QzMwLjkgMjMuMDI1IDMxIDIyLjc4MzMgMzEgMjIuNUMzMSAyMi4yMTY3IDMwLjkgMjEuOTgzMyAzMC43IDIxLjhDMzAuNTE2NyAyMS42IDMwLjI4MzMgMjEuNSAzMCAyMS41SDI3QzI2LjcxNjcgMjEuNSAyNi40NzUgMjEuNiAyNi4yNzUgMjEuOEMyNi4wOTE3IDIxLjk4MzMgMjYgMjIuMjE2NyAyNiAyMi41QzI2IDIyLjc4MzMgMjYuMDkxNyAyMy4wMjUgMjYuMjc1IDIzLjIyNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connectorMode"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation",
        "tooltip": "Context IDs are generated by the remote server. Omit if this is the first message or if this message starts a new context."
      },
      {
        "group": "operation",
        "tooltip": "Task IDs are generated by the remote server. Omit if the message is not yet part of a specific task."
      },
      {
        "group": "operation"
      },
      {
        "group": "operation",
        "tooltip": "Referenced documents that will be added to the message."
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.message.intermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "default",
          "label": "Properties"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZwogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHdpZHRoPSIyMDAwIgogICBoZWlnaHQ9IjIwMDAiCiAgIHZpZXdCb3g9IjAgMCAyMDAwIDIwMDAiCiAgIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KICA8cGF0aAogICAgIHN0eWxlPSJjb2xvcjojMDAwMDAwIgogICAgIGQ9Im0gMCwyODQgMjAwMCwwIC0xMDAwLDU1NCB6Ii8+CiAgPHBhdGgKICAgICBzdHlsZT0iY29sb3I6IzAwMDAwMCIKICAgICBkPSJtIDAsNDUyIDEwMDAsNTQ4IDEwMDAsLTU0OCAwLDEwOTYgLTIwMDAsMCB6Ii8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.agenticai.mcp.client.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "client",
          "label": "MCP Client"
        },
        {
          "id": "tools",
          "label": "Tools"
        },
        {
          "id": "operation",
          "label": "Operation",
          "openByDefault": false
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgICA8cGF0aCBkPSJNMjUgOTcuODUyOEw5Mi44ODIzIDI5Ljk3MDZDMTAyLjI1NSAyMC41OTggMTE3LjQ1MSAyMC41OTggMTI2LjgyMyAyOS45NzA2VjI5Ljk3MDZDMTM2LjE5NiAzOS4zNDMxIDEzNi4xOTYgNTQuNTM5MSAxMjYuODIzIDYzLjkxMTdMNzUuNTU4MSAxMTUuMTc3IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgIDxwYXRoIGQ9Ik03Ni4yNjUzIDExNC40N0wxMjYuODIzIDYzLjkxMTdDMTM2LjE5NiA1NC41MzkxIDE1MS4zOTIgNTQuNTM5MSAxNjAuNzY1IDYzLjkxMTdMMTYxLjExOCA2NC4yNjUyQzE3MC40OTEgNzMuNjM3OCAxNzAuNDkxIDg4LjgzMzggMTYxLjExOCA5OC4yMDYzTDk5LjcyNDggMTU5LjZDOTYuNjAwNiAxNjIuNzI0IDk2LjYwMDYgMTY3Ljc4OSA5OS43MjQ4IDE3MC45MTNMMTEyLjMzMSAxODMuNTIiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgPHBhdGggZD0iTTEwOS44NTMgNDYuOTQxMUw1OS42NDgyIDk3LjE0NTdDNTAuMjc1NyAxMDYuNTE4IDUwLjI3NTcgMTIxLjcxNCA1OS42NDgyIDEzMS4wODdWMTMxLjA4N0M2OS4wMjA4IDE0MC40NTkgODQuMjE2OCAxNDAuNDU5IDkzLjU4OTQgMTMxLjA4N0wxNDMuNzk0IDgwLjg4MjIiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "client"
      },
      {
        "group": "tools"
      },
      {
        "group": "tools"
      },
      {
        "group": "operation",
        "tooltip": "The method to be called on the MCP server. See the <a href=\"https://modelcontextprotocol.io/specification/2024-11-05/server\">MCP specification</a> for a list of available methods.<br><br>Currently supported:<br><code>tools/list</code>, <code>tools/call</code>"
      },
      {
        "group": "operation",
        "tooltip": "The parameter structure depends on the method being called. See the <a href=\"https://modelcontextprotocol.io/specification/2024-11-05/server/tools#calling-tools\">MCP specification</a> for an example of the parameters for the <code>tools/call</code> method."
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.inbound.RabbitMQ.Boundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "routing",
          "label": "Routing"
        },
        {
          "id": "subscription",
          "label": "Subscription"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='-7.5 0 271 271' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M245.44 108.308h-85.09a7.738 7.738 0 0 1-7.735-7.734v-88.68C152.615 5.327 147.29 0 140.726 0h-30.375c-6.568 0-11.89 5.327-11.89 11.894v88.143c0 4.573-3.697 8.29-8.27 8.31l-27.885.133c-4.612.025-8.359-3.717-8.35-8.325l.173-88.241C54.144 5.337 48.817 0 42.24 0H11.89C5.321 0 0 5.327 0 11.894V260.21c0 5.834 4.726 10.56 10.555 10.56H245.44c5.834 0 10.56-4.726 10.56-10.56V118.868c0-5.834-4.726-10.56-10.56-10.56zm-39.902 93.233c0 7.645-6.198 13.844-13.843 13.844H167.69c-7.646 0-13.844-6.199-13.844-13.844v-24.005c0-7.646 6.198-13.844 13.844-13.844h24.005c7.645 0 13.843 6.198 13.843 13.844v24.005z' fill='%23F60'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.Slack.MessageStartEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20%20viewBox%3D%220%200%20127%20127%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d%3D%22M27.2%2080c0%207.3-5.9%2013.2-13.2%2013.2C6.7%2093.2.8%2087.3.8%2080c0-7.3%205.9-13.2%2013.2-13.2h13.2V80zm6.6%200c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2v33c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V80z%22%20fill%3D%22%23E01E5A%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M47%2027c-7.3%200-13.2-5.9-13.2-13.2C33.8%206.5%2039.7.6%2047%20.6c7.3%200%2013.2%205.9%2013.2%2013.2V27H47zm0%206.7c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H13.9C6.6%2060.1.7%2054.2.7%2046.9c0-7.3%205.9-13.2%2013.2-13.2H47z%22%20fill%3D%22%2336C5F0%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M99.9%2046.9c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H99.9V46.9zm-6.6%200c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V13.8C66.9%206.5%2072.8.6%2080.1.6c7.3%200%2013.2%205.9%2013.2%2013.2v33.1z%22%20fill%3D%22%232EB67D%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M80.1%2099.8c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3%200-13.2-5.9-13.2-13.2%200-7.3%205.9-13.2%2013.2-13.2h33.1c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H80.1z%22%20fill%3D%22%23ECB22E%22%2F%3E%0A%3C%2Fsvg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.Slack.IntermediateCatchEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20%20viewBox%3D%220%200%20127%20127%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d%3D%22M27.2%2080c0%207.3-5.9%2013.2-13.2%2013.2C6.7%2093.2.8%2087.3.8%2080c0-7.3%205.9-13.2%2013.2-13.2h13.2V80zm6.6%200c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2v33c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V80z%22%20fill%3D%22%23E01E5A%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M47%2027c-7.3%200-13.2-5.9-13.2-13.2C33.8%206.5%2039.7.6%2047%20.6c7.3%200%2013.2%205.9%2013.2%2013.2V27H47zm0%206.7c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H13.9C6.6%2060.1.7%2054.2.7%2046.9c0-7.3%205.9-13.2%2013.2-13.2H47z%22%20fill%3D%22%2336C5F0%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M99.9%2046.9c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H99.9V46.9zm-6.6%200c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V13.8C66.9%206.5%2072.8.6%2080.1.6c7.3%200%2013.2%205.9%2013.2%2013.2v33.1z%22%20fill%3D%22%232EB67D%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M80.1%2099.8c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3%200-13.2-5.9-13.2-13.2%200-7.3%205.9-13.2%2013.2-13.2h33.1c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H80.1z%22%20fill%3D%22%23ECB22E%22%2F%3E%0A%3C%2Fsvg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.RabbitMQ.Receive.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "routing",
          "label": "Routing"
        },
        {
          "id": "subscription",
          "label": "Subscription"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxOCcgaGVpZ2h0PScxOCcgdmlld0JveD0nLTcuNSAwIDI3MSAyNzEnIHByZXNlcnZlQXNwZWN0UmF0aW89J3hNaWRZTWlkJz4KICAgIDxwYXRoIGQ9J00yNDUuNDQgMTA4LjMwOGgtODUuMDlhNy43MzggNy43MzggMCAwIDEtNy43MzUtNy43MzR2LTg4LjY4QzE1Mi42MTUgNS4zMjcgMTQ3LjI5IDAgMTQwLjcyNiAwaC0zMC4zNzVjLTYuNTY4IDAtMTEuODkgNS4zMjctMTEuODkgMTEuODk0djg4LjE0M2MwIDQuNTczLTMuNjk3IDguMjktOC4yNyA4LjMxbC0yNy44ODUuMTMzYy00LjYxMi4wMjUtOC4zNTktMy43MTctOC4zNS04LjMyNWwuMTczLTg4LjI0MUM1NC4xNDQgNS4zMzcgNDguODE3IDAgNDIuMjQgMEgxMS44OUM1LjMyMSAwIDAgNS4zMjcgMCAxMS44OTRWMjYwLjIxYzAgNS44MzQgNC43MjYgMTAuNTYgMTAuNTU1IDEwLjU2SDI0NS40NGM1LjgzNCAwIDEwLjU2LTQuNzI2IDEwLjU2LTEwLjU2VjExOC44NjhjMC01LjgzNC00LjcyNi0xMC41Ni0xMC41Ni0xMC41NnptLTM5LjkwMiA5My4yMzNjMCA3LjY0NS02LjE5OCAxMy44NDQtMTMuODQzIDEzLjg0NEgxNjcuNjljLTcuNjQ2IDAtMTMuODQ0LTYuMTk5LTEzLjg0NC0xMy44NDR2LTI0LjAwNWMwLTcuNjQ2IDYuMTk4LTEzLjg0NCAxMy44NDQtMTMuODQ0aDI0LjAwNWM3LjY0NSAwIDEzLjg0MyA2LjE5OCAxMy44NDMgMTMuODQ0djI0LjAwNXonCiAgICAgICAgICBmaWxsPScjRjYwJy8+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.HubSpot.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": [
          "create contact",
          "update contact",
          "delete contact",
          "get contact",
          "get all contacts",
          "search contact",
          "create company",
          "get company",
          "get all companies",
          "search company",
          "delete company",
          "get all deals",
          "get deal",
          "search deal",
          "delete deal",
          "batch read contacts",
          "get all contacts of a company",
          "add element to list",
          "enroll contact to a workflow",
          "submit form"
        ]
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "server",
          "label": "Server"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "parameters",
          "label": "Parameters"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "url",
          "label": "URL"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI1MDAiIHZpZXdCb3g9IjYuMjA4NTYyODMgLjY0NDk4ODI0IDI0NC4yNjk0MzcxNyAyNTEuMjQ3MDExNzYiIHdpZHRoPSIyNTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im0xOTEuMzg1IDg1LjY5NHYtMjkuNTA2YTIyLjcyMiAyMi43MjIgMCAwIDAgMTMuMTAxLTIwLjQ4di0uNjc3YzAtMTIuNTQ5LTEwLjE3My0yMi43MjItMjIuNzIxLTIyLjcyMmgtLjY3OGMtMTIuNTQ5IDAtMjIuNzIyIDEwLjE3My0yMi43MjIgMjIuNzIydi42NzdhMjIuNzIyIDIyLjcyMiAwIDAgMCAxMy4xMDEgMjAuNDh2MjkuNTA2YTY0LjM0MiA2NC4zNDIgMCAwIDAgLTMwLjU5NCAxMy40N2wtODAuOTIyLTYzLjAzYy41NzctMi4wODMuODc4LTQuMjI1LjkxMi02LjM3NWEyNS42IDI1LjYgMCAxIDAgLTI1LjYzMyAyNS41NSAyNS4zMjMgMjUuMzIzIDAgMCAwIDEyLjYwNy0zLjQzbDc5LjY4NSA2Mi4wMDdjLTE0LjY1IDIyLjEzMS0xNC4yNTggNTAuOTc0Ljk4NyA3Mi43bC0yNC4yMzYgMjQuMjQzYy0xLjk2LS42MjYtNC0uOTU5LTYuMDU3LS45ODctMTEuNjA3LjAxLTIxLjAxIDkuNDIzLTIxLjAwNyAyMS4wMy4wMDMgMTEuNjA2IDkuNDEyIDIxLjAxNCAyMS4wMTggMjEuMDE3IDExLjYwNy4wMDMgMjEuMDItOS40IDIxLjAzLTIxLjAwN2EyMC43NDcgMjAuNzQ3IDAgMCAwIC0uOTg4LTYuMDU2bDIzLjk3Ni0yMy45ODVjMjEuNDIzIDE2LjQ5MiA1MC44NDYgMTcuOTEzIDczLjc1OSAzLjU2MiAyMi45MTItMTQuMzUyIDM0LjQ3NS00MS40NDYgMjguOTg1LTY3LjkxOC01LjQ5LTI2LjQ3My0yNi44NzMtNDYuNzM0LTUzLjYwMy01MC43OTJtLTkuOTM4IDk3LjA0NGEzMy4xNyAzMy4xNyAwIDEgMSAwLTY2LjMxNmMxNy44NS42MjUgMzIgMTUuMjcyIDMyLjAxIDMzLjEzNC4wMDggMTcuODYtMTQuMTI3IDMyLjUyMi0zMS45NzcgMzMuMTY1IiBmaWxsPSIjZmY3YTU5Ii8+PC9zdmc+"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "server"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "requestBody"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "url"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.GitHub.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='98' height='96' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z' fill='%2324292f'/%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {
        "group": "errors"
      }
    ]
  },
  "camunda.connectors.rpa": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "worker",
          "label": "Worker"
        },
        {
          "id": "script",
          "label": "Script"
        },
        {
          "id": "prerun",
          "label": "Pre-run"
        },
        {
          "id": "postrun",
          "label": "Post-run"
        },
        {
          "id": "input",
          "label": "Input"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyBpZD0iaWNvbiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogbm9uZTsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPHRpdGxlPmJvdDwvdGl0bGU+CiAgPHJlY3QgeD0iMTgiIHk9IjEwIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIi8+CiAgPHJlY3QgeD0iMTIiIHk9IjEwIiB3aWR0aD0iMiIgaGVpZ2h0PSIyIi8+CiAgPHBhdGggZD0iTTI2LDIwSDIxVjE4aDFhMi4wMDIzLDIuMDAyMywwLDAsMCwyLTJWMTJoMlYxMEgyNFY4YTIuMDAyMywyLjAwMjMsMCwwLDAtMi0ySDIwVjJIMThWNkgxNFYySDEyVjZIMTBBMi4wMDIzLDIuMDAyMywwLDAsMCw4LDh2Mkg2djJIOHY0YTIuMDAyMywyLjAwMjMsMCwwLDAsMiwyaDF2Mkg2YTIuMDAyMywyLjAwMjMsMCwwLDAtMiwydjhINlYyMkgyNnY4aDJWMjJBMi4wMDIzLDIuMDAyMywwLDAsMCwyNiwyMFpNMTAsOEgyMnY4SDEwWm0zLDEwaDZ2MkgxM1oiLz4KICA8cmVjdCBpZD0iX1RyYW5zcGFyZW50X1JlY3RhbmdsZV8iIGRhdGEtbmFtZT0iJmx0O1RyYW5zcGFyZW50IFJlY3RhbmdsZSZndDsiIGNsYXNzPSJjbHMtMSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIi8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "script"
      },
      {
        "group": "script"
      },
      {
        "group": "script"
      },
      {
        "group": "worker",
        "tooltip": "Define on which worker this task should be executed."
      },
      {
        "group": "worker",
        "tooltip": "<div><p>A time duration defined as ISO 8601 duration format.</p><ul><li><code>PT15S</code> - 15 seconds</li><li><code>PT1H30M</code> - 1 hour and 30 minutes</li><li><code>P14D</code> - 14 days</li></ul></div>"
      },
      {},
      {
        "group": "prerun",
        "tooltip": "Define an additional RPA script that should be executed before the main script is run."
      },
      {
        "group": "prerun"
      },
      {
        "group": "prerun"
      },
      {
        "group": "prerun"
      },
      {
        "group": "prerun"
      },
      {
        "group": "postrun",
        "tooltip": "Define an additional RPA script that should be executed after the main script is run."
      },
      {},
      {
        "group": "postrun"
      },
      {
        "group": "postrun"
      },
      {
        "group": "postrun"
      },
      {
        "group": "input"
      }
    ]
  },
  "io.camunda.connectors.inbound.KafkaIntermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "kafka",
          "label": "Kafka"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='18' height='18' viewBox='0 0 256 416' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M201.816 230.216c-16.186 0-30.697 7.171-40.634 18.461l-25.463-18.026c2.703-7.442 4.255-15.433 4.255-23.797 0-8.219-1.498-16.076-4.112-23.408l25.406-17.835c9.936 11.233 24.409 18.365 40.548 18.365 29.875 0 54.184-24.305 54.184-54.184 0-29.879-24.309-54.184-54.184-54.184-29.875 0-54.184 24.305-54.184 54.184 0 5.348.808 10.505 2.258 15.389l-25.423 17.844c-10.62-13.175-25.911-22.374-43.333-25.182v-30.64c24.544-5.155 43.037-26.962 43.037-53.019C124.171 24.305 99.862 0 69.987 0 40.112 0 15.803 24.305 15.803 54.184c0 25.708 18.014 47.246 42.067 52.769v31.038C25.044 143.753 0 172.401 0 206.854c0 34.621 25.292 63.374 58.355 68.94v32.774c-24.299 5.341-42.552 27.011-42.552 52.894 0 29.879 24.309 54.184 54.184 54.184 29.875 0 54.184-24.305 54.184-54.184 0-25.883-18.253-47.553-42.552-52.894v-32.775a69.965 69.965 0 0 0 42.6-24.776l25.633 18.143c-1.423 4.84-2.22 9.946-2.22 15.24 0 29.879 24.309 54.184 54.184 54.184 29.875 0 54.184-24.305 54.184-54.184 0-29.879-24.309-54.184-54.184-54.184zm0-126.695c14.487 0 26.27 11.788 26.27 26.271s-11.783 26.27-26.27 26.27-26.27-11.787-26.27-26.27c0-14.483 11.783-26.271 26.27-26.271zm-158.1-49.337c0-14.483 11.784-26.27 26.271-26.27s26.27 11.787 26.27 26.27c0 14.483-11.783 26.27-26.27 26.27s-26.271-11.787-26.271-26.27zm52.541 307.278c0 14.483-11.783 26.27-26.27 26.27s-26.271-11.787-26.271-26.27c0-14.483 11.784-26.27 26.271-26.27s26.27 11.787 26.27 26.27zm-26.272-117.97c-20.205 0-36.642-16.434-36.642-36.638 0-20.205 16.437-36.642 36.642-36.642 20.204 0 36.641 16.437 36.641 36.642 0 20.204-16.437 36.638-36.641 36.638zm131.831 67.179c-14.487 0-26.27-11.788-26.27-26.271s11.783-26.27 26.27-26.27 26.27 11.787 26.27 26.27c0 14.483-11.783 26.271-26.27 26.271z' style='fill:%23231f20'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.AWSSQS.intermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "queueProperties",
          "label": "Queue properties"
        },
        {
          "id": "messagePollingProperties",
          "label": "Message polling properties"
        },
        {
          "id": "input",
          "label": "Use next attribute names for activation condition"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 40 40' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/32/Arch_AWS-Simple-Queue-Service_32%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/32/Arch_AWS-Simple-Queue-Service_32' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/32/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='40' height='40'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M14.3422051,22.3493786 L15.8466767,20.9061074 C15.9428347,20.8141539 15.9969235,20.687218 15.9999285,20.5552846 C16.0019317,20.4223517 15.9518495,20.2934168 15.8596981,20.1984648 L14.3552264,18.6432502 L13.6350433,19.3378994 L14.311154,20.037546 L11.9913429,20.037546 L11.9913429,21.0370413 L14.2650783,21.0370413 L13.6480647,21.6287425 L14.3422051,22.3493786 Z M26.3579452,22.3533765 L27.9074909,20.9001104 C28.0066538,20.8081569 28.0627459,20.679222 28.0647492,20.5442901 C28.0667525,20.4093583 28.0136653,20.2784244 27.918509,20.1834724 L26.3689633,18.6372532 L25.6607999,19.3438963 L26.3549403,20.037546 L24.0110896,20.037546 L24.0110896,21.0370413 L26.2988481,21.0370413 L25.671818,21.6247445 L26.3579452,22.3533765 Z M17.5875367,23.3608678 C18.3387708,23.0570212 19.1621235,22.8941035 20.0045074,22.8941035 C20.8468913,22.8941035 21.670244,23.0570212 22.4214781,23.3608678 C21.7523789,21.5897622 21.7523789,19.3898731 22.4214781,17.6187675 C20.9190098,18.2264606 19.090005,18.2264606 17.5875367,17.6187675 C18.2566359,19.3898731 18.2566359,21.5897622 17.5875367,23.3608678 L17.5875367,23.3608678 Z M15.6443443,25.3408679 C15.546183,25.2439168 15.4971024,25.1159814 15.4971024,24.988046 C15.4971024,24.8601106 15.546183,24.7321753 15.6443443,24.6342247 C17.5845317,22.6982024 17.5845317,18.2824324 15.6443443,16.3454106 C15.546183,16.2484595 15.4971024,16.1205241 15.4971024,15.9925912 C15.4971024,15.8646534 15.546183,15.736718 15.6443443,15.6387674 C15.8396652,15.4438659 16.1571868,15.4438659 16.3525077,15.6387674 C17.2740216,16.5583031 18.6052086,17.0860366 20.0045074,17.0860366 C21.4048079,17.0860366 22.7359948,16.5583031 23.6575088,15.6387674 C23.8528296,15.4438659 24.1703513,15.4438659 24.3656722,15.6387674 C24.4628318,15.736718 24.5119124,15.8646534 24.5119124,15.9925912 C24.5119124,16.1205241 24.4628318,16.2484595 24.3656722,16.3454106 C22.4244831,18.2824324 22.4244831,22.6982024 24.3656722,24.6342247 C24.4628318,24.7321753 24.5119124,24.8601106 24.5119124,24.988046 C24.5119124,25.1159814 24.4628318,25.2439168 24.3656722,25.3408679 C24.2675109,25.4388184 24.1393003,25.4877937 24.0110896,25.4877937 C23.882879,25.4877937 23.7546684,25.4388184 23.6575088,25.3408679 C22.7359948,24.4213322 21.4048079,23.8935987 20.0045074,23.8935987 C18.6052086,23.8935987 17.2740216,24.4213322 16.3525077,25.3408679 C16.1571868,25.5357694 15.8396652,25.5357694 15.6443443,25.3408679 L15.6443443,25.3408679 Z M32.5421049,19.4358499 C32.236603,19.1320033 31.8369464,18.9800801 31.4362882,18.9800801 C31.0366316,18.9800801 30.636975,19.1320033 30.3314731,19.4358499 C29.721471,20.0445425 29.721471,21.0340428 30.3314731,21.6417359 C30.9414753,22.2504285 31.9321027,22.2504285 32.5421049,21.6417359 C33.1511054,21.0340428 33.1511054,20.0445425 32.5421049,19.4358499 L32.5421049,19.4358499 Z M33.2502683,22.3493786 C32.7504472,22.8481267 32.0933677,23.0980005 31.4362882,23.0980005 C30.7802103,23.0980005 30.1231309,22.8481267 29.6233097,22.3493786 C28.6236675,21.3508828 28.6236675,19.7277025 29.6233097,18.7292068 C30.622952,17.7317105 32.250626,17.7317105 33.2502683,18.7292068 C34.2499106,19.7277025 34.2499106,21.3508828 33.2502683,22.3493786 L33.2502683,22.3493786 Z M9.66852687,19.4468443 C9.36302497,19.1429978 8.96336839,18.9910745 8.56271017,18.9910745 C8.16305359,18.9910745 7.76339701,19.1429978 7.45789511,19.4468443 C6.84889461,20.055537 6.84889461,21.0450373 7.45789511,21.6527304 C8.06789726,22.261423 9.05852472,22.261423 9.66852687,21.6527304 C10.2775274,21.0450373 10.2775274,20.055537 9.66852687,19.4468443 L9.66852687,19.4468443 Z M10.3766903,22.3593735 C9.87686914,22.8581217 9.21978965,23.1079955 8.56271017,23.1079955 C7.90663232,23.1079955 7.24955284,22.8581217 6.7497317,22.3593735 C5.75008943,21.3618773 5.75008943,19.738697 6.7497317,18.7402012 C7.74937397,17.7427049 9.37704801,17.7427049 10.3766903,18.7402012 C11.3763325,19.738697 11.3763325,21.3618773 10.3766903,22.3593735 L10.3766903,22.3593735 Z M27.4337125,28.9100654 C25.4364313,30.903059 22.7820705,32.0005047 19.9574301,32.0005047 C17.1327896,32.0005047 14.4784288,30.903059 12.4821492,28.9100654 C11.165987,27.5977281 10.4077413,26.469298 9.94498104,25.1359713 L8.99842599,25.4628063 C9.50726193,26.9290658 10.3626672,28.2104187 11.7739858,29.6167086 C13.9585748,31.7986067 16.8663519,33 19.9574301,33 C23.0495099,33 25.9562853,31.7986067 28.1418759,29.6167086 C29.2827502,28.4782835 30.4206196,27.1869356 31.0115905,25.4608073 L30.0640338,25.1379703 C29.5391715,26.6701966 28.4894469,27.8565974 27.4337125,28.9100654 L27.4337125,28.9100654 Z M9.94498104,15.8596559 L8.99842599,15.5318214 C9.51026687,14.0645624 10.3656722,12.7832095 11.7759891,11.3759202 C16.2863991,6.87519304 23.6264578,6.87419354 28.1378694,11.3759202 C29.2186449,12.4533761 30.4035916,13.7897012 31.0115905,15.5318214 L30.0640338,15.8596559 C29.5241468,14.3094387 28.4293482,13.0800596 27.4297059,12.0825633 C25.434428,10.0915688 22.7810689,8.99612197 19.9574301,8.99612197 C17.1337912,8.99612197 14.4804321,10.0915688 12.4851542,12.0825633 C11.1870215,13.3779092 10.4037347,14.5423211 9.94498104,15.8596559 L9.94498104,15.8596559 Z' id='AWS-Simple-Queue-Service_Icon_32_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "messagePollingProperties"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.AWSTEXTRACT.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Configure input"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+SWNvbi1BcmNoaXRlY3R1cmUvNjQvQXJjaF9BbWF6b24tVGV4dHJhY3RfNjQ8L3RpdGxlPgogICAgPGcgaWQ9Ikljb24tQXJjaGl0ZWN0dXJlLzY0L0FyY2hfQW1hem9uLVRleHRyYWN0XzY0IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iSWNvbi1BcmNoaXRlY3R1cmUtQkcvNjQvTWFjaGluZS1MZWFybmluZyIgZmlsbD0iIzk5NjlmNyI+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUiIHg9IjAiIHk9IjAiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PC9yZWN0PgogICAgICAgIDwvZz4KICAgICAgICA8cGF0aCBkPSJNMjIuMDYyNDEwMiw1MCBDMjQuMzc2Mzg5NSw1My42MDMgMjguNDEwMzUzNSw1NiAzMy4wMDAzMTI1LDU2IEM0MC4xNjcyNDg1LDU2IDQ1Ljk5OTE5NjQsNTAuMTY4IDQ1Ljk5OTE5NjQsNDMgQzQ1Ljk5OTE5NjQsMzUuODMyIDQwLjE2NzI0ODUsMzAgMzMuMDAwMzEyNSwzMCBDMjcuNjAzMzYwNywzMCAyMi45NjY0MDIxLDMzLjMwNyAyMS4wMDI0MTk2LDM4IEwyMy4yMTQzOTk5LDM4IEMyNS4wMzkzODM2LDM0LjQ0NCAyOC43MzYzNTA2LDMyIDMzLjAwMDMxMjUsMzIgQzM5LjA2NTI1ODMsMzIgNDMuOTk5MjE0MywzNi45MzUgNDMuOTk5MjE0Myw0MyBDNDMuOTk5MjE0Myw0OS4wNjUgMzkuMDY1MjU4Myw1NCAzMy4wMDAzMTI1LDU0IEMyOS41OTEzNDI5LDU0IDI2LjU0MTM3MDIsNTIuNDQxIDI0LjUyMTM4ODIsNTAgTDIyLjA2MjQxMDIsNTAgWiBNMzcuMDAwMjc2OCw0NSBMMzcuMDAwMjc2OCw0MyBMNDEuOTk5MjMyMSw0MyBDNDEuOTk5MjMyMSwzOC4wMzggMzcuOTYyMjY4MiwzNCAzMy4wMDAzMTI1LDM0IEMyOC4wMzczNTY4LDM0IDIzLjk5OTM5MjksMzguMDM4IDIzLjk5OTM5MjksNDMgTDI4Ljk5OTM0ODIsNDMgTDI4Ljk5OTM0ODIsNDUgTDI0LjIzMTM5MDgsNDUgQzI1LjE0NDM4MjYsNDkuMDAyIDI4LjcyNTM1MDcsNTIgMzMuMDAwMzEyNSw1MiBDMzUuMTM2MjkzNCw1MiAzNy4wOTkyNzU5LDUxLjI0OSAzOC42NDQyNjIxLDUwIEwzNC4wMDAzMDM2LDUwIEwzNC4wMDAzMDM2LDQ4IEw0MC40NzgyNDU3LDQ4IEM0MS4wODEyNDAzLDQ3LjEwMiA0MS41MjAyMzY0LDQ2LjA4NyA0MS43NjgyMzQyLDQ1IEwzNy4wMDAyNzY4LDQ1IFogTTIxLjAwMjQxOTYsNDggTDIzLjIxNDM5OTksNDggQzIyLjQ0MzQwNjgsNDYuNDk4IDIyLjAwMDQxMDcsNDQuODAxIDIyLjAwMDQxMDcsNDMgQzIyLjAwMDQxMDcsNDEuOTU5IDIyLjE1NTQwOTMsNDAuOTU1IDIyLjQyNjQwNjksNDAgTDIwLjM2MzQyNTMsNDAgQzIwLjEzNDQyNzQsNDAuOTY1IDE5Ljk5OTQyODYsNDEuOTY2IDE5Ljk5OTQyODYsNDMgQzE5Ljk5OTQyODYsNDQuNzcxIDIwLjM1ODQyNTQsNDYuNDYgMjEuMDAyNDE5Niw0OCBMMjEuMDAyNDE5Niw0OCBaIE0xOS43NDM0MzA5LDUwIEwxNy4wMDA0NTU0LDUwIEwxNy4wMDA0NTU0LDQ4IEwxOC44NzQ0Mzg2LDQ4IEMxOC41MzQ0NDE3LDQ3LjA0IDE4LjI4OTQ0MzgsNDYuMDM4IDE4LjE0OTQ0NTEsNDUgTDE1LjQxNDQ2OTUsNDUgTDE2LjcwNzQ1OCw0Ni4yOTMgTDE1LjI5MjQ3MDYsNDcuNzA3IEwxMi4yOTI0OTc0LDQ0LjcwNyBDMTEuOTAyNTAwOSw0NC4zMTYgMTEuOTAyNTAwOSw0My42ODQgMTIuMjkyNDk3NCw0My4yOTMgTDE1LjI5MjQ3MDYsNDAuMjkzIEwxNi43MDc0NTgsNDEuNzA3IEwxNS40MTQ0Njk1LDQzIEwxOC4wMDA0NDY0LDQzIEMxOC4wMDA0NDY0LDQxLjk3MyAxOC4xMDQ0NDU1LDQwLjk3IDE4LjMwMjQ0MzcsNDAgTDE3LjAwMDQ1NTQsNDAgTDE3LjAwMDQ1NTQsMzggTDE4Ljg3NDQzODYsMzggQzIwLjk0MDQyMDIsMzIuMTg0IDI2LjQ4MzM3MDcsMjggMzMuMDAwMzEyNSwyOCBDMzcuNDI3MjczLDI4IDQxLjQwMDIzNzUsMjkuOTM5IDQ0LjE0ODIxMywzMyBMNTkuMDAwMDgwNCwzMyBMNTkuMDAwMDgwNCwzNSBMNDUuNjY2MTk5NCwzNSBDNDcuMTM1MTg2MywzNy4zMTggNDcuOTk5MTc4Niw0MC4wNTggNDcuOTk5MTc4Niw0MyBMNTkuMDAwMDgwNCw0MyBMNTkuMDAwMDgwNCw0NSBMNDcuODUwMTc5OSw0NSBDNDYuODY4MTg4Nyw1Mi4zMjcgNDAuNTkxMjQ0Nyw1OCAzMy4wMDAzMTI1LDU4IEMyNy4yNTYzNjM4LDU4IDIyLjI2MjQwODQsNTQuNzUyIDE5Ljc0MzQzMDksNTAgTDE5Ljc0MzQzMDksNTAgWiBNMzcuMDAwMjc2OCwzOSBDMzcuMDAwMjc2OCwzOC40NDggMzYuNTUyMjgwOCwzOCAzNi4wMDAyODU3LDM4IEwyOS45OTkzNDgyLDM4IEMyOS40NDczNDQyLDM4IDI4Ljk5OTM0ODIsMzguNDQ4IDI4Ljk5OTM0ODIsMzkgTDI4Ljk5OTM0ODIsNDEgTDMxLjAwMDMzMDQsNDEgTDMxLjAwMDMzMDQsNDAgTDMyLjAwMDMyMTQsNDAgTDMyLjAwMDMyMTQsNDMgTDMxLjAwMDMzMDQsNDMgTDMxLjAwMDMzMDQsNDUgTDM1LjAwMDI5NDYsNDUgTDM1LjAwMDI5NDYsNDMgTDM0LjAwMDMwMzYsNDMgTDM0LjAwMDMwMzYsNDAgTDM1LjAwMDI5NDYsNDAgTDM1LjAwMDI5NDYsNDEgTDM3LjAwMDI3NjgsNDEgTDM3LjAwMDI3NjgsMzkgWiBNNDkuMDAwMTY5Niw0MCBMNTkuMDAwMDgwNCw0MCBMNTkuMDAwMDgwNCwzOCBMNDkuMDAwMTY5NiwzOCBMNDkuMDAwMTY5Niw0MCBaIE00OS4wMDAxNjk2LDUwIEw1OS4wMDAwODA0LDUwIEw1OS4wMDAwODA0LDQ4IEw0OS4wMDAxNjk2LDQ4IEw0OS4wMDAxNjk2LDUwIFogTTU3LjAwMDA5ODIsMjcgTDYwLjU4NTA2NjIsMjcgTDU3LjAwMDA5ODIsMjMuNDE0IEw1Ny4wMDAwOTgyLDI3IFogTTYzLjcwNzAzODMsMjcuMjkzIEM2My44OTQwMzY3LDI3LjQ4IDY0LjAwMDAzNTcsMjcuNzM1IDY0LjAwMDAzNTcsMjggTDY0LjAwMDAzNTcsNjMgQzY0LjAwMDAzNTcsNjMuNTUyIDYzLjU1MjAzOTcsNjQgNjMuMDAwMDQ0Niw2NCBMMzIuMDAwMzMwNCw2NCBDMzEuNDQ3MzI2NCw2NCAzMS4wMDAzMzA0LDYzLjU1MiAzMS4wMDAzMzA0LDYzIEwzMS4wMDAzMzA0LDU5IEwzMy4wMDAzMTI1LDU5IEwzMy4wMDAzMTI1LDYyIEw2Mi4wMDAwNTM2LDYyIEw2Mi4wMDAwNTM2LDI5IEw1Ni4wMDAxMDcxLDI5IEM1NS40NDcxMTIxLDI5IDU1LjAwMDExNjEsMjguNTUyIDU1LjAwMDExNjEsMjggTDU1LjAwMDExNjEsMjIgTDMzLjAwMDMxMjUsMjIgTDMzLjAwMDMxMjUsMjcgTDMxLjAwMDMzMDQsMjcgTDMxLjAwMDMzMDQsMjEgQzMxLjAwMDMzMDQsMjAuNDQ4IDMxLjQ0NzMyNjQsMjAgMzIuMDAwMzMwNCwyMCBMNTYuMDAwMTA3MSwyMCBDNTYuMjY1MTA0OCwyMCA1Ni41MTkxMDI1LDIwLjEwNSA1Ni43MDcxMDA4LDIwLjI5MyBMNjMuNzA3MDM4MywyNy4yOTMgWiBNNjgsMjQuMTY2IEw2OCw2MSBDNjgsNjEuNTUyIDY3LjU1MjAwNCw2MiA2Ny4wMDAwMDg5LDYyIEw2NS4wMDAwMjY4LDYyIEw2NS4wMDAwMjY4LDYwIEw2Ni4wMDAwMTc5LDYwIEw2Ni4wMDAwMTc5LDI0LjYxMiBMNTguNjE3MDgzOCwxOCBMMzYuMDAwMjg1NywxOCBMMzYuMDAwMjg1NywxOSBMMzQuMDAwMzAzNiwxOSBMMzQuMDAwMzAzNiwxNyBDMzQuMDAwMzAzNiwxNi40NDggMzQuNDQ3Mjk5NiwxNiAzNS4wMDAzMDM2LDE2IEw1OS4wMDAwODA0LDE2IEM1OS4yNDYwNzgyLDE2IDU5LjQ4MzA3NiwxNi4wOTEgNTkuNjY2MDc0NCwxNi4yNTUgTDY3LjY2NjAwMywyMy40MiBDNjcuODc4MDAxMSwyMy42MSA2OCwyMy44ODEgNjgsMjQuMTY2IEw2OCwyNC4xNjYgWiIgaWQ9IkFtYXpvbi1UZXh0cmFjdF9JY29uXzY0X1NxdWlkIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.inbound.KafkaBoundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "kafka",
          "label": "Kafka"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='18' height='18' viewBox='0 0 256 416' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M201.816 230.216c-16.186 0-30.697 7.171-40.634 18.461l-25.463-18.026c2.703-7.442 4.255-15.433 4.255-23.797 0-8.219-1.498-16.076-4.112-23.408l25.406-17.835c9.936 11.233 24.409 18.365 40.548 18.365 29.875 0 54.184-24.305 54.184-54.184 0-29.879-24.309-54.184-54.184-54.184-29.875 0-54.184 24.305-54.184 54.184 0 5.348.808 10.505 2.258 15.389l-25.423 17.844c-10.62-13.175-25.911-22.374-43.333-25.182v-30.64c24.544-5.155 43.037-26.962 43.037-53.019C124.171 24.305 99.862 0 69.987 0 40.112 0 15.803 24.305 15.803 54.184c0 25.708 18.014 47.246 42.067 52.769v31.038C25.044 143.753 0 172.401 0 206.854c0 34.621 25.292 63.374 58.355 68.94v32.774c-24.299 5.341-42.552 27.011-42.552 52.894 0 29.879 24.309 54.184 54.184 54.184 29.875 0 54.184-24.305 54.184-54.184 0-25.883-18.253-47.553-42.552-52.894v-32.775a69.965 69.965 0 0 0 42.6-24.776l25.633 18.143c-1.423 4.84-2.22 9.946-2.22 15.24 0 29.879 24.309 54.184 54.184 54.184 29.875 0 54.184-24.305 54.184-54.184 0-29.879-24.309-54.184-54.184-54.184zm0-126.695c14.487 0 26.27 11.788 26.27 26.271s-11.783 26.27-26.27 26.27-26.27-11.787-26.27-26.27c0-14.483 11.783-26.271 26.27-26.271zm-158.1-49.337c0-14.483 11.784-26.27 26.271-26.27s26.27 11.787 26.27 26.27c0 14.483-11.783 26.27-26.27 26.27s-26.271-11.787-26.271-26.27zm52.541 307.278c0 14.483-11.783 26.27-26.27 26.27s-26.271-11.787-26.271-26.27c0-14.483 11.784-26.27 26.271-26.27s26.27 11.787 26.27 26.27zm-26.272-117.97c-20.205 0-36.642-16.434-36.642-36.638 0-20.205 16.437-36.642 36.642-36.642 20.204 0 36.641 16.437 36.641 36.642 0 20.204-16.437 36.638-36.641 36.638zm131.831 67.179c-14.487 0-26.27-11.788-26.27-26.271s11.783-26.27 26.27-26.27 26.27 11.787 26.27 26.27c0 14.483-11.783 26.271-26.27 26.271z' style='fill:%23231f20'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.agenticai.adhoctoolsschema.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "tools",
          "label": "Available tools"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIGZpbGw9IiMwMDAwMDAiIGhlaWdodD0iODAwcHgiIHdpZHRoPSI4MDBweCIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgCgkgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBkPSJNNTAwLjIzLDI3MC4wNTFoLTc0LjU0VjIxMi42NmMwLTYuNTAxLTUuMjcxLTExLjc3LTExLjc3LTExLjc3aC00OC4xbDI3LjY4OC00Ny45NThsNjQuMDQ2LDM2Ljk3NwoJCQkJYzEuODA0LDEuMDQzLDMuODM3LDEuNTc3LDUuODg1LDEuNTc3YzEuMDE5LDAsMi4wNDQtMC4xMzMsMy4wNDYtMC40MDFjMy4wMTctMC44MDksNS41ODYtMi43OCw3LjE0Ny01LjQ4NGwyMC41OTgtMzUuNjc4CgkJCQljMi41MzMtNC4zODgsMS45NzUtOS45MDYtMS4zODktMTMuNjk2QzQ0NS45MTMsODMuMzMzLDM5NC43OTMsMjkuMzcxLDMzMS40MjQsMS42NDljLTUuNDkxLTIuNDAyLTExLjkxMy0wLjI5NC0xNC45MSw0Ljg5OQoJCQkJbC0zOC4yNTMsNjYuMjU2Yy0zLjI1MSw1LjYzLTEuMzIyLDEyLjgyOCw0LjMwOCwxNi4wNzhsMzkuNTg2LDIyLjg1NWwtNjkuMzk0LDEyMC4xODlsLTc4Ljg5My0xMTYuOTUzbC0yLjE5NC0xNi44MTgKCQkJCWMtMC4yMzctMS44MTMtMC44OTItMy41NDQtMS45MTQtNS4wNTlsLTI5LjgzNy00NC4yMzJjLTMuNjM2LTUuMzktMTAuOTUyLTYuODEtMTYuMzM5LTMuMTc2bC01My42NiwzNi4xOTMKCQkJCWMtMi41ODgsMS43NDYtNC4zNzcsNC40NDgtNC45NzMsNy41MTJjLTAuNTk2LDMuMDY0LDAuMDUxLDYuMjQsMS43OTYsOC44MjhsMjkuODM3LDQ0LjIzMmMxLjAyLDEuNTEzLDIuMzc5LDIuNzY3LDMuOTY4LDMuNjY1CgkJCQlsMTQuNzY5LDguMzQ1bDc3Ljk3LDExNS41ODdIMTQ3LjY3bC00Ni40NTgtOTUuNDg1Yy0yLjg0NS01Ljg0NS05Ljg5LTguMjc3LTE1LjczMy01LjQzNGMtNS44NDUsMi44NDUtOC4yNzgsOS44ODgtNS40MzQsMTUuNzMzCgkJCQlsNDEuNDQ3LDg1LjE4Nkg5MS43MTJsLTE4LjU1Ni00Mi4yMDVjLTIuNjE4LTUuOTUxLTkuNTY2LTguNjUzLTE1LjUxMi02LjAzN2MtNS45NTEsMi42MTYtOC42NTUsOS41NjEtNi4wMzgsMTUuNTEyCgkJCQlsMTQuMzksMzIuNzMySDExLjc3Yy02LjUsMC0xMS43Nyw1LjI2OS0xMS43NywxMS43N3Y2NC43MzZjMCw2LjUwMSw1LjI3MSwxMS43NywxMS43NywxMS43N2gyMC41OTh2MTQxLjI0MQoJCQkJYzAsNi41MDEsNS4yNzEsMTEuNzcsMTEuNzcsMTEuNzdoNDIzLjcyNGM2LjQ5OSwwLDExLjc3LTUuMjY5LDExLjc3LTExLjc3VjM1OC4zMjhoMjAuNTk4YzYuNSwwLDExLjc3LTUuMjY5LDExLjc3LTExLjc3CgkJCQl2LTY0LjczNkM1MTIsMjc1LjMyLDUwNi43MjksMjcwLjA1MSw1MDAuMjMsMjcwLjA1MXogTTQwMi4xNSwyMjQuNDN2NDUuNjIxaC03Ni4yNTlsMjYuMzM4LTQ1LjYyMUg0MDIuMTV6IE0zMDQuNTMzLDc0LjM4MQoJCQkJbDI2Ljk4Mi00Ni43MzRjNTIuMzg1LDI1LjgyNyw5Ni45MTcsNzEuNzgsMTM4LjA4LDExNy44NjhsLTEwLjQ2NCwxOC4xMjJMMzA0LjUzMyw3NC4zODF6IE0yNjMuNzM0LDI2MC4wMTMKCQkJCWMwLjAwNS0wLjAwOCwwLjAwNy0wLjAxNiwwLjAxMi0wLjAyNWw3OC43OTktMTM2LjQ4MmwzMC41NzgsMTcuNjU0bC03NC40MTIsMTI4Ljg5aC00MC43NzRMMjYzLjczNCwyNjAuMDEzeiBNMTMzLjI4NSwxMzkKCQkJCWMtMS4wMi0xLjUxMi0yLjM3OS0yLjc2Ny0zLjk2OC0zLjY2NWwtMTQuNzY5LTguMzQ1TDkyLjg0Niw5NC44MTVsMzQuMTQ0LTIzLjAyOWwyMS43MDIsMzIuMTcxbDIuMTk0LDE2LjgxOAoJCQkJYzAuMjM3LDEuODEzLDAuODkyLDMuNTQ0LDEuOTE0LDUuMDU5bDg2Ljg2OCwxMjguNzcybC04LjkxNywxNS40NDRoLTkuMDYzTDEzMy4yODUsMTM5eiBNNDU2LjA5Miw0MzguOTUyaC00OC44NDYKCQkJCWMtNi40OTksMC0xMS43Nyw1LjI2OS0xMS43NywxMS43N3M1LjI3MSwxMS43NywxMS43NywxMS43N2g0OC44NDZ2MjUuMzA2SDU1LjkwOHYtMjUuMzA2aDQ4Ljg0NgoJCQkJYzYuNDk5LDAsMTEuNzctNS4yNjksMTEuNzctMTEuNzdzLTUuMjcxLTExLjc3LTExLjc3LTExLjc3SDU1LjkwOHYtODAuNjI1aDEzNS4zNTZ2NDEuMTk1YzAsNi41MDEsNS4yNzEsMTEuNzcsMTEuNzcsMTEuNzcKCQkJCWgxMDUuOTMxYzYuNDk5LDAsMTEuNzctNS4yNjksMTEuNzctMTEuNzd2LTQxLjE5NWgxMzUuMzU2VjQzOC45NTJ6IE0yMTQuODA1LDM4Ny43NTJ2LTI5LjQyNWg4Mi4zOTF2MjkuNDI1SDIxNC44MDV6CgkJCQkgTTQ4OC40NiwzMzQuNzg3SDIzLjU0di00MS4xOTVoNDY0LjkyVjMzNC43ODd6Ii8+CgkJCTxwYXRoIGQ9Ik0xNDkuNjc3LDQzOC45NTJIMTQ4LjVjLTYuNDk5LDAtMTEuNzcsNS4yNjktMTEuNzcsMTEuNzdzNS4yNzEsMTEuNzcsMTEuNzcsMTEuNzdoMS4xNzcKCQkJCWM2LjQ5OSwwLDExLjc3LTUuMjY5LDExLjc3LTExLjc3UzE1Ni4xNzYsNDM4Ljk1MiwxNDkuNjc3LDQzOC45NTJ6Ii8+CgkJCTxwYXRoIGQ9Ik0zNjIuMzIzLDQ2Mi40OTJoMS4xNzdjNi40OTksMCwxMS43Ny01LjI2OSwxMS43Ny0xMS43N3MtNS4yNzEtMTEuNzctMTEuNzctMTEuNzdoLTEuMTc3CgkJCQljLTYuNDk5LDAtMTEuNzcsNS4yNjktMTEuNzcsMTEuNzdTMzU1LjgyNCw0NjIuNDkyLDM2Mi4zMjMsNDYyLjQ5MnoiLz4KCQk8L2c+Cgk8L2c+CjwvZz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "tools"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.webhook.GithubWebhookConnectorBoundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 1024 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z' transform='scale(64)' fill='%231B1F23'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.aws.s3.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "action",
          "label": "Action"
        },
        {
          "id": "deleteObject",
          "label": "Delete an object"
        },
        {
          "id": "uploadObject",
          "label": "Upload an object"
        },
        {
          "id": "downloadObject",
          "label": "Download an object"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMy4xMjUgMy4wOTM4MUwxMC41MzEyIDguMDMxMzFMMTMuMTI1IDEyLjk2ODhMMTQuMTg3NSAxMi4zNzUxVjMuNjg3NTZMMTMuMTI1IDMuMDkzODFaIiBmaWxsPSIjRTI1NDQ0Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTMuMTI1IDMuMDkzODFMNy45Mzc1IDMuNjg3NTZMNS4yOTY4OCA4LjAzMTMxTDcuOTM3NSAxMi4zNzUxTDEzLjEyNSAxMi45Njg4VjMuMDkzODFaIiBmaWxsPSIjN0IxRDEzIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMi42NTYyNSAzLjA5MzgxTDEuODEyNSAzLjQ2ODgxVjEyLjU5MzhMMi42NTYyNSAxMi45Njg4TDcuOTM3NSA4LjAzMTMxTDIuNjU2MjUgMy4wOTM4MVoiIGZpbGw9IiM1ODE1MEQiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yLjY0NDUzIDMuMDgzMzFMNy45NDQxMyA0LjU1NTUzVjExLjYzODhMMi42NDQ1MyAxMi45NzIyVjMuMDgzMzFaIiBmaWxsPSIjRTI1NDQ0Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNy45NDc1MiA1LjMzMzVMNS42OTcyNyA0Ljk3MjM3TDcuOTQ3NTIgMi40MTY4MUwxMC4xOTIyIDQuOTcyMzdMNy45NDc1MiA1LjMzMzVaIiBmaWxsPSIjNTgxNTBEIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMTkyMiA0Ljk3MjM3TDcuOTQ0NzMgNS4zMzkwM0w1LjY5NzI3IDQuOTcyMzdWMi40MTY4MSIgZmlsbD0iIzU4MTUwRCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuOTQ3NTIgMTAuNjk0NEw1LjY5NzI3IDExLjExMTFMNy45NDc1MiAxMy4zMDU1TDEwLjE5MjIgMTEuMTExMUw3Ljk0NzUyIDEwLjY5NDRaIiBmaWxsPSIjNTgxNTBEIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNy45Mzc1IDAuNTAwMDYxTDUuNjg3NSAxLjY4NzU2VjQuOTY4ODFMNy45NDQ1IDQuMzMzNDFMNy45Mzc1IDAuNTAwMDYxWiIgZmlsbD0iIzdCMUQxMyIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuOTQ0NzMgNi4xMzg5OEw1LjY5NzI3IDYuMzgzNDVWOS42NTk2M0w3Ljk0NDczIDkuOTE2NzZWNi4xMzg5OFoiIGZpbGw9IiM3QjFEMTMiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik03Ljk0NDczIDExLjY2NjZMNS42OTcyNyAxMS4xMDMxVjE0LjMyMzhMNy45NDQ3MyAxNS41VjExLjY2NjZaIiBmaWxsPSIjN0IxRDEzIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTAuMTkxOCAxMS4xMDMxTDcuOTQ0MzQgMTEuNjY2OFYxNS41TDEwLjE5MTggMTQuMzIzOFYxMS4xMDMxWiIgZmlsbD0iI0UyNTQ0NCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTcuOTQ0MzQgNi4xMzg5OEwxMC4xOTE4IDYuMzgzNDVWOS42NTk2M0w3Ljk0NDM0IDkuOTE2NzZWNi4xMzg5OFoiIGZpbGw9IiNFMjU0NDQiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik03LjkzNzUgMC41MDAwNjFMMTAuMTg3NSAxLjY4NzU2VjQuOTY4ODFMNy45Mzc1IDQuMzQzODFWMC41MDAwNjFaIiBmaWxsPSIjRTI1NDQ0Ii8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "action"
      },
      {
        "group": "deleteObject",
        "tooltip": "Bucket from where an object should be deleted"
      },
      {
        "group": "deleteObject",
        "tooltip": "Key of the object which should be deleted"
      },
      {
        "group": "uploadObject",
        "tooltip": "Bucket from where an object should be uploaded"
      },
      {
        "group": "uploadObject",
        "tooltip": "Key of the uploaded object, if not given. The file name from the document metadata will be used"
      },
      {
        "group": "uploadObject",
        "tooltip": "Document to be uploaded on AWS S3"
      },
      {
        "group": "downloadObject",
        "tooltip": "Bucket from where an object should be downloaded"
      },
      {
        "group": "downloadObject",
        "tooltip": "Key of the object which should be download"
      },
      {
        "group": "downloadObject",
        "tooltip": "If set to true, a document reference will be created. If set to false, the content will be extracted and provided inside the response."
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.AzureOpenAI.outbound.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "parameters",
          "label": "Parameters"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 513 512'%3E%3Cg clip-path='url(%23a)'%3E%3Crect width='512' height='512' x='.25' fill='%23fff' rx='76'/%3E%3Cpath fill='url(%23b)' d='M.25 76.8v358.4c0 42.411 34.39 76.8 76.8 76.8h358.4c42.411 0 76.8-34.389 76.8-76.8V76.8c0-42.41-34.389-76.8-76.8-76.8H77.05C34.64 0 .25 34.39.25 76.8ZM307.45 0v102.4c0 113.095 91.705 204.8 204.8 204.8h-102.4c-113.095 0-204.772 91.648-204.8 204.743V409.6c0-113.095-91.705-204.8-204.8-204.8h102.4c113.095 0 204.8-91.705 204.8-204.8Z'/%3E%3C/g%3E%3Cdefs%3E%3CradialGradient id='b' cx='0' cy='0' r='1' gradientTransform='rotate(45 -176.261 403.94) scale(321.165 437.107)' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%2383B9F9'/%3E%3Cstop offset='1' stop-color='%230078D4'/%3E%3C/radialGradient%3E%3CclipPath id='a'%3E%3Crect width='512' height='512' x='.25' fill='%23fff' rx='76'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {},
      {},
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {},
      {},
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {},
      {},
      {},
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.agenticai.adhoctoolsschema.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "tools",
          "label": "Available Tools"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8c3ZnIGZpbGw9IiMwMDAwMDAiIGhlaWdodD0iODAwcHgiIHdpZHRoPSI4MDBweCIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgCgkgdmlld0JveD0iMCAwIDUxMiA1MTIiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxnPgoJCTxnPgoJCQk8cGF0aCBkPSJNNTAwLjIzLDI3MC4wNTFoLTc0LjU0VjIxMi42NmMwLTYuNTAxLTUuMjcxLTExLjc3LTExLjc3LTExLjc3aC00OC4xbDI3LjY4OC00Ny45NThsNjQuMDQ2LDM2Ljk3NwoJCQkJYzEuODA0LDEuMDQzLDMuODM3LDEuNTc3LDUuODg1LDEuNTc3YzEuMDE5LDAsMi4wNDQtMC4xMzMsMy4wNDYtMC40MDFjMy4wMTctMC44MDksNS41ODYtMi43OCw3LjE0Ny01LjQ4NGwyMC41OTgtMzUuNjc4CgkJCQljMi41MzMtNC4zODgsMS45NzUtOS45MDYtMS4zODktMTMuNjk2QzQ0NS45MTMsODMuMzMzLDM5NC43OTMsMjkuMzcxLDMzMS40MjQsMS42NDljLTUuNDkxLTIuNDAyLTExLjkxMy0wLjI5NC0xNC45MSw0Ljg5OQoJCQkJbC0zOC4yNTMsNjYuMjU2Yy0zLjI1MSw1LjYzLTEuMzIyLDEyLjgyOCw0LjMwOCwxNi4wNzhsMzkuNTg2LDIyLjg1NWwtNjkuMzk0LDEyMC4xODlsLTc4Ljg5My0xMTYuOTUzbC0yLjE5NC0xNi44MTgKCQkJCWMtMC4yMzctMS44MTMtMC44OTItMy41NDQtMS45MTQtNS4wNTlsLTI5LjgzNy00NC4yMzJjLTMuNjM2LTUuMzktMTAuOTUyLTYuODEtMTYuMzM5LTMuMTc2bC01My42NiwzNi4xOTMKCQkJCWMtMi41ODgsMS43NDYtNC4zNzcsNC40NDgtNC45NzMsNy41MTJjLTAuNTk2LDMuMDY0LDAuMDUxLDYuMjQsMS43OTYsOC44MjhsMjkuODM3LDQ0LjIzMmMxLjAyLDEuNTEzLDIuMzc5LDIuNzY3LDMuOTY4LDMuNjY1CgkJCQlsMTQuNzY5LDguMzQ1bDc3Ljk3LDExNS41ODdIMTQ3LjY3bC00Ni40NTgtOTUuNDg1Yy0yLjg0NS01Ljg0NS05Ljg5LTguMjc3LTE1LjczMy01LjQzNGMtNS44NDUsMi44NDUtOC4yNzgsOS44ODgtNS40MzQsMTUuNzMzCgkJCQlsNDEuNDQ3LDg1LjE4Nkg5MS43MTJsLTE4LjU1Ni00Mi4yMDVjLTIuNjE4LTUuOTUxLTkuNTY2LTguNjUzLTE1LjUxMi02LjAzN2MtNS45NTEsMi42MTYtOC42NTUsOS41NjEtNi4wMzgsMTUuNTEyCgkJCQlsMTQuMzksMzIuNzMySDExLjc3Yy02LjUsMC0xMS43Nyw1LjI2OS0xMS43NywxMS43N3Y2NC43MzZjMCw2LjUwMSw1LjI3MSwxMS43NywxMS43NywxMS43N2gyMC41OTh2MTQxLjI0MQoJCQkJYzAsNi41MDEsNS4yNzEsMTEuNzcsMTEuNzcsMTEuNzdoNDIzLjcyNGM2LjQ5OSwwLDExLjc3LTUuMjY5LDExLjc3LTExLjc3VjM1OC4zMjhoMjAuNTk4YzYuNSwwLDExLjc3LTUuMjY5LDExLjc3LTExLjc3CgkJCQl2LTY0LjczNkM1MTIsMjc1LjMyLDUwNi43MjksMjcwLjA1MSw1MDAuMjMsMjcwLjA1MXogTTQwMi4xNSwyMjQuNDN2NDUuNjIxaC03Ni4yNTlsMjYuMzM4LTQ1LjYyMUg0MDIuMTV6IE0zMDQuNTMzLDc0LjM4MQoJCQkJbDI2Ljk4Mi00Ni43MzRjNTIuMzg1LDI1LjgyNyw5Ni45MTcsNzEuNzgsMTM4LjA4LDExNy44NjhsLTEwLjQ2NCwxOC4xMjJMMzA0LjUzMyw3NC4zODF6IE0yNjMuNzM0LDI2MC4wMTMKCQkJCWMwLjAwNS0wLjAwOCwwLjAwNy0wLjAxNiwwLjAxMi0wLjAyNWw3OC43OTktMTM2LjQ4MmwzMC41NzgsMTcuNjU0bC03NC40MTIsMTI4Ljg5aC00MC43NzRMMjYzLjczNCwyNjAuMDEzeiBNMTMzLjI4NSwxMzkKCQkJCWMtMS4wMi0xLjUxMi0yLjM3OS0yLjc2Ny0zLjk2OC0zLjY2NWwtMTQuNzY5LTguMzQ1TDkyLjg0Niw5NC44MTVsMzQuMTQ0LTIzLjAyOWwyMS43MDIsMzIuMTcxbDIuMTk0LDE2LjgxOAoJCQkJYzAuMjM3LDEuODEzLDAuODkyLDMuNTQ0LDEuOTE0LDUuMDU5bDg2Ljg2OCwxMjguNzcybC04LjkxNywxNS40NDRoLTkuMDYzTDEzMy4yODUsMTM5eiBNNDU2LjA5Miw0MzguOTUyaC00OC44NDYKCQkJCWMtNi40OTksMC0xMS43Nyw1LjI2OS0xMS43NywxMS43N3M1LjI3MSwxMS43NywxMS43NywxMS43N2g0OC44NDZ2MjUuMzA2SDU1LjkwOHYtMjUuMzA2aDQ4Ljg0NgoJCQkJYzYuNDk5LDAsMTEuNzctNS4yNjksMTEuNzctMTEuNzdzLTUuMjcxLTExLjc3LTExLjc3LTExLjc3SDU1LjkwOHYtODAuNjI1aDEzNS4zNTZ2NDEuMTk1YzAsNi41MDEsNS4yNzEsMTEuNzcsMTEuNzcsMTEuNzcKCQkJCWgxMDUuOTMxYzYuNDk5LDAsMTEuNzctNS4yNjksMTEuNzctMTEuNzd2LTQxLjE5NWgxMzUuMzU2VjQzOC45NTJ6IE0yMTQuODA1LDM4Ny43NTJ2LTI5LjQyNWg4Mi4zOTF2MjkuNDI1SDIxNC44MDV6CgkJCQkgTTQ4OC40NiwzMzQuNzg3SDIzLjU0di00MS4xOTVoNDY0LjkyVjMzNC43ODd6Ii8+CgkJCTxwYXRoIGQ9Ik0xNDkuNjc3LDQzOC45NTJIMTQ4LjVjLTYuNDk5LDAtMTEuNzcsNS4yNjktMTEuNzcsMTEuNzdzNS4yNzEsMTEuNzcsMTEuNzcsMTEuNzdoMS4xNzcKCQkJCWM2LjQ5OSwwLDExLjc3LTUuMjY5LDExLjc3LTExLjc3UzE1Ni4xNzYsNDM4Ljk1MiwxNDkuNjc3LDQzOC45NTJ6Ii8+CgkJCTxwYXRoIGQ9Ik0zNjIuMzIzLDQ2Mi40OTJoMS4xNzdjNi40OTksMCwxMS43Ny01LjI2OSwxMS43Ny0xMS43N3MtNS4yNzEtMTEuNzctMTEuNzctMTEuNzdoLTEuMTc3CgkJCQljLTYuNDk5LDAtMTEuNzcsNS4yNjktMTEuNzcsMTEuNzdTMzU1LjgyNCw0NjIuNDkyLDM2Mi4zMjMsNDYyLjQ5MnoiLz4KCQk8L2c+Cgk8L2c+CjwvZz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "tools"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.AWSSQS.StartEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "queueProperties",
          "label": "Queue properties"
        },
        {
          "id": "messagePollingProperties",
          "label": "Message polling properties"
        },
        {
          "id": "input",
          "label": "Use next attribute names for activation condition"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 40 40' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/32/Arch_AWS-Simple-Queue-Service_32%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/32/Arch_AWS-Simple-Queue-Service_32' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/32/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='40' height='40'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M14.3422051,22.3493786 L15.8466767,20.9061074 C15.9428347,20.8141539 15.9969235,20.687218 15.9999285,20.5552846 C16.0019317,20.4223517 15.9518495,20.2934168 15.8596981,20.1984648 L14.3552264,18.6432502 L13.6350433,19.3378994 L14.311154,20.037546 L11.9913429,20.037546 L11.9913429,21.0370413 L14.2650783,21.0370413 L13.6480647,21.6287425 L14.3422051,22.3493786 Z M26.3579452,22.3533765 L27.9074909,20.9001104 C28.0066538,20.8081569 28.0627459,20.679222 28.0647492,20.5442901 C28.0667525,20.4093583 28.0136653,20.2784244 27.918509,20.1834724 L26.3689633,18.6372532 L25.6607999,19.3438963 L26.3549403,20.037546 L24.0110896,20.037546 L24.0110896,21.0370413 L26.2988481,21.0370413 L25.671818,21.6247445 L26.3579452,22.3533765 Z M17.5875367,23.3608678 C18.3387708,23.0570212 19.1621235,22.8941035 20.0045074,22.8941035 C20.8468913,22.8941035 21.670244,23.0570212 22.4214781,23.3608678 C21.7523789,21.5897622 21.7523789,19.3898731 22.4214781,17.6187675 C20.9190098,18.2264606 19.090005,18.2264606 17.5875367,17.6187675 C18.2566359,19.3898731 18.2566359,21.5897622 17.5875367,23.3608678 L17.5875367,23.3608678 Z M15.6443443,25.3408679 C15.546183,25.2439168 15.4971024,25.1159814 15.4971024,24.988046 C15.4971024,24.8601106 15.546183,24.7321753 15.6443443,24.6342247 C17.5845317,22.6982024 17.5845317,18.2824324 15.6443443,16.3454106 C15.546183,16.2484595 15.4971024,16.1205241 15.4971024,15.9925912 C15.4971024,15.8646534 15.546183,15.736718 15.6443443,15.6387674 C15.8396652,15.4438659 16.1571868,15.4438659 16.3525077,15.6387674 C17.2740216,16.5583031 18.6052086,17.0860366 20.0045074,17.0860366 C21.4048079,17.0860366 22.7359948,16.5583031 23.6575088,15.6387674 C23.8528296,15.4438659 24.1703513,15.4438659 24.3656722,15.6387674 C24.4628318,15.736718 24.5119124,15.8646534 24.5119124,15.9925912 C24.5119124,16.1205241 24.4628318,16.2484595 24.3656722,16.3454106 C22.4244831,18.2824324 22.4244831,22.6982024 24.3656722,24.6342247 C24.4628318,24.7321753 24.5119124,24.8601106 24.5119124,24.988046 C24.5119124,25.1159814 24.4628318,25.2439168 24.3656722,25.3408679 C24.2675109,25.4388184 24.1393003,25.4877937 24.0110896,25.4877937 C23.882879,25.4877937 23.7546684,25.4388184 23.6575088,25.3408679 C22.7359948,24.4213322 21.4048079,23.8935987 20.0045074,23.8935987 C18.6052086,23.8935987 17.2740216,24.4213322 16.3525077,25.3408679 C16.1571868,25.5357694 15.8396652,25.5357694 15.6443443,25.3408679 L15.6443443,25.3408679 Z M32.5421049,19.4358499 C32.236603,19.1320033 31.8369464,18.9800801 31.4362882,18.9800801 C31.0366316,18.9800801 30.636975,19.1320033 30.3314731,19.4358499 C29.721471,20.0445425 29.721471,21.0340428 30.3314731,21.6417359 C30.9414753,22.2504285 31.9321027,22.2504285 32.5421049,21.6417359 C33.1511054,21.0340428 33.1511054,20.0445425 32.5421049,19.4358499 L32.5421049,19.4358499 Z M33.2502683,22.3493786 C32.7504472,22.8481267 32.0933677,23.0980005 31.4362882,23.0980005 C30.7802103,23.0980005 30.1231309,22.8481267 29.6233097,22.3493786 C28.6236675,21.3508828 28.6236675,19.7277025 29.6233097,18.7292068 C30.622952,17.7317105 32.250626,17.7317105 33.2502683,18.7292068 C34.2499106,19.7277025 34.2499106,21.3508828 33.2502683,22.3493786 L33.2502683,22.3493786 Z M9.66852687,19.4468443 C9.36302497,19.1429978 8.96336839,18.9910745 8.56271017,18.9910745 C8.16305359,18.9910745 7.76339701,19.1429978 7.45789511,19.4468443 C6.84889461,20.055537 6.84889461,21.0450373 7.45789511,21.6527304 C8.06789726,22.261423 9.05852472,22.261423 9.66852687,21.6527304 C10.2775274,21.0450373 10.2775274,20.055537 9.66852687,19.4468443 L9.66852687,19.4468443 Z M10.3766903,22.3593735 C9.87686914,22.8581217 9.21978965,23.1079955 8.56271017,23.1079955 C7.90663232,23.1079955 7.24955284,22.8581217 6.7497317,22.3593735 C5.75008943,21.3618773 5.75008943,19.738697 6.7497317,18.7402012 C7.74937397,17.7427049 9.37704801,17.7427049 10.3766903,18.7402012 C11.3763325,19.738697 11.3763325,21.3618773 10.3766903,22.3593735 L10.3766903,22.3593735 Z M27.4337125,28.9100654 C25.4364313,30.903059 22.7820705,32.0005047 19.9574301,32.0005047 C17.1327896,32.0005047 14.4784288,30.903059 12.4821492,28.9100654 C11.165987,27.5977281 10.4077413,26.469298 9.94498104,25.1359713 L8.99842599,25.4628063 C9.50726193,26.9290658 10.3626672,28.2104187 11.7739858,29.6167086 C13.9585748,31.7986067 16.8663519,33 19.9574301,33 C23.0495099,33 25.9562853,31.7986067 28.1418759,29.6167086 C29.2827502,28.4782835 30.4206196,27.1869356 31.0115905,25.4608073 L30.0640338,25.1379703 C29.5391715,26.6701966 28.4894469,27.8565974 27.4337125,28.9100654 L27.4337125,28.9100654 Z M9.94498104,15.8596559 L8.99842599,15.5318214 C9.51026687,14.0645624 10.3656722,12.7832095 11.7759891,11.3759202 C16.2863991,6.87519304 23.6264578,6.87419354 28.1378694,11.3759202 C29.2186449,12.4533761 30.4035916,13.7897012 31.0115905,15.5318214 L30.0640338,15.8596559 C29.5241468,14.3094387 28.4293482,13.0800596 27.4297059,12.0825633 C25.434428,10.0915688 22.7810689,8.99612197 19.9574301,8.99612197 C17.1337912,8.99612197 14.4804321,10.0915688 12.4851542,12.0825633 C11.1870215,13.3779092 10.4037347,14.5423211 9.94498104,15.8596559 L9.94498104,15.8596559 Z' id='AWS-Simple-Queue-Service_Icon_32_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "messagePollingProperties"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.AWSEventBridge.boundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "API destination"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 256 256'%3E%3Cdefs%3E%3ClinearGradient id='logosAwsEventbridge0' x1='0%25' x2='100%25' y1='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23B0084D'/%3E%3Cstop offset='100%25' stop-color='%23FF4F8B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23logosAwsEventbridge0)' d='M0 0h256v256H0z'/%3E%3Cpath fill='%23FFF' d='M171.702 211.2c-6.858 0-12.44-5.61-12.44-12.509s5.582-12.509 12.44-12.509c6.857 0 12.438 5.61 12.438 12.51c0 6.898-5.581 12.508-12.438 12.508Zm-27.278-54.4h-33.071L94.815 128l16.538-28.8h33.071L160.96 128l-16.535 28.8ZM88.387 69.818c-6.857 0-12.438-5.61-12.438-12.51c0-6.898 5.581-12.508 12.438-12.508c6.861 0 12.443 5.61 12.443 12.509s-5.582 12.509-12.443 12.509Zm83.315 109.964c-2.362 0-4.614.458-6.699 1.261l-13.514-22.931l-.713.426L167.39 129.6a3.226 3.226 0 0 0 0-3.2l-18.374-32a3.177 3.177 0 0 0-2.755-1.6h-33.435l.13-.077l-12.39-21.03c4.047-3.469 6.628-8.627 6.628-14.384c0-10.426-8.436-18.909-18.807-18.909c-10.367 0-18.803 8.483-18.803 18.909c0 10.425 8.436 18.909 18.803 18.909c2.365 0 4.618-.458 6.702-1.261l11.567 19.625L88.384 126.4a3.226 3.226 0 0 0 0 3.2l18.377 32c.57.992 1.62 1.6 2.756 1.6h36.744c.264 0 .521-.042.77-.102l12.496 21.21c-4.051 3.468-6.629 8.626-6.629 14.383c0 10.426 8.433 18.909 18.804 18.909c10.37 0 18.803-8.483 18.803-18.909c0-10.425-8.433-18.909-18.803-18.909Zm18.968-77.05c-6.857 0-12.436-5.609-12.436-12.508c0-6.9 5.579-12.509 12.436-12.509c6.858 0 12.44 5.61 12.44 12.509c0 6.9-5.582 12.509-12.44 12.509Zm23.303 23.668l-12.08-21.04c4.592-3.453 7.58-8.944 7.58-15.136c0-10.426-8.432-18.909-18.803-18.909c-2.638 0-5.152.554-7.433 1.549l-9.849-17.155a3.18 3.18 0 0 0-2.756-1.6h-39.448v6.4h37.612l9.11 15.872c-3.703 3.456-6.036 8.374-6.036 13.843c0 10.426 8.433 18.909 18.8 18.909c1.932 0 3.8-.298 5.556-.845L207.545 128l-15.892 27.674l5.512 3.2l16.808-29.274a3.21 3.21 0 0 0 0-3.2Zm-146.04 50.39c-6.86 0-12.442-5.612-12.442-12.508c0-6.9 5.581-12.51 12.442-12.51c6.857 0 12.439 5.61 12.439 12.51c0 6.896-5.582 12.508-12.44 12.508Zm10.393 3.236c5.062-3.392 8.41-9.181 8.41-15.744c0-10.426-8.436-18.91-18.803-18.91c-3.004 0-5.833.73-8.353 1.994L48.458 128l18.428-32.093l-5.515-3.2L42.027 126.4a3.21 3.21 0 0 0 0 3.2l12.388 21.568c-3.268 3.405-5.289 8.022-5.289 13.114c0 10.425 8.436 18.908 18.807 18.908c1.562 0 3.074-.214 4.528-.579l10.15 17.68c.57.989 1.62 1.6 2.757 1.6h39.451v-6.4H87.204l-8.878-15.465Z'/%3E%3C/svg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.RabbitMQ.StartEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "routing",
          "label": "Routing"
        },
        {
          "id": "subscription",
          "label": "Subscription"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='-7.5 0 271 271' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M245.44 108.308h-85.09a7.738 7.738 0 0 1-7.735-7.734v-88.68C152.615 5.327 147.29 0 140.726 0h-30.375c-6.568 0-11.89 5.327-11.89 11.894v88.143c0 4.573-3.697 8.29-8.27 8.31l-27.885.133c-4.612.025-8.359-3.717-8.35-8.325l.173-88.241C54.144 5.337 48.817 0 42.24 0H11.89C5.321 0 0 5.327 0 11.894V260.21c0 5.834 4.726 10.56 10.555 10.56H245.44c5.834 0 10.56-4.726 10.56-10.56V118.868c0-5.834-4.726-10.56-10.56-10.56zm-39.902 93.233c0 7.645-6.198 13.844-13.843 13.844H167.69c-7.646 0-13.844-6.199-13.844-13.844v-24.005c0-7.646 6.198-13.844 13.844-13.844h24.005c7.645 0 13.843 6.198 13.843 13.844v24.005z' fill='%23F60'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.agenticai.a2a.client.webhook.intermediate.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "clientResponse",
          "label": "Client Response"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMTguNSIgdmlld0JveD0iMyA5IDMwIDE4LjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTguNyAxNC43MjVDOC41MTY2NyAxNC45MDgzIDguMjgzMzMgMTUgOCAxNUM3LjcxNjY3IDE1IDcuNDc1IDE0LjkwODMgNy4yNzUgMTQuNzI1QzcuMDkxNjcgMTQuNTI1IDcgMTQuMjgzMyA3IDE0QzcgMTMuNzE2NyA3LjA5MTY3IDEzLjQ4MzMgNy4yNzUgMTMuM0M3LjQ3NSAxMy4xIDcuNzE2NjcgMTMgOCAxM0M4LjI4MzMzIDEzIDguNTE2NjcgMTMuMSA4LjcgMTMuM0M4LjkgMTMuNDgzMyA5IDEzLjcxNjcgOSAxNEM5IDE0LjI4MzMgOC45IDE0LjUyNSA4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMTQuNyAxNC43MjVDMTQuNTE2NyAxNC45MDgzIDE0LjI4MzMgMTUgMTQgMTVDMTMuNzE2NyAxNSAxMy40NzUgMTQuOTA4MyAxMy4yNzUgMTQuNzI1QzEzLjA5MTcgMTQuNTI1IDEzIDE0LjI4MzMgMTMgMTRDMTMgMTMuNzE2NyAxMy4wOTE3IDEzLjQ4MzMgMTMuMjc1IDEzLjNDMTMuNDc1IDEzLjEgMTMuNzE2NyAxMyAxNCAxM0MxNC4yODMzIDEzIDE0LjUxNjcgMTMuMSAxNC43IDEzLjNDMTQuOSAxMy40ODMzIDE1IDEzLjcxNjcgMTUgMTRDMTUgMTQuMjgzMyAxNC45IDE0LjUyNSAxNC43IDE0LjcyNVoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTIyLjcgMTQuNzI1QzIyLjUxNjcgMTQuOTA4MyAyMi4yODMzIDE1IDIyIDE1QzIxLjcxNjcgMTUgMjEuNDc1IDE0LjkwODMgMjEuMjc1IDE0LjcyNUMyMS4wOTE3IDE0LjUyNSAyMSAxNC4yODMzIDIxIDE0QzIxIDEzLjcxNjcgMjEuMDkxNyAxMy40ODMzIDIxLjI3NSAxMy4zQzIxLjQ3NSAxMy4xIDIxLjcxNjcgMTMgMjIgMTNDMjIuMjgzMyAxMyAyMi41MTY3IDEzLjEgMjIuNyAxMy4zQzIyLjkgMTMuNDgzMyAyMyAxMy43MTY3IDIzIDE0QzIzIDE0LjI4MzMgMjIuOSAxNC41MjUgMjIuNyAxNC43MjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0yOC43IDE0LjcyNUMyOC41MTY3IDE0LjkwODMgMjguMjgzMyAxNSAyOCAxNUMyNy43MTY3IDE1IDI3LjQ3NSAxNC45MDgzIDI3LjI3NSAxNC43MjVDMjcuMDkxNyAxNC41MjUgMjcgMTQuMjgzMyAyNyAxNEMyNyAxMy43MTY3IDI3LjA5MTcgMTMuNDgzMyAyNy4yNzUgMTMuM0MyNy40NzUgMTMuMSAyNy43MTY3IDEzIDI4IDEzQzI4LjI4MzMgMTMgMjguNTE2NyAxMy4xIDI4LjcgMTMuM0MyOC45IDEzLjQ4MzMgMjkgMTMuNzE2NyAyOSAxNEMyOSAxNC4yODMzIDI4LjkgMTQuNTI1IDI4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTUgMTRDNSAxMi4zNDMxIDYuMzQzMTUgMTEgOCAxMUgxNEMxNC43NzYgMTEgMTUuMjg0IDExLjE1MzcgMTUuNjQgMTEuMzgxOEMxNS44NTg5IDEwLjc5NCAxNi4xNTE3IDEwLjE3MDkgMTYuNTU1IDkuNTk3OTVDMTUuODc5NyA5LjIxMTUzIDE1LjAzODYgOSAxNCA5SDhDNS4yMzg1OCA5IDMgMTEuMjM4NiAzIDE0QzMgMTYuNzYxMiA1LjIzNzU5IDE5IDcuOTk5MjYgMTlIMTRDMTUuNzYzNCAxOSAxNi45NTczIDE4LjM5MDIgMTcuNzM3NSAxNy4zNUMxOC40MjI4IDE2LjQzNjMgMTguNzE0OCAxNS4yNjYgMTguOTQ4MyAxNC4zMjk5TDE4Ljk3MDEgMTQuMjQyNUMxOS4yMzI3IDEzLjE5MjQgMTkuNDQ0MiAxMi40MDc3IDE5Ljg2MjUgMTEuODVDMjAuMjA3MyAxMS4zOTAyIDIwLjc2MzQgMTEgMjIgMTFIMjguMDAwNUMyOS42NTcyIDExIDMxIDEyLjM0MyAzMSAxNEMzMSAxNS42NTY5IDI5LjY1NjkgMTcgMjggMTdIMjJDMjEuMjI0IDE3IDIwLjcxNiAxNi44NDYzIDIwLjM2IDE2LjYxODJDMjAuMTQxMSAxNy4yMDYgMTkuODQ4MyAxNy44MjkxIDE5LjQ0NSAxOC40MDJDMjAuMTIwMyAxOC43ODg1IDIwLjk2MTQgMTkgMjIgMTlIMjhDMzAuNzYxNCAxOSAzMyAxNi43NjE0IDMzIDE0QzMzIDExLjIzODggMzAuNzYyMSA5IDI4LjAwMDUgOUgyMkMyMC4yMzY2IDkgMTkuMDQyNyA5LjYwOTc5IDE4LjI2MjUgMTAuNjVDMTcuNTc3MiAxMS41NjM3IDE3LjI4NTIgMTIuNzM0IDE3LjA1MTcgMTMuNjcwMUwxNy4wMjk5IDEzLjc1NzVDMTYuNzY3MyAxNC44MDc2IDE2LjU1NTggMTUuNTkyMyAxNi4xMzc1IDE2LjE1QzE1Ljc5MjcgMTYuNjA5OCAxNS4yMzY2IDE3IDE0IDE3SDcuOTk5MjZDNi4zNDI2NSAxNyA1IDE1LjY1NzEgNSAxNFoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTcgMjMuNUM2LjcxNjY3IDIzLjUgNi40NzUgMjMuNDA4MyA2LjI3NSAyMy4yMjVDNi4wOTE2NyAyMy4wMjUgNiAyMi43ODMzIDYgMjIuNUM2IDIyLjIxNjcgNi4wOTE2NyAyMS45ODMzIDYuMjc1IDIxLjhDNi40NzUgMjEuNiA2LjcxNjY3IDIxLjUgNyAyMS41SDEyQzEyLjI4MzMgMjEuNSAxMi41MTY3IDIxLjYgMTIuNyAyMS44QzEyLjkgMjEuOTgzMyAxMyAyMi4yMTY3IDEzIDIyLjVDMTMgMjIuNzgzMyAxMi45IDIzLjAyNSAxMi43IDIzLjIyNUMxMi41MTY3IDIzLjQwODMgMTIuMjgzMyAyMy41IDEyIDIzLjVIN1pNNSAyNy41QzQuNzE2NjcgMjcuNSA0LjQ3NSAyNy40MDgzIDQuMjc1IDI3LjIyNUM0LjA5MTY3IDI3LjAyNSA0IDI2Ljc4MzMgNCAyNi41QzQgMjYuMjE2NyA0LjA5MTY3IDI1Ljk4MzMgNC4yNzUgMjUuOEM0LjQ3NSAyNS42IDQuNzE2NjcgMjUuNSA1IDI1LjVIOEM4LjI4MzMzIDI1LjUgOC41MTY2NyAyNS42IDguNyAyNS44QzguOSAyNS45ODMzIDkgMjYuMjE2NyA5IDI2LjVDOSAyNi43ODMzIDguOSAyNy4wMjUgOC43IDI3LjIyNUM4LjUxNjY3IDI3LjQwODMgOC4yODMzMyAyNy41IDggMjcuNUg1Wk0xMiAyNy41QzExLjcxNjcgMjcuNSAxMS40NzUgMjcuNDA4MyAxMS4yNzUgMjcuMjI1QzExLjA5MTcgMjcuMDI1IDExIDI2Ljc4MzMgMTEgMjYuNUMxMSAyNi4yMTY3IDExLjA5MTcgMjUuOTgzMyAxMS4yNzUgMjUuOEMxMS40NzUgMjUuNiAxMS43MTY3IDI1LjUgMTIgMjUuNUgyMEMyMC4yODMzIDI1LjUgMjAuNTE2NyAyNS42IDIwLjcgMjUuOEMyMC45IDI1Ljk4MzMgMjEgMjYuMjE2NyAyMSAyNi41QzIxIDI2Ljc4MzMgMjAuOSAyNy4wMjUgMjAuNyAyNy4yMjVDMjAuNTE2NyAyNy40MDgzIDIwLjI4MzMgMjcuNSAyMCAyNy41SDEyWk0yOCAyNy41QzI3LjcxNjcgMjcuNSAyNy40NzUgMjcuNDA4MyAyNy4yNzUgMjcuMjI1QzI3LjA5MTcgMjcuMDI1IDI3IDI2Ljc4MzMgMjcgMjYuNUMyNyAyNi4yMTY3IDI3LjA5MTcgMjUuOTgzMyAyNy4yNzUgMjUuOEMyNy40NzUgMjUuNiAyNy43MTY3IDI1LjUgMjggMjUuNUgzMkMzMi4yODMzIDI1LjUgMzIuNTE2NyAyNS42IDMyLjcgMjUuOEMzMi45IDI1Ljk4MzMgMzMgMjYuMjE2NyAzMyAyNi41QzMzIDI2Ljc4MzMzMi45IDI3LjAyNSAzMi43IDI3LjIyNUMzMi41MTY3IDI3LjQwODMgMzIuMjgzMyAyNy41IDMyIDI3LjVIMjhaTTE2IDIzLjVDMTUuNzE2NyAyMy41IDE1LjQ3NSAyMy40MDgzIDE1LjI3NSAyMy4yMjVDMTUuMDkxNyAyMy4wMjUgMTUgMjIuNzgzMyAxNSAyMi41QzE1IDIyLjIxNjcgMTUuMDkxNyAyMS45ODMzIDE1LjI3NSAyMS44QzE1LjQ3NSAyMS42IDE1LjcxNjcgMjEuNSAxNiAyMS41QzE2LjI4MzMgMjEuNSAxNi41MTY3IDIxLjYgMTYuNyAyMS44QzE2LjkgMjEuOTgzMyAxNyAyMi4yMTY3IDE3IDIyLjVDMTcgMjIuNzgzMyAxNi45IDIzLjAyNSAxNi43IDIzLjIyNUMxNi41MTY3IDIzLjQwODMgMTYuMjgzMyAyMy41IDE2IDIzLjVaTTI0IDI3LjVDMjMuNzE2NyAyNy41IDIzLjQ3NSAyNy40MDgzIDIzLjI3NSAyNy4yMjVDMjMuMDkxNyAyNy4wMjUgMjMgMjYuNzgzMyAyMyAyNi41QzIzIDI2LjIxNjcgMjMuMDkxNyAyNS45ODMzIDIzLjI3NSAyNS44QzIzLjQ3NSAyNS42IDIzLjcxNjcgMjUuNSAyNCAyNS41QzI0LjI4MzMgMjUuNSAyNC41MTY3IDI1LjYgMjQuNyAyNS44QzI0LjkgMjUuOTgzMyAyNSAyNi4yMTY3IDI1IDI2LjVDMjUgMjYuNzgzMyAyNC45IDI3LjAyNSAyNC43IDI3LjIyNUMyNC41MTY3IDI3LjQwODMgMjQuMjgzMyAyNy41IDI0IDI3LjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0xOS4yNzUgMjMuMjI1QzE5LjQ3NSAyMy40MDgzIDE5LjcxNjcgMjMuNSAyMCAyMy41SDIzQzIzLjI4MzMgMjMuNSAyMy41MTY3IDIzLjQwODMgMjMuNyAyMy4yMjVDMjMuOSAyMy4wMjUgMjQgMjIuNzgzMyAyNCAyMi41QzI0IDIyLjIxNjcgMjMuOSAyMS45ODMzIDIzLjcgMjEuOEMyMy41MTY3IDIxLjYgMjMuMjgzMyAyMS41IDIzIDIxLjVIMjBDMTkuNzE2NyAyMS41IDE5LjQ3NSAyMS42IDE5LjI3NSAyMS44QzE5LjA5MTcgMjEuOTgzMyAxOSAyMi4yMTY3IDE5IDIyLjVDMTkgMjIuNzgzMyAxOS4wOTE3IDIzLjAyNSAxOS4yNzUgMjMuMjI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMjYuMjc1IDIzLjIyNUMyNi40NzUgMjMuNDA4MyAyNi43MTY3IDIzLjUgMjcgMjMuNUgzMEMzMC4yODMzIDIzLjUgMzAuNTE2NyAyMy40MDgzIDMwLjcgMjMuMjI1QzMwLjkgMjMuMDI1IDMxIDIyLjc4MzMgMzEgMjIuNUMzMSAyMi4yMTY3IDMwLjkgMjEuOTgzMyAzMC43IDIxLjhDMzAuNTE2NyAyMS42IDMwLjI4MzMgMjEuNSAzMCAyMS41SDI3QzI2LjcxNjcgMjEuNSAyNi40NzUgMjEuNiAyNi4yNzUgMjEuOEMyNi4wOTE3IDIxLjk4MzMgMjYgMjIuMjE2NyAyNiAyMi41QzI2IDIyLjc4MzMgMjYuMDkxNyAyMy4wMjUgMjYuMjc1IDIzLjIyNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "clientResponse"
      },
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.inbound.Slack.BoundaryEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20%20viewBox%3D%220%200%20127%20127%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d%3D%22M27.2%2080c0%207.3-5.9%2013.2-13.2%2013.2C6.7%2093.2.8%2087.3.8%2080c0-7.3%205.9-13.2%2013.2-13.2h13.2V80zm6.6%200c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2v33c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V80z%22%20fill%3D%22%23E01E5A%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M47%2027c-7.3%200-13.2-5.9-13.2-13.2C33.8%206.5%2039.7.6%2047%20.6c7.3%200%2013.2%205.9%2013.2%2013.2V27H47zm0%206.7c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H13.9C6.6%2060.1.7%2054.2.7%2046.9c0-7.3%205.9-13.2%2013.2-13.2H47z%22%20fill%3D%22%2336C5F0%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M99.9%2046.9c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H99.9V46.9zm-6.6%200c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V13.8C66.9%206.5%2072.8.6%2080.1.6c7.3%200%2013.2%205.9%2013.2%2013.2v33.1z%22%20fill%3D%22%232EB67D%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M80.1%2099.8c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3%200-13.2-5.9-13.2-13.2%200-7.3%205.9-13.2%2013.2-13.2h33.1c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H80.1z%22%20fill%3D%22%23ECB22E%22%2F%3E%0A%3C%2Fsvg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.agenticai.mcp.remoteclient.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "connection",
          "label": "HTTP Connection",
          "tooltip": "Configure the HTTP/SSE connection to the remote MCP server. Setting authentication headers is not supported yet."
        },
        {
          "id": "tools",
          "label": "Tools"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+CiAgICA8cGF0aCBkPSJNMjUgOTcuODUyOEw5Mi44ODIzIDI5Ljk3MDZDMTAyLjI1NSAyMC41OTggMTE3LjQ1MSAyMC41OTggMTI2LjgyMyAyOS45NzA2VjI5Ljk3MDZDMTM2LjE5NiAzOS4zNDMxIDEzNi4xOTYgNTQuNTM5MSAxMjYuODIzIDYzLjkxMTdMNzUuNTU4MSAxMTUuMTc3IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgIDxwYXRoIGQ9Ik03Ni4yNjUzIDExNC40N0wxMjYuODIzIDYzLjkxMTdDMTM2LjE5NiA1NC41MzkxIDE1MS4zOTIgNTQuNTM5MSAxNjAuNzY1IDYzLjkxMTdMMTYxLjExOCA2NC4yNjUyQzE3MC40OTEgNzMuNjM3OCAxNzAuNDkxIDg4LjgzMzggMTYxLjExOCA5OC4yMDYzTDk5LjcyNDggMTU5LjZDOTYuNjAwNiAxNjIuNzI0IDk2LjYwMDYgMTY3Ljc4OSA5OS43MjQ4IDE3MC45MTNMMTEyLjMzMSAxODMuNTIiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgPHBhdGggZD0iTTEwOS44NTMgNDYuOTQxMUw1OS42NDgyIDk3LjE0NTdDNTAuMjc1NyAxMDYuNTE4IDUwLjI3NTcgMTIxLjcxNCA1OS42NDgyIDEzMS4wODdWMTMxLjA4N0M2OS4wMjA4IDE0MC40NTkgODQuMjE2OCAxNDAuNDU5IDkzLjU4OTQgMTMxLjA4N0wxNDMuNzk0IDgwLjg4MjIiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMTIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "tools"
      },
      {
        "group": "tools"
      },
      {
        "group": "operation",
        "tooltip": "The method to be called on the MCP server. See the <a href=\"https://modelcontextprotocol.io/specification/2024-11-05/server\">MCP specification</a> for a list of available methods.<br><br>Currently supported:<br><code>tools/list</code>, <code>tools/call</code>"
      },
      {
        "group": "operation",
        "tooltip": "The parameter structure depends on the method being called. See the <a href=\"https://modelcontextprotocol.io/specification/2024-11-05/server/tools#calling-tools\">MCP specification</a> for an example of the parameters for the <code>tools/call</code> method."
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.box": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1LjY5MjkgMTEuMjAwMkMxNS44ODggMTEuNDczNCAxNS44NDkgMTEuODI0NiAxNS42MTQ4IDEyLjAxOTdDMTUuMzQxNyAxMi4yMTQ4IDE0Ljk1MTQgMTIuMTc1OCAxNC43NTYzIDExLjk0MTdMMTMuMzkwNCAxMC4xODU2TDEyLjA2MzYgMTEuOTAyNkMxMS44Njg1IDEyLjE3NTggMTEuNDc4MiAxMi4xNzU4IDExLjIwNTEgMTEuOTgwN0MxMC45MzE5IDExLjc4NTYgMTAuODkyOSAxMS40MzQzIDExLjA4OCAxMS4xNjEyTDEyLjY0OSA5LjEzMTkxTDExLjA4OCA3LjEwMjY0QzEwLjg5MjkgNi44Mjk0NyAxMC45NzA5IDYuNDM5MjMgMTEuMjA1MSA2LjI0NDFDMTEuNDc4MiA2LjA0ODk4IDExLjg2ODUgNi4xMjcwMyAxMi4wNjM2IDYuMzYxMThMMTMuMzkwNCA4LjExNzI4TDE0Ljc1NjMgNi40MzkyM0MxNC45NTE0IDYuMTY2MDYgMTUuMzAyNiA2LjEyNzAzIDE1LjYxNDggNi4zMjIxNUMxNS44ODggNi41MTcyOCAxNS44ODggNi45MDc1MiAxNS42OTI5IDcuMTgwNjlMMTQuMTcwOSA5LjE3MDkzTDE1LjY5MjkgMTEuMjAwMlpNOC41OTA0NCAxMC45NjYxQzcuNTc1OCAxMC45NjYxIDYuNzU2MjkgMTAuMTg1NiA2Ljc1NjI5IDkuMTcwOTNDNi43NTYyOSA4LjE5NTMyIDcuNTc1OCA3LjM3NTgxIDguNTkwNDQgNy4zNzU4MUM5LjYwNTA3IDcuMzc1ODEgMTAuNDI0NiA4LjE5NTMyIDEwLjQyNDYgOS4xNzA5M0MxMC4zODU2IDEwLjE4NTYgOS41NjYwNSAxMC45NjYxIDguNTkwNDQgMTAuOTY2MVpNMy4yMDUwNyAxMC45NjYxQzIuMTkwNDQgMTAuOTY2MSAxLjM3MDkzIDEwLjE4NTYgMS4zNzA5MyA5LjE3MDkzQzEuMzcwOTMgOC4xOTUzMiAyLjE5MDQ0IDcuMzc1ODEgMy4yMDUwNyA3LjM3NTgxQzQuMjE5NzEgNy4zNzU4MSA1LjAzOTIyIDguMTk1MzIgNS4wMzkyMiA5LjE3MDkzQzUuMDM5MjIgMTAuMTg1NiA0LjIxOTcxIDEwLjk2NjEgMy4yMDUwNyAxMC45NjYxWk04LjU5MDQ0IDYuMjA1MDhDNy40NTg3MyA2LjIwNTA4IDYuNDQ0MSA2LjgyOTQ3IDUuOTM2NzggNy43NjYwNkM1LjQyOTQ2IDYuODI5NDcgNC40MTQ4MyA2LjIwNTA4IDMuMjQ0MSA2LjIwNTA4QzIuNTQxNjYgNi4yMDUwOCAxLjkxNzI3IDYuNDM5MjMgMS40MDk5NSA2Ljc5MDQ1VjQuMjkyODlDMS40MDk5NSAzLjk4MDY5IDEuMTM2NzggMy43MDc1MiAwLjgyNDU4NiAzLjcwNzUyQzAuNDczMzY2IDMuNzA3NTIgMC4yMDAxOTUgMy45ODA2OSAwLjIwMDE5NSA0LjI5Mjg5VjkuMjA5OTZDMC4yMzkyMiAxMC44NDkgMS41NjYwNSAxMi4xMzY4IDMuMjA1MDcgMTIuMTM2OEM0LjM3NTggMTIuMTM2OCA1LjM5MDQ0IDExLjQ3MzQgNS44OTc3NiAxMC41MzY4QzYuNDA1MDcgMTEuNDczNCA3LjQxOTcxIDEyLjEzNjggOC41NTE0MSAxMi4xMzY4QzEwLjIyOTUgMTIuMTM2OCAxMS41OTUzIDEwLjgxIDExLjU5NTMgOS4xMzE5MUMxMS42MzQzIDcuNTMxOTEgMTAuMjY4NSA2LjIwNTA4IDguNTkwNDQgNi4yMDUwOFoiIGZpbGw9IiMwMDcxRjciLz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.GitLab.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='18px' height='18px' viewBox='0 -10 256 256' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='xMidYMid'%3E%3Cg%3E%3Cpath d='M128.07485,236.074667 L128.07485,236.074667 L175.17885,91.1043048 L80.9708495,91.1043048 L128.07485,236.074667 L128.07485,236.074667 Z' fill='%23E24329'%3E%3C/path%3E%3Cpath d='M128.07485,236.074423 L80.9708495,91.104061 L14.9557638,91.104061 L128.07485,236.074423 L128.07485,236.074423 Z' fill='%23FC6D26'%3E%3C/path%3E%3Cpath d='M14.9558857,91.1044267 L14.9558857,91.1044267 L0.641828571,135.159589 C-0.663771429,139.17757 0.766171429,143.57955 4.18438095,146.06275 L128.074971,236.074789 L14.9558857,91.1044267 L14.9558857,91.1044267 Z' fill='%23FCA326'%3E%3C/path%3E%3Cpath d='M14.9558857,91.1045486 L80.9709714,91.1045486 L52.6000762,3.79026286 C51.1408762,-0.703146667 44.7847619,-0.701927619 43.3255619,3.79026286 L14.9558857,91.1045486 L14.9558857,91.1045486 Z' fill='%23E24329'%3E%3C/path%3E%3Cpath d='M128.07485,236.074423 L175.17885,91.104061 L241.193935,91.104061 L128.07485,236.074423 L128.07485,236.074423 Z' fill='%23FC6D26'%3E%3C/path%3E%3Cpath d='M241.193935,91.1044267 L241.193935,91.1044267 L255.507992,135.159589 C256.813592,139.17757 255.38365,143.57955 251.96544,146.06275 L128.07485,236.074789 L241.193935,91.1044267 L241.193935,91.1044267 Z' fill='%23FCA326'%3E%3C/path%3E%3Cpath d='M241.193935,91.1045486 L175.17885,91.1045486 L203.549745,3.79026286 C205.008945,-0.703146667 211.365059,-0.701927619 212.824259,3.79026286 L241.193935,91.1045486 L241.193935,91.1045486 Z' fill='%23E24329'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "HTTP endpoint"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {},
      {},
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "operation"
      },
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {},
      {},
      {},
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.GraphQL.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' id='GraphQL_Logo' x='0px' y='0px' viewBox='0 0 400 400' enable-background='new 0 0 400 400' xml:space='preserve'%3E%3Cg%3E%3Cg%3E%3Cg%3E%3Crect x='122' y='-0.4' transform='matrix(-0.866 -0.5 0.5 -0.866 163.3196 363.3136)' fill='%23E535AB' width='16.6' height='320.3'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Crect x='39.8' y='272.2' fill='%23E535AB' width='320.3' height='16.6'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Crect x='37.9' y='312.2' transform='matrix(-0.866 -0.5 0.5 -0.866 83.0693 663.3409)' fill='%23E535AB' width='185' height='16.6'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Crect x='177.1' y='71.1' transform='matrix(-0.866 -0.5 0.5 -0.866 463.3409 283.0693)' fill='%23E535AB' width='185' height='16.6'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Crect x='122.1' y='-13' transform='matrix(-0.5 -0.866 0.866 -0.5 126.7903 232.1221)' fill='%23E535AB' width='16.6' height='185'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Crect x='109.6' y='151.6' transform='matrix(-0.5 -0.866 0.866 -0.5 266.0828 473.3766)' fill='%23E535AB' width='320.3' height='16.6'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Crect x='52.5' y='107.5' fill='%23E535AB' width='16.6' height='185'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Crect x='330.9' y='107.5' fill='%23E535AB' width='16.6' height='185'/%3E%3C/g%3E%3C/g%3E%3Cg%3E%3Cg%3E%3Crect x='262.4' y='240.1' transform='matrix(-0.5 -0.866 0.866 -0.5 126.7953 714.2875)' fill='%23E535AB' width='14.5' height='160.9'/%3E%3C/g%3E%3C/g%3E%3Cpath fill='%23E535AB' d='M369.5,297.9c-9.6,16.7-31,22.4-47.7,12.8c-16.7-9.6-22.4-31-12.8-47.7c9.6-16.7,31-22.4,47.7-12.8 C373.5,259.9,379.2,281.2,369.5,297.9'/%3E%3Cpath fill='%23E535AB' d='M90.9,137c-9.6,16.7-31,22.4-47.7,12.8c-16.7-9.6-22.4-31-12.8-47.7c9.6-16.7,31-22.4,47.7-12.8 C94.8,99,100.5,120.3,90.9,137'/%3E%3Cpath fill='%23E535AB' d='M30.5,297.9c-9.6-16.7-3.9-38,12.8-47.7c16.7-9.6,38-3.9,47.7,12.8c9.6,16.7,3.9,38-12.8,47.7 C61.4,320.3,40.1,314.6,30.5,297.9'/%3E%3Cpath fill='%23E535AB' d='M309.1,137c-9.6-16.7-3.9-38,12.8-47.7c16.7-9.6,38-3.9,47.7,12.8c9.6,16.7,3.9,38-12.8,47.7 C340.1,159.4,318.7,153.7,309.1,137'/%3E%3Cpath fill='%23E535AB' d='M200,395.8c-19.3,0-34.9-15.6-34.9-34.9c0-19.3,15.6-34.9,34.9-34.9c19.3,0,34.9,15.6,34.9,34.9 C234.9,380.1,219.3,395.8,200,395.8'/%3E%3Cpath fill='%23E535AB' d='M200,74c-19.3,0-34.9-15.6-34.9-34.9c0-19.3,15.6-34.9,34.9-34.9c19.3,0,34.9,15.6,34.9,34.9 C234.9,58.4,219.3,74,200,74'/%3E%3C/g%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "HTTP endpoint"
        },
        {
          "id": "graphql",
          "label": "GraphQL query"
        },
        {
          "id": "timeout",
          "label": "Connect timeout"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "graphql"
      },
      {
        "group": "graphql"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "timeout"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.inbound.RabbitMQ.Intermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "routing",
          "label": "Routing"
        },
        {
          "id": "subscription",
          "label": "Subscription"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='-7.5 0 271 271' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M245.44 108.308h-85.09a7.738 7.738 0 0 1-7.735-7.734v-88.68C152.615 5.327 147.29 0 140.726 0h-30.375c-6.568 0-11.89 5.327-11.89 11.894v88.143c0 4.573-3.697 8.29-8.27 8.31l-27.885.133c-4.612.025-8.359-3.717-8.35-8.325l.173-88.241C54.144 5.337 48.817 0 42.24 0H11.89C5.321 0 0 5.327 0 11.894V260.21c0 5.834 4.726 10.56 10.555 10.56H245.44c5.834 0 10.56-4.726 10.56-10.56V118.868c0-5.834-4.726-10.56-10.56-10.56zm-39.902 93.233c0 7.645-6.198 13.844-13.843 13.844H167.69c-7.646 0-13.844-6.199-13.844-13.844v-24.005c0-7.646 6.198-13.844 13.844-13.844h24.005c7.645 0 13.843 6.198 13.843 13.844v24.005z' fill='%23F60'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.webhook.GithubWebhookConnectorIntermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 1024 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z' transform='scale(64)' fill='%231B1F23'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.Slack.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2218%22%20height%3D%2218%22%20%20viewBox%3D%220%200%20127%20127%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d%3D%22M27.2%2080c0%207.3-5.9%2013.2-13.2%2013.2C6.7%2093.2.8%2087.3.8%2080c0-7.3%205.9-13.2%2013.2-13.2h13.2V80zm6.6%200c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2v33c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V80z%22%20fill%3D%22%23E01E5A%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M47%2027c-7.3%200-13.2-5.9-13.2-13.2C33.8%206.5%2039.7.6%2047%20.6c7.3%200%2013.2%205.9%2013.2%2013.2V27H47zm0%206.7c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H13.9C6.6%2060.1.7%2054.2.7%2046.9c0-7.3%205.9-13.2%2013.2-13.2H47z%22%20fill%3D%22%2336C5F0%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M99.9%2046.9c0-7.3%205.9-13.2%2013.2-13.2%207.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H99.9V46.9zm-6.6%200c0%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V13.8C66.9%206.5%2072.8.6%2080.1.6c7.3%200%2013.2%205.9%2013.2%2013.2v33.1z%22%20fill%3D%22%232EB67D%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M80.1%2099.8c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2-7.3%200-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3%200-13.2-5.9-13.2-13.2%200-7.3%205.9-13.2%2013.2-13.2h33.1c7.3%200%2013.2%205.9%2013.2%2013.2%200%207.3-5.9%2013.2-13.2%2013.2H80.1z%22%20fill%3D%22%23ECB22E%22%2F%3E%0A%3C%2Fsvg%3E%0A"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "method",
          "label": "Method"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "message",
          "label": "Message"
        },
        {
          "id": "channel",
          "label": "Channel"
        },
        {
          "id": "invite",
          "label": "Invite"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "method"
      },
      {
        "group": "authentication"
      },
      {
        "group": "channel"
      },
      {
        "group": "channel"
      },
      {
        "group": "channel"
      },
      {
        "group": "message"
      },
      {
        "group": "invite"
      },
      {
        "group": "invite"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.BluePrism.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/x-icon;base64,AAABAAMAMDAAAAEAIACoJQAANgAAACAgAAABACAAqBAAAN4lAAAQEAAAAQAgAGgEAACGNgAAKAAAADAAAABgAAAAAQAgAAAAAAAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADhwpYDzJhLI7pzDA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANq1fh/cuIOGz5xU4bhtArO3bABAt2wABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADatX0P27V/Zdu2gNPct4L+z55W/7dtAf+3bADtt2wAlLdsACi3bAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rR8Btu1f0fbtoC627aA+tu2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAN23bAB0t2wAFgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANmyeQHbtX4u27Z/nNu2gPHbtoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD8t2wAxrdsAFW3bAAKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rV+Gtu2f33btoDi27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAPW3bACqt2wAObdsAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANq0fQzbtX9d27aAzdu2gP3btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA6bdsAIu3bAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADatHwE27V/QNu2f7LbtoD427aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP63bADXt2wAa7dsABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2K90Adu1fijbtn+U27aA7du2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA+7dsAL+3bABNt2wABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADatX4W27V/dNu2gN3btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bADzt2wAordsADK3bAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rR9Ctu1f1XbtoDG27aA/Nu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAOW3bACDt2wAHQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANqzewPbtX8527Z/q9u2gPXbtoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD+t2wA0bdsAGO3bAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rV+Itu2f4vbtoDq27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAPm3bAC4t2wARbdsAAUAAAAAAAAAANq1fhbbtX9r27aA19u2gP7btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA8LdsAJq3bAAtt2wAAtu1f2vbtoD027aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bACpt2wADNq1fRDbtn+d27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsANm3bAA3AAAAAAAAAADatX4Y27Z/tdu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA57dsAEoAAAAAAAAAAAAAAAAAAAAA27V+Jtu2gMnbtoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bADxt2wAYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fzfbtoDa27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAPm3bAB5t2wABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbtX9M27aA6Nu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/bdsAJK3bAAJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V/Ytu2gPLbtoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wAqbdsABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rN7BNu1f3vbtoD527aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAC/t2wAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANq0fQrbtn+T27aA/du2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsANK3bAAuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADatX4T27Z/q9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA4bdsAEEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rV+H9u2gMDbtoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bADtt2wAVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fi/btoDT27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAPa3bABut2wAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbtX9C27aA4tu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA+7dsAIa3bAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V/WNu2gO7btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wAn7dsAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2bJ5Atu1f3DbtoD227aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAC1t2wAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANq0fAfbtn+I27aA/Nu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAMq3bAAmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADatH0O27Z/oNu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA27dsADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rV+Gdu2f7fbtoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bADot2wATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fifbtoDL27aA/9u2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAPK3bABjt2wAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbtX8527aA3Nu2gP/btoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD/t2wA+bdsAHu3bAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V/Ttu2gOnbtoD/27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bAD9t2wAlLdsAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA161wAdu1f2XbtoDz27aA/9u2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAP+3bACrt2wAEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANqzewTbtn9927aA+tu2gP/ct4L/z55W/7dtAf+3bAD/t2wA/7dsAMG3bAAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADatH0L27Z/ldu2gP7ct4L/z55W/7dtAf+3bAD/t2wA07dsAC8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rV+FNu2f63ct4L/z55W/7dtAf+3bADit2wAQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fiDct4LCz55W/7dtAe63bABYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADdu4gxzptQzLhvBXK0ZgACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8+fQBy5VHH756GAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////wAA////////AAD///////8AAP///////wAA///8f///AAD///gf//8AAP//4A///wAA//+AA///AAD//wAA//8AAP/8AAA//wAA//AAAB//AAD/wAAAB/8AAP+AAAAB/wAA/gAAAAB/AAD4AAAAAD8AAOAAAAAADwAAwAAAAAADAACAAAAAAAEAAIAAAAAAAwAAwAAAAAAHAADgAAAAAA8AAPAAAAAAHwAA+AAAAAAfAAD8AAAAAD8AAP4AAAAAfwAA/gAAAAD/AAD/AAAAAf8AAP+AAAAD/wAA/8AAAAf/AAD/4AAAB/8AAP/wAAAP/wAA//gAAB//AAD/+AAAP/8AAP/8AAB//wAA//4AAP//AAD//wAB//8AAP//gAP//wAA///AA///AAD//+AH//8AAP//8A///wAA///wH///AAD///g///8AAP///H///wAA///+////AAD///////8AAP///////wAA////////AAD///////8AACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADfvo0Mz55WTLt0DTCxYAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADatH0D27V/PNy3gq7So1/3uW8F47dsAH63bAAbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V/Jdu2gI/btoDr3LeC/9KkYP+4bwX/t2wA/bdsAM63bABft2wADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V+E9u2f2/btoDa27aA/9u2gP/ct4L/0qRg/7hvBf+3bAD/t2wA/7dsAPi3bAC0t2wAQrdsAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rV+CNu2f1DbtoDC27aA+9u2gP/btoD/27aA/9y3gv/SpGD/uG8F/7dsAP+3bAD/t2wA/7dsAP+3bADut2wAlrdsACm3bAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rR8Atu1fzXbtoCm27aA9Nu2gP/btoD/27aA/9u2gP/btoD/3LeC/9KkYP+4bwX/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA3rdsAHa3bAAXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fx/btn+G27aA59u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/0qRg/7hvBf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/LdsAMi3bABXt2wACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fhDbtn9m27aA1Nu2gP7btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9y3gv/SpGD/uG8F/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAPa3bACst2wAO7dsAAMAAAAAAAAAANq1fgjbtn9I27aAu9u2gPrbtoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/3LeC/9KkYP+4bwX/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bADqt2wAjbdsACS3bAAB27Z/etu2gPHbtoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/0qRg/7hvBf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wAzrdsAC7btX8y27aAzdu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9y3gv/SpGD/uG8F/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAPy3bACMt2wACgAAAADbtX8727aA3tu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/3LeC/9KkYP+4bwX/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wAo7dsAA8AAAAAAAAAAAAAAADbtn9R27aA69u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/0qRg/7hvBf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsALm3bAAbAAAAAAAAAAAAAAAAAAAAANmyeAHbtn9o27aA9Nu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9y3gv/SpGD/uG8F/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bADNt2wAKQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANq0fQXbtn+A27aA+tu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/btoD/3LeC/9KkYP+4bwX/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA3rdsADsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANq1fgzbtoCZ27aA/tu2gP/btoD/27aA/9u2gP/btoD/27aA/9u2gP/ct4L/0qRg/7hvBf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAOq3bABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fhXbtoCw27aA/9u2gP/btoD/27aA/9u2gP/btoD/27aA/9y3gv/SpGD/uG8F/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD0t2wAaLdsAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fyLbtoDF27aA/9u2gP/btoD/27aA/9u2gP/btoD/3LeC/9KkYP+4bwX/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wA+rdsAIC3bAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1fzPbtoDX27aA/9u2gP/btoD/27aA/9u2gP/ct4L/0qRg/7hvBf+3bAD/t2wA/7dsAP+3bAD/t2wA/7dsAP63bACYt2wADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu1f0fbtoDl27aA/9u2gP/btoD/27aA/9y3gv/SpGD/uG8F/7dsAP+3bAD/t2wA/7dsAP+3bAD/t2wAsLdsABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANu2f13btoDw27aA/9u2gP/btoD/3LeC/9KkYP+4bwX/t2wA/7dsAP+3bAD/t2wA/7dsAMW3bAAiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rR8A9u2f3XbtoD427aA/9u2gP/ct4L/0qRg/7hvBf+3bAD/t2wA/7dsAP+3bADWt2wAMwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2rV+CNu2gI7btoD927aA/9y3gv/SpGD/uG8F/7dsAP+3bAD/t2wA5bdsAEYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V+ENu2gKbbtoD/3LeC/9KkYP+4bwX/t2wA/7dsAPC3bABdAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V/HNu2gLzct4L/0qRg/7hvBf+3bAD4t2wAdbdsAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V/K9y3gs/SpGD/uG8F/bdsAI23bAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3bqHPdGhW9+5cQintmkAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8BzZlPOb57GR0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//////////////////x////wH///4Af//4AB//4AAP/4AAA/8AAAD8AAAAOAAAABgAAAAcAAAAPgAAAH8AAAD/AAAB/4AAA//AAAf/4AAH//AAD//4AB///AA///4Af//+AP///wH///+D////w////+f/////////////////8oAAAAEAAAACAAAAABACAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMqURAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN26hx3SpGF6vHUQaLVpABEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27V/Dtu2gGLbt4LQ1Klp/rpyCvu3bAC9t2wAS7dsAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbtX8F27aARNu2gLfbtoD527eB/9Wpaf+6cQn/t2wA/7dsAPK3bACgt2wAMbdsAAIAAAAAAAAAANq0fQHbtn8r27aAmdu2gO/btoD/27aA/9u3gf/VqWn/unEJ/7dsAP+3bAD/t2wA/7dsAOS3bACBt2wAHAAAAADbtoB027aA4Nu2gP/btoD/27aA/9u2gP/bt4H/1alp/7pxCf+3bAD/t2wA/7dsAP+3bAD/t2wA/rdsANC3bABQ27aAZNu2gO3btoD/27aA/9u2gP/btoD/27eB/9Wpaf+6cQn/t2wA/7dsAP+3bAD/t2wA/7dsAP+3bADat2wAP9q0fQLbtoBt27aA9tu2gP/btoD/27aA/9u3gf/VqWn/unEJ/7dsAP+3bAD/t2wA/7dsAP+3bADnt2wASgAAAAAAAAAA27V/Btu2gIbbtoD727aA/9u2gP/bt4H/1alp/7pxCf+3bAD/t2wA/7dsAP+3bADyt2wAYQAAAAAAAAAAAAAAAAAAAADbtX8O27aAntu2gP/btoD/27eB/9Wpaf+6cQn/t2wA/7dsAP+3bAD5t2wAerdsAAQAAAAAAAAAAAAAAAAAAAAAAAAAANu2fxjbtoC127aA/9u3gf/VqWn/unEJ/7dsAP+3bAD9t2wAkrdsAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA27Z/Jtu2gMnbt4H/1alp/7pxCf+3bAD/t2wAqrdsABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADbtoA327eC2tWpaf+6cQn/t2wAv7dsAB4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANy5hEzUp2bqunMM07ZqAC4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8B0J9YVb97Gz8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMqTQwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AAD//wAA/D8AAPAPAADAAwAAgAEAAIABAADAAwAAwAcAAOAPAADwDwAA+B8AAPw/AAD+fwAA//8AAP//AAA="
      }
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "errors"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.SendGrid.v2": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M0.285706%205.40847H5.43837V10.5611H0.285706V5.40847Z%22%20fill%3D%22white%22%2F%3E%0A%3Cpath%20d%3D%22M0.285706%205.40847H5.43837V10.5611H0.285706V5.40847Z%22%20fill%3D%22%2399E1F4%22%2F%3E%0A%3Cpath%20d%3D%22M5.43837%2010.5611L10.5611%2010.5616V15.6844H5.43837V10.5611Z%22%20fill%3D%22white%22%2F%3E%0A%3Cpath%20d%3D%22M5.43837%2010.5611L10.5611%2010.5616V15.6844H5.43837V10.5611Z%22%20fill%3D%22%2399E1F4%22%2F%3E%0A%3Cpath%20d%3D%22M0.285706%2015.6846L5.43837%2015.6844V15.7143H0.285706V15.6846ZM0.285706%2010.5619H5.43837V15.6844L0.285706%2015.6846V10.5619Z%22%20fill%3D%22%231A82E2%22%2F%3E%0A%3Cpath%20d%3D%22M5.43837%200.285706H10.5611V5.40847H5.43837V0.285706ZM10.5616%205.43837H15.7143V10.5611H10.5616V5.43837Z%22%20fill%3D%22%2300B3E3%22%2F%3E%0A%3Cpath%20d%3D%22M5.43837%2010.5611L10.5611%2010.5616V5.40847H5.43837V10.5611Z%22%20fill%3D%22%23009DD9%22%2F%3E%0A%3Cpath%20d%3D%22M10.5611%200.285706H15.7143V5.40847H10.5611V0.285706Z%22%20fill%3D%22%231A82E2%22%2F%3E%0A%3Cpath%20d%3D%22M10.5611%205.40847H15.7143V5.43837H10.5616L10.5611%205.40847Z%22%20fill%3D%22%231A82E2%22%2F%3E%0A%3C%2Fsvg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "sender",
          "label": "Sender"
        },
        {
          "id": "receiver",
          "label": "Receiver"
        },
        {
          "id": "content",
          "label": "Compose email"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "sender"
      },
      {
        "group": "sender"
      },
      {
        "group": "receiver"
      },
      {
        "group": "receiver"
      },
      {
        "group": "content"
      },
      {
        "group": "content"
      },
      {
        "group": "content"
      },
      {
        "group": "content"
      },
      {
        "group": "content"
      },
      {
        "group": "content"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.inbound.KafkaReceive.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "kafka",
          "label": "Kafka"
        },
        {
          "id": "schema",
          "label": "Schema"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTgnIGhlaWdodD0nMTgnIHZpZXdCb3g9JzAgMCAyNTYgNDE2JyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHByZXNlcnZlQXNwZWN0UmF0aW89J3hNaWRZTWlkJz4KICAgIDxwYXRoIGQ9J00yMDEuODE2IDIzMC4yMTZjLTE2LjE4NiAwLTMwLjY5NyA3LjE3MS00MC42MzQgMTguNDYxbC0yNS40NjMtMTguMDI2YzIuNzAzLTcuNDQyIDQuMjU1LTE1LjQzMyA0LjI1NS0yMy43OTcgMC04LjIxOS0xLjQ5OC0xNi4wNzYtNC4xMTItMjMuNDA4bDI1LjQwNi0xNy44MzVjOS45MzYgMTEuMjMzIDI0LjQwOSAxOC4zNjUgNDAuNTQ4IDE4LjM2NSAyOS44NzUgMCA1NC4xODQtMjQuMzA1IDU0LjE4NC01NC4xODQgMC0yOS44NzktMjQuMzA5LTU0LjE4NC01NC4xODQtNTQuMTg0LTI5Ljg3NSAwLTU0LjE4NCAyNC4zMDUtNTQuMTg0IDU0LjE4NCAwIDUuMzQ4LjgwOCAxMC41MDUgMi4yNTggMTUuMzg5bC0yNS40MjMgMTcuODQ0Yy0xMC42Mi0xMy4xNzUtMjUuOTExLTIyLjM3NC00My4zMzMtMjUuMTgydi0zMC42NGMyNC41NDQtNS4xNTUgNDMuMDM3LTI2Ljk2MiA0My4wMzctNTMuMDE5QzEyNC4xNzEgMjQuMzA1IDk5Ljg2MiAwIDY5Ljk4NyAwIDQwLjExMiAwIDE1LjgwMyAyNC4zMDUgMTUuODAzIDU0LjE4NGMwIDI1LjcwOCAxOC4wMTQgNDcuMjQ2IDQyLjA2NyA1Mi43Njl2MzEuMDM4QzI1LjA0NCAxNDMuNzUzIDAgMTcyLjQwMSAwIDIwNi44NTRjMCAzNC42MjEgMjUuMjkyIDYzLjM3NCA1OC4zNTUgNjguOTR2MzIuNzc0Yy0yNC4yOTkgNS4zNDEtNDIuNTUyIDI3LjAxMS00Mi41NTIgNTIuODk0IDAgMjkuODc5IDI0LjMwOSA1NC4xODQgNTQuMTg0IDU0LjE4NCAyOS44NzUgMCA1NC4xODQtMjQuMzA1IDU0LjE4NC01NC4xODQgMC0yNS44ODMtMTguMjUzLTQ3LjU1My00Mi41NTItNTIuODk0di0zMi43NzVhNjkuOTY1IDY5Ljk2NSAwIDAgMCA0Mi42LTI0Ljc3NmwyNS42MzMgMTguMTQzYy0xLjQyMyA0Ljg0LTIuMjIgOS45NDYtMi4yMiAxNS4yNCAwIDI5Ljg3OSAyNC4zMDkgNTQuMTg0IDU0LjE4NCA1NC4xODQgMjkuODc1IDAgNTQuMTg0LTI0LjMwNSA1NC4xODQtNTQuMTg0IDAtMjkuODc5LTI0LjMwOS01NC4xODQtNTQuMTg0LTU0LjE4NHptMC0xMjYuNjk1YzE0LjQ4NyAwIDI2LjI3IDExLjc4OCAyNi4yNyAyNi4yNzFzLTExLjc4MyAyNi4yNy0yNi4yNyAyNi4yNy0yNi4yNy0xMS43ODctMjYuMjctMjYuMjdjMC0xNC40ODMgMTEuNzgzLTI2LjI3MSAyNi4yNy0yNi4yNzF6bS0xNTguMS00OS4zMzdjMC0xNC40ODMgMTEuNzg0LTI2LjI3IDI2LjI3MS0yNi4yN3MyNi4yNyAxMS43ODcgMjYuMjcgMjYuMjdjMCAxNC40ODMtMTEuNzgzIDI2LjI3LTI2LjI3IDI2LjI3cy0yNi4yNzEtMTEuNzg3LTI2LjI3MS0yNi4yN3ptNTIuNTQxIDMwNy4yNzhjMCAxNC40ODMtMTEuNzgzIDI2LjI3LTI2LjI3IDI2LjI3cy0yNi4yNzEtMTEuNzg3LTI2LjI3MS0yNi4yN2MwLTE0LjQ4MyAxMS43ODQtMjYuMjcgMjYuMjcxLTI2LjI3czI2LjI3IDExLjc4NyAyNi4yNyAyNi4yN3ptLTI2LjI3Mi0xMTcuOTdjLTIwLjIwNSAwLTM2LjY0Mi0xNi40MzQtMzYuNjQyLTM2LjYzOCAwLTIwLjIwNSAxNi40MzctMzYuNjQyIDM2LjY0Mi0zNi42NDIgMjAuMjA0IDAgMzYuNjQxIDE2LjQzNyAzNi42NDEgMzYuNjQyIDAgMjAuMjA0LTE2LjQzNyAzNi42MzgtMzYuNjQxIDM2LjYzOHptMTMxLjgzMSA2Ny4xNzljLTE0LjQ4NyAwLTI2LjI3LTExLjc4OC0yNi4yNy0yNi4yNzFzMTEuNzgzLTI2LjI3IDI2LjI3LTI2LjI3IDI2LjI3IDExLjc4NyAyNi4yNyAyNi4yN2MwIDE0LjQ4My0xMS43ODMgMjYuMjcxLTI2LjI3IDI2LjI3MXonCiAgICAgICAgICBzdHlsZT0nZmlsbDojMjMxZjIwJy8+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "schema"
      },
      {
        "group": "schema"
      },
      {
        "group": "schema"
      },
      {
        "group": "schema"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.http.Polling": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3C%3Fxml version='1.0'%3F%3E%3Csvg width='18' height='18' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m17.03,9c0,4.45 -3.6,8.05 -8.05,8.05c-4.45,0 -8.05,-3.6 -8.05,-8.05c0,-4.45 3.6,-8.05 8.05,-8.05c4.45,0 8.05,3.6 8.05,8.05z' fill='%23505562' id='svg_1'/%3E%3Cpath d='m4.93,14.16l1.85,-10.45l3.36,0c1.05,0 1.84,0.27 2.37,0.81c0.54,0.53 0.8,1.21 0.8,2.06c0,0.86 -0.24,1.58 -0.73,2.13c-0.47,0.55 -1.12,0.93 -1.95,1.14l-0.48,0.09l-0.53,0.03l-0.6,0.05l-1.79,0l-0.73,4.14l-1.58,0zm2.57,-5.57l1.74,0c0.76,0 1.35,-0.17 1.78,-0.5c0.44,-0.35 0.65,-0.82 0.65,-1.42c0,-0.48 -0.15,-0.85 -0.44,-1.12c-0.3,-0.28 -0.77,-0.42 -1.42,-0.42l-1.7,0l-0.61,3.46z' fill='white' id='svg_2'/%3E%3C/g%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "HTTP Polling configuration"
        },
        {
          "id": "input",
          "label": "Payload"
        },
        {
          "id": "activation",
          "label": "Condition to proceed"
        },
        {
          "id": "timer",
          "label": "Timer"
        },
        {
          "id": "timeout",
          "label": "Connect timeout"
        },
        {
          "id": "variable-mapping",
          "label": "Response mapping"
        }
      ]
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.Jdbc.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": [
          "relational",
          "database"
        ]
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "database",
          "label": "Database"
        },
        {
          "id": "connection",
          "label": "Connection"
        },
        {
          "id": "query",
          "label": "Query"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTMiIGhlaWdodD0iNTEyIiBmaWxsPSJub25lIiB2aWV3Qm94PSIwIDAgNTEzIDUxMiI+CiAgPGcgY2xpcC1wYXRoPSJ1cmwoI2EpIj4KICAgIDxwYXRoIGZpbGw9IiMwMDAiIGQ9Ik00MjIuMDY5IDQxNi45OTVWMjUzLjA0NGgtMjQuNzU2VjQ0NC4zMmg5OS4wMjR2LTI3LjMyNWgtNzQuMjY4Wm0tNzQuMjY4LTE2My45NTFoLTQ5LjUxMmMtNi41NjUgMC0xMi44NjIgMi44NzktMTcuNTA1IDguMDA0LTQuNjQzIDUuMTI0LTcuMjUxIDEyLjA3NC03LjI1MSAxOS4zMjJ2MTM2LjYyNWMwIDcuMjQ3IDIuNjA4IDE0LjE5NyA3LjI1MSAxOS4zMjEgNC42NDMgNS4xMjUgMTAuOTQgOC4wMDQgMTcuNTA1IDguMDA0aDEyLjM3OHYyNy4zMjVjMCA3LjI0NyAyLjYwOCAxNC4xOTcgNy4yNTEgMTkuMzIxIDQuNjQzIDUuMTI1IDEwLjk0IDguMDA0IDE3LjUwNSA4LjAwNGgyNC43NTZ2LTI3LjMyNWgtMjQuNzU2VjQ0NC4zMmgxMi4zNzhjNi41NjYgMCAxMi44NjMtMi44NzkgMTcuNTA1LTguMDA0IDQuNjQzLTUuMTI0IDcuMjUxLTEyLjA3NCA3LjI1MS0xOS4zMjFWMjgwLjM3YzAtNy4yNDgtMi42MDgtMTQuMTk4LTcuMjUxLTE5LjMyMi00LjY0Mi01LjEyNS0xMC45MzktOC4wMDQtMTcuNTA1LTguMDA0Wm0tNDkuNTEyIDE2My45NTFWMjgwLjM3aDQ5LjUxMnYxMzYuNjI1aC00OS41MTJabS03NC4yNjggMjcuMzI1aC03NC4yNjh2LTI3LjMyNWg3NC4yNjh2LTU0LjY1aC00OS41MTJjLTYuNTY2IDAtMTIuODYyLTIuODc5LTE3LjUwNS04LjAwNC00LjY0My01LjEyNC03LjI1MS0xMi4wNzQtNy4yNTEtMTkuMzIxdi01NC42NWMwLTcuMjQ4IDIuNjA4LTE0LjE5OCA3LjI1MS0xOS4zMjIgNC42NDMtNS4xMjUgMTAuOTM5LTguMDA0IDE3LjUwNS04LjAwNGg3NC4yNjh2MjcuMzI2aC03NC4yNjh2NTQuNjVoNDkuNTEyYzYuNTY2IDAgMTIuODYzIDIuODc4IDE3LjUwNSA4LjAwMyA0LjY0MyA1LjEyNCA3LjI1MSAxMi4wNzUgNy4yNTEgMTkuMzIydjU0LjY1YzAgNy4yNDctMi42MDggMTQuMTk3LTcuMjUxIDE5LjMyMS00LjY0MiA1LjEyNS0xMC45MzkgOC4wMDQtMTcuNTA1IDguMDA0WiIvPgogICAgPHBhdGggZmlsbD0iI0M2MjlDRCIgZD0iTTE2MC42OTUgMTMuMDMyYy02My4wNjYgMC0xMzAuOTQzIDE2LjQ1LTEzMC45NDMgNTIuNTU3djIzNi41MDZjMCAyMi4wNyAyNS40MDMgMzYuNzYyIDU5LjUyIDQ0Ljg3di0yNi44ODJjLTIzLjczNi02LjIxLTM1LjA2LTE1LjAxOS0zNS43MTItMTcuOTg4di00Ni45MzhjMTcuNzggOS44NDIgMTcuNzMzIDkuMTg1IDQ1LjQyNCAxMi4wMDl2LTI2LjI0N2MtNDYuMTYyLTQuOTU5LTQzLjk2NS0xMS44OTktNDUuNDI0LTE3LjY2MXYtNDYuOTM3YzI1LjMzIDE0LjAyNSA2Ny4xNjkgMjAuNjU5IDEwNy4xMzUgMjAuNjU5IDYzLjA2NiAwIDEzMC45NDMtMTYuNDUxIDEzMC45NDMtNTIuNTU3di03OC44NGMtLjAwOS0zNi4xMDctNjcuODgxLTUyLjU1LTEzMC45NDMtNTIuNTVaTTUzLjU0MiA2NS43ODdjMS44MTMtNy4yOTUgMzcuNTE0LTI2LjQ3NyAxMDcuMTUzLTI2LjQ3NyA2OS4wMTQgMCAxMDQuNjk0IDE4Ljg0MyAxMDcuMDk3IDI2LjI3OS0yLjQwMyA3LjQzNS0zOC4wODMgMjYuMjc4LTEwNy4wOTcgMjYuMjc4LTY5LjYzOSAwLTEwNS4zMzktMTkuMTgzLTEwNy4xNTMtMjYuMDhabTIxNC4yODggNzguNDdjLTEuOTEyIDcuMzItMzcuNjAxIDI2LjQ0Ni0xMDcuMTM1IDI2LjQ0Ni02OS42MzkgMC0xMDUuMzM5LTE5LjE4NC0xMDcuMTM1LTI2LjI3OVY5Ny40ODdjMjUuMzMgMTQuMDI1IDY3LjE2OSAyMC42NTkgMTA3LjEzNSAyMC42NTkgMzkuOTY2IDAgODEuODA1LTYuNjM0IDEwNy4xMzUtMjAuNjU5djQ2Ljc3WiIvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxjbGlwUGF0aCBpZD0iYSI+CiAgICAgIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yOS43NTQgNmg0NTIuOTkxdjUwMEgyOS43NTR6Ii8+CiAgICA8L2NsaXBQYXRoPgogIDwvZGVmcz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "database"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "query"
      },
      {
        "group": "query"
      },
      {
        "group": "query"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.GoogleGemini.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "input",
          "label": "Configure input"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZD0iTTE2IDguMDE2QTguNTIyIDguNTIyIDAgMDA4LjAxNiAxNmgtLjAzMkE4LjUyMSA4LjUyMSAwIDAwMCA4LjAxNnYtLjAzMkE4LjUyMSA4LjUyMSAwIDAwNy45ODQgMGguMDMyQTguNTIyIDguNTIyIDAgMDAxNiA3Ljk4NHYuMDMyeiIgZmlsbD0idXJsKCNwcmVmaXhfX3BhaW50MF9yYWRpYWxfOTgwXzIwMTQ3KSIvPjxkZWZzPjxyYWRpYWxHcmFkaWVudCBpZD0icHJlZml4X19wYWludDBfcmFkaWFsXzk4MF8yMDE0NyIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxNi4xMzI2IDUuNDU1MyAtNDMuNzAwNDUgMTI5LjIzMjIgMS41ODggNi41MDMpIj48c3RvcCBvZmZzZXQ9Ii4wNjciIHN0b3AtY29sb3I9IiM5MTY4QzAiLz48c3RvcCBvZmZzZXQ9Ii4zNDMiIHN0b3AtY29sb3I9IiM1Njg0RDEiLz48c3RvcCBvZmZzZXQ9Ii42NzIiIHN0b3AtY29sb3I9IiMxQkExRTMiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48L3N2Zz4="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input",
        "tooltip": "System instructions inform how the model should respond. Use them to give the model context to understand the task, provide more custom responses and adhere to specific guidelines. Instructions apply each time you send a request to the model.<a href=\"https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/system-instructions?hl=en\" Learn more about system instructions </a>"
      },
      {
        "group": "input",
        "tooltip": "Grounding connects model output to verifiable sources of information. This is useful in situations where accuracy and reliability are important.<a href=\"https://cloud.google.com/vertex-ai/generative-ai/docs/grounding/overview?hl=en\" Learn more about grounding </a>"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input",
        "tooltip": "You can adjust the likelihood of receiving a model response that could contain harmful content. Content is blocked based on the probability that it's harmful.<a href=\"https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai?hl=en#safety_filters_and_attributes\" Learn more </a>"
      },
      {
        "group": "input",
        "tooltip": "You can adjust the likelihood of receiving a model response that could contain harmful content. Content is blocked based on the probability that it's harmful.<a href=\"https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai?hl=en#safety_filters_and_attributes\" Learn more </a>"
      },
      {
        "group": "input",
        "tooltip": "You can adjust the likelihood of receiving a model response that could contain harmful content. Content is blocked based on the probability that it's harmful.<a href=\"https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai?hl=en#safety_filters_and_attributes\" Learn more </a>"
      },
      {
        "group": "input",
        "tooltip": "You can adjust the likelihood of receiving a model response that could contain harmful content. Content is blocked based on the probability that it's harmful.<a href=\"https://cloud.google.com/vertex-ai/docs/generative-ai/learn/responsible-ai?hl=en#safety_filters_and_attributes\" Learn more </a>"
      },
      {
        "group": "input",
        "tooltip": "A stop sequence is a series of characters (including spaces) that stops response generation if the model encounters it. The sequence is not included as part of the response. You can add up to five stop sequences."
      },
      {
        "group": "input",
        "tooltip": "Temperature controls the randomness in token selection.\nA lower temperature is good when you expect a true or correct response. \nA temperature of 0 means the highest probability token is usually selected.\nA higher temperature can lead to diverse or unexpected results. Some models have a higher temperature max to encourage more random responses."
      },
      {
        "group": "input",
        "tooltip": "Output token limit determines the maximum amount of text output from one prompt. A token is approximately four characters."
      },
      {
        "group": "input",
        "tooltip": "Setting a seed value is useful when you make repeated requests and want the same model response.\nDeterministic outcome isn’t guaranteed. Changing the model or other settings can cause variations in the response even when you use the same seed value."
      },
      {
        "group": "input",
        "tooltip": "Top-K specifies the number of candidate tokens when the model is selecting an output token. Use a lower value for less random responses and a higher value for more random responses."
      },
      {
        "group": "input",
        "tooltip": "Top-p changes how the model selects tokens for output. Tokens are selected from most probable to least until the sum of their probabilities equals the top-p value. For example, if tokens A, B, and C have a probability of .3, .2, and .1 and the top-p value is .5, then the model will select either A or B as the next token (using temperature). For the least variable results, set top-P to 0."
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.GoogleDrive.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "operation",
          "label": "Select operation"
        },
        {
          "id": "operationDetails",
          "label": "Operation details"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='18' height='18' viewBox='0 0 87.3 78' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z' fill='%230066da'/%3E%3Cpath d='m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z' fill='%2300ac47'/%3E%3Cpath d='m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z' fill='%23ea4335'/%3E%3Cpath d='m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z' fill='%2300832d'/%3E%3Cpath d='m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z' fill='%232684fc'/%3E%3Cpath d='m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z' fill='%23ffba00'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "operation"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.Twilio.Webhook.Intermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook Configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable Mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' preserveAspectRatio='xMidYMid' viewBox='0 0 256 256' id='twilio'%3E%3Cg fill='%23CF272D'%3E%3Cpath d='M127.86 222.304c-52.005 0-94.164-42.159-94.164-94.163 0-52.005 42.159-94.163 94.164-94.163 52.004 0 94.162 42.158 94.162 94.163 0 52.004-42.158 94.163-94.162 94.163zm0-222.023C57.245.281 0 57.527 0 128.141 0 198.756 57.245 256 127.86 256c70.614 0 127.859-57.244 127.859-127.859 0-70.614-57.245-127.86-127.86-127.86z'%3E%3C/path%3E%3Cpath d='M133.116 96.297c0-14.682 11.903-26.585 26.586-26.585 14.683 0 26.585 11.903 26.585 26.585 0 14.684-11.902 26.586-26.585 26.586-14.683 0-26.586-11.902-26.586-26.586M133.116 159.983c0-14.682 11.903-26.586 26.586-26.586 14.683 0 26.585 11.904 26.585 26.586 0 14.683-11.902 26.586-26.585 26.586-14.683 0-26.586-11.903-26.586-26.586M69.431 159.983c0-14.682 11.904-26.586 26.586-26.586 14.683 0 26.586 11.904 26.586 26.586 0 14.683-11.903 26.586-26.586 26.586-14.682 0-26.586-11.903-26.586-26.586M69.431 96.298c0-14.683 11.904-26.585 26.586-26.585 14.683 0 26.586 11.902 26.586 26.585 0 14.684-11.903 26.586-26.586 26.586-14.682 0-26.586-11.902-26.586-26.586'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.ServiceNowFlow.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "sn",
          "label": "ServiceNow"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "HTTP endpoint"
        },
        {
          "id": "timeout",
          "label": "Connection timeout"
        },
        {
          "id": "payload",
          "label": "Payload"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjAxIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6bXVsdGlwbHkiLz4KPHJlY3Qgd2lkdGg9IjUxMC41NjIiIGhlaWdodD0iNTEwLjU2MiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC43MTg3NSAwLjcxODc1KSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjU1LjkwNSA0MjEuNDQyQzE4MS45NTggNDIxLjQ0MiAxMzEuMzM4IDM2NS43MTUgMTMxLjMzOCAyOTYuNzg3QzEzMS4zMzggMjI3LjgyNyAxODEuOTU4IDE3MS4xNjcgMjU1LjkwNSAxNzEuMTY3QzMyOS44OTIgMTcxLjE2NyAzODAuNDcxIDIyNy44MjcgMzgwLjQ3MSAyOTYuNzg3QzM4MC40NzEgMzY1LjcxNSAzMjkuODkyIDQyMS40NDIgMjU1LjkwNSA0MjEuNDQyWk0yNTcuMzYyIDQ2LjAzN0MxMjAuODM4IDQ1LjI0NzMgNy45MjUyOCAxNTcuMDQ5IDYuNzcyMDcgMjk0LjE5M0M2LjE4NTM1IDM2Ni43OSAzNi4zNzExIDQzMi4zMzMgODUuMDI4MyA0NzguNDE5QzEwMi43MzEgNDk1LjE3IDEzMC4wODQgNDk2LjggMTQ5LjI2NCA0ODEuODJDMTc3LjYyOSA0NTkuNjU5IDIxNC4wNDYgNDQ2LjQ1OCAyNTUuOTA1IDQ0Ni40NThDMjk3Ljc2NCA0NDYuNDU4IDMzNC4xODEgNDU5LjY2NyAzNjIuNTQ2IDQ4MS44MkMzODEuOTA4IDQ5Ni45MjYgNDA5LjM2MiA0OTQuOTg5IDQyNy4xNjYgNDc4LjA1NUM0NzUuMTE1IDQzMi40NDQgNTA1LjA1OCAzNjcuODY2IDUwNS4wNTggMjk2LjMwNUM1MDUuMDU4IDE1OC41ODMgMzk0LjI2OSA0Ni44Mjg2IDI1Ny4zNjIgNDYuMDM3WiIgZmlsbD0iIzZBQzYzRiIvPgo8Y2lyY2xlIGN4PSIzODAuNjE4IiBjeT0iMTQ0LjUyNSIgcj0iMTI0LjYxOCIgZmlsbD0iI0RBMUUyOCIvPgo8cGF0aCBkPSJNMzQzLjg4MSAyMDUuNjU2QzM0Mi41MDkgMjA1LjY1NiAzNDEuMTkzIDIwNS4xMTQgMzQwLjIyMyAyMDQuMTQ5QzMzOS4yNTIgMjAzLjE4NSAzMzguNzA3IDIwMS44NzYgMzM4LjcwNyAyMDAuNTEyVjg3LjMzMThDMzM4LjcwNyA4Ni40Mzc4IDMzOC45NDEgODUuNTU5MiAzMzkuMzg3IDg0Ljc4MjZDMzM5LjgzMiA4NC4wMDYgMzQwLjQ3NCA4My4zNTgyIDM0MS4yNDggODIuOTAzMkMzNDIuMDIyIDgyLjQ0ODEgMzQyLjkwMiA4Mi4yMDE1IDM0My44MDEgODIuMTg3NUMzNDQuNyA4Mi4xNzM2IDM0NS41ODcgODIuMzkyOCAzNDYuMzc1IDgyLjgyMzdMNDQ5Ljg2MyAxMzkuNDE0QzQ1MC42NzUgMTM5Ljg1NyA0NTEuMzUyIDE0MC41MSA0NTEuODI0IDE0MS4zMDNDNDUyLjI5NSAxNDIuMDk2IDQ1Mi41NDQgMTQzIDQ1Mi41NDQgMTQzLjkyMUM0NTIuNTQ0IDE0NC44NDMgNDUyLjI5NSAxNDUuNzQ3IDQ1MS44MjQgMTQ2LjU0QzQ1MS4zNTIgMTQ3LjMzMyA0NTAuNjc1IDE0Ny45ODUgNDQ5Ljg2MyAxNDguNDI5TDM0Ni4zNzUgMjA1LjAxOUMzNDUuNjExIDIwNS40MzcgMzQ0Ljc1MyAyMDUuNjU2IDM0My44ODEgMjA1LjY1NloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "sn"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "timeout"
      },
      {
        "group": "timeout"
      },
      {
        "group": "sn"
      },
      {
        "group": "payload",
        "tooltip": "Null values will not be sent"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.inbound.AWSSNS.Boundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "subscription",
          "label": "Subscription Configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable Mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 80 80' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/64/Arch_AWS-Simple-Notification-Service_64%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/64/Arch_AWS-Simple-Notification-Service_64' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/64/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='80' height='80'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M17,38 C18.103,38 19,38.897 19,40 C19,41.103 18.103,42 17,42 C15.897,42 15,41.103 15,40 C15,38.897 15.897,38 17,38 L17,38 Z M41,64 C29.314,64 19.289,55.466 17.194,43.98 C18.965,43.894 20.427,42.659 20.857,41 L27,41 L27,39 L20.857,39 C20.427,37.342 18.966,36.107 17.195,36.02 C19.285,24.71 29.511,16 41,16 C45.313,16 49.832,17.622 54.429,20.821 L55.571,19.179 C50.633,15.743 45.73,14 41,14 C28.27,14 16.949,23.865 15.063,36.521 C13.839,37.207 13,38.5 13,40 C13,41.5 13.839,42.793 15.063,43.478 C16.97,56.341 28.056,66 41,66 C46.407,66 51.942,64.157 56.585,60.811 L55.415,59.189 C51.11,62.292 45.991,64 41,64 L41,64 Z M30.101,36.442 C31.955,36.895 34.275,37 36,37 C37.642,37 39.823,36.905 41.629,36.506 L37.105,45.553 C37.036,45.691 37,45.845 37,46 L37,50.453 C36.199,50.964 34.833,51.812 34,51.986 L34,46 C34,45.868 33.974,45.737 33.923,45.615 L30.101,36.442 Z M36,33 C40.025,33 42.174,33.604 42.841,34 C42.174,34.396 40.025,35 36,35 C31.975,35 29.826,34.396 29.159,34 C29.826,33.604 31.975,33 36,33 L36,33 Z M33,54 L34,54 C34.043,54 34.086,53.997 34.128,53.992 C35.352,53.833 36.909,52.887 38.272,52.013 L38.535,51.845 C38.824,51.661 39,51.342 39,51 L39,46.236 L44.559,35.12 C44.833,34.801 45,34.434 45,34 C45,31.39 39.361,31 36,31 C32.639,31 27,31.39 27,34 C27,34.366 27.12,34.684 27.32,34.967 L32,46.2 L32,53 C32,53.552 32.447,54 33,54 L33,54 Z M62,53 C63.103,53 64,53.897 64,55 C64,56.103 63.103,57 62,57 C60.897,57 60,56.103 60,55 C60,53.897 60.897,53 62,53 L62,53 Z M62,23 C63.103,23 64,23.897 64,25 C64,26.103 63.103,27 62,27 C60.897,27 60,26.103 60,25 C60,23.897 60.897,23 62,23 L62,23 Z M64,38 C65.103,38 66,38.897 66,40 C66,41.103 65.103,42 64,42 C62.897,42 62,41.103 62,40 C62,38.897 62.897,38 64,38 L64,38 Z M54,41 L60.143,41 C60.589,42.72 62.142,44 64,44 C66.206,44 68,42.206 68,40 C68,37.794 66.206,36 64,36 C62.142,36 60.589,37.28 60.143,39 L54,39 L54,26 L58.143,26 C58.589,27.72 60.142,29 62,29 C64.206,29 66,27.206 66,25 C66,22.794 64.206,21 62,21 C60.142,21 58.589,22.28 58.143,24 L53,24 C52.447,24 52,24.448 52,25 L52,39 L45,39 L45,41 L52,41 L52,55 C52,55.552 52.447,56 53,56 L58.143,56 C58.589,57.72 60.142,59 62,59 C64.206,59 66,57.206 66,55 C66,52.794 64.206,51 62,51 C60.142,51 58.589,52.28 58.143,54 L54,54 L54,41 Z' id='AWS-Simple-Notification-Service_Icon_64_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.OpenAI.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjU2cHgiIGhlaWdodD0iMjYwcHgiIHZpZXdCb3g9IjAgMCAyNTYgMjYwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KICAgIDx0aXRsZT5PcGVuQUk8L3RpdGxlPgogICAgPGc+CiAgICAgICAgPHBhdGggZD0iTTIzOS4xODM5MTQsMTA2LjIwMjc4MyBDMjQ1LjA1NDMwNCw4OC41MjQyMDk2IDI0My4wMjIyOCw2OS4xNzMzODA1IDIzMy42MDc1OTksNTMuMDk5ODg2NCBDMjE5LjQ1MTY3OCwyOC40NTg4MDIxIDE5MC45OTk3MDMsMTUuNzgzNjEyOSAxNjMuMjEzMDA3LDIxLjczOTUwNSBDMTQ3LjU1NDA3Nyw0LjMyMTQ1ODgzIDEyMy43OTQ5MDksLTMuNDIzOTg1NTQgMTAwLjg3OTAxLDEuNDE4NzM4OTggQzc3Ljk2MzExMDUsNi4yNjE0NjM0OSA1OS4zNjkwMDkzLDIyLjk1NzI1MzYgNTIuMDk1OTYyMSw0NS4yMjE0MjE5IEMzMy44NDM2NDk0LDQ4Ljk2NDQ4NjcgMTguMDkwMTcyMSw2MC4zOTI3NDkgOC44NjY3MjUxMyw3Ni41ODE4MDMzIEMtNS40NDM0OTEsMTAxLjE4Mjk2MiAtMi4xOTU0NDQzMSwxMzIuMjE1MjU1IDE2Ljg5ODY2NjIsMTUzLjMyMDA5NCBDMTEuMDA2MDg2NSwxNzAuOTkwNjU2IDEzLjAxOTcyODMsMTkwLjM0Mzk5MSAyMi40MjM4MjMxLDIwNi40MjI5OTEgQzM2LjU5NzU1NTMsMjMxLjA3MjM0NCA2NS4wNjgwMzQyLDI0My43NDY1NjYgOTIuODY5NTczOCwyMzcuNzgzMzcyIEMxMDUuMjM1NjM5LDI1MS43MDgyNDkgMTIzLjAwMTExMywyNTkuNjMwOTQyIDE0MS42MjM5NjgsMjU5LjUyNjkyIEMxNzAuMTA1MzU5LDI1OS41NTIxNjkgMTk1LjMzNzYxMSwyNDEuMTY1NzE4IDIwNC4wMzc3NzcsMjE0LjA0NTY2MSBDMjIyLjI4NzM0LDIxMC4yOTYzNTYgMjM4LjAzODQ4OSwxOTguODY5NzgzIDI0Ny4yNjcwMTQsMTgyLjY4NTI4IEMyNjEuNDA0NDUzLDE1OC4xMjc1MTUgMjU4LjE0MjQ5NCwxMjcuMjYyNzc1IDIzOS4xODM5MTQsMTA2LjIwMjc4MyBMMjM5LjE4MzkxNCwxMDYuMjAyNzgzIFogTTE0MS42MjM5NjgsMjQyLjU0MTIwNyBDMTMwLjI1NTY4MiwyNDIuNTU5MTc3IDExOS4yNDM4NzYsMjM4LjU3NDY0MiAxMTAuNTE5MzgxLDIzMS4yODYxOTcgTDExMi4wNTQxNDYsMjMwLjQxNjQ5NiBMMTYzLjcyNDU5NSwyMDAuNTkwODgxIEMxNjYuMzQwNjQ4LDE5OS4wNTY0NDQgMTY3Ljk1NDMyMSwxOTYuMjU2ODE4IDE2Ny45NzA3ODEsMTkzLjIyNDAwNSBMMTY3Ljk3MDc4MSwxMjAuMzczNzg4IEwxODkuODE1NjE0LDEzMy4wMTAwMjYgQzE5MC4wMzQxMzIsMTMzLjEyMTQyMyAxOTAuMTg2MjM1LDEzMy4zMzA1NjQgMTkwLjIyNDg4NSwxMzMuNTcyNzc0IEwxOTAuMjI0ODg1LDE5My45NDAyMjkgQzE5MC4xNjg2MDMsMjIwLjc1ODQyNyAxNjguNDQyMTY2LDI0Mi40ODQ4NjQgMTQxLjYyMzk2OCwyNDIuNTQxMjA3IFogTTM3LjE1NzU3NDksMTk3LjkzMDYyIEMzMS40NTY0OTgsMTg4LjA4NjM1OSAyOS40MDk0ODE4LDE3Ni41NDY5ODQgMzEuMzc2NjIzNywxNjUuMzQyNDI2IEwzMi45MTEzODk1LDE2Ni4yNjMyODUgTDg0LjYzMjk5NzMsMTk2LjA4ODkwMSBDODcuMjM4OTM0OSwxOTcuNjE4MjA3IDkwLjQ2ODI3MTcsMTk3LjYxODIwNyA5My4wNzQyMDkzLDE5Ni4wODg5MDEgTDE1Ni4yNTU0MDIsMTU5LjY2Mzc5MyBMMTU2LjI1NTQwMiwxODQuODg1MTExIEMxNTYuMjQzNTU3LDE4NS4xNDk3NzEgMTU2LjExMTcyNSwxODUuMzk0NjAyIDE1NS44OTcyOSwxODUuNTUwMTc2IEwxMDMuNTYxNzc2LDIxNS43MzM5MDMgQzgwLjMwNTQ5NTMsMjI5LjEzMTYzMiA1MC41OTI0OTU0LDIyMS4xNjU0MzUgMzcuMTU3NTc0OSwxOTcuOTMwNjIgWiBNMjMuNTQ5MzE4MSw4NS4zODExMjczIEMyOS4yODk5ODYxLDc1LjQ3MzMwOTcgMzguMzUxMTkxMSw2Ny45MTYyNjQ4IDQ5LjEyODc0ODIsNjQuMDQ3ODgyNSBMNDkuMTI4NzQ4MiwxMjUuNDM4NTE1IEM0OS4wODkxNDkyLDEyOC40NTk0MjUgNTAuNjk2NTM4NiwxMzEuMjYyNTU2IDUzLjMyMzc3NDgsMTMyLjc1NDIzMiBMMTE2LjE5ODAxNCwxNjkuMDI1ODY0IEw5NC4zNTMxODA4LDE4MS42NjIxMDIgQzk0LjExMzIzMjUsMTgxLjc4OTQzNCA5My44MjU3NDYxLDE4MS43ODk0MzQgOTMuNTg1Nzk3OSwxODEuNjYyMTAyIEw0MS4zNTI2MDE1LDE1MS41Mjk1MzQgQzE4LjE0MTk0MjYsMTM4LjA3NjA5OCAxMC4xODE3NjgxLDEwOC4zODU1NjIgMjMuNTQ5MzE4MSw4NS4xMjUzMzMgTDIzLjU0OTMxODEsODUuMzgxMTI3MyBaIE0yMDMuMDE0NiwxMjcuMDc1NTk4IEwxMzkuOTM1NzI1LDkwLjQ0NTg1NDUgTDE2MS43Mjk0LDc3Ljg2MDc3NDggQzE2MS45NjkzNDgsNzcuNzMzNDQzNCAxNjIuMjU2ODM0LDc3LjczMzQ0MzQgMTYyLjQ5Njc4Myw3Ny44NjA3NzQ4IEwyMTQuNzI5OTc5LDEwOC4wNDQ1MDIgQzIzMS4wMzIzMjksMTE3LjQ1MTc0NyAyNDAuNDM3Mjk0LDEzNS40MjYxMDkgMjM4Ljg3MTUwNCwxNTQuMTgyNzM5IEMyMzcuMzA1NzE0LDE3Mi45MzkzNjggMjI1LjA1MDcxOSwxODkuMTA1NTcyIDIwNy40MTQyNjIsMTk1LjY3OTYzIEwyMDcuNDE0MjYyLDEzNC4yODg5OTggQzIwNy4zMjI1MjEsMTMxLjI3Njg2NyAyMDUuNjUwNjk3LDEyOC41MzU4NTMgMjAzLjAxNDYsMTI3LjA3NTU5OCBaIE0yMjQuNzU3MTE2LDk0LjM4NTA4NjcgTDIyMy4yMjIzNSw5My40NjQyMjcyIEwxNzEuNjAzMDYsNjMuMzgyODE3MyBDMTY4Ljk4MTI5Myw2MS44NDQzNzUxIDE2NS43MzI0NTYsNjEuODQ0Mzc1MSAxNjMuMTEwNjg5LDYzLjM4MjgxNzMgTDk5Ljk4MDY1NTQsOTkuODA3OTI1OSBMOTkuOTgwNjU1NCw3NC41ODY2MDc3IEM5OS45NTMzMDA0LDc0LjMyNTQwODggMTAwLjA3MTA5NSw3NC4wNzAxODY5IDEwMC4yODc2MDksNzMuOTIxNTQyNiBMMTUyLjUyMDgwNSw0My43ODg5NzM4IEMxNjguODYzMDk4LDM0LjM3NDM1MTggMTg5LjE3NDI1NiwzNS4yNTI5MDQzIDIwNC42NDI1NzksNDYuMDQzNDg0MSBDMjIwLjExMDkwMyw1Ni44MzQwNjM4IDIyNy45NDkyNjksNzUuNTkyMzk1OSAyMjQuNzU3MTE2LDk0LjE4MDQ1MTMgTDIyNC43NTcxMTYsOTQuMzg1MDg2NyBaIE04OC4wNjA2NDA5LDEzOS4wOTc5MzEgTDY2LjIxNTgwNzYsMTI2LjUxMjg1MSBDNjUuOTk1MDM5OSwxMjYuMzc5MDkxIDY1Ljg0NTA5NjUsMTI2LjE1NDE3NiA2NS44MDY1MzY3LDEyNS44OTg5NDUgTDY1LjgwNjUzNjcsNjUuNjg0OTY2IEM2NS44MzE0NDk1LDQ2LjgyODUzNjcgNzYuNzUwMDYwNSwyOS42ODQ2MDMyIDkzLjgyNzA4NTIsMjEuNjg4MzA1NSBDMTEwLjkwNDExLDEzLjY5MjAwNzkgMTMxLjA2MzgzMywxNi4yODM1NDYyIDE0NS41NjMyLDI4LjMzODk5OCBMMTQ0LjAyODQzNCwyOS4yMDg2OTg2IEw5Mi4zNTc5ODUyLDU5LjAzNDMxNDIgQzg5Ljc0MTkzMjcsNjAuNTY4NzUxMyA4OC4xMjgyNTk3LDYzLjM2ODM3NjcgODguMTExNzk5OCw2Ni40MDExOTAxIEw4OC4wNjA2NDA5LDEzOS4wOTc5MzEgWiBNOTkuOTI5NDk2NSwxMTMuNTE4NSBMMTI4LjA2Njg3LDk3LjMwMTE0MTcgTDE1Ni4yNTU0MDIsMTEzLjUxODUgTDE1Ni4yNTU0MDIsMTQ1Ljk1MzIxOCBMMTI4LjE2OTE4NywxNjIuMTcwNTc3IEw5OS45ODA2NTU0LDE0NS45NTMyMTggTDk5LjkyOTQ5NjUsMTEzLjUxODUgWiIgZmlsbD0iIzAwMDAwMCI+PC9wYXRoPgogICAgPC9nPgo8L3N2Zz4K"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "input",
          "label": "Payload"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {},
      {},
      {},
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.webhook.GithubWebhookConnectorMessageStart.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 1024 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z' transform='scale(64)' fill='%231B1F23'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.TwilioWebhook.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' preserveAspectRatio='xMidYMid' viewBox='0 0 256 256' id='twilio'%3E%3Cg fill='%23CF272D'%3E%3Cpath d='M127.86 222.304c-52.005 0-94.164-42.159-94.164-94.163 0-52.005 42.159-94.163 94.164-94.163 52.004 0 94.162 42.158 94.162 94.163 0 52.004-42.158 94.163-94.162 94.163zm0-222.023C57.245.281 0 57.527 0 128.141 0 198.756 57.245 256 127.86 256c70.614 0 127.859-57.244 127.859-127.859 0-70.614-57.245-127.86-127.86-127.86z'%3E%3C/path%3E%3Cpath d='M133.116 96.297c0-14.682 11.903-26.585 26.586-26.585 14.683 0 26.585 11.903 26.585 26.585 0 14.684-11.902 26.586-26.585 26.586-14.683 0-26.586-11.902-26.586-26.586M133.116 159.983c0-14.682 11.903-26.586 26.586-26.586 14.683 0 26.585 11.904 26.585 26.586 0 14.683-11.902 26.586-26.585 26.586-14.683 0-26.586-11.903-26.586-26.586M69.431 159.983c0-14.682 11.904-26.586 26.586-26.586 14.683 0 26.586 11.904 26.586 26.586 0 14.683-11.903 26.586-26.586 26.586-14.682 0-26.586-11.903-26.586-26.586M69.431 96.298c0-14.683 11.904-26.585 26.586-26.585 14.683 0 26.586 11.902 26.586 26.585 0 14.684-11.903 26.586-26.586 26.586-14.682 0-26.586-11.902-26.586-26.586'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.AWSSNS.MessageStartEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "subscription",
          "label": "Subscription configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable Mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 80 80' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/64/Arch_AWS-Simple-Notification-Service_64%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/64/Arch_AWS-Simple-Notification-Service_64' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/64/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='80' height='80'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M17,38 C18.103,38 19,38.897 19,40 C19,41.103 18.103,42 17,42 C15.897,42 15,41.103 15,40 C15,38.897 15.897,38 17,38 L17,38 Z M41,64 C29.314,64 19.289,55.466 17.194,43.98 C18.965,43.894 20.427,42.659 20.857,41 L27,41 L27,39 L20.857,39 C20.427,37.342 18.966,36.107 17.195,36.02 C19.285,24.71 29.511,16 41,16 C45.313,16 49.832,17.622 54.429,20.821 L55.571,19.179 C50.633,15.743 45.73,14 41,14 C28.27,14 16.949,23.865 15.063,36.521 C13.839,37.207 13,38.5 13,40 C13,41.5 13.839,42.793 15.063,43.478 C16.97,56.341 28.056,66 41,66 C46.407,66 51.942,64.157 56.585,60.811 L55.415,59.189 C51.11,62.292 45.991,64 41,64 L41,64 Z M30.101,36.442 C31.955,36.895 34.275,37 36,37 C37.642,37 39.823,36.905 41.629,36.506 L37.105,45.553 C37.036,45.691 37,45.845 37,46 L37,50.453 C36.199,50.964 34.833,51.812 34,51.986 L34,46 C34,45.868 33.974,45.737 33.923,45.615 L30.101,36.442 Z M36,33 C40.025,33 42.174,33.604 42.841,34 C42.174,34.396 40.025,35 36,35 C31.975,35 29.826,34.396 29.159,34 C29.826,33.604 31.975,33 36,33 L36,33 Z M33,54 L34,54 C34.043,54 34.086,53.997 34.128,53.992 C35.352,53.833 36.909,52.887 38.272,52.013 L38.535,51.845 C38.824,51.661 39,51.342 39,51 L39,46.236 L44.559,35.12 C44.833,34.801 45,34.434 45,34 C45,31.39 39.361,31 36,31 C32.639,31 27,31.39 27,34 C27,34.366 27.12,34.684 27.32,34.967 L32,46.2 L32,53 C32,53.552 32.447,54 33,54 L33,54 Z M62,53 C63.103,53 64,53.897 64,55 C64,56.103 63.103,57 62,57 C60.897,57 60,56.103 60,55 C60,53.897 60.897,53 62,53 L62,53 Z M62,23 C63.103,23 64,23.897 64,25 C64,26.103 63.103,27 62,27 C60.897,27 60,26.103 60,25 C60,23.897 60.897,23 62,23 L62,23 Z M64,38 C65.103,38 66,38.897 66,40 C66,41.103 65.103,42 64,42 C62.897,42 62,41.103 62,40 C62,38.897 62.897,38 64,38 L64,38 Z M54,41 L60.143,41 C60.589,42.72 62.142,44 64,44 C66.206,44 68,42.206 68,40 C68,37.794 66.206,36 64,36 C62.142,36 60.589,37.28 60.143,39 L54,39 L54,26 L58.143,26 C58.589,27.72 60.142,29 62,29 C64.206,29 66,27.206 66,25 C66,22.794 64.206,21 62,21 C60.142,21 58.589,22.28 58.143,24 L53,24 C52.447,24 52,24.448 52,25 L52,39 L45,39 L45,41 L52,41 L52,55 C52,55.552 52.447,56 53,56 L58.143,56 C58.589,57.72 60.142,59 62,59 C64.206,59 66,57.206 66,55 C66,52.794 64.206,51 62,51 C60.142,51 58.589,52.28 58.143,54 L54,54 L54,41 Z' id='AWS-Simple-Notification-Service_Icon_64_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.GoogleSheets.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "operation",
          "label": "Select operation"
        },
        {
          "id": "operationDetails",
          "label": "Operation details"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMC8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgaWQ9ImJvZHlfMSIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE0Ij4KCjxnIHRyYW5zZm9ybT0ibWF0cml4KDAuMTU5MDkwOSAwIDAgMC4xNTkwOTA5IDMuOTA5MDkxIC0wKSI+CiAgICA8cGF0aCBkPSJNNDIgMEw2NCAyMkw1MyAyNEw0MiAyMkw0MCAxMUw0MiAweiIgc3Ryb2tlPSJub25lIiBmaWxsPSIjMTg4MDM4IiBmaWxsLXJ1bGU9Im5vbnplcm8iIC8+CiAgICA8cGF0aCBkPSJNNDIgMjJMNDIgMEw2IDBDIDIuNjg1IDAgMCAyLjY4NSAwIDZMMCA2TDAgODJDIDAgODUuMzE1IDIuNjg1IDg4IDYgODhMNiA4OEw1OCA4OEMgNjEuMzE1IDg4IDY0IDg1LjMxNSA2NCA4Mkw2NCA4Mkw2NCAyMkw0MiAyMnoiIHN0cm9rZT0ibm9uZSIgZmlsbD0iIzM0QTg1MyIgZmlsbC1ydWxlPSJub256ZXJvIiAvPgogICAgPHBhdGggZD0iTTEyIDM0TDEyIDYzTDUyIDYzTDUyIDM0TDEyIDM0ek0yOS41IDU4TDE3IDU4TDE3IDUxTDI5LjUgNTF6TTI5LjUgNDZMMTcgNDZMMTcgMzlMMjkuNSAzOXpNNDcgNThMMzQuNSA1OEwzNC41IDUxTDQ3IDUxek00NyA0NkwzNC41IDQ2TDM0LjUgMzlMNDcgMzl6IiBzdHJva2U9Im5vbmUiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgLz4KPC9nPgo8L3N2Zz4="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "operation"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.ServiceNow.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "sn",
          "label": "ServiceNow"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "HTTP endpoint"
        },
        {
          "id": "timeout",
          "label": "Connection timeout"
        },
        {
          "id": "payload",
          "label": "Payload"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjAxIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6bXVsdGlwbHkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0yNTUuOTkzIDQwOS4zODhDMTgxLjU4OCA0MDkuMzg4IDEzMC42NTQgMzUzLjI5MiAxMzAuNjU0IDI4My45MDhDMTMwLjY1NCAyMTQuNDkxIDE4MS41ODggMTU3LjQ1NSAyNTUuOTkzIDE1Ny40NTVDMzMwLjQ0IDE1Ny40NTUgMzgxLjMzMyAyMTQuNDkxIDM4MS4zMzMgMjgzLjkwOEMzODEuMzMzIDM1My4yOTIgMzMwLjQ0IDQwOS4zODggMjU1Ljk5MyA0MDkuMzg4Wk0yNTcuNDU5IDMxLjQ5NjdDMTIwLjA4OSAzMC43MDE5IDYuNDc1NDUgMTQzLjI0NCA1LjMxNTA5IDI4MS4yOTZDNC43MjQ3NCAzNTQuMzc0IDM1LjA5NzggNDIwLjM1MSA4NC4wNTY4IDQ2Ni43NDJDMTAxLjg2OSA0ODMuNjA1IDEyOS4zOTIgNDg1LjI0NSAxNDguNjkxIDQ3MC4xNjZDMTc3LjIzMiA0NDcuODU4IDIxMy44NzQgNDM0LjU3IDI1NS45OTMgNDM0LjU3QzI5OC4xMTIgNDM0LjU3IDMzNC43NTUgNDQ3Ljg2NiAzNjMuMjk2IDQ3MC4xNjZDMzgyLjc3OCA0ODUuMzcyIDQxMC40MDMgNDgzLjQyMiA0MjguMzE3IDQ2Ni4zNzZDNDc2LjU2NCA0MjAuNDYzIDUwNi42OTIgMzU1LjQ1NyA1MDYuNjkyIDI4My40MjJDNTA2LjY5MiAxNDQuNzg4IDM5NS4yMTYgMzIuMjkzNiAyNTcuNDU5IDMxLjQ5NjdaIiBmaWxsPSIjNkFDNjNGIi8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "sn"
      },
      {
        "group": "sn"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "timeout"
      },
      {
        "group": "timeout"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.http.Polling.Boundary": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3C%3Fxml version='1.0'%3F%3E%3Csvg width='18' height='18' xmlns='http://www.w3.org/2000/svg' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cg class='layer'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath d='m17.03,9c0,4.45 -3.6,8.05 -8.05,8.05c-4.45,0 -8.05,-3.6 -8.05,-8.05c0,-4.45 3.6,-8.05 8.05,-8.05c4.45,0 8.05,3.6 8.05,8.05z' fill='%23505562' id='svg_1'/%3E%3Cpath d='m4.93,14.16l1.85,-10.45l3.36,0c1.05,0 1.84,0.27 2.37,0.81c0.54,0.53 0.8,1.21 0.8,2.06c0,0.86 -0.24,1.58 -0.73,2.13c-0.47,0.55 -1.12,0.93 -1.95,1.14l-0.48,0.09l-0.53,0.03l-0.6,0.05l-1.79,0l-0.73,4.14l-1.58,0zm2.57,-5.57l1.74,0c0.76,0 1.35,-0.17 1.78,-0.5c0.44,-0.35 0.65,-0.82 0.65,-1.42c0,-0.48 -0.15,-0.85 -0.44,-1.12c-0.3,-0.28 -0.77,-0.42 -1.42,-0.42l-1.7,0l-0.61,3.46z' fill='white' id='svg_2'/%3E%3C/g%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "HTTP Polling configuration"
        },
        {
          "id": "input",
          "label": "Payload"
        },
        {
          "id": "activation",
          "label": "Condition to proceed"
        },
        {
          "id": "timer",
          "label": "Timer"
        },
        {
          "id": "timeout",
          "label": "Connect timeout"
        },
        {
          "id": "variable-mapping",
          "label": "Response mapping"
        }
      ]
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.AWSSQS.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "queueProperties",
          "label": "Queue properties"
        },
        {
          "id": "input",
          "label": "Input message data"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 40 40' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/32/Arch_AWS-Simple-Queue-Service_32%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/32/Arch_AWS-Simple-Queue-Service_32' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/32/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='40' height='40'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M14.3422051,22.3493786 L15.8466767,20.9061074 C15.9428347,20.8141539 15.9969235,20.687218 15.9999285,20.5552846 C16.0019317,20.4223517 15.9518495,20.2934168 15.8596981,20.1984648 L14.3552264,18.6432502 L13.6350433,19.3378994 L14.311154,20.037546 L11.9913429,20.037546 L11.9913429,21.0370413 L14.2650783,21.0370413 L13.6480647,21.6287425 L14.3422051,22.3493786 Z M26.3579452,22.3533765 L27.9074909,20.9001104 C28.0066538,20.8081569 28.0627459,20.679222 28.0647492,20.5442901 C28.0667525,20.4093583 28.0136653,20.2784244 27.918509,20.1834724 L26.3689633,18.6372532 L25.6607999,19.3438963 L26.3549403,20.037546 L24.0110896,20.037546 L24.0110896,21.0370413 L26.2988481,21.0370413 L25.671818,21.6247445 L26.3579452,22.3533765 Z M17.5875367,23.3608678 C18.3387708,23.0570212 19.1621235,22.8941035 20.0045074,22.8941035 C20.8468913,22.8941035 21.670244,23.0570212 22.4214781,23.3608678 C21.7523789,21.5897622 21.7523789,19.3898731 22.4214781,17.6187675 C20.9190098,18.2264606 19.090005,18.2264606 17.5875367,17.6187675 C18.2566359,19.3898731 18.2566359,21.5897622 17.5875367,23.3608678 L17.5875367,23.3608678 Z M15.6443443,25.3408679 C15.546183,25.2439168 15.4971024,25.1159814 15.4971024,24.988046 C15.4971024,24.8601106 15.546183,24.7321753 15.6443443,24.6342247 C17.5845317,22.6982024 17.5845317,18.2824324 15.6443443,16.3454106 C15.546183,16.2484595 15.4971024,16.1205241 15.4971024,15.9925912 C15.4971024,15.8646534 15.546183,15.736718 15.6443443,15.6387674 C15.8396652,15.4438659 16.1571868,15.4438659 16.3525077,15.6387674 C17.2740216,16.5583031 18.6052086,17.0860366 20.0045074,17.0860366 C21.4048079,17.0860366 22.7359948,16.5583031 23.6575088,15.6387674 C23.8528296,15.4438659 24.1703513,15.4438659 24.3656722,15.6387674 C24.4628318,15.736718 24.5119124,15.8646534 24.5119124,15.9925912 C24.5119124,16.1205241 24.4628318,16.2484595 24.3656722,16.3454106 C22.4244831,18.2824324 22.4244831,22.6982024 24.3656722,24.6342247 C24.4628318,24.7321753 24.5119124,24.8601106 24.5119124,24.988046 C24.5119124,25.1159814 24.4628318,25.2439168 24.3656722,25.3408679 C24.2675109,25.4388184 24.1393003,25.4877937 24.0110896,25.4877937 C23.882879,25.4877937 23.7546684,25.4388184 23.6575088,25.3408679 C22.7359948,24.4213322 21.4048079,23.8935987 20.0045074,23.8935987 C18.6052086,23.8935987 17.2740216,24.4213322 16.3525077,25.3408679 C16.1571868,25.5357694 15.8396652,25.5357694 15.6443443,25.3408679 L15.6443443,25.3408679 Z M32.5421049,19.4358499 C32.236603,19.1320033 31.8369464,18.9800801 31.4362882,18.9800801 C31.0366316,18.9800801 30.636975,19.1320033 30.3314731,19.4358499 C29.721471,20.0445425 29.721471,21.0340428 30.3314731,21.6417359 C30.9414753,22.2504285 31.9321027,22.2504285 32.5421049,21.6417359 C33.1511054,21.0340428 33.1511054,20.0445425 32.5421049,19.4358499 L32.5421049,19.4358499 Z M33.2502683,22.3493786 C32.7504472,22.8481267 32.0933677,23.0980005 31.4362882,23.0980005 C30.7802103,23.0980005 30.1231309,22.8481267 29.6233097,22.3493786 C28.6236675,21.3508828 28.6236675,19.7277025 29.6233097,18.7292068 C30.622952,17.7317105 32.250626,17.7317105 33.2502683,18.7292068 C34.2499106,19.7277025 34.2499106,21.3508828 33.2502683,22.3493786 L33.2502683,22.3493786 Z M9.66852687,19.4468443 C9.36302497,19.1429978 8.96336839,18.9910745 8.56271017,18.9910745 C8.16305359,18.9910745 7.76339701,19.1429978 7.45789511,19.4468443 C6.84889461,20.055537 6.84889461,21.0450373 7.45789511,21.6527304 C8.06789726,22.261423 9.05852472,22.261423 9.66852687,21.6527304 C10.2775274,21.0450373 10.2775274,20.055537 9.66852687,19.4468443 L9.66852687,19.4468443 Z M10.3766903,22.3593735 C9.87686914,22.8581217 9.21978965,23.1079955 8.56271017,23.1079955 C7.90663232,23.1079955 7.24955284,22.8581217 6.7497317,22.3593735 C5.75008943,21.3618773 5.75008943,19.738697 6.7497317,18.7402012 C7.74937397,17.7427049 9.37704801,17.7427049 10.3766903,18.7402012 C11.3763325,19.738697 11.3763325,21.3618773 10.3766903,22.3593735 L10.3766903,22.3593735 Z M27.4337125,28.9100654 C25.4364313,30.903059 22.7820705,32.0005047 19.9574301,32.0005047 C17.1327896,32.0005047 14.4784288,30.903059 12.4821492,28.9100654 C11.165987,27.5977281 10.4077413,26.469298 9.94498104,25.1359713 L8.99842599,25.4628063 C9.50726193,26.9290658 10.3626672,28.2104187 11.7739858,29.6167086 C13.9585748,31.7986067 16.8663519,33 19.9574301,33 C23.0495099,33 25.9562853,31.7986067 28.1418759,29.6167086 C29.2827502,28.4782835 30.4206196,27.1869356 31.0115905,25.4608073 L30.0640338,25.1379703 C29.5391715,26.6701966 28.4894469,27.8565974 27.4337125,28.9100654 L27.4337125,28.9100654 Z M9.94498104,15.8596559 L8.99842599,15.5318214 C9.51026687,14.0645624 10.3656722,12.7832095 11.7759891,11.3759202 C16.2863991,6.87519304 23.6264578,6.87419354 28.1378694,11.3759202 C29.2186449,12.4533761 30.4035916,13.7897012 31.0115905,15.5318214 L30.0640338,15.8596559 C29.5241468,14.3094387 28.4293482,13.0800596 27.4297059,12.0825633 C25.434428,10.0915688 22.7810689,8.99612197 19.9574301,8.99612197 C17.1337912,8.99612197 14.4804321,10.0915688 12.4851542,12.0825633 C11.1870215,13.3779092 10.4037347,14.5423211 9.94498104,15.8596559 L9.94498104,15.8596559 Z' id='AWS-Simple-Queue-Service_Icon_32_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.webhook.GithubWebhookConnector.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook Configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable Mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 1024 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z' transform='scale(64)' fill='%231B1F23'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connector.IdpUnstructuredExtractionOutBoundTemplate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "input",
          "label": "Input message data"
        },
        {
          "id": "extractor",
          "label": "Extractor selection"
        },
        {
          "id": "ai",
          "label": "Ai provider selection"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xXzcxKSI+CiAgICAgICAgPGcgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5Ij4KICAgICAgICAgICAgPHBhdGggZD0iTTE5LjE3ODkgMEgwVjE5LjE3ODlIMTkuMTc4OVYwWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPgogICAgICAgIDwvZz4KICAgICAgICA8cGF0aCBkPSJNMTAuMTg3OSA4Ljk5MDFWNS4zOTQwN0g1LjM5MzE4VjEzLjc4NDhIMTMuNzgzOVY4Ljk5MDFIMTAuMTg3OVpNNi41OTE4NiA2LjU5Mjc0SDguOTg5MjFWOC45OTAxSDYuNTkxODZWNi41OTI3NFpNOC45ODkyMSAxMi41ODYxSDYuNTkxODZWMTAuMTg4OEg4Ljk4OTIxVjEyLjU4NjFaTTEyLjU4NTIgMTIuNTg2MUgxMC4xODc5VjEwLjE4ODhIMTIuNTg1MlYxMi41ODYxWiIgZmlsbD0iI0ZDNUQwRCIvPgogICAgICAgIDxwYXRoIGQ9Ik0xNS41ODE5IDE2Ljc4MTVIMy41OTUxNkMzLjI3NzM3IDE2Ljc4MTEgMi45NzI2OSAxNi42NTQ3IDIuNzQ3OTcgMTYuNDNDMi41MjMyNiAxNi4yMDUzIDIuMzk2ODUgMTUuOTAwNiAyLjM5NjQ4IDE1LjU4MjhWMy41OTYwNUMyLjM5Njg1IDMuMjc4MjUgMi41MjMyNiAyLjk3MzU3IDIuNzQ3OTcgMi43NDg4NkMyLjk3MjY5IDIuNTI0MTQgMy4yNzczNyAyLjM5NzczIDMuNTk1MTYgMi4zOTczN0g5LjU4ODU1VjMuNTk2MDVIMy41OTUxNlYxNS41ODI4SDE1LjU4MTlWOS41ODk0NEgxNi43ODA2VjE1LjU4MjhDMTYuNzgwMyAxNS45MDA2IDE2LjY1MzkgMTYuMjA1MyAxNi40MjkxIDE2LjQzQzE2LjIwNDQgMTYuNjU0NyAxNS44OTk3IDE2Ljc4MTEgMTUuNTgxOSAxNi43ODE1WiIgZmlsbD0iIzE2MTYxNiIvPgogICAgICAgIDxwYXRoIGQ9Ik0xNi41MjYzIDUuMDUyNjNDMTYuMzg2OCA1LjA1MjYzIDE2LjI1OTIgNS4xMzE0NyAxNi4xOTY4IDUuMjU2MjZMMTUuODgzNCA1Ljg4MzAyTDE1LjI1NjMgNi4xOTY3NkMxNS4xMzE1IDYuMjU5MTcgMTUuMDUyNiA2LjM4Njc2IDE1LjA1MjYgNi41MjYzMkMxNS4wNTI2IDYuNjY1ODcgMTUuMTMxNSA2Ljc5MzQ2IDE1LjI1NjMgNi44NTU4N0wxNS44ODM0IDcuMTY5MjVMMTYuMTk2OCA3Ljc5NjM3QzE2LjI1OTIgNy45MjExNiAxNi4zODY4IDggMTYuNTI2MyA4QzE2LjY2NTkgOCAxNi43OTM1IDcuOTIxMTYgMTYuODU1OSA3Ljc5NjM3TDE3LjE2OTYgNy4xNjkyNUwxNy43OTY0IDYuODU1ODdDMTcuOTIxMiA2Ljc5MzQ2IDE4IDYuNjY1ODcgMTggNi41MjYzMkMxOCA2LjM4Njc2IDE3LjkyMTIgNi4yNTkxNyAxNy43OTY0IDYuMTk2NzZMMTcuMTY5NiA1Ljg4MzAyTDE2Ljg1NTkgNS4yNTYyNkwxNi44Mjk2IDUuMjExNjRDMTYuNzYxNSA1LjExMjk0IDE2LjY0ODQgNS4wNTI2MyAxNi41MjYzIDUuMDUyNjNaTTEzLjAyNjMgMi4yODk0N0MxMi44ODY4IDIuMjg5NDcgMTIuNzU5MiAyLjM2ODMgMTIuNjk2OCAyLjQ5MzExTDEyLjE5OTIgMy40ODgyOEwxMS4yMDM2IDMuOTg2MjRDMTEuMDc4OCA0LjA0ODY1IDExIDQuMTc2MjMgMTEgNC4zMTU3OUMxMSA0LjQ1NTM1IDExLjA3ODggNC41ODI5MyAxMS4yMDM2IDQuNjQ1MzRMMTIuMTk5MiA1LjE0MjkzTDEyLjY5NjggNi4xMzg0OEMxMi43NTkyIDYuMjYzMjYgMTIuODg2OCA2LjM0MjExIDEzLjAyNjMgNi4zNDIxMUMxMy4xNjU5IDYuMzQyMTEgMTMuMjkzNSA2LjI2MzI2IDEzLjM1NTkgNi4xMzg0OEwxMy44NTM4IDUuMTQyOTNMMTQuODQ5IDQuNjQ1MzRDMTQuOTczOCA0LjU4MjkzIDE1LjA1MjYgNC40NTUzNSAxNS4wNTI2IDQuMzE1NzlDMTUuMDUyNiA0LjE3NjIzIDE0Ljk3MzggNC4wNDg2NSAxNC44NDkgMy45ODYyNEwxMy44NTM4IDMuNDg4MjhMMTMuMzU1OSAyLjQ5MzExTDEzLjMyOTYgMi40NDg1QzEzLjI2MTUgMi4zNDk3NyAxMy4xNDg0IDIuMjg5NDcgMTMuMDI2MyAyLjI4OTQ3Wk0xNi41MjYzIDFDMTYuMzg2OCAxIDE2LjI1OTIgMS4wNzg4MiAxNi4xOTY4IDEuMjAzNjRMMTUuODgzNCAxLjgzMDM5TDE1LjI1NjMgMi4xNDQxMkMxNS4xMzE1IDIuMjA2NTMgMTUuMDUyNiAyLjMzNDE0IDE1LjA1MjYgMi40NzM2OEMxNS4wNTI2IDIuNjEzMjMgMTUuMTMxNSAyLjc0MDg0IDE1LjI1NjMgMi44MDMyNUwxNS44ODM0IDMuMTE2NjJMMTYuMTk2OCAzLjc0MzczQzE2LjI1OTIgMy44Njg1MyAxNi4zODY4IDMuOTQ3MzcgMTYuNTI2MyAzLjk0NzM3QzE2LjY2NTkgMy45NDczNyAxNi43OTM1IDMuODY4NTMgMTYuODU1OSAzLjc0MzczTDE3LjE2OTYgMy4xMTY2MkwxNy43OTY0IDIuODAzMjVDMTcuOTIxMiAyLjc0MDg0IDE4IDIuNjEzMjMgMTggMi40NzM2OEMxOCAyLjMzNDE0IDE3LjkyMTIgMi4yMDY1MyAxNy43OTY0IDIuMTQ0MTJMMTcuMTY5NiAxLjgzMDM5TDE2Ljg1NTkgMS4yMDM2NEwxNi44Mjk2IDEuMTU5MDNDMTYuNzYxNSAxLjA2MDMgMTYuNjQ4NCAxIDE2LjUyNjMgMVoiIGZpbGw9IiNGQzVEMEQiLz4KICAgIDwvZz4KICAgIDxkZWZzPgogICAgICAgIDxjbGlwUGF0aCBpZD0iY2xpcDBfMV83MSI+CiAgICAgICAgICAgIDxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0id2hpdGUiLz4KICAgICAgICA8L2NsaXBQYXRoPgogICAgPC9kZWZzPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.AWSSQS.boundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "queueProperties",
          "label": "Queue properties"
        },
        {
          "id": "messagePollingProperties",
          "label": "Message polling properties"
        },
        {
          "id": "input",
          "label": "Use next attribute names for activation condition"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 40 40' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/32/Arch_AWS-Simple-Queue-Service_32%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/32/Arch_AWS-Simple-Queue-Service_32' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/32/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='40' height='40'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M14.3422051,22.3493786 L15.8466767,20.9061074 C15.9428347,20.8141539 15.9969235,20.687218 15.9999285,20.5552846 C16.0019317,20.4223517 15.9518495,20.2934168 15.8596981,20.1984648 L14.3552264,18.6432502 L13.6350433,19.3378994 L14.311154,20.037546 L11.9913429,20.037546 L11.9913429,21.0370413 L14.2650783,21.0370413 L13.6480647,21.6287425 L14.3422051,22.3493786 Z M26.3579452,22.3533765 L27.9074909,20.9001104 C28.0066538,20.8081569 28.0627459,20.679222 28.0647492,20.5442901 C28.0667525,20.4093583 28.0136653,20.2784244 27.918509,20.1834724 L26.3689633,18.6372532 L25.6607999,19.3438963 L26.3549403,20.037546 L24.0110896,20.037546 L24.0110896,21.0370413 L26.2988481,21.0370413 L25.671818,21.6247445 L26.3579452,22.3533765 Z M17.5875367,23.3608678 C18.3387708,23.0570212 19.1621235,22.8941035 20.0045074,22.8941035 C20.8468913,22.8941035 21.670244,23.0570212 22.4214781,23.3608678 C21.7523789,21.5897622 21.7523789,19.3898731 22.4214781,17.6187675 C20.9190098,18.2264606 19.090005,18.2264606 17.5875367,17.6187675 C18.2566359,19.3898731 18.2566359,21.5897622 17.5875367,23.3608678 L17.5875367,23.3608678 Z M15.6443443,25.3408679 C15.546183,25.2439168 15.4971024,25.1159814 15.4971024,24.988046 C15.4971024,24.8601106 15.546183,24.7321753 15.6443443,24.6342247 C17.5845317,22.6982024 17.5845317,18.2824324 15.6443443,16.3454106 C15.546183,16.2484595 15.4971024,16.1205241 15.4971024,15.9925912 C15.4971024,15.8646534 15.546183,15.736718 15.6443443,15.6387674 C15.8396652,15.4438659 16.1571868,15.4438659 16.3525077,15.6387674 C17.2740216,16.5583031 18.6052086,17.0860366 20.0045074,17.0860366 C21.4048079,17.0860366 22.7359948,16.5583031 23.6575088,15.6387674 C23.8528296,15.4438659 24.1703513,15.4438659 24.3656722,15.6387674 C24.4628318,15.736718 24.5119124,15.8646534 24.5119124,15.9925912 C24.5119124,16.1205241 24.4628318,16.2484595 24.3656722,16.3454106 C22.4244831,18.2824324 22.4244831,22.6982024 24.3656722,24.6342247 C24.4628318,24.7321753 24.5119124,24.8601106 24.5119124,24.988046 C24.5119124,25.1159814 24.4628318,25.2439168 24.3656722,25.3408679 C24.2675109,25.4388184 24.1393003,25.4877937 24.0110896,25.4877937 C23.882879,25.4877937 23.7546684,25.4388184 23.6575088,25.3408679 C22.7359948,24.4213322 21.4048079,23.8935987 20.0045074,23.8935987 C18.6052086,23.8935987 17.2740216,24.4213322 16.3525077,25.3408679 C16.1571868,25.5357694 15.8396652,25.5357694 15.6443443,25.3408679 L15.6443443,25.3408679 Z M32.5421049,19.4358499 C32.236603,19.1320033 31.8369464,18.9800801 31.4362882,18.9800801 C31.0366316,18.9800801 30.636975,19.1320033 30.3314731,19.4358499 C29.721471,20.0445425 29.721471,21.0340428 30.3314731,21.6417359 C30.9414753,22.2504285 31.9321027,22.2504285 32.5421049,21.6417359 C33.1511054,21.0340428 33.1511054,20.0445425 32.5421049,19.4358499 L32.5421049,19.4358499 Z M33.2502683,22.3493786 C32.7504472,22.8481267 32.0933677,23.0980005 31.4362882,23.0980005 C30.7802103,23.0980005 30.1231309,22.8481267 29.6233097,22.3493786 C28.6236675,21.3508828 28.6236675,19.7277025 29.6233097,18.7292068 C30.622952,17.7317105 32.250626,17.7317105 33.2502683,18.7292068 C34.2499106,19.7277025 34.2499106,21.3508828 33.2502683,22.3493786 L33.2502683,22.3493786 Z M9.66852687,19.4468443 C9.36302497,19.1429978 8.96336839,18.9910745 8.56271017,18.9910745 C8.16305359,18.9910745 7.76339701,19.1429978 7.45789511,19.4468443 C6.84889461,20.055537 6.84889461,21.0450373 7.45789511,21.6527304 C8.06789726,22.261423 9.05852472,22.261423 9.66852687,21.6527304 C10.2775274,21.0450373 10.2775274,20.055537 9.66852687,19.4468443 L9.66852687,19.4468443 Z M10.3766903,22.3593735 C9.87686914,22.8581217 9.21978965,23.1079955 8.56271017,23.1079955 C7.90663232,23.1079955 7.24955284,22.8581217 6.7497317,22.3593735 C5.75008943,21.3618773 5.75008943,19.738697 6.7497317,18.7402012 C7.74937397,17.7427049 9.37704801,17.7427049 10.3766903,18.7402012 C11.3763325,19.738697 11.3763325,21.3618773 10.3766903,22.3593735 L10.3766903,22.3593735 Z M27.4337125,28.9100654 C25.4364313,30.903059 22.7820705,32.0005047 19.9574301,32.0005047 C17.1327896,32.0005047 14.4784288,30.903059 12.4821492,28.9100654 C11.165987,27.5977281 10.4077413,26.469298 9.94498104,25.1359713 L8.99842599,25.4628063 C9.50726193,26.9290658 10.3626672,28.2104187 11.7739858,29.6167086 C13.9585748,31.7986067 16.8663519,33 19.9574301,33 C23.0495099,33 25.9562853,31.7986067 28.1418759,29.6167086 C29.2827502,28.4782835 30.4206196,27.1869356 31.0115905,25.4608073 L30.0640338,25.1379703 C29.5391715,26.6701966 28.4894469,27.8565974 27.4337125,28.9100654 L27.4337125,28.9100654 Z M9.94498104,15.8596559 L8.99842599,15.5318214 C9.51026687,14.0645624 10.3656722,12.7832095 11.7759891,11.3759202 C16.2863991,6.87519304 23.6264578,6.87419354 28.1378694,11.3759202 C29.2186449,12.4533761 30.4035916,13.7897012 31.0115905,15.5318214 L30.0640338,15.8596559 C29.5241468,14.3094387 28.4293482,13.0800596 27.4297059,12.0825633 C25.434428,10.0915688 22.7810689,8.99612197 19.9574301,8.99612197 C17.1337912,8.99612197 14.4804321,10.0915688 12.4851542,12.0825633 C11.1870215,13.3779092 10.4037347,14.5423211 9.94498104,15.8596559 L9.94498104,15.8596559 Z' id='AWS-Simple-Queue-Service_Icon_32_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "messagePollingProperties"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.csv": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyMSAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wLjUgM0MwLjUgMS44OTU0MyAxLjM5NTQzIDEgMi41IDFIMTguNUMxOS42MDQ2IDEgMjAuNSAxLjg5NTQzIDIwLjUgM1YxOUMyMC41IDIwLjEwNDYgMTkuNjA0NiAyMSAxOC41IDIxSDIuNUMxLjM5NTQzIDIxIDAuNSAyMC4xMDQ2IDAuNSAxOVYzWiIgZmlsbD0iI0ZGQjdDOCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgogICAgPHBhdGggZD0iTTE2LjA0NzkgMTQuMjY0NEMxNS44Mzg5IDE0LjI2NDQgMTUuNjY4MyAxNC4yMjAzIDE1LjUzNjIgMTQuMTMyM0MxNS40MDk3IDE0LjA0NDMgMTUuMzAyNCAxMy45MDQgMTUuMjE0NCAxMy43MTE0TDEzLjIxNzEgOS4zMDQyNEMxMy4xMjkxIDkuMTExNjcgMTMuMTAxNiA4LjkzODM1IDEzLjEzNDYgOC43ODQzQzEzLjE2NzYgOC42MzAyNCAxMy4yNDQ2IDguNTExOTQgMTMuMzY1NyA4LjQyOTQxQzEzLjQ4NjcgOC4zNDEzOCAxMy42MzggOC4yOTczNiAxMy44MTk2IDguMjk3MzZDMTQuMDQ1MiA4LjI5NzM2IDE0LjIxMyA4LjM0Njg4IDE0LjMyMyA4LjQ0NTkyQzE0LjQzODYgOC41NDQ5NiAxNC41Mzc2IDguNjkwNzYgMTQuNjIwMiA4Ljg4MzMzTDE2LjMwMzggMTIuNzc4OEgxNS44NDE2TDE3LjUyNTIgOC44NzUwOEMxNy42MDc4IDguNjgyNTEgMTcuNzA2OCA4LjUzOTQ1IDE3LjgyMjQgOC40NDU5MkMxNy45Mzc5IDguMzQ2ODggMTguMTAwMiA4LjI5NzM2IDE4LjMwOTMgOC4yOTczNkMxOC40Nzk5IDguMjk3MzYgMTguNjIyOSA4LjM0MTM4IDE4LjczODUgOC40Mjk0MUMxOC44NTQgOC41MTE5NCAxOC45MjU1IDguNjMwMjQgMTguOTUzIDguNzg0M0MxOC45ODYgOC45MzgzNSAxOC45NTg1IDkuMTExNjcgMTguODcwNSA5LjMwNDI0TDE2Ljg2NSAxMy43MTE0QzE2Ljc4MjUgMTMuOTA0IDE2LjY3NzkgMTQuMDQ0MyAxNi41NTE0IDE0LjEzMjNDMTYuNDI0OCAxNC4yMjAzIDE2LjI1NyAxNC4yNjQ0IDE2LjA0NzkgMTQuMjY0NFoiIGZpbGw9ImJsYWNrIi8+CiAgICA8cGF0aCBkPSJNMTAuMjI3MiAxNC4yODA4QzEwLjAwNzEgMTQuMjgwOCA5Ljc3NjA0IDE0LjI2NDMgOS41MzM5NSAxNC4yMzEyQzkuMjk3MzYgMTQuMjAzNyA5LjA3MTc4IDE0LjE1OTcgOC44NTcyIDE0LjA5OTJDOC42NDI2MiAxNC4wMzg3IDguNDUwMDQgMTMuOTY3MSA4LjI3OTQ4IDEzLjg4NDZDOC4xMzA5MiAxMy44MTMxIDguMDI2MzggMTMuNzE5NiA3Ljk2NTg2IDEzLjYwNEM3LjkwNTM0IDEzLjQ4MyA3Ljg4MzMzIDEzLjM1NjQgNy44OTk4NCAxMy4yMjQ0QzcuOTE2MzQgMTMuMDkyMyA3Ljk2MzExIDEyLjk3NjggOC4wNDAxNCAxMi44Nzc3QzguMTE3MTcgMTIuNzczMiA4LjIxODk2IDEyLjcwNDQgOC4zNDU1IDEyLjY3MTRDOC40NzIwNSAxMi42MzI5IDguNjE1MTEgMTIuNjQ5NCA4Ljc3NDY3IDEyLjcyMDlDOC45ODM3NCAxMi44MiA5LjIyMDMzIDEyLjg5NyA5LjQ4NDQzIDEyLjk1MkM5Ljc0ODUzIDEzLjAwNyA5Ljk5NjEyIDEzLjAzNDUgMTAuMjI3MiAxMy4wMzQ1QzEwLjU5MDMgMTMuMDM0NSAxMC44NDM0IDEyLjk4NzggMTAuOTg2NSAxMi44OTQyQzExLjEzNTEgMTIuNzk1MiAxMS4yMDkzIDEyLjY3NDIgMTEuMjA5MyAxMi41MzExQzExLjIwOTMgMTIuNDA0NiAxMS4xNTcxIDEyLjMwMjggMTEuMDUyNSAxMi4yMjU3QzEwLjk1MzUgMTIuMTQ4NyAxMC43NzQ3IDEyLjA4MjcgMTAuNTE2MSAxMi4wMjc3TDkuNTUwNDYgMTEuODIxM0M5LjAyMjI2IDExLjcxMTMgOC42Mjg4NiAxMS41MTg3IDguMzcwMjYgMTEuMjQzNkM4LjExMTY3IDEwLjk2ODUgNy45ODIzNyAxMC42MTM2IDcuOTgyMzcgMTAuMTc5QzcuOTgyMzcgOS44OTI4NyA4LjA0MDE0IDkuNjM0MjcgOC4xNTU2OCA5LjQwMzE4QzguMjc2NzMgOS4xNjY1OSA4LjQ0NDU0IDguOTY1NzcgOC42NTkxMiA4LjgwMDcxQzguODc5MiA4LjYzNTY0IDkuMTM3OCA4LjUwOTEgOS40MzQ5MSA4LjQyMTA2QzkuNzM3NTMgOC4zMjc1MyAxMC4wNzMyIDguMjgwNzYgMTAuNDQxOCA4LjI4MDc2QzEwLjcyNzkgOC4yODA3NiAxMS4wMTY4IDguMzEzNzcgMTEuMzA4NCA4LjM3OThDMTEuNjA1NSA4LjQ0MDMyIDExLjg2MTMgOC41MzM4NiAxMi4wNzU5IDguNjYwNEMxMi4yMDI1IDguNzI2NDMgMTIuMjkzMiA4LjgxNzIxIDEyLjM0ODMgOC45MzI3NkMxMi40MDMzIDkuMDQ4MyAxMi40MjUzIDkuMTY5MzQgMTIuNDE0MyA5LjI5NTg5QzEyLjQwMzMgOS40MTY5NCAxMi4zNTkzIDkuNTI0MjMgMTIuMjgyMiA5LjYxNzc2QzEyLjIxMDcgOS43MTEzIDEyLjExMTcgOS43NzQ1NyAxMS45ODUxIDkuODA3NThDMTEuODY0MSA5LjgzNTA5IDExLjcxODMgOS44MTMwOSAxMS41NDc3IDkuNzQxNTZDMTEuMzg4MSA5LjY3MDAzIDExLjIwNjYgOS42MTc3NiAxMS4wMDMgOS41ODQ3NUMxMC44MDQ5IDkuNTQ2MjQgMTAuNjEyNCA5LjUyNjk4IDEwLjQyNTMgOS41MjY5OEMxMC4yMjE3IDkuNTI2OTggMTAuMDQ4NCA5LjU1MTc0IDkuOTA1MzQgOS42MDEyNkM5Ljc2MjI5IDkuNjQ1MjcgOS42NTIyNCA5LjcxMTMgOS41NzUyMiA5Ljc5OTMzQzkuNTAzNjkgOS44ODczNiA5LjQ2NzkzIDkuOTg5MTUgOS40Njc5MyAxMC4xMDQ3QzkuNDY3OTMgMTAuMjIwMiA5LjUxNDY5IDEwLjMxOTMgOS42MDgyMyAxMC40MDE4QzkuNzA3MjYgMTAuNDc4OCA5Ljg4NjA4IDEwLjU0NDkgMTAuMTQ0NyAxMC41OTk5TDExLjEwMiAxMC44MDYyQzExLjYzNTcgMTAuOTIxOCAxMi4wMzQ2IDExLjExMTYgMTIuMjk4NyAxMS4zNzU3QzEyLjU2MjggMTEuNjM5OCAxMi42OTQ5IDExLjk4MzcgMTIuNjk0OSAxMi40MDczQzEyLjY5NDkgMTIuNjkzNCAxMi42MzcxIDEyLjk1MiAxMi41MjE2IDEzLjE4MzFDMTIuNDA2IDEzLjQxNDIgMTIuMjQxIDEzLjYxMjMgMTIuMDI2NCAxMy43NzczQzExLjgxMTggMTMuOTM2OSAxMS41NTMyIDE0LjA2MDcgMTEuMjUwNiAxNC4xNDg3QzEwLjk0OCAxNC4yMzY3IDEwLjYwNjkgMTQuMjgwOCAxMC4yMjcyIDE0LjI4MDhaIiBmaWxsPSJibGFjayIvPgogICAgPHBhdGggZD0iTTUuMjg3ODMgMTQuMjgwOEM0LjY0NDA5IDE0LjI4MDggNC4wOTExMyAxNC4xNTcgMy42Mjg5NiAxMy45MDk0QzMuMTY2NzggMTMuNjYxOCAyLjgxMTkgMTMuMzEyNCAyLjU2NDMxIDEyLjg2MTJDMi4zMjIyMiAxMi40MTAxIDIuMjAxMTcgMTEuODgxOSAyLjIwMTE3IDExLjI3NjZDMi4yMDExNyAxMC44MjU1IDIuMjY5OTUgMTAuNDE1NiAyLjQwNzUgMTAuMDQ2OUMyLjU1MDU1IDkuNjc4MjkgMi43NTQxMyA5LjM2MTkyIDMuMDE4MjMgOS4wOTc4MkMzLjI4NzgzIDguODMzNzIgMy42MTI0NSA4LjYzMjg5IDMuOTkyMDkgOC40OTUzNEM0LjM3NzI0IDguMzUyMjkgNC44MDkxNSA4LjI4MDc2IDUuMjg3ODMgOC4yODA3NkM1LjU0MDkyIDguMjgwNzYgNS44MDIyNyA4LjMxMTAyIDYuMDcxODcgOC4zNzE1NUM2LjM0Njk4IDguNDI2NTcgNi41ODkwNyA4LjUxMTg1IDYuNzk4MTUgOC42MjczOUM2Ljk1MjIgOC43MDk5MiA3LjA1OTQ5IDguODE0NDYgNy4xMjAwMiA4Ljk0MTAxQzcuMTgwNTQgOS4wNjc1NiA3LjE5OTggOS4xOTY4NiA3LjE3Nzc5IDkuMzI4OUM3LjE2MTI4IDkuNDYwOTUgNy4xMTQ1MSA5LjU3OTI1IDcuMDM3NDkgOS42ODM3OUM2Ljk2MDQ2IDkuNzg4MzMgNi44NjE0MiA5Ljg1OTg1IDYuNzQwMzcgOS44OTgzN0M2LjYxOTMzIDkuOTMxMzggNi40ODcyOCA5LjkxMjEyIDYuMzQ0MjMgOS44NDA2QzYuMTc5MTYgOS43NjM1NyA2LjAxNDEgOS43MDU4IDUuODQ5MDQgOS42NjcyOEM1LjY4OTQ4IDkuNjIzMjcgNS41MjE2NyA5LjYwMTI2IDUuMzQ1NiA5LjYwMTI2QzUuMDA0NDcgOS42MDEyNiA0LjcxODM3IDkuNjY3MjggNC40ODcyOCA5Ljc5OTMzQzQuMjYxNjkgOS45MjU4OCA0LjA5MTEzIDEwLjExMjkgMy45NzU1OSAxMC4zNjA1QzMuODYwMDQgMTAuNjA4MSAzLjgwMjI3IDEwLjkxMzUgMy44MDIyNyAxMS4yNzY2QzMuODAyMjcgMTEuNjM5OCAzLjg2MDA0IDExLjk0NzkgMy45NzU1OSAxMi4yMDFDNC4wOTExMyAxMi40NDg2IDQuMjYxNjkgMTIuNjM4NCA0LjQ4NzI4IDEyLjc3MDRDNC43MTgzNyAxMi44OTcgNS4wMDQ0NyAxMi45NjAzIDUuMzQ1NiAxMi45NjAzQzUuNDg4NjUgMTIuOTYwMyA1LjY0MjcxIDEyLjk0MzggNS44MDc3NyAxMi45MTA3QzUuOTcyODQgMTIuODcyMiA2LjEzNTE1IDEyLjgxNDUgNi4yOTQ3MSAxMi43Mzc0QzYuNDU5NzcgMTIuNjY1OSA2LjYwNTU3IDEyLjY0NjYgNi43MzIxMiAxMi42Nzk3QzYuODY0MTcgMTIuNzEyNyA2Ljk2ODcxIDEyLjc3ODcgNy4wNDU3NCAxMi44Nzc3QzcuMTI4MjcgMTIuOTc2OCA3LjE4MDU0IDEzLjA5MjMgNy4yMDI1NSAxMy4yMjQ0QzcuMjI0NTYgMTMuMzUwOSA3LjIwNTMgMTMuNDc3NSA3LjE0NDc4IDEzLjYwNEM3LjA4OTc2IDEzLjczMDYgNi45OTA3MiAxMy44MzIzIDYuODQ3NjYgMTMuOTA5NEM2LjY1NTA5IDE0LjAyNDkgNi40MTU3NSAxNC4xMTU3IDYuMTI5NjUgMTQuMTgxN0M1Ljg0OTA0IDE0LjI0NzcgNS41Njg0MyAxNC4yODA4IDUuMjg3ODMgMTQuMjgwOFoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "operation",
        "tooltip": "CSV as a document or text"
      },
      {
        "group": "operation",
        "tooltip": "CSV column delimiter"
      },
      {
        "group": "operation",
        "tooltip": "Skips the first row to be not included in the final records."
      },
      {
        "group": "operation",
        "tooltip": "Mapping of the columns if not included in the CSV itself in the first row."
      },
      {
        "group": "operation",
        "tooltip": "Type of the row in the CSV file, either Object or Array"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation",
        "tooltip": "CSV column delimiter"
      },
      {
        "group": "operation",
        "tooltip": "Skips the first row to be not included in the final records."
      },
      {
        "group": "operation",
        "tooltip": "Mapping of the columns if not included in the CSV itself in the first row."
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.GoogleMapsPlatform.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='18' height='18' viewBox='0 0 1000 1000' xml:space='preserve'%3E%3Cdesc%3ECreated with Fabric.js 3.5.0%3C/desc%3E%3Cdefs%3E%3C/defs%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='rgba(255,255,255,0)'/%3E%3Cg transform='matrix(7.8865 0 0 7.4288 492.2894 500.0022)' id='954022'%3E%3Cg style='' vector-effect='non-scaling-stroke'%3E%3Cg transform='matrix(1 0 0 1 -10.65 -48.75)'%3E%3Cpath style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; is-custom-font: none; font-file-url: none; fill: rgb(26,115,232); fill-rule: nonzero; opacity: 1;' transform=' translate(-35.5, -17.4)' d='M 60.2 2.2 C 55.8 0.8 51 0 46.1 0 C 32 0 19.3 6.4 10.8 16.5 l 21.8 18.3 L 60.2 2.2 z' stroke-linecap='round'/%3E%3C/g%3E%3Cg transform='matrix(1 0 0 1 -29.85 -23.85)'%3E%3Cpath style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; is-custom-font: none; font-file-url: none; fill: rgb(234,67,53); fill-rule: nonzero; opacity: 1;' transform=' translate(-16.3, -42.3)' d='M 10.8 16.5 C 4.1 24.5 0 34.9 0 46.1 c 0 8.7 1.7 15.7 4.6 22 l 28 -33.3 l -21.8 -18.3 z' stroke-linecap='round'/%3E%3C/g%3E%3Cg transform='matrix(1 0 0 1 13.75 -36.25)'%3E%3Cpath style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; is-custom-font: none; font-file-url: none; fill: rgb(66,133,244); fill-rule: nonzero; opacity: 1;' transform=' translate(-59.9, -29.9)' d='M 46.2 28.5 c 9.8 0 17.7 7.9 17.7 17.7 c 0 4.3 -1.6 8.3 -4.2 11.4 c 0 0 13.9 -16.6 27.5 -32.7 c -5.6 -10.8 -15.3 -19 -27 -22.7 L 32.6 34.8 c 3.3 -3.8 8.1 -6.3 13.6 -6.3' stroke-linecap='round'/%3E%3C/g%3E%3Cg transform='matrix(1 0 0 1 -14 0.25)'%3E%3Cpath style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; is-custom-font: none; font-file-url: none; fill: rgb(251,188,4); fill-rule: nonzero; opacity: 1;' transform=' translate(-32.15, -66.4)' d='M 46.2 63.8 c -9.8 0 -17.7 -7.9 -17.7 -17.7 c 0 -4.3 1.5 -8.3 4.1 -11.3 l -28 33.3 c 4.8 10.6 12.8 19.2 21 29.9 l 34.1 -40.5 c -3.3 3.9 -8.1 6.3 -13.5 6.3' stroke-linecap='round'/%3E%3C/g%3E%3Cg transform='matrix(1 0 0 1 12.85 12.5)'%3E%3Cpath style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; is-custom-font: none; font-file-url: none; fill: rgb(52,168,83); fill-rule: nonzero; opacity: 1;' transform=' translate(-59, -78.65)' d='M 59.1 109.2 c 15.4 -24.1 33.3 -35 33.3 -63 c 0 -7.7 -1.9 -14.9 -5.2 -21.3 L 25.6 98 c 2.6 3.4 5.3 7.3 7.9 11.3 c 9.4 14.5 6.8 23.1 12.8 23.1 s 3.4 -8.7 12.8 -23.2' stroke-linecap='round'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {},
      {},
      {
        "group": "input"
      },
      {},
      {},
      {},
      {
        "group": "errors"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.inbound.EmailIntermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "protocol",
          "label": "Imap Details"
        },
        {
          "id": "listenerInfos",
          "label": "Listener information"
        },
        {
          "id": "unseenPollingConfig",
          "label": "After process"
        },
        {
          "id": "allPollingConfig",
          "label": "After process"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzkwXzI0MjApIj4KPHBhdGggZD0iTTguMzM4MzUgOS45NTM2NUwxMC4zODk0IDEyLjAxMDRMOC4zMzI2MiAxNC4wNjcyTDkuMTQ2MTYgMTQuODc1TDEyLjAxMDcgMTIuMDEwNEw5LjE0NjE2IDkuMTQ1ODNMOC4zMzgzNSA5Ljk1MzY1WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEyLjM0ODggOS45NTM2NUwxNC4zOTk4IDEyLjAxMDRMMTIuMzQzIDE0LjA2NzJMMTMuMTU2NiAxNC44NzVMMTYuMDIxMiAxMi4wMTA0TDEzLjE1NjYgOS4xNDU4M0wxMi4zNDg4IDkuOTUzNjVaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMy45NzIgMTEuNDM3NUgxLjEyNTMzVjIuNzkyMTlMNy42NzM3NiA3LjMyMzk2QzcuNzY5NjcgNy4zOTA0OSA3Ljg4MzYgNy40MjYxNCA4LjAwMDMyIDcuNDI2MTRDOC4xMTcwNSA3LjQyNjE0IDguMjMwOTggNy4zOTA0OSA4LjMyNjg5IDcuMzIzOTZMMTQuODc1MyAyLjc5MjE5VjhIMTYuMDIxMlYyLjI3MDgzQzE2LjAyMTIgMS45NjY5NCAxNS45MDA0IDEuNjc1NDkgMTUuNjg1NiAxLjQ2MDYxQzE1LjQ3MDcgMS4yNDU3MiAxNS4xNzkyIDEuMTI1IDE0Ljg3NTMgMS4xMjVIMS4xMjUzM0MwLjgyMTQzMiAxLjEyNSAwLjUyOTk4NCAxLjI0NTcyIDAuMzE1MDk5IDEuNDYwNjFDMC4xMDAyMTQgMS42NzU0OSAtMC4wMjA1MDc4IDEuOTY2OTQgLTAuMDIwNTA3OCAyLjI3MDgzVjExLjQzNzVDLTAuMDIwNTA3OCAxMS43NDE0IDAuMTAwMjE0IDEyLjAzMjggMC4zMTUwOTkgMTIuMjQ3N0MwLjUyOTk4NCAxMi40NjI2IDAuODIxNDMyIDEyLjU4MzMgMS4xMjUzMyAxMi41ODMzSDMuOTcyVjExLjQzNzVaTTEzLjYxNDkgMi4yNzA4M0w4LjAwMDMyIDYuMTU1MjFMMi4zODU3NCAyLjI3MDgzSDEzLjYxNDlaIiBmaWxsPSIjRkM1RDBEIi8+CjxwYXRoIGQ9Ik00LjI4MjEgOS45NTM2NUw2LjMzMzE0IDEyLjAxMDRMNC4yNzYzNyAxNC4wNjcyTDUuMDg5OTEgMTQuODc1TDcuOTU0NDkgMTIuMDEwNEw1LjA4OTkxIDkuMTQ1ODNMNC4yODIxIDkuOTUzNjVaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzkwXzI0MjAiPgo8cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication",
        "tooltip": "Enter your full email address (e.g., user@example.com) or the username provided by your email service. This is used to authenticate your access to the mail server."
      },
      {
        "group": "authentication",
        "tooltip": "Enter the password associated with your email account. Keep your password secure and do not share it with others."
      },
      {
        "group": "protocol",
        "tooltip": "Enter the address of the IMAP server used to retrieve your emails. This server allows you to sync your messages across multiple devices. (e.g., imap.example.com)"
      },
      {
        "group": "protocol",
        "tooltip": "Enter the port number for connecting to the IMAP server. Common ports are 993 for secure connections using SSL/TLS, or 143 for non-secure connections."
      },
      {
        "group": "protocol",
        "tooltip": "Select the encryption protocol for email security."
      },
      {
        "group": "listenerInfos",
        "tooltip": "Enter the names of the folder you wish to monitor. If left blank, the listener will default to monitoring the 'INBOX' folder."
      },
      {
        "group": "listenerInfos",
        "tooltip": "The duration for which the task will wait for a message to arrive in the mailbox before correlating"
      },
      {
        "group": "listenerInfos"
      },
      {
        "group": "unseenPollingConfig",
        "tooltip": "Chose the desired handling strategy"
      },
      {
        "group": "unseenPollingConfig",
        "tooltip": "Specify the destination folder to which the emails will be moved. To create a new folder or a hierarchy of folders, use a dot-separated path (e.g., 'Archive' or 'Projects.2023.January'). If any part of the path does not exist, it will be created automatically."
      },
      {
        "group": "allPollingConfig",
        "tooltip": "Chose the desired handling strategy"
      },
      {
        "group": "allPollingConfig",
        "tooltip": "Specify the destination folder to which the emails will be moved. To create a new folder or a hierarchy of folders, use a dot-separated path (e.g., 'Archive' or 'Projects.2023.January'). If any part of the path does not exist, it will be created automatically."
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.UIPath.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' width='18' height='18' id='Extra_Large' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 3261 1200' style='enable-background:new 0 0 3261 1200;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23FA4616;%7D%0A%3C/style%3E%3Cg%3E%3Cpath class='st0' d='M0,0h1200v1200H0V0z M124.2,1075.8h951.6V124.2H124.2V1075.8z M604,309.5h124.2v363.6 c0,164.3-93.2,263.4-250.4,263.4c-154.3,0-245.4-97.2-245.4-263.4V309.5h124.2v363.6c0,91.2,38.1,146.2,124.2,146.2 c83.1,0,123.2-52.1,123.2-146.2V309.5z M964.6,309.5c0,44.1-32.1,74.1-76.1,74.1c-44.1,0-76.1-30-76.1-74.1 c0-45.1,32.1-76.1,76.1-76.1C932.5,233.4,964.6,264.4,964.6,309.5z M826.4,442.7h124.2v487.8H826.4V442.7z M1784,517.9 c0,133.2-88.1,212.4-223.4,212.4h-112.2v200.3h-124.2v-621h236.4C1697.8,309.5,1784,389.6,1784,517.9z M1657.8,517.9 c0-68.1-39.1-108.2-110.2-108.2h-99.2v221.4h99.2C1618.7,631.1,1657.8,591,1657.8,517.9z M2201.7,442.7h124.2v487.8h-124.2v-55.1 c-33.1,39.1-85.1,61.1-158.3,61.1c-132.2,0-225.4-104.2-225.4-249.4c0-144.2,91.2-250.4,225.4-250.4c71.1,0,125.2,25,158.3,67.1 V442.7z M2201.7,687.1c0-84.1-50.1-142.2-129.2-142.2c-79.1,0-128.2,55.1-128.2,142.2c0,81.1,44.1,140.2,128.2,140.2 C2148.6,827.4,2201.7,772.3,2201.7,687.1z M2629.4,824.4h49.1v106.2h-65.1c-118.2,0-169.3-56.1-169.3-171.3V547.9H2386V442.7h58.1 V309.5h124.2v133.2h109.2v105.2h-109.2v212.3C2568.3,803.3,2581.3,824.4,2629.4,824.4z M3214.3,647.1v283.5h-124.2V661.1 c0-74.1-38.1-122.2-111.2-122.2s-117.2,50.1-117.2,133.2v258.4h-124.2V279.5h124.2v213.4c31.1-37.1,80.1-57.1,147.2-57.1 C3124.2,435.7,3214.3,518.9,3214.3,647.1z M3200,279.5h21.7v4.2h-8.5v25.8h-4.8v-25.8h-8.5V279.5z M3261,279.5v30h-4.8v-22.8 l-9.7,22.8h-3.6l-9.7-22.8v22.8h-4.8v-30h6l10.3,23.4l10.3-23.4H3261z'/%3E%3C/g%3E%3C/svg%3E%0A"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "input"
      },
      {
        "group": "errors"
      },
      {},
      {
        "group": "configuration"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.AWSEventBridge.intermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "API destination"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 256 256'%3E%3Cdefs%3E%3ClinearGradient id='logosAwsEventbridge0' x1='0%25' x2='100%25' y1='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23B0084D'/%3E%3Cstop offset='100%25' stop-color='%23FF4F8B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23logosAwsEventbridge0)' d='M0 0h256v256H0z'/%3E%3Cpath fill='%23FFF' d='M171.702 211.2c-6.858 0-12.44-5.61-12.44-12.509s5.582-12.509 12.44-12.509c6.857 0 12.438 5.61 12.438 12.51c0 6.898-5.581 12.508-12.438 12.508Zm-27.278-54.4h-33.071L94.815 128l16.538-28.8h33.071L160.96 128l-16.535 28.8ZM88.387 69.818c-6.857 0-12.438-5.61-12.438-12.51c0-6.898 5.581-12.508 12.438-12.508c6.861 0 12.443 5.61 12.443 12.509s-5.582 12.509-12.443 12.509Zm83.315 109.964c-2.362 0-4.614.458-6.699 1.261l-13.514-22.931l-.713.426L167.39 129.6a3.226 3.226 0 0 0 0-3.2l-18.374-32a3.177 3.177 0 0 0-2.755-1.6h-33.435l.13-.077l-12.39-21.03c4.047-3.469 6.628-8.627 6.628-14.384c0-10.426-8.436-18.909-18.807-18.909c-10.367 0-18.803 8.483-18.803 18.909c0 10.425 8.436 18.909 18.803 18.909c2.365 0 4.618-.458 6.702-1.261l11.567 19.625L88.384 126.4a3.226 3.226 0 0 0 0 3.2l18.377 32c.57.992 1.62 1.6 2.756 1.6h36.744c.264 0 .521-.042.77-.102l12.496 21.21c-4.051 3.468-6.629 8.626-6.629 14.383c0 10.426 8.433 18.909 18.804 18.909c10.37 0 18.803-8.483 18.803-18.909c0-10.425-8.433-18.909-18.803-18.909Zm18.968-77.05c-6.857 0-12.436-5.609-12.436-12.508c0-6.9 5.579-12.509 12.436-12.509c6.858 0 12.44 5.61 12.44 12.509c0 6.9-5.582 12.509-12.44 12.509Zm23.303 23.668l-12.08-21.04c4.592-3.453 7.58-8.944 7.58-15.136c0-10.426-8.432-18.909-18.803-18.909c-2.638 0-5.152.554-7.433 1.549l-9.849-17.155a3.18 3.18 0 0 0-2.756-1.6h-39.448v6.4h37.612l9.11 15.872c-3.703 3.456-6.036 8.374-6.036 13.843c0 10.426 8.433 18.909 18.8 18.909c1.932 0 3.8-.298 5.556-.845L207.545 128l-15.892 27.674l5.512 3.2l16.808-29.274a3.21 3.21 0 0 0 0-3.2Zm-146.04 50.39c-6.86 0-12.442-5.612-12.442-12.508c0-6.9 5.581-12.51 12.442-12.51c6.857 0 12.439 5.61 12.439 12.51c0 6.896-5.582 12.508-12.44 12.508Zm10.393 3.236c5.062-3.392 8.41-9.181 8.41-15.744c0-10.426-8.436-18.91-18.803-18.91c-3.004 0-5.833.73-8.353 1.994L48.458 128l18.428-32.093l-5.515-3.2L42.027 126.4a3.21 3.21 0 0 0 0 3.2l12.388 21.568c-3.268 3.405-5.289 8.022-5.289 13.114c0 10.425 8.436 18.908 18.807 18.908c1.562 0 3.074-.214 4.528-.579l10.15 17.68c.57.989 1.62 1.6 2.757 1.6h39.451v-6.4H87.204l-8.878-15.465Z'/%3E%3C/svg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.AWSSAGEMAKER.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Configure input"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+SWNvbi1BcmNoaXRlY3R1cmUvNjQvQXJjaF9BbWF6b24tU2FnZU1ha2VyXzY0PC90aXRsZT4KICAgIDxnIGlkPSJJY29uLUFyY2hpdGVjdHVyZS82NC9BcmNoX0FtYXpvbi1TYWdlTWFrZXJfNjQiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJJY29uLUFyY2hpdGVjdHVyZS1CRy82NC9NYWNoaW5lLUxlYXJuaW5nIiBmaWxsPSIjMDFBODhEIj4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIj48L3JlY3Q+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGQ9Ik01NC4wMzQsMjYuMDMzNTczMSBDNTQuMDM0LDI2LjU5MzU2NTQgNTMuNTc4LDI3LjA0OTU1OTIgNTMuMDE3LDI3LjA0OTU1OTIgQzUyLjQ1OCwyNy4wNDk1NTkyIDUyLjAwMiwyNi41OTM1NjU0IDUyLjAwMiwyNi4wMzM1NzMxIEM1Mi4wMDIsMjUuNDczNTgwNyA1Mi40NTgsMjUuMDE3NTg2OSA1My4wMTcsMjUuMDE3NTg2OSBDNTMuNTc4LDI1LjAxNzU4NjkgNTQuMDM0LDI1LjQ3MzU4MDcgNTQuMDM0LDI2LjAzMzU3MzEgTDU0LjAzNCwyNi4wMzM1NzMxIFogTTQ4LjAwMiwzNi4wMDA0MzcgQzQ4LjAwMiwzNS40NDk0NDQ1IDQ4LjQ1LDM1LjAwMDQ1MDYgNDkuMDAyLDM1LjAwMDQ1MDYgQzQ5LjU1NCwzNS4wMDA0NTA2IDUwLjAwMiwzNS40NDk0NDQ1IDUwLjAwMiwzNi4wMDA0MzcgQzUwLjAwMiwzNi41NTE0Mjk0IDQ5LjU1NCwzNy4wMDA0MjMzIDQ5LjAwMiwzNy4wMDA0MjMzIEM0OC40NSwzNy4wMDA0MjMzIDQ4LjAwMiwzNi41NTE0Mjk0IDQ4LjAwMiwzNi4wMDA0MzcgTDQ4LjAwMiwzNi4wMDA0MzcgWiBNNDguMDAyLDU1LjAwMDE3NzUgQzQ4LjAwMiw1NC40NDkxODUgNDguNDUsNTQuMDAwMTkxMiA0OS4wMDIsNTQuMDAwMTkxMiBDNDkuNTU0LDU0LjAwMDE5MTIgNTAuMDAyLDU0LjQ0OTE4NSA1MC4wMDIsNTUuMDAwMTc3NSBDNTAuMDAyLDU1LjU1MTE3IDQ5LjU1NCw1Ni4wMDAxNjM5IDQ5LjAwMiw1Ni4wMDAxNjM5IEM0OC40NSw1Ni4wMDAxNjM5IDQ4LjAwMiw1NS41NTExNyA0OC4wMDIsNTUuMDAwMTc3NSBMNDguMDAyLDU1LjAwMDE3NzUgWiBNNTguMDAyLDQyLjAwMDM1NSBDNTguMDAyLDQyLjU1MTM0NzUgNTcuNTU0LDQzLjAwMDM0MTQgNTcuMDAyLDQzLjAwMDM0MTQgQzU2LjQ1LDQzLjAwMDM0MTQgNTYuMDAyLDQyLjU1MTM0NzUgNTYuMDAyLDQyLjAwMDM1NSBDNTYuMDAyLDQxLjQ0OTM2MjYgNTYuNDUsNDEuMDAwMzY4NyA1Ny4wMDIsNDEuMDAwMzY4NyBDNTcuNTU0LDQxLjAwMDM2ODcgNTguMDAyLDQxLjQ0OTM2MjYgNTguMDAyLDQyLjAwMDM1NSBMNTguMDAyLDQyLjAwMDM1NSBaIE02NSw0NS4yNzIzMTA0IEw1OS45NjMsNDIuMzgyMzQ5OCBDNTkuOTc5LDQyLjI1NjM1MTUgNjAuMDAyLDQyLjEzMTM1MzIgNjAuMDAyLDQyLjAwMDM1NSBDNjAuMDAyLDQwLjM0NjM3NzYgNTguNjU2LDM5LjAwMDM5NiA1Ny4wMDIsMzkuMDAwMzk2IEM1NS4zNDcsMzkuMDAwMzk2IDU0LjAwMiw0MC4zNDYzNzc2IDU0LjAwMiw0Mi4wMDAzNTUgQzU0LjAwMiw0My42NTQzMzI0IDU1LjM0Nyw0NS4wMDAzMTQxIDU3LjAwMiw0NS4wMDAzMTQxIEM1Ny44MDEsNDUuMDAwMzE0MSA1OC41MjMsNDQuNjgxMzE4NCA1OS4wNjEsNDQuMTcxMzI1NCBMNjMuODg2LDQ2LjkzOTI4NzYgTDU5LjU1NSw0OS4xMDUyNTggQzU5LjIxNiw0OS4yNzUyNTU3IDU5LjAwMiw0OS42MjEyNTEgNTkuMDAyLDUwLjAwMDI0NTggTDU5LjAwMiw1OC40NDExMzA1IEw0Ni45ODMsNjUuODM3MDI5NSBMNDEuMDAzLDYyLjQyMDA3NjIgTDQxLjAwMyw1Ni4wMDAxNjM5IEw0Ni4xODYsNTYuMDAwMTYzOSBDNDYuNiw1Ny4xNjExNDggNDcuNyw1OC4wMDAxMzY2IDQ5LjAwMiw1OC4wMDAxMzY2IEM1MC42NTYsNTguMDAwMTM2NiA1Mi4wMDIsNTYuNjU0MTU0OSA1Mi4wMDIsNTUuMDAwMTc3NSBDNTIuMDAyLDUzLjM0NTIwMDEgNTAuNjU2LDUyLjAwMDIxODUgNDkuMDAyLDUyLjAwMDIxODUgQzQ3LjcsNTIuMDAwMjE4NSA0Ni42LDUyLjgzODIwNyA0Ni4xODYsNTQuMDAwMTkxMiBMNDEuMDAzLDU0LjAwMDE5MTIgTDQxLjAwMyw0MC4wMDAzODIzIEM0MS4wMDMsMzkuNjQ5Mzg3MSA0MC44MTgsMzkuMzIzMzkxNiA0MC41MTcsMzkuMTQyMzk0MSBMMzUuNTE2LDM2LjE0MjQzNSBMMzQuNDg3LDM3Ljg1NzQxMTYgTDM5LjAwMyw0MC41NjYzNzQ2IEwzOS4wMDMsNDMuNTA3MzM0NSBMMzMuMDAyLDQ4LjEyMzI3MTQgTDMzLjAwMiw0NC4wMDAzMjc3IEMzMy4wMDIsNDMuNjk2MzMxOSAzMi44NjQsNDMuNDA4MzM1OCAzMi42MjcsNDMuMjE5MzM4NCBMMjguMDAyLDM5LjUxOTM4ODkgTDI4LjAwMiwzNC41MzU0NTcgTDMzLjU1NiwzMC44MzI1MDc1IEMzMy44MzUsMzAuNjQ2NTEwMSAzNC4wMDIsMzAuMzM0NTE0MyAzNC4wMDIsMzAuMDAwNTE4OSBMMzQuMDAyLDI0LjAwMDYwMDggTDMyLjAwMiwyNC4wMDA2MDA4IEwzMi4wMDIsMjkuNDY1NTI2MiBMMjcuMDEzLDMyLjc5MDQ4MDggTDIyLjAwMiwyOS40NjM1MjYyIEwyMi4wMDIsMjEuNTc0NjMzOSBMMjcuMDAyLDE4LjY1ODY3MzggTDI3LjAwMiwyNy4wMDA1NTk5IEwyOS4wMDIsMjcuMDAwNTU5OSBMMjkuMDAyLDE3LjQ5MTY4OTcgTDMzLjAwNSwxNS4xNTY3MjE2IEwzOS4wMDEsMTguNjE1Njc0NCBMMzkuMDAyLDMxLjAwMDUwNTIgQzM5LjAwMiwzMS4zNTk1MDAzIDM5LjE5NCwzMS42OTA0OTU4IDM5LjUwNiwzMS44Njg0OTM0IEw0Ni4wNDIsMzUuNjAzNDQyNCBDNDYuMDI0LDM1LjczNDQ0MDYgNDYuMDAyLDM1Ljg2NDQzODggNDYuMDAyLDM2LjAwMDQzNyBDNDYuMDAyLDM3LjY1NDQxNDQgNDcuMzQ3LDM5LjAwMDM5NiA0OS4wMDIsMzkuMDAwMzk2IEM1MC42NTYsMzkuMDAwMzk2IDUyLjAwMiwzNy42NTQ0MTQ0IDUyLjAwMiwzNi4wMDA0MzcgQzUyLjAwMiwzNC4zNDY0NTk1IDUwLjY1NiwzMy4wMDA0Nzc5IDQ5LjAwMiwzMy4wMDA0Nzc5IEM0OC4yMDgsMzMuMDAwNDc3OSA0Ny40OSwzMy4zMTU0NzM2IDQ2Ljk1MywzMy44MjA0NjY3IEw0MS4wMDIsMzAuNDE5NTEzMiBMNDEuMDAxLDE4LjYxNzY3NDMgTDQ2Ljk2NCwxNS4xNzY3MjEzIEw1OC4wMDIsMjIuNTM1NjIwOCBMNTguMDAyLDI1LjAwMDU4NzIgTDU1Ljg1MSwyNS4wMDA1ODcyIEM1NS40MjksMjMuODQ0NjAzIDU0LjMxOCwyMy4wMTc2MTQyIDUzLjAxNywyMy4wMTc2MTQyIEM1MS4zNTQsMjMuMDE3NjE0MiA1MC4wMDIsMjQuMzcwNTk1OCA1MC4wMDIsMjYuMDMzNTczMSBDNTAuMDAyLDI3LjY5NjU1MDQgNTEuMzU0LDI5LjA0OTUzMTkgNTMuMDE3LDI5LjA0OTUzMTkgQzU0LjM0MywyOS4wNDk1MzE5IDU1LjQ3MSwyOC4xOTA1NDM2IDU1Ljg3NSwyNy4wMDA1NTk5IEw1OC4wMDIsMjcuMDAwNTU5OSBMNTguMDAyLDMwLjAwMDUxODkgQzU4LjAwMiwzMC4zNTk1MTQgNTguMTk0LDMwLjY5MDUwOTUgNTguNTA2LDMwLjg2ODUwNyBMNjUsMzQuNTgwNDU2NCBMNjUsNDUuMjcyMzEwNCBaIE0zMy4wMiw2NS44MzcwMjk1IEwyOS44NjcsNjMuODk3MDU2IEwzNS41ODMsNTkuODE0MTExOCBMMzQuNDIxLDU4LjE4NjEzNCBMMjguMDE4LDYyLjc1OTA3MTYgTDIxLjAwMiw1OC40NDExMzA1IEwyMS4wMDIsNTAuNTY2MjM4MSBMMjUuNTE2LDQ3Ljg1NzI3NTEgTDI0LjQ4Nyw0Ni4xNDIyOTg1IEwxOS45NTgsNDguODYwMjYxNCBMMTUuMDAyLDQ2LjM4MjI5NTIgTDE1LjAwMSw0MC42MTczNzM5IEwyMC40NDksMzcuODk0NDExMSBMMTkuNTU1LDM2LjEwNTQzNTUgTDE1LjAwMSwzOC4zODE0MDQ0IEwxNS4wMDIsMzQuNTgwNDU2NCBMMjAuOTYzLDMxLjE3NDUwMjkgTDI2LjAwMiwzNC41MTk0NTcyIEwyNi4wMDIsMzkuNDgwMzg5NCBMMjAuNDQ5LDQzLjE2NzMzOTEgTDIxLjU1NSw0NC44MzMzMTYzIEwyNi45NTgsNDEuMjQ1MzY1MyBMMzEuMDAyLDQ0LjQ4MDMyMTIgTDMxLjAwMiw0OS42NjIyNTA0IEwyNi4zOTIsNTMuMjA3MjAyIEwyNy42MTEsNTQuNzkyMTgwNCBMMzkuMDAzLDQ2LjAzMDMgTDM5LjAwMyw2Mi40MTkwNzYyIEwzMy4wMiw2NS44MzcwMjk1IFogTTY2LjQ5NiwzMy4xMzI0NzYxIEw2MC4wMDIsMjkuNDIwNTI2OCBMNjAuMDAyLDIyLjAwMDYyODEgQzYwLjAwMiwyMS42NjU2MzI3IDU5LjgzNSwyMS4zNTM2MzcgNTkuNTU2LDIxLjE2ODYzOTUgTDQ3LjU1NiwxMy4xNjg3NDg3IEM0Ny4yNCwxMi45NTg3NTE2IDQ2LjgzMiwxMi45NDQ3NTE4IDQ2LjUwMiwxMy4xMzQ3NDkyIEw0MC4wMDQsMTYuODg0Njk4IEwzMy41MDIsMTMuMTM0NzQ5MiBDMzMuMTksMTIuOTU0NzUxNyAzMi44MDcsMTIuOTU0NzUxNyAzMi40OTgsMTMuMTM2NzQ5MiBMMjAuNDk4LDIwLjEzNjY1MzYgQzIwLjE5LDIwLjMxNTY1MTEgMjAuMDAyLDIwLjY0NDY0NjYgMjAuMDAyLDIxLjAwMDY0MTggTDIwLjAwMiwyOS40MjA1MjY4IEwxMy41MDYsMzMuMTMyNDc2MSBDMTMuMTk0LDMzLjMwOTQ3MzcgMTMuMDAyLDMzLjY0MTQ2OTIgMTMuMDAyLDM0LjAwMDQ2NDMgTDEzLjAwMiwzNC40MTc0NTg2IEMxMy4wMDEsMzQuNDM4NDU4MyAxMywzNC40NTg0NTggMTMsMzQuNDc5NDU3NyBMMTMsNDUuMzYzMzA5MSBDMTMsNDUuMzgzMzA4OCAxMy4wMDEsNDUuNDAzMzA4NiAxMy4wMDIsNDUuNDIyMzA4MyBMMTMuMDAyLDQ3LjAwMDI4NjggQzEzLjAwMiw0Ny4zNzkyODE2IDEzLjIxNiw0Ny43MjUyNzY5IDEzLjU1NSw0Ny44OTQyNzQ1IEwxOS4wMDIsNTAuNjE4MjM3NCBMMTkuMDAyLDU5LjAwMDEyMjkgQzE5LjAwMiw1OS4zNDcxMTgyIDE5LjE4MSw1OS42NjkxMTM4IDE5LjQ3Nyw1OS44NTExMTEzIEwzMi40NzcsNjcuODUxMDAyIEMzMi42MzgsNjcuOTUwMDAwNyAzMi44Miw2OCAzMy4wMDIsNjggQzMzLjE3Myw2OCAzMy4zNDQsNjcuOTU2MDAwNiAzMy40OTgsNjcuODY4MDAxOCBMNDAuMDAzLDY0LjE1MjA1MjUgTDQ2LjUwNiw2Ny44NjgwMDE4IEM0Ni44MjEsNjguMDQ4OTk5MyA0Ny4yMTMsNjguMDQxOTk5NCA0Ny41MjYsNjcuODUxMDAyIEw2MC41MjYsNTkuODUxMTExMyBDNjAuODIyLDU5LjY2OTExMzggNjEuMDAyLDU5LjM0NzExODIgNjEuMDAyLDU5LjAwMDEyMjkgTDYxLjAwMiw1MC42MTgyMzc0IEw2Ni40NDcsNDcuODk0Mjc0NSBDNjYuNzg2LDQ3LjcyNTI3NjkgNjcsNDcuMzc5MjgxNiA2Nyw0Ny4wMDAyODY4IEw2NywzNC4wMDA0NjQzIEM2NywzMy42NDE0NjkyIDY2LjgwNywzMy4zMTA0NzM3IDY2LjQ5NiwzMy4xMzI0NzYxIEw2Ni40OTYsMzMuMTMyNDc2MSBaIiBpZD0iQW1hem9uLVNhZ2VNYWtlcl9JY29uXzY0X1NxdWlkIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.webhook.WebhookConnectorStartMessage.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        },
        {
          "id": "webhookResponse",
          "label": "Webhook response"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg id='icon' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 32 32'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: none; %7D %3C/style%3E%3C/defs%3E%3Cpath d='M24,26a3,3,0,1,0-2.8164-4H13v1a5,5,0,1,1-5-5V16a7,7,0,1,0,6.9287,8h6.2549A2.9914,2.9914,0,0,0,24,26Z'/%3E%3Cpath d='M24,16a7.024,7.024,0,0,0-2.57.4873l-3.1656-5.5395a3.0469,3.0469,0,1,0-1.7326.9985l4.1189,7.2085.8686-.4976a5.0006,5.0006,0,1,1-1.851,6.8418L17.937,26.501A7.0005,7.0005,0,1,0,24,16Z'/%3E%3Cpath d='M8.532,20.0537a3.03,3.03,0,1,0,1.7326.9985C11.74,18.47,13.86,14.7607,13.89,14.708l.4976-.8682-.8677-.497a5,5,0,1,1,6.812-1.8438l1.7315,1.002a7.0008,7.0008,0,1,0-10.3462,2.0356c-.457.7427-1.1021,1.8716-2.0737,3.5728Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "webhookResponse"
      }
    ]
  },
  "io.camunda.connectors.AWSSQS.receive.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": [
          "receive message",
          "receive event",
          "receive message from queue",
          "receive event from queue"
        ]
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "queueProperties",
          "label": "Queue properties"
        },
        {
          "id": "messagePollingProperties",
          "label": "Message polling properties"
        },
        {
          "id": "input",
          "label": "Use next attribute names for activation condition"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTgnIGhlaWdodD0nMTgnIHZpZXdCb3g9JzAgMCA0MCA0MCcgdmVyc2lvbj0nMS4xJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnCiAgICAgeG1sbnM6eGxpbms9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnPjwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNjQgKDkzNTM3KSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4KICAgIDx0aXRsZT5JY29uLUFyY2hpdGVjdHVyZS8zMi9BcmNoX0FXUy1TaW1wbGUtUXVldWUtU2VydmljZV8zMjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0nMCUnIHkxPScxMDAlJyB4Mj0nMTAwJScgeTI9JzAlJyBpZD0nbGluZWFyR3JhZGllbnQtMSc+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9JyNCMDA4NEQnIG9mZnNldD0nMCUnPjwvc3RvcD4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0nI0ZGNEY4Qicgb2Zmc2V0PScxMDAlJz48L3N0b3A+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSdJY29uLUFyY2hpdGVjdHVyZS8zMi9BcmNoX0FXUy1TaW1wbGUtUXVldWUtU2VydmljZV8zMicgc3Ryb2tlPSdub25lJyBzdHJva2Utd2lkdGg9JzEnIGZpbGw9J25vbmUnCiAgICAgICBmaWxsLXJ1bGU9J2V2ZW5vZGQnPgogICAgICAgIDxnIGlkPSdJY29uLUFyY2hpdGVjdHVyZS1CRy8zMi9BcHBsaWNhdGlvbi1JbnRlZ3JhdGlvbicgZmlsbD0ndXJsKCNsaW5lYXJHcmFkaWVudC0xKSc+CiAgICAgICAgICAgIDxyZWN0IGlkPSdSZWN0YW5nbGUnIHg9JzAnIHk9JzAnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCc+PC9yZWN0PgogICAgICAgIDwvZz4KICAgICAgICA8cGF0aCBkPSdNMTQuMzQyMjA1MSwyMi4zNDkzNzg2IEwxNS44NDY2NzY3LDIwLjkwNjEwNzQgQzE1Ljk0MjgzNDcsMjAuODE0MTUzOSAxNS45OTY5MjM1LDIwLjY4NzIxOCAxNS45OTk5Mjg1LDIwLjU1NTI4NDYgQzE2LjAwMTkzMTcsMjAuNDIyMzUxNyAxNS45NTE4NDk1LDIwLjI5MzQxNjggMTUuODU5Njk4MSwyMC4xOTg0NjQ4IEwxNC4zNTUyMjY0LDE4LjY0MzI1MDIgTDEzLjYzNTA0MzMsMTkuMzM3ODk5NCBMMTQuMzExMTU0LDIwLjAzNzU0NiBMMTEuOTkxMzQyOSwyMC4wMzc1NDYgTDExLjk5MTM0MjksMjEuMDM3MDQxMyBMMTQuMjY1MDc4MywyMS4wMzcwNDEzIEwxMy42NDgwNjQ3LDIxLjYyODc0MjUgTDE0LjM0MjIwNTEsMjIuMzQ5Mzc4NiBaIE0yNi4zNTc5NDUyLDIyLjM1MzM3NjUgTDI3LjkwNzQ5MDksMjAuOTAwMTEwNCBDMjguMDA2NjUzOCwyMC44MDgxNTY5IDI4LjA2Mjc0NTksMjAuNjc5MjIyIDI4LjA2NDc0OTIsMjAuNTQ0MjkwMSBDMjguMDY2NzUyNSwyMC40MDkzNTgzIDI4LjAxMzY2NTMsMjAuMjc4NDI0NCAyNy45MTg1MDksMjAuMTgzNDcyNCBMMjYuMzY4OTYzMywxOC42MzcyNTMyIEwyNS42NjA3OTk5LDE5LjM0Mzg5NjMgTDI2LjM1NDk0MDMsMjAuMDM3NTQ2IEwyNC4wMTEwODk2LDIwLjAzNzU0NiBMMjQuMDExMDg5NiwyMS4wMzcwNDEzIEwyNi4yOTg4NDgxLDIxLjAzNzA0MTMgTDI1LjY3MTgxOCwyMS42MjQ3NDQ1IEwyNi4zNTc5NDUyLDIyLjM1MzM3NjUgWiBNMTcuNTg3NTM2NywyMy4zNjA4Njc4IEMxOC4zMzg3NzA4LDIzLjA1NzAyMTIgMTkuMTYyMTIzNSwyMi44OTQxMDM1IDIwLjAwNDUwNzQsMjIuODk0MTAzNSBDMjAuODQ2ODkxMywyMi44OTQxMDM1IDIxLjY3MDI0NCwyMy4wNTcwMjEyIDIyLjQyMTQ3ODEsMjMuMzYwODY3OCBDMjEuNzUyMzc4OSwyMS41ODk3NjIyIDIxLjc1MjM3ODksMTkuMzg5ODczMSAyMi40MjE0NzgxLDE3LjYxODc2NzUgQzIwLjkxOTAwOTgsMTguMjI2NDYwNiAxOS4wOTAwMDUsMTguMjI2NDYwNiAxNy41ODc1MzY3LDE3LjYxODc2NzUgQzE4LjI1NjYzNTksMTkuMzg5ODczMSAxOC4yNTY2MzU5LDIxLjU4OTc2MjIgMTcuNTg3NTM2NywyMy4zNjA4Njc4IEwxNy41ODc1MzY3LDIzLjM2MDg2NzggWiBNMTUuNjQ0MzQ0MywyNS4zNDA4Njc5IEMxNS41NDYxODMsMjUuMjQzOTE2OCAxNS40OTcxMDI0LDI1LjExNTk4MTQgMTUuNDk3MTAyNCwyNC45ODgwNDYgQzE1LjQ5NzEwMjQsMjQuODYwMTEwNiAxNS41NDYxODMsMjQuNzMyMTc1MyAxNS42NDQzNDQzLDI0LjYzNDIyNDcgQzE3LjU4NDUzMTcsMjIuNjk4MjAyNCAxNy41ODQ1MzE3LDE4LjI4MjQzMjQgMTUuNjQ0MzQ0MywxNi4zNDU0MTA2IEMxNS41NDYxODMsMTYuMjQ4NDU5NSAxNS40OTcxMDI0LDE2LjEyMDUyNDEgMTUuNDk3MTAyNCwxNS45OTI1OTEyIEMxNS40OTcxMDI0LDE1Ljg2NDY1MzQgMTUuNTQ2MTgzLDE1LjczNjcxOCAxNS42NDQzNDQzLDE1LjYzODc2NzQgQzE1LjgzOTY2NTIsMTUuNDQzODY1OSAxNi4xNTcxODY4LDE1LjQ0Mzg2NTkgMTYuMzUyNTA3NywxNS42Mzg3Njc0IEMxNy4yNzQwMjE2LDE2LjU1ODMwMzEgMTguNjA1MjA4NiwxNy4wODYwMzY2IDIwLjAwNDUwNzQsMTcuMDg2MDM2NiBDMjEuNDA0ODA3OSwxNy4wODYwMzY2IDIyLjczNTk5NDgsMTYuNTU4MzAzMSAyMy42NTc1MDg4LDE1LjYzODc2NzQgQzIzLjg1MjgyOTYsMTUuNDQzODY1OSAyNC4xNzAzNTEzLDE1LjQ0Mzg2NTkgMjQuMzY1NjcyMiwxNS42Mzg3Njc0IEMyNC40NjI4MzE4LDE1LjczNjcxOCAyNC41MTE5MTI0LDE1Ljg2NDY1MzQgMjQuNTExOTEyNCwxNS45OTI1OTEyIEMyNC41MTE5MTI0LDE2LjEyMDUyNDEgMjQuNDYyODMxOCwxNi4yNDg0NTk1IDI0LjM2NTY3MjIsMTYuMzQ1NDEwNiBDMjIuNDI0NDgzMSwxOC4yODI0MzI0IDIyLjQyNDQ4MzEsMjIuNjk4MjAyNCAyNC4zNjU2NzIyLDI0LjYzNDIyNDcgQzI0LjQ2MjgzMTgsMjQuNzMyMTc1MyAyNC41MTE5MTI0LDI0Ljg2MDExMDYgMjQuNTExOTEyNCwyNC45ODgwNDYgQzI0LjUxMTkxMjQsMjUuMTE1OTgxNCAyNC40NjI4MzE4LDI1LjI0MzkxNjggMjQuMzY1NjcyMiwyNS4zNDA4Njc5IEMyNC4yNjc1MTA5LDI1LjQzODgxODQgMjQuMTM5MzAwMywyNS40ODc3OTM3IDI0LjAxMTA4OTYsMjUuNDg3NzkzNyBDMjMuODgyODc5LDI1LjQ4Nzc5MzcgMjMuNzU0NjY4NCwyNS40Mzg4MTg0IDIzLjY1NzUwODgsMjUuMzQwODY3OSBDMjIuNzM1OTk0OCwyNC40MjEzMzIyIDIxLjQwNDgwNzksMjMuODkzNTk4NyAyMC4wMDQ1MDc0LDIzLjg5MzU5ODcgQzE4LjYwNTIwODYsMjMuODkzNTk4NyAxNy4yNzQwMjE2LDI0LjQyMTMzMjIgMTYuMzUyNTA3NywyNS4zNDA4Njc5IEMxNi4xNTcxODY4LDI1LjUzNTc2OTQgMTUuODM5NjY1MiwyNS41MzU3Njk0IDE1LjY0NDM0NDMsMjUuMzQwODY3OSBMMTUuNjQ0MzQ0MywyNS4zNDA4Njc5IFogTTMyLjU0MjEwNDksMTkuNDM1ODQ5OSBDMzIuMjM2NjAzLDE5LjEzMjAwMzMgMzEuODM2OTQ2NCwxOC45ODAwODAxIDMxLjQzNjI4ODIsMTguOTgwMDgwMSBDMzEuMDM2NjMxNiwxOC45ODAwODAxIDMwLjYzNjk3NSwxOS4xMzIwMDMzIDMwLjMzMTQ3MzEsMTkuNDM1ODQ5OSBDMjkuNzIxNDcxLDIwLjA0NDU0MjUgMjkuNzIxNDcxLDIxLjAzNDA0MjggMzAuMzMxNDczMSwyMS42NDE3MzU5IEMzMC45NDE0NzUzLDIyLjI1MDQyODUgMzEuOTMyMTAyNywyMi4yNTA0Mjg1IDMyLjU0MjEwNDksMjEuNjQxNzM1OSBDMzMuMTUxMTA1NCwyMS4wMzQwNDI4IDMzLjE1MTEwNTQsMjAuMDQ0NTQyNSAzMi41NDIxMDQ5LDE5LjQzNTg0OTkgTDMyLjU0MjEwNDksMTkuNDM1ODQ5OSBaIE0zMy4yNTAyNjgzLDIyLjM0OTM3ODYgQzMyLjc1MDQ0NzIsMjIuODQ4MTI2NyAzMi4wOTMzNjc3LDIzLjA5ODAwMDUgMzEuNDM2Mjg4MiwyMy4wOTgwMDA1IEMzMC43ODAyMTAzLDIzLjA5ODAwMDUgMzAuMTIzMTMwOSwyMi44NDgxMjY3IDI5LjYyMzMwOTcsMjIuMzQ5Mzc4NiBDMjguNjIzNjY3NSwyMS4zNTA4ODI4IDI4LjYyMzY2NzUsMTkuNzI3NzAyNSAyOS42MjMzMDk3LDE4LjcyOTIwNjggQzMwLjYyMjk1MiwxNy43MzE3MTA1IDMyLjI1MDYyNiwxNy43MzE3MTA1IDMzLjI1MDI2ODMsMTguNzI5MjA2OCBDMzQuMjQ5OTEwNiwxOS43Mjc3MDI1IDM0LjI0OTkxMDYsMjEuMzUwODgyOCAzMy4yNTAyNjgzLDIyLjM0OTM3ODYgTDMzLjI1MDI2ODMsMjIuMzQ5Mzc4NiBaIE05LjY2ODUyNjg3LDE5LjQ0Njg0NDMgQzkuMzYzMDI0OTcsMTkuMTQyOTk3OCA4Ljk2MzM2ODM5LDE4Ljk5MTA3NDUgOC41NjI3MTAxNywxOC45OTEwNzQ1IEM4LjE2MzA1MzU5LDE4Ljk5MTA3NDUgNy43NjMzOTcwMSwxOS4xNDI5OTc4IDcuNDU3ODk1MTEsMTkuNDQ2ODQ0MyBDNi44NDg4OTQ2MSwyMC4wNTU1MzcgNi44NDg4OTQ2MSwyMS4wNDUwMzczIDcuNDU3ODk1MTEsMjEuNjUyNzMwNCBDOC4wNjc4OTcyNiwyMi4yNjE0MjMgOS4wNTg1MjQ3MiwyMi4yNjE0MjMgOS42Njg1MjY4NywyMS42NTI3MzA0IEMxMC4yNzc1Mjc0LDIxLjA0NTAzNzMgMTAuMjc3NTI3NCwyMC4wNTU1MzcgOS42Njg1MjY4NywxOS40NDY4NDQzIEw5LjY2ODUyNjg3LDE5LjQ0Njg0NDMgWiBNMTAuMzc2NjkwMywyMi4zNTkzNzM1IEM5Ljg3Njg2OTE0LDIyLjg1ODEyMTcgOS4yMTk3ODk2NSwyMy4xMDc5OTU1IDguNTYyNzEwMTcsMjMuMTA3OTk1NSBDNy45MDY2MzIzMiwyMy4xMDc5OTU1IDcuMjQ5NTUyODQsMjIuODU4MTIxNyA2Ljc0OTczMTcsMjIuMzU5MzczNSBDNS43NTAwODk0MywyMS4zNjE4NzczIDUuNzUwMDg5NDMsMTkuNzM4Njk3IDYuNzQ5NzMxNywxOC43NDAyMDEyIEM3Ljc0OTM3Mzk3LDE3Ljc0MjcwNDkgOS4zNzcwNDgwMSwxNy43NDI3MDQ5IDEwLjM3NjY5MDMsMTguNzQwMjAxMiBDMTEuMzc2MzMyNSwxOS43Mzg2OTcgMTEuMzc2MzMyNSwyMS4zNjE4NzczIDEwLjM3NjY5MDMsMjIuMzU5MzczNSBMMTAuMzc2NjkwMywyMi4zNTkzNzM1IFogTTI3LjQzMzcxMjUsMjguOTEwMDY1NCBDMjUuNDM2NDMxMywzMC45MDMwNTkgMjIuNzgyMDcwNSwzMi4wMDA1MDQ3IDE5Ljk1NzQzMDEsMzIuMDAwNTA0NyBDMTcuMTMyNzg5NiwzMi4wMDA1MDQ3IDE0LjQ3ODQyODgsMzAuOTAzMDU5IDEyLjQ4MjE0OTIsMjguOTEwMDY1NCBDMTEuMTY1OTg3LDI3LjU5NzcyODEgMTAuNDA3NzQxMywyNi40NjkyOTggOS45NDQ5ODEwNCwyNS4xMzU5NzEzIEw4Ljk5ODQyNTk5LDI1LjQ2MjgwNjMgQzkuNTA3MjYxOTMsMjYuOTI5MDY1OCAxMC4zNjI2NjcyLDI4LjIxMDQxODcgMTEuNzczOTg1OCwyOS42MTY3MDg2IEMxMy45NTg1NzQ4LDMxLjc5ODYwNjcgMTYuODY2MzUxOSwzMyAxOS45NTc0MzAxLDMzIEMyMy4wNDk1MDk5LDMzIDI1Ljk1NjI4NTMsMzEuNzk4NjA2NyAyOC4xNDE4NzU5LDI5LjYxNjcwODYgQzI5LjI4Mjc1MDIsMjguNDc4MjgzNSAzMC40MjA2MTk2LDI3LjE4NjkzNTYgMzEuMDExNTkwNSwyNS40NjA4MDczIEwzMC4wNjQwMzM4LDI1LjEzNzk3MDMgQzI5LjUzOTE3MTUsMjYuNjcwMTk2NiAyOC40ODk0NDY5LDI3Ljg1NjU5NzQgMjcuNDMzNzEyNSwyOC45MTAwNjU0IEwyNy40MzM3MTI1LDI4LjkxMDA2NTQgWiBNOS45NDQ5ODEwNCwxNS44NTk2NTU5IEw4Ljk5ODQyNTk5LDE1LjUzMTgyMTQgQzkuNTEwMjY2ODcsMTQuMDY0NTYyNCAxMC4zNjU2NzIyLDEyLjc4MzIwOTUgMTEuNzc1OTg5MSwxMS4zNzU5MjAyIEMxNi4yODYzOTkxLDYuODc1MTkzMDQgMjMuNjI2NDU3OCw2Ljg3NDE5MzU0IDI4LjEzNzg2OTQsMTEuMzc1OTIwMiBDMjkuMjE4NjQ0OSwxMi40NTMzNzYxIDMwLjQwMzU5MTYsMTMuNzg5NzAxMiAzMS4wMTE1OTA1LDE1LjUzMTgyMTQgTDMwLjA2NDAzMzgsMTUuODU5NjU1OSBDMjkuNTI0MTQ2OCwxNC4zMDk0Mzg3IDI4LjQyOTM0ODIsMTMuMDgwMDU5NiAyNy40Mjk3MDU5LDEyLjA4MjU2MzMgQzI1LjQzNDQyOCwxMC4wOTE1Njg4IDIyLjc4MTA2ODksOC45OTYxMjE5NyAxOS45NTc0MzAxLDguOTk2MTIxOTcgQzE3LjEzMzc5MTIsOC45OTYxMjE5NyAxNC40ODA0MzIxLDEwLjA5MTU2ODggMTIuNDg1MTU0MiwxMi4wODI1NjMzIEMxMS4xODcwMjE1LDEzLjM3NzkwOTIgMTAuNDAzNzM0NywxNC41NDIzMjExIDkuOTQ0OTgxMDQsMTUuODU5NjU1OSBMOS45NDQ5ODEwNCwxNS44NTk2NTU5IFonCiAgICAgICAgICAgICAgaWQ9J0FXUy1TaW1wbGUtUXVldWUtU2VydmljZV9JY29uXzMyX1NxdWlkJyBmaWxsPScjRkZGRkZGJz48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "queueProperties"
      },
      {
        "group": "messagePollingProperties"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.PowerAutomate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='96' height='96' viewBox='0 0 96 96' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='filter0_f'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape'/%3E%3CfeGaussianBlur stdDeviation='0.4' result='effect1_foregroundBlur'/%3E%3C/filter%3E%3Cfilter id='filter1_f'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape'/%3E%3CfeGaussianBlur stdDeviation='4' result='effect1_foregroundBlur'/%3E%3C/filter%3E%3ClinearGradient id='paint0_linear' x1='43' y1='55' x2='29' y2='10' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%230D36A5'/%3E%3Cstop offset='1' stop-color='%231152D4'/%3E%3C/linearGradient%3E%3ClinearGradient id='paint1_linear' x1='46' y1='10' x2='46' y2='86' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%2384CAFF'/%3E%3Cstop offset='1' stop-color='%2361B1FB'/%3E%3C/linearGradient%3E%3ClinearGradient id='paint2_linear' x1='37.5' y1='10' x2='37.5' y2='86' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%233B90F5'/%3E%3Cstop offset='1' stop-color='%232A78EE'/%3E%3C/linearGradient%3E%3CclipPath id='clip0'%3E%3Crect width='96' height='96' fill='white'/%3E%3C/clipPath%3E%3CclipPath id='clip1'%3E%3Crect width='96' height='96' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3Cg clip-path='url(%23clip0)'%3E%3Cg clip-path='url(%23clip1)'%3E%3Cmask id='mask0' mask-type='alpha' maskUnits='userSpaceOnUse' x='-1' y='10' width='97' height='76'%3E%3Cpath d='M61.2116 10C62.3496 10 63.4337 10.4847 64.1925 11.3328L94.6136 45.3328C95.9723 46.8514 95.9723 49.1486 94.6136 50.6672L64.1925 84.6672C63.4337 85.5153 62.3496 86 61.2116 86H3.94634C0.488777 86 -1.34012 81.9095 0.965366 79.3328L29 48L0.965366 16.6672C-1.34012 14.0905 0.488777 10 3.94634 10H61.2116Z' fill='white'/%3E%3C/mask%3E%3Cg mask='url(%23mask0)'%3E%3Cpath d='M63 10L29 48L-5 10H63Z' fill='url(%23paint0_linear)'/%3E%3Cg filter='url(%23filter0_f)'%3E%3Cpath d='M63 10.4L-5 86.4H63L97 48.4L63 10.4Z' fill='black' fill-opacity='0.24'/%3E%3C/g%3E%3Cg filter='url(%23filter1_f)'%3E%3Cpath d='M63 12L-5 88H63L97 50L63 12Z' fill='black' fill-opacity='0.32'/%3E%3C/g%3E%3Cpath d='M-5 86L63 10L97 48L63 86H-5Z' fill='url(%23paint1_linear)'/%3E%3Cpath d='M-5 86L63 10L80 29L29 86H-5Z' fill='url(%23paint2_linear)'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "configuration"
      },
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      },
      {},
      {},
      {},
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.webhook.WebhookConnectorBoundary.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        },
        {
          "id": "webhookResponse",
          "label": "Webhook response"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg id='icon' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 32 32'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: none; %7D %3C/style%3E%3C/defs%3E%3Cpath d='M24,26a3,3,0,1,0-2.8164-4H13v1a5,5,0,1,1-5-5V16a7,7,0,1,0,6.9287,8h6.2549A2.9914,2.9914,0,0,0,24,26Z'/%3E%3Cpath d='M24,16a7.024,7.024,0,0,0-2.57.4873l-3.1656-5.5395a3.0469,3.0469,0,1,0-1.7326.9985l4.1189,7.2085.8686-.4976a5.0006,5.0006,0,1,1-1.851,6.8418L17.937,26.501A7.0005,7.0005,0,1,0,24,16Z'/%3E%3Cpath d='M8.532,20.0537a3.03,3.03,0,1,0,1.7326.9985C11.74,18.47,13.86,14.7607,13.89,14.708l.4976-.8682-.8677-.497a5,5,0,1,1,6.812-1.8438l1.7315,1.002a7.0008,7.0008,0,1,0-10.3462,2.0356c-.457.7427-1.1021,1.8716-2.0737,3.5728Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "webhookResponse"
      }
    ]
  },
  "io.camunda.connectors.azure.blobstorage.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": [
          "download file from azure blob storage",
          "upload file to azure blob storage"
        ]
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "additionalProperties",
          "label": "Additional properties"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMCAyMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkuMzAyNTQgMTIuMTI4M0w5LjI4NjI1IDEyLjMwNDdDOS4yNzI2OCAxMi40NTQgOS4yNjA0NyAxMi42MDA2IDkuMjQyODMgMTIuNzQ1OEM5LjIzMDEyIDEyLjgyIDkuMjA3MjkgMTIuODkyMiA5LjE3NDk3IDEyLjk2MDJDOS4xMzAxOSAxMy4wNjQ3IDkuMDQ0NjkgMTMuMTE5IDguOTMwNjkgMTMuMTMyNkM4LjY1NTIgMTMuMTY1MSA4LjU1ODg0IDEzLjAyNjcgOC41MDMyIDEyLjc5MzNDOC40Mjk5MiAxMi40ODY2IDguNDM2NyAxMi4xNzMxIDguNDUyOTkgMTEuODU5Nkw4LjQ1NDM0IDExLjgzNjVDOC40NTQwNSAxMS43MTg2IDguNDcyMzcgMTEuNjAxMyA4LjUwODYzIDExLjQ4OTFDOC41MzIwNiAxMS40MjIzIDguNTYxNTkgMTEuMzU3OCA4LjU5Njg0IDExLjI5NjRDOC43MDk0OCAxMS4xMDkxIDkuMDMxMTIgMTEuMTI2OCA5LjEzODMzIDExLjI2OTNDOS4xOTExOSAxMS4zNDQzIDkuMjI1NiAxMS40MzA4IDkuMjM4NzUgMTEuNTIxN0M5LjI2MDQ3IDExLjY2NjkgOS4yNzQwNCAxMS44MTM1IDkuMjg2MjUgMTEuOTU4N0w5LjMwMjU0IDEyLjEyODNaTTEwLjc4MDQgNy42MDc3OEMxMC42OTkgNy44NDkzNSAxMC42OTIyIDguMDk5MDUgMTAuNjk2MyA4LjM2Nzc2QzEwLjY4ODEgOC42MDY2MSAxMC43MDE3IDguODYwMzkgMTAuNzgwNCA5LjEwNzM5QzEwLjgxNTcgOS4yMTg2NyAxMC44ODIyIDkuMzA1NTMgMTAuOTk3NiA5LjMyNzI0QzExLjEyOTIgOS4zNTAzMSAxMS4yNjA4IDkuMzU0MzggMTEuMzYxMyA5LjIzNzY3QzExLjQ0NzEgOS4xMzM1NSAxMS40OTkyIDkuMDA1NzMgMTEuNTEwNiA4Ljg3MTI1QzExLjU1NjggOC41MzEyOCAxMS41NTY4IDguMTg2NiAxMS41MTA2IDcuODQ2NjNDMTEuNDk3NyA3Ljc0MzExIDExLjQ2ODQgNy42NDIzMSAxMS40MjM3IDcuNTQ4MDdDMTEuMzg5OCA3LjQ4MjkyIDExLjMyNiA3LjQwODI4IDExLjI1ODEgNy4zODY1N0MxMS4wNjgxIDcuMzI2ODYgMTAuODYxOSA3LjM2ODkzIDEwLjc4MDQgNy42MDc3OFoiIGZpbGw9IiMwMDdGRkYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMi40ODAxIDYuMDM2MzJWNy42MjgyMUgxNC4wNTAzQzE0LjA1MDMgNy42NDg1NiAxNC4wNTMgNy42Njc1NiAxNC4wNTQzIDcuNjg1MjFDMTQuMDU4NCA3LjcyMTg1IDE0LjA2MTEgNy43NTMwNiAxNC4wNjExIDcuNzg1NjNWMTMuODAzMUMxNC4wNjExIDEzLjkxNTcgMTQuMDYxMSAxNC4wMjcgMTQuMDA2OCAxNC4xMzE1QzEzLjkxMTkgMTQuMzE2IDEzLjc3MzQgMTQuNDM1NSAxMy41NTkgMTQuNDUxOEwxMy41MDA2IDE0LjQ1NThDMTMuNDA5NyAxNC40NjI2IDEzLjMxODggMTQuNDY5NCAxMy4yMjkyIDE0LjQ2OTRINi42NjIxNkM2LjU2MDM4IDE0LjQ2OTQgNi40NTg2IDE0LjQ2MjYgNi4zNTk1MyAxNC40NDM2QzYuMjQ3NzcgMTQuNDIwNCA2LjE0NjI5IDE0LjM2MjMgNi4wNjk3IDE0LjI3NzZDNS45OTMxMSAxNC4xOTMgNS45NDUzOCAxNC4wODYyIDUuOTMzNCAxMy45NzI3QzUuOTI4ODYgMTMuOTE4NSA1LjkyNzA1IDEzLjg2NDIgNS45Mjc5NyAxMy44MDk4VjYuNzAyNjZDNS45Mjc5NyA2LjU2Mjg4IDUuOTM0NzUgNi40MzEyNCA2LjAxNDgyIDYuMzA1MDNDNi4wNjI1NiA2LjIzMjE0IDYuMTI1OTUgNi4xNzA4MiA2LjIwMDM3IDYuMTI1NTFDNi4yNzQ3OCA2LjA4MDIgNi4zNTgzNiA2LjA1MjA1IDYuNDQ1MDMgNi4wNDMxQzYuNDk1MjQgNi4wMzQ5NiA2LjU0ODE3IDYuMDM0OTYgNi41OTk3NCA2LjAzNjMySDEyLjQ4MDFaTTcuODc1NDIgMTIuMzMwNkw3Ljg2NDU3IDEyLjE3NTlDNy44Njk5OSAxMS45MDE3IDcuODkzMDYgMTEuNjMwMyA3Ljk4Mzk5IDExLjM3MTFDOC4wODMwNiAxMS4wODM0IDguMjU2NzcgMTAuODU5NSA4LjU3MDI2IDEwLjc2NThDOC44Mzc2MSAxMC42ODQ0IDkuMTAwODkgMTAuNjk4IDkuMzQ5MjQgMTAuODA3OUM5LjQzNjQ2IDEwLjg0NDUgOS41MTUwOCAxMC44OTg4IDkuNTgwMDUgMTAuOTY3NUM5LjY0NTAyIDExLjAzNjMgOS42OTQ5MSAxMS4xMTc4IDkuNzI2NTIgMTEuMjA2OUM5Ljg3MzA5IDExLjYyMzUgOS44OTc1MiAxMi4wNDgzIDkuODQ4NjYgMTIuNDgyNkM5LjgyODMgMTIuNjY1OCA5Ljc5NDM4IDEyLjg0NDkgOS43MjY1MiAxMy4wMTczQzkuNjcyNDIgMTMuMTcwNyA5LjU3NDMyIDEzLjMwNDggOS40NDQ0NyAxMy40MDI4QzkuMzE0NjEgMTMuNTAwOCA5LjE1ODc3IDEzLjU1ODMgOC45OTY0IDEzLjU2ODNDOC44NDcxMSAxMy41ODQ2IDguNjk5MTkgMTMuNTgxOSA4LjU1NTMzIDEzLjU1MDZDOC40NDYyMSAxMy41MjY5IDguMzQzOTEgMTMuNDc4NyA4LjI1NjIgMTMuNDA5NUM4LjE2ODUgMTMuMzQwNCA4LjA5NzY4IDEzLjI1MjIgOC4wNDkxMyAxMy4xNTE2QzcuOTcxNTkgMTIuOTk4OSA3LjkyMjM5IDEyLjgzMzQgNy45MDM5MiAxMi42NjMxQzcuODkwOTYgMTIuNTUyNiA3Ljg4MTQ1IDEyLjQ0MTcgNy44NzU0MiAxMi4zMzA2Wk0xMi4xMTM3IDguMTY0MjdMMTIuMTMxMyA4LjMyNDQxQzEyLjExNzggOC42MDM5NyAxMi4wODkzIDguODc2NzUgMTIuMDAxIDkuMTQxMzlDMTEuODk5MyA5LjQ0Njc0IDExLjcxMDYgOS42NzIwMiAxMS4zODYzIDkuNzQ2NjZDMTEuMDcwMSA5LjgxODU5IDEwLjc1NjYgOS44MDYzNyAxMC40ODI0IDkuNTk3MzhDMTAuMzQ2MiA5LjQ4NDQxIDEwLjI1MTYgOS4zMjkxNyAxMC4yMTM3IDkuMTU2MzFDMTAuMTEzNyA4Ljc2MTc5IDEwLjA5MTEgOC4zNTE2MSAxMC4xNDcyIDcuOTQ4NDlDMTAuMTYxMSA3LjcxMzEgMTAuMjM3IDcuNDg1NTcgMTAuMzY3MSA3LjI4ODkzQzEwLjQ0NzQgNy4xNzc0OCAxMC41NTI0IDcuMDg2MTYgMTAuNjczOSA3LjAyMjExQzEwLjc5NTQgNi45NTgwNiAxMC45MyA2LjkyMzA0IDExLjA2NzMgNi45MTk4QzExLjI0MzggNi45MDg5NCAxMS40MTQ4IDYuOTM0NzIgMTEuNTc2MyA3LjAwMTIyQzExLjY3NjcgNy4wNDE5NCAxMS43NjM1IDcuMTA1NzIgMTEuODM0MSA3LjE5MzkzQzExLjk4NjEgNy4zODM5MyAxMi4wNTk0IDcuNjAxMDcgMTIuMDc4NCA3LjgzOTkyQzEyLjA4NzkgNy45NDg0OSAxMi4xMDE1IDguMDU3MDUgMTIuMTEzNyA4LjE2NDI3Wk0xMi4wMzYzIDEzLjI1NjFDMTIuMDQ3MiAxMy4zNTE3IDEyLjAyNDYgMTMuNDQ4MSAxMS45NzI1IDEzLjUyODlMMTEuOTQgMTMuNTMxNkMxMS45MTI4IDEzLjUzMyAxMS44ODMgMTMuNTM1NyAxMS44NTMxIDEzLjUzNTdIMTEuNDI5N0MxMS4xMTc2IDEzLjUzNDQgMTAuODA1NCAxMy41MzMgMTAuNDkxOSAxMy41Mzg0QzEwLjM1NjIgMTMuNTM5OCAxMC4zMTY5IDEzLjQ4OTYgMTAuMzE2OSAxMy4zNzAxVjEzLjMxOTlWMTMuMjMwNEMxMC4zMjM2IDEzLjE0MzUgMTAuMzU0OSAxMy4xMTM2IDEwLjQ0NTggMTMuMTEwOUMxMC41MjQ1IDEzLjEwODIgMTAuNjAzMiAxMy4xMDgyIDEwLjY4MTkgMTMuMTA5NkgxMC44OTY0QzEwLjkyNjIgMTMuMDA2NCAxMC45MzU3IDExLjUwODIgMTAuOTA5OSAxMS4zMTgyQzEwLjg5ODcgMTEuMzIyOSAxMC44ODc0IDExLjMyNzQgMTAuODc2IDExLjMzMThDMTAuODUyMSAxMS4zMzg3IDEwLjgyOSAxMS4zNDc3IDEwLjgwNjggMTEuMzU4OUwxMC42ODE5IDExLjQzMzVDMTAuNjI3NiAxMS40NjYxIDEwLjU3MDYgMTEuNSAxMC41MTM2IDExLjUzMTNDMTAuNDc5NSAxMS41NDc5IDEwLjQ0MjggMTEuNTU4OSAxMC40MDUxIDExLjU2MzhDMTAuMzU0OSAxMS41NzA2IDEwLjMxOTYgMTEuNTUwMyAxMC4zMTY5IDExLjQ5NzNDMTAuMzEyOCAxMS40MTc4IDEwLjMxMzMgMTEuMzM4IDEwLjMxODIgMTEuMjU4NUMxMC4zMjA5IDExLjIzMTMgMTAuMzQ0IDExLjE5NzQgMTAuMzY4NCAxMS4xNzcxQzEwLjQwOTEgMTEuMTQzMSAxMC40NTUzIDExLjExNDYgMTAuNTAxNCAxMS4wODQ4TDEwLjUyMzEgMTEuMDcxMkwxMC42NDk0IDEwLjk5MTFDMTAuNzI4MSAxMC45NDIzIDEwLjgwODEgMTAuODk0OCAxMC44ODI4IDEwLjg0MDVDMTAuOTgwNiAxMC43NzMgMTEuMDk3OSAxMC43Mzk3IDExLjIxNjYgMTAuNzQ1NUMxMS4yNzM2IDEwLjc0NTUgMTEuMzI5MyAxMC43NTM2IDExLjM5MDMgMTAuNzYwNEwxMS40ODI2IDEwLjc3MTNWMTMuMDk3NEwxMS41NTA1IDEzLjEwMjhMMTEuNjU5IDEzLjEwOTZIMTEuODg4NEMxMS45OTQzIDEzLjExMzcgMTIuMDI5NSAxMy4xNTAzIDEyLjAzNzcgMTMuMjU2MUgxMi4wMzYzWk05LjI0MDY4IDYuOTY1OTRWOS4zMDk2N0w5LjI0MjAzIDkuMzExMDNIOS42MjIwMkM5Ljc0Njg4IDkuMzExMDMgOS43NzEzMSA5LjMzMTM4IDkuNzc4MDkgOS40NTQ4OEM5Ljc3OTU1IDkuNTI1ODEgOS43NzQxIDkuNTk2NzIgOS43NjE4MSA5LjY2NjU5QzkuNzU1MDIgOS43MTQwOSA5LjcyMTA5IDkuNzM4NTIgOS42NzA4OCA5LjczNzE2SDguMjU5NDhDOC4xMTY5OSA5LjczNzE2IDguMTAzNDIgOS43MjM1OSA4LjA4ODQ5IDkuNTgyNDVDOC4wODY2IDkuNTY5ODQgOC4wODUyNCA5LjU1NzE3IDguMDg0NDIgOS41NDQ0NUM4LjA3NDkyIDkuMzM0MSA4LjA5Nzk5IDkuMzA5NjcgOC4zMDU2MyA5LjMwOTY3SDguNTg1MTlDOC42NjY2MiA5LjMwNjk1IDguNjc4ODMgOS4yOTYxIDguNjgwMTkgOS4yMTE5NlY4LjkwMzg5VjcuNTIzNzFMOC42NDM1NSA3LjUzMTg1QzguNjIyNTEgNy41Mzc2MSA4LjYwMjA2IDcuNTQ1MzMgOC41ODI0OCA3LjU1NDkyQzguNTM1NjMgNy41ODAyNiA4LjQ4OTA0IDcuNjA2MDQgOC40NDI2OSA3LjYzMjI4QzguMzgzMDcgNy42NjYyOCA4LjMyMjkgNy42OTkzMSA4LjI2MjIgNy43MzEzNUM4LjIzMjM0IDcuNzQ3NjMgOC4xOTg0MSA3Ljc1NzEzIDguMTY0NDkgNy43NjY2M0w4LjExOTcgNy43ODAyQzguMDcwMzcgNy42Nzc5NCA4LjA1OTc2IDcuNTYxMjcgOC4wODk4NSA3LjQ1MTc4QzguMTAwODIgNy40MTIxNCA4LjEyNTMgNy4zNzc1OCA4LjE1OTA2IDcuMzU0MDdDOC4zMzk1NSA3LjIzMTkzIDguNTIxNDEgNy4xMTExNSA4LjcwODY5IDYuOTk3MTVDOC43NDU4OSA2Ljk3NzY1IDguNzg2MzggNi45NjUyMyA4LjgyODExIDYuOTYwNTFDOC44Mzk5MSA2Ljk1ODQyIDguODUxNjcgNi45NTYxNiA4Ljg2MzQgNi45NTM3MkM4LjkzODA0IDYuOTM4OCA5LjAwODYxIDYuOTQ2OTQgOS4wODMyNSA2Ljk1MzcyQzkuMTMzNDYgNi45NjA1MSA5LjE4NTAzIDYuOTY4NjUgOS4yNDA2OCA2Ljk2NTk0WiIgZmlsbD0iIzAwN0ZGRiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE5LjI5NTEgMTAuNjAxNkwxOS41IDEwLjI1NTVMMTkuNDIyNiAxMC4xMTk4TDE5LjIxMjMgOS43NTYxTDE5LjA2NzEgOS41MTA0NkMxOC44OTYxIDkuMjE2OTQgMTguNzI2IDguOTIyOSAxOC41NTY4IDguNjI4MzRDMTguMjUzNSA4LjA5OTYyIDE3Ljk0NzIgNy41NzI2IDE3LjYzOCA3LjA0NzMxTDE3LjQzMzEgNi43MDI2TDE3LjEyNzggNi4xODQxOEMxNy4wMTkyIDUuOTk5NjIgMTYuOTEzMyA1LjgxMzY5IDE2LjgwNjEgNS42Mjc3N0wxNi41OTQ0IDUuMjYxMzVDMTYuMjg5MSA0LjczMzQ4IDE1Ljk4MTQgNC4yMDY5MSAxNS42NzE2IDMuNjgxNjdMMTUuNTE4MiAzLjQyMzgyTDE1LjQwMjkgMy4yMjk3NUwxNS4xNzIyIDIuODQxNjJMMTUuMTQ3NyAyLjc5ODE5QzE1LjAyODYgMi41OTY0NyAxNC45MTE5IDIuMzkzMzQgMTQuNzk3NiAyLjE4ODg1QzE0Ljc2MzcgMi4xMjkxNCAxNC43MjQzIDIuMTAzMzUgMTQuNjU2NSAyLjExMDE0QzE0LjYyNjcgMi4xMTI3OSAxNC41OTY3IDIuMTEyNzkgMTQuNTY2OSAyLjExMDE0SDcuNTU0NzFDNi44MjE4NyAyLjExMDE0IDYuMDg5MDMgMi4xMTAxNCA1LjM1NjE5IDIuMTA3NDJDNS4yNjI1NSAyLjEwNzQyIDUuMjEzNjkgMi4xMzg2NCA1LjE2ODkxIDIuMjE4N0M0Ljk0NzcgMi42MTIyNyA0LjcyMTA2IDMuMDAxNzYgNC40OTQ0MiAzLjM5MjYxTDQuMzgxNzggMy41ODgwM0wzLjg1MjUxIDQuNDk3MjlMMy41OTE5NSA0LjkzODM2QzMuMjI3ODYgNS41NTIzMyAyLjg2ODIyIDYuMTY4OTMgMi41MTMwNCA2Ljc4ODFMMi4yNDI5OCA3LjI1NDk0QzIuMDc3NDQgNy41NDAxMSAxLjkxMDA2IDcuODI0MjEgMS43NDA4NSA4LjEwNzIxTDEuNTIwOTkgOC40ODA0MUwxLjMwMjUgOC44NTM2MkwxLjE1NzI5IDkuMDk3OUwwLjkyNjU4IDkuNDg4NzVDMC43OTA4NjkgOS43MTk0NiAwLjY1NjUxNSA5Ljk1MTUyIDAuNTIzNTE4IDEwLjE4MzZDMC40OTkwOSAxMC4yMjQzIDAuNDg4MjMzIDEwLjI2MjMgMC41MTgwOSAxMC4zMTEyQzAuNTc1MDg4IDEwLjQwNjIgMC42MjkzNzMgMTAuNTAxMiAwLjY4MzY1NyAxMC41OTYyTDAuODAxNzI2IDEwLjc5OTdMMC45NzgxNSAxMS4wOTU2QzEuMDYwOTMgMTEuMjM0IDEuMTQzNzIgMTEuMzcxMSAxLjIyMzc5IDExLjUwOTVDMS4zMTYwNyAxMS42NjgzIDEuNDA1NjQgMTEuODI4NCAxLjQ5NjU3IDExLjk4ODVDMS42MDUxNCAxMi4xODI2IDEuNzEzNyAxMi4zNzUzIDEuODI2MzQgMTIuNTY2N0wyLjIzNzU1IDEzLjI1ODhMMi41MjkzMyAxMy43NTE0TDIuNzQyMzkgMTQuMTE5MkMyLjg3NjQzIDE0LjM1MzIgMy4wMTIxNCAxNC41ODYxIDMuMTQ5NTMgMTQuODE4MUwzLjQwNDY2IDE1LjI1NjVMNC4wNjU1OCAxNi4zOTI0TDQuMjI0MzYgMTYuNjY3OUM0LjMwNTc5IDE2LjgxMTcgNC4zODg1NyAxNi45NTU2IDQuNDcyNzEgMTcuMDk4MUw0LjcxMDIxIDE3LjQ5OThDNC44NTgxMyAxNy43NTA4IDUuMDA2MDYgMTguMDAxOSA1LjE1MTI3IDE4LjI1NDNDNS4yMDY5MSAxOC4zNTIgNS4yNjY2MiAxOC4zOTI4IDUuMzg2MDUgMTguMzkyOEM3LjQwODE0IDE4LjM4ODcgOS40Mjg4OCAxOC4zOSAxMS40NDk2IDE4LjM5SDE0LjYzNjFDMTQuNzE0OCAxOC4zOSAxNC43NjM3IDE4LjM3MzggMTQuODA3MSAxOC4yOTc4QzE1LjA2NjMgMTcuODM2MyAxNS4zMzM3IDE3LjM3NjMgMTUuNjAxIDE2LjkxODlDMTUuNzI0NSAxNi43MDQ1IDE1Ljg1MDcgMTYuNDkxNCAxNS45NzY5IDE2LjI3ODRMMTYuMzI1NyAxNS42ODY3TDE2Ljc4NzEgMTQuODkxNEwxNy4xOTE2IDE0LjE5MTFDMTcuNTA5MiAxMy42NDYyIDE3LjgzMDQgMTMuMTAzNCAxOC4xNTUxIDEyLjU2MjZDMTguMjUyOCAxMi4zOTcgMTguMzQ2NSAxMi4yMzAxIDE4LjQ0MTUgMTIuMDYzMkMxOC41NDQ2IDExLjg4MTMgMTguNjQ3NyAxMS42OTk1IDE4Ljc1MzYgMTEuNTIwM0MxOC45MzI3IDExLjIxMzYgMTkuMTEzMiAxMC45MDgzIDE5LjI5NTEgMTAuNjAxNlpNNS4yMTkxMiAxMy43OTc2VjYuNzE0ODFDNS4yMTkxMiA2LjUzNDMyIDUuMjMyNjkgNi4zNTc4OSA1LjI5NjQ4IDYuMTg1NTRDNS4zOTI5MyA1LjkyMzU1IDUuNTcyNjYgNS43MDA0MyA1LjgwODExIDUuNTUwNDFDNi4wNDk2NyA1LjM5Mjk5IDYuMzE4MzggNS4zMzU5OSA2LjYwMzM3IDUuMzM1OTlINy43MDM5OUM5LjM1NTYgNS4zMzU5OSAxMS4wMDcyIDUuMzM1OTkgMTIuNjU3NCA1LjMzMzI3QzEyLjc2NDcgNS4zMzMyNyAxMi44MzEyIDUuMzcyNjMgMTIuODk3NyA1LjQ0MTg0QzEyLjk3NSA1LjUyMzI3IDEzLjA1NTEgNS42MDA2MyAxMy4xMzUyIDUuNjc5MzRMMTMuMjY0MSA1LjgwNTU1TDEzLjM5MyA1LjkzNTgzQzEzLjQ2NzYgNi4wMTE4MyAxMy41NDIzIDYuMDg3ODMgMTMuNjE5NiA2LjE2MTExTDE0LjAwOTEgNi41MzcwM0wxNC4zOTg2IDYuOTEyOTVMMTQuNTUwNiA3LjA2NjNMMTQuNzE3NSA3LjIzMzIzQzE0Ljc1ODMgNy4yNzEyMyAxNC43NjkxIDcuMzE0NjYgMTQuNzY5MSA3LjM2NjIzVjEzLjc4ODFDMTQuNzY5MSAxMy44MzY5IDE0Ljc2OTEgMTMuODg1OCAxNC43NjY0IDEzLjkzMzNDMTQuNzU4MiAxNC4xNTM2IDE0LjY5MjIgMTQuMzY3OSAxNC41NzUgMTQuNTU0N0MxNC40NTc4IDE0Ljc0MTQgMTQuMjkzNSAxNC44OTQxIDE0LjA5ODcgMTQuOTk3M0MxMy44NzggMTUuMTE1NCAxMy42Mjk1IDE1LjE3MTcgMTMuMzc5NCAxNS4xNjAxSDYuNTg4NDVDNi40MDIxMSAxNS4xNjkxIDYuMjE1OTMgMTUuMTM5NSA2LjA0MTUzIDE1LjA3MzNDNS43ODc2NCAxNC45NzQ0IDUuNTcxNTEgMTQuNzk3NyA1LjQyNDA1IDE0LjU2ODZDNS4yNzY1OSAxNC4zMzk1IDUuMjAzOTggMTQuMDY5NiA1LjIxOTEyIDEzLjc5NzZaIiBmaWxsPSIjMDA3RkZGIi8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation",
        "tooltip": "A container acts as a directory that organizes a set of blobs."
      },
      {
        "group": "operation",
        "tooltip": "Specify the name of the document to be downloaded."
      },
      {
        "group": "operation",
        "tooltip": "By default, only a reference to the document is returned. If this option is unchecked, the full content of the document is extracted and included in the response."
      },
      {
        "group": "operation",
        "tooltip": "A container acts as a directory that organizes a set of blobs."
      },
      {
        "group": "operation",
        "tooltip": "Document to be uploaded to Azure Blob Storage."
      },
      {
        "group": "additionalProperties",
        "tooltip": "By default, the file's metadata name is used unless a custom name is specified."
      },
      {
        "group": "additionalProperties"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.inbound.Slack.ReceiveTask.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI3IiBoZWlnaHQ9IjEyNyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMjcuMiA4MGMwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjJDNi43IDkzLjIuOCA4Ny4zLjggODBjMC03LjMgNS45LTEzLjIgMTMuMi0xMy4yaDEzLjJWODB6bTYuNiAwYzAtNy4zIDUuOS0xMy4yIDEzLjItMTMuMiA3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjJ2MzNjMCA3LjMtNS45IDEzLjItMTMuMiAxMy4yLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMlY4MHoiIGZpbGw9IiNFMDFFNUEiLz4KICA8cGF0aCBkPSJNNDcgMjdjLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMkMzMy44IDYuNSAzOS43LjYgNDcgLjZjNy4zIDAgMTMuMiA1LjkgMTMuMiAxMy4yVjI3SDQ3em0wIDYuN2M3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjIgMCA3LjMtNS45IDEzLjItMTMuMiAxMy4ySDEzLjlDNi42IDYwLjEuNyA1NC4yLjcgNDYuOWMwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjJINDd6IiBmaWxsPSIjMzZDNUYwIi8+CiAgPHBhdGggZD0iTTk5LjkgNDYuOWMwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjIgNy4zIDAgMTMuMiA1LjkgMTMuMiAxMy4yIDAgNy4zLTUuOSAxMy4yLTEzLjIgMTMuMkg5OS45VjQ2Ljl6bS02LjYgMGMwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjItNy4zIDAtMTMuMi01LjktMTMuMi0xMy4yVjEzLjhDNjYuOSA2LjUgNzIuOC42IDgwLjEuNmM3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjJ2MzMuMXoiIGZpbGw9IiMyRUI2N0QiLz4KICA8cGF0aCBkPSJNODAuMSA5OS44YzcuMyAwIDEzLjIgNS45IDEzLjIgMTMuMiAwIDcuMy01LjkgMTMuMi0xMy4yIDEzLjItNy4zIDAtMTMuMi01LjktMTMuMi0xMy4yVjk5LjhoMTMuMnptMC02LjZjLTcuMyAwLTEzLjItNS45LTEzLjItMTMuMiAwLTcuMyA1LjktMTMuMiAxMy4yLTEzLjJoMzMuMWM3LjMgMCAxMy4yIDUuOSAxMy4yIDEzLjIgMCA3LjMtNS45IDEzLjItMTMuMiAxMy4ySDgwLjF6IiBmaWxsPSIjRUNCMjJFIi8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda:soap": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "connection",
          "label": "Connection"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "soap-message",
          "label": "SOAP Message"
        },
        {
          "id": "timeout",
          "label": "Timeout"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyM3B4IiBoZWlnaHQ9IjIzcHgiIHZpZXdCb3g9IjAgMCAxOCAyMiIgdmVyc2lvbj0iMS4xIj4KPGcgaWQ9InN1cmZhY2UxIj4KPHBhdGggc3R5bGU9IiBzdHJva2U6bm9uZTtmaWxsLXJ1bGU6bm9uemVybztmaWxsOnJnYigwJSwwJSwwJSk7ZmlsbC1vcGFjaXR5OjE7IiBkPSJNIDYuNDYwOTM4IDAuODYzMjgxIEMgNS43NjE3MTkgMC45ODQzNzUgNS4yOTY4NzUgMS4yMTQ4NDQgNC44MjQyMTkgMS42ODM1OTQgQyA0LjQwMjM0NCAyLjEwMTU2MiA0LjE1MjM0NCAyLjU3MDMxMiA0LjA2MjUgMy4xMTMyODEgQyA0LjAxNTYyNSAzLjM2NzE4OCA0LjAyNzM0NCAzLjg2MzI4MSA0LjA4MjAzMSA0LjEwOTM3NSBDIDQuMjU3ODEyIDQuODgyODEyIDQuNzMwNDY5IDUuNTExNzE5IDUuNDMzNTk0IDUuOTAyMzQ0IEMgNi41NDI5NjkgNi41MTk1MzEgNy45NTcwMzEgNi4zMTI1IDguODQ3NjU2IDUuNDA2MjUgQyA5LjMzOTg0NCA0LjkwNjI1IDkuNjAxNTYyIDQuMjYxNzE5IDkuNjAxNTYyIDMuNTYyNSBDIDkuNjAxNTYyIDIuNzY1NjI1IDkuMjc3MzQ0IDIuMDcwMzEyIDguNjU2MjUgMS41NDI5NjkgQyA4LjIxODc1IDEuMTY3OTY5IDcuNzkyOTY5IDAuOTcyNjU2IDcuMjAzMTI1IDAuODc1IEMgNi44OTg0MzggMC44MjQyMTkgNi43MDMxMjUgMC44MjAzMTIgNi40NjA5MzggMC44NjMyODEgWiBNIDcuMzUxNTYyIDEuODg2NzE5IEMgNy44Mzk4NDQgMi4wNDY4NzUgOC4xOTkyMTkgMi4zMzk4NDQgOC40MTAxNTYgMi43NSBDIDguNTE5NTMxIDIuOTY4NzUgOC41NjI1IDMuMTE3MTg4IDguNTkzNzUgMy4zODY3MTkgQyA4LjY4MzU5NCA0LjI1MzkwNiA4LjE2NDA2MiA1LjAxMTcxOSA3LjMxMjUgNS4yMzQzNzUgQyA3LjA2MjUgNS4zMDA3ODEgNi41NTA3ODEgNS4zMDA3ODEgNi4zMTI1IDUuMjM0Mzc1IEMgNS40NzY1NjIgNSA0Ljk2ODc1IDQuMjkyOTY5IDUuMDE5NTMxIDMuNDI1NzgxIEMgNS4wNTg1OTQgMi43Njk1MzEgNS40MjE4NzUgMi4yNjE3MTkgNi4wNTA3ODEgMS45ODA0NjkgQyA2LjM1NTQ2OSAxLjg0NzY1NiA2LjU2MjUgMS44MDQ2ODggNi44OTg0MzggMS44MTI1IEMgNy4xMDkzNzUgMS44MjAzMTIgNy4xNzU3ODEgMS44MzIwMzEgNy4zNTE1NjIgMS44ODY3MTkgWiBNIDcuMzUxNTYyIDEuODg2NzE5ICIvPgo8cGF0aCBzdHlsZT0iIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6cmdiKDAlLDAlLDAlKTtmaWxsLW9wYWNpdHk6MTsiIGQ9Ik0gNi41NDY4NzUgMi4xOTkyMTkgQyA1LjkyNTc4MSAyLjI4MTI1IDUuNDAyMzQ0IDIuODg2NzE5IDUuMzk4NDM4IDMuNTIzNDM4IEMgNS4zOTg0MzggMy42OTE0MDYgNS40MzM1OTQgMy43Njk1MzEgNS41NjI1IDMuODc4OTA2IEMgNS42NTIzNDQgMy45NTcwMzEgNS44MTY0MDYgNC4wMjczNDQgNS45MTAxNTYgNC4wMjczNDQgQyA1Ljk5MjE4OCA0LjAyNzM0NCA2LjExNzE4OCAzLjk2ODc1IDYuMTk1MzEyIDMuODk0NTMxIEMgNi4yNjE3MTkgMy44MzIwMzEgNi4yODkwNjIgMy43NzczNDQgNi4zMzU5MzggMy42MzI4MTIgQyA2LjQ0OTIxOSAzLjI2NTYyNSA2LjUyNzM0NCAzLjE5MTQwNiA2LjkxMDE1NiAzLjA4OTg0NCBDIDcuMDk3NjU2IDMuMDM5MDYyIDcuMTYwMTU2IDIuOTkyMTg4IDcuMjMwNDY5IDIuODU5Mzc1IEMgNy4yOTI5NjkgMi43MzQzNzUgNy4zMDQ2ODggMi41NTQ2ODggNy4yNTM5MDYgMi40NDE0MDYgQyA3LjIxODc1IDIuMzU5Mzc1IDcuMTI1IDIuMjczNDM4IDcuMDI3MzQ0IDIuMjM0Mzc1IEMgNi45Mjk2ODggMi4xOTUzMTIgNi43MDMxMjUgMi4xNzk2ODggNi41NDY4NzUgMi4xOTkyMTkgWiBNIDYuNTQ2ODc1IDIuMTk5MjE5ICIvPgo8cGF0aCBzdHlsZT0iIHN0cm9rZTpub25lO2ZpbGwtcnVsZTpub256ZXJvO2ZpbGw6cmdiKDAlLDAlLDAlKTtmaWxsLW9wYWNpdHk6MTsiIGQ9Ik0gMy4wNzQyMTkgNS45MjU3ODEgQyAyLjc4OTA2MiA1Ljk4NDM3NSAyLjQ5NjA5NCA2LjE1MjM0NCAyLjI2OTUzMSA2LjM4NjcxOSBDIDIuMDM1MTU2IDYuNjMyODEyIDEuOTEwMTU2IDYuODc4OTA2IDEuODYzMjgxIDcuMjE4NzUgQyAxLjgzNTkzOCA3LjQxNDA2MiAxLjg0NzY1NiA3LjU1ODU5NCAxLjkxMDE1NiA3Ljc4MTI1IEMgMi4wMTk1MzEgOC4xODc1IDIuMzIwMzEyIDguNTQyOTY5IDIuNjk5MjE5IDguNzIyNjU2IEMgMi45Njg3NSA4Ljg1MTU2MiAzLjE3MTg3NSA4Ljg5MDYyNSAzLjQ2ODc1IDguODc4OTA2IEMgMy44NzUgOC44NjMyODEgNC4yMjI2NTYgOC43MDMxMjUgNC41MDc4MTIgOC40MDIzNDQgQyA0LjY2Nzk2OSA4LjIzNDM3NSA0LjgyNDIxOSA3Ljk1NzAzMSA0Ljg3ODkwNiA3LjczMDQ2OSBDIDQuOTQ5MjE5IDcuNDM3NSA0LjkxNDA2MiA3LjA2NjQwNiA0Ljc5Mjk2OSA2LjgwMDc4MSBDIDQuNzIyNjU2IDYuNjQ4NDM4IDQuNTY2NDA2IDYuNDIxODc1IDQuNDQ5MjE5IDYuMzA0Njg4IEMgNC4xNTIzNDQgNi4wMDM5MDYgMy41MjM0MzggNS44MjgxMjUgMy4wNzQyMTkgNS45MjU3ODEgWiBNIDMuNTQyOTY5IDYuODgyODEyIEMgMy44MDQ2ODggNi45ODQzNzUgMy45NDkyMTkgNy4xNjAxNTYgMy45NTMxMjUgNy4zODY3MTkgQyAzLjk1MzEyNSA3LjYyNSAzLjgwODU5NCA3LjgyNDIxOSAzLjU3ODEyNSA3Ljg5ODQzOCBDIDMuMTEzMjgxIDguMDQ2ODc1IDIuNjcxODc1IDcuNTkzNzUgMi44ODI4MTIgNy4xODM1OTQgQyAyLjk2ODc1IDcuMDE5NTMxIDMuMjIyNjU2IDYuODI4MTI1IDMuMzU5Mzc1IDYuODI4MTI1IEMgMy4zODY3MTkgNi44MjgxMjUgMy40Njg3NSA2Ljg1MTU2MiAzLjU0Mjk2OSA2Ljg4MjgxMiBaIE0gMy41NDI5NjkgNi44ODI4MTIgIi8+CjxwYXRoIHN0eWxlPSIgc3Ryb2tlOm5vbmU7ZmlsbC1ydWxlOm5vbnplcm87ZmlsbDpyZ2IoMCUsMCUsMCUpO2ZpbGwtb3BhY2l0eToxOyIgZD0iTSA5Ljc2OTUzMSA2LjY3MTg3NSBDIDguOTUzMTI1IDYuNzczNDM4IDguMjE4NzUgNy4wNzQyMTkgNy41NzQyMTkgNy41NzAzMTIgQyA3LjE2NDA2MiA3Ljg5MDYyNSA2Ljg5ODQzOCA4LjE2MDE1NiA2LjQ0MTQwNiA4LjczODI4MSBDIDUuNzc3MzQ0IDkuNTcwMzEyIDUuNDQ5MjE5IDkuODQ3NjU2IDQuNTU0Njg4IDEwLjMxNjQwNiBDIDMuNjIxMDk0IDEwLjgwNDY4OCAyLjk3NjU2MiAxMS4yMDMxMjUgMi40NDUzMTIgMTEuNjIxMDk0IEMgMi4wMjczNDQgMTEuOTUzMTI1IDEuOTAyMzQ0IDEyLjEwOTM3NSAxLjYyMTA5NCAxMi42NjAxNTYgTCAxLjQzMzU5NCAxMy4wMTU2MjUgTCAxLjQ0MTQwNiAxNS4yNDIxODggQyAxLjQ0OTIxOSAxNi44MDQ2ODggMS40NjA5MzggMTcuNTAzOTA2IDEuNDc2NTYyIDE3LjU4OTg0NCBDIDEuNjM2NzE5IDE4LjM4NjcxOSAyLjQ1MzEyNSAxOS4zNjMyODEgMy40MTc5NjkgMTkuOTE0MDYyIEMgNC4yMzgyODEgMjAuMzgyODEyIDUuNDg0Mzc1IDIwLjgzMjAzMSA2LjUwMzkwNiAyMS4wMzEyNSBDIDcuNDg0Mzc1IDIxLjIyMjY1NiA4LjkyMTg3NSAyMS4yMTQ4NDQgOS42NTIzNDQgMjEuMDE1NjI1IEMgMTAuNjY0MDYyIDIwLjczNDM3NSAxMS4zNTkzNzUgMjAuMTYwMTU2IDEyLjA4NTkzOCAxOSBDIDEyLjU3MDMxMiAxOC4yMzA0NjkgMTIuOTg4MjgxIDE3Ljc0NjA5NCAxMy41MTE3MTkgMTcuMzcxMDk0IEMgMTMuNjE3MTg4IDE3LjI5Mjk2OSAxMy45NjQ4NDQgMTcuMDc4MTI1IDE0LjI4MTI1IDE2Ljg5NDUzMSBDIDE0Ljk4ODI4MSAxNi40ODA0NjkgMTUuMjU3ODEyIDE2LjMxMjUgMTUuNDg4MjgxIDE2LjEyMTA5NCBDIDE1LjkwMjM0NCAxNS43ODEyNSAxNi4yNjk1MzEgMTUuMjI2NTYyIDE2LjQ1MzEyNSAxNC42Njc5NjkgQyAxNi41NTg1OTQgMTQuMzQ3NjU2IDE2LjU3MDMxMiAxNC4wNzgxMjUgMTYuNTU4NTk0IDEyLjA4OTg0NCBDIDE2LjU0Njg3NSAxMC4zMDg1OTQgMTYuNTM1MTU2IDEwLjA1NDY4OCAxNi40NTMxMjUgOS44MDA3ODEgQyAxNi4zMTI1IDkuMzQ3NjU2IDE1Ljk3NjU2MiA4Ljg2NzE4OCAxNS41MTk1MzEgOC40NjA5MzggQyAxNC41ODk4NDQgNy42MzY3MTkgMTIuOTAyMzQ0IDYuOTMzNTk0IDExLjMxMjUgNi43MDMxMjUgQyAxMC45MzM1OTQgNi42NDQ1MzEgMTAuMDk3NjU2IDYuNjMyODEyIDkuNzY5NTMxIDYuNjcxODc1IFogTSAxMC42MzY3MTkgNy41OTc2NTYgQyAxMS4zMDg1OTQgNy42MzI4MTIgMTEuODA0Njg4IDcuNzI2NTYyIDEyLjUwMzkwNiA3Ljk0OTIxOSBDIDEzLjUzMTI1IDguMjczNDM4IDE0LjQzMzU5NCA4Ljc1MzkwNiAxNC45NjQ4NDQgOS4yNTM5MDYgQyAxNS4yNzM0MzggOS41NDY4NzUgMTUuNDIxODc1IDkuNzc3MzQ0IDE1LjUxNTYyNSAxMC4xMTcxODggQyAxNS41ODIwMzEgMTAuMzUxNTYyIDE1LjU4MjAzMSAxMC44MTI1IDE1LjUxOTUzMSAxMS4wNDY4NzUgQyAxNS4zODI4MTIgMTEuNTI3MzQ0IDE1LjE0NDUzMSAxMS44NDc2NTYgMTQuNjQwNjI1IDEyLjIxODc1IEMgMTQuNDUzMTI1IDEyLjM1OTM3NSAxNC4zMjgxMjUgMTIuNDM3NSAxMy44ODY3MTkgMTIuNjc5Njg4IEMgMTIuNjU2MjUgMTMuMzU5Mzc1IDEyLjAyNzM0NCAxMy45MzM1OTQgMTEuMzc4OTA2IDE0Ljk2NDg0NCBDIDEwLjk2NDg0NCAxNS42MTcxODggMTAuNjI4OTA2IDE2LjAzOTA2MiAxMC4zMTY0MDYgMTYuMjkyOTY5IEMgOS45MTQwNjIgMTYuNjIxMDk0IDkuNjQ0NTMxIDE2LjczNDM3NSA5LjAzOTA2MiAxNi44MjQyMTkgQyA4Ljc0MjE4OCAxNi44NjcxODggNy42OTUzMTIgMTYuODg2NzE5IDcuMzMyMDMxIDE2Ljg1NTQ2OSBDIDYuMDgyMDMxIDE2Ljc0NjA5NCA0LjUxMTcxOSAxNi4xODc1IDMuNTIzNDM4IDE1LjUwNzgxMiBDIDMuMjkyOTY5IDE1LjM0NzY1NiAyLjk0MTQwNiAxNS4wMDc4MTIgMi44MDg1OTQgMTQuODEyNSBDIDIuNjY0MDYyIDE0LjYwNTQ2OSAyLjU0Njg3NSAxNC4zNjMyODEgMi40NzI2NTYgMTQuMTI1IEMgMi40MTc5NjkgMTMuOTU3MDMxIDIuNDE0MDYyIDEzLjkwNjI1IDIuNDE0MDYyIDEzLjYyNSBDIDIuNDE0MDYyIDEzLjM0Mzc1IDIuNDE3OTY5IDEzLjMwMDc4MSAyLjQ3MjY1NiAxMy4xNDQ1MzEgQyAyLjU3MDMxMiAxMi44NTE1NjIgMi43OTI5NjkgMTIuNTcwMzEyIDMuMTQ4NDM4IDEyLjI4NTE1NiBDIDMuNTYyNSAxMS45NTMxMjUgMy45Mjk2ODggMTEuNzI2NTYyIDQuODQzNzUgMTEuMjQ2MDk0IEMgNi4wOTc2NTYgMTAuNTc4MTI1IDYuNDEwMTU2IDEwLjMyODEyNSA3LjA5NzY1NiA5LjQ2NDg0NCBDIDcuNTg1OTM4IDguODQzNzUgNy45MDYyNSA4LjUxOTUzMSA4LjI4OTA2MiA4LjIzODI4MSBDIDguODA4NTk0IDcuODYzMjgxIDkuNDc2NTYyIDcuNjI1IDEwLjExMzI4MSA3LjU4OTg0NCBDIDEwLjE3OTY4OCA3LjU4NTkzOCAxMC4yNDIxODggNy41ODIwMzEgMTAuMjUzOTA2IDcuNTc4MTI1IEMgMTAuMjY1NjI1IDcuNTc4MTI1IDEwLjQzNzUgNy41ODU5MzggMTAuNjM2NzE5IDcuNTk3NjU2IFogTSAxNS42MDkzNzUgMTMuMzIwMzEyIEMgMTUuNjA5Mzc1IDEzLjczODI4MSAxNS42MDE1NjIgMTMuOTAyMzQ0IDE1LjU3MDMxMiAxNC4wODIwMzEgQyAxNS40NTcwMzEgMTQuNzUzOTA2IDE1LjE4NzUgMTUuMTc5Njg4IDE0LjYzNjcxOSAxNS41NjY0MDYgQyAxNC40MzM1OTQgMTUuNzEwOTM4IDE0LjM1MTU2MiAxNS43NjE3MTkgMTMuODc1IDE2LjAyMzQzOCBDIDEyLjcwMzEyNSAxNi42Njc5NjkgMTIuMDc4MTI1IDE3LjIyMjY1NiAxMS40NjA5MzggMTguMTcxODc1IEMgMTAuOTMzNTk0IDE4Ljk4MDQ2OSAxMC43MzgyODEgMTkuMjM0Mzc1IDEwLjQyMTg3NSAxOS41MzEyNSBDIDkuODc4OTA2IDIwLjAzNTE1NiA5LjQxMDE1NiAyMC4xODM1OTQgOC4yMzQzNzUgMjAuMjA3MDMxIEMgNy42NDQ1MzEgMjAuMjIyNjU2IDcuMjU3ODEyIDIwLjE5OTIxOSA2LjgxMjUgMjAuMTIxMDk0IEMgNS41NzgxMjUgMTkuODk4NDM4IDQuMzIwMzEyIDE5LjM5ODQzOCAzLjQ5NjA5NCAxOC44MDA3ODEgQyAyLjg2NzE4OCAxOC4zNDM3NSAyLjUwNzgxMiAxNy44MTI1IDIuNDIxODc1IDE3LjIyNjU2MiBDIDIuMzcxMDk0IDE2Ljg3NSAyLjMzOTg0NCAxNS45MzM1OTQgMi4zNzUgMTUuODgyODEyIEMgMi4zOTA2MjUgMTUuODU5Mzc1IDIuNDY0ODQ0IDE1LjkxMDE1NiAyLjY3OTY4OCAxNi4wNzgxMjUgQyAyLjgzOTg0NCAxNi4xOTkyMTkgMy4wNTg1OTQgMTYuMzU1NDY5IDMuMTcxODc1IDE2LjQyOTY4OCBDIDMuOTI5Njg4IDE2LjkxMDE1NiA1LjE1MjM0NCAxNy4zOTg0MzggNi4yNDYwOTQgMTcuNjUyMzQ0IEMgNi45MTAxNTYgMTcuODA4NTk0IDcuMjY5NTMxIDE3LjgzOTg0NCA4LjIxODc1IDE3LjgyMDMxMiBDIDkuMjgxMjUgMTcuODA0Njg4IDkuNzE4NzUgMTcuNzIyNjU2IDEwLjMzOTg0NCAxNy40MzM1OTQgQyAxMC42MjEwOTQgMTcuMzAwNzgxIDEwLjg1OTM3NSAxNy4xMjEwOTQgMTEuMTc1NzgxIDE2LjgwODU5NCBDIDExLjU0Njg3NSAxNi40Mzc1IDExLjc5Njg3NSAxNi4xMTcxODggMTIuMTQ4NDM4IDE1LjU1NDY4OCBDIDEyLjQzNzUgMTUuMDk3NjU2IDEyLjY0NDUzMSAxNC44MzIwMzEgMTIuOTYwOTM4IDE0LjUxOTUzMSBDIDEzLjMyMDMxMiAxNC4xNjAxNTYgMTMuNjY3OTY5IDEzLjkxMDE1NiAxNC4yNjk1MzEgMTMuNTYyNSBDIDE0Ljg0NzY1NiAxMy4yMzA0NjkgMTUuMTMyODEyIDEzLjA1ODU5NCAxNS4zNTU0NjkgMTIuODk4NDM4IEMgMTUuNSAxMi43OTI5NjkgMTUuNTc0MjE5IDEyLjc1IDE1LjU4OTg0NCAxMi43NjU2MjUgQyAxNS42MDE1NjIgMTIuNzc3MzQ0IDE1LjYwOTM3NSAxMi45ODQzNzUgMTUuNjA5Mzc1IDEzLjMyMDMxMiBaIE0gMTUuNjA5Mzc1IDEzLjMyMDMxMiAiLz4KPC9nPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {
        "group": "connection"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "soap-message"
      },
      {
        "group": "timeout"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.inbound.RabbitMQ.MessageStart.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "routing",
          "label": "Routing"
        },
        {
          "id": "subscription",
          "label": "Subscription"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='-7.5 0 271 271' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M245.44 108.308h-85.09a7.738 7.738 0 0 1-7.735-7.734v-88.68C152.615 5.327 147.29 0 140.726 0h-30.375c-6.568 0-11.89 5.327-11.89 11.894v88.143c0 4.573-3.697 8.29-8.27 8.31l-27.885.133c-4.612.025-8.359-3.717-8.35-8.325l.173-88.241C54.144 5.337 48.817 0 42.24 0H11.89C5.321 0 0 5.327 0 11.894V260.21c0 5.834 4.726 10.56 10.555 10.56H245.44c5.834 0 10.56-4.726 10.56-10.56V118.868c0-5.834-4.726-10.56-10.56-10.56zm-39.902 93.233c0 7.645-6.198 13.844-13.843 13.844H167.69c-7.646 0-13.844-6.199-13.844-13.844v-24.005c0-7.646 6.198-13.844 13.844-13.844h24.005c7.645 0 13.843 6.198 13.843 13.844v24.005z' fill='%23F60'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.RabbitMQ.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "routing",
          "label": "Routing"
        },
        {
          "id": "message",
          "label": "Message"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='-7.5 0 271 271' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M245.44 108.308h-85.09a7.738 7.738 0 0 1-7.735-7.734v-88.68C152.615 5.327 147.29 0 140.726 0h-30.375c-6.568 0-11.89 5.327-11.89 11.894v88.143c0 4.573-3.697 8.29-8.27 8.31l-27.885.133c-4.612.025-8.359-3.717-8.35-8.325l.173-88.241C54.144 5.337 48.817 0 42.24 0H11.89C5.321 0 0 5.327 0 11.894V260.21c0 5.834 4.726 10.56 10.555 10.56H245.44c5.834 0 10.56-4.726 10.56-10.56V118.868c0-5.834-4.726-10.56-10.56-10.56zm-39.902 93.233c0 7.645-6.198 13.844-13.843 13.844H167.69c-7.646 0-13.844-6.199-13.844-13.844v-24.005c0-7.646 6.198-13.844 13.844-13.844h24.005c7.645 0 13.843 6.198 13.843 13.844v24.005z' fill='%23F60'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "routing"
      },
      {
        "group": "message"
      },
      {
        "group": "message"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.webhook.WebhookConnectorIntermediate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg id='icon' xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 32 32'%3E%3Cdefs%3E%3Cstyle%3E .cls-1 %7B fill: none; %7D %3C/style%3E%3C/defs%3E%3Cpath d='M24,26a3,3,0,1,0-2.8164-4H13v1a5,5,0,1,1-5-5V16a7,7,0,1,0,6.9287,8h6.2549A2.9914,2.9914,0,0,0,24,26Z'/%3E%3Cpath d='M24,16a7.024,7.024,0,0,0-2.57.4873l-3.1656-5.5395a3.0469,3.0469,0,1,0-1.7326.9985l4.1189,7.2085.8686-.4976a5.0006,5.0006,0,1,1-1.851,6.8418L17.937,26.501A7.0005,7.0005,0,1,0,24,16Z'/%3E%3Cpath d='M8.532,20.0537a3.03,3.03,0,1,0,1.7326.9985C11.74,18.47,13.86,14.7607,13.89,14.708l.4976-.8682-.8677-.497a5,5,0,1,1,6.812-1.8438l1.7315,1.002a7.0008,7.0008,0,1,0-10.3462,2.0356c-.457.7427-1.1021,1.8716-2.0737,3.5728Z'/%3E%3Crect id='_Transparent_Rectangle_' data-name='&lt;Transparent Rectangle&gt;' class='cls-1' width='32' height='32'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.email.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "protocol",
          "label": "Protocol"
        },
        {
          "id": "smtpAction",
          "label": "SMTP Action"
        },
        {
          "id": "pop3Action",
          "label": "POP3 Action"
        },
        {
          "id": "imapAction",
          "label": "IMAP Action"
        },
        {
          "id": "sendEmailSmtp",
          "label": "Send Email"
        },
        {
          "id": "listEmailsPop3",
          "label": "List Emails"
        },
        {
          "id": "searchEmailsPop3",
          "label": "Search Emails"
        },
        {
          "id": "deleteEmailPop3",
          "label": "Delete Email"
        },
        {
          "id": "readEmailPop3",
          "label": "Read Email"
        },
        {
          "id": "listEmailsImap",
          "label": "List Email"
        },
        {
          "id": "searchEmailsImap",
          "label": "Search Emails"
        },
        {
          "id": "readEmailImap",
          "label": "Read Email"
        },
        {
          "id": "deleteEmailImap",
          "label": "Read Email"
        },
        {
          "id": "moveEmailImap",
          "label": "Move Emails"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzkwXzI0MjApIj4KPHBhdGggZD0iTTguMzM4MzUgOS45NTM2NUwxMC4zODk0IDEyLjAxMDRMOC4zMzI2MiAxNC4wNjcyTDkuMTQ2MTYgMTQuODc1TDEyLjAxMDcgMTIuMDEwNEw5LjE0NjE2IDkuMTQ1ODNMOC4zMzgzNSA5Ljk1MzY1WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEyLjM0ODggOS45NTM2NUwxNC4zOTk4IDEyLjAxMDRMMTIuMzQzIDE0LjA2NzJMMTMuMTU2NiAxNC44NzVMMTYuMDIxMiAxMi4wMTA0TDEzLjE1NjYgOS4xNDU4M0wxMi4zNDg4IDkuOTUzNjVaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMy45NzIgMTEuNDM3NUgxLjEyNTMzVjIuNzkyMTlMNy42NzM3NiA3LjMyMzk2QzcuNzY5NjcgNy4zOTA0OSA3Ljg4MzYgNy40MjYxNCA4LjAwMDMyIDcuNDI2MTRDOC4xMTcwNSA3LjQyNjE0IDguMjMwOTggNy4zOTA0OSA4LjMyNjg5IDcuMzIzOTZMMTQuODc1MyAyLjc5MjE5VjhIMTYuMDIxMlYyLjI3MDgzQzE2LjAyMTIgMS45NjY5NCAxNS45MDA0IDEuNjc1NDkgMTUuNjg1NiAxLjQ2MDYxQzE1LjQ3MDcgMS4yNDU3MiAxNS4xNzkyIDEuMTI1IDE0Ljg3NTMgMS4xMjVIMS4xMjUzM0MwLjgyMTQzMiAxLjEyNSAwLjUyOTk4NCAxLjI0NTcyIDAuMzE1MDk5IDEuNDYwNjFDMC4xMDAyMTQgMS42NzU0OSAtMC4wMjA1MDc4IDEuOTY2OTQgLTAuMDIwNTA3OCAyLjI3MDgzVjExLjQzNzVDLTAuMDIwNTA3OCAxMS43NDE0IDAuMTAwMjE0IDEyLjAzMjggMC4zMTUwOTkgMTIuMjQ3N0MwLjUyOTk4NCAxMi40NjI2IDAuODIxNDMyIDEyLjU4MzMgMS4xMjUzMyAxMi41ODMzSDMuOTcyVjExLjQzNzVaTTEzLjYxNDkgMi4yNzA4M0w4LjAwMDMyIDYuMTU1MjFMMi4zODU3NCAyLjI3MDgzSDEzLjYxNDlaIiBmaWxsPSIjRkM1RDBEIi8+CjxwYXRoIGQ9Ik00LjI4MjEgOS45NTM2NUw2LjMzMzE0IDEyLjAxMDRMNC4yNzYzNyAxNC4wNjcyTDUuMDg5OTEgMTQuODc1TDcuOTU0NDkgMTIuMDEwNEw1LjA4OTkxIDkuMTQ1ODNMNC4yODIxIDkuOTUzNjVaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzkwXzI0MjAiPgo8cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication",
        "tooltip": "Enter your full email address (e.g., user@example.com) or the username provided by your email service. This is used to authenticate your access to the mail server."
      },
      {
        "group": "authentication",
        "tooltip": "Enter the password associated with your email account. Keep your password secure and do not share it with others."
      },
      {
        "group": "protocol"
      },
      {
        "group": "protocol",
        "tooltip": "Enter the address of the IMAP server used to retrieve your emails. This server allows you to sync your messages across multiple devices. (e.g., imap.example.com)"
      },
      {
        "group": "protocol",
        "tooltip": "Enter the port number for connecting to the IMAP server. Common ports are 993 for secure connections using SSL/TLS, or 143 for non-secure connections."
      },
      {
        "group": "protocol",
        "tooltip": "Select the encryption protocol for email security."
      },
      {
        "group": "protocol",
        "tooltip": "Enter the address of the POP3 server if you want to download your emails to a single device. This server is typically used for retrieving emails without syncing. (e.g., pop.example.com)"
      },
      {
        "group": "protocol",
        "tooltip": "Enter the port number for connecting to the POP3 server. The standard port is 995 for secure connections with SSL/TLS, or 110 for non-secure connections."
      },
      {
        "group": "protocol",
        "tooltip": "Select the encryption protocol for email security."
      },
      {
        "group": "protocol",
        "tooltip": "Provide the address of the SMTP server used for sending emails. This server handles the delivery of your outgoing messages. (e.g., smtp.example.com)"
      },
      {
        "group": "protocol",
        "tooltip": "Enter the port number for connecting to the SMTP server. Typically, port 587 is used for secure connections with STARTTLS, port 465 for secure connections using SSL/TLS, and port 25 for non-secure connections."
      },
      {
        "group": "protocol",
        "tooltip": "Select the encryption protocol for email security."
      },
      {
        "group": "smtpAction"
      },
      {
        "group": "pop3Action"
      },
      {
        "group": "imapAction"
      },
      {
        "group": "sendEmailSmtp",
        "tooltip": "Address the email will be sent from"
      },
      {
        "group": "sendEmailSmtp",
        "tooltip": "Comma-separated list of email, e.g., 'email1@domain.com,email2@domain.com' or '=[ \"email1@domain.com\", \"email2@domain.com\"]'"
      },
      {
        "group": "sendEmailSmtp",
        "tooltip": "Comma-separated list of email, e.g., 'email1@domain.com,email2@domain.com' or '=[ \"email1@domain.com\", \"email2@domain.com\"]'"
      },
      {
        "group": "sendEmailSmtp",
        "tooltip": "Comma-separated list of email, e.g., 'email1@domain.com,email2@domain.com' or '=[ \"email1@domain.com\", \"email2@domain.com\"]'"
      },
      {
        "group": "sendEmailSmtp",
        "tooltip": "Email's subject"
      },
      {
        "group": "sendEmailSmtp",
        "tooltip": "Email's content"
      },
      {
        "group": "listEmailsPop3",
        "tooltip": "Enter the maximum number of emails to be read from the specified folder. This limits the number of emails fetched to avoid performance issues with large mailboxes. The default value is set to 100."
      },
      {
        "group": "listEmailsPop3",
        "tooltip": "Choose the criterion by which the listed emails should be sorted. The default sorting is by 'Sent Date'."
      },
      {
        "group": "listEmailsPop3",
        "tooltip": "Select the sort order for the emails. Choose 'ASC' for ascending order or 'DESC' for descending order. Ascending order will list older emails first, while descending order will list newer emails first. The default sort order is 'ASC'."
      },
      {
        "group": "searchEmailsPop3",
        "tooltip": "Define the search criteria using supported keywords and syntax to filter emails."
      },
      {
        "group": "deleteEmailPop3",
        "tooltip": "The ID of the message, typically returned by a previous email task."
      },
      {
        "group": "readEmailPop3",
        "tooltip": "The ID of the message, typically returned by a previous email task. Warning: reading an email using POP3 will delete it"
      },
      {
        "group": "listEmailsImap",
        "tooltip": "Enter the maximum number of emails to be read from the specified folder. This limits the number of emails fetched to avoid performance issues with large mailboxes. The default value is set to 100."
      },
      {
        "group": "listEmailsImap",
        "tooltip": "Specify the folder from which you want to list emails (e.g., 'INBOX', 'Sent', 'Drafts'). If left blank, emails will be listed from the default 'INBOX' folder."
      },
      {
        "group": "listEmailsImap",
        "tooltip": "Choose the criterion by which the listed emails should be sorted. The default sorting is by 'Received Date'."
      },
      {
        "group": "listEmailsImap",
        "tooltip": "Select the sort order for the emails. Choose 'ASC' for ascending order or 'DESC' for descending order. Ascending order will list older emails first, while descending order will list newer emails first. The default sort order is 'ASC'."
      },
      {
        "group": "searchEmailsImap",
        "tooltip": "Define the search criteria using supported keywords and syntax to filter emails."
      },
      {
        "group": "searchEmailsImap",
        "tooltip": "Specify the folder in which to conduct the email search. If left blank, the search will default to the 'INBOX' folder. You may also specify subfolders using a dot-separated path (e.g., 'INBOX.Archives')."
      },
      {
        "group": "readEmailImap",
        "tooltip": "The ID of the message, typically returned by a previous email task."
      },
      {
        "group": "readEmailImap",
        "tooltip": "Enter the name of the folder from which you wish to read emails. If left blank, emails will be read from the default 'INBOX' folder."
      },
      {
        "group": "deleteEmailImap",
        "tooltip": "The ID of the message, typically returned by a previous email task."
      },
      {
        "group": "deleteEmailImap",
        "tooltip": "Specify the name of the folder from which you want to delete emails. If left blank, the default 'INBOX' will be used. For example, you can enter 'Trash' to delete emails from the Trash folder."
      },
      {
        "group": "moveEmailImap",
        "tooltip": "The ID of the message, typically returned by a previous email task."
      },
      {
        "group": "moveEmailImap",
        "tooltip": "Enter the name of the folder from which the emails will be moved. This field is required. For example, enter 'INBOX' to move emails from your Inbox."
      },
      {
        "group": "moveEmailImap",
        "tooltip": "Specify the destination folder to which the emails will be moved. To create a new folder or a hierarchy of folders, use a dot-separated path (e.g., 'Archive' or 'Projects.2023.January'). If any part of the path does not exist, it will be created automatically."
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.inbound.AWSSNS.StartEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "subscription",
          "label": "Subscription configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 80 80' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/64/Arch_AWS-Simple-Notification-Service_64%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/64/Arch_AWS-Simple-Notification-Service_64' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/64/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='80' height='80'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M17,38 C18.103,38 19,38.897 19,40 C19,41.103 18.103,42 17,42 C15.897,42 15,41.103 15,40 C15,38.897 15.897,38 17,38 L17,38 Z M41,64 C29.314,64 19.289,55.466 17.194,43.98 C18.965,43.894 20.427,42.659 20.857,41 L27,41 L27,39 L20.857,39 C20.427,37.342 18.966,36.107 17.195,36.02 C19.285,24.71 29.511,16 41,16 C45.313,16 49.832,17.622 54.429,20.821 L55.571,19.179 C50.633,15.743 45.73,14 41,14 C28.27,14 16.949,23.865 15.063,36.521 C13.839,37.207 13,38.5 13,40 C13,41.5 13.839,42.793 15.063,43.478 C16.97,56.341 28.056,66 41,66 C46.407,66 51.942,64.157 56.585,60.811 L55.415,59.189 C51.11,62.292 45.991,64 41,64 L41,64 Z M30.101,36.442 C31.955,36.895 34.275,37 36,37 C37.642,37 39.823,36.905 41.629,36.506 L37.105,45.553 C37.036,45.691 37,45.845 37,46 L37,50.453 C36.199,50.964 34.833,51.812 34,51.986 L34,46 C34,45.868 33.974,45.737 33.923,45.615 L30.101,36.442 Z M36,33 C40.025,33 42.174,33.604 42.841,34 C42.174,34.396 40.025,35 36,35 C31.975,35 29.826,34.396 29.159,34 C29.826,33.604 31.975,33 36,33 L36,33 Z M33,54 L34,54 C34.043,54 34.086,53.997 34.128,53.992 C35.352,53.833 36.909,52.887 38.272,52.013 L38.535,51.845 C38.824,51.661 39,51.342 39,51 L39,46.236 L44.559,35.12 C44.833,34.801 45,34.434 45,34 C45,31.39 39.361,31 36,31 C32.639,31 27,31.39 27,34 C27,34.366 27.12,34.684 27.32,34.967 L32,46.2 L32,53 C32,53.552 32.447,54 33,54 L33,54 Z M62,53 C63.103,53 64,53.897 64,55 C64,56.103 63.103,57 62,57 C60.897,57 60,56.103 60,55 C60,53.897 60.897,53 62,53 L62,53 Z M62,23 C63.103,23 64,23.897 64,25 C64,26.103 63.103,27 62,27 C60.897,27 60,26.103 60,25 C60,23.897 60.897,23 62,23 L62,23 Z M64,38 C65.103,38 66,38.897 66,40 C66,41.103 65.103,42 64,42 C62.897,42 62,41.103 62,40 C62,38.897 62.897,38 64,38 L64,38 Z M54,41 L60.143,41 C60.589,42.72 62.142,44 64,44 C66.206,44 68,42.206 68,40 C68,37.794 66.206,36 64,36 C62.142,36 60.589,37.28 60.143,39 L54,39 L54,26 L58.143,26 C58.589,27.72 60.142,29 62,29 C64.206,29 66,27.206 66,25 C66,22.794 64.206,21 62,21 C60.142,21 58.589,22.28 58.143,24 L53,24 C52.447,24 52,24.448 52,25 L52,39 L45,39 L45,41 L52,41 L52,55 C52,55.552 52.447,56 53,56 L58.143,56 C58.589,57.72 60.142,59 62,59 C64.206,59 66,57.206 66,55 C66,52.794 64.206,51 62,51 C60.142,51 58.589,52.28 58.143,54 L54,54 L54,41 Z' id='AWS-Simple-Notification-Service_Icon_64_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.KafkaMessageStart.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "kafka",
          "label": "Kafka"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='18' height='18' viewBox='0 0 256 416' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMid'%3E%3Cpath d='M201.816 230.216c-16.186 0-30.697 7.171-40.634 18.461l-25.463-18.026c2.703-7.442 4.255-15.433 4.255-23.797 0-8.219-1.498-16.076-4.112-23.408l25.406-17.835c9.936 11.233 24.409 18.365 40.548 18.365 29.875 0 54.184-24.305 54.184-54.184 0-29.879-24.309-54.184-54.184-54.184-29.875 0-54.184 24.305-54.184 54.184 0 5.348.808 10.505 2.258 15.389l-25.423 17.844c-10.62-13.175-25.911-22.374-43.333-25.182v-30.64c24.544-5.155 43.037-26.962 43.037-53.019C124.171 24.305 99.862 0 69.987 0 40.112 0 15.803 24.305 15.803 54.184c0 25.708 18.014 47.246 42.067 52.769v31.038C25.044 143.753 0 172.401 0 206.854c0 34.621 25.292 63.374 58.355 68.94v32.774c-24.299 5.341-42.552 27.011-42.552 52.894 0 29.879 24.309 54.184 54.184 54.184 29.875 0 54.184-24.305 54.184-54.184 0-25.883-18.253-47.553-42.552-52.894v-32.775a69.965 69.965 0 0 0 42.6-24.776l25.633 18.143c-1.423 4.84-2.22 9.946-2.22 15.24 0 29.879 24.309 54.184 54.184 54.184 29.875 0 54.184-24.305 54.184-54.184 0-29.879-24.309-54.184-54.184-54.184zm0-126.695c14.487 0 26.27 11.788 26.27 26.271s-11.783 26.27-26.27 26.27-26.27-11.787-26.27-26.27c0-14.483 11.783-26.271 26.27-26.271zm-158.1-49.337c0-14.483 11.784-26.27 26.271-26.27s26.27 11.787 26.27 26.27c0 14.483-11.783 26.27-26.27 26.27s-26.271-11.787-26.271-26.27zm52.541 307.278c0 14.483-11.783 26.27-26.27 26.27s-26.271-11.787-26.271-26.27c0-14.483 11.784-26.27 26.271-26.27s26.27 11.787 26.27 26.27zm-26.272-117.97c-20.205 0-36.642-16.434-36.642-36.638 0-20.205 16.437-36.642 36.642-36.642 20.204 0 36.641 16.437 36.641 36.642 0 20.204-16.437 36.638-36.641 36.638zm131.831 67.179c-14.487 0-26.27-11.788-26.27-26.271s11.783-26.27 26.27-26.27 26.27 11.787 26.27 26.27c0 14.483-11.783 26.271-26.27 26.271z' style='fill:%23231f20'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "kafka"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.EmailMessageStart.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "protocol",
          "label": "Imap Details"
        },
        {
          "id": "listenerInfos",
          "label": "Listener information"
        },
        {
          "id": "unseenPollingConfig",
          "label": "After process"
        },
        {
          "id": "allPollingConfig",
          "label": "After process"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzkwXzI0MjApIj4KPHBhdGggZD0iTTguMzM4MzUgOS45NTM2NUwxMC4zODk0IDEyLjAxMDRMOC4zMzI2MiAxNC4wNjcyTDkuMTQ2MTYgMTQuODc1TDEyLjAxMDcgMTIuMDEwNEw5LjE0NjE2IDkuMTQ1ODNMOC4zMzgzNSA5Ljk1MzY1WiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEyLjM0ODggOS45NTM2NUwxNC4zOTk4IDEyLjAxMDRMMTIuMzQzIDE0LjA2NzJMMTMuMTU2NiAxNC44NzVMMTYuMDIxMiAxMi4wMTA0TDEzLjE1NjYgOS4xNDU4M0wxMi4zNDg4IDkuOTUzNjVaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMy45NzIgMTEuNDM3NUgxLjEyNTMzVjIuNzkyMTlMNy42NzM3NiA3LjMyMzk2QzcuNzY5NjcgNy4zOTA0OSA3Ljg4MzYgNy40MjYxNCA4LjAwMDMyIDcuNDI2MTRDOC4xMTcwNSA3LjQyNjE0IDguMjMwOTggNy4zOTA0OSA4LjMyNjg5IDcuMzIzOTZMMTQuODc1MyAyLjc5MjE5VjhIMTYuMDIxMlYyLjI3MDgzQzE2LjAyMTIgMS45NjY5NCAxNS45MDA0IDEuNjc1NDkgMTUuNjg1NiAxLjQ2MDYxQzE1LjQ3MDcgMS4yNDU3MiAxNS4xNzkyIDEuMTI1IDE0Ljg3NTMgMS4xMjVIMS4xMjUzM0MwLjgyMTQzMiAxLjEyNSAwLjUyOTk4NCAxLjI0NTcyIDAuMzE1MDk5IDEuNDYwNjFDMC4xMDAyMTQgMS42NzU0OSAtMC4wMjA1MDc4IDEuOTY2OTQgLTAuMDIwNTA3OCAyLjI3MDgzVjExLjQzNzVDLTAuMDIwNTA3OCAxMS43NDE0IDAuMTAwMjE0IDEyLjAzMjggMC4zMTUwOTkgMTIuMjQ3N0MwLjUyOTk4NCAxMi40NjI2IDAuODIxNDMyIDEyLjU4MzMgMS4xMjUzMyAxMi41ODMzSDMuOTcyVjExLjQzNzVaTTEzLjYxNDkgMi4yNzA4M0w4LjAwMDMyIDYuMTU1MjFMMi4zODU3NCAyLjI3MDgzSDEzLjYxNDlaIiBmaWxsPSIjRkM1RDBEIi8+CjxwYXRoIGQ9Ik00LjI4MjEgOS45NTM2NUw2LjMzMzE0IDEyLjAxMDRMNC4yNzYzNyAxNC4wNjcyTDUuMDg5OTEgMTQuODc1TDcuOTU0NDkgMTIuMDEwNEw1LjA4OTkxIDkuMTQ1ODNMNC4yODIxIDkuOTUzNjVaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzkwXzI0MjAiPgo8cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication",
        "tooltip": "Enter your full email address (e.g., user@example.com) or the username provided by your email service. This is used to authenticate your access to the mail server."
      },
      {
        "group": "authentication",
        "tooltip": "Enter the password associated with your email account. Keep your password secure and do not share it with others."
      },
      {
        "group": "protocol",
        "tooltip": "Enter the address of the IMAP server used to retrieve your emails. This server allows you to sync your messages across multiple devices. (e.g., imap.example.com)"
      },
      {
        "group": "protocol",
        "tooltip": "Enter the port number for connecting to the IMAP server. Common ports are 993 for secure connections using SSL/TLS, or 143 for non-secure connections."
      },
      {
        "group": "protocol",
        "tooltip": "Select the encryption protocol for email security."
      },
      {
        "group": "listenerInfos",
        "tooltip": "Enter the names of the folder you wish to monitor. If left blank, the listener will default to monitoring the 'INBOX' folder."
      },
      {
        "group": "listenerInfos",
        "tooltip": "The duration for which the task will wait for a message to arrive in the mailbox before correlating"
      },
      {
        "group": "listenerInfos"
      },
      {
        "group": "unseenPollingConfig",
        "tooltip": "Chose the desired handling strategy"
      },
      {
        "group": "unseenPollingConfig",
        "tooltip": "Specify the destination folder to which the emails will be moved. To create a new folder or a hierarchy of folders, use a dot-separated path (e.g., 'Archive' or 'Projects.2023.January'). If any part of the path does not exist, it will be created automatically."
      },
      {
        "group": "allPollingConfig",
        "tooltip": "Chose the desired handling strategy"
      },
      {
        "group": "allPollingConfig",
        "tooltip": "Specify the destination folder to which the emails will be moved. To create a new folder or a hierarchy of folders, use a dot-separated path (e.g., 'Archive' or 'Projects.2023.January'). If any part of the path does not exist, it will be created automatically."
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.AWSCOMPREHEND.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Data Configuration and Processing"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+SWNvbi1BcmNoaXRlY3R1cmUvNjQvQXJjaF9BbWF6b24tQ29tcHJlaGVuZF82NDwvdGl0bGU+CiAgICA8ZyBpZD0iSWNvbi1BcmNoaXRlY3R1cmUvNjQvQXJjaF9BbWF6b24tQ29tcHJlaGVuZF82NCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ikljb24tQXJjaGl0ZWN0dXJlLUJHLzY0L01hY2hpbmUtTGVhcm5pbmciIGZpbGw9IiM5OTY5ZjciPgogICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiB4PSIwIiB5PSIwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiPjwvcmVjdD4KICAgICAgICA8L2c+CiAgICAgICAgPHBhdGggZD0iTTE2Ljk5OTk2NTMsNTQgTDMyLjk5OTg1NDIsNTQgTDMyLjk5OTg1NDIsNTIgTDE2Ljk5OTk2NTMsNTIgTDE2Ljk5OTk2NTMsNTQgWiBNMzMuOTk5ODQ3Myw0NyBMNDIuOTk5Nzg0OCw0NyBMNDIuOTk5Nzg0OCw0NSBMMzMuOTk5ODQ3Myw0NSBMMzMuOTk5ODQ3Myw0NyBaIE0xNi45OTk5NjUzLDQ3IEwzMS45OTk4NjEyLDQ3IEwzMS45OTk4NjEyLDQ1IEwxNi45OTk5NjUzLDQ1IEwxNi45OTk5NjUzLDQ3IFogTTE2Ljk5OTk2NTMsMjYgTDI5Ljk5OTg3NSwyNiBMMjkuOTk5ODc1LDI0IEwxNi45OTk5NjUzLDI0IEwxNi45OTk5NjUzLDI2IFogTTYzLjAxMDY0NTksNTQuMDc5IEM2Mi44OTc2NDY3LDU0LjE1NiA2Mi43NTI2NDc3LDU0LjIxOCA2Mi42MDM2NDg3LDU0LjI4NyBDNjIuMDc1NjUyNCw1NC41MzQgNjEuMzUyNjU3NCw1NC44NzMgNjEuMDYxNjU5NCw1NS42NTEgQzYxLjAyMDY1OTcsNTUuNzYzIDYwLjk5OTY1OTgsNTUuODgxIDYwLjk5OTY1OTgsNTYgTDYwLjk5OTY1OTgsNjAgTDU4Ljk5OTY3MzcsNjAgTDU4Ljk5OTY3MzcsNTEgTDYxLjk5OTY1MjksNTEgTDYxLjk5OTY1MjksNDkgTDUzLjk5OTcwODQsNDkgTDUzLjk5OTcwODQsNTEgTDU2Ljk5OTY4NzYsNTEgTDU2Ljk5OTY4NzYsNjAgTDU0Ljk5OTcwMTUsNjAgTDU0Ljk5OTcwMTUsNTYgQzU0Ljk5OTcwMTUsNTUuODgxIDU0Ljk3ODcwMTYsNTUuNzYzIDU0LjkzNjcwMTksNTUuNjUxIEM1NC42NDY3MDM5LDU0Ljg3MyA1My45MjM3MDksNTQuNTM0IDUzLjM5NTcxMjYsNTQuMjg3IEM1My4yNDY3MTM3LDU0LjIxOCA1My4xMDE3MTQ3LDU0LjE1NiA1Mi45ODg3MTU0LDU0LjA3OSBDNTAuMDI0NzM2LDUyLjAyNCA0OC41NDM3NDYzLDQ4LjUwNSA0OS4xMjQ3NDIzLDQ0Ljg5NiBDNDkuNzcyNzM3OCw0MC44NjMgNTMuMjA1NzEzOSwzNy42MjEgNTcuMjg2Njg1NiwzNy4xODggQzU3LjQ5NTY4NDIsMzcuMTY1IDU4LjUwNzY3NzEsMzcuMTY2IDU4LjcxMjY3NTcsMzcuMTg4IEM2Mi43OTM2NDc0LDM3LjYyMSA2Ni4yMjY2MjM1LDQwLjg2MyA2Ni44NzQ2MTksNDQuODk2IEM2Ny40NTU2MTUsNDguNTA1IDY1Ljk3NDYyNTMsNTIuMDI0IDYzLjAxMDY0NTksNTQuMDc5IEw2My4wMTA2NDU5LDU0LjA3OSBaIE02OC44NDk2MDUzLDQ0LjU3OSBDNjguMDYwNjEwOCwzOS42NyA2My44ODU2Mzk4LDM1LjcyNiA1OC45MjI2NzQyLDM1LjE5OCBDNTguNTc2Njc2NiwzNS4xNjIgNTcuNDIwNjg0NywzNS4xNjIgNTcuMDc2Njg3MSwzNS4xOTggTDU3LjA3NTY4NzEsMzUuMTk4IEM1Mi4xMTM3MjE1LDM1LjcyNiA0Ny45Mzg3NTA1LDM5LjY3IDQ3LjE0OTc1Niw0NC41NzkgQzQ2LjQ0NTc2MDksNDguOTU1IDQ4LjI0Njc0ODQsNTMuMjI1IDUxLjg1MDcyMzMsNTUuNzIyIEM1Mi4wNDU3MjIsNTUuODU3IDUyLjI5MDcyMDMsNTUuOTc5IDUyLjU0NzcxODUsNTYuMDk5IEM1Mi42ODQ3MTc2LDU2LjE2MyA1Mi44OTM3MTYxLDU2LjI2IDUyLjk5OTcxNTQsNTYuMzE0IEw1Mi45OTk3MTU0LDYxIEM1Mi45OTk3MTU0LDYxLjU1MiA1My40NDY3MTIzLDYyIDUzLjk5OTcwODQsNjIgTDYxLjk5OTY1MjksNjIgQzYyLjU1MjY0OSw2MiA2Mi45OTk2NDU5LDYxLjU1MiA2Mi45OTk2NDU5LDYxIEw2Mi45OTk2NDU5LDU2LjMzIEM2My4xMjA2NDUxLDU2LjI1MyA2My4zMTk2NDM3LDU2LjE2MSA2My40NTE2NDI4LDU2LjA5OSBDNjMuNzA4NjQxLDU1Ljk3OSA2My45NTM2MzkzLDU1Ljg1NyA2NC4xNDg2MzgsNTUuNzIyIEM2Ny43NTI2MTI5LDUzLjIyNSA2OS41NTM2MDA0LDQ4Ljk1NSA2OC44NDk2MDUzLDQ0LjU3OSBMNjguODQ5NjA1Myw0NC41NzkgWiBNNTkuNDY0NjcwNSw2NiBMNTYuNTM0NjkwOCw2NiBMNTUuODY3Njk1NSw2NSBMNjAuMTMxNjY1OSw2NSBMNTkuNDY0NjcwNSw2NiBaIE02MS45OTk2NTI5LDYzIEw1My45OTk3MDg0LDYzIEM1My42MzA3MTEsNjMgNTMuMjkxNzEzMyw2My4yMDMgNTMuMTE3NzE0NSw2My41MjggQzUyLjk0MzcxNTgsNjMuODU0IDUyLjk2MzcxNTYsNjQuMjQ4IDUzLjE2NzcxNDIsNjQuNTU1IEw1NS4xNjc3MDAzLDY3LjU1NSBDNTUuMzUzNjk5LDY3LjgzMyA1NS42NjU2OTY5LDY4IDU1Ljk5OTY5NDUsNjggTDU5Ljk5OTY2NjgsNjggQzYwLjMzMzY2NDUsNjggNjAuNjQ1NjYyMyw2Ny44MzMgNjAuODMxNjYxLDY3LjU1NSBMNjIuODMxNjQ3MSw2NC41NTUgQzYzLjAzNTY0NTcsNjQuMjQ4IDYzLjA1NTY0NTYsNjMuODU0IDYyLjg4MTY0NjgsNjMuNTI4IEM2Mi43MDc2NDgsNjMuMjAzIDYyLjM2ODY1MDMsNjMgNjEuOTk5NjUyOSw2MyBMNjEuOTk5NjUyOSw2MyBaIE0xNi45OTk5NjUzLDQwIEw0Mi45OTk3ODQ4LDQwIEw0Mi45OTk3ODQ4LDM4IEwxNi45OTk5NjUzLDM4IEwxNi45OTk5NjUzLDQwIFogTTI1Ljk5OTkwMjgsMzMgTDQyLjk5OTc4NDgsMzMgTDQyLjk5OTc4NDgsMzEgTDI1Ljk5OTkwMjgsMzEgTDI1Ljk5OTkwMjgsMzMgWiBNMTYuOTk5OTY1MywzMyBMMjMuOTk5OTE2NywzMyBMMjMuOTk5OTE2NywzMSBMMTYuOTk5OTY1MywzMSBMMTYuOTk5OTY1MywzMyBaIE0zNS45OTk4MzM0LDE1LjQxNCBMNDQuNTg1NzczOCwyNCBMMzUuOTk5ODMzNCwyNCBMMzUuOTk5ODMzNCwxNS40MTQgWiBNNDUuOTk5NzY0LDYxIEwxMy45OTk5ODYxLDYxIEwxMy45OTk5ODYxLDE0LjAwNSBMMzMuOTk5ODQ3MywxNCBMMzMuOTk5ODQ3MywyNSBDMzMuOTk5ODQ3MywyNS41NTIgMzQuNDQ2ODQ0MiwyNiAzNC45OTk4NDAzLDI2IEw0NS45OTk3NjQsMjYgTDQ1Ljk5OTc2NCwzOCBMNDcuOTk5NzUwMSwzOCBMNDcuOTk5NzUwMSwyNSBMNDcuOTkwNzUwMSwyNSBDNDcuOTg5NzUwMSwyNC43NCA0Ny44OTc3NTA4LDI0LjQ4NCA0Ny43MDY3NTIxLDI0LjI5MyBMMzUuNzA2ODM1NCwxMi4yOTMgQzM1LjUxNjgzNjcsMTIuMTAyIDM1LjI2MDgzODUsMTIuMDEgMzQuOTk5ODQwMywxMi4wMSBMMzQuOTk5ODQwMywxMiBMMTMsMTIuMDA1IEMxMi40NDY5OTY5LDEyLjAwNSAxMiwxMi40NTMgMTIsMTMuMDA1IEwxMiw2MiBDMTIsNjIuNTUyIDEyLjQ0Njk5NjksNjMgMTMsNjMgTDQ2Ljk5OTc1Nyw2MyBDNDcuNTUyNzUzMiw2MyA0Ny45OTk3NTAxLDYyLjU1MiA0Ny45OTk3NTAxLDYyIEw0Ny45OTk3NTAxLDU2IEw0NS45OTk3NjQsNTYgTDQ1Ljk5OTc2NCw2MSBaIiBpZD0iQW1hem9uLUNvbXByZWhlbmRfSWNvbl82NF9TcXVpZCIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgPC9nPgo8L3N2Zz4="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input",
        "tooltip": "<a href=\"https://docs.aws.amazon.com/comprehend/latest/dg/idp-set-textract-options.html\"target=\"_blank\">more info</a>"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.CamundaOperate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "cluster",
          "label": "Cluster"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "input",
          "label": "Endpoint"
        },
        {
          "id": "parameters",
          "label": "Parameters"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATYAAAE2CAYAAADrvL6pAAAACXBIWXMAAAsSAAALEgHS3X78AAAJEUlEQVR4nO3d71EcyQHG4W6bz5YuApGBcATHRXA4AQtHcGRwOAKjCA45AhzBQQSGDCAD4e+udg1uqfZsIfFnZ5l9+3mq+OCybmp2pvZXPTM927W1VgCS/M7ZBNIIGxBH2IA4wgbEETYgjrABcYQNiCNsQBxhA+IIGxBH2IA4wgbEETYgjrABcYQNiCNsQBxhA+IIGxBH2IA4wgbEETYgjrABcYQNiCNsQBxhA+IIGxBH2IA4wgbEETYgjrABcYQNiCNsQBxhA+IIGxBH2IA4wgbEETYgjrABcYQNiCNsQBxhA+IIGxBH2IA4wgbE2XFKWbda614p5fXKZlf/98dSyuXK/3fdWrt2Elin2lpzQHmSWutuKWW/h+vT36snbu5milwp5byH71LweCph41FqrQellIMetDczH72rHrrT1trlA/493BE2vqmPzA7739wxu880ojvpkfvorPE1wsa9etCOSynvFnSUbnvgTgSO+wgb/6fWOt3oPyql/LzgozMF7ri1drKAfWFhhI3fqLVO985OX/CS87Gm+3CH7sGxyjw2Pqu1Tpedv25R1CZvpwcMtdbDBewLC2HExp1a6+nC7qU9xfvW2tH27TbrJmyD6/fTzvvIJ8GH1prR2+BcinIWFLXJuz76ZGDCNrAegO8Dj8AUN5ekA3MpOqj+xf9b+Kf/obV2voD9YMOEbUD9JfV/DvDJp7luuybyjsel6JhGuQf1aqDPygphG0yfq5b0sOBbfuyTjhmIS9GB9Kkd18/4aaFtddNa2x39/I/EiG0sRwNGbfLGmwljMWIbxMCjtU+M2gZixDaOw4GjVvqozb22QQjbOExY/W/cGYBL0QEMNG/tIb4zry2fVarG8FIjlau+MMuXFmXZf+biL091YG5bPmEbw8EGP+XtytoE31xlqt/3Ot7gO6v7wpbPpWi4DV+GXkwRfcqlXg/c2QZGcLettdcP+HdsMQ8P8m3qSeD0O2j7T71/1V9W3+urUc3pVY89wYQt3ybCdrWOH3fsl64H/XJ2TqZ9hBO2fJsYnazt4URflOV4Xdu7hxFbOGEL1t82mHthlg/rXiGqL6k35yWpNxDCCVu2TYxMzmba7pzrhSb+ajArhC3b3COT6QnjXGGba7t3+ir3hBK2bHN/eWf72e3+IMHlKE8ibNnm/vLOvfr6nOsVmMsWTNiybXvYvvnmwjN4MhpM2HiOuV8mnzNsBBO2bNt+uSVsPImwZRtp0Rb4TNgYlYcHwYSNUXl4EEzYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAnB2nlAWbfnr8Yqbdm3u9Bl6QsLFYfYX5fWeIx3IpCsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiDOjlPKUtVad0sphzPt3nVr7dTJzyRsLNkUtp9n2r+LUoqwhXIpCsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhI1RfXTmcwkbo7p05nMJGxBH2LLdjH4AGJOwZbve8k+3u4B9YAsJG8+xN/PRmzNs2x59vkLYss395G/uEdWc4RS2YMKWbe4nf/tbvH3TPYIJW7a5v7xva62zjNpqrdNo7dUc25601kz3CCZs2Tbx5T3csu0WT4vzCVu2TdxHOqq1vl7nBvv25gyb+2vhhC1Ya236At/O/Amny8XjNW/zeM7L0FLK+YzbZgGELd8mvsQ/1VrXMsLq2/lpHdv6CmELJ2z5NvUl/uW5cev//S/r26V7eXAQTtjybXJ0MsXt7LFPSqd/P/13G4raVWvNVI9wtbU2+jGIV2v9OPM9qy+5KKWc9dHR5WpM+sOBvf43jdLebnC//tpaW/c9QRZG2AZQaz0tpbwb/Th0fzSHLZ9L0TGcjX4AuhtRG4OwDaC1dmZS6p2TBewDGyBs4zgd/QA4BuMQtnGcbGCy7pJ98DR0HMI2iP6lHvlSzJPQgQjbWEYdtb3vr5cxCGEbSB+1jTZyuTVaG495bAOqtV5ueFLsS/pTfyrMQIzYxnQ4yCXpP0RtTMI2oD5J9Sj8k9/M/JtuLJiwDaq1Ns3p+hD66afR6IHpHeMStoG11g4D4zZFbd+rU2MTtsGFxU3UuCNsfIrb+y0/EqLGZ8LGndba9DDhL1v6tHT67bddUeMTYeOz/kBhr4diW0w/HLnvQQGrTNDli/r6A9OM/TcLPUJTfA+9KsWXCBv36j/hfdTngy0lcFPQjltrVpriXsLGg/QR3EEp5ccXOGK3/bfUTozQeAhh41H6KO6g/+3PuEjMVV9h69xrUTyWsPEstdZPq03t9tBNvn/ENqdXn65X/s7/d1UreCxhY1Z9jdHfrDPq/hhzEzYgjnlsQBxhA+IIGxBH2IA4wgbEETYgjrABcYQNiCNsQBxhA+IIGxBH2IA4wgbEETYgjrABcYQNiCNsQBxhA+IIGxBH2IA4O05prn//+Q9Wg7rf5e///q+jpe4czyNs2R6zvifEcCkKxBE2II6wAXGEDYgjbEAcYQPiCBsQR9iAOMIGxBE2II6wAXGEDYgjbEAcYQPiCBsQR9iAOMIGxBE2II6wAXGEDYgjbEAcYQPiCBsQR9iAOMIGxBE2II6wAXGEDYgjbEAcYQPiCBsQR9iAOMIGxBE2II6wAXGEDYgjbEAcYQPi7Dil0S5GPwBfcbnYPePZamvNUQSiuBQF4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiCOsAFxhA2II2xAHGED4ggbEEfYgDjCBsQRNiBLKeU/6wDlv8KCEewAAAAASUVORK5CYII="
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "cluster"
      },
      {
        "group": "cluster"
      },
      {
        "group": "cluster"
      },
      {
        "group": "cluster"
      },
      {
        "group": "cluster"
      },
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {},
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {},
      {},
      {},
      {},
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {
        "group": "parameters"
      },
      {},
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.MSTeams.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "data",
          "label": "Data"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' height='18' width='18' viewBox='-334.32495 -518.3335 2897.4829 3110.001'%3E%3Cpath d='M1554.637 777.5h575.713c54.391 0 98.483 44.092 98.483 98.483v524.398c0 199.901-162.051 361.952-361.952 361.952h-1.711c-199.901.028-361.975-162-362.004-361.901V828.971c.001-28.427 23.045-51.471 51.471-51.471z' fill='%235059C9'/%3E%3Ccircle r='233.25' cy='440.583' cx='1943.75' fill='%235059C9'/%3E%3Ccircle r='336.917' cy='336.917' cx='1218.083' fill='%237B83EB'/%3E%3Cpath d='M1667.323 777.5H717.01c-53.743 1.33-96.257 45.931-95.01 99.676v598.105c-7.505 322.519 247.657 590.16 570.167 598.053 322.51-7.893 577.671-275.534 570.167-598.053V877.176c1.245-53.745-41.268-98.346-95.011-99.676z' fill='%237B83EB'/%3E%3Cpath d='M1244 777.5v838.145c-.258 38.435-23.549 72.964-59.09 87.598a91.856 91.856 0 01-35.765 7.257H667.613c-6.738-17.105-12.958-34.21-18.142-51.833a631.287 631.287 0 01-27.472-183.49V877.02c-1.246-53.659 41.198-98.19 94.855-99.52z' opacity='.1'/%3E%3Cpath d='M1192.167 777.5v889.978a91.802 91.802 0 01-7.257 35.765c-14.634 35.541-49.163 58.833-87.598 59.09H691.975c-8.812-17.105-17.105-34.21-24.362-51.833-7.257-17.623-12.958-34.21-18.142-51.833a631.282 631.282 0 01-27.472-183.49V877.02c-1.246-53.659 41.198-98.19 94.855-99.52z' opacity='.2'/%3E%3Cpath d='M1192.167 777.5v786.312c-.395 52.223-42.632 94.46-94.855 94.855h-447.84A631.282 631.282 0 01622 1475.177V877.02c-1.246-53.659 41.198-98.19 94.855-99.52z' opacity='.2'/%3E%3Cpath d='M1140.333 777.5v786.312c-.395 52.223-42.632 94.46-94.855 94.855H649.472A631.282 631.282 0 01622 1475.177V877.02c-1.246-53.659 41.198-98.19 94.855-99.52z' opacity='.2'/%3E%3Cpath d='M1244 509.522v163.275c-8.812.518-17.105 1.037-25.917 1.037-8.812 0-17.105-.518-25.917-1.037a284.472 284.472 0 01-51.833-8.293c-104.963-24.857-191.679-98.469-233.25-198.003a288.02 288.02 0 01-16.587-51.833h258.648c52.305.198 94.657 42.549 94.856 94.854z' opacity='.1'/%3E%3Cpath d='M1192.167 561.355v111.442a284.472 284.472 0 01-51.833-8.293c-104.963-24.857-191.679-98.469-233.25-198.003h190.228c52.304.198 94.656 42.55 94.855 94.854z' opacity='.2'/%3E%3Cpath d='M1192.167 561.355v111.442a284.472 284.472 0 01-51.833-8.293c-104.963-24.857-191.679-98.469-233.25-198.003h190.228c52.304.198 94.656 42.55 94.855 94.854z' opacity='.2'/%3E%3Cpath d='M1140.333 561.355v103.148c-104.963-24.857-191.679-98.469-233.25-198.003h138.395c52.305.199 94.656 42.551 94.855 94.855z' opacity='.2'/%3E%3ClinearGradient gradientTransform='matrix(1 0 0 -1 0 2075.333)' y2='394.261' x2='942.234' y1='1683.073' x1='198.099' gradientUnits='userSpaceOnUse' id='a'%3E%3Cstop offset='0' stop-color='%235a62c3'/%3E%3Cstop offset='.5' stop-color='%234d55bd'/%3E%3Cstop offset='1' stop-color='%233940ab'/%3E%3C/linearGradient%3E%3Cpath d='M95.01 466.5h950.312c52.473 0 95.01 42.538 95.01 95.01v950.312c0 52.473-42.538 95.01-95.01 95.01H95.01c-52.473 0-95.01-42.538-95.01-95.01V561.51c0-52.472 42.538-95.01 95.01-95.01z' fill='url(%23a)'/%3E%3Cpath d='M820.211 828.193h-189.97v517.297h-121.03V828.193H320.123V727.844h500.088z' fill='%23FFF'/%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "data"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.google.gcp.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": [
          "download file from google cloud storage",
          "upload file to google cloud storage",
          "download file from gcs",
          "upload file to gcs",
          "gcs"
        ]
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "additionalProperties",
          "label": "Additional properties"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGRlZnM+PHN0eWxlPi5jbHMtMXtmaWxsOiNhZWNiZmE7fS5jbHMtMntmaWxsOiM2NjlkZjY7fS5jbHMtM3tmaWxsOiM0Mjg1ZjQ7fS5jbHMtNHtmaWxsOiNmZmY7fTwvc3R5bGU+PC9kZWZzPjx0aXRsZT5JY29uXzI0cHhfQ2xvdWRTdG9yYWdlX0NvbG9yPC90aXRsZT48ZyBkYXRhLW5hbWU9IlByb2R1Y3QgSWNvbnMiPjxyZWN0IGNsYXNzPSJjbHMtMSIgeD0iMiIgeT0iNCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjciLz48cmVjdCBjbGFzcz0iY2xzLTIiIHg9IjIwIiB5PSI0IiB3aWR0aD0iMiIgaGVpZ2h0PSI3Ii8+PHBvbHlnb24gY2xhc3M9ImNscy0zIiBwb2ludHM9IjIyIDQgMjAgNCAyMCAxMSAyMiA0Ii8+PHJlY3QgY2xhc3M9ImNscy0yIiB4PSIyIiB5PSI0IiB3aWR0aD0iMiIgaGVpZ2h0PSI3Ii8+PHJlY3QgY2xhc3M9ImNscy00IiB4PSI2IiB5PSI3IiB3aWR0aD0iNiIgaGVpZ2h0PSIxIi8+PHJlY3QgY2xhc3M9ImNscy00IiB4PSIxNSIgeT0iNiIgd2lkdGg9IjMiIGhlaWdodD0iMyIgcng9IjEuNSIvPjxyZWN0IGNsYXNzPSJjbHMtMSIgeD0iMiIgeT0iMTMiIHdpZHRoPSIyMCIgaGVpZ2h0PSI3Ii8+PHJlY3QgY2xhc3M9ImNscy0yIiB4PSIyMCIgeT0iMTMiIHdpZHRoPSIyIiBoZWlnaHQ9IjciLz48cG9seWdvbiBjbGFzcz0iY2xzLTMiIHBvaW50cz0iMjIgMTMgMjAgMTMgMjAgMjAgMjIgMTMiLz48cmVjdCBjbGFzcz0iY2xzLTIiIHg9IjIiIHk9IjEzIiB3aWR0aD0iMiIgaGVpZ2h0PSI3Ii8+PHJlY3QgY2xhc3M9ImNscy00IiB4PSI2IiB5PSIxNiIgd2lkdGg9IjYiIGhlaWdodD0iMSIvPjxyZWN0IGNsYXNzPSJjbHMtNCIgeD0iMTUiIHk9IjE1IiB3aWR0aD0iMyIgaGVpZ2h0PSIzIiByeD0iMS41Ii8+PC9nPjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "operation"
      },
      {
        "group": "operation",
        "tooltip": "The project where the bucket is located."
      },
      {
        "group": "operation",
        "tooltip": "A bucket acts as a directory that organizes a set of objects."
      },
      {
        "group": "operation",
        "tooltip": "Specify the name of the document to be downloaded."
      },
      {
        "group": "operation",
        "tooltip": "If checked, a Camunda document is created and its reference is returned\nIf not checked, no document is created and the content is passed as is"
      },
      {
        "group": "operation",
        "tooltip": "The project where the bucket is located."
      },
      {
        "group": "operation",
        "tooltip": "A bucket acts as a directory that organizes a set of objects."
      },
      {
        "group": "operation",
        "tooltip": "Document to be uploaded to Google Cloud Storage."
      },
      {
        "group": "additionalProperties",
        "tooltip": "By default, the file's metadata name is used unless a custom name is specified."
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.AutomationAnywhere.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg viewBox='0 0 652 652' style='enable-background:new 0 0 652 652;' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cstyle type='text/css'%3E .st0%7Bclip-path:url(%23SVGID_2_);fill:url(%23SVGID_3_);%7D .st1%7Bopacity:0.3;%7D .st2%7Bclip-path:url(%23SVGID_5_);fill:url(%23SVGID_6_);%7D .st3%7Bfill:%23404041;%7D .st4%7Bfill:%23F79837;%7D%0A%3C/style%3E%3C/defs%3E%3Cg style='' transform='matrix(2.838946, 0, 0, 2.807126, -44.534363, -578.343384)'%3E%3Cg%3E%3Cdefs%3E%3Cpath id='SVGID_1_' d='M199.5,412.7l-0.2-0.5l-0.5-1l-11.7-31.5c11.1,5.1,21.4,11.8,30.7,20.1l0,0c1.2,0.9,2.2,2.2,3,3.7 c0.9,1.7,1.4,3.5,1.4,5.5c0,6.4-5.2,11.6-11.6,11.6C205.5,420.6,201.1,417.4,199.5,412.7 M103.3,229.6c1.5-4.1,4.9-6.9,8.7-7 c0,0,0.1,0,0.1,0c3.8,0.2,7.2,2.9,8.7,7l48.3,132.6c-10.7-2.7-21.7-4.1-32.9-4.1c-23.5,0-46.7,6.2-66.9,18 c-9.8,5.7-18.8,12.7-26.9,20.6L103.3,229.6z M110.9,212c-7.8,0.6-14.7,6-17.6,14L21,424.5c-1,2.8,0.4,5.8,3.2,6.8 c0.6,0.2,1.2,0.3,1.8,0.3c1.7,0,3.3-0.8,4.3-2.2c0.2-0.2,0.3-0.4,0.5-0.7c10.7-18,25.8-33.1,43.9-43.6 c18.6-10.8,39.9-16.6,61.6-16.6c12.9,0,25.6,2,37.6,5.9l15.3,41.1l0.5,0.9c3.2,8.8,11.5,14.7,20.9,14.7c12.3,0,22.2-10,22.2-22.2 c0-3.6-0.9-7.3-2.6-10.5c-0.7-1.2-1.4-2.3-2.2-3.4c-0.3-0.5-0.6-1-1-1.4c-13.1-12.2-28.4-21.5-44.9-27.6l-1.1-2.8l-0.1,0 L130.8,226c-2.9-7.9-9.7-13.3-17.6-14c-0.3,0-0.6-0.1-0.9-0.1c-0.1,0-0.2,0-0.2,0c-0.1,0-0.2,0-0.2,0 C111.5,211.9,111.2,212,110.9,212'/%3E%3C/defs%3E%3CclipPath id='SVGID_2_'%3E%3Cpath d='M199.5,412.7l-0.2-0.5l-0.5-1l-11.7-31.5c11.1,5.1,21.4,11.8,30.7,20.1l0,0c1.2,0.9,2.2,2.2,3,3.7 c0.9,1.7,1.4,3.5,1.4,5.5c0,6.4-5.2,11.6-11.6,11.6C205.5,420.6,201.1,417.4,199.5,412.7 M103.3,229.6c1.5-4.1,4.9-6.9,8.7-7 c0,0,0.1,0,0.1,0c3.8,0.2,7.2,2.9,8.7,7l48.3,132.6c-10.7-2.7-21.7-4.1-32.9-4.1c-23.5,0-46.7,6.2-66.9,18 c-9.8,5.7-18.8,12.7-26.9,20.6L103.3,229.6z M110.9,212c-7.8,0.6-14.7,6-17.6,14L21,424.5c-1,2.8,0.4,5.8,3.2,6.8 c0.6,0.2,1.2,0.3,1.8,0.3c1.7,0,3.3-0.8,4.3-2.2c0.2-0.2,0.3-0.4,0.5-0.7c10.7-18,25.8-33.1,43.9-43.6 c18.6-10.8,39.9-16.6,61.6-16.6c12.9,0,25.6,2,37.6,5.9l15.3,41.1l0.5,0.9c3.2,8.8,11.5,14.7,20.9,14.7c12.3,0,22.2-10,22.2-22.2 c0-3.6-0.9-7.3-2.6-10.5c-0.7-1.2-1.4-2.3-2.2-3.4c-0.3-0.5-0.6-1-1-1.4c-13.1-12.2-28.4-21.5-44.9-27.6l-1.1-2.8l-0.1,0 L130.8,226c-2.9-7.9-9.7-13.3-17.6-14c-0.3,0-0.6-0.1-0.9-0.1c-0.1,0-0.2,0-0.2,0c-0.1,0-0.2,0-0.2,0 C111.5,211.9,111.2,212,110.9,212' transform='matrix(1, 0, 0, 1, 0, 0)' style='overflow: visible;'/%3E%3C/clipPath%3E%3ClinearGradient id='SVGID_3_' gradientUnits='userSpaceOnUse' x1='-4.938' y1='743.0203' x2='1.9792' y2='743.0203' gradientTransform='matrix(30.658 0 0 -30.658 172.0803 23101.3418)'%3E%3Cstop offset='0' style='stop-color:%23FFDD15'/%3E%3Cstop offset='0.0343' style='stop-color:%23FED217'/%3E%3Cstop offset='0.1663' style='stop-color:%23FAAD1C'/%3E%3Cstop offset='0.3049' style='stop-color:%23F68F20'/%3E%3Cstop offset='0.45' style='stop-color:%23F37824'/%3E%3Cstop offset='0.6045' style='stop-color:%23F16726'/%3E%3Cstop offset='0.7747' style='stop-color:%23F05D28'/%3E%3Cstop offset='0.991' style='stop-color:%23F05A28'/%3E%3Cstop offset='1' style='stop-color:%23F05A28'/%3E%3C/linearGradient%3E%3Crect x='20' y='211.9' class='st0' width='212.8' height='219.7'/%3E%3C/g%3E%3Cg%3E%3Cg class='st1'%3E%3Cg%3E%3Cg%3E%3Cdefs%3E%3Cpath id='SVGID_4_' d='M187.3,380.3c11.1,5.1,21.4,11.8,30.7,20l0,0c1.2,1,2.2,2.2,3,3.7c0.9,1.7,1.4,3.5,1.4,5.5H233 c0-3.6-0.9-7.3-2.6-10.5c-0.6-1.2-1.4-2.3-2.2-3.4c-0.3-0.5-0.6-1-1-1.4c-13.1-12.2-28.4-21.5-44.9-27.6L187.3,380.3z M69.5,376.7c-9.8,5.7-18.8,12.7-26.9,20.6l-12.2,32.8c0.2-0.2,0.3-0.4,0.5-0.7c10.7-18,25.9-33.1,43.9-43.6 c18.6-10.8,39.9-16.6,61.6-16.6c12.1,0,25.1,1.9,37.6,5.9l-4.7-12.4c-10.7-2.7-21.7-4.1-32.9-4.1 C112.9,358.7,89.8,364.9,69.5,376.7'/%3E%3C/defs%3E%3CclipPath id='SVGID_5_'%3E%3Cpath d='M187.3,380.3c11.1,5.1,21.4,11.8,30.7,20l0,0c1.2,1,2.2,2.2,3,3.7c0.9,1.7,1.4,3.5,1.4,5.5H233 c0-3.6-0.9-7.3-2.6-10.5c-0.6-1.2-1.4-2.3-2.2-3.4c-0.3-0.5-0.6-1-1-1.4c-13.1-12.2-28.4-21.5-44.9-27.6L187.3,380.3z M69.5,376.7c-9.8,5.7-18.8,12.7-26.9,20.6l-12.2,32.8c0.2-0.2,0.3-0.4,0.5-0.7c10.7-18,25.9-33.1,43.9-43.6 c18.6-10.8,39.9-16.6,61.6-16.6c12.1,0,25.1,1.9,37.6,5.9l-4.7-12.4c-10.7-2.7-21.7-4.1-32.9-4.1 C112.9,358.7,89.8,364.9,69.5,376.7' transform='matrix(1, 0, 0, 1, 0, 0)' style='overflow: visible;'/%3E%3C/clipPath%3E%3ClinearGradient id='SVGID_6_' gradientUnits='userSpaceOnUse' x1='-5.4042' y1='741.473' x2='1.5131' y2='741.473' gradientTransform='matrix(29.2748 0 0 -29.2748 188.7152 22100.8477)'%3E%3Cstop offset='0' style='stop-color:%23FFFFFF'/%3E%3Cstop offset='0.3285' style='stop-color:%23FFFFFF'/%3E%3Cstop offset='0.3745' style='stop-color:%23FBFBFB'/%3E%3Cstop offset='0.4233' style='stop-color:%23EEEEEE'/%3E%3Cstop offset='0.4735' style='stop-color:%23D9D9D9'/%3E%3Cstop offset='0.5246' style='stop-color:%23BCBBBB'/%3E%3Cstop offset='0.5764' style='stop-color:%23969595'/%3E%3Cstop offset='0.6288' style='stop-color:%23686666'/%3E%3Cstop offset='0.6808' style='stop-color:%23332F30'/%3E%3Cstop offset='0.6948' style='stop-color:%23231F20'/%3E%3Cstop offset='0.9301' style='stop-color:%23FFFFFF'/%3E%3Cstop offset='1' style='stop-color:%23FFFFFF'/%3E%3C/linearGradient%3E%3Crect x='30.5' y='358.7' class='st2' width='18' height='18'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/g%3E%3Cg/%3E%3C/g%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "configuration"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {},
      {},
      {},
      {},
      {
        "group": "input"
      },
      {},
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {},
      {},
      {},
      {
        "group": "errors"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.AWSLAMBDA.v2": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "operation",
          "label": "Select operation"
        },
        {
          "id": "operationDetails",
          "label": "Operation details"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg width='18' height='18' viewBox='0 0 48 48' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3EIcon-Resource/Compute/Res_Amazon-Lambda_Lambda-Function_48_Light%3C/title%3E%3Cg id='Icon-Resource/Compute/Res_Amazon-Lambda_Lambda-Function_48' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpath d='M24,44 C12.972,44 4,35.028 4,24 C4,12.972 12.972,4 24,4 C35.028,4 44,12.972 44,24 C44,35.028 35.028,44 24,44 L24,44 Z M24,2 C11.869,2 2,11.869 2,24 C2,36.131 11.869,46 24,46 C36.131,46 46,36.131 46,24 C46,11.869 36.131,2 24,2 L24,2 Z M17.231,35.25 L11.876,35.25 L18.221,21.959 L20.902,27.492 L17.231,35.25 Z M19.114,19.215 C18.946,18.87 18.597,18.651 18.214,18.651 L18.211,18.651 C17.826,18.652 17.477,18.874 17.312,19.221 L9.389,35.819 C9.24,36.129 9.262,36.493 9.445,36.783 C9.628,37.074 9.947,37.25 10.291,37.25 L17.864,37.25 C18.251,37.25 18.603,37.027 18.769,36.678 L22.915,27.915 C23.044,27.642 23.043,27.323 22.911,27.051 L19.114,19.215 Z M36.125,35.25 L30.673,35.25 L20.761,13.953 C20.597,13.601 20.243,13.375 19.854,13.375 L16.251,13.375 L16.255,9.25 L23.475,9.25 L33.339,30.545 C33.503,30.898 33.856,31.125 34.246,31.125 L36.125,31.125 L36.125,35.25 Z M37.125,29.125 L34.885,29.125 L25.021,7.83 C24.856,7.477 24.503,7.25 24.113,7.25 L15.256,7.25 C14.704,7.25 14.257,7.697 14.256,8.249 L14.25,14.374 C14.25,14.64 14.355,14.894 14.543,15.082 C14.73,15.27 14.984,15.375 15.25,15.375 L19.217,15.375 L29.129,36.672 C29.293,37.024 29.646,37.25 30.035,37.25 L37.125,37.25 C37.678,37.25 38.125,36.803 38.125,36.25 L38.125,30.125 C38.125,29.572 37.678,29.125 37.125,29.125 L37.125,29.125 Z' id='Amazon-Lambda-Lambda-Function_Resource-Icon_light-bg' fill='%23D45B07'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "operation"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "operationDetails"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.message.sendtask.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "default",
          "label": "Properties"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZwogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHdpZHRoPSIyMDAwIgogICBoZWlnaHQ9IjIwMDAiCiAgIHZpZXdCb3g9IjAgMCAyMDAwIDIwMDAiCiAgIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIj4KICA8cGF0aAogICAgIHN0eWxlPSJjb2xvcjojMDAwMDAwIgogICAgIGQ9Im0gMCwyODQgMjAwMCwwIC0xMDAwLDU1NCB6Ii8+CiAgPHBhdGgKICAgICBzdHlsZT0iY29sb3I6IzAwMDAwMCIKICAgICBkPSJtIDAsNDUyIDEwMDAsNTQ4IDEwMDAsLTU0OCAwLDEwOTYgLTIwMDAsMCB6Ii8+Cjwvc3ZnPgo="
      }
    },
    "properties": [
      {},
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "default"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connector.IdpClassificationOutBoundTemplate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "input",
          "label": "Input message data"
        },
        {
          "id": "extractor",
          "label": "Extractor selection"
        },
        {
          "id": "ai",
          "label": "Ai provider selection"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxnIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTptdWx0aXBseSI+CiAgICAgICAgPHBhdGggZD0iTTE5LjE3ODkgMEgwVjE5LjE3ODlIMTkuMTc4OVYwWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPgogICAgPC9nPgogICAgPHBhdGggZD0iTTEwLjE4NzkgOC45OTAxVjUuMzk0MDdINS4zOTMxOFYxMy43ODQ4SDEzLjc4MzlWOC45OTAxSDEwLjE4NzlaTTYuNTkxODYgNi41OTI3NEg4Ljk4OTIxVjguOTkwMUg2LjU5MTg2VjYuNTkyNzRaTTguOTg5MjEgMTIuNTg2MUg2LjU5MTg2VjEwLjE4ODhIOC45ODkyMVYxMi41ODYxWk0xMi41ODUyIDEyLjU4NjFIMTAuMTg3OVYxMC4xODg4SDEyLjU4NTJWMTIuNTg2MVoiIGZpbGw9IiNGQzVEMEQiLz4KICAgIDxwYXRoIGQ9Ik0xNS41ODE5IDE2Ljc4MTVIMy41OTUxNkMzLjI3NzM3IDE2Ljc4MTEgMi45NzI2OSAxNi42NTQ3IDIuNzQ3OTcgMTYuNDNDMi41MjMyNiAxNi4yMDUzIDIuMzk2ODUgMTUuOTAwNiAyLjM5NjQ4IDE1LjU4MjhWMy41OTYwNUMyLjM5Njg1IDMuMjc4MjUgMi41MjMyNiAyLjk3MzU3IDIuNzQ3OTcgMi43NDg4NkMyLjk3MjY5IDIuNTI0MTQgMy4yNzczNyAyLjM5NzczIDMuNTk1MTYgMi4zOTczN0g5LjU4ODU1VjMuNTk2MDVIMy41OTUxNlYxNS41ODI4SDE1LjU4MTlWOS41ODk0NEgxNi43ODA2VjE1LjU4MjhDMTYuNzgwMyAxNS45MDA2IDE2LjY1MzkgMTYuMjA1MyAxNi40MjkxIDE2LjQzQzE2LjIwNDQgMTYuNjU0NyAxNS44OTk3IDE2Ljc4MTEgMTUuNTgxOSAxNi43ODE1WiIgZmlsbD0iIzE2MTYxNiIvPgogICAgPHBhdGggZD0iTTE3IDcuNUgxMlY2LjVIMTdWNy41WiIgZmlsbD0iI0ZDNUQwRCIvPgogICAgPHBhdGggZD0iTTE3IDUuNUgxMlY0LjVIMTdWNS41WiIgZmlsbD0iI0ZDNUQwRCIvPgogICAgPHBhdGggZD0iTTE3IDMuNUgxNUgxMlYyLjVIMTdWMy41WiIgZmlsbD0iI0ZDNUQwRCIvPgo8L3N2Zz4K"
      }
    },
    "properties": [
      {},
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "ai"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.AWSEventBridge.receive.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "API destination"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 256 256'%3E%3Cdefs%3E%3ClinearGradient id='logosAwsEventbridge0' x1='0%25' x2='100%25' y1='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23B0084D'/%3E%3Cstop offset='100%25' stop-color='%23FF4F8B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23logosAwsEventbridge0)' d='M0 0h256v256H0z'/%3E%3Cpath fill='%23FFF' d='M171.702 211.2c-6.858 0-12.44-5.61-12.44-12.509s5.582-12.509 12.44-12.509c6.857 0 12.438 5.61 12.438 12.51c0 6.898-5.581 12.508-12.438 12.508Zm-27.278-54.4h-33.071L94.815 128l16.538-28.8h33.071L160.96 128l-16.535 28.8ZM88.387 69.818c-6.857 0-12.438-5.61-12.438-12.51c0-6.898 5.581-12.508 12.438-12.508c6.861 0 12.443 5.61 12.443 12.509s-5.582 12.509-12.443 12.509Zm83.315 109.964c-2.362 0-4.614.458-6.699 1.261l-13.514-22.931l-.713.426L167.39 129.6a3.226 3.226 0 0 0 0-3.2l-18.374-32a3.177 3.177 0 0 0-2.755-1.6h-33.435l.13-.077l-12.39-21.03c4.047-3.469 6.628-8.627 6.628-14.384c0-10.426-8.436-18.909-18.807-18.909c-10.367 0-18.803 8.483-18.803 18.909c0 10.425 8.436 18.909 18.803 18.909c2.365 0 4.618-.458 6.702-1.261l11.567 19.625L88.384 126.4a3.226 3.226 0 0 0 0 3.2l18.377 32c.57.992 1.62 1.6 2.756 1.6h36.744c.264 0 .521-.042.77-.102l12.496 21.21c-4.051 3.468-6.629 8.626-6.629 14.383c0 10.426 8.433 18.909 18.804 18.909c10.37 0 18.803-8.483 18.803-18.909c0-10.425-8.433-18.909-18.803-18.909Zm18.968-77.05c-6.857 0-12.436-5.609-12.436-12.508c0-6.9 5.579-12.509 12.436-12.509c6.858 0 12.44 5.61 12.44 12.509c0 6.9-5.582 12.509-12.44 12.509Zm23.303 23.668l-12.08-21.04c4.592-3.453 7.58-8.944 7.58-15.136c0-10.426-8.432-18.909-18.803-18.909c-2.638 0-5.152.554-7.433 1.549l-9.849-17.155a3.18 3.18 0 0 0-2.756-1.6h-39.448v6.4h37.612l9.11 15.872c-3.703 3.456-6.036 8.374-6.036 13.843c0 10.426 8.433 18.909 18.8 18.909c1.932 0 3.8-.298 5.556-.845L207.545 128l-15.892 27.674l5.512 3.2l16.808-29.274a3.21 3.21 0 0 0 0-3.2Zm-146.04 50.39c-6.86 0-12.442-5.612-12.442-12.508c0-6.9 5.581-12.51 12.442-12.51c6.857 0 12.439 5.61 12.439 12.51c0 6.896-5.582 12.508-12.44 12.508Zm10.393 3.236c5.062-3.392 8.41-9.181 8.41-15.744c0-10.426-8.436-18.91-18.803-18.91c-3.004 0-5.833.73-8.353 1.994L48.458 128l18.428-32.093l-5.515-3.2L42.027 126.4a3.21 3.21 0 0 0 0 3.2l12.388 21.568c-3.268 3.405-5.289 8.022-5.289 13.114c0 10.425 8.436 18.908 18.807 18.908c1.562 0 3.074-.214 4.528-.579l10.15 17.68c.57.989 1.62 1.6 2.757 1.6h39.451v-6.4H87.204l-8.878-15.465Z'/%3E%3C/svg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connector.IdpStructuredExtractionOutBoundTemplate.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "input",
          "label": "Input message data"
        },
        {
          "id": "extractor",
          "label": "Extractor selection"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE5LjE3ODkiIGhlaWdodD0iMTkuMTc4OSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4wMSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm11bHRpcGx5Ii8+CjxwYXRoIGQ9Ik0xNi43ODA2IDcuMTkyMDhIMTEuOTg1OVYyLjM5NzM3SDE2Ljc4MDZWNy4xOTIwOFpNMTMuMTg0NiA1Ljk5MzRIMTUuNTgxOVYzLjU5NjA1SDEzLjE4NDZWNS45OTM0WiIgZmlsbD0iI0ZDNUQwRCIvPgo8cGF0aCBkPSJNMTAuMTg3OSA4Ljk5MDFWNS4zOTQwN0g1LjM5MzE4VjEzLjc4NDhIMTMuNzgzOVY4Ljk5MDFIMTAuMTg3OVpNNi41OTE4NiA2LjU5Mjc0SDguOTg5MjFWOC45OTAxSDYuNTkxODZWNi41OTI3NFpNOC45ODkyMSAxMi41ODYxSDYuNTkxODZWMTAuMTg4OEg4Ljk4OTIxVjEyLjU4NjFaTTEyLjU4NTIgMTIuNTg2MUgxMC4xODc5VjEwLjE4ODhIMTIuNTg1MlYxMi41ODYxWiIgZmlsbD0iI0ZDNUQwRCIvPgo8cGF0aCBkPSJNMTUuNTgxOSAxNi43ODE1SDMuNTk1MTZDMy4yNzczNyAxNi43ODExIDIuOTcyNjkgMTYuNjU0NyAyLjc0Nzk3IDE2LjQzQzIuNTIzMjYgMTYuMjA1MyAyLjM5Njg1IDE1LjkwMDYgMi4zOTY0OCAxNS41ODI4VjMuNTk2MDVDMi4zOTY4NSAzLjI3ODI1IDIuNTIzMjYgMi45NzM1NyAyLjc0Nzk3IDIuNzQ4ODZDMi45NzI2OSAyLjUyNDE0IDMuMjc3MzcgMi4zOTc3MyAzLjU5NTE2IDIuMzk3MzdIOS41ODg1NVYzLjU5NjA1SDMuNTk1MTZWMTUuNTgyOEgxNS41ODE5VjkuNTg5NDRIMTYuNzgwNlYxNS41ODI4QzE2Ljc4MDMgMTUuOTAwNiAxNi42NTM5IDE2LjIwNTMgMTYuNDI5MSAxNi40M0MxNi4yMDQ0IDE2LjY1NDcgMTUuODk5NyAxNi43ODExIDE1LjU4MTkgMTYuNzgxNVoiIGZpbGw9IiMxNjE2MTYiLz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "extractor"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.aws.bedrock.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "configuration",
          "label": "Configuration"
        },
        {
          "id": "action",
          "label": "Action"
        },
        {
          "id": "invokeModel",
          "label": "Invoke Model"
        },
        {
          "id": "converse",
          "label": "Converse"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+SWNvbi1BcmNoaXRlY3R1cmUvNjQvQXJjaF9BbWF6b24tQmVkcm9ja182NDwvdGl0bGU+CiAgICA8ZyBpZD0iSWNvbi1BcmNoaXRlY3R1cmUvNjQvQXJjaF9BbWF6b24tQmVkcm9ja182NCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ikljb24tQXJjaGl0ZWN0dXJlLUJHLzY0L01hY2hpbmUtTGVhcm5pbmciIGZpbGw9IiM5OTY5ZjciPgogICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlIiB4PSIwIiB5PSIwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiPjwvcmVjdD4KICAgICAgICA8L2c+CiAgICAgICAgPGcgaWQ9Ikljb24tU2VydmljZS82NC9BbWF6b24tQmVkcm9ja182NCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTIuMDAwMDAwLCAxMi4wMDAwMDApIiBmaWxsPSIjRkZGRkZGIj4KICAgICAgICAgICAgPHBhdGggZD0iTTUyLDI2Ljk5OTg5MTggQzUwLjg5NywyNi45OTk4OTE4IDUwLDI2LjEwMjg5MTggNTAsMjQuOTk5ODkxOCBDNTAsMjMuODk2ODkxOCA1MC44OTcsMjIuOTk5ODkxOCA1MiwyMi45OTk4OTE4IEM1My4xMDMsMjIuOTk5ODkxOCA1NCwyMy44OTY4OTE4IDU0LDI0Ljk5OTg5MTggQzU0LDI2LjEwMjg5MTggNTMuMTAzLDI2Ljk5OTg5MTggNTIsMjYuOTk5ODkxOCBMNTIsMjYuOTk5ODkxOCBaIE0yMC4xMTMsNTMuOTA3ODkxOCBMMTYuODY1LDUyLjAxMzg5MTggTDIzLjUzLDQ3Ljg0Nzg5MTggTDIyLjQ3LDQ2LjE1MTg5MTggTDE0LjkxMyw1MC44NzQ4OTE4IEw5LDQ3LjQyNTg5MTggTDksMzguNTM0ODkxOCBMMTQuNTU1LDM0LjgzMTg5MTggTDEzLjQ0NSwzMy4xNjc4OTE4IEw3Ljk1OSwzNi44MjQ4OTE4IEwyLDMzLjQxOTg5MTggTDIsMjguNTc5ODkxOCBMOC40OTYsMjQuODY3ODkxOCBMNy41MDQsMjMuMTMxODkxOCBMMiwyNi4yNzY4OTE4IEwyLDIyLjU3OTg5MTggTDgsMTkuMTUxODkxOCBMMTQsMjIuNTc5ODkxOCBMMTQsMjYuNDMzODkxOCBMOS40ODUsMjkuMTQyODkxOCBMMTAuNTE1LDMwLjg1Njg5MTggTDE1LDI4LjE2NTg5MTggTDE5LjQ4NSwzMC44NTY4OTE4IEwyMC41MTUsMjkuMTQyODkxOCBMMTYsMjYuNDMzODkxOCBMMTYsMjIuNTM0ODkxOCBMMjEuNTU1LDE4LjgzMTg5MTggQzIxLjgzMywxOC42NDU4OTE4IDIyLDE4LjMzMzg5MTggMjIsMTcuOTk5ODkxOCBMMjIsMTAuOTk5ODkxOCBMMjAsMTAuOTk5ODkxOCBMMjAsMTcuNDY0ODkxOCBMMTQuOTU5LDIwLjgyNDg5MTggTDksMTcuNDE5ODkxOCBMOSw4LjU3Mzg5MTgxIEwxNCw1LjY1Nzg5MTgxIEwxNCwxMy45OTk4OTE4IEwxNiwxMy45OTk4OTE4IEwxNiw0LjQ5MDg5MTgxIEwyMC4xMTMsMi4wOTE4OTE4MSBMMjgsNC43MjA4OTE4MSBMMjgsMzMuNDMzODkxOCBMMTMuNDg1LDQyLjE0Mjg5MTggTDE0LjUxNSw0My44NTY4OTE4IEwyOCwzNS43NjU4OTE4IEwyOCw1MS4yNzg4OTE4IEwyMC4xMTMsNTMuOTA3ODkxOCBaIE01MCwzNy45OTk4OTE4IEM1MCwzOS4xMDI4OTE4IDQ5LjEwMywzOS45OTk4OTE4IDQ4LDM5Ljk5OTg5MTggQzQ2Ljg5NywzOS45OTk4OTE4IDQ2LDM5LjEwMjg5MTggNDYsMzcuOTk5ODkxOCBDNDYsMzYuODk2ODkxOCA0Ni44OTcsMzUuOTk5ODkxOCA0OCwzNS45OTk4OTE4IEM0OS4xMDMsMzUuOTk5ODkxOCA1MCwzNi44OTY4OTE4IDUwLDM3Ljk5OTg5MTggTDUwLDM3Ljk5OTg5MTggWiBNNDAsNDcuOTk5ODkxOCBDNDAsNDkuMTAyODkxOCAzOS4xMDMsNDkuOTk5ODkxOCAzOCw0OS45OTk4OTE4IEMzNi44OTcsNDkuOTk5ODkxOCAzNiw0OS4xMDI4OTE4IDM2LDQ3Ljk5OTg5MTggQzM2LDQ2Ljg5Njg5MTggMzYuODk3LDQ1Ljk5OTg5MTggMzgsNDUuOTk5ODkxOCBDMzkuMTAzLDQ1Ljk5OTg5MTggNDAsNDYuODk2ODkxOCA0MCw0Ny45OTk4OTE4IEw0MCw0Ny45OTk4OTE4IFogTTM5LDcuOTk5ODkxODEgQzM5LDYuODk2ODkxODEgMzkuODk3LDUuOTk5ODkxODEgNDEsNS45OTk4OTE4MSBDNDIuMTAzLDUuOTk5ODkxODEgNDMsNi44OTY4OTE4MSA0Myw3Ljk5OTg5MTgxIEM0Myw5LjEwMjg5MTgxIDQyLjEwMyw5Ljk5OTg5MTgxIDQxLDkuOTk5ODkxODEgQzM5Ljg5Nyw5Ljk5OTg5MTgxIDM5LDkuMTAyODkxODEgMzksNy45OTk4OTE4MSBMMzksNy45OTk4OTE4MSBaIE01MiwyMC45OTk4OTE4IEM1MC4xNDEsMjAuOTk5ODkxOCA0OC41ODksMjIuMjc5ODkxOCA0OC4xNDIsMjMuOTk5ODkxOCBMMzAsMjMuOTk5ODkxOCBMMzAsMTguOTk5ODkxOCBMNDEsMTguOTk5ODkxOCBDNDEuNTUzLDE4Ljk5OTg5MTggNDIsMTguNTUxODkxOCA0MiwxNy45OTk4OTE4IEw0MiwxMS44NTc4OTE4IEM0My43MiwxMS40MTA4OTE4IDQ1LDkuODU3ODkxODEgNDUsNy45OTk4OTE4MSBDNDUsNS43OTM4OTE4MSA0My4yMDYsMy45OTk4OTE4MSA0MSwzLjk5OTg5MTgxIEMzOC43OTQsMy45OTk4OTE4MSAzNyw1Ljc5Mzg5MTgxIDM3LDcuOTk5ODkxODEgQzM3LDkuODU3ODkxODEgMzguMjgsMTEuNDEwODkxOCA0MCwxMS44NTc4OTE4IEw0MCwxNi45OTk4OTE4IEwzMCwxNi45OTk4OTE4IEwzMCwzLjk5OTg5MTgxIEMzMCwzLjU2ODg5MTgxIDI5LjcyNSwzLjE4Nzg5MTgxIDI5LjMxNiwzLjA1MDg5MTgxIEwyMC4zMTYsMC4wNTA4OTE4MTEgQzIwLjA0MiwtMC4wMzkxMDgxODkgMTkuNzQ0LC0wLjAwOTEwODE4OTA0IDE5LjQ5NiwwLjEzNTg5MTgxMSBMNy40OTYsNy4xMzU4OTE4MSBDNy4xODgsNy4zMTQ4OTE4MSA3LDcuNjQ0ODkxODEgNyw3Ljk5OTg5MTgxIEw3LDE3LjQxOTg5MTggTDAuNTA0LDIxLjEzMTg5MTggQzAuMTkyLDIxLjMwOTg5MTggMCwyMS42NDA4OTE4IDAsMjEuOTk5ODkxOCBMMCwzMy45OTk4OTE4IEMwLDM0LjM1ODg5MTggMC4xOTIsMzQuNjg5ODkxOCAwLjUwNCwzNC44Njc4OTE4IEw3LDM4LjU3OTg5MTggTDcsNDcuOTk5ODkxOCBDNyw0OC4zNTQ4OTE4IDcuMTg4LDQ4LjY4NDg5MTggNy40OTYsNDguODYzODkxOCBMMTkuNDk2LDU1Ljg2Mzg5MTggQzE5LjY1LDU1Ljk1Mzg5MTggMTkuODI1LDU1Ljk5OTg5MTggMjAsNTUuOTk5ODkxOCBDMjAuMTA2LDU1Ljk5OTg5MTggMjAuMjEzLDU1Ljk4Mjg5MTggMjAuMzE2LDU1Ljk0ODg5MTggTDI5LjMxNiw1Mi45NDg4OTE4IEMyOS43MjUsNTIuODExODkxOCAzMCw1Mi40MzA4OTE4IDMwLDUxLjk5OTg5MTggTDMwLDM5Ljk5OTg5MTggTDM3LDM5Ljk5OTg5MTggTDM3LDQ0LjE0MTg5MTggQzM1LjI4LDQ0LjU4ODg5MTggMzQsNDYuMTQxODkxOCAzNCw0Ny45OTk4OTE4IEMzNCw1MC4yMDU4OTE4IDM1Ljc5NCw1MS45OTk4OTE4IDM4LDUxLjk5OTg5MTggQzQwLjIwNiw1MS45OTk4OTE4IDQyLDUwLjIwNTg5MTggNDIsNDcuOTk5ODkxOCBDNDIsNDYuMTQxODkxOCA0MC43Miw0NC41ODg4OTE4IDM5LDQ0LjE0MTg5MTggTDM5LDM4Ljk5OTg5MTggQzM5LDM4LjQ0Nzg5MTggMzguNTUzLDM3Ljk5OTg5MTggMzgsMzcuOTk5ODkxOCBMMzAsMzcuOTk5ODkxOCBMMzAsMzIuOTk5ODkxOCBMNDIuNSwzMi45OTk4OTE4IEw0NC42MzgsMzUuODQ5ODkxOCBDNDQuMjM5LDM2LjQ3MTg5MTggNDQsMzcuMjA2ODkxOCA0NCwzNy45OTk4OTE4IEM0NCw0MC4yMDU4OTE4IDQ1Ljc5NCw0MS45OTk4OTE4IDQ4LDQxLjk5OTg5MTggQzUwLjIwNiw0MS45OTk4OTE4IDUyLDQwLjIwNTg5MTggNTIsMzcuOTk5ODkxOCBDNTIsMzUuNzkzODkxOCA1MC4yMDYsMzMuOTk5ODkxOCA0OCwzMy45OTk4OTE4IEM0Ny4zMTYsMzMuOTk5ODkxOCA0Ni42ODIsMzQuMTg3ODkxOCA0Ni4xMTksMzQuNDkxODkxOCBMNDMuOCwzMS4zOTk4OTE4IEM0My42MTEsMzEuMTQ3ODkxOCA0My4zMTQsMzAuOTk5ODkxOCA0MywzMC45OTk4OTE4IEwzMCwzMC45OTk4OTE4IEwzMCwyNS45OTk4OTE4IEw0OC4xNDIsMjUuOTk5ODkxOCBDNDguNTg5LDI3LjcxOTg5MTggNTAuMTQxLDI4Ljk5OTg5MTggNTIsMjguOTk5ODkxOCBDNTQuMjA2LDI4Ljk5OTg5MTggNTYsMjcuMjA1ODkxOCA1NiwyNC45OTk4OTE4IEM1NiwyMi43OTM4OTE4IDU0LjIwNiwyMC45OTk4OTE4IDUyLDIwLjk5OTg5MTggTDUyLDIwLjk5OTg5MTggWiIgaWQ9IkZpbGwtMSI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+"
      }
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "configuration"
      },
      {
        "group": "configuration"
      },
      {
        "group": "action"
      },
      {
        "group": "invokeModel"
      },
      {
        "group": "invokeModel"
      },
      {
        "group": "converse"
      },
      {
        "group": "converse"
      },
      {
        "group": "converse"
      },
      {
        "group": "converse"
      },
      {
        "group": "converse"
      },
      {
        "group": "converse"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.agenticai.a2a.client.webhook.receive.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "clientResponse",
          "label": "Client Response"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMTguNSIgdmlld0JveD0iMyA5IDMwIDE4LjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTguNyAxNC43MjVDOC41MTY2NyAxNC45MDgzIDguMjgzMzMgMTUgOCAxNUM3LjcxNjY3IDE1IDcuNDc1IDE0LjkwODMgNy4yNzUgMTQuNzI1QzcuMDkxNjcgMTQuNTI1IDcgMTQuMjgzMyA3IDE0QzcgMTMuNzE2NyA3LjA5MTY3IDEzLjQ4MzMgNy4yNzUgMTMuM0M3LjQ3NSAxMy4xIDcuNzE2NjcgMTMgOCAxM0M4LjI4MzMzIDEzIDguNTE2NjcgMTMuMSA4LjcgMTMuM0M4LjkgMTMuNDgzMyA5IDEzLjcxNjcgOSAxNEM5IDE0LjI4MzMgOC45IDE0LjUyNSA4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMTQuNyAxNC43MjVDMTQuNTE2NyAxNC45MDgzIDE0LjI4MzMgMTUgMTQgMTVDMTMuNzE2NyAxNSAxMy40NzUgMTQuOTA4MyAxMy4yNzUgMTQuNzI1QzEzLjA5MTcgMTQuNTI1IDEzIDE0LjI4MzMgMTMgMTRDMTMgMTMuNzE2NyAxMy4wOTE3IDEzLjQ4MzMgMTMuMjc1IDEzLjNDMTMuNDc1IDEzLjEgMTMuNzE2NyAxMyAxNCAxM0MxNC4yODMzIDEzIDE0LjUxNjcgMTMuMSAxNC43IDEzLjNDMTQuOSAxMy40ODMzIDE1IDEzLjcxNjcgMTUgMTRDMTUgMTQuMjgzMyAxNC45IDE0LjUyNSAxNC43IDE0LjcyNVoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTIyLjcgMTQuNzI1QzIyLjUxNjcgMTQuOTA4MyAyMi4yODMzIDE1IDIyIDE1QzIxLjcxNjcgMTUgMjEuNDc1IDE0LjkwODMgMjEuMjc1IDE0LjcyNUMyMS4wOTE3IDE0LjUyNSAyMSAxNC4yODMzIDIxIDE0QzIxIDEzLjcxNjcgMjEuMDkxNyAxMy40ODMzIDIxLjI3NSAxMy4zQzIxLjQ3NSAxMy4xIDIxLjcxNjcgMTMgMjIgMTNDMjIuMjgzMyAxMyAyMi41MTY3IDEzLjEgMjIuNyAxMy4zQzIyLjkgMTMuNDgzMyAyMyAxMy43MTY3IDIzIDE0QzIzIDE0LjI4MzMgMjIuOSAxNC41MjUgMjIuNyAxNC43MjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0yOC43IDE0LjcyNUMyOC41MTY3IDE0LjkwODMgMjguMjgzMyAxNSAyOCAxNUMyNy43MTY3IDE1IDI3LjQ3NSAxNC45MDgzIDI3LjI3NSAxNC43MjVDMjcuMDkxNyAxNC41MjUgMjcgMTQuMjgzMyAyNyAxNEMyNyAxMy43MTY3IDI3LjA5MTcgMTMuNDgzMyAyNy4yNzUgMTMuM0MyNy40NzUgMTMuMSAyNy43MTY3IDEzIDI4IDEzQzI4LjI4MzMgMTMgMjguNTE2NyAxMy4xIDI4LjcgMTMuM0MyOC45IDEzLjQ4MzMgMjkgMTMuNzE2NyAyOSAxNEMyOSAxNC4yODMzIDI4LjkgMTQuNTI1IDI4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTUgMTRDNSAxMi4zNDMxIDYuMzQzMTUgMTEgOCAxMUgxNEMxNC43NzYgMTEgMTUuMjg0IDExLjE1MzcgMTUuNjQgMTEuMzgxOEMxNS44NTg5IDEwLjc5NCAxNi4xNTE3IDEwLjE3MDkgMTYuNTU1IDkuNTk3OTVDMTUuODc5NyA5LjIxMTUzIDE1LjAzODYgOSAxNCA5SDhDNS4yMzg1OCA5IDMgMTEuMjM4NiAzIDE0QzMgMTYuNzYxMiA1LjIzNzU5IDE5IDcuOTk5MjYgMTlIMTRDMTUuNzYzNCAxOSAxNi45NTczIDE4LjM5MDIgMTcuNzM3NSAxNy4zNUMxOC40MjI4IDE2LjQzNjMgMTguNzE0OCAxNS4yNjYgMTguOTQ4MyAxNC4zMjk5TDE4Ljk3MDEgMTQuMjQyNUMxOS4yMzI3IDEzLjE5MjQgMTkuNDQ0MiAxMi40MDc3IDE5Ljg2MjUgMTEuODVDMjAuMjA3MyAxMS4zOTAyIDIwLjc2MzQgMTEgMjIgMTFIMjguMDAwNUMyOS42NTcyIDExIDMxIDEyLjM0MyAzMSAxNEMzMSAxNS42NTY5IDI5LjY1NjkgMTcgMjggMTdIMjJDMjEuMjI0IDE3IDIwLjcxNiAxNi44NDYzIDIwLjM2IDE2LjYxODJDMjAuMTQxMSAxNy4yMDYgMTkuODQ4MyAxNy44MjkxIDE5LjQ0NSAxOC40MDJDMjAuMTIwMyAxOC43ODg1IDIwLjk2MTQgMTkgMjIgMTlIMjhDMzAuNzYxNCAxOSAzMyAxNi43NjE0IDMzIDE0QzMzIDExLjIzODggMzAuNzYyMSA5IDI4LjAwMDUgOUgyMkMyMC4yMzY2IDkgMTkuMDQyNyA5LjYwOTc5IDE4LjI2MjUgMTAuNjVDMTcuNTc3MiAxMS41NjM3IDE3LjI4NTIgMTIuNzM0IDE3LjA1MTcgMTMuNjcwMUwxNy4wMjk5IDEzLjc1NzVDMTYuNzY3MyAxNC44MDc2IDE2LjU1NTggMTUuNTkyMyAxNi4xMzc1IDE2LjE1QzE1Ljc5MjcgMTYuNjA5OCAxNS4yMzY2IDE3IDE0IDE3SDcuOTk5MjZDNi4zNDI2NSAxNyA1IDE1LjY1NzEgNSAxNFoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTcgMjMuNUM2LjcxNjY3IDIzLjUgNi40NzUgMjMuNDA4MyA2LjI3NSAyMy4yMjVDNi4wOTE2NyAyMy4wMjUgNiAyMi43ODMzIDYgMjIuNUM2IDIyLjIxNjcgNi4wOTE2NyAyMS45ODMzIDYuMjc1IDIxLjhDNi40NzUgMjEuNiA2LjcxNjY3IDIxLjUgNyAyMS41SDEyQzEyLjI4MzMgMjEuNSAxMi41MTY3IDIxLjYgMTIuNyAyMS44QzEyLjkgMjEuOTgzMyAxMyAyMi4yMTY3IDEzIDIyLjVDMTMgMjIuNzgzMyAxMi45IDIzLjAyNSAxMi43IDIzLjIyNUMxMi41MTY3IDIzLjQwODMgMTIuMjgzMyAyMy41IDEyIDIzLjVIN1pNNSAyNy41QzQuNzE2NjcgMjcuNSA0LjQ3NSAyNy40MDgzIDQuMjc1IDI3LjIyNUM0LjA5MTY3IDI3LjAyNSA0IDI2Ljc4MzMgNCAyNi41QzQgMjYuMjE2NyA0LjA5MTY3IDI1Ljk4MzMgNC4yNzUgMjUuOEM0LjQ3NSAyNS42IDQuNzE2NjcgMjUuNSA1IDI1LjVIOEM4LjI4MzMzIDI1LjUgOC41MTY2NyAyNS42IDguNyAyNS44QzguOSAyNS45ODMzIDkgMjYuMjE2NyA5IDI2LjVDOSAyNi43ODMzIDguOSAyNy4wMjUgOC43IDI3LjIyNUM4LjUxNjY3IDI3LjQwODMgOC4yODMzMyAyNy41IDggMjcuNUg1Wk0xMiAyNy41QzExLjcxNjcgMjcuNSAxMS40NzUgMjcuNDA4MyAxMS4yNzUgMjcuMjI1QzExLjA5MTcgMjcuMDI1IDExIDI2Ljc4MzMgMTEgMjYuNUMxMSAyNi4yMTY3IDExLjA5MTcgMjUuOTgzMyAxMS4yNzUgMjUuOEMxMS40NzUgMjUuNiAxMS43MTY3IDI1LjUgMTIgMjUuNUgyMEMyMC4yODMzIDI1LjUgMjAuNTE2NyAyNS42IDIwLjcgMjUuOEMyMC45IDI1Ljk4MzMgMjEgMjYuMjE2NyAyMSAyNi41QzIxIDI2Ljc4MzMgMjAuOSAyNy4wMjUgMjAuNyAyNy4yMjVDMjAuNTE2NyAyNy40MDgzIDIwLjI4MzMgMjcuNSAyMCAyNy41SDEyWk0yOCAyNy41QzI3LjcxNjcgMjcuNSAyNy40NzUgMjcuNDA4MyAyNy4yNzUgMjcuMjI1QzI3LjA5MTcgMjcuMDI1IDI3IDI2Ljc4MzMgMjcgMjYuNUMyNyAyNi4yMTY3IDI3LjA5MTcgMjUuOTgzMyAyNy4yNzUgMjUuOEMyNy40NzUgMjUuNiAyNy43MTY3IDI1LjUgMjggMjUuNUgzMkMzMi4yODMzIDI1LjUgMzIuNTE2NyAyNS42IDMyLjcgMjUuOEMzMi45IDI1Ljk4MzMgMzMgMjYuMjE2NyAzMyAyNi41QzMzIDI2Ljc4MzMzMi45IDI3LjAyNSAzMi43IDI3LjIyNUMzMi41MTY3IDI3LjQwODMgMzIuMjgzMyAyNy41IDMyIDI3LjVIMjhaTTE2IDIzLjVDMTUuNzE2NyAyMy41IDE1LjQ3NSAyMy40MDgzIDE1LjI3NSAyMy4yMjVDMTUuMDkxNyAyMy4wMjUgMTUgMjIuNzgzMyAxNSAyMi41QzE1IDIyLjIxNjcgMTUuMDkxNyAyMS45ODMzIDE1LjI3NSAyMS44QzE1LjQ3NSAyMS42IDE1LjcxNjcgMjEuNSAxNiAyMS41QzE2LjI4MzMgMjEuNSAxNi41MTY3IDIxLjYgMTYuNyAyMS44QzE2LjkgMjEuOTgzMyAxNyAyMi4yMTY3IDE3IDIyLjVDMTcgMjIuNzgzMyAxNi45IDIzLjAyNSAxNi43IDIzLjIyNUMxNi41MTY3IDIzLjQwODMgMTYuMjgzMyAyMy41IDE2IDIzLjVaTTI0IDI3LjVDMjMuNzE2NyAyNy41IDIzLjQ3NSAyNy40MDgzIDIzLjI3NSAyNy4yMjVDMjMuMDkxNyAyNy4wMjUgMjMgMjYuNzgzMyAyMyAyNi41QzIzIDI2LjIxNjcgMjMuMDkxNyAyNS45ODMzIDIzLjI3NSAyNS44QzIzLjQ3NSAyNS42IDIzLjcxNjcgMjUuNSAyNCAyNS41QzI0LjI4MzMgMjUuNSAyNC41MTY3IDI1LjYgMjQuNyAyNS44QzI0LjkgMjUuOTgzMyAyNSAyNi4yMTY3IDI1IDI2LjVDMjUgMjYuNzgzMyAyNC45IDI3LjAyNSAyNC43IDI3LjIyNUMyNC41MTY3IDI3LjQwODMgMjQuMjgzMyAyNy41IDI0IDI3LjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0xOS4yNzUgMjMuMjI1QzE5LjQ3NSAyMy40MDgzIDE5LjcxNjcgMjMuNSAyMCAyMy41SDIzQzIzLjI4MzMgMjMuNSAyMy41MTY3IDIzLjQwODMgMjMuNyAyMy4yMjVDMjMuOSAyMy4wMjUgMjQgMjIuNzgzMyAyNCAyMi41QzI0IDIyLjIxNjcgMjMuOSAyMS45ODMzIDIzLjcgMjEuOEMyMy41MTY3IDIxLjYgMjMuMjgzMyAyMS41IDIzIDIxLjVIMjBDMTkuNzE2NyAyMS41IDE5LjQ3NSAyMS42IDE5LjI3NSAyMS44QzE5LjA5MTcgMjEuOTgzMyAxOSAyMi4yMTY3IDE5IDIyLjVDMTkgMjIuNzgzMyAxOS4wOTE3IDIzLjAyNSAxOS4yNzUgMjMuMjI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMjYuMjc1IDIzLjIyNUMyNi40NzUgMjMuNDA4MyAyNi43MTY3IDIzLjUgMjcgMjMuNUgzMEMzMC4yODMzIDIzLjUgMzAuNTE2NyAyMy40MDgzIDMwLjcgMjMuMjI1QzMwLjkgMjMuMDI1IDMxIDIyLjc4MzMgMzEgMjIuNUMzMSAyMi4yMTY3IDMwLjkgMjEuOTgzMyAzMC43IDIxLjhDMzAuNTE2NyAyMS42IDMwLjI4MzMgMjEuNSAzMCAyMS41SDI3QzI2LjcxNjcgMjEuNSAyNi40NzUgMjEuNiAyNi4yNzUgMjEuOEMyNi4wOTE3IDIxLjk4MzMgMjYgMjIuMjE2NyAyNiAyMi41QzI2IDIyLjc4MzMgMjYuMDkxNyAyMy4wMjUgMjYuMjc1IDIzLjIyNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "clientResponse"
      },
      {},
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.EmbeddingsVectorDB.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "query",
          "label": "Query"
        },
        {
          "id": "embeddingModel",
          "label": "Embedding model"
        },
        {
          "id": "embeddingsStore",
          "label": "Vector store"
        },
        {
          "id": "document",
          "label": "Document"
        },
        {
          "id": "connector",
          "label": "Connector"
        },
        {
          "id": "output",
          "label": "Output mapping"
        },
        {
          "id": "error",
          "label": "Error handling"
        },
        {
          "id": "retries",
          "label": "Retries"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjAxIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6bXVsdGlwbHkiLz4KPHBhdGggZD0iTTI1NS45OTkgMTM2LjcwMkMxOTMuMzE4IDEzNi43MDIgMTI1Ljg1NSAxNTEuNDg1IDEyNS44NTUgMTgzLjkzM1YzOTYuNDc1QzEyNS44NTUgNDI4LjkyMyAxOTMuMzE4IDQ0My43MDcgMjU1Ljk5OSA0NDMuNzA3QzMxOC42NzkgNDQzLjcwNyAzODYuMTQyIDQyOC45MjMgMzg2LjE0MiAzOTYuNDc1VjE4My45MzNDMzg2LjE0MiAxNTEuNDg1IDMxOC42NzkgMTM2LjcwMiAyNTUuOTk5IDEzNi43MDJaTTI1NS45OTkgMTYwLjMxOEMzMjQuNTkxIDE2MC4zMTggMzYwLjA1MyAxNzcuMjUxIDM2Mi40NDIgMTgzLjkzM0MzNjAuMDUzIDE5MC42MTUgMzI0LjU5MSAyMDcuNTQ5IDI1NS45OTkgMjA3LjU0OUMxODYuODg5IDIwNy41NDkgMTUxLjQxOCAxOTAuMzYyIDE0OS41MTggMTg0LjE0MVYxODQuMDgzQzE1MS40MTggMTc3LjUwNSAxODYuODg5IDE2MC4zMTggMjU1Ljk5OSAxNjAuMzE4Wk0xNDkuNTE4IDIxMi41OTlDMTc0LjY5NCAyMjUuMjAzIDIxNi4yNzcgMjMxLjE2NSAyNTUuOTk5IDIzMS4xNjVDMjk1LjcyMSAyMzEuMTY1IDMzNy4zMDQgMjI1LjIwMyAzNjIuNDggMjEyLjU5OVYyNTQuNjMxQzM2MC41OCAyNjEuMjA5IDMyNS4xMDggMjc4LjM5NiAyNTUuOTk5IDI3OC4zOTZDMTg2Ljc4NSAyNzguMzk2IDE1MS4zMDMgMjYxLjE1NyAxNDkuNTE4IDI1NC43ODFWMjEyLjU5OVpNMTQ5LjUxOCAyODMuNDQ3QzE3NC42OTQgMjk2LjA1IDIxNi4yNzcgMzAyLjAxMiAyNTUuOTk5IDMwMi4wMTJDMjk1LjcyMSAzMDIuMDEyIDMzNy4zMDQgMjk2LjA1IDM2Mi40OCAyODMuNDQ3VjMyNS40NzhDMzYwLjU4IDMzMi4wNTYgMzI1LjEwOCAzNDkuMjQ0IDI1NS45OTkgMzQ5LjI0NEMxODYuNzg1IDM0OS4yNDQgMTUxLjMwMyAzMzIuMDA0IDE0OS41MTggMzI1LjYyOFYyODMuNDQ3Wk0yNTUuOTk5IDQyMC4wOTFDMTg2Ljc4NSA0MjAuMDkxIDE1MS4zMDMgNDAyLjg1MSAxNDkuNTE4IDM5Ni40NzVWMzU0LjI5NEMxNzQuNjk0IDM2Ni44OTggMjE2LjI3NyAzNzIuODU5IDI1NS45OTkgMzcyLjg1OUMyOTUuNzIxIDM3Mi44NTkgMzM3LjMwNCAzNjYuODk4IDM2Mi40OCAzNTQuMjk0VjM5Ni4zMjVDMzYwLjU4IDQwMi45MDMgMzI1LjEwOCA0MjAuMDkxIDI1NS45OTkgNDIwLjA5MVoiIGZpbGw9IiNGQzVEMEQiIHN0cm9rZT0iI0ZDNUQwRCIgc3Ryb2tlLXdpZHRoPSI2LjY3NDAyIi8+CjxwYXRoIGQ9Ik0zODcuODYgMzk5Ljg4M0wzNzQuNTMxIDQxMy4yMTFMNDQ2Ljg4NiA0ODUuNTY2SDM4NC4wNTJWNTA0LjYwN0g0NzkuMjU2VjQwOS40MDNINDYwLjIxNVY0NzIuMjM4TDM4Ny44NiAzOTkuODgzWiIgZmlsbD0iI0ZDNUQwRCIgc3Ryb2tlPSIjRkM1RDBEIiBzdHJva2Utd2lkdGg9IjguMzQyNTIiLz4KPHBhdGggZD0iTTEyNC4xMzggMzk5Ljg4M0wxMzcuNDY3IDQxMy4yMTFMNjUuMTExNiA0ODUuNTY2SDEyNy45NDZWNTA0LjYwN0gzMi43NDIyVjQwOS40MDNINTEuNzgzVjQ3Mi4yMzhMMTI0LjEzOCAzOTkuODgzWiIgZmlsbD0iI0ZDNUQwRCIgc3Ryb2tlPSIjRkM1RDBEIiBzdHJva2Utd2lkdGg9IjguMzQyNTIiLz4KPHBhdGggZD0iTTI0Ni41NzUgMTQ2LjA3MUgyNjUuNDI1VjQzLjc0NTNMMzA5Ljg1NiA4OC4xNzYxTDMyMy4zMTkgNzQuNzEyMkwyNTYgNy4zOTI4MkwxODguNjgxIDc0LjcxMjJMMjAyLjE0NCA4OC4xNzYxTDI0Ni41NzUgNDMuNzQ1M1YxNDYuMDcxWiIgZmlsbD0iI0ZDNUQwRCIgc3Ryb2tlPSIjRkM1RDBEIiBzdHJva2Utd2lkdGg9IjguMzQyNTIiLz4KPC9zdmc+Cg=="
      }
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "query"
      },
      {
        "group": "query"
      },
      {
        "group": "query"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel"
      },
      {
        "group": "embeddingModel",
        "tooltip": "Base URL of OpenAI API. The default is 'https://api.openai.com/v1/'"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "embeddingsStore"
      },
      {
        "group": "document"
      },
      {
        "group": "document"
      },
      {
        "group": "document"
      },
      {
        "group": "document"
      },
      {
        "group": "document"
      },
      {
        "group": "document"
      },
      {
        "group": "connector"
      },
      {
        "group": "connector"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "error"
      },
      {
        "group": "retries"
      },
      {
        "group": "retries"
      }
    ]
  },
  "io.camunda.connectors.webhook.WebhookConnectorReceive.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "webhookResponse",
          "label": "Webhook response"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyBpZD0naWNvbicgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nMTgnIGhlaWdodD0nMTgnIHZpZXdCb3g9JzAgMCAzMiAzMic+CiAgPGRlZnM+CiAgICA8c3R5bGU+LmNscy0xIHsgZmlsbDogbm9uZTsgfTwvc3R5bGU+CiAgPC9kZWZzPgogIDxwYXRoCiAgICBkPSdNMjQsMjZhMywzLDAsMSwwLTIuODE2NC00SDEzdjFhNSw1LDAsMSwxLTUtNVYxNmE3LDcsMCwxLDAsNi45Mjg3LDhoNi4yNTQ5QTIuOTkxNCwyLjk5MTQsMCwwLDAsMjQsMjZaJy8+CiAgPHBhdGgKICAgIGQ9J00yNCwxNmE3LjAyNCw3LjAyNCwwLDAsMC0yLjU3LjQ4NzNsLTMuMTY1Ni01LjUzOTVhMy4wNDY5LDMuMDQ2OSwwLDEsMC0xLjczMjYuOTk4NWw0LjExODksNy4yMDg1Ljg2ODYtLjQ5NzZhNS4wMDA2LDUuMDAwNiwwLDEsMS0xLjg1MSw2Ljg0MThMMTcuOTM3LDI2LjUwMUE3LjAwMDUsNy4wMDA1LDAsMSwwLDI0LDE2WicvPgogIDxwYXRoCiAgICBkPSdNOC41MzIsMjAuMDUzN2EzLjAzLDMuMDMsMCwxLDAsMS43MzI2Ljk5ODVDMTEuNzQsMTguNDcsMTMuODYsMTQuNzYwNywxMy44OSwxNC43MDhsLjQ5NzYtLjg2ODItLjg2NzctLjQ5N2E1LDUsMCwxLDEsNi44MTItMS44NDM4bDEuNzMxNSwxLjAwMmE3LjAwMDgsNy4wMDA4LDAsMSwwLTEwLjM0NjIsMi4wMzU2Yy0uNDU3Ljc0MjctMS4xMDIxLDEuODcxNi0yLjA3MzcsMy41NzI4WicvPgogIDxyZWN0IGlkPSdfVHJhbnNwYXJlbnRfUmVjdGFuZ2xlXycgZGF0YS1uYW1lPScmbHQ7VHJhbnNwYXJlbnQgUmVjdGFuZ2xlJmd0OycgY2xhc3M9J2Nscy0xJwogICAgd2lkdGg9JzMyJyBoZWlnaHQ9JzMyJy8+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "webhookResponse"
      },
      {
        "group": "webhookResponse"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation",
        "tooltip": "Unmatched events are rejected by default, allowing the upstream service to handle the error. Check this box to consume unmatched events and return a success response"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.agenticai.a2a.client.polling.intermediate.v0": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "metadata": {
        "keywords": []
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "connection",
          "label": "Connection"
        },
        {
          "id": "clientResponse",
          "label": "Client Response"
        },
        {
          "id": "options",
          "label": "Options",
          "openByDefault": false
        },
        {
          "id": "polling",
          "label": "Polling",
          "openByDefault": false
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Correlation",
          "tooltip": "Learn more about message correlation in the <a href=\"https://docs.camunda.io/docs/components/concepts/messages/#message-correlation-overview\">documentation</a>."
        },
        {
          "id": "deduplication",
          "label": "Deduplication",
          "tooltip": "Deduplication allows you to configure multiple inbound connector elements to reuse the same backend (consumer/thread/endpoint) by sharing the same deduplication ID."
        },
        {
          "id": "output",
          "label": "Output mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMTguNSIgdmlld0JveD0iMyA5IDMwIDE4LjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHBhdGggZD0iTTguNyAxNC43MjVDOC41MTY2NyAxNC45MDgzIDguMjgzMzMgMTUgOCAxNUM3LjcxNjY3IDE1IDcuNDc1IDE0LjkwODMgNy4yNzUgMTQuNzI1QzcuMDkxNjcgMTQuNTI1IDcgMTQuMjgzMyA3IDE0QzcgMTMuNzE2NyA3LjA5MTY3IDEzLjQ4MzMgNy4yNzUgMTMuM0M3LjQ3NSAxMy4xIDcuNzE2NjcgMTMgOCAxM0M4LjI4MzMzIDEzIDguNTE2NjcgMTMuMSA4LjcgMTMuM0M4LjkgMTMuNDgzMyA5IDEzLjcxNjcgOSAxNEM5IDE0LjI4MzMgOC45IDE0LjUyNSA4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMTQuNyAxNC43MjVDMTQuNTE2NyAxNC45MDgzIDE0LjI4MzMgMTUgMTQgMTVDMTMuNzE2NyAxNSAxMy40NzUgMTQuOTA4MyAxMy4yNzUgMTQuNzI1QzEzLjA5MTcgMTQuNTI1IDEzIDE0LjI4MzMgMTMgMTRDMTMgMTMuNzE2NyAxMy4wOTE3IDEzLjQ4MzMgMTMuMjc1IDEzLjNDMTMuNDc1IDEzLjEgMTMuNzE2NyAxMyAxNCAxM0MxNC4yODMzIDEzIDE0LjUxNjcgMTMuMSAxNC43IDEzLjNDMTQuOSAxMy40ODMzIDE1IDEzLjcxNjcgMTUgMTRDMTUgMTQuMjgzMyAxNC45IDE0LjUyNSAxNC43IDE0LjcyNVoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTIyLjcgMTQuNzI1QzIyLjUxNjcgMTQuOTA4MyAyMi4yODMzIDE1IDIyIDE1QzIxLjcxNjcgMTUgMjEuNDc1IDE0LjkwODMgMjEuMjc1IDE0LjcyNUMyMS4wOTE3IDE0LjUyNSAyMSAxNC4yODMzIDIxIDE0QzIxIDEzLjcxNjcgMjEuMDkxNyAxMy40ODMzIDIxLjI3NSAxMy4zQzIxLjQ3NSAxMy4xIDIxLjcxNjcgMTMgMjIgMTNDMjIuMjgzMyAxMyAyMi41MTY3IDEzLjEgMjIuNyAxMy4zQzIyLjkgMTMuNDgzMyAyMyAxMy43MTY3IDIzIDE0QzIzIDE0LjI4MzMgMjIuOSAxNC41MjUgMjIuNyAxNC43MjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0yOC43IDE0LjcyNUMyOC41MTY3IDE0LjkwODMgMjguMjgzMyAxNSAyOCAxNUMyNy43MTY3IDE1IDI3LjQ3NSAxNC45MDgzIDI3LjI3NSAxNC43MjVDMjcuMDkxNyAxNC41MjUgMjcgMTQuMjgzMyAyNyAxNEMyNyAxMy43MTY3IDI3LjA5MTcgMTMuNDgzMyAyNy4yNzUgMTMuM0MyNy40NzUgMTMuMSAyNy43MTY3IDEzIDI4IDEzQzI4LjI4MzMgMTMgMjguNTE2NyAxMy4xIDI4LjcgMTMuM0MyOC45IDEzLjQ4MzMgMjkgMTMuNzE2NyAyOSAxNEMyOSAxNC4yODMzIDI4LjkgMTQuNTI1IDI4LjcgMTQuNzI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTUgMTRDNSAxMi4zNDMxIDYuMzQzMTUgMTEgOCAxMUgxNEMxNC43NzYgMTEgMTUuMjg0IDExLjE1MzcgMTUuNjQgMTEuMzgxOEMxNS44NTg5IDEwLjc5NCAxNi4xNTE3IDEwLjE3MDkgMTYuNTU1IDkuNTk3OTVDMTUuODc5NyA5LjIxMTUzIDE1LjAzODYgOSAxNCA5SDhDNS4yMzg1OCA5IDMgMTEuMjM4NiAzIDE0QzMgMTYuNzYxMiA1LjIzNzU5IDE5IDcuOTk5MjYgMTlIMTRDMTUuNzYzNCAxOSAxNi45NTczIDE4LjM5MDIgMTcuNzM3NSAxNy4zNUMxOC40MjI4IDE2LjQzNjMgMTguNzE0OCAxNS4yNjYgMTguOTQ4MyAxNC4zMjk5TDE4Ljk3MDEgMTQuMjQyNUMxOS4yMzI3IDEzLjE5MjQgMTkuNDQ0MiAxMi40MDc3IDE5Ljg2MjUgMTEuODVDMjAuMjA3MyAxMS4zOTAyIDIwLjc2MzQgMTEgMjIgMTFIMjguMDAwNUMyOS42NTcyIDExIDMxIDEyLjM0MyAzMSAxNEMzMSAxNS42NTY5IDI5LjY1NjkgMTcgMjggMTdIMjJDMjEuMjI0IDE3IDIwLjcxNiAxNi44NDYzIDIwLjM2IDE2LjYxODJDMjAuMTQxMSAxNy4yMDYgMTkuODQ4MyAxNy44MjkxIDE5LjQ0NSAxOC40MDJDMjAuMTIwMyAxOC43ODg1IDIwLjk2MTQgMTkgMjIgMTlIMjhDMzAuNzYxNCAxOSAzMyAxNi43NjE0IDMzIDE0QzMzIDExLjIzODggMzAuNzYyMSA5IDI4LjAwMDUgOUgyMkMyMC4yMzY2IDkgMTkuMDQyNyA5LjYwOTc5IDE4LjI2MjUgMTAuNjVDMTcuNTc3MiAxMS41NjM3IDE3LjI4NTIgMTIuNzM0IDE3LjA1MTcgMTMuNjcwMUwxNy4wMjk5IDEzLjc1NzVDMTYuNzY3MyAxNC44MDc2IDE2LjU1NTggMTUuNTkyMyAxNi4xMzc1IDE2LjE1QzE1Ljc5MjcgMTYuNjA5OCAxNS4yMzY2IDE3IDE0IDE3SDcuOTk5MjZDNi4zNDI2NSAxNyA1IDE1LjY1NzEgNSAxNFoiIGZpbGw9ImJsYWNrIi8+CiAgPHBhdGggZD0iTTcgMjMuNUM2LjcxNjY3IDIzLjUgNi40NzUgMjMuNDA4MyA2LjI3NSAyMy4yMjVDNi4wOTE2NyAyMy4wMjUgNiAyMi43ODMzIDYgMjIuNUM2IDIyLjIxNjcgNi4wOTE2NyAyMS45ODMzIDYuMjc1IDIxLjhDNi40NzUgMjEuNiA2LjcxNjY3IDIxLjUgNyAyMS41SDEyQzEyLjI4MzMgMjEuNSAxMi41MTY3IDIxLjYgMTIuNyAyMS44QzEyLjkgMjEuOTgzMyAxMyAyMi4yMTY3IDEzIDIyLjVDMTMgMjIuNzgzMyAxMi45IDIzLjAyNSAxMi43IDIzLjIyNUMxMi41MTY3IDIzLjQwODMgMTIuMjgzMyAyMy41IDEyIDIzLjVIN1pNNSAyNy41QzQuNzE2NjcgMjcuNSA0LjQ3NSAyNy40MDgzIDQuMjc1IDI3LjIyNUM0LjA5MTY3IDI3LjAyNSA0IDI2Ljc4MzMgNCAyNi41QzQgMjYuMjE2NyA0LjA5MTY3IDI1Ljk4MzMgNC4yNzUgMjUuOEM0LjQ3NSAyNS42IDQuNzE2NjcgMjUuNSA1IDI1LjVIOEM4LjI4MzMzIDI1LjUgOC41MTY2NyAyNS42IDguNyAyNS44QzguOSAyNS45ODMzIDkgMjYuMjE2NyA5IDI2LjVDOSAyNi43ODMzIDguOSAyNy4wMjUgOC43IDI3LjIyNUM4LjUxNjY3IDI3LjQwODMgOC4yODMzMyAyNy41IDggMjcuNUg1Wk0xMiAyNy41QzExLjcxNjcgMjcuNSAxMS40NzUgMjcuNDA4MyAxMS4yNzUgMjcuMjI1QzExLjA5MTcgMjcuMDI1IDExIDI2Ljc4MzMgMTEgMjYuNUMxMSAyNi4yMTY3IDExLjA5MTcgMjUuOTgzMyAxMS4yNzUgMjUuOEMxMS40NzUgMjUuNiAxMS43MTY3IDI1LjUgMTIgMjUuNUgyMEMyMC4yODMzIDI1LjUgMjAuNTE2NyAyNS42IDIwLjcgMjUuOEMyMC45IDI1Ljk4MzMgMjEgMjYuMjE2NyAyMSAyNi41QzIxIDI2Ljc4MzMgMjAuOSAyNy4wMjUgMjAuNyAyNy4yMjVDMjAuNTE2NyAyNy40MDgzIDIwLjI4MzMgMjcuNSAyMCAyNy41SDEyWk0yOCAyNy41QzI3LjcxNjcgMjcuNSAyNy40NzUgMjcuNDA4MyAyNy4yNzUgMjcuMjI1QzI3LjA5MTcgMjcuMDI1IDI3IDI2Ljc4MzMgMjcgMjYuNUMyNyAyNi4yMTY3IDI3LjA5MTcgMjUuOTgzMyAyNy4yNzUgMjUuOEMyNy40NzUgMjUuNiAyNy43MTY3IDI1LjUgMjggMjUuNUgzMkMzMi4yODMzIDI1LjUgMzIuNTE2NyAyNS42IDMyLjcgMjUuOEMzMi45IDI1Ljk4MzMgMzMgMjYuMjE2NyAzMyAyNi41QzMzIDI2Ljc4MzMzMi45IDI3LjAyNSAzMi43IDI3LjIyNUMzMi41MTY3IDI3LjQwODMgMzIuMjgzMyAyNy41IDMyIDI3LjVIMjhaTTE2IDIzLjVDMTUuNzE2NyAyMy41IDE1LjQ3NSAyMy40MDgzIDE1LjI3NSAyMy4yMjVDMTUuMDkxNyAyMy4wMjUgMTUgMjIuNzgzMyAxNSAyMi41QzE1IDIyLjIxNjcgMTUuMDkxNyAyMS45ODMzIDE1LjI3NSAyMS44QzE1LjQ3NSAyMS42IDE1LjcxNjcgMjEuNSAxNiAyMS41QzE2LjI4MzMgMjEuNSAxNi41MTY3IDIxLjYgMTYuNyAyMS44QzE2LjkgMjEuOTgzMyAxNyAyMi4yMTY3IDE3IDIyLjVDMTcgMjIuNzgzMyAxNi45IDIzLjAyNSAxNi43IDIzLjIyNUMxNi41MTY3IDIzLjQwODMgMTYuMjgzMyAyMy41IDE2IDIzLjVaTTI0IDI3LjVDMjMuNzE2NyAyNy41IDIzLjQ3NSAyNy40MDgzIDIzLjI3NSAyNy4yMjVDMjMuMDkxNyAyNy4wMjUgMjMgMjYuNzgzMyAyMyAyNi41QzIzIDI2LjIxNjcgMjMuMDkxNyAyNS45ODMzIDIzLjI3NSAyNS44QzIzLjQ3NSAyNS42IDIzLjcxNjcgMjUuNSAyNCAyNS41QzI0LjI4MzMgMjUuNSAyNC41MTY3IDI1LjYgMjQuNyAyNS44QzI0LjkgMjUuOTgzMyAyNSAyNi4yMTY3IDI1IDI2LjVDMjUgMjYuNzgzMyAyNC45IDI3LjAyNSAyNC43IDI3LjIyNUMyNC41MTY3IDI3LjQwODMgMjQuMjgzMyAyNy41IDI0IDI3LjVaIiBmaWxsPSJibGFjayIvPgogIDxwYXRoIGQ9Ik0xOS4yNzUgMjMuMjI1QzE5LjQ3NSAyMy40MDgzIDE5LjcxNjcgMjMuNSAyMCAyMy41SDIzQzIzLjI4MzMgMjMuNSAyMy41MTY3IDIzLjQwODMgMjMuNyAyMy4yMjVDMjMuOSAyMy4wMjUgMjQgMjIuNzgzMyAyNCAyMi41QzI0IDIyLjIxNjcgMjMuOSAyMS45ODMzIDIzLjcgMjEuOEMyMy41MTY3IDIxLjYgMjMuMjgzMyAyMS41IDIzIDIxLjVIMjBDMTkuNzE2NyAyMS41IDE5LjQ3NSAyMS42IDE5LjI3NSAyMS44QzE5LjA5MTcgMjEuOTgzMyAxOSAyMi4yMTY3IDE5IDIyLjVDMTkgMjIuNzgzMyAxOS4wOTE3IDIzLjAyNSAxOS4yNzUgMjMuMjI1WiIgZmlsbD0iYmxhY2siLz4KICA8cGF0aCBkPSJNMjYuMjc1IDIzLjIyNUMyNi40NzUgMjMuNDA4MyAyNi43MTY3IDIzLjUgMjcgMjMuNUgzMEMzMC4yODMzIDIzLjUgMzAuNTE2NyAyMy40MDgzIDMwLjcgMjMuMjI1QzMwLjkgMjMuMDI1IDMxIDIyLjc4MzMgMzEgMjIuNUMzMSAyMi4yMTY3IDMwLjkgMjEuOTgzMyAzMC43IDIxLjhDMzAuNTE2NyAyMS42IDMwLjI4MzMgMjEuNSAzMCAyMS41SDI3QzI2LjcxNjcgMjEuNSAyNi40NzUgMjEuNiAyNi4yNzUgMjEuOEMyNi4wOTE3IDIxLjk4MzMgMjYgMjIuMjE2NyAyNiAyMi41QzI2IDIyLjc4MzMgMjYuMDkxNyAyMy4wMjUgMjYuMjc1IDIzLjIyNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPg=="
      }
    },
    "properties": [
      {},
      {
        "group": "connection"
      },
      {
        "group": "connection"
      },
      {
        "group": "clientResponse"
      },
      {},
      {
        "group": "options"
      },
      {
        "group": "polling"
      },
      {
        "group": "polling"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "deduplication"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      }
    ]
  },
  "io.camunda.connectors.HuggingFace.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "input",
          "label": "Payload"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 513 512'%3E%3Cg clip-path='url(%23a)'%3E%3Cpath fill='%23fff' d='M506.934 365.286a46.337 46.337 0 0 0-6.289-13.902 52.752 52.752 0 0 0 1.387-6.817c2.025-14.595-3.036-27.957-12.571-38.296-5.165-5.646-10.702-9.376-16.566-11.664a221.309 221.309 0 0 0 5.805-50.235c0-7.725-.437-15.292-1.17-22.746a257.431 257.431 0 0 0-1.385-11.137 222.299 222.299 0 0 0-7.451-32.263 222.98 222.98 0 0 0-7.459-20.453 224.51 224.51 0 0 0-14.755-28.707 198.667 198.667 0 0 0-11.984-17.737 168.954 168.954 0 0 0-6.604-8.416 221.184 221.184 0 0 0-22.062-23.168 171.17 171.17 0 0 0-8.097-6.99 199.806 199.806 0 0 0-8.362-6.604 234.582 234.582 0 0 0-17.737-11.985C337.976 33.723 298.505 22 256.318 22 133.487 22 33.936 121.556 33.936 244.379a221.213 221.213 0 0 0 5.91 50.86c-5.275 2.291-10.33 5.862-15.02 11.027-9.532 10.334-14.595 23.647-12.57 38.243a52.166 52.166 0 0 0 1.384 6.87 46.418 46.418 0 0 0-6.284 13.907c-2.93 11.14-1.966 21.185 1.759 29.987-4.05 11.504-3.039 23.755 2.234 34.406 3.835 7.779 9.323 13.797 16.088 19.175 8.043 6.394 18.11 11.826 30.254 17.038 14.488 6.179 32.173 11.984 40.216 14.114 20.774 5.378 40.694 8.788 60.883 8.954 28.763.266 53.534-6.497 71.268-23.806a215.013 215.013 0 0 0 26.26 1.598c9.274-.02 18.538-.604 27.741-1.747 17.692 17.419 42.558 24.243 71.426 23.97 20.187-.162 40.106-3.571 60.827-8.957 8.097-2.129 25.775-7.935 40.27-14.114 12.143-5.219 22.211-10.651 30.307-17.035 6.714-5.381 12.197-11.397 16.034-19.175 5.327-10.654 6.285-22.905 2.291-34.408 3.688-8.803 4.648-18.87 1.72-30Zm-20.614 29.242c4.081 7.745 4.343 16.496.743 24.646-5.461 12.351-19.026 22.082-45.372 32.528-16.383 6.496-31.384 10.651-31.516 10.687-21.669 5.62-41.266 8.475-58.231 8.475-28.092 0-48.996-7.752-62.253-23.06a208.74 208.74 0 0 1-67.769.386c-13.274 15.054-34.058 22.674-61.913 22.674-16.968 0-36.563-2.855-58.234-8.475-.132-.036-15.128-4.191-31.516-10.687-26.343-10.446-39.913-20.169-45.372-32.528-3.6-8.15-3.338-16.901.743-24.646.376-.72.781-1.421 1.214-2.1a31.265 31.265 0 0 1-4.22-25.256c1.621-6.163 4.97-11.287 9.517-14.967a31.144 31.144 0 0 1-4.225-11.777c-1.31-9.071 1.702-18.127 8.475-25.513 5.275-5.747 12.732-8.91 20.987-8.91h.22a206.258 206.258 0 0 1-9.36-61.633c0-113.987 92.41-206.404 206.414-206.404 114.003 0 206.412 92.407 206.412 206.404a206.15 206.15 0 0 1-9.425 61.789 31.245 31.245 0 0 1 2.933-.149c8.255 0 15.714 3.163 20.985 8.91 6.772 7.378 9.786 16.442 8.475 25.513a31.161 31.161 0 0 1-4.223 11.777c4.548 3.681 7.899 8.805 9.518 14.967a31.274 31.274 0 0 1-4.221 25.256c.433.672.843 1.373 1.214 2.093Z'/%3E%3Cpath fill='%23FF9D00' d='M485.106 392.435a31.25 31.25 0 0 0 4.817-12.175 31.325 31.325 0 0 0-.596-13.081c-1.622-6.162-4.973-11.286-9.518-14.967a31.11 31.11 0 0 0 4.223-11.777c1.311-9.071-1.7-18.127-8.475-25.513-5.271-5.747-12.73-8.91-20.985-8.91-.96 0-1.937.052-2.933.149a206.18 206.18 0 0 0 9.408-61.784c0-113.99-92.41-206.404-206.402-206.404-113.995 0-206.414 92.405-206.414 206.404a206.284 206.284 0 0 0 9.36 61.633h-.22c-8.256 0-15.712 3.16-20.985 8.907-6.773 7.379-9.787 16.445-8.475 25.513a31.167 31.167 0 0 0 4.225 11.78c-4.548 3.678-7.898 8.802-9.52 14.964a31.284 31.284 0 0 0 4.225 25.261c-.435.679-.835 1.38-1.214 2.101-4.079 7.744-4.342 16.495-.74 24.646 5.461 12.351 19.026 22.081 45.372 32.527 16.38 6.497 31.384 10.651 31.516 10.688 21.669 5.62 41.266 8.475 58.231 8.475 27.858 0 48.642-7.62 61.916-22.675a208.823 208.823 0 0 0 67.769-.386c13.257 15.309 34.161 23.061 62.253 23.061 16.965 0 36.562-2.855 58.228-8.475.135-.037 15.131-4.191 31.519-10.688 26.346-10.446 39.913-20.176 45.372-32.527 3.6-8.151 3.338-16.902-.743-24.646a24.335 24.335 0 0 0-1.214-2.101Zm-272.682 32.193a84.965 84.965 0 0 1-3.668 5.847c-3.432 5.024-7.945 8.863-13.184 11.716-10.014 5.461-22.69 7.369-35.566 7.369-20.342 0-41.195-4.761-52.882-7.791-.576-.149-71.644-20.223-62.646-37.31 1.514-2.875 4.005-4.023 7.143-4.023 12.669 0 35.737 18.865 45.65 18.865 2.216 0 3.779-.942 4.416-3.243 4.225-15.153-64.217-21.522-58.453-43.464 1.016-3.884 3.776-5.462 7.655-5.462 16.75-.002 54.342 29.455 62.204 29.455.603 0 1.036-.178 1.27-.549.034-.056.069-.11.1-.169 3.691-6.093 1.573-10.524-23.708-26.008l-2.428-1.478c-27.82-16.838-47.347-26.971-36.242-39.061 1.277-1.394 3.09-2.012 5.29-2.012 2.609 0 5.767.872 9.245 2.337 14.693 6.196 35.058 23.095 43.564 30.464a342.043 342.043 0 0 1 3.988 3.519s10.772 11.201 17.283 11.201c1.499 0 2.772-.591 3.634-2.052 4.619-7.786-42.895-43.791-45.575-58.648-1.817-10.065 1.275-15.165 6.99-15.165 2.719 0 6.035 1.158 9.697 3.48 11.357 7.208 33.284 44.889 41.312 59.548 2.692 4.911 7.286 6.987 11.426 6.987 8.213 0 14.634-8.165.752-18.54-20.865-15.611-13.543-41.129-3.585-42.699a8.002 8.002 0 0 1 1.282-.103c9.056 0 13.049 15.604 13.049 15.604s11.709 29.401 31.822 49.5c18.249 18.242 20.799 33.211 10.165 51.885Zm65.038 3.444-1.043.124-1.778.203c-.936.098-1.874.191-2.814.276l-.916.083-.837.071-1.187.095-1.312.095-1.309.086-.291.019c-.342.02-.684.042-1.03.059l-.438.024c-.405.022-.81.042-1.221.059l-1.419.061-1.287.044-.86.025h-.437c-.268 0-.535.014-.803.017h-.425c-.269 0-.535 0-.804.012l-1.094.014h-1.527c-1.199 0-2.395-.012-3.587-.036l-.968-.022c-.276 0-.551-.012-.823-.022l-1.025-.029-1.273-.049-1.148-.052-.295-.012-1.092-.056c-.305-.017-.606-.032-.909-.054l-.705-.041c-.887-.056-1.774-.117-2.66-.186l-.928-.076c-.391-.029-.782-.065-1.17-.1-.457-.039-.914-.083-1.37-.127a148.43 148.43 0 0 1-2.294-.232h-.036c11.161-24.9 5.517-48.156-17.038-70.691-14.794-14.774-24.634-36.589-26.676-41.379-4.132-14.178-15.069-29.938-33.233-29.938-1.536 0-3.07.122-4.587.361-7.957 1.253-14.913 5.833-19.876 12.725-5.363-6.67-10.575-11.973-15.289-14.967-7.107-4.506-14.2-6.792-21.11-6.792-8.623 0-16.331 3.541-21.705 9.965l-.136.163c-.103-.422-.2-.845-.3-1.27l-.013-.056a179.892 179.892 0 0 1-2.574-13.218c0-.029 0-.059-.015-.088-.054-.334-.103-.672-.154-1.006-.15-.992-.291-1.986-.422-2.98-.059-.452-.122-.903-.179-1.355l-.166-1.356c-.053-.452-.097-.862-.146-1.292l-.015-.107a194.063 194.063 0 0 1-.513-5.281l-.053-.676-.086-1.153a40.194 40.194 0 0 1-.066-.95c0-.076-.012-.149-.015-.22a123.74 123.74 0 0 1-.158-2.657c-.025-.462-.05-.921-.069-1.385l-.049-1.211-.012-.367-.039-1.116-.024-.95c0-.379-.02-.757-.025-1.136-.007-.378-.017-.793-.02-1.194-.004-.401 0-.796-.011-1.194-.01-.401 0-.799 0-1.197 0-102.22 82.871-185.092 185.101-185.092 102.228 0 185.097 82.87 185.097 185.092v2.391c0 .398-.012.799-.019 1.194 0 .33-.015.655-.025.989 0 .294-.012.589-.022.872 0 .374-.022.748-.034 1.121v.03l-.051 1.297c-.017.378-.032.759-.051 1.138l-.013.268-.066 1.212a198.29 198.29 0 0 1-.588 7.776v.032c-.042.425-.083.85-.13 1.275l-.11 1.004-.217 1.963-.124.994-.154 1.17c-.057.425-.113.853-.176 1.275-.064.477-.135.95-.205 1.424l-.169 1.121-.2 1.27a58.4 58.4 0 0 1-.22 1.263c-.081.422-.144.843-.217 1.263-.147.84-.301 1.68-.462 2.518a402.066 402.066 0 0 1-.757 3.754l-.269 1.238c-.088.413-.183.828-.276 1.241-5.209-5.063-12.109-7.821-19.717-7.821-6.905 0-14.004 2.284-21.109 6.79-4.714 2.994-9.924 8.299-15.289 14.967-4.971-6.893-11.926-11.472-19.879-12.725a29.47 29.47 0 0 0-4.587-.361c-18.168 0-29.098 15.76-33.233 29.938-2.051 4.79-11.894 26.605-26.7 41.4-22.54 22.465-28.226 45.616-17.24 70.414Zm191.092-49.846-.073.217c-.185.491-.4.97-.642 1.434a11.91 11.91 0 0 1-.596.996 16.23 16.23 0 0 1-1.341 1.737c-.112.127-.22.254-.347.378-.176.188-.354.374-.537.555-3.287 3.258-8.299 6.115-13.965 8.736-.643.291-1.295.581-1.952.874l-.654.291c-.438.193-.875.383-1.334.571-.437.191-.891.382-1.346.567l-1.363.562c-3.187 1.311-6.452 2.562-9.637 3.795l-1.363.53-1.346.528c-.896.349-1.78.698-2.65 1.048l-1.297.522-1.275.52-.625.264c-.417.174-.825.347-1.233.52-9.371 4.023-16.115 8.114-14.698 13.189.039.144.083.281.132.415.127.377.3.731.517 1.065.127.198.274.386.438.557 1.665 1.732 4.696 1.458 8.519.083a53.473 53.473 0 0 0 1.602-.618l.332-.136c.874-.372 1.8-.787 2.745-1.236.237-.113.476-.22.716-.345 4.674-2.286 9.972-5.363 15.228-8.165a137.712 137.712 0 0 1 6.394-3.236c4.977-2.342 9.657-4.003 13.418-4.003 1.766 0 3.324.362 4.624 1.192l.217.144a7.087 7.087 0 0 1 2.01 2.167c.1.163.198.337.293.515 1.859 3.529.303 7.183-3.339 10.766-3.495 3.441-8.931 6.814-15.11 9.935-.46.232-.919.465-1.385.692-18.391 9.032-42.475 15.833-42.81 15.919-6.418 1.663-15.597 3.847-25.938 5.481l-1.529.239-.251.037c-1.158.175-2.318.339-3.481.491-1.179.158-2.371.302-3.57.437l-.22.024c-4.348.501-8.712.833-13.086.992h-.064c-1.583.056-3.163.085-4.745.085h-1.825a113.194 113.194 0 0 1-7.227-.327c-.056 0-.117 0-.173-.015a74.593 74.593 0 0 1-2.582-.242 95.088 95.088 0 0 1-2.667-.322 60.205 60.205 0 0 1-1.746-.261c-.591-.095-1.182-.193-1.771-.296l-.803-.151-.061-.012a65.73 65.73 0 0 1-2.531-.535c-.488-.11-.974-.218-1.455-.35l-.291-.073c-.239-.058-.471-.122-.708-.185l-.13-.035-.752-.219c-.274-.076-.547-.159-.821-.24l-.095-.027-.711-.217a44.17 44.17 0 0 1-.803-.259l-.655-.217-.481-.169a48.303 48.303 0 0 1-1.382-.508l-.435-.171-.359-.141a58.536 58.536 0 0 1-2.064-.875l-.452-.22-.075-.034c-.162-.076-.32-.151-.481-.217a40.937 40.937 0 0 1-.938-.467l-.096-.046-.449-.237a39.25 39.25 0 0 1-2.347-1.333l-.42-.259c-.21-.13-.42-.264-.625-.401l-.548-.361-.588-.406-.352-.251a28.235 28.235 0 0 1-1.092-.819l-.569-.437a39.806 39.806 0 0 1-.674-.557c-.188-.153-.371-.315-.554-.476l-.015-.012a32.54 32.54 0 0 1-.584-.525c-.19-.174-.381-.349-.566-.528l-.022-.022a19.148 19.148 0 0 1-.574-.566c-.188-.191-.381-.381-.564-.577-.183-.193-.372-.391-.552-.593-.181-.201-.347-.384-.518-.582l-.056-.066c-.166-.19-.33-.383-.491-.581a30.073 30.073 0 0 1-1.016-1.282c-.33-.44-.652-.889-.967-1.346l-.301-.449c-.4-.586-.791-1.177-1.17-1.778a48.053 48.053 0 0 1-.828-1.309c-.173-.276-.339-.555-.505-.828l-.069-.113c-.158-.268-.315-.532-.466-.798a7.555 7.555 0 0 1-.249-.437c-.081-.152-.174-.306-.259-.46l-.139-.241-.086-.157a39.684 39.684 0 0 1-.481-.886c-.073-.132-.144-.264-.22-.391l-.217-.423-.22-.417a67.082 67.082 0 0 1-1.558-3.341l-.173-.413c-.113-.276-.218-.55-.33-.821-.054-.132-.108-.261-.154-.393a40.57 40.57 0 0 1-.962-2.782 28.63 28.63 0 0 1-.477-1.678 30.805 30.805 0 0 1-.456-1.985c-.027-.135-.054-.269-.076-.399a27.853 27.853 0 0 1-.31-1.968c-.02-.13-.034-.259-.049-.388l-.042-.396a28.003 28.003 0 0 1-.119-1.558c0-.132-.013-.264-.017-.391a20.146 20.146 0 0 1-.02-.777c-.137-10.436 5.144-20.469 16.435-31.755 20.113-20.094 31.821-49.497 31.821-49.497s.315-1.234.97-3.009c.09-.247.186-.501.293-.767a32.9 32.9 0 0 1 1.287-2.924l.095-.183c.406-.811.85-1.602 1.329-2.371.112-.179.22-.354.344-.533.359-.53.738-1.047 1.136-1.548.217-.271.454-.54.691-.801.095-.103.188-.205.288-.303 1.165-1.204 2.497-2.186 4.003-2.709l.191-.063c.127-.042.254-.081.383-.117.149-.039.298-.074.452-.105l.071-.015c.318-.064.64-.105.965-.127h.027c.168 0 .339-.017.513-.017.217 0 .42 0 .632.022.22.019.437.044.657.078 1.812.288 3.537 1.368 5.022 3.033a14.517 14.517 0 0 1 1.516 2.042c.293.469.569.965.831 1.488.105.217.205.417.303.632.254.552.483 1.114.683 1.688a24.505 24.505 0 0 1 1.073 4.132c.205 1.234.327 2.479.366 3.727.02.667.02 1.344 0 2.025a29.166 29.166 0 0 1-1.922 9.261c-.103.272-.217.545-.327.819a22.854 22.854 0 0 1-.738 1.624c-.198.403-.405.808-.63 1.211-.147.269-.301.538-.454.806a33.388 33.388 0 0 1-1.275 1.996l-.276.395a33.346 33.346 0 0 1-3.595 4.221 37.682 37.682 0 0 1-4.15 3.59 33.928 33.928 0 0 0-4.125 3.607c-3.671 3.852-4.526 7.252-3.7 9.828.132.406.305.799.515 1.17.247.425.54.816.872 1.173l.129.134.132.132a7 7 0 0 0 .42.373l.147.118c.354.273.73.518 1.123.732.115.062.218.123.347.181.425.208.862.386 1.312.53.124.042.249.078.376.117l.159.042.219.059.188.046.206.044.202.041.193.032c.142.025.288.049.435.066l.139.022.254.025.157.017.256.017h.151l.269.014h.845l.242-.014.278-.017.34-.032.317-.037c.074 0 .147-.019.22-.034a12.294 12.294 0 0 0 2.85-.772l.389-.163c.217-.096.437-.196.637-.303.43-.215.848-.459 1.248-.726.56-.366 1.087-.776 1.58-1.228.118-.105.232-.217.345-.325.056-.054.11-.105.163-.164.108-.109.218-.217.325-.337a14.62 14.62 0 0 0 2.015-2.825 558.657 558.657 0 0 1 15.023-25.679l.718-1.151.726-1.15c.361-.584.728-1.158 1.091-1.729l.367-.572a306.989 306.989 0 0 1 3.71-5.676l.745-1.114a245.885 245.885 0 0 1 4.462-6.416l.735-1.013a137.027 137.027 0 0 1 5.017-6.499l.688-.826c.115-.137.22-.273.345-.405.227-.269.454-.53.676-.784.113-.13.218-.257.337-.384l.655-.737.327-.359c.33-.355.652-.694.97-1.019.22-.22.422-.437.632-.642a25.665 25.665 0 0 1 4.077-3.385l.342-.22c.327-.22.666-.425 1.013-.611 5.774-3.277 10.554-3.519 13.306-.767 1.666 1.666 2.589 4.428 2.538 8.273 0 .168 0 .339-.013.515v.188c0 .176-.014.352-.029.53 0 .22-.024.437-.046.657-.022.217-.034.383-.056.579 0 .054-.01.11-.02.168-.015.169-.037.342-.061.516 0 .051 0 .105-.02.159-.026.232-.061.461-.1.691a11.22 11.22 0 0 1-.102.64l-.064.364a9.725 9.725 0 0 1-.244 1.025c-.19.633-.42 1.251-.691 1.852a26.729 26.729 0 0 1-1.256 2.41 36.43 36.43 0 0 1-.786 1.285c-.278.437-.572.879-.874 1.326a71.187 71.187 0 0 1-2.406 3.244l-.381.481a123.613 123.613 0 0 1-4.206 4.97l-.457.513c-.615.686-1.24 1.377-1.88 2.071l-.481.523c-.32.349-.655.698-.977 1.05-.32.349-.655.703-.992 1.057l-1.004 1.058-1.018 1.065-1.026 1.065c-.689.713-1.38 1.426-2.076 2.139-9.904 10.158-20.337 20.282-23.869 26.593-.237.41-.45.835-.64 1.267-.503 1.148-.713 2.13-.569 2.924.046.261.137.51.271.74.198.344.44.662.721.945.129.127.266.244.41.352a4.114 4.114 0 0 0 2.498.759h.279l.286-.022.285-.032.237-.034c.032-.005.066-.01.098-.019l.217-.042.056-.012.242-.051.086-.022a8.77 8.77 0 0 0 .254-.069c.085-.024.202-.056.305-.09.43-.13.85-.283 1.263-.459a9.9 9.9 0 0 0 .64-.286c.11-.049.219-.1.322-.154l.327-.161a29.795 29.795 0 0 0 2.286-1.321l.325-.22c.11-.069.22-.139.325-.218l.325-.217.173-.12.469-.329c.437-.301.845-.611 1.258-.926l.037-.029.657-.508a71.37 71.37 0 0 0 2.518-2.093l.513-.45.046-.044.269-.237c.63-.566 1.192-1.094 1.658-1.529l.193-.188c.168-.158.322-.307.462-.434l.273-.271.098-.096.027-.027.285-.285.181-.188.022-.018.086-.078.107-.097.034-.032.091-.083.498-.437.278-.249c.149-.13.293-.262.438-.396l.332-.296c.061-.049.119-.102.18-.156l.35-.305.513-.452.273-.237a420.923 420.923 0 0 1 3.839-3.297l.609-.516 1.003-.842 1.029-.857a334.068 334.068 0 0 1 4.318-3.53l1.004-.806c.854-.681 1.731-1.375 2.62-2.073a65.46 65.46 0 0 1 1.094-.84c.909-.706 1.822-1.407 2.743-2.098a246.067 246.067 0 0 1 6.446-4.712l.937-.654c.657-.452 1.312-.906 1.967-1.348l.593-.401c1.17-.794 2.357-1.568 3.554-2.323l.593-.373.589-.367a130.48 130.48 0 0 1 1.761-1.074l.583-.35 1.168-.679 1.145-.657.232-.127.907-.498c.378-.205.754-.403 1.13-.596l.56-.288.544-.273c.191-.091.379-.186.564-.276a52.449 52.449 0 0 1 3.747-1.671c.344-.147.686-.278 1.026-.393l1.001-.352c.301-.1.594-.195.875-.281l.097-.029a8.44 8.44 0 0 1 .452-.132l.044-.012c.313-.091.623-.169.928-.242h.022a19.803 19.803 0 0 1 2.631-.447 11.65 11.65 0 0 1 1.226-.061h.205c.273 0 .537.017.798.044.12 0 .24.024.357.039h.049c.117.015.234.032.352.059.114.022.232.041.344.068h.037c.114.024.217.054.337.088a6.36 6.36 0 0 1 1.753.794c.266.173.516.369.745.586l.066.063c.044.039.086.081.125.123l.119.129a13.364 13.364 0 0 1 2.404 3.493l.092.219a8.084 8.084 0 0 1 .103 6.236 11.428 11.428 0 0 1-.828 1.746 19.86 19.86 0 0 1-2.684 3.546l-.217.232c-.325.342-.662.684-1.016 1.026-.157.154-.32.305-.484.459l-.501.462-.261.232a49.246 49.246 0 0 1-1.934 1.634c-.399.322-.799.637-1.205.947a103.41 103.41 0 0 1-4.374 3.168c-.896.616-1.8 1.219-2.711 1.815a241.886 241.886 0 0 1-6.804 4.306c-4.807 2.955-10.134 6.115-15.812 9.552l-1.47.891c-1.61.982-3.129 1.92-4.56 2.814l-.721.452-1.363.874c-.903.579-1.805 1.163-2.706 1.746l-.725.479c-.354.23-.706.464-1.058.699l-.344.219-1.055.711-.559.384-.655.454-.608.422a134.32 134.32 0 0 0-2.838 2.059l-.327.249c-.513.389-1.021.784-1.522 1.187a48.15 48.15 0 0 0-2.061 1.749l-.303.276c-.174.159-.345.318-.508.474-.113.11-.218.22-.335.325l-.156.156c-.349.352-.691.711-1.021 1.08l-.161.185c-.359.415-.672.814-.945 1.202l-.123.173a10.546 10.546 0 0 0-.72 1.217l-.12.249-.08.18-.052.123-.041.109-.056.149a6.193 6.193 0 0 0-.318 1.278l-.019.151-.015.142v.769c0 .064 0 .127.017.196l.012.117c0 .063.015.124.025.193.009.063.027.178.046.268v.013c.017.085.034.168.056.254.022.085.044.183.071.271.046.173.105.344.166.515.039.103.076.203.117.303 0 .02.015.041.025.061l.088.198.122.271c.132.281.276.554.432.821l.161.278.166.278c.03.047.064.091.101.132l.053.057.061.056.064.049c.093.065.193.117.298.153.056.02.115.035.173.049 1.409.318 4.306-.847 8.155-2.879.218-.118.457-.24.689-.367l1.172-.64.572-.317c.408-.217.823-.464 1.248-.706l.774-.437c5.088-2.928 11.164-6.69 17.446-10.363.589-.344 1.18-.689 1.771-1.028l1.187-.76a317.87 317.87 0 0 1 4.152-2.337c1.751-.962 3.514-1.9 5.295-2.809l1.162-.588c.772-.381 1.537-.753 2.291-1.114a99.797 99.797 0 0 1 4.433-1.976l.818-.332.098-.039c4.335-1.717 8.265-2.777 11.445-2.777a11.28 11.28 0 0 1 2.051.168h.022c.218.039.416.083.618.132h.037a7.35 7.35 0 0 1 1.505.562 6.425 6.425 0 0 1 1.785 1.365c.234.259.442.54.625.838.342.525.611 1.094.804 1.69.078.232.146.459.217.701a9.598 9.598 0 0 1-.147 5.63Z'/%3E%3Cpath fill='%23FFD21E' fill-rule='evenodd' d='M439.742 245.574v-1.199c0-102.223-82.84-185.09-185.07-185.09-102.227 0-185.1 82.872-185.1 185.09v.4c-.004.266-.007.533 0 .799.013.398.017.796.013 1.194l.012.879.007.315c0 .147.005.291.01.438.008.232.012.466.012.698l.027.95.04 1.116.011.367.05 1.155v.056c.019.452.043.901.065 1.351l.003.034c.024.459.049.921.078 1.382.024.425.049.85.08 1.275l.005.076c.022.364.046.73.073 1.094l.008.098.08 1.055.008.068c.015.205.03.411.049.608.146 1.761.316 3.522.51 5.278l.012.11.15 1.292.166 1.356.121.921.057.432c.13.996.27 1.99.422 2.982l.01.066.144.938a182.192 182.192 0 0 0 2.589 13.311l.012.053.078.33.223.94.136-.163c5.374-6.424 13.082-9.965 21.706-9.965 6.911 0 14.002 2.286 21.109 6.792 4.714 2.995 9.926 8.297 15.289 14.967 4.963-6.892 11.919-11.474 19.876-12.725a29.726 29.726 0 0 1 4.587-.361c18.161 0 29.101 15.76 33.233 29.938 2.042 4.79 11.882 26.605 26.722 41.362 22.558 22.535 28.202 45.789 17.038 70.689h.039c.759.085 1.524.164 2.293.234.457.044.911.088 1.37.127l.162.015 1.008.086.928.073c.885.068 1.771.132 2.66.188l.706.041.559.035.347.019 1.092.056.298.013 1.145.051 1.275.049 1.024.029.171.005c.217.01.434.017.652.017l.234.007c1.441.034 2.88.052 4.321.049h1.529l1.091-.012c.269-.012.535-.012.806-.012h.425l.369-.01c.144-.005.288-.01.435-.01h.437l.857-.022 1.29-.044 1.419-.063c.41-.015.816-.037 1.221-.056l.437-.027.65-.034.381-.022.288-.02 1.312-.086 1.309-.095 1.189-.095.835-.071.919-.083c1.534-.137 3.062-.298 4.591-.481l1.043-.125c-10.988-24.794-5.3-47.948 17.163-70.393 14.808-14.796 24.648-36.611 26.7-41.403 4.135-14.176 15.067-29.936 33.233-29.936 1.536 0 3.072.122 4.589.361 7.95 1.251 14.906 5.833 19.876 12.725 5.366-6.668 10.575-11.975 15.292-14.969 7.104-4.504 14.202-6.79 21.106-6.79 7.611 0 14.508 2.76 19.718 7.823.095-.413.188-.826.278-1.241l.266-1.236c.096-.452.191-.903.281-1.355.161-.799.323-1.598.476-2.404.162-.835.316-1.675.462-2.515l.076-.454c.046-.269.09-.538.141-.809.083-.42.152-.84.22-1.265l.027-.161.174-1.107.17-1.121v-.009c.125-.828.242-1.656.352-2.484l.027-.205.154-1.168.124-.996.22-1.964.086-.789.022-.215c.046-.425.09-.85.129-1.275v-.034c.032-.337.066-.677.095-1.016.174-1.925.32-3.859.438-5.801.022-.317.039-.637.058-.957v-.015l.064-1.199.014-.269c.039-.81.074-1.621.101-2.432v-.029l.012-.318c.012-.266.022-.535.022-.803l.005-.108c.009-.252.019-.51.019-.767l.007-.22c.008-.256.015-.51.015-.767l.005-.217c.007-.325.015-.652.015-.977v-1.194ZM208.763 430.475c14.659-21.495 13.618-37.629-6.492-57.73-20.115-20.103-31.822-49.499-31.822-49.499s-4.369-17.075-14.334-15.507c-9.964 1.568-17.274 27.084 3.591 42.702 20.862 15.619-4.152 26.209-12.183 11.553-8.03-14.659-29.956-52.337-41.322-59.545-11.367-7.207-19.361-3.168-16.682 11.687 1.331 7.373 13.709 19.959 25.274 31.716 11.733 11.929 22.628 23.007 20.298 26.927-4.623 7.784-20.906-9.146-20.906-9.146s-50.987-46.4-62.085-34.308c-10.234 11.144 5.546 20.618 29.863 35.221 2.066 1.241 4.196 2.521 6.377 3.84 27.821 16.842 29.984 21.285 26.035 27.657-1.458 2.354-10.771-3.236-22.225-10.112-19.527-11.725-45.274-27.183-48.91-13.347-3.147 11.975 15.796 19.312 32.976 25.967 14.312 5.544 27.403 10.615 25.476 17.497-1.995 7.137-12.812 1.185-24.636-5.322-13.274-7.305-27.818-15.306-32.578-6.277-8.996 17.073 62.06 37.171 62.646 37.32 22.958 5.954 81.262 18.571 101.639-11.294Zm94.434 0c-14.659-21.495-13.619-37.629 6.494-57.73 20.113-20.103 31.819-49.499 31.819-49.499s4.369-17.075 14.334-15.507c9.965 1.568 17.275 27.084-3.588 42.702-20.865 15.619 4.15 26.209 12.18 11.553 8.033-14.659 29.944-52.337 41.31-59.545 11.367-7.207 19.366-3.168 16.684 11.687-1.328 7.373-13.709 19.959-25.273 31.719-11.733 11.928-22.629 23.004-20.301 26.924 4.623 7.784 20.919-9.156 20.919-9.156s50.984-46.398 62.087-34.305c10.231 11.142-5.549 20.618-29.868 35.221a2689.168 2689.168 0 0 0-6.374 3.839c-27.821 16.843-29.985 21.285-26.038 27.655 1.46 2.357 10.773-3.236 22.225-10.111 19.529-11.724 45.277-27.184 48.913-13.345 3.148 11.975-15.797 19.311-32.976 25.967-14.313 5.544-27.404 10.614-25.479 17.497 1.993 7.134 12.808 1.182 24.629-5.324 13.274-7.306 27.821-15.312 32.578-6.275 8.998 17.082-62.07 37.161-62.644 37.307-22.958 5.974-81.262 18.591-101.631-11.274Z' clip-rule='evenodd'/%3E%3Cpath fill='%2332343D' fill-rule='evenodd' d='M314.783 193.996c2.887 1.021 5.034 4.128 7.076 7.085 2.76 3.996 5.329 7.716 9.271 5.62a26.62 26.62 0 0 0 10.954-10.91 26.64 26.64 0 0 0-.581-26.248 26.666 26.666 0 0 0-8.028-8.472 26.63 26.63 0 0 0-32.689 2.343 26.62 26.62 0 0 0-6.741 9.526 26.626 26.626 0 0 0 1.065 22.748c1.827 3.437 5.881 1.815 10.16.103 3.354-1.341 6.849-2.738 9.513-1.795Zm-125.476 0c-2.887 1.021-5.034 4.13-7.076 7.085-2.76 3.998-5.331 7.716-9.271 5.62a26.628 26.628 0 0 1 20.181-49.013 26.64 26.64 0 0 1 18.824 22.831 26.645 26.645 0 0 1-2.982 15.169c-1.83 3.437-5.884 1.815-10.163.105-3.356-1.343-6.846-2.74-9.513-1.797Zm106.064 114.183c19.888-15.668 27.194-41.249 27.194-57.007 0-12.456-8.38-8.536-21.796-1.893l-.757.373c-12.315 6.099-28.708 14.22-46.703 14.22-17.998 0-34.391-8.121-46.703-14.222-13.851-6.861-22.538-11.164-22.538 1.524 0 16.256 7.772 42.949 29.103 58.456a46.315 46.315 0 0 1 11.645-14.896 46.308 46.308 0 0 1 16.625-9.005c2.13-.635 4.323 3.031 6.568 6.784 2.166 3.62 4.382 7.323 6.633 7.323 2.401 0 4.758-3.649 7.061-7.21 2.406-3.725 4.753-7.352 7.022-6.626a46.325 46.325 0 0 1 26.646 22.179Z' clip-rule='evenodd'/%3E%3Cpath fill='%23FF323D' d='M295.367 308.176c-10.358 8.163-24.126 13.636-42.055 13.636-16.845 0-30.019-4.831-40.141-12.185a46.294 46.294 0 0 1 11.646-14.896 46.315 46.315 0 0 1 16.625-9.005c4.181-1.248 8.614 14.107 13.201 14.107 4.909 0 9.64-15.255 14.082-13.836a46.346 46.346 0 0 1 26.642 22.179Z'/%3E%3Cpath fill='%23FFAD03' fill-rule='evenodd' d='M141.749 216.156a17.285 17.285 0 0 1-7.92 2.835 17.254 17.254 0 0 1-8.321-1.236 17.233 17.233 0 0 1-5.621-3.751 17.25 17.25 0 0 1-3.751-5.62 17.302 17.302 0 0 1 1.605-16.242 17.312 17.312 0 1 1 24.008 24.014Zm247.687 0a17.29 17.29 0 0 1-7.92 2.835 17.264 17.264 0 0 1-8.324-1.236 17.281 17.281 0 0 1-9.371-9.371 17.349 17.349 0 0 1-1.231-8.321 17.344 17.344 0 0 1 2.836-7.921 17.297 17.297 0 0 1 20.227-6.68 17.308 17.308 0 0 1 6.409 4.062 17.284 17.284 0 0 1 4.738 8.863 17.311 17.311 0 0 1-7.364 17.769Z' clip-rule='evenodd'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='a'%3E%3Cpath fill='%23fff' d='M.25 0h512v512H.25z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.AWSEventBridge.MessageStart.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "API destination"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "authorization",
          "label": "Authorization"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 256 256'%3E%3Cdefs%3E%3ClinearGradient id='logosAwsEventbridge0' x1='0%25' x2='100%25' y1='100%25' y2='0%25'%3E%3Cstop offset='0%25' stop-color='%23B0084D'/%3E%3Cstop offset='100%25' stop-color='%23FF4F8B'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23logosAwsEventbridge0)' d='M0 0h256v256H0z'/%3E%3Cpath fill='%23FFF' d='M171.702 211.2c-6.858 0-12.44-5.61-12.44-12.509s5.582-12.509 12.44-12.509c6.857 0 12.438 5.61 12.438 12.51c0 6.898-5.581 12.508-12.438 12.508Zm-27.278-54.4h-33.071L94.815 128l16.538-28.8h33.071L160.96 128l-16.535 28.8ZM88.387 69.818c-6.857 0-12.438-5.61-12.438-12.51c0-6.898 5.581-12.508 12.438-12.508c6.861 0 12.443 5.61 12.443 12.509s-5.582 12.509-12.443 12.509Zm83.315 109.964c-2.362 0-4.614.458-6.699 1.261l-13.514-22.931l-.713.426L167.39 129.6a3.226 3.226 0 0 0 0-3.2l-18.374-32a3.177 3.177 0 0 0-2.755-1.6h-33.435l.13-.077l-12.39-21.03c4.047-3.469 6.628-8.627 6.628-14.384c0-10.426-8.436-18.909-18.807-18.909c-10.367 0-18.803 8.483-18.803 18.909c0 10.425 8.436 18.909 18.803 18.909c2.365 0 4.618-.458 6.702-1.261l11.567 19.625L88.384 126.4a3.226 3.226 0 0 0 0 3.2l18.377 32c.57.992 1.62 1.6 2.756 1.6h36.744c.264 0 .521-.042.77-.102l12.496 21.21c-4.051 3.468-6.629 8.626-6.629 14.383c0 10.426 8.433 18.909 18.804 18.909c10.37 0 18.803-8.483 18.803-18.909c0-10.425-8.433-18.909-18.803-18.909Zm18.968-77.05c-6.857 0-12.436-5.609-12.436-12.508c0-6.9 5.579-12.509 12.436-12.509c6.858 0 12.44 5.61 12.44 12.509c0 6.9-5.582 12.509-12.44 12.509Zm23.303 23.668l-12.08-21.04c4.592-3.453 7.58-8.944 7.58-15.136c0-10.426-8.432-18.909-18.803-18.909c-2.638 0-5.152.554-7.433 1.549l-9.849-17.155a3.18 3.18 0 0 0-2.756-1.6h-39.448v6.4h37.612l9.11 15.872c-3.703 3.456-6.036 8.374-6.036 13.843c0 10.426 8.433 18.909 18.8 18.909c1.932 0 3.8-.298 5.556-.845L207.545 128l-15.892 27.674l5.512 3.2l16.808-29.274a3.21 3.21 0 0 0 0-3.2Zm-146.04 50.39c-6.86 0-12.442-5.612-12.442-12.508c0-6.9 5.581-12.51 12.442-12.51c6.857 0 12.439 5.61 12.439 12.51c0 6.896-5.582 12.508-12.44 12.508Zm10.393 3.236c5.062-3.392 8.41-9.181 8.41-15.744c0-10.426-8.436-18.91-18.803-18.91c-3.004 0-5.833.73-8.353 1.994L48.458 128l18.428-32.093l-5.515-3.2L42.027 126.4a3.21 3.21 0 0 0 0 3.2l12.388 21.568c-3.268 3.405-5.289 8.022-5.289 13.114c0 10.425 8.436 18.908 18.807 18.908c1.562 0 3.074-.214 4.528-.579l10.15 17.68c.57.989 1.62 1.6 2.757 1.6h39.451v-6.4H87.204l-8.878-15.465Z'/%3E%3C/svg%3E%0A"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "authorization"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.TwilioWebhookMessageStart.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "endpoint",
          "label": "Webhook configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "correlation",
          "label": "Subprocess correlation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' preserveAspectRatio='xMidYMid' viewBox='0 0 256 256' id='twilio'%3E%3Cg fill='%23CF272D'%3E%3Cpath d='M127.86 222.304c-52.005 0-94.164-42.159-94.164-94.163 0-52.005 42.159-94.163 94.164-94.163 52.004 0 94.162 42.158 94.162 94.163 0 52.004-42.158 94.163-94.162 94.163zm0-222.023C57.245.281 0 57.527 0 128.141 0 198.756 57.245 256 127.86 256c70.614 0 127.859-57.244 127.859-127.859 0-70.614-57.245-127.86-127.86-127.86z'%3E%3C/path%3E%3Cpath d='M133.116 96.297c0-14.682 11.903-26.585 26.586-26.585 14.683 0 26.585 11.903 26.585 26.585 0 14.684-11.902 26.586-26.585 26.586-14.683 0-26.586-11.902-26.586-26.586M133.116 159.983c0-14.682 11.903-26.586 26.586-26.586 14.683 0 26.585 11.904 26.585 26.586 0 14.683-11.902 26.586-26.585 26.586-14.683 0-26.586-11.903-26.586-26.586M69.431 159.983c0-14.682 11.904-26.586 26.586-26.586 14.683 0 26.586 11.904 26.586 26.586 0 14.683-11.903 26.586-26.586 26.586-14.682 0-26.586-11.903-26.586-26.586M69.431 96.298c0-14.683 11.904-26.585 26.586-26.585 14.683 0 26.586 11.902 26.586 26.585 0 14.684-11.903 26.586-26.586 26.586-14.682 0-26.586-11.902-26.586-26.586'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "endpoint"
      },
      {},
      {},
      {
        "group": "endpoint"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "correlation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.inbound.AWSSNS.IntermediateCatchEvent.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "subscription",
          "label": "Subscription Configuration"
        },
        {
          "id": "activation",
          "label": "Activation"
        },
        {
          "id": "variable-mapping",
          "label": "Variable Mapping"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 80 80' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 64 (93537) - https://sketch.com --%3E%3Ctitle%3EIcon-Architecture/64/Arch_AWS-Simple-Notification-Service_64%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cdefs%3E%3ClinearGradient x1='0%25' y1='100%25' x2='100%25' y2='0%25' id='linearGradient-1'%3E%3Cstop stop-color='%23B0084D' offset='0%25'%3E%3C/stop%3E%3Cstop stop-color='%23FF4F8B' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg id='Icon-Architecture/64/Arch_AWS-Simple-Notification-Service_64' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cg id='Icon-Architecture-BG/64/Application-Integration' fill='url(%23linearGradient-1)'%3E%3Crect id='Rectangle' x='0' y='0' width='80' height='80'%3E%3C/rect%3E%3C/g%3E%3Cpath d='M17,38 C18.103,38 19,38.897 19,40 C19,41.103 18.103,42 17,42 C15.897,42 15,41.103 15,40 C15,38.897 15.897,38 17,38 L17,38 Z M41,64 C29.314,64 19.289,55.466 17.194,43.98 C18.965,43.894 20.427,42.659 20.857,41 L27,41 L27,39 L20.857,39 C20.427,37.342 18.966,36.107 17.195,36.02 C19.285,24.71 29.511,16 41,16 C45.313,16 49.832,17.622 54.429,20.821 L55.571,19.179 C50.633,15.743 45.73,14 41,14 C28.27,14 16.949,23.865 15.063,36.521 C13.839,37.207 13,38.5 13,40 C13,41.5 13.839,42.793 15.063,43.478 C16.97,56.341 28.056,66 41,66 C46.407,66 51.942,64.157 56.585,60.811 L55.415,59.189 C51.11,62.292 45.991,64 41,64 L41,64 Z M30.101,36.442 C31.955,36.895 34.275,37 36,37 C37.642,37 39.823,36.905 41.629,36.506 L37.105,45.553 C37.036,45.691 37,45.845 37,46 L37,50.453 C36.199,50.964 34.833,51.812 34,51.986 L34,46 C34,45.868 33.974,45.737 33.923,45.615 L30.101,36.442 Z M36,33 C40.025,33 42.174,33.604 42.841,34 C42.174,34.396 40.025,35 36,35 C31.975,35 29.826,34.396 29.159,34 C29.826,33.604 31.975,33 36,33 L36,33 Z M33,54 L34,54 C34.043,54 34.086,53.997 34.128,53.992 C35.352,53.833 36.909,52.887 38.272,52.013 L38.535,51.845 C38.824,51.661 39,51.342 39,51 L39,46.236 L44.559,35.12 C44.833,34.801 45,34.434 45,34 C45,31.39 39.361,31 36,31 C32.639,31 27,31.39 27,34 C27,34.366 27.12,34.684 27.32,34.967 L32,46.2 L32,53 C32,53.552 32.447,54 33,54 L33,54 Z M62,53 C63.103,53 64,53.897 64,55 C64,56.103 63.103,57 62,57 C60.897,57 60,56.103 60,55 C60,53.897 60.897,53 62,53 L62,53 Z M62,23 C63.103,23 64,23.897 64,25 C64,26.103 63.103,27 62,27 C60.897,27 60,26.103 60,25 C60,23.897 60.897,23 62,23 L62,23 Z M64,38 C65.103,38 66,38.897 66,40 C66,41.103 65.103,42 64,42 C62.897,42 62,41.103 62,40 C62,38.897 62.897,38 64,38 L64,38 Z M54,41 L60.143,41 C60.589,42.72 62.142,44 64,44 C66.206,44 68,42.206 68,40 C68,37.794 66.206,36 64,36 C62.142,36 60.589,37.28 60.143,39 L54,39 L54,26 L58.143,26 C58.589,27.72 60.142,29 62,29 C64.206,29 66,27.206 66,25 C66,22.794 64.206,21 62,21 C60.142,21 58.589,22.28 58.143,24 L53,24 C52.447,24 52,24.448 52,25 L52,39 L45,39 L45,41 L52,41 L52,55 C52,55.552 52.447,56 53,56 L58.143,56 C58.589,57.72 60.142,59 62,59 C64.206,59 66,57.206 66,55 C66,52.794 64.206,51 62,51 C60.142,51 58.589,52.28 58.143,54 L54,54 L54,41 Z' id='AWS-Simple-Notification-Service_Icon_64_Squid' fill='%23FFFFFF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {},
      {},
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "subscription"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "activation"
      },
      {
        "group": "variable-mapping"
      },
      {
        "group": "variable-mapping"
      }
    ]
  },
  "io.camunda.connectors.EasyPost.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "operation",
          "label": "Operation"
        },
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "input",
          "label": "Input"
        },
        {
          "id": "output",
          "label": "Output"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ],
      "icon": {
        "contents": "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='18' height='18' viewBox='0 0 1000 1000' xml:space='preserve'%3E%3Cdesc%3ECreated with Fabric.js 3.5.0%3C/desc%3E%3Cdefs%3E%3C/defs%3E%3Crect x='0' y='0' width='18' height='100%25' fill='%23ffffff'/%3E%3Cg transform='matrix(0.2007 0 0 -0.1895 500.0727 500.0583)' id='344493'%3E%3Cpath style='stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; is-custom-font: none; font-file-url: none; fill: rgb(17,90,241); fill-rule: nonzero; opacity: 1;' vector-effect='non-scaling-stroke' transform=' translate(-2549.75, -2559.5281)' d='M 2475 5110 c -22 -5 -59 -17 -81 -27 c -23 -10 -470 -265 -994 -568 c -682 -394 -966 -563 -999 -595 c -54 -52 -96 -131 -111 -209 c -14 -73 -14 -2229 0 -2302 c 14 -76 54 -152 108 -207 c 37 -37 257 -168 1023 -610 c 901 -519 982 -564 1050 -578 c 74 -15 130 -13 199 8 c 19 6 474 263 1010 572 c 1044 601 1047 603 1096 710 c 37 80 45 146 42 338 l -3 176 l -980 -565 c -539 -310 -1007 -578 -1040 -595 c -70 -36 -160 -47 -221 -28 c -21 7 -265 145 -541 308 l -503 296 l 0 229 l 0 229 l 33 -20 c 17 -11 244 -142 503 -291 c 517 -298 534 -306 639 -284 c 45 10 262 132 1085 610 l 1029 598 l 1 258 l 0 258 l -22 -12 c -13 -7 -473 -271 -1023 -587 c -550 -317 -1020 -582 -1045 -589 c -60 -19 -145 -11 -202 18 c -25 13 -260 150 -522 304 l -475 280 l -1 228 l 0 228 l 23 -12 c 12 -7 229 -131 482 -277 c 253 -146 480 -274 505 -285 c 52 -23 146 -28 200 -9 c 19 7 494 279 1055 605 l 1020 594 l 3 183 c 2 140 -1 197 -13 244 c -19 74 -68 158 -117 200 c -50 44 -1962 1146 -2015 1162 c -59 18 -150 24 -198 14 z' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E"
      }
    },
    "properties": [
      {},
      {
        "group": "operation"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {
        "group": "authentication"
      },
      {},
      {},
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {
        "group": "errors"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  },
  "io.camunda.connectors.WhatsApp.v1": {
    "template": {
      "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
      "icon": {
        "contents": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 175.216 175.552'%3E%3Cdefs%3E%3ClinearGradient id='b' x1='85.915' x2='86.535' y1='32.567' y2='137.092' gradientUnits='userSpaceOnUse'%3E%3Cstop offset='0' stop-color='%2357d163'/%3E%3Cstop offset='1' stop-color='%2323b33a'/%3E%3C/linearGradient%3E%3Cfilter id='a' width='1.115' height='1.114' x='-.057' y='-.057' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='3.531'/%3E%3C/filter%3E%3C/defs%3E%3Cpath fill='%23b3b3b3' d='m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0' filter='url(%23a)'/%3E%3Cpath fill='%23fff' d='m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z'/%3E%3Cpath fill='url(%23linearGradient1780)' d='M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z'/%3E%3Cpath fill='url(%23b)' d='M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z'/%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647'/%3E%3C/svg%3E"
      },
      "category": {
        "id": "connectors",
        "name": "Connectors"
      },
      "groups": [
        {
          "id": "authentication",
          "label": "Authentication"
        },
        {
          "id": "endpoint",
          "label": "HTTP endpoint"
        },
        {
          "id": "input",
          "label": "Payload"
        },
        {
          "id": "timeout",
          "label": "Connect timeout"
        },
        {
          "id": "output",
          "label": "Response mapping"
        },
        {
          "id": "errors",
          "label": "Error handling"
        }
      ]
    },
    "properties": [
      {},
      {
        "group": "authentication"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {
        "group": "input"
      },
      {},
      {},
      {},
      {},
      {},
      {
        "group": "output"
      },
      {
        "group": "output"
      },
      {
        "group": "errors"
      }
    ]
  }
};
