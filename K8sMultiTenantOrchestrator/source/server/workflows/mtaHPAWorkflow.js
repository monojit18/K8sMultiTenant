/*jshint esversion: 6 */

const MTARootWorkflow = require("./mtaRootWorkflow");

class MTAHPAWorkflow extends MTARootWorkflow
{
    
    constructor(applicationInfo, hpaBody)
    {

        super(applicationInfo);
        const _self = this;
        this.baseURL = process.env.OPERATOR_BASE_URL + "/hpa";
        this.versionURL = "/v1";
        this.requestBody = hpaBody;

    }

    fetchHPAAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;        
        const hpaParams = self.prepareHPAParams(request,
                                                self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${hpaParams.hpaName}${self.versionURL}`;

        self.applicationInfo.Axios.get(hpaParams.hpaURL, config)
        .then((res) =>
        {

            if (res.data.name == null)
                self.createHPAAsync(request, tenantInfo, tenantCallback);
            else
                this.patchHPAAsync(request, tenantInfo, tenantCallback); 

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

    createHPAAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;        
        const hpaParams = self.prepareHPAParams(request, self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${hpaParams.hpaName}${self.versionURL}`;
        
        self.applicationInfo.Axios.put(hpaParams.hpaURL,
                                       self.requestBody, config)
        .then((res) =>
        {

            tenantInfo.addHPAModel(res);
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

    patchHPAAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;                
        const hpaParams = self.prepareHPAParams(request, self.requestBody);

        const config = {};
        config.baseURL = `${self.baseURL}/${hpaParams.hpaName}${self.versionURL}`;

        self.applicationInfo.Axios.patch(hpaParams.hpaURL,
                                         self.requestBody, config)
        .then((res) =>
        {

            tenantInfo.addHPAModel(res);
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

        this.createHPAAsync(request, tenantInfo, tenantCallback);

    }

    executeUpdateAsync(request, tenantInfo, tenantCallback)
    {

        this.fetchHPAAsync(request, tenantInfo,
                              tenantCallback);

    }

    executeDeleteAsync(request, tenantInfo, tenantCallback)
    {

        const self = this;
        const hpaParams = self.prepareHPAParams(request,
                                                self.requestBody);

        const config = {};
        config.baseURL = (self.requestBody != null) ? `${self.baseURL}/${hpaParams.hpaName}`
                                                    : `${self.baseURL}`;

        self.deleteAsync(request, hpaParams.hpaURL, config,
                         tenantInfo, tenantCallback);

    }

}

module.exports = MTAHPAWorkflow;


