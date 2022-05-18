/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTAIngressModel = require("../models/mtaIngressModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTAIngressController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.ingressNameURL = "/:ingressName";

        const prepareIngressRule = (ingressBody) =>
        {

            const ingressRulesList = [];
            ingressBody.forEach((ruleInfo) =>
            {

                const ingressRule = {};
                ingressRule.host = ruleInfo.host;

                ingressRule.http = {};
                ingressRule.http.paths = [];

                ruleInfo.paths.forEach((pathInfo) =>
                {

                    const rulePath = {};
                    rulePath.backend = {};
                    rulePath.backend.serviceName =
                    _self.prepareServiceName(pathInfo.service, pathInfo.tenant);

                    rulePath.path = pathInfo.path;
                    rulePath.backend.servicePort = pathInfo.port;

                    
                    ingressRule.http.paths.push(rulePath);    

                });

                ingressRulesList.push(ingressRule);

            });

            return ingressRulesList;
            
        };

        const fetchIngressAsync = (name, namespaceName, ingressCallback) =>
        {

            _self.applicationInfo.k8sNetworkingV1beta1Api.readNamespacedIngress
            (name, namespaceName).then((res) =>
            {
                
                ingressCallback(res.body, null);

            }).catch((ex) =>
            {

                ingressCallback(null, ex);

            });

        };

        const patchIngressAsync = (response, ingressParams, ingressResponseInfo) =>
        {

            const options = {};
            options.headers =
            {
                
                "Content-Type": "application/merge-patch+json"

            };

            _self.applicationInfo.k8sNetworkingV1beta1Api.patchNamespacedIngress
            (ingressParams.fullIngressName, ingressParams.namespaceName,
            ingressResponseInfo, undefined, undefined, undefined, undefined,
            options).then((res) =>
            {

                const ingressInfo = new MTAIngressModel(res.body);
                response.status(res.response.statusCode);
                response.send(ingressInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        };

        const deleteIngressAsync = (request, response) =>
        {

            const ingressParams = _self.prepareIngressParams(request);

            _self.applicationInfo.k8sNetworkingV1beta1Api.deleteNamespacedIngress
            (ingressParams.fullIngressName, ingressParams.namespaceName)
            .then((res) =>
            {

                const deleteInfo = new MTADeleteModel(res.body);
                response.status(res.response.statusCode);
                response.send(deleteInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });

        };

        const patchForDeleteIngressAsync = (request, response, deleteBody) =>
        {
                        
            const ingressParams = _self.prepareIngressParams(request);
            const K8s = _self.applicationInfo.K8s;

            fetchIngressAsync(ingressParams.fullIngressName, ingressParams.namespaceName,
            (ingressResponseInfo, errorInfo) =>
            {

                if (errorInfo !== null)
                {

                    const errorModel = new MTAErrorModel(errorInfo);
                    response.status(errorInfo.statusCode);
                    response.send(errorModel);
                    return;

                }

                const rules = ingressResponseInfo.spec.rules;
                const patchedRules = processDeleteRules(rules, K8s, deleteBody);
                ingressResponseInfo.spec.rules = patchedRules;                
                patchIngressAsync(response, ingressParams, ingressResponseInfo);

            });

        };

        const prepareNewRuleInfo = (patchBody, K8s) =>
        {

            let ruleInfo = new K8s.NetworkingV1beta1IngressRule();
            ruleInfo.host  = patchBody.host;
            ruleInfo.http = {};
            ruleInfo.http.paths = [];
            return ruleInfo;

        };

        const addPathsToRule = (addPaths, ruleInfo, K8s) =>
        {

            if ((addPaths != null) && (addPaths.length == 0))
                return;

            addPaths.forEach((addPathInfo) =>
            {

                const tenantName = addPathInfo.tenant;
                let selectedInfo = ruleInfo.http.paths.find((pathInfo) =>
                {
                    
                    const addServiceName =
                    _self.prepareServiceName(addPathInfo.service, tenantName);

                    let doesExist = (pathInfo.backend.serviceName === addServiceName);
                    doesExist = doesExist && (pathInfo.backend.servicePort === addPathInfo.port);
                    doesExist = doesExist && (pathInfo.path === addPathInfo.path);

                    return doesExist;

                });                

                if (selectedInfo == null)
                {                    

                    let path = new K8s.NetworkingV1beta1HTTPIngressPath();
                    path.path = addPathInfo.path;

                    let backend = new K8s.NetworkingV1beta1IngressBackend();
                    
                    backend.serviceName =
                    _self.prepareServiceName(addPathInfo.service, tenantName);
                    
                    backend.servicePort = addPathInfo.port;
                    path.backend = backend;

                    ruleInfo.http.paths.push(path);

                }

            });

        };

        const deletePathsFromRule = (deletePaths, ruleInfo, K8s) =>
        {

            if ((deletePaths != null) && (deletePaths.length == 0))
                return;

            deletePaths.forEach((deletePathInfo) =>
            {

                const tenantName = deletePathInfo.tenant;
                let selectedInfo = ruleInfo.http.paths.find((pathInfo) =>
                {
                    const deleteServiceName =
                    _self.prepareServiceName(deletePathInfo.service, tenantName);

                    let doesExist = (pathInfo.backend.serviceName === deleteServiceName);
                    doesExist = doesExist && (pathInfo.backend.servicePort === deletePathInfo.port);
                    doesExist = doesExist && (pathInfo.path === deletePathInfo.path);
                    return doesExist;
                });

                if (selectedInfo != null)
                {

                    let paths = ruleInfo.http.paths.filter((pathInfo) =>
                    {

                        return (pathInfo !== selectedInfo);

                    });

                    ruleInfo.http.paths = paths;

                }

            });

        };

        const processRules = (rules, K8s, patchBody) =>
        {

            let selectedRuleInfo = rules.find((ruleInfo) =>
            {

                return (ruleInfo.host === patchBody.host);

            });

            if (selectedRuleInfo == null)
            {

                selectedRuleInfo = prepareNewRuleInfo(patchBody, K8s);
                rules.push(selectedRuleInfo);

            }
            
            const addPaths = patchBody.add;
            if ((addPaths != null) && (addPaths.length != 0))
            {
                addPathsToRule(addPaths, selectedRuleInfo, K8s);
            }

            const deletePaths = patchBody.delete;
            if ((deletePaths != null) && (deletePaths.length != 0))
            {
                deletePathsFromRule(deletePaths, selectedRuleInfo, K8s);
            }
        };

        const processDeleteRules = (rules, K8s, deleteBody) =>
        {

            if (deleteBody.host === null)
                return null;
            
            let selectedRuleInfo = rules.find((ruleInfo) =>
            {

                return (ruleInfo.host === deleteBody.host);

            });

            if (selectedRuleInfo == null)
                return null;

            const tenantName = deleteBody.tenant;
            if (tenantName == null)
            {

                const patchedRules = rules.filter((ruleInfo) =>
                {

                    return(ruleInfo != selectedRuleInfo);

                });

                return patchedRules;

            }

            let paths = selectedRuleInfo.http.paths.filter((pathInfo) =>
            {
                
                const deleteServiceToken = `${tenantName}${_self.serviceToken}`;
                let doesExist = !(pathInfo.backend.serviceName.endsWith(deleteServiceToken));
                return doesExist;

            });

            if (paths == null)
                return null;

            selectedRuleInfo.http.paths = paths;
            return rules;

        };

        _self.applicationInfo.routerInfo.get(`${_self.ingressNameURL}${_self.groupURL}`,
        (request, response) =>
        {
            
            const ingressParams = _self.prepareIngressParams(request);

            _self.applicationInfo.k8sNetworkingV1beta1Api.readNamespacedIngress
            (ingressParams.fullIngressName, ingressParams.namespaceName)
            .then((res) =>
            {
                
                const ingressInfo = new MTAIngressModel(res.body);
                response.status(res.response.statusCode);
                response.send(ingressInfo);

            }).catch((ex) =>
            {

                const errorModel = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorModel);

            });

        });

        _self.applicationInfo.routerInfo.get(`${_self.groupURL}`,
        (request, response) =>
        {
            
            const ingressParams = _self.prepareIngressParams(request);
            const labelSelector = `group=${request.params.groupName}`;

            _self.applicationInfo.k8sNetworkingV1beta1Api.listNamespacedIngress
            (ingressParams.namespaceName, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {
                
                const ingressListInfo = [];
                const ingressItemsList = res.body.items;
                ingressItemsList.forEach((ingressItem) =>
                {

                    const ingressInfo = new MTAIngressModel(ingressItem);
                    ingressListInfo.push(ingressInfo);

                });
                
                response.status(res.response.statusCode);
                response.send(ingressListInfo);

            }).catch((ex) =>
            {

                const errorModel = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorModel);

            });

        });

        _self.applicationInfo.routerInfo.put(`${_self.ingressNameURL}${_self.groupURL}`,
        (request, response) =>
        {
            
            const ingressBody = request.body;
            const ingressParams = _self.prepareIngressParams(request);

            const yamlIngressString = _self.applicationInfo.yamlIngressString;
            const K8s = _self.applicationInfo.K8s;
            
            const yamlIngress = K8s.loadYaml(yamlIngressString);
            yamlIngress.metadata.name = ingressParams.fullIngressName;
            yamlIngress.metadata.namespace = ingressParams.namespaceName;
            yamlIngress.metadata.labels.group = ingressParams.groupName;
            yamlIngress.spec.rules = prepareIngressRule(ingressBody);

            _self.applicationInfo.k8sNetworkingV1beta1Api.createNamespacedIngress
            (ingressParams.namespaceName, yamlIngress).then((res) =>
            {

                const ingressInfo = new MTAIngressModel(res.body);
                response.status(res.response.statusCode);
                response.send(ingressInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.patch(`${_self.ingressNameURL}${_self.groupURL}`,
        (request, response) =>
        {
            
            const ingressBody = request.body;
            const ingressParams = _self.prepareIngressParams(request);
            const K8s = _self.applicationInfo.K8s;

            fetchIngressAsync(ingressParams.fullIngressName, ingressParams.namespaceName,
            (ingressResponseInfo, errorInfo) =>
            {

                if (errorInfo !== null)
                {

                    const errorModel = new MTAErrorModel(errorInfo);
                    response.status(errorInfo.statusCode);
                    response.send(errorModel);
                    return;

                }
                            
                const rules = ingressResponseInfo.spec.rules;
                ingressBody.forEach((ruleInfo) =>
                {

                    processRules(rules, K8s, ruleInfo);

                });
                
                patchIngressAsync(response, ingressParams, ingressResponseInfo);
                
            });
        });

        _self.applicationInfo.routerInfo.delete(`${_self.ingressNameURL}${_self.groupURL}`,
        (request, response) =>
        {
                        
            const ingressBody = request.body;
            const length = Object.keys(ingressBody).length;
            if (length > 0)
                patchForDeleteIngressAsync(request, response, ingressBody);
            else
                deleteIngressAsync(request, response);
        });

        _self.applicationInfo.routerInfo.delete(`${_self.groupURL}`,
        (request, response) =>
        {

            const ingressParams = _self.prepareIngressParams(request);
            const labelSelector = `group=${request.params.groupName}`;

            _self.applicationInfo.k8sNetworkingV1beta1Api.deleteCollectionNamespacedIngress
            (ingressParams.namespaceName, undefined, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {

                const deleteInfo = new MTADeleteModel(res.body);
                response.status(res.response.statusCode);
                response.send(deleteInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });
    }
}

module.exports = MTAIngressController;


