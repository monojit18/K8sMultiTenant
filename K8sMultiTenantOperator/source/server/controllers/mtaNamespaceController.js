/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTAErrorModel = require("../models/mtaErrorModel");
const MTANamespaceModel = require("../models/mtaNamespaceModel");
const MTADeleteModel = require("../models/mtaDeleteModel");

class MTANamespaceController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;
        this.groupNameURL = "/:groupName";

        // /**
        //  * @swagger                  
        //  * /groups/{groupName}:           
        //  *  get:
        //  *   tags: ["Namespaces"]
        //  *   summary: OK
        //  *   description: OK2
        //  *   
        //  *   
        // */
        _self.applicationInfo.routerInfo.get(_self.groupNameURL,
        (request, response) =>
        {

            const namepaceParams = _self.prepareNamespaceParams(request);

            _self.applicationInfo.k8sCoreV1Api.readNamespace
            (namepaceParams.namespaceName).then((res) =>
            {

                let namespaceInfo = new MTANamespaceModel(res.body);                
                if (namespaceInfo.name == null)
                {
                 
                    namespaceInfo = {};
                    response.status(404);

                }
                else                    
                    response.status(res.response.statusCode);
                
                response.send(namespaceInfo);                    

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });
        
        _self.applicationInfo.routerInfo.put(_self.groupNameURL,
        (request, response) =>
        {

            const namepaceParams = _self.prepareNamespaceParams(request);

            const yamlNamespaceString =  _self.applicationInfo.yamlNamespaceString;
            const K8s = _self.applicationInfo.K8s;

            const yamlNamespace = K8s.loadYaml(yamlNamespaceString);
            yamlNamespace.metadata.name = namepaceParams.namespaceName;
            yamlNamespace.metadata.labels.group = namepaceParams.groupName;

            _self.applicationInfo.k8sCoreV1Api.createNamespace(yamlNamespace)
            .then((res) =>
            {

                const namespaceInfo = new MTANamespaceModel(res.body);
                response.status(res.response.statusCode);
                response.send(namespaceInfo);                    

            }).catch((ex) =>
            {

                const errorInfo = new MTAErrorModel(ex);
                response.status(ex.statusCode);
                response.send(errorInfo);

            });
        });        

        _self.applicationInfo.routerInfo.delete(_self.groupNameURL,
        (request, response) =>
        {

            const namepaceParams = _self.prepareNamespaceParams(request);

            _self.applicationInfo.k8sCoreV1Api.deleteNamespace(namepaceParams.namespaceName)
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

module.exports = MTANamespaceController;


