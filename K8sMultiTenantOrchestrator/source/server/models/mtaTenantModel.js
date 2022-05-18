/*jshint esversion: 6 */

class MTATenantModel
{

    constructor()
    {

        this.error = [];
        this.namespace = null;
        this.deploy = [];
        this.hpa = [];
        this.service = [];        
        this.ingress = [];
        this.netpol = [];

    }

    addErrorModel(errorInfo)
    {

        this.error.push(errorInfo.data);

    }

    addNamespaceModel(namesapceInfo)
    {

        this.namespace = namesapceInfo.data;

    }

    addDeployModel(deployInfo)
    {

        this.deploy.push(deployInfo.data);
        
    }

    addHPAModel(hpaInfo)
    {

        this.hpa.push(hpaInfo.data);
        
    }

    addServiceModel(serviceInfo)
    {

        this.service.push(serviceInfo.data);
        
    }

    addIngressModel(ingressInfo)
    {

        this.ingress.push(ingressInfo.data);
        
    }

    addNetPolModel(netpolInfo)
    {

        this.netpol.push(netpolInfo.data);
        
    }


}

module.exports = MTATenantModel;