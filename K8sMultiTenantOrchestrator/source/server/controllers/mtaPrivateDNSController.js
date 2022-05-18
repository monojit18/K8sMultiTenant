/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAPrivateDNSZoneModel = require("../models/mtaPrivateDNSZoneModel");
const MTARecordSetModel = require("../models/mtaRecordSetModel");

class MTAPrivateDNSController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.dnsZoneURL = "/:zoneName";
        this.dnsRecordURL = _self.dnsZoneURL + "/:recordName";

        const prepareHeaders = (request) =>
        {
            
            const headers = {};
            headers.subid = request.headers.subid;
            headers.rg = request.headers.rg;
            headers.SECRET = request.headers.secret;
            headers.CLIENT_ID = request.headers.client_id;
            headers.TENANT_ID = request.headers.tenant_id;
            return headers;

        };

        const preparePrivateDSNZoneRequest = (headers, zoneConfig,
                                              zoneName, httpMethod) =>
        {

            const body = {};
            const options = {};
            const keys = Object.keys(zoneConfig);           

            keys.forEach((keyInfo) =>
            {
                
                body[`${keyInfo}`] = zoneConfig[`${keyInfo}`];

            });
            
            const length = Object.keys(body).length;
            if (length != 0)
                options.body = body;
        
            let zoneURL = `https://management.azure.com/subscriptions/${headers.subid}/resourceGroups/${headers.rg}/providers/Microsoft.Network/privateDnsZones/${zoneName}?api-version=2018-09-01`;
            options.method = httpMethod;
            options.url = zoneURL;
            return options;

        };

        const prepareRecordSetRequest = (headers, recordConfig, recordParams,
                                        zoneName, httpMethod) =>
        {

            const body = {};
            const options = {};
            const keys = Object.keys(recordConfig);
            body.properties = {};

            keys.forEach((keyInfo) =>
            {
                
                body.properties[`${keyInfo}`] = recordConfig[`${keyInfo}`];

            });
            
            const length = Object.keys(body).length;
            if (length != 0)
                options.body = body;
        
            let recordURL = `https://management.azure.com/subscriptions/${headers.subid}/resourceGroups/${headers.rg}/providers/Microsoft.Network/privateDnsZones/${zoneName}/${recordParams.type}/${recordParams.name}?api-version=2018-09-01`;
            options.method = httpMethod;
            options.url = recordURL;
            return options;

        };

        const performPrivateDSNZoneAsync = (request, response, httpMethod) =>
        {
            
            const headers = prepareHeaders(request);
            const zoneName = request.params.zoneName;
            _self.retrieveAuthTokenAsync(headers, (restClient, errorInfo) =>
            {

                if (errorInfo != null)
                {
                    
                    response.status(500);
                    response.send(errorInfo);
                    return;

                }
               
                let options = preparePrivateDSNZoneRequest(headers, request.body,
                                                           zoneName, httpMethod);
                restClient.sendRequest(options).then((res) =>
                {

                    if (res.status !== 200)
                    {                        
                        response.status(res.status);
                        response.send(res.parsedBody);
                        return;

                    }

                    const zoneInfo = new MTAPrivateDNSZoneModel(res.parsedBody);
                    response.status(res.status);
                    response.send(zoneInfo);

                }).catch((ex) =>
                {
                                        
                    response.status(500);
                    response.send(errorInfo);                    

                });
            });
        };

        const performRecordSetAsync = (request, response, httpMethod) =>
        {
            
            const headers = prepareHeaders(request);
            const zoneName = request.params.zoneName;
            const recordName = request.params.recordName;
            _self.retrieveAuthTokenAsync(headers, (restClient, errorInfo) =>
            {

                if (errorInfo != null)
                {
                    
                    response.status(500);
                    response.send(errorInfo);
                    return;

                }

                const recordParams = {};
                recordParams.type = "A";
                recordParams.name = recordName;
               
                let options = prepareRecordSetRequest(headers, request.body,
                                                      recordParams, zoneName,
                                                      httpMethod);
                restClient.sendRequest(options).then((res) =>
                {

                    if (res.status !== 200)
                    {                        
                        response.status(res.status);
                        response.send(res.parsedBody);
                        return;

                    }

                    const zoneInfo = new MTARecordSetModel(res.parsedBody);
                    response.status(res.status);
                    response.send(zoneInfo);

                }).catch((ex) =>
                {
                                        
                    response.status(500);
                    response.send(errorInfo);                    

                });
            });
        };
        
        _self.applicationInfo.routerInfo.get(_self.dnsZoneURL, (request, response) =>
        {

            performPrivateDSNZoneAsync(request, response, "GET");
            
        });
        
        _self.applicationInfo.routerInfo.put(_self.dnsZoneURL, (request, response) =>
        {
            
            performPrivateDSNZoneAsync(request, response, "PUT");

        });

        _self.applicationInfo.routerInfo.put(_self.dnsRecordURL, (request, response) =>
        {
            
            performRecordSetAsync(request, response, "PUT");

        });

        _self.applicationInfo.routerInfo.delete(_self.dnsZoneURL, (request, response) =>
        {

            performPrivateDSNZoneAsync(request, response, "DELETE");

        });

        _self.applicationInfo.routerInfo.delete(_self.dnsRecordURL, (request, response) =>
        {

            performRecordSetAsync(request, response, "DELETE");

        });
    }
}

module.exports = MTAPrivateDNSController;


