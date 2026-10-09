# Camunda manual installation — Reference architecture — Run the Orchestration Cluster

Once you've downloaded the Orchestration Cluster distribution, extract it into a folder.

1. Extract the files using your GUI or CLI:

   ```bash
   mkdir -p camunda && unzip camunda-zeebe-x.y.z.zip  -d camunda

   mkdir -p camunda && tar -xzf camunda-zeebe-x.y.z.tar.gz -C camunda
   ```

2. Open the extracted folder.
3. Update the configuration in `config/application.yaml`, or export the environment variables.
4. Navigate to `bin` folder.
5. Run `camunda.sh` (Linux/macOS) or `camunda.bat` (Windows).
6. Open [http://localhost:8080](http://localhost:8080). On first access, you'll be asked to create an admin user unless [Admin](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties) is configured with OIDC or a similar option.

**Note**
Camunda 8 components without a valid license may display **Non-Production License** in the navigation bar and issue warnings in the logs. These warnings don’t affect startup or functionality, except that Camunda Hub is limited to five users. To obtain a license, visit the [Camunda Enterprise page](https://camunda.com/platform/camunda-platform-enterprise-contact/).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
