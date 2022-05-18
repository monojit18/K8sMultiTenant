/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTAPVCModel = require("../models/mtaPVCModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTAPVCController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.pvcNameURL = "/:pvcName";

        const fetchPVCAsync = (name, namespaceName, pvcCallback) =>
        {

            _self.applicationInfo.k8sCoreV1Api
            .readNamespacedPersistentVolumeClaim
            (name, namespaceName).then((res) =>
            {
                
                pvcCallback(res.body, null);

            }).catch((ex) =>
            {

                pvcCallback(null, ex);

            });

        };

        _self.applicationInfo.routerInfo.get(`${_self.pvcNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const pvcParams = _self.preparePVCParams(request);

            _self.applicationInfo.k8sCoreV1Api
            .readNamespacedPersistentVolumeClaim
            (pvcParams.fullPVCName, pvcParams.namespaceName)
            .then((res) =>
            {
                
                const pvcInfo = new MTAPVCModel(res.body);
                response.status(res.response.statusCode);
                response.send(pvcInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });

        });

        _self.applicationInfo.routerInfo.get(`${_self.commonURL}`,
        (request, response) =>
        {
            
            const pvcParams = _self.preparePVCParams(request);
            const labelSelector = `tenant=${pvcParams.tenantName}`;

            _self.applicationInfo.k8sCoreV1Api
            .listNamespacedPersistentVolumeClaim
            (pvcParams.namespaceName, undefined, undefined,
             undefined, undefined, labelSelector).then((res) =>
            {
                
                const pvcListInfo = [];
                const pvcItemsList = res.body.items;
                pvcItemsList.forEach((pvcItem) =>
                {

                    const pvcInfo = new MTAPVCModel(pvcItem);
                    pvcListInfo.push(pvcInfo);

                });
                
                response.status(res.response.statusCode);
                response.send(pvcListInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });
        
        _self.applicationInfo.routerInfo.put(`${_self.pvcNameURL}${_self.commonURL}`,
        (request, response) =>
        {
                        
            const pvcBody = request.body;
            const pvcParams = _self.preparePVCParams(request);

            const yamlPVCString = _self.applicationInfo.yamlPVCString;
            const K8s = _self.applicationInfo.K8s;
            
            const yamlPVC = K8s.loadYaml(yamlPVCString);
            yamlPVC.metadata.labels.app = pvcParams.fullPVCName;
            yamlPVC.metadata.labels.tenant = pvcParams.tenantName;
            yamlPVC.metadata.name = pvcParams.fullPVCName;
            yamlPVC.metadata.namespace = pvcParams.namespaceName;
            yamlPVC.spec.storageClassName = pvcBody.storageClassName;
            yamlPVC.spec.accessModes = pvcBody.accessModes;
            yamlPVC.spec.resources.requests.storage = pvcBody.storage;
            
            _self.applicationInfo.k8sCoreV1Api
            .createNamespacedPersistentVolumeClaim
            (pvcParams.namespaceName, yamlPVC).then((res) =>
            {

                const pvcInfo = new MTAPVCModel(res.body);
                response.status(res.response.statusCode);
                response.send(pvcInfo);

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });

        _self.applicationInfo.routerInfo.patch(`${_self.pvcNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const pvcBody = request.body;
            const pvcParams = _self.preparePVCParams(request);

            fetchPVCAsync(pvcParams.fullPVCName, pvcParams.namespaceName,
            (pvcInfo, errorInfo) =>
            {

                if (errorInfo !== null)
                {

                    const errorModel = new MTAErrorModel(errorInfo);
                    response.status(errorInfo.statusCode);
                    response.send(errorModel);
                    return;

                }
                
                if (pvcBody.accessModes != null)
                    pvcInfo.spec.accessModes = pvcBody.accessModes;

                if (pvcBody.storage != null)
                    pvcInfo.spec.resources.requests.storage = pvcBody.storage;

                const options = {};
                options.headers =
                {
                    "Content-Type": "application/merge-patch+json"

                };

                _self.applicationInfo.k8sCoreV1Api
                .patchNamespacedPersistentVolumeClaim
                (pvcParams.fullPVCName, pvcParams.namespaceName, pvcInfo,
                 undefined, undefined, undefined, undefined, options)
                .then((res) =>
                {

                    const pvcInfo = new MTAPVCModel(res.body);
                    response.status(res.response.statusCode);
                    response.send(pvcInfo);

                }).catch((ex) =>
                {

                    const errorInfo = new MTAErrorModel(ex);
                    response.status(ex.statusCode);
                    response.send(errorInfo);

                });

            });
        });        

        _self.applicationInfo.routerInfo.delete(`${_self.pvcNameURL}${_self.commonURL}`,
        (request, response) =>
        {

            const pvcParams = _self.preparePVCParams(request);

            _self.applicationInfo.k8sCoreV1Api
            .deleteNamespacedPersistentVolumeClaim
            (pvcParams.fullPVCName, pvcParams.namespaceName)
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

        _self.applicationInfo.routerInfo.delete(`${_self.commonURL}`,
        (request, response) =>
        {

            const pvcParams = _self.preparePVCParams(request);
            const labelSelector = `tenant=${pvcParams.tenantName}`;

            _self.applicationInfo.k8sCoreV1Api
            .deleteCollectionNamespacedPersistentVolumeClaim
            (pvcParams.namespaceName, undefined, undefined, undefined,
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

module.exports = MTAPVCController;


