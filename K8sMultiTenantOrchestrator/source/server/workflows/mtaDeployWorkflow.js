/*jshint esversion: 6 */

const MTARootWorkflow = require("./mtaRootWorkflow");

class MTADeployWorkflow extends MTARootWorkflow
{
    
    constructor(applicationInfo, deployBody)
    {

        super(applicationInfo);
        const _self = this;
        this.baseURL = process.env.OPERATOR_BASE_URL + "/deploy";
        this.requestBody = deployBody;

    }

    fetchDeployAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;        
        const deployParams = self.prepareDeployParams(request,
                                                      self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${deployParams.deployName}`;

        self.applicationInfo.Axios.get(deployParams.deployURL,
                                       config)
        .then((res) =>
        {

            if (res.data.name == null)
                self.createDeployAsync(request, tenantInfo,
                                       tenantCallback);
            else
                this.patchDeployAsync(request, tenantInfo,
                                      tenantCallback); 

        }).catch((ex) =>
        {

            tenantInfo.addErrorModel(ex.response);
            if (self.nextWorkflow != null)
                self.nextWorkflow.executeUpdateAsync(request, tenantInfo,
                                                     tenantCallback);
            else
                tenantCallback(tenantInfo, ex.response.status);

        });
    }

    createDeployAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;        
        const deployParams = self.prepareDeployParams(request,
                                                      self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${deployParams.deployName}`;
        
        self.applicationInfo.Axios.put(deployParams.deployURL,
                                       self.requestBody, config)
        .then((res) =>
        {

            tenantInfo.addDeployModel(res);
            if (self.nextWorkflow != null)
                self.nextWorkflow.executeCreateAsync(request, tenantInfo,
                                                     tenantCallback);
            else
                tenantCallback(tenantInfo, res.status);

        }).catch((ex) =>
        {

            tenantInfo.addErrorModel(ex.response);
            if (self.nextWorkflow != null)
                self.nextWorkflow.executeCreateAsync(request, tenantInfo,
                                                     tenantCallback);
            else
                tenantCallback(tenantInfo, ex.response.status);

        });
    }

    patchDeployAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;                
        const deployParams = self.prepareDeployParams(request, self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${deployParams.deployName}`;

        self.applicationInfo.Axios.patch(deployParams.deployURL,
                                         self.requestBody, config)
        .then((res) =>
        {

            tenantInfo.addDeployModel(res);
            if (self.nextWorkflow != null)
                self.nextWorkflow.executeUpdateAsync(request, tenantInfo,
                                                     tenantCallback);
            else
                tenantCallback(tenantInfo, res.status);

        }).catch((ex) =>
        {

            tenantInfo.addErrorModel(ex.response);
            if (self.nextWorkflow != null)
                self.nextWorkflow.executeUpdateAsync(request, tenantInfo,
                                                     tenantCallback);
            else
                tenantCallback(tenantInfo, ex.response.status);

        });
    }

    executeCreateAsync(request, tenantInfo, tenantCallback)
    {

        this.createDeployAsync(request, tenantInfo, tenantCallback);

    }

    executeUpdateAsync(request, tenantInfo, tenantCallback)
    {

        this.fetchDeployAsync(request, tenantInfo,
                              tenantCallback);

    }

    executeDeleteAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const deployParams = self.prepareDeployParams(request,
                                                      self.requestBody);

        const config = {};
        config.baseURL = (self.requestBody != null) ? `${self.baseURL}/${deployParams.deployName}`
                                                    : `${self.baseURL}`;

        self.deleteAsync(request, deployParams.deployURL, config,
                         tenantInfo, tenantCallback);

    }

}

module.exports = MTADeployWorkflow;


