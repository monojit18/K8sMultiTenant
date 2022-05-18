/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTANodepoolModel = require("../models/mtaNodepoolModel");

class MTANodepoolController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.nodepoolURL = "/:nodepoolName";

        const prepareHeaders = (request) =>
        {
            
            const headers = {};
            headers.subid = request.headers.subid;
            headers.rg = request.headers.rg;
            headers.cluster = request.headers.cluster;
            headers.SECRET = request.headers.secret;
            headers.CLIENT_ID = request.headers.client_id;
            headers.TENANT_ID = request.headers.tenant_id;
            return headers;

        };

        const prepareNodepoolRequest = (headers, nodepoolConfig,
                                        nodepoolName, httpMethod) =>
        {

            let body = {};
            let options = {};
            const keys = Object.keys(nodepoolConfig);
            body = {};
            body.properties = {};

            keys.forEach((keyInfo) =>
            {

                body.properties[`${keyInfo}`] = nodepoolConfig[`${keyInfo}`];

            });
            
            const length = Object.keys(body.properties).length;
            if (length != 1)
                options.body = body;
        
            let nodepoolURL = `https://management.azure.com/subscriptions/${headers.subid}/resourceGroups/${headers.rg}/providers/Microsoft.ContainerService/managedClusters/${headers.cluster}/agentPools/${nodepoolName}?api-version=2020-11-01`;                
            options.method = httpMethod;
            options.url = nodepoolURL;
            return options;

        };

        const performNodepoolAsync = (request, response, httpMethod) =>
        {

            const headers = prepareHeaders(request);
            const nodepoolName = request.params.nodepoolName;
            _self.retrieveAuthTokenAsync(headers, (restClient, errorInfo) =>
            {

                if (errorInfo != null)
                {
                    
                    response.status(500);
                    response.send(errorInfo);
                    return;

                }
                                
                let options = prepareNodepoolRequest(headers, request.body,
                                                     nodepoolName, httpMethod);
                restClient.sendRequest(options).then((res) =>
                {

                    if (res.status !== 200)
                    {                        
                        response.status(res.status);
                        response.send(res.parsedBody);
                        return;

                    }

                    const nodepoolInfo = new MTANodepoolModel(res.parsedBody);
                    response.status(res.status);
                    response.send(nodepoolInfo);

                }).catch((ex) =>
                {
                    
                    const errorInfo = new MTAErrorModel(ex);
                    response.status(500);
                    response.send(errorInfo);                    

                });
            });
        };
        
        _self.applicationInfo.routerInfo.get(_self.nodepoolURL, (request, response) =>
        {

            performNodepoolAsync(request, response, "GET");
            
        });
        
        _self.applicationInfo.routerInfo.put(_self.nodepoolURL, (request, response) =>
        {
            
            performNodepoolAsync(request, response, "PUT");

        });

        _self.applicationInfo.routerInfo.delete(_self.nodepoolURL, (request, response) =>
        {

            performNodepoolAsync(request, response, "DELETE");

        });
    }
}

module.exports = MTANodepoolController;


