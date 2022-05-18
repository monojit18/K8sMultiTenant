/*jshint esversion: 6 */

class MTAPVCModel
{

    constructor(pvcInfo)
    {

        this.name = pvcInfo.metadata.name;
        this.namespace = pvcInfo.metadata.namespace;        
        this.labels = pvcInfo.metadata.labels;
        this.spec = pvcInfo.spec;

    }
}

module.exports = MTAPVCModel;