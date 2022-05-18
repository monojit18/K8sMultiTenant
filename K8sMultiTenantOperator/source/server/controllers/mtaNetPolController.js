/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTANetPolModel = require("../models/mtaNetPolModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTANetPolController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.netpolNameURL = "/:netpolName";

        const fetchNetPolAsync = (name, namespaceName, netpolCallback) =>
        {

            _self.applicationInfo.k8sNetworkingV1Api.readNamespacedNetworkPolicy
            (name, namespaceName).then((res) =>
            {
                
                netpolCallback(res.body, null);

            }).catch((ex) =>
            {

                netpolCallback(null, ex);

            });

        };

        const processNetpolIngress = (requiredNetpolIngressList) =>
        {

            const netpolIngressList = [];            
            requiredNetpolIngressList.forEach((requiredIngressInfo) =>
            {
                
                const netpolIngress = {};
                netpolIngress.from = [];
                requiredIngressInfo.from.forEach((requiredIngressFrom) =>
                {
                                     
                    if (requiredIngressFrom.namespaceLabels != null)
                    {

                        const netpolFrom = {};
                        const namespaceSelector = {};
                        namespaceSelector.matchLabels = requiredIngressFrom.namespaceLabels;
                        netpolFrom.namespaceSelector = namespaceSelector;
                        netpolIngress.from.push(netpolFrom);

                    }

                    if (requiredIngressFrom.podLabels != null)
                    {

                        const netpolFrom = {};
                        const podSelector = {};
                        podSelector.matchLabels = requiredIngressFrom.podLabels;
                        netpolFrom.podSelector = podSelector;
                        netpolIngress.from.push(netpolFrom);

                    }                    

                });
                                                
                if (requiredIngressInfo.ports != null)
                {

                    const ports = requiredIngressInfo.ports;
                    netpolIngress.ports = ports;

                }

                netpolIngressList.push(netpolIngress);

            });

            return netpolIngressList;

        };

        const processNetpolEgress = (requiredNetpolEgressList) =>
        {

            const netpolEgressList = [];            
            requiredNetpolEgressList.forEach((requiredEgressInfo) =>
            {
                
                const netpolEgress = {};
                netpolEgress.to = [];
                requiredEgressInfo.to.forEach((requiredEgressTo) =>
                {

                    if (requiredEgressTo.namespaceLabels != null)
                    {

                        const netpolTo = {};
                        const namespaceSelector = {};
                        namespaceSelector.matchLabels = requiredEgressTo.namespaceLabels;                    
                        netpolTo.namespaceSelector = namespaceSelector;
                        netpolEgress.to.push(netpolTo);

                    }

                    if (requiredEgressTo.podLabels != null)
                    {

                        const netpolTo = {};
                        const podSelector = {};
                        podSelector.matchLabels = requiredEgressTo.podLabels;
                        netpolTo.podSelector = podSelector;
                        netpolEgress.to.push(netpolTo);

                    }
                });

                if (requiredEgressInfo.ports != null)
                {

                    const ports = requiredEgressInfo.ports;
                    netpolEgress.ports = ports;

                }

                netpolEgressList.push(netpolEgress);

            });

            return netpolEgressList;
            
        };

        _self.applicationInfo.routerInfo.get(`${_self.netpolNameURL}${_self.groupURL}`,
        (request, response) =>
        {
            
            const netpolParams = _self.prepareNetPolParams(request);

            _self.applicationInfo.k8sNetworkingV1Api.readNamespacedNetworkPolicy
            (netpolParams.fullNetPolName, netpolParams.namespaceName)
            .then((res) =>
            {
                
                const netpolInfo = new MTANetPolModel(res.body);
                response.status(res.response.statusCode);
                response.send(netpolInfo);

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
            
            const netpolParams = _self.prepareNetPolParams(request);
            const labelSelector = `group=${request.params.groupName}`;
            
            _self.applicationInfo.k8sNetworkingV1Api.listNamespacedNetworkPolicy
            (netpolParams.namespaceName, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {
                
                const netpolListInfo = [];
                const netpolItemsList = res.body.items;
                netpolItemsList.forEach((netpolItem) =>
                {

                    const netpolInfo = new MTANetPolModel(netpolItem);
                    netpolListInfo.push(netpolInfo);

                });
                
                response.status(res.response.statusCode);
                response.send(netpolListInfo);

            }).catch((ex) =>
            {

                const errorModel = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorModel);

            });

        });

        _self.applicationInfo.routerInfo.put(`${_self.netpolNameURL}${_self.groupURL}`,
        (request, response) =>
        {
            
            const netpolBody = request.body;
            const netpolParams = _self.prepareNetPolParams(request);

            const yamlNetPolString = _self.applicationInfo.yamlNetPolString;
            const K8s = _self.applicationInfo.K8s;
            
            const yamlNetPol = K8s.loadYaml(yamlNetPolString);
            yamlNetPol.metadata.name = netpolParams.fullNetPolName;
            yamlNetPol.metadata.namespace = netpolParams.namespaceName;
            yamlNetPol.metadata.labels.group = netpolParams.groupName;

            if (netpolBody.podLabels != null)
                yamlNetPol.spec.podSelector.matchLabels = netpolBody.podLabels;
            
            const netpolIngress = netpolBody.ingress;
            if ((netpolIngress != null) && (netpolIngress.length > 0))
            {

                const netpolIngressList = processNetpolIngress(netpolIngress);
                yamlNetPol.spec.ingress = netpolIngressList;

            }                
            
            const netpolEgress = netpolBody.egress;
            if ((netpolEgress != null) && (netpolEgress.length > 0))
            {

                const netpolEgressList = processNetpolEgress(netpolEgress);
                yamlNetPol.spec.egress = netpolEgressList;

            }                

            _self.applicationInfo.k8sNetworkingV1Api.createNamespacedNetworkPolicy
            (netpolParams.namespaceName, yamlNetPol).then((res) =>
            {

                const netpolInfo = new MTANetPolModel(res.body);
                response.status(res.response.statusCode);
                response.send(netpolInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.patch(`${_self.netpolNameURL}${_self.groupURL}`,
        (request, response) =>
        {
            
            const netpolBody = request.body;            
            const netpolParams = _self.prepareNetPolParams(request);

            fetchNetPolAsync(netpolParams.fullNetPolName, netpolParams.namespaceName,
            (netpolInfo, errorInfo) =>
            {

                if (errorInfo !== null)
                {

                    const errorModel = new MTAErrorModel(errorInfo);
                    response.status(errorInfo.statusCode);
                    response.send(errorModel);
                    return;

                }
                
                netpolInfo.spec.podSelector.matchLabels = netpolBody.podLabels;

                const netpolIngress = netpolBody.ingress;
                if ((netpolIngress != null) && (netpolIngress.length > 0))
                {

                    const netpolIngressList = processNetpolIngress(netpolIngress);
                    netpolInfo.spec.ingress = netpolIngressList;

                }
                
                const netpolEgress = netpolBody.egress;
                if ((netpolEgress != null) && (netpolEgress.length > 0))
                {

                    const netpolEgressList = processNetpolEgress(netpolEgress);
                    netpolInfo.spec.egress = netpolEgressList;

                }                            

                const options = {};
                options.headers =
                {
                    
                    "Content-Type": "application/merge-patch+json"

                };

                _self.applicationInfo.k8sNetworkingV1Api.patchNamespacedNetworkPolicy
                (netpolParams.fullNetPolName, netpolParams.namespaceName, netpolInfo,
                 undefined, undefined, undefined, undefined, options)
                 .then((res) =>
                {

                    const netpolInfo = new MTANetPolModel(res.body);
                    response.status(res.response.statusCode);
                    response.send(netpolInfo);

                }).catch((ex) =>
                {

                    const errorInfo = new MTAErrorModel(ex);
                    response.status(ex.statusCode);
                    response.send(errorInfo);

                });

            });
        });

        _self.applicationInfo.routerInfo.delete(`${_self.netpolNameURL}${_self.groupURL}`,
        (request, response) =>
        {

            const netpolParams = _self.prepareNetPolParams(request);

            _self.applicationInfo.k8sNetworkingV1Api.deleteNamespacedNetworkPolicy
            (netpolParams.fullNetPolName, netpolParams.namespaceName)
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
        });

        _self.applicationInfo.routerInfo.delete(`${_self.groupURL}`,
        (request, response) =>
        {

            const netpolParams = _self.prepareNetPolParams(request);
            const labelSelector = `group=${request.params.groupName}`;

            _self.applicationInfo.k8sNetworkingV1Api.deleteCollectionNamespacedNetworkPolicy
            (netpolParams.namespaceName, undefined, undefined, undefined,
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

module.exports = MTANetPolController;


