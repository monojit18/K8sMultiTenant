/*jshint esversion: 6 */

const MTAPrivateDNSZoneModel = require("./models/mtaPrivateDNSZoneModel");

class k8sMultiTenantControler
{

    constructor()
    {

        const _self = this;        
        const nodeModulesPathString = "../node_modules/";
        const Https = require("http");
        const Path = require("path");
        const FS = require("fs");
        const Express = require(nodeModulesPathString + "express");
        const BodyParser = require(nodeModulesPathString + "body-parser");
        const Axios = require(nodeModulesPathString + "axios");
        const DotEnv = require(nodeModulesPathString + "dotenv");
        const MsRestNodeAuth = require(nodeModulesPathString + "@azure/ms-rest-nodeauth");
        const MsRestAzure = require(nodeModulesPathString + "@azure/ms-rest-azure-js");
        const MTATenantController = require("./controllers/mtaTenantController");
        const MTAJobController = require("./controllers/mtaJobController");
        const MTACronJobController = require("./controllers/mtaCronJobController");
        const MTANodepoolController = require("./controllers/mtaNodepoolController"); 
        const MTAPrivateDNSController = require("./controllers/mtaPrivateDNSController");        

        const _express = Express();
        const _httpsServer = Https.createServer(_express);        
        
        const prepareServer = () =>
        {

            _express.use(BodyParser.json());
            _express.use(BodyParser.urlencoded(
            {
                extended: true
                
            }));

            const ENV_FILE = Path.join(__dirname, "../.env");
            DotEnv.config({ path: ENV_FILE });
            
        };

        const bindServer = () =>
        {            
            _httpsServer.listen(7071, () =>
            {

                console.log("We have started our server on port 7071");

            });

            _httpsServer.on("close", () =>
            {
                
                console.log("We are Closing");    


            });

            process.on("SIGINT", () =>
            {
                _httpsServer.close();

            });        
            
        };

        const prepareRestAPIClient = (applicationInfo) =>
        {

            applicationInfo.MsRestNodeAuth = MsRestNodeAuth;
            applicationInfo.MsRestAzure = MsRestAzure;

        };

        const prepareAllControllers = () =>
        {

            prepareJobController();
            prepareCronJobController();
            prepareNodepoolController();
            preparePrivateDNSZoneController();
            prepareTenantController();

        };

        const prepareJobController = () =>
        {

            let applicationInfo = {};
            applicationInfo.Axios = Axios;
            applicationInfo.routerInfo = Express.Router();
            new MTAJobController(applicationInfo);
            _express.use("/jobs", applicationInfo.routerInfo);

        };

        const prepareCronJobController = () =>
        {

            let applicationInfo = {};
            applicationInfo.Axios = Axios;
            applicationInfo.routerInfo = Express.Router();
            new MTACronJobController(applicationInfo);
            _express.use("/cronjobs", applicationInfo.routerInfo);

        };

        const prepareNodepoolController = () =>
        {

            let applicationInfo = {};
            applicationInfo.Axios = Axios;
            applicationInfo.routerInfo = Express.Router();
            prepareRestAPIClient(applicationInfo);
            new MTANodepoolController(applicationInfo);
            _express.use("/nodepools", applicationInfo.routerInfo);

        };

        const preparePrivateDNSZoneController = () =>
        {

            let applicationInfo = {};
            applicationInfo.Axios = Axios;
            applicationInfo.routerInfo = Express.Router();
            prepareRestAPIClient(applicationInfo);
            new MTAPrivateDNSController(applicationInfo);
            _express.use("/zones", applicationInfo.routerInfo);

        };
        
        const prepareTenantController = () =>
        {

            let applicationInfo = {};
            applicationInfo.Axios = Axios;
            applicationInfo.routerInfo = Express.Router();
            new MTATenantController(applicationInfo);
            _express.use("/tenants", applicationInfo.routerInfo);

        };

        prepareServer();
        bindServer();
        prepareAllControllers();

    }
}

module.exports = new k8sMultiTenantControler();


