/*jshint esversion: 6 */

const MTARootWorkflow = require("./mtaRootWorkflow");

class MTAIngressWorkflow extends MTARootWorkflow
{
    
    constructor(applicationInfo, ingressBody)
    {

        super(applicationInfo);
        const _self = this;
        this.baseURL = process.env.OPERATOR_BASE_URL + "/ingress";        
        this.requestBody = ingressBody;

    }

    preparePatchBody(tenantName)
    {

        const self = this;
        if ((self.requestBody.add != null ) ||
            (self.requestBody.delete != null))
            return;

        const patchBody  = {};
        patchBody.host = self.requestBody.host;
        patchBody.add = [];

        self.requestBody.paths.forEach((pathInfo) =>
        {

            const addBody = {};
            addBody.service = pathInfo.service;
            addBody.port = pathInfo.port;
            addBody.path = pathInfo.path;
            addBody.tenant = tenantName;

            patchBody.add.push(addBody);

        });
        
        self.requestBody = patchBody;

    }

    addTenantName(tenantName)
    {

        const self = this;
        if (self.requestBody == null)
            return;
        
        if (self.requestBody.paths == null)
            return;

        self.requestBody.paths.forEach((pathInfo) =>
        {

            pathInfo.tenant = tenantName;

        });

    }

    fetchIngressAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const ingressParams = self.prepareIngressParams(request,
                                                        self.requestBody);

        const config = {};            
        config.baseURL = `${self.baseURL}/${ingressParams.ingressName}`;

        self.applicationInfo.Axios.get(ingressParams.ingressURL, config)
        .then((res) =>
        {

            if (res.data.name == null)
                self.createIngressAsync(request, tenantInfo, tenantCallback);
            else                
                self.patchIngressAsync(request, tenantInfo, tenantCallback);

        }).catch((ex) =>
        {

            if (ex.response.status === 404)
                self.createIngressAsync(request, tenantInfo,
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

    patchIngressAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const ingressParams = self.prepareIngressParams(request,
                                                        self.requestBody);

        const config = {};            
        config.baseURL = `${self.baseURL}/${ingressParams.ingressName}`;

        self.preparePatchBody(ingressParams.tenantName);
        self.applicationInfo.Axios.patch(ingressParams.ingressURL,
                                         [self.requestBody], config)
        .then((res) =>
        {

            tenantInfo.addIngressModel(res);
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

    createIngressAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const ingressParams = self.prepareIngressParams(request,
                                                        self.requestBody);

        const config = {};            
        config.baseURL = `${self.baseURL}/${ingressParams.ingressName}`;
        
        self.addTenantName(ingressParams.tenantName);
        self.applicationInfo.Axios.put(ingressParams.ingressURL, [self.requestBody],
                                       config)
        .then((res) =>
        {

            tenantInfo.addIngressModel(res);
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

    executeCreateAsync(request, tenantInfo, tenantCallback)
    {

        this.fetchIngressAsync(request, tenantInfo, tenantCallback);

    }

    executeUpdateAsync(request, tenantInfo, tenantCallback)
    {

        this.fetchIngressAsync(request, tenantInfo, tenantCallback);

    }

    executeDeleteAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const ingressParams = self.prepareIngressParams(request,
                                                        self.requestBody);

        const config = {};
        config.baseURL = (self.requestBody != null) ? `${self.baseURL}/${ingressParams.ingressName}`
                                                    : `${self.baseURL}`;

        self.deleteAsync(request, ingressParams.ingressURL, config,
                         tenantInfo, tenantCallback);

    }
}

module.exports = MTAIngressWorkflow;


