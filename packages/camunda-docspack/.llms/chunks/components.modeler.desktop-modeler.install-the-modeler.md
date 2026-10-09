# Install Desktop Modeler

Learn how to install Camunda Desktop Modeler, a desktop application for modeling BPMN, DMN, and Forms and support building executable diagrams with Camunda.

This document guides you through Desktop Modeler (also known as Camunda Modeler) installation, our local modeler. Desktop Modeler is a desktop application for modeling BPMN, DMN, and Forms, and supports you in building executable diagrams with Camunda.


## Installation

To install [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index) for Windows, macOS, and Linux, visit the [Camunda downloads page](https://camunda.com/download/modeler/). Select your preferred version and take the following steps:

1. Unpack the archive (any platform) or open the `.dmg` file (macOS).
2. For macOS users, move the app to your applications folder (macOS).
3. Start the Camunda Modeler (Windows) or `camunda-modeler` (Linux) executable, or the Camunda Modeler application (macOS).

### linux

Ensure the installation is owned by `root` and accessible to all users of the machine by following the steps below.

1. Unpack the zip archive using the `tar` command:

```shell
cd /usr/bin
sudo tar xvfz ~/Downloads/camunda-modeler-5.41.0-linux-x64.tar.gz
```

2. Ensure the access permissions of the `chrome-sandbox` file are correct and create a link to this version:

```shell
sudo chmod 4755 camunda-modeler-5.41.0-linux-x64/chrome-sandbox
sudo ln -s camunda-modeler-5.41.0-linux-x64/camunda-modeler camunda-modeler
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/install-the-modeler
