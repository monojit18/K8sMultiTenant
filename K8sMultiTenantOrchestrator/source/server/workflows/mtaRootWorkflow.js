/*jshint esversion: 6 */

const MTATenantModel = require("../models/mtaTenantModel");

class MTARootWorkflow
{
    
    constructor(applicationInfo)
    {

        const _self = this;
        this.applicationInfo = applicationInfo;
        this.routerInfo = applicationInfo.routerInfo;
        this.nextWorkflow = null;
        this.baseURL = null;
        this.requestBody = null;

    }

    prepareDefaultParams(request)
    {

        const namespaceName = request.params.groupName;
        const tenantName = request.params.tenantName;

        const defaultParams = { tenantName, namespaceName };
        return defaultParams;

    }

    prepareNamespaceParams(request)
    {
        
        const namespaceParams = this.prepareDefaultParams(request);
        
        const namespaceURL = `/${namespaceParams.namespaceName}`;
        namespaceParams.namespaceURL = namespaceURL;        
        return namespaceParams;

    }

    prepareDeployParams(request, deployBody)
    {
        
        const deployParams = this.prepareDefaultParams(request);

        const deployName = (deployBody != null) ? deployBody.name : null;
        deployParams.deployName = deployName;

        const commonURL = this.prepareCommonURL(deployParams.tenantName,
                                                deployParams.namespaceName);
        deployParams.deployURL = commonURL;
        return deployParams;

    }

    prepareHPAParams(request, hpaBody)
    {
        
        const hpaParams = this.prepareDefaultParams(request);

        const hpaName = (hpaBody != null) ? hpaBody.name : null;
        hpaParams.hpaName = hpaName;

        const commonURL = this.prepareCommonURL(hpaParams.tenantName,
                                                hpaParams.namespaceName);
        hpaParams.hpaURL = commonURL;
        return hpaParams;

    }

    prepareServiceParams(request, serviceBody)
    {
        
        const serviceParams = this.prepareDefaultParams(request);

        const serviceName = (serviceBody != null) ? serviceBody.name : null;
        serviceParams.serviceName = serviceName;

        const commonURL = this.prepareCommonURL(serviceParams.tenantName,
                                                serviceParams.namespaceName);
        serviceParams.serviceURL = commonURL;
        return serviceParams;

    }

    prepareIngressParams(request, ingressBody)
    {
        
        const ingressParams = this.prepareDefaultParams(request);

        const ingressName = (ingressBody != null) ? ingressBody.name : null;
        ingressParams.ingressName = ingressName;

        const ingressURL = `/groups/${ingressParams.namespaceName}`;
        ingressParams.ingressURL = ingressURL;
        return ingressParams;

    }

    prepareNetPolParams(request, netpolBody)
    {
        
        const netpolParams = this.prepareDefaultParams(request);

        const netpolName = (netpolBody != null) ? netpolBody.name : null;
        netpolParams.netpolName = netpolName;

        const netpolURL = `/groups/${netpolParams.namespaceName}`;        
        netpolParams.netpolURL = netpolURL;
        return netpolParams;

    }

    prepareCommonURL(tenantName, namespaceName)
    {

        const commonURL = `/tenants/${tenantName}/groups/${namespaceName}`;
        return commonURL;

    }

    addWorkflow(workflow)
    {

        this.nextWorkflow = workflow;
        return workflow;

    }

    deleteAsync(request, deleteURL, deleteConfig, tenantInfo, tenantCallback)
    {
        
        const self = this;
        self.applicationInfo.Axios.delete(deleteURL, deleteConfig)
        .then((res) =>
        {
                        
            if (self.nextWorkflow != null)
                self.nextWorkflow.executeDeleteAsync(request, tenantInfo,
                                                     tenantCallback);
            else
                tenantCallback(tenantInfo, res.status);

        }).catch((ex) =>
        {
            
            tenantInfo.addErrorModel(ex.response);
            if (self.nextWorkflow != null)
                self.nextWorkflow.executeDeleteAsync(request, tenantInfo, tenantCallback);
            else
                tenantCallback(tenantInfo, ex.response.status);

        });
    }

    executeCreateAsync(request, tenantInfo, tenantCallback) {}
    executeUpdateAsync(request, tenantInfo, tenantCallback) {}
    executeDeleteAsync(request, tenantInfo, tenantCallback) {}
    
}

module.exports = MTARootWorkflow;


