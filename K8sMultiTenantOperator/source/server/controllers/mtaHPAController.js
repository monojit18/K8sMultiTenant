/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTAHPAModel = require("../models/mtaHPAModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTAHPAController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.hpaNameURL = "/:hpaName/v1";

        const fetchHPAAsync = (name, namespaceName, hpaCallback) =>
        {

            _self.applicationInfo.k8sAutoscalingV1Api
            .readNamespacedHorizontalPodAutoscaler
            (name, namespaceName).then((res) =>
            {
                
                hpaCallback(res.body, null);

            }).catch((ex) =>
            {

                hpaCallback(null, ex);

            });

        };

        _self.applicationInfo.routerInfo.get(`${_self.hpaNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const hpaParams = _self.prepareHPAParams(request);

            _self.applicationInfo.k8sAutoscalingV1Api
            .readNamespacedHorizontalPodAutoscaler
            (hpaParams.fullHPAName, hpaParams.namespaceName)
            .then((res) =>
            {
                
                const hpaInfo = new MTAHPAModel(res.body);
                response.status(res.response.statusCode);
                response.send(hpaInfo);

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
            
            const hpaParams = _self.prepareHPAParams(request);
            const labelSelector = `tenant=${hpaParams.tenantName}`;

            _self.applicationInfo.k8sAutoscalingV1Api
            .listNamespacedHorizontalPodAutoscaler
            (hpaParams.namespaceName, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {
                
                const hpaListInfo = [];
                const hpaItemsList = res.body.items;
                hpaItemsList.forEach((hpaItem) =>
                {

                    const hpaInfo = new MTAHPAModel(hpaItem);
                    hpaListInfo.push(hpaInfo);

                });
                
                response.status(res.response.statusCode);
                response.send(hpaListInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });
        
        _self.applicationInfo.routerInfo.put(`${_self.hpaNameURL}${_self.commonURL}`,
        (request, response) =>
        {
                        
            const hpaBody = request.body;
            const hpaParams = _self.prepareHPAParams(request);

            const yamlHPAString = _self.applicationInfo.yamlHPAString;
            const K8s = _self.applicationInfo.K8s;
            
            const yamlHPA = K8s.loadYaml(yamlHPAString);
            yamlHPA.metadata.labels.app = hpaParams.fullHPAName;
            yamlHPA.metadata.labels.tenant = hpaParams.tenantName;
            yamlHPA.metadata.name = hpaParams.fullHPAName;
            yamlHPA.metadata.namespace = hpaParams.namespaceName;
            yamlHPA.spec.scaleTargetRef.name = hpaParams.fullDeployName;

            if (hpaBody.minReplicas != null)
                yamlHPA.spec.minReplicas = hpaBody.minReplicas;
                
            if (hpaBody.maxReplicas != null)
                yamlHPA.spec.maxReplicas = hpaBody.maxReplicas;
            
            if (hpaBody.cpuPercentage != null)
            {

                yamlHPA.spec.targetCPUUtilizationPercentage =
                hpaBody.cpuPercentage;

            }

            _self.applicationInfo.k8sAutoscalingV1Api
            .createNamespacedHorizontalPodAutoscaler
            (hpaParams.namespaceName, yamlHPA).then((res) =>
            {

                const hpaInfo = new MTAHPAModel(res.body);
                response.status(res.response.statusCode);
                response.send(hpaInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.patch(`${_self.hpaNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const hpaBody = request.body;
            const hpaParams = _self.prepareHPAParams(request);

            fetchHPAAsync(hpaParams.fullHPAName, hpaParams.namespaceName,
            (hpaInfo, errorInfo) =>
            {

                if (errorInfo !== null)
                {

                    const errorModel = new MTAErrorModel(errorInfo);
                    response.status(errorInfo.statusCode);
                    response.send(errorModel);
                    return;

                }
                
                if (hpaBody.minReplicas != null)
                    hpaInfo.spec.minReplicas = hpaBody.minReplicas;
                
                if (hpaBody.minReplicas != null)
                    hpaInfo.spec.maxReplicas = hpaBody.maxReplicas;

                if (hpaBody.minReplicas != null)
                {

                    hpaInfo.spec.targetCPUUtilizationPercentage =
                    hpaBody.cpuPercentage;
                    
                }                

                const options = {};
                options.headers =
                {
                    "Content-Type": "application/merge-patch+json"

                };

                _self.applicationInfo.k8sAutoscalingV1Api
                .patchNamespacedHorizontalPodAutoscaler
                (hpaParams.fullHPAName, hpaParams.namespaceName, hpaInfo,
                 undefined, undefined, undefined, undefined, options)
                .then((res) =>
                {

                    const hpaInfo = new MTAHPAModel(res.body);
                    response.status(res.response.statusCode);
                    response.send(hpaInfo);

                }).catch((ex) =>
                {

                    const errorInfo = new MTAErrorModel(ex);
                    response.status(ex.statusCode);
                    response.send(errorInfo);

                });

            });
        });        

        _self.applicationInfo.routerInfo.delete(`${_self.hpaNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const hpaParams = _self.prepareHPAParams(request);

            _self.applicationInfo.k8sAutoscalingV1Api
            .deleteNamespacedHorizontalPodAutoscaler
            (hpaParams.fullHPAName, hpaParams.namespaceName)
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

            const hpaParams = _self.prepareHPAParams(request);
            const labelSelector = `tenant=${hpaParams.tenantName}`;

            _self.applicationInfo.k8sAutoscalingV1Api
            .deleteCollectionNamespacedHorizontalPodAutoscaler
            (hpaParams.namespaceName, undefined, undefined, undefined,
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

module.exports = MTAHPAController;


