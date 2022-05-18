/*jshint esversion: 6 */

class MTAHPAModel
{

    constructor(hpaInfo)
    {

        this.name = hpaInfo.metadata.name;
        this.namespace = hpaInfo.metadata.namespace;        
        this.labels = hpaInfo.metadata.labels;
        this.spec = hpaInfo.spec;

    }
}

module.exports = MTAHPAModel;