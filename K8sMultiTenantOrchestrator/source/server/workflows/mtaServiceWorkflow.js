/*jshint esversion: 6 */

const MTARootWorkflow = require("./mtaRootWorkflow");

class MTAServiceWorkflow extends MTARootWorkflow
{
    
    constructor(applicationInfo, serviceBody)
    {

        super(applicationInfo);
        const _self = this;
        this.baseURL = process.env.OPERATOR_BASE_URL + "/service";
        this.requestBody = serviceBody;

    }

    listServicesAsync(request, listServiceCallback)
    {

        const self = this;
        const serviceParams = self.prepareServiceParams(request, null);
    
        const config = {};            
        config.baseURL = `${self.baseURL}`;

        self.applicationInfo.Axios.get(serviceParams.serviceURL, config)
        .then((res) =>
        {

            listServiceCallback(res.data, null);

        }).catch((ex) =>
        {

            listServiceCallback(null, ex.response);

        });

    }

    createServiceAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const serviceParams = self.prepareServiceParams(request,
                                                        self.requestBody);
        
        const config = {};            
        config.baseURL = `${self.baseURL}/${serviceParams.serviceName}`;

        self.applicationInfo.Axios.put(serviceParams.serviceURL,
                                       self.requestBody, config)
        .then((res) =>
        {

            tenantInfo.addServiceModel(res);
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

        this.createServiceAsync(request, tenantInfo, tenantCallback);

    }

    executeUpdateAsync(request, tenantInfo, tenantCallback)
    {

        this.nextWorkflow.executeUpdateAsync(request, tenantInfo, tenantCallback);

    }

    executeDeleteAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const serviceParams = self.prepareServiceParams(request, self.requestBody);
        
        if (self.requestBody != null)
        {

            const config = {};
            config.baseURL = (serviceParams.serviceName != null) ? `${self.baseURL}/${serviceParams.serviceName}`
                                                             : `${self.baseURL}`;

            self.deleteAsync(request, serviceParams.serviceURL, config,
                             tenantInfo, tenantCallback);
            return;

        }
        
        self.listServicesAsync(request, (listServiceInfo, errorInfo) =>
        {

            if (errorInfo != null)
            {

                tenantInfo.addErrorModel(errorInfo);
                tenantCallback(tenantInfo, errorInfo.status);
                return;

            }

            let workflow = null;
            let nextWorkflow = null;
            let currentNextWorkflow = self.nextWorkflow;

            if (listServiceInfo.length == 0)
            {

                if (self.nextWorkflow == null)
                {

                    const errorInfo = {};
                    errorInfo.data = {};
                    errorInfo.data.status = 404;
                    tenantInfo.addErrorModel(errorInfo);
                    tenantCallback(tenantInfo, errorInfo.status);
                    return;

                }

                currentNextWorkflow.executeDeleteAsync(request, tenantInfo,
                                                       tenantCallback);

                return;                

            }
            
            listServiceInfo.forEach((serviceInfo) =>
            {

                let serviceName = serviceInfo.name;
                const index = serviceName
                              .lastIndexOf(`-${serviceParams.tenantName}-svc`);
                
                serviceName = serviceName.substr(0, index);
                const serviceBody = {};
                serviceBody.name = serviceName;

                if (workflow == null)
                {

                    workflow = self;
                    workflow.requestBody = serviceBody;
                    nextWorkflow = workflow;

                }                        
                else
                {
                    
                    nextWorkflow = nextWorkflow.addWorkflow(
                                   new MTAServiceWorkflow(
                                    self.applicationInfo, serviceBody));

                }                    
            });

            nextWorkflow.addWorkflow(currentNextWorkflow);
            workflow.executeDeleteAsync(request, tenantInfo, tenantCallback);            

        });
    }
}

module.exports = MTAServiceWorkflow;


