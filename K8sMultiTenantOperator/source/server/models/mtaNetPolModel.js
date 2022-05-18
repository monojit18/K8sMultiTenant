/*jshint esversion: 6 */

class MTANetPolModel
{

    constructor(netpolInfo)
    {

        this.name = netpolInfo.metadata.name;
        this.namespace = netpolInfo.metadata.namespace;
        this.labels = netpolInfo.metadata.labels;
        this.podSelector = netpolInfo.spec.podSelector;
        this.ingress = netpolInfo.spec.ingress;
        this.egress = netpolInfo.spec.egress;
        
    }

}

module.exports = MTANetPolModel;