# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Enable Hub (3)

#### Update image references

If you mirror or pin images, update these repositories:

| 8.9 image                              | 8.10 image                                                             |
| :------------------------------------- | :--------------------------------------------------------------------- |
| `camunda/web-modeler-restapi:8.9.x`    | `camunda/hub:8.10.x`                                                   |
| `camunda/web-modeler-websockets:8.9.x` | `camunda/hub-websockets:8.10.x`                                        |
| `camunda/console:8.9.x`                | The chart no longer deploys this image. Console runs in `camunda/hub`. |

Configure the Hub repositories under `camundaHub.restapi.image.repository` and `camundaHub.websockets.image.repository`.

Image pins under `webModeler` stay in effect through the fallback. For example, `webModeler.image.tag: 8.9.10` renders `camunda/hub:8.9.10`, which doesn't exist. A pinned `webModeler.restapi.image.repository` or `webModeler.websockets.image.repository` keeps the 8.9 image. Remove the 8.9 image pins from `webModeler`. Pin both Hub images with `camundaHub.image.tag`.

#### Review Hub REST API resources

Console now runs in the Hub REST API pod. However, the Hub REST API keeps the resource defaults of the 8.9 Web Modeler REST API:

| Pod                      | Requests (CPU / memory) | Limits (CPU / memory) |
| :----------------------- | :---------------------- | :-------------------- |
| 8.9 Console              | `1000m` / `1Gi`         | `2000m` / `2Gi`       |
| 8.9 Web Modeler REST API | `900m` / `1280Mi`       | `1800m` / `2560Mi`    |
| 8.10 Hub REST API        | `900m` / `1280Mi`       | `1800m` / `2560Mi`    |

If you ran Console, set `camundaHub.restapi.resources` explicitly. In that case, adjust the requests and limits if the pod is throttled or exhausts its memory.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
