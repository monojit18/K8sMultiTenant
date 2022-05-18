/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTACronJobModel = require("../models/mtaCronJobModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTACronJobController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        _self.cronjobURL = "/:cronjobName";        

        const fetchCronJobAsync = (name, namespaceName, cronjobCallback) =>
        {

            _self.applicationInfo.k8sBatchV1beta1Api.readNamespacedCronJob
            (name, namespaceName).then((res) =>
            {
                
                cronjobCallback(res.body, null);

            }).catch((ex) =>
            {

                cronjobCallback(null, ex);

            });

        };  

        _self.applicationInfo.routerInfo.get(_self.cronjobURL + _self.commonURL,
        (request, response) =>
        {
            
            const cronjobParams = _self.prepareCronJobParams(request);

            _self.applicationInfo.k8sBatchV1beta1Api.readNamespacedCronJob
            (cronjobParams.fullCronJobName, cronjobParams.namespaceName)
            .then((res) =>
            {
                
                const cronjobInfo = new MTACronJobModel(res.body);
                response.status(res.response.statusCode);
                response.send(cronjobInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });

        });

        _self.applicationInfo.routerInfo.get(_self.commonURL,
        (request, response) =>
        {

            const cronjobParams = _self.prepareCronJobParams(request);
            const labelSelector = `tenant=${cronjobParams.tenantName}`;

            _self.applicationInfo.k8sBatchV1beta1Api.listNamespacedCronJob
            (cronjobParams.namespaceName, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {

                const cronjobListInfo = [];
                const cronjobItemsList = res.body.items;
                cronjobItemsList.forEach((cronjobItem) =>
                {

                    const cronjobInfo = new MTACronJobModel(cronjobItem);
                    cronjobListInfo.push(cronjobInfo);

                });
                
                response.status(res.response.statusCode);
                response.send(cronjobListInfo);        

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });

        });
        
        _self.applicationInfo.routerInfo.put(_self.cronjobURL + _self.commonURL,
        (request, response) =>
        {
            
            const cronjobBody = request.body;
            const cronjobParams = _self.prepareCronJobParams(request);

            const yamlCronJobString = _self.applicationInfo.yamlCronJobString;
            const K8s = _self.applicationInfo.K8s;
            
            const cronjobDeploy = K8s.loadYaml(yamlCronJobString);
            cronjobDeploy.metadata.name = cronjobParams.fullCronJobName;
            cronjobDeploy.metadata.namespace = cronjobParams.namespaceName;
            cronjobDeploy.metadata.labels.tenant = cronjobParams.tenantName;

            if (cronjobBody.schedule != null)
                cronjobDeploy.spec.schedule = cronjobBody.schedule;

            if (cronjobBody.concurrencyPolicy != null)
                cronjobDeploy.spec.concurrencyPolicy = cronjobBody.concurrencyPolicy;

            if (cronjobBody.failedJobsHistoryLimit != null)
                cronjobDeploy.spec.failedJobsHistoryLimit = cronjobBody.failedJobsHistoryLimit;

            if (cronjobBody.startingDeadlineSeconds != null)
                cronjobDeploy.spec.startingDeadlineSeconds = cronjobBody.startingDeadlineSeconds;

            if (cronjobBody.successfulJobsHistoryLimit != null)
                cronjobDeploy.spec.successfulJobsHistoryLimit = cronjobBody.successfulJobsHistoryLimit;

            if (cronjobBody.suspend != null)
                cronjobDeploy.spec.suspend = cronjobBody.suspend;

            if (cronjobBody.image != null)
            {

                cronjobDeploy.spec.jobTemplate.spec.template.spec.containers[0].image =
                cronjobBody.image;

            }                

            if (cronjobBody.imagePullPolicy != null)
            {

                cronjobDeploy.spec.jobTemplate.spec.template.spec.containers[0].imagePullPolicy =
                cronjobBody.imagePullPolicy;

            }

            cronjobDeploy.spec.jobTemplate.spec.template.spec.containers[0].name =
            cronjobParams.fullContainerName;

            cronjobDeploy.spec.jobTemplate.spec.template.spec.containers[0].command =
            cronjobBody.command;

            _self.applicationInfo.k8sBatchV1beta1Api.createNamespacedCronJob
            (cronjobParams.namespaceName, cronjobDeploy).then((res) =>
            {
            
                const cronjobInfo = new MTACronJobModel(res.body);
                response.status(res.response.statusCode);
                response.send(cronjobInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.patch(_self.cronjobURL + _self.commonURL,
        (request, response) =>
        {

            const cronjobBody = request.body;
            const cronjobParams = _self.prepareCronJobParams(request);

            fetchCronJobAsync(cronjobParams.fullCronJobName, cronjobParams.namespaceName,
            (cronjobInfo, errorInfo) =>
            {

                if (errorInfo !== null)
                {

                    const errorModel = new MTAErrorModel(errorInfo);
                    response.status(errorInfo.statusCode);
                    response.send(errorModel);
                    return;

                }
                
                if (cronjobBody.schedule != null)
                    cronjobInfo.spec.schedule = cronjobBody.schedule;
                
                if (cronjobBody.concurrencyPolicy != null)
                    cronjobInfo.spec.concurrencyPolicy = cronjobBody.concurrencyPolicy;

                if (cronjobBody.failedJobsHistoryLimit != null)
                    cronjobInfo.spec.failedJobsHistoryLimit = cronjobBody.failedJobsHistoryLimit;
                    
                if (cronjobBody.startingDeadlineSeconds != null)
                    cronjobInfo.spec.startingDeadlineSeconds = cronjobBody.startingDeadlineSeconds;

                if (cronjobBody.successfulJobsHistoryLimit != null)
                    cronjobInfo.spec.successfulJobsHistoryLimit = cronjobBody.successfulJobsHistoryLimit;

                if (cronjobBody.suspend != null)
                    cronjobInfo.spec.suspend = cronjobBody.suspend;

                const options = {};
                options.headers =
                {
                    "Content-Type": "application/merge-patch+json"

                };

                _self.applicationInfo.k8sBatchV1beta1Api.patchNamespacedCronJob
                (cronjobParams.fullCronJobName, cronjobParams.namespaceName, cronjobInfo,
                 undefined, undefined, undefined, undefined, options)
                .then((res) =>
                {

                    const cronjobInfo = new MTACronJobModel(res.body);
                    response.status(res.response.statusCode);
                    response.send(cronjobInfo);

                }).catch((ex) =>
                {

                    const errorInfo = new MTAErrorModel(ex);
                    response.status(ex.statusCode);
                    response.send(errorInfo);

                });

            });
        });

        _self.applicationInfo.routerInfo.delete(_self.cronjobURL + _self.commonURL,
        (request, response) =>
        {                        
            
            const cronjobParams = _self.prepareCronJobParams(request);

            _self.applicationInfo.k8sBatchV1beta1Api.deleteNamespacedCronJob
            (cronjobParams.fullCronJobName, cronjobParams.namespaceName,
             undefined, undefined, undefined, undefined, "Foreground")
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

        _self.applicationInfo.routerInfo.delete( _self.commonURL,
        (request, response) =>
        {                        
            
            const cronjobParams = _self.prepareCronJobParams(request);
            const labelSelector = `tenant=${cronjobParams.tenantName}`;

            _self.applicationInfo.k8sBatchV1beta1Api.deleteCollectionNamespacedCronJob
            (cronjobParams.namespaceName, undefined, undefined, undefined,
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

module.exports = MTACronJobController;


