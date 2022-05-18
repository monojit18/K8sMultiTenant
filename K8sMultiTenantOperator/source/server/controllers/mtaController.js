/*jshint esversion: 6 */

class MTAController
{
    
    constructor(applicationInfo)
    {

        const _self = this;
        this.operatorBaseURL = "http://localhost:7070";
        this.commonURL = "/tenants/:tenantName/groups/:groupName";
        this.groupURL = "/groups/:groupName";
        this.namespaceToken = "-ns";
        this.deployToken = "-deploy";
        this.hpaToken = "-hpa";
        this.pvcToken = "-pvc";
        this.podToken = "-pod";
        this.containerToken = "-app";
        this.serviceToken = "-svc";
        this.ingressToken = "-ing";
        this.netpolToken = "-np";
        this.jobToken = "-job";
        this.cronjobToken = "-cronjob";

        this.applicationInfo = applicationInfo;
        this.routerInfo = applicationInfo.routerInfo;

    }

    prepareNamespaceName(groupName)
    {

        const namespaceName = `${groupName}${this.namespaceToken}`;
        return namespaceName;

    }

    prepareDeployName(deployName, tenantName)
    {

        const fullDeployName = `${deployName}-${tenantName}${this.deployToken}`;
        return fullDeployName;

    }

    prepareHPAName(hpaName, tenantName)
    {

        const fullHPAName = `${hpaName}-${tenantName}${this.hpaToken}`;
        return fullHPAName;

    }

    preparePVCName(pvcName, tenantName)
    {

        const fullPVCName = `${pvcName}-${tenantName}${this.pvcToken}`;
        return fullPVCName;

    }

    preparePodName(podName, tenantName)
    {

        const fullPodName = `${podName}-${tenantName}${this.podToken}`;
        return fullPodName;

    }

    prepareContainerName(containerName, tenantName)
    {

        const fullContainerName = `${containerName}-${tenantName}${this.containerToken}`;
        return fullContainerName;

    }

    prepareServiceName(serviceName, tenantName)
    {

        const fullServiceName = `${serviceName}-${tenantName}${this.serviceToken}`;
        return fullServiceName;

    }

    prepareIngressName(ingressName, groupName)
    {

        const fullIngressName = `${ingressName}-${groupName}${this.ingressToken}`;
        return fullIngressName;

    }

    prepareNetPolName(netpolName, groupName)
    {

        const fullNetPolName = `${netpolName}-${groupName}${this.netpolToken}`;
        return fullNetPolName;

    }

    prepareJobName(jobName, tenantName)
    {

        const fullJobName = `${jobName}-${tenantName}${this.jobToken}`;
        return fullJobName;

    }

    prepareCronJobName(cronjobName, tenantName)
    {

        const fullCronJobName = `${cronjobName}-${tenantName}${this.cronjobToken}`;
        return fullCronJobName;

    }

    prepareDefaultParams(request)
    {

        const groupName = request.params.groupName;
        const tenantName = request.params.tenantName;        
        const namespaceName = this.prepareNamespaceName(groupName);

        const defaultParams = { groupName, tenantName, namespaceName };
        return defaultParams;

    }

    prepareNamespaceParams(request)
    {
        
        const namepaceParams = this.prepareDefaultParams(request);
        return namepaceParams;

    }

    prepareDeployParams(request)
    {

        const deployParams = this.prepareDefaultParams(request);
        const deployName = request.params.deployName;
        
        const fullDeployName =
        this.prepareDeployName(deployName, deployParams.tenantName);
        deployParams.fullDeployName = fullDeployName;

        const fullPodName =
        this.preparePodName(deployName, deployParams.tenantName);
        deployParams.fullPodName = fullPodName;

        const fullContainerName =
        this.prepareContainerName(deployName, deployParams.tenantName);
        deployParams.fullContainerName = fullContainerName;
        
        return deployParams;

    }

    prepareHPAParams(request)
    {

        const hpaParams = this.prepareDefaultParams(request);
        const hpaName = request.params.hpaName;
        
        const fullHPAName =
        this.prepareHPAName(hpaName, hpaParams.tenantName);
        hpaParams.fullHPAName = fullHPAName;

        let deployName = "";
        if (request.body != null)
        {

            deployName = request.body.name;
            
            const fullDeployName = 
            this.prepareDeployName(deployName, hpaParams.tenantName);

            hpaParams.fullDeployName = fullDeployName;

        }
        
        return hpaParams;

    }

    preparePVCParams(request)
    {

        const pvcParams = this.prepareDefaultParams(request);
        const pvcName = request.params.pvcName;
        
        const fullPVCName =
        this.preparePVCName(pvcName, pvcParams.tenantName);
        pvcParams.fullPVCName = fullPVCName;
        
        return pvcParams;

    }

    prepareServiceParams(request)
    {

        const serviceParams = this.prepareDefaultParams(request);
        const serviceName = request.params.serviceName;

        const fullServiceName =
        this.prepareServiceName(serviceName, serviceParams.tenantName);
        serviceParams.fullServiceName = fullServiceName;

        const fullPodName =
        this.preparePodName(serviceName, serviceParams.tenantName);
        serviceParams.fullPodName = fullPodName;

        return serviceParams;

    }

    prepareIngressParams(request)
    {

        const ingressParams = this.prepareDefaultParams(request);
        const ingressName = request.params.ingressName;

        const fullIngressName =
        this.prepareIngressName(ingressName, ingressParams.groupName);

        ingressParams.fullIngressName = fullIngressName;
        return ingressParams;

    }

    prepareNetPolParams(request)
    {

        const netpolParams = this.prepareDefaultParams(request);
        const netpolName = request.params.netpolName;

        const fullNetPolName =
        this.prepareNetPolName(netpolName, netpolParams.groupName);

        netpolParams.fullNetPolName = fullNetPolName;        
        return netpolParams;

    }

    prepareJobParams(request)
    {

        const jobParams = this.prepareDefaultParams(request);
        const jobName = request.params.jobName;

        const fullJobName = this.prepareJobName(jobName, jobParams.tenantName);
        jobParams.fullJobName = fullJobName;

        const fullContainerName =
        this.prepareContainerName(jobName, jobParams.tenantName);
        jobParams.fullContainerName = fullContainerName;

        return jobParams;

    }

    prepareCronJobParams(request)
    {

        const cronjobParams = this.prepareDefaultParams(request);
        const cronjobName = request.params.cronjobName;

        const fullCronJobName =
        this.prepareCronJobName(cronjobName, cronjobParams.tenantName);
        cronjobParams.fullCronJobName = fullCronJobName;

        const fullContainerName =
        this.prepareContainerName(cronjobName, cronjobParams.tenantName);
        cronjobParams.fullContainerName = fullContainerName;

        return cronjobParams;

    }
}

module.exports = MTAController;


