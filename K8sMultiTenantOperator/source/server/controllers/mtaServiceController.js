/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTAServiceModel = require("../models/mtaServiceModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTAServiceController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.serviceURL = "/:serviceName";

        _self.applicationInfo.routerInfo.get(`${_self.serviceURL}${_self.commonURL}`,
        (request, response) =>
        {
            
            const serviceParams = _self.prepareServiceParams(request);

            _self.applicationInfo.k8sCoreV1Api.readNamespacedService
            (serviceParams.fullServiceName, serviceParams.namespaceName)
            .then((res) =>
            {
                
                const serviceInfo = new MTAServiceModel(res.body);
                response.status(res.response.statusCode);
                response.send(serviceInfo);

            }).catch((ex) =>
            {

                const errorModel = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorModel);

            });

        });

        _self.applicationInfo.routerInfo.get(`${_self.commonURL}`,
        (request, response) =>
        {
            
            const serviceParams = _self.prepareServiceParams(request);
            const labelSelector = `tenant=${serviceParams.tenantName}`;

            _self.applicationInfo.k8sCoreV1Api.listNamespacedService
            (serviceParams.namespaceName, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {
                
                const serviceListInfo = [];
                const serviceItemsList = res.body.items;
                serviceItemsList.forEach((serviceItem) =>
                {

                    const serviceInfo = new MTAServiceModel(serviceItem);
                    serviceListInfo.push(serviceInfo);

                });
                
                response.status(res.response.statusCode);
                response.send(serviceListInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });
        
        _self.applicationInfo.routerInfo.put(`${_self.serviceURL}${_self.commonURL}`,
        (request, response) =>
        {
            
            const serviceBody = request.body;
            const serviceParams = _self.prepareServiceParams(request);
                        
            const yamlServiceString = _self.applicationInfo.yamlServiceString;
            const K8s = _self.applicationInfo.K8s;
            
            const yamlService = K8s.loadYaml(yamlServiceString);
            yamlService.metadata.labels.app = serviceParams.fullServiceName;
            yamlService.metadata.labels.tenant = serviceParams.tenantName;
            yamlService.metadata.name = yamlService.metadata.labels.app;
            yamlService.metadata.namespace = serviceParams.namespaceName;            
            yamlService.spec.selector.app = serviceParams.fullPodName;
            yamlService.spec.selector.tenant = serviceParams.tenantName;
            yamlService.spec.ports = serviceBody.ports;
            yamlService.spec.type = serviceBody.type;

            _self.applicationInfo.k8sCoreV1Api.createNamespacedService
            (serviceParams.namespaceName, yamlService).then((res) =>
            {
                
                const serviceInfo = new MTAServiceModel(res.body);
                response.status(res.response.statusCode);
                response.send(serviceInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.delete(`${_self.serviceURL}${_self.commonURL}`,
        (request, response) =>
        {
            
            const serviceParams = _self.prepareServiceParams(request);
            
            _self.applicationInfo.k8sCoreV1Api.deleteNamespacedService
            (serviceParams.fullServiceName, serviceParams.namespaceName)
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
    }     
}

module.exports = MTAServiceController;


