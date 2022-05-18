/*jshint esversion: 6 */

class MTARecordSetModelModel
{

    constructor(recordInfo)
    {

        if (recordInfo == null)            
            return;

        this.etag = recordInfo.etag;
        this.id = recordInfo.id;        
        this.name = recordInfo.name;
        this.type = recordInfo.type;
        this.properties = recordInfo.properties.aRecords;
        
    }
}

module.exports = MTARecordSetModelModel;