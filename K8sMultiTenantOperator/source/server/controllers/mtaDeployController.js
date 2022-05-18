/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTADeployModel = require("../models/mtaDeployModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTADeployController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;        
        this.deployNameURL = "/:deployName";

        const processEnvVars = (requestedEnvVarsList, existingEnvVarsList) =>
        {

            let processedEnvVarsList = existingEnvVarsList;
            if (existingEnvVarsList == null)
                processedEnvVarsList = [];

            requestedEnvVarsList.forEach((requestedEnvVar) =>
            {

                let foundEnvVar = processedEnvVarsList.find((processedVar) =>
                {

                    return (processedVar.name == requestedEnvVar.name);

                });

                let processedEnvVar = {};
                if (foundEnvVar != null)                
                    processedEnvVar = foundEnvVar;
                    
                processedEnvVar.name = requestedEnvVar.name;
                if (requestedEnvVar.valueInfo != null)
                {

                    const fullServiceName =
                    _self.prepareServiceName(`${requestedEnvVar.valueInfo.service}`,
                                             `${requestedEnvVar.valueInfo.tenant}`);

                    const fullNamespaceName =
                    _self.prepareNamespaceName(`${requestedEnvVar.valueInfo.group}`);

                    const processedEnvValue =
                    `${fullServiceName}.${fullNamespaceName}.svc`;

                    processedEnvVar.value = processedEnvValue;
                    
                }
                else
                {

                    if (requestedEnvVar.value != null)
                        processedEnvVar.value = requestedEnvVar.value;
                    else if (requestedEnvVar.valueFrom != null)
                        processedEnvVar.valueFrom = requestedEnvVar.valueFrom;

                }

                if (foundEnvVar == null)
                    processedEnvVarsList.push(processedEnvVar); 

            });

            return processedEnvVarsList;

        };

        const processVolumeMounts = (requestedMountsList, existingMountsList) =>
        {

            let processedMountsList = existingMountsList;
            if (existingMountsList == null)
                processedMountsList = [];

            requestedMountsList.forEach((requestedMountInfo) =>
            {

                let foundMountInfo = processedMountsList.find((processedInfo) =>
                {

                    return (processedInfo.name == requestedMountInfo.name);

                });

                if (foundMountInfo != null)
                    foundMountInfo = requestedMountInfo;
                else
                    processedMountsList.push(requestedMountInfo); 

            });

            return processedMountsList;

        };

        const processVolumes = (requestedVolumesList, existingVolumesList) =>
        {

            let processedVolumesList = existingVolumesList;
            if (existingVolumesList == null)
                processedVolumesList = [];

            requestedVolumesList.forEach((requestedVolumeInfo) =>
            {

                let foundVolumeInfo = processedVolumesList.find((processedInfo) =>
                {

                    return (processedInfo.name == requestedVolumeInfo.name);

                });

                if (foundVolumeInfo != null)
                    foundVolumeInfo = requestedVolumeInfo;
                else
                    processedVolumesList.push(requestedVolumeInfo); 

            });

            return processedVolumesList;

        };

        const fetchDeployAsync = (deployName, namespaceName, deployCallback) =>
        {

            _self.applicationInfo.k8sAppsV1Api.readNamespacedDeployment
            (deployName, namespaceName).then((res) =>
            {
                
                deployCallback(res.body, null);

            }).catch((ex) =>
            {

                deployCallback(null, ex);

            });

        };

        _self.applicationInfo.routerInfo.get(`${_self.deployNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const deployParams = _self.prepareDeployParams(request);

            _self.applicationInfo.k8sAppsV1Api.readNamespacedDeployment
            (deployParams.fullDeployName, deployParams.namespaceName).then((res) =>
            {
                
                const deployInfo = new MTADeployModel(res.body);
                response.status(res.response.statusCode);
                response.send(deployInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });

        });

        _self.applicationInfo.routerInfo.get(`${_self.commonURL}`,
        (request, response) =>
        {
            
            const deployParams = _self.prepareDeployParams(request);
            const labelSelector = `tenant=${deployParams.tenantName}`;

            _self.applicationInfo.k8sAppsV1Api.listNamespacedDeployment
            (deployParams.namespaceName, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {
                
                const deployListInfo = [];
                const deployItemsList = res.body.items;
                deployItemsList.forEach((deployItem) =>
                {

                    const deployInfo = new MTADeployModel(deployItem);
                    deployListInfo.push(deployInfo);

                });
                
                response.status(res.response.statusCode);
                response.send(deployListInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });
        
        _self.applicationInfo.routerInfo.put(`${_self.deployNameURL}${_self.commonURL}`,
        (request, response) =>
        {
                        
            const deployBody = request.body;
            const deployParams = _self.prepareDeployParams(request);

            const yamlDeployString = _self.applicationInfo.yamlDeployString;
            const K8s = _self.applicationInfo.K8s;
            
            const yamlDeploy = K8s.loadYaml(yamlDeployString);
            yamlDeploy.metadata.labels.app = deployParams.fullDeployName;
            yamlDeploy.metadata.labels.tenant = deployParams.tenantName;
            yamlDeploy.metadata.name = yamlDeploy.metadata.labels.app;
            yamlDeploy.metadata.namespace = deployParams.namespaceName;
            yamlDeploy.spec.replicas = deployBody.replicas;
            yamlDeploy.spec.selector.matchLabels.app = deployParams.fullPodName;
            yamlDeploy.spec.selector.matchLabels.tenant = deployParams.tenantName;
            yamlDeploy.spec.template.metadata.annotations = deployBody.annotations;
            
            yamlDeploy.spec.template.metadata.labels.app =
            yamlDeploy.spec.selector.matchLabels.app;
            
            yamlDeploy.spec.template.metadata.labels.tenant =
            yamlDeploy.spec.selector.matchLabels.tenant;
            
            yamlDeploy.spec.template.spec.containers[0].name =
            deployParams.fullContainerName;

            if (deployBody.image != null)
            {
                
                yamlDeploy.spec.template.spec.containers[0].image =
                deployBody.image;

            }
                
            if (deployBody.imagePullPolicy != null)
            {

                yamlDeploy.spec.template.spec.containers[0].imagePullPolicy =
                deployBody.imagePullPolicy;

            }

            if (deployBody.resources != null)
            {

                yamlDeploy.spec.template.spec.containers[0].resources =
                deployBody.resources;

            }

            if (deployBody.readinessProbe != null)
            {

                yamlDeploy.spec.template.spec.containers[0].readinessProbe =
                deployBody.readinessProbe;

            }

            if (deployBody.livenessProbe != null)
            {

                yamlDeploy.spec.template.spec.containers[0].livenessProbe =
                deployBody.livenessProbe;

            }

            if (deployBody.ports != null)
            {

                yamlDeploy.spec.template.spec.containers[0].ports =
                deployBody.ports;

            }

            if (deployBody.env != null)
            {

                const processedEnvVarsList = processEnvVars(deployBody.env, null);
                yamlDeploy.spec.template.spec.containers[0].env = processedEnvVarsList;

            }
            
            if (deployBody.envFrom != null)
            {

                yamlDeploy.spec.template.spec.containers[0].envFrom =
                deployBody.envFrom;

            }                

            if (deployBody.volumeMounts != null)
            {

                yamlDeploy.spec.template.spec.containers[0].volumeMounts =
                deployBody.volumeMounts;

            }
            
            if (deployBody.volumes != null)
                yamlDeploy.spec.template.spec.volumes = deployBody.volumes;

            if (deployBody.poolName != null)
            {

                yamlDeploy.spec.template.spec.nodeSelector.agentpool =
                deployBody.poolName;

            }

            _self.applicationInfo.k8sAppsV1Api.createNamespacedDeployment
            (deployParams.namespaceName, yamlDeploy).then((res) =>
            {

                const deployInfo = new MTADeployModel(res.body);
                response.status(res.response.statusCode);
                response.send(deployInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.patch(`${_self.deployNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const deployBody = request.body;
            const deployParams = _self.prepareDeployParams(request);

            fetchDeployAsync(deployParams.fullDeployName, deployParams.namespaceName,
            (deployInfo, errorInfo) =>
            {

                if (errorInfo !== null)
                {

                    const errorModel = new MTAErrorModel(errorInfo);
                    response.status(errorInfo.statusCode);
                    response.send(errorModel);
                    return;

                }
                
                if (deployBody.replicas != null)
                    deployInfo.spec.replicas = deployBody.replicas;

                if (deployBody.strategy != null)
                    deployInfo.spec.strategy = deployBody.strategy;

                if (deployBody.image != null)
                {

                    deployInfo.spec.template.spec.containers[0].image =
                    deployBody.image;

                }
                
                if (deployBody.imagePullPolicy != null)
                {

                    deployInfo.spec.template.spec.containers[0].imagePullPolicy =
                    deployBody.imagePullPolicy;

                }                    
                    
                if (deployBody.resources != null)
                {

                    deployInfo.spec.template.spec.containers[0].resources =
                    deployBody.resources;

                }

                if (deployBody.readinessProbe != null)
                {

                    yamlDeploy.spec.template.spec.containers[0].readinessProbe =
                    deployBody.readinessProbe;

                }                    

                if (deployBody.livenessProbe != null)
                {

                    yamlDeploy.spec.template.spec.containers[0].livenessProbe =
                    deployBody.livenessProbe;

                }                    

                if (deployBody.ports != null)
                    yamlDeploy.spec.template.spec.containers[0].ports = deployBody.ports;

                let existingEnvVarsList = deployInfo.spec.template.spec.containers[0].env;
                if (deployBody.env != null)
                {

                    const processedEnvVarsList =
                    processEnvVars(deployBody.env, existingEnvVarsList);

                    deployInfo.spec.template.spec.containers[0].env = processedEnvVarsList;

                }
                                
                if (deployBody.envFrom != null)
                    deployInfo.spec.template.spec.containers[0].envFrom = deployBody.envFrom;                

                let existingMountsList = deployInfo.spec.template.spec.containers[0].volumeMounts;
                if (deployBody.volumeMounts != null)
                {

                    const processedMountsList =
                    processVolumeMounts(deployBody.volumeMounts, existingMountsList);

                    deployInfo.spec.template.spec.containers[0].volumeMounts = processedMountsList;

                }

                let existingVolumesList = deployInfo.spec.template.spec.volumes;
                if (deployBody.volumes != null)
                {

                    const processedVolumesList =
                    processVolumes(deployBody.volumes, existingVolumesList);

                    deployInfo.spec.template.spec.volumes = processedVolumesList;

                }

                if (deployBody.nodepool != null)
                    deployInfo.spec.template.spec.nodeSelector.agentpool = deployBody.nodepool;

                const options = {};
                options.headers =
                {
                    "Content-Type": "application/merge-patch+json"

                };

                _self.applicationInfo.k8sAppsV1Api.patchNamespacedDeployment
                (deployParams.fullDeployName, deployParams.namespaceName, deployInfo,
                 undefined, undefined, undefined, undefined, options).then((res) =>
                {

                    const deployInfo = new MTADeployModel(res.body);
                    response.status(res.response.statusCode);
                    response.send(deployInfo);

                }).catch((ex) =>
                {

                    const errorInfo = new MTAErrorModel(ex);
                    response.status(ex.statusCode);
                    response.send(errorInfo);

                });

            });
        });        

        _self.applicationInfo.routerInfo.delete(`${_self.deployNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const deployParams = _self.prepareDeployParams(request);

            _self.applicationInfo.k8sAppsV1Api.deleteNamespacedDeployment
            (deployParams.fullDeployName, deployParams.namespaceName)
            .then((res) =>
            {

                const deleteInfo = new MTADeleteModel(res.body);
                response.status(res.response.statusCode);
                response.send(deleteInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.delete(`${_self.commonURL}`,
        (request, response) =>
        {

            const deployParams = _self.prepareDeployParams(request);
            const labelSelector = `tenant=${deployParams.tenantName}`;

            _self.applicationInfo.k8sAppsV1Api.deleteCollectionNamespacedDeployment
            (deployParams.namespaceName, undefined, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {

                const deleteInfo = new MTADeleteModel(res.body);
                response.status(res.response.statusCode);
                response.send(deleteInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });
    }
}

module.exports = MTADeployController;


