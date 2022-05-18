/*jshint esversion: 6 */

class MTADeleteModel
{

    constructor(deleteInfo)
    {

        if (deleteInfo.details != null)
            this.name = deleteInfo.details.name;
        this.status = deleteInfo.status;
        this.reason = deleteInfo.reason; 

    }

}

module.exports = MTADeleteModel;