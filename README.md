## K8sMultiTenantOperator

- ### Import Multi tenant Operator

  - Login to your CLI - **az login**

  - Import Image from different repository using the following command

    ```bash
    az acr import --name <your_ACR_name> --source aksltacr.azurecr.io/multi-tenant-operator:v1.0.0 --image multi-tenant-operator:v1.0.0 --username "" --password ""
    ```

  - Goto **Tests/Operator** folder

    - Goto **YAMLs** folder
    - Open **multi-tenant-operator-deployment.yaml**

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: multi-tenant-operator-deploy
      namespace: multi-tenant-dev
    spec:
      selector:
          matchLabels:
            app: multi-tenant-operator-pod
      replicas: 1
      template:
          metadata:
            labels:
              app: multi-tenant-operator-pod
          spec:
            containers:
            - name: multi-tenant-operator-app
              image: <your_ACR_uri>/multi-tenant-operator:v1.0.0
              imagePullPolicy: Always
              resources:
                requests:
                  memory: "100Mi"
                  cpu: "500m"
                limits:
                  memory: "200Mi"
                  cpu: "1"
              ports:
              - containerPort: 7070
              volumeMounts:
              - mountPath: /usr/src/operator/mnt/templates/yamls
                name: yamls-volume          
            nodeSelector:
              agentpool: ltsyspool
            volumes:
            - name: yamls-volume
              projected:
                sources:
                - configMap:
                    name: config-cm
                - configMap:
                    name: ns-cm
                - configMap:
                    name: deploy-cm
                - configMap:
                    name: svc-cm
                - configMap:
                    name: ing-cm
                - configMap:
                    name: job-cm
                - configMap:
                    name: cronjob-cm              
    ```

    - Open **multi-tenant-operator-service.yaml**

      ```yaml
      apiVersion: v1
      kind: Service
      metadata:
        name: multi-tenant-operator-svc
        namespace: multi-tenant-dev
      spec:
        selector:
          app: multi-tenant-operator-pod
        ports:
        - protocol: TCP
          port: 80
          targetPort: 7070    
        type: LoadBalancer
      ```

      Make sure that the type *(last line*) is **LoadBalancer**

    - Go to **Templates** folder

      - Run the following command to connect to your AKS cluster

      ```bash
      az aks get-credentials -g <rg> -n <cluster_name> --admin
      ```

      - Go to your User Directory and Open the **.keuconfig** folder (***<u>this would be hidden</u>***)
      - Copy the **config** file that is inside
      - Paste it into the Current **Templates** directory. This would override the existing ***config*** file there
      - Run the following commands one by one to deploy the necessary configuration map objects

      ```bash
      k create cm config-cm -n multi-tenant-dev --from-file=./config
      k create cm ns-cm -n multi-tenant-dev --from-file=./template-ns.yaml
      k create cm deploy-cm -n multi-tenant-dev --from-file=./template-deploy.yaml
      k create cm svc-cm -n multi-tenant-dev --from-file=./template-svc.yaml
      k create cm ing-cm -n multi-tenant-dev --from-file=./template-ing.yaml
      k create cm job-cm -n multi-tenant-dev --from-file=./template-job.yaml
      k create cm cronjob-cm -n multi-tenant-dev --from-file=./template-cronjob.yaml
      ```

    - Go to Azure CLI command line

    - Run following commands to deploy the Multi Tenant App

      ```bash
      k apply -f <path_to_Tests/Operator/YAMLs_folder>
      ```

  - Also provide is the Postman Script files

  - Start testing the APIs in this order

    - **Namespace**
    - **Deploy**
    - **Service**
    - **Ingress**
    - **NetPol** - *Network Policies*
    - **Jobs** - (*not needed for your Use Case*)
    - **CronJobs**  - (*not needed for your Use Case*)

