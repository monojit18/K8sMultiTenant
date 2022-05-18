/*jshint esversion: 6 */

class MTAErrorModel
{

    constructor(ex)
    {

        if (ex == null)
            return {};

        if (ex.response == null)
        {

            this.code = ex.code;
            this.message = ex.message;
            return;

        }

        this.message = ex.response.body.message;
        this.status = ex.response.body.status;
        this.reason = ex.response.body.reason; 

    }

}

module.exports = MTAErrorModel;