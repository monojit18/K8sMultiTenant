/*jshint esversion: 6 */

const MTARootWorkflow = require("./mtaRootWorkflow");

class MTANamespaceWorkflow extends MTARootWorkflow
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.baseURL = process.env.OPERATOR_BASE_URL + "/groups";

    }

    fetchNamespaceAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const namespaceParams = self.prepareNamespaceParams(request);
        

        const config = {};
        config.baseURL = self.baseURL;

        self.applicationInfo.Axios.get(namespaceParams.namespaceURL,
                                       config)
        .then((res) =>
        {
            
            tenantInfo.addNamespaceModel(res);
            if (res.data.name == null)
                self.createNamespaceAsync(request, tenantInfo,
                                          tenantCallback);
            else if (self.nextWorkflow != null)
                self.nextWorkflow.executeCreateAsync(request, tenantInfo,
                                                     tenantCallback);
            else
                tenantCallback(tenantInfo, res.status);

        }).catch((ex) =>
        {

            if (ex.response.status === 404)
                self.createNamespaceAsync(request, tenantInfo,
                                          tenantCallback);
            else
            {
                
                tenantInfo.addErrorModel(ex.response);
                tenantCallback(tenantInfo, ex.response.status);

            }
        });
    }

    createNamespaceAsync(request, tenantInfo, tenantCallback)
    {
        
        const self = this;
        const namespaceParams = self.prepareNamespaceParams(request);
        
        const config = {};
        config.baseURL = this.baseURL;
        
        self.applicationInfo.Axios.put(namespaceParams.namespaceURL, {},
                                       config)
        .then((res) =>
        {
            
            tenantInfo.addNamespaceModel(res);
            if (self.nextWorkflow != null)
                self.nextWorkflow.executeCreateAsync(request, tenantInfo,
                                                     tenantCallback);
            else
                tenantCallback(tenantInfo, res.status);

        }).catch((ex) =>
        {
            
            tenantInfo.addErrorModel(ex.response);
            tenantCallback(tenantInfo, ex.response.status);

        });
    }

    deleteNamespaceAsync(request, tenantInfo, tenantCallback)
    {
        
        const self = this;
        const namespaceParams = self.prepareNamespaceParams(request);        

        const config = {};
        config.baseURL = this.baseURL;
        
        self.deleteAsync(request, namespaceParams.namespaceURL,
                         config, tenantInfo, tenantCallback);
        
    }

    executeCreateAsync(request, tenantInfo, tenantCallback)
    {

        this.fetchNamespaceAsync(request, tenantInfo,
                                 tenantCallback);

    }

    executeDeleteAsync(request, tenantInfo, tenantCallback)
    {

        this.deleteNamespaceAsync(request, tenantInfo,
                                  tenantCallback);

    }
    
}

module.exports = MTANamespaceWorkflow;


