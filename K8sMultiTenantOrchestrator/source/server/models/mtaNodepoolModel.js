/*jshint esversion: 6 */

class MTANodepoolModel
{

    constructor(nodepoolInfo)
    {

        if (nodepoolInfo == null)            
            return;

        this.id = nodepoolInfo.id;
        this.name = nodepoolInfo.name;
        this.message = nodepoolInfo.message;
        this.properties = nodepoolInfo.properties;
        
    }
}

module.exports = MTANodepoolModel;