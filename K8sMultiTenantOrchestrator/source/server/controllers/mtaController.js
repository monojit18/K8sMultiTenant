/*jshint esversion: 6 */

class MTAController
{
    
    constructor(applicationInfo)
    {

        const _self = this;
        this.applicationInfo = applicationInfo;
        this.routerInfo = applicationInfo.routerInfo;

    }

    retrieveAuthTokenAsync(requestHeaders, restClientCallback)
    {

        const self = this;
        const restClient = self.applicationInfo.restClient;
        if (restClient != null)
        {

            restClientCallback(restClient, null);
            return;

        }

        const restNodeAuth = self.applicationInfo.MsRestNodeAuth;
        const restAzure = self.applicationInfo.MsRestAzure;

        restNodeAuth.loginWithServicePrincipalSecret
        (
            requestHeaders.CLIENT_ID,
            requestHeaders.SECRET,
            requestHeaders.TENANT_ID

        ).then((authres) =>
        {            
            const restClient = new restAzure.AzureServiceClient(authres);         
            self.applicationInfo.restClient = restClient;
            restClientCallback(restClient, null);
            
        }).catch((ex) =>
        {

            restClientCallback(null, ex);

        });

    }
}

module.exports = MTAController;


