/*jshint esversion: 6 */

class MTANamespaceModel
{

    constructor(namespaceInfo)
    {

        this.name = namespaceInfo.metadata.name;
        this.status = namespaceInfo.status.phase;
    }
}

module.exports = MTANamespaceModel;