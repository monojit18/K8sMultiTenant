/*jshint esversion: 6 */

const MTAController = require("./mtaController");

class MTACronJobController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        
        this.cronjobBaseURL = process.env.OPERATOR_BASE_URL + "/cronjob";
        this.cronjobURL = "/:cronjobName/tenants/:tenantName/groups/:groupName";

        const prepareCommonURL = (request) =>
        {

            const cronjobName = request.params.cronjobName;
            const tenantName = request.params.tenantName;
            const namespaceName = request.params.groupName;
            const commonURL = `/${cronjobName}/tenants/${tenantName}/groups/${namespaceName}`;
            return commonURL;

        };

        const fetchCronJobAsync = (request, cronjobCallback) =>
        {
            
            const commonURL = prepareCommonURL(request);

            const config = {};
            config.baseURL = _self.cronjobBaseURL;

            _self.applicationInfo.Axios.get(commonURL, config)
            .then((res) =>
            {

                if (res.data.name == null)
                    createCronJobAsync(request, cronjobCallback);
                else
                    cronjobCallback(res.data, null, res.status);
                    
            }).catch((ex) =>
            {
                
                if (ex.response.status === 404)
                    createCronJobAsync(request, cronjobCallback);
                else                
                    cronjobCallback(null, ex.response.data, ex.response.status);
            });
        };

        const createCronJobAsync = (request, cronjobCallback) =>
        {
            
            const commonURL = prepareCommonURL(request);
            const jobBody = request.body;

            const config = {};
            config.baseURL = _self.cronjobBaseURL;            
            
            _self.applicationInfo.Axios.put(commonURL, jobBody, config)
            .then((res) =>
            {
                            
                cronjobCallback(res.data, null, res.status);

            }).catch((ex) =>
            {

                cronjobCallback(null, ex.response.data, ex.response.status);

            });
        };

        const patchCronJobAsync = (request, cronjobCallback) =>
        {
            
            const commonURL = prepareCommonURL(request);
            const patchBody = request.body;

            const config = {};
            config.baseURL = _self.cronjobBaseURL;
            
            _self.applicationInfo.Axios.patch(commonURL, patchBody, config)
            .then((res) =>
            {
                            
                cronjobCallback(res.data, null, res.status);

            }).catch((ex) =>
            {

                cronjobCallback(null, ex.response.data, ex.response.status);

            });
        };

        const deleteCronJobAsync = (request, cronjobCallback) =>
        {
            
            const commonURL = prepareCommonURL(request);

            const config = {};
            config.baseURL = _self.cronjobBaseURL;

            _self.applicationInfo.Axios.delete(commonURL, config)
            .then((res) =>
            {
                                
                cronjobCallback(res.data, null, res.status);

            }).catch((ex) =>
            {
                
                cronjobCallback(null, ex.response.data, ex.response.status);

            });
        };

        _self.applicationInfo.routerInfo.put(_self.cronjobURL, (request, response) =>
        {
            
            fetchCronJobAsync(request, (jobInfo, errorInfo, statusCode) =>
            {

                response.status(statusCode);
                if (errorInfo != null)
                {
                    
                    response.send(errorInfo);
                    return;

                }

                response.send(jobInfo);

            });
        });

        _self.applicationInfo.routerInfo.patch(_self.cronjobURL, (request, response) =>
        {
            
            patchCronJobAsync(request, (jobInfo, errorInfo, statusCode) =>
            {

                response.status(statusCode);
                if (errorInfo != null)
                {
                    
                    response.send(errorInfo);
                    return;

                }

                response.send(jobInfo);

            });

        });

        _self.applicationInfo.routerInfo.delete(_self.cronjobURL, (request, response) =>
        {
            
            deleteCronJobAsync(request, (jobInfo, errorInfo, statusCode) =>
            {

                response.status(statusCode);
                if (errorInfo != null)
                {
                    
                    response.send(errorInfo);
                    return;

                }

                response.send(jobInfo);

            });
        });
    }
}

module.exports = MTACronJobController;


