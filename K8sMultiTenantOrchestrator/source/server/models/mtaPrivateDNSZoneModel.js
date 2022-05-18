/*jshint esversion: 6 */

class MTAPrivateDNSZoneModel
{

    constructor(zoneInfo)
    {

        if (zoneInfo == null)            
            return;

        this.etag = zoneInfo.etag;
        this.id = zoneInfo.id;
        this.location = zoneInfo.location;
        this.name = zoneInfo.name;
        this.tags = zoneInfo.tags;
        this.properties = zoneInfo.properties;
        
    }
}

module.exports = MTAPrivateDNSZoneModel;