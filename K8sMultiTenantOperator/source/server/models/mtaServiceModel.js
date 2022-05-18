/*jshint esversion: 6 */

class MTAServiceModel
{

    constructor(serviceInfo)
    {

        this.name = serviceInfo.metadata.name;
        this.namespace = serviceInfo.metadata.namespace;        
        this.labels = serviceInfo.metadata.labels;
        this.selector = serviceInfo.spec.selector;
        this.ports = serviceInfo.spec.ports;
        this.type = serviceInfo.spec.type;
        
    }
}

module.exports = MTAServiceModel;