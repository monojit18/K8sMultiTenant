/*jshint esversion: 6 */

const MTAController = require("./mtaController");

class MTAJobController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        
        this.jobBaseURL = process.env.OPERATOR_BASE_URL + "/job";
        this.jobURL = "/:jobName/tenants/:tenantName/groups/:groupName";

        const prepareCommonURL = (request) =>
        {

            const jobName = request.params.jobName;
            const tenantName = request.params.tenantName;
            const namespaceName = request.params.groupName;
            const commonURL = `/${jobName}/tenants/${tenantName}/groups/${namespaceName}`;
            return commonURL;

        };

        const fetchJobAsync = (request, jobCallback) =>
        {
            
            const commonURL = prepareCommonURL(request);

            const config = {};
            config.baseURL = _self.jobBaseURL;

            _self.applicationInfo.Axios.get(commonURL, config)
            .then((res) =>
            {

                if (res.data.name == null)
                    createJobAsync(request, jobCallback);
                else
                    jobCallback(res.data, null, res.status);
                    
            }).catch((ex) =>
            {
                
                if (ex.response.status === 404)
                    createJobAsync(request, jobCallback);
                else                
                    jobCallback(null, ex.response.data, ex.response.status);
            });
        };

        const createJobAsync = (request, jobCallback) =>
        {
            
            const commonURL = prepareCommonURL(request);
            const jobBody = request.body;

            const config = {};
            config.baseURL = _self.jobBaseURL;            
            
            _self.applicationInfo.Axios.put(commonURL, jobBody, config)
            .then((res) =>
            {
                            
                jobCallback(res.data, null, res.status);

            }).catch((ex) =>
            {

                jobCallback(null, ex.response.data, ex.response.status);

            });
        };

        const patchJobAsync = (request, jobCallback) =>
        {
            
            const commonURL = prepareCommonURL(request);
            const patchBody = request.body;

            const config = {};
            config.baseURL = _self.jobBaseURL;
            
            _self.applicationInfo.Axios.patch(commonURL, patchBody, config)
            .then((res) =>
            {
                            
                jobCallback(res.data, null, res.status);

            }).catch((ex) =>
            {

                jobCallback(null, ex.response.data, ex.response.status);

            });
        };

        const deleteJobAsync = (request, jobCallback) =>
        {
            
            const commonURL = prepareCommonURL(request);

            const config = {};
            config.baseURL = _self.jobBaseURL;

            _self.applicationInfo.Axios.delete(commonURL, config)
            .then((res) =>
            {
                                
                jobCallback(res.data, null, res.status);

            }).catch((ex) =>
            {
                
                jobCallback(null, ex.response.data, ex.response.status);

            });
        };

        _self.applicationInfo.routerInfo.put(_self.jobURL, (request, response) =>
        {
            
            fetchJobAsync(request, (jobInfo, errorInfo, statusCode) =>
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

        _self.applicationInfo.routerInfo.patch(_self.jobURL, (request, response) =>
        {
            
            patchJobAsync(request, (jobInfo, errorInfo, statusCode) =>
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

        _self.applicationInfo.routerInfo.delete(_self.jobURL, (request, response) =>
        {
            
            deleteJobAsync(request, (jobInfo, errorInfo, statusCode) =>
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

module.exports = MTAJobController;


