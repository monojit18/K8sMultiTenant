/*jshint esversion: 6 */

const { R_OK } = require("constants");

class K8sMultiTenantOperator
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
        const K8s = require(nodeModulesPathString + "@kubernetes/client-node");        
        const DotEnv = require(nodeModulesPathString + "dotenv");
        const SwaggerJsdoc = require("swagger-jsdoc");
        const SwaggerUi = require("swagger-ui-express");
        const MTANamespaceController = require("./controllers/mtaNamespaceController");
        const MTAJobController = require("./controllers/mtaJobController");
        const MTACronJobController = require("./controllers/mtaCronJobController");
        const MTADeployController = require("./controllers/mtaDeployController");
        const MTAHPAController = require("./controllers/mtaHPAController");
        const MTAPVCController = require("./controllers/mtaPVCController");
        const MTAServiceController = require("./controllers/mtaServiceController");
        const MTAIngressController = require("./controllers/mtaIngressController");
        const MTANetPolController = require("./controllers/mtaNetPolController");

        this.defaultTemplateToken = "../templates";
        this.mountedToken = "../mnt/templates";
        this.yamlToken = "/yamls";
        this.namespaceToken = "/template-ns.yaml";
        this.jobToken = "/template-job.yaml";
        this.cronjobToken = "/template-cronjob.yaml";
        this.deployToken = "/template-deploy.yaml";
        this.hpaToken = "/template-hpa.yaml";
        this.pvcToken = "/template-pvc.yaml";
        this.svcToken = "/template-svc.yaml";
        this.ingToken = "/template-ing.yaml";
        this.npToken = "/template-np.yaml";

        const _express = Express();
        const _httpsServer = Https.createServer(_express);
        let k8sClient = {};

        const prepareSwagger = () =>
        {

            const swaggerDefinition =
            {
                openapi: '3.0.0',
                info:
                {
                  title: 'Multi Tenant API for K8s',
                  version: '1.0.0',
                },
            };
            
            var path = Path.join(__dirname, "/controllers/*.js");
            const options =
            {
                swaggerDefinition,                
                apis: [`${path}`],
            };
              
            const swaggerSpec = SwaggerJsdoc(options);
            _express.use('/docs', SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));

        };

        const prepareApplicationInfo = (templatePath) =>
        {
            
            let applicationInfo = {};
            applicationInfo.yamlsPath = templatePath + _self.yamlToken;

            prepareK8sAPIClient(applicationInfo);
            applicationInfo.routerInfo = Express.Router();
            return applicationInfo;

        };

        const prepareTemplatesPath = (pathCallback) =>
        {

            const defaultTemplatePath = Path.join(__dirname, _self.defaultTemplateToken);
            const mountedTemplatePath = Path.join(__dirname, _self.mountedToken);
            
            FS.access(mountedTemplatePath, R_OK, (errorInfo) =>
            {

                if (errorInfo == null)
                {

                    pathCallback(_self.mountedToken, null);
                    return;

                }

                FS.access(defaultTemplatePath, R_OK, (errorInfo) =>
                {
                
                    if (errorInfo != null)
                        pathCallback(null, errorInfo);
                    else
                        pathCallback(_self.defaultTemplateToken, null);

                });
            });
        };
        
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
            _httpsServer.listen(7070, () =>
            {

                console.log("We have started our server on port 7070");

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

        const prepareK8sTemplate = (applicationInfo, opts, k8sToken) =>
        {

            let yamlPath = Path.join(__dirname, applicationInfo.yamlsPath, k8sToken);
            if (FS.existsSync(yamlPath) == false)
            {

                const defaultYamlPath = _self.defaultTemplateToken + _self.yamlToken;
                yamlPath = Path.join(__dirname,  defaultYamlPath, k8sToken);

            }
                        
            const yamlString = FS.readFileSync(yamlPath, opts);
            return yamlString;

        };

        const prepareK8sAPIClient = (applicationInfo) =>
        {

            const opts = {};
            opts.encoding = "utf8";
            opts.flags = "r";

            const configPath = Path.join(__dirname, applicationInfo.yamlsPath, "/kubeconfig");
            applicationInfo.K8s = K8s;

            k8sClient = new K8s.KubeConfig();
            k8sClient.loadFromFile(configPath, opts);            

            const k8sAppsV1Api = k8sClient.makeApiClient(K8s.AppsV1Api);
            applicationInfo.k8sAppsV1Api = k8sAppsV1Api;

            const k8sAutoscalingV1Api = k8sClient.makeApiClient(K8s.AutoscalingV1Api);
            applicationInfo.k8sAutoscalingV1Api = k8sAutoscalingV1Api;

            const k8sBatchV1Api = k8sClient.makeApiClient(K8s.BatchV1Api);
            applicationInfo.k8sBatchV1Api = k8sBatchV1Api;

            const k8sBatchV1beta1Api = k8sClient.makeApiClient(K8s.BatchV1beta1Api);
            applicationInfo.k8sBatchV1beta1Api = k8sBatchV1beta1Api;

            const k8sCoreV1Api = k8sClient.makeApiClient(K8s.CoreV1Api);
            applicationInfo.k8sCoreV1Api = k8sCoreV1Api;

            const k8sNetworkingV1beta1Api = k8sClient.makeApiClient(K8s.NetworkingV1beta1Api);
            applicationInfo.k8sNetworkingV1beta1Api = k8sNetworkingV1beta1Api;

            const k8sNetworkingV1Api = k8sClient.makeApiClient(K8s.NetworkingV1Api);
            applicationInfo.k8sNetworkingV1Api = k8sNetworkingV1Api;
            
            const yamlNamespaceString = prepareK8sTemplate(applicationInfo, opts, _self.namespaceToken);
            applicationInfo.yamlNamespaceString = yamlNamespaceString;

            const yamlJobString = prepareK8sTemplate(applicationInfo, opts, _self.jobToken);
            applicationInfo.yamlJobString = yamlJobString;

            const yamlCronJobString = prepareK8sTemplate(applicationInfo, opts, _self.cronjobToken);
            applicationInfo.yamlCronJobString = yamlCronJobString;

            const yamlDeployString = prepareK8sTemplate(applicationInfo, opts, _self.deployToken);
            applicationInfo.yamlDeployString = yamlDeployString;

            const yamlHPAString = prepareK8sTemplate(applicationInfo, opts, _self.hpaToken);
            applicationInfo.yamlHPAString = yamlHPAString;

            const yamlPVCString = prepareK8sTemplate(applicationInfo, opts, _self.pvcToken);
            applicationInfo.yamlPVCString = yamlPVCString;

            const yamlServiceString = prepareK8sTemplate(applicationInfo, opts, _self.svcToken);
            applicationInfo.yamlServiceString = yamlServiceString;

            const yamlIngressString = prepareK8sTemplate(applicationInfo, opts, _self.ingToken);
            applicationInfo.yamlIngressString = yamlIngressString;

            const yamlNetPolString = prepareK8sTemplate(applicationInfo, opts, _self.npToken);
            applicationInfo.yamlNetPolString = yamlNetPolString;

            // const jsonSQLPath = Path.join(__dirname, "../templates/arms/template-sql.json");
            // const jsonSQLPath = Path.join(__dirname, applicationInfo.armsPath, "/template-sql.json");
            // const jsonSQLString = FS.readFileSync(jsonSQLPath, opts);
            // applicationInfo.jsonSQLString = jsonSQLString;
    
        };

        const prepareAllControllers = (templatePath) =>
        {        

            prepareNamespaceController(templatePath);
            prepareJobController(templatePath);
            prepareCronJobController(templatePath);
            prepareDeployController(templatePath);
            prepareHPAController(templatePath);
            preparePVCController(templatePath);
            prepareServiceController(templatePath);
            prepareIngressController(templatePath);
            prepareNetPolController(templatePath);
            
        };

        const prepareNamespaceController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTANamespaceController(applicationInfo);
            _express.use("/groups", applicationInfo.routerInfo);

        };

        const prepareJobController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTAJobController(applicationInfo);
            _express.use("/job", applicationInfo.routerInfo);

        };

        const prepareCronJobController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTACronJobController(applicationInfo);
            _express.use("/cronjob", applicationInfo.routerInfo);

        };

        const prepareDeployController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTADeployController(applicationInfo);
            _express.use("/deploy", applicationInfo.routerInfo);

        };

        const prepareHPAController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTAHPAController(applicationInfo);
            _express.use("/hpa", applicationInfo.routerInfo);

        };

        const preparePVCController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTAPVCController(applicationInfo);
            _express.use("/pvc", applicationInfo.routerInfo);

        };

        const prepareServiceController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTAServiceController(applicationInfo);
            _express.use("/service", applicationInfo.routerInfo);

        };

        const prepareIngressController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTAIngressController(applicationInfo);
            _express.use("/ingress", applicationInfo.routerInfo);

        };

        const prepareNetPolController = (templatePath) =>
        {

            const applicationInfo = prepareApplicationInfo(templatePath);
            new MTANetPolController(applicationInfo);
            _express.use("/netpol", applicationInfo.routerInfo);

        };

        prepareServer();
        bindServer();
        prepareSwagger();
        
        prepareTemplatesPath((templatePath, errorInfo) =>
        {

            if (errorInfo == null)
                prepareAllControllers(templatePath);
            else
                console.log(errorInfo);

        });

    }
}

module.exports = new K8sMultiTenantOperator();


