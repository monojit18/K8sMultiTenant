/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTAJobModel = require("../models/mtaJobModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTAJobController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        _self.jobURL = "/:jobName";        

        const fetchJobAsync = (name, namespaceName, jobCallback) =>
        {

            _self.applicationInfo.k8sBatchV1Api.readNamespacedJob
            (name, namespaceName).then((res) =>
            {
                
                jobCallback(res.body, null);

            }).catch((ex) =>
            {

                jobCallback(null, ex);

            });

        };

        _self.applicationInfo.routerInfo.get(_self.jobURL + _self.commonURL,
        (request, response) =>
        {

            const jobParams = _self.prepareJobParams(request);

            _self.applicationInfo.k8sBatchV1Api.readNamespacedJob
            (jobParams.fullJobName, jobParams.namespaceName).then((res) =>
            {
                
                const jobInfo = new MTAJobModel(res.body);
                response.status(res.response.statusCode);
                response.send(jobInfo);

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

            const jobParams = _self.prepareJobParams(request);
            const labelSelector = `tenant=${jobParams.tenantName}`;

            _self.applicationInfo.k8sBatchV1Api.listNamespacedJob
            (jobParams.namespaceName, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {

                const jobListInfo = [];
                const jobItemsList = res.body.items;
                jobItemsList.forEach((jobItem) =>
                {

                    const jobInfo = new MTAJobModel(jobItem);
                    jobListInfo.push(jobInfo);

                });
                
                response.status(res.response.statusCode);
                response.send(jobListInfo);        

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });

        });
        
        _self.applicationInfo.routerInfo.put(_self.jobURL + _self.commonURL,
        (request, response) =>
        {
            
            const jobBody = request.body;
            const jobParams = _self.prepareJobParams(request);

            const yamlJobString = _self.applicationInfo.yamlJobString;
            const K8s = _self.applicationInfo.K8s;
            
            const jobDeploy = K8s.loadYaml(yamlJobString);        
            jobDeploy.metadata.name = jobParams.fullJobName;
            jobDeploy.metadata.namespace = jobParams.namespaceName;
            jobDeploy.metadata.labels.tenant = jobParams.tenantName;
            
            jobDeploy.spec.template.spec.containers[0].name =
            jobParams.fullContainerName;

            if (jobBody.activeDeadlineSeconds)
            {

                jobDeploy.spec.activeDeadlineSeconds =
                jobBody.activeDeadlineSeconds;

            }                

            if (jobBody.backoffLimit)
                jobDeploy.spec.backoffLimit = jobBody.backoffLimit;
            
            if (jobBody.completions)
                jobDeploy.spec.completions = jobBody.completions;
                    
            if (jobBody.parallelism)
                jobDeploy.spec.parallelism = jobBody.parallelism;
            
            if (jobBody.image)
                jobDeploy.spec.template.spec.containers[0].image = jobBody.image;
            
            if (jobBody.imagePullPolicy)
            {

                jobDeploy.spec.template.spec.containers[0].imagePullPolicy =
                jobBody.imagePullPolicy;

            }                
                    
            if (jobBody.command)
            {

                jobDeploy.spec.template.spec.containers[0].command =
                jobBody.command;

            }
            
            _self.applicationInfo.k8sBatchV1Api
            .createNamespacedJob(jobParams.namespaceName, jobDeploy)
            .then((res) =>
            {

                const jobInfo = new MTAJobModel(res.body);
                response.status(res.response.statusCode);
                response.send(jobInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.patch(_self.jobURL + _self.commonURL,
        (request, response) =>
        {

            const jobBody = request.body;
            const jobParams = _self.prepareJobParams(request);

            fetchJobAsync(jobParams.fullJobName, jobParams.namespaceName,
            (jobInfo, errorInfo) =>
            {

                if (errorInfo !== null)
                {

                    const errorModel = new MTAErrorModel(errorInfo);
                    response.status(errorInfo.statusCode);
                    response.send(errorModel);
                    return;

                }
                
                if (jobBody.activeDeadlineSeconds)
                    jobInfo.spec.activeDeadlineSeconds = jobBody.activeDeadlineSeconds;
                    
                if (jobBody.backoffLimit)
                    jobInfo.spec.backoffLimit = jobBody.backoffLimit;

                if (jobBody.completions)
                    jobInfo.spec.completions = jobBody.completions;

                if (jobBody.parallelism)
                    jobInfo.spec.parallelism = jobBody.parallelism;

                const options = {};
                options.headers =
                {
                    "Content-Type": "application/merge-patch+json"

                };

                _self.applicationInfo.k8sBatchV1Api.patchNamespacedJob
                (jobParams.fullJobName, jobParams.namespaceName, jobInfo,
                 undefined, undefined, undefined, undefined, options)
                .then((res) =>
                {

                    const jobInfo = new MTAJobModel(res.body);
                    response.status(res.response.statusCode);
                    response.send(jobInfo);

                }).catch((ex) =>
                {

                    const errorInfo = new MTAErrorModel(ex);
                    response.status(ex.statusCode);
                    response.send(errorInfo);

                });
            });
        });

        _self.applicationInfo.routerInfo.delete(_self.jobURL + _self.commonURL,
        (request, response) =>
        {

            const jobParams = _self.prepareJobParams(request);

            _self.applicationInfo.k8sBatchV1Api.deleteNamespacedJob
            (jobParams.fullJobName, jobParams.namespaceName,
             undefined, undefined, undefined, undefined,"Foreground")
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

        _self.applicationInfo.routerInfo.delete(_self.commonURL,
        (request, response) =>
        {

            const jobParams = _self.prepareJobParams(request);
            const labelSelector = `tenant=${jobParams.tenantName}`;

            _self.applicationInfo.k8sBatchV1Api.deleteCollectionNamespacedJob
            (jobParams.namespaceName, undefined, undefined, undefined,
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

module.exports = MTAJobController;


