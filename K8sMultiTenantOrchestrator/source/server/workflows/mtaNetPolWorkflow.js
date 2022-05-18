/*jshint esversion: 6 */

const MTARootWorkflow = require("./mtaRootWorkflow");

class MTANetpolWorkflow extends MTARootWorkflow
{
    
    constructor(applicationInfo, netpolBody)
    {

        super(applicationInfo);
        const _self = this;
        this.baseURL = process.env.OPERATOR_BASE_URL + "/netpol";
        this.requestBody = netpolBody;

    }

    fetchNetPolAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;        
        const netpolParams = self.prepareNetPolParams(request,
                                                      self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${netpolParams.netpolName}`;

        self.applicationInfo.Axios.get(netpolParams.netpolURL,
                                       config)
        .then((res) =>
        {

            if (res.data.name == null)
                self.createNetPolAsync(request, tenantInfo,
                                       tenantCallback);
            else
                this.patchNetPolAsync(request, tenantInfo,
                                      tenantCallback); 

        }).catch((ex) =>
        {

            if (ex.response.status === 404)
                self.createNetPolAsync(request, tenantInfo,
                                        tenantCallback);
            else
            {
                
                tenantInfo.addErrorModel(ex.response);
                if (self.nextWorkflow != null)
                    self.nextWorkflow.executeUpdateAsync(request, tenantInfo,
                                                        tenantCallback);
                else
                    tenantCallback(tenantInfo, ex.response.status);

            }
        });
    }

    createNetPolAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;        
        const netpolParams = self.prepareNetPolParams(request,
                                                      self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${netpolParams.netpolName}`;
        
        self.applicationInfo.Axios.put(netpolParams.netpolURL,
                                       self.requestBody, config)
        .then((res) =>
        {

            tenantInfo.addNetPolModel(res);
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

    patchNetPolAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;                
        const netpolParams = self.prepareNetPolParams(request, self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${netpolParams.netpolName}`;

        self.applicationInfo.Axios.patch(netpolParams.netpolURL,
                                         self.requestBody, config)
        .then((res) =>
        {

            tenantInfo.addNetPolModel(res);
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

        this.createNetPolAsync(request, tenantInfo, tenantCallback);

    }

    executeUpdateAsync(request, tenantInfo, tenantCallback)
    {

        this.fetchNetPolAsync(request, tenantInfo, tenantCallback);

    }

    executeDeleteAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const netpolParams = self.prepareNetPolParams(request,
                                                      self.requestBody);

        const config = {};
        config.baseURL = (self.requestBody != null) ? `${self.baseURL}/${netpolParams.netpolName}`
                                                    : `${self.baseURL}`;

        self.deleteAsync(request, netpolParams.netpolURL, config,
                         tenantInfo, tenantCallback);

    }

}

module.exports = MTANetpolWorkflow;


