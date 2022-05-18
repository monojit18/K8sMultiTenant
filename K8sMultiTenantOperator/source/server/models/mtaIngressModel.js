/*jshint esversion: 6 */

class MTAIngressModel
{

    constructor(ingressInfo)
    {

        this.name = ingressInfo.metadata.name;
        this.namespace = ingressInfo.metadata.namespace;
        this.labels = ingressInfo.metadata.labels;
        this.annotations = ingressInfo.metadata.annotations;
        this.rules = ingressInfo.spec.rules;
        
    }

}

module.exports = MTAIngressModel;