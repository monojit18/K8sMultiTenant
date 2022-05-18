/*jshint esversion: 6 */

const MTAController = require("./mtaController");
const MTANamespaceWorkflow = require("../workflows/mtaNamespaceWorkflow");
const MTADeployWorkflow = require("../workflows/mtaDeployWorkflow");
const MTAHPAWorkflow = require("../workflows/mtaHPAWorkflow");
const MTAServiceWorkflow = require("../workflows/mtaServiceWorkflow");
const MTAIngressWorkflow = require("../workflows/mtaIngressWorkflow");
const MTANetpolWorkflow = require("../workflows/mtaNetpolWorkflow");
const MTATenantModel = require("../models/mtaTenantModel");

class MTATenantController extends MTAController
{
    
    constructor(applicationInfo)
    {

        super(applicationInfo);
        const _self = this;

        this.commonURL = "/:tenantName/groups/:groupName";
        this.namespaceURL = "/groups/:groupName";        
        this.tenantsBaseURL = "http://localhost:7071/tenants";
        
        const sendResponse = (response, tenantInfo, successCode) =>
        {

            const errorCount = tenantInfo.error.length;
            if (errorCount > 0)
                response.status(500);
            else
                response.status(successCode);
            
            const responseInfo = {};
            if (tenantInfo.error.length > 0)
                responseInfo.error = tenantInfo.error;
            if (tenantInfo.deploy.length > 0)
                responseInfo.deploy = tenantInfo.deploy;
            if (tenantInfo.hpa.length > 0)
                responseInfo.hpa = tenantInfo.hpa;
            if (tenantInfo.service.length > 0)
                responseInfo.service = tenantInfo.service;
            if (tenantInfo.namespace != null)
                responseInfo.namespace = tenantInfo.namespace;
            if (tenantInfo.ingress.length > 0)
                responseInfo.ingress = tenantInfo.ingress;
            if (tenantInfo.netpol.length > 0)
                responseInfo.netpol = tenantInfo.netpol;

            response.send(responseInfo);

        };

        const createDeployWorkflow = (applicationInfo, workflow, nextWorkflow,
                                      deployBody) =>
        {

            if (workflow == null)
            {
                
                workflow = new MTADeployWorkflow(applicationInfo, deployBody);
                nextWorkflow = workflow;

            }
            else
                nextWorkflow = nextWorkflow.addWorkflow(
                               new MTADeployWorkflow(applicationInfo, deployBody));

            return { workflow, nextWorkflow };

        };

        const createHPAWorkflow = (applicationInfo, workflow, nextWorkflow,
                                   hpaBody) =>
        {

            if (workflow == null)
            {
                
                workflow = new MTAHPAWorkflow(applicationInfo, hpaBody);
                nextWorkflow = workflow;

            }
            else
                nextWorkflow = nextWorkflow.addWorkflow(
                               new MTAHPAWorkflow(applicationInfo, hpaBody));

            return { workflow, nextWorkflow };

        };

        const createServiceWorkflow = (applicationInfo, workflow, nextWorkflow,
                                       serviceBody) =>
        {

            if (workflow == null)
            {
                
                workflow = new MTAServiceWorkflow(applicationInfo, serviceBody);
                nextWorkflow = workflow;

            }
            else
                nextWorkflow = nextWorkflow.addWorkflow(
                               new MTAServiceWorkflow(applicationInfo, serviceBody));

            return { workflow, nextWorkflow };

        };

        const createIngressWorkflow = (applicationInfo, workflow, nextWorkflow,
                                       ingressBody) =>
        {

            if (workflow == null)
            {

                workflow = new MTAIngressWorkflow(applicationInfo, ingressBody);
                nextWorkflow = workflow;
                
            }
            else
                nextWorkflow = nextWorkflow.addWorkflow
                                (new MTAIngressWorkflow(applicationInfo, ingressBody));

            return { workflow, nextWorkflow };

        };

        const createNetpolWorkflow = (applicationInfo, workflow, nextWorkflow,
                                      netpolBody) =>
        {

            if (workflow == null)
            {
                
                workflow = new MTANetpolWorkflow(applicationInfo, netpolBody);
                nextWorkflow = workflow;

            }
            else
                nextWorkflow = nextWorkflow.addWorkflow(
                               new MTANetpolWorkflow(applicationInfo, netpolBody));

            return { workflow, nextWorkflow };

        };

        const prepareDeployWorkflow = (request, applicationInfo, workflow,
                                       nextWorkflow) =>
        {

            const deployList = request.body.deploy;
            if (deployList == null)
                return null;

            if (deployList.length == 0)
            {

                const workflowInfo = createDeployWorkflow(applicationInfo, workflow,
                                                          nextWorkflow, null);
                return workflowInfo;

            }
            
            deployList.forEach((deployBody) =>
            {

                const workflowInfo = createDeployWorkflow(applicationInfo, workflow,
                                                          nextWorkflow, deployBody);

                if (workflowInfo != null)
                {

                    workflow = workflowInfo.workflow;
                    nextWorkflow = workflowInfo.nextWorkflow;

                }

            });

            return { workflow, nextWorkflow };

        };

        const prepareHPAWorkflow = (request, applicationInfo, workflow,
                                    nextWorkflow) =>
        {

            const hpaList = request.body.hpa;
            if (hpaList == null)
                return null;

            if (hpaList.length == 0)
            {

                const workflowInfo = createHPAWorkflow(applicationInfo, workflow,
                                                       nextWorkflow, null);
                return workflowInfo;

            }
            
            hpaList.forEach((hpaBody) =>
            {

                const workflowInfo = createHPAWorkflow(applicationInfo, workflow,
                                                       nextWorkflow, hpaBody);

                if (workflowInfo != null)
                {

                    workflow = workflowInfo.workflow;
                    nextWorkflow = workflowInfo.nextWorkflow;

                }

            });

            return { workflow, nextWorkflow };

        };

        const prepareServiceWorkflow = (request, applicationInfo, workflow,
                                        nextWorkflow) =>
        {

            const serviceList = request.body.service;
            if (serviceList == null)
                return null;
            
            if (serviceList.length == 0)
            {

                const workflowInfo = createServiceWorkflow(applicationInfo, workflow,
                                                           nextWorkflow, null);
                return workflowInfo;

            }
        
            serviceList.forEach((serviceBody) =>
            {

                const workflowInfo = createServiceWorkflow(applicationInfo, workflow,
                                                           nextWorkflow, serviceBody);

                if (workflowInfo != null)
                {

                    workflow = workflowInfo.workflow;
                    nextWorkflow = workflowInfo.nextWorkflow;

                }

            });

            return { workflow, nextWorkflow };

        };

        const prepareIngressWorkflow = (request, applicationInfo, workflow, nextWorkflow) =>
        {

            const ingressList = request.body.ingress;
            if (ingressList == null)
                return null;

            if (ingressList.length == 0)
            {

                const workflowInfo = createIngressWorkflow(applicationInfo, workflow,
                                                           nextWorkflow, null);
                return workflowInfo;

            }

            ingressList.forEach((ingressBody) =>
            {

                const workflowInfo = createIngressWorkflow(applicationInfo, workflow,
                                                           nextWorkflow, ingressBody);
                if (workflowInfo != null)
                {

                    workflow = workflowInfo.workflow;
                    nextWorkflow = workflowInfo.nextWorkflow;

                }

            });

            return { workflow, nextWorkflow };
            
        };

        const prepareNetpolWorkflow = (request, applicationInfo, workflow,
                                       nextWorkflow) =>
        {

            const netpolList = request.body.netpol;            
            if (netpolList == null)
                return null;

            if (netpolList.length == 0)
            {

                const workflowInfo = createNetpolWorkflow(applicationInfo, workflow,
                                                          nextWorkflow, null);
                return workflowInfo;

            }

            netpolList.forEach((netpolBody) =>
            {   

                const workflowInfo = createNetpolWorkflow(applicationInfo, workflow,
                                                          nextWorkflow, netpolBody);
                if (workflowInfo != null)
                {

                    workflow = workflowInfo.workflow;
                    nextWorkflow = workflowInfo.nextWorkflow;

                }

            });            
            
            return { workflow, nextWorkflow };
            
        };

        const prepareCommonWorkflows = (request, applicationInfo, workflow,
                                        nextWorkflow) =>
        {

            let workflowInfo = {};
            const deployWorkflowInfo =  prepareDeployWorkflow(request, applicationInfo,
                                                              workflow, nextWorkflow);
            
            if (deployWorkflowInfo != null)
            {

                workflowInfo = deployWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;

            }            

            const hpaWorkflowInfo =  prepareHPAWorkflow(request, applicationInfo,
                                                        workflow, nextWorkflow);
            
            if (hpaWorkflowInfo != null)
            {

                workflowInfo = hpaWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;

            }

            const serviceWorkflowInfo =  prepareServiceWorkflow(request, applicationInfo,
                                                                workflow, nextWorkflow);

            if (serviceWorkflowInfo != null)
            {

                workflowInfo = serviceWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;

            }

            const ingressWorkflowInfo =  prepareIngressWorkflow(request, applicationInfo,
                                                                workflow, nextWorkflow);
            if (ingressWorkflowInfo != null)
            {

                workflowInfo = ingressWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;

            }

            const netpolWorkflowInfo =  prepareNetpolWorkflow(request, applicationInfo,
                                                              workflow, nextWorkflow);
            if (netpolWorkflowInfo != null)
            {

                workflowInfo = netpolWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;

            }

            return workflowInfo;

        };

        const preparePatchWorkflows = (request, applicationInfo, workflow,
                                          nextWorkflow) =>
        {

            let workflowInfo = {};

            const deployWorkflowInfo =  prepareDeployWorkflow(request, applicationInfo,
                                                              workflow, nextWorkflow);
            
            if (deployWorkflowInfo != null)
            {

                workflowInfo = deployWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;                

            }

            const hpaWorkflowInfo =  prepareHPAWorkflow(request, applicationInfo,
                                                        workflow, nextWorkflow);
            
            if (hpaWorkflowInfo != null)
            {

                workflowInfo = hpaWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;

            }

            const ingressWorkflowInfo =  prepareIngressWorkflow(request, applicationInfo,
                                                                workflow, nextWorkflow);
            if (ingressWorkflowInfo != null)
            {

                workflowInfo = ingressWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;

            }

            const netpolWorkflowInfo =  prepareNetpolWorkflow(request, applicationInfo,
                                                              workflow, nextWorkflow);
            if (netpolWorkflowInfo != null)
            {

                workflowInfo = netpolWorkflowInfo;
                workflow = workflowInfo.workflow;
                nextWorkflow = workflowInfo.nextWorkflow;

            }

            return workflowInfo;

        };

        const prepareCreateTenantWorkflow = (request, applicationInfo) =>
        {
            
            let workflow = new MTANamespaceWorkflow(applicationInfo);
            let nextWorkflow = workflow;

            const workflowInfo = prepareCommonWorkflows(request, applicationInfo,
                                                        workflow, nextWorkflow);            
            return workflowInfo;

        };

        const preparePatchTenantWorkflow = (request, applicationInfo) =>
        {

            let workflow = null;
            let nextWorkflow = null;

            const workflowInfo = preparePatchWorkflows(request, applicationInfo,
                                                          workflow, nextWorkflow);            
            return workflowInfo;

        };

        const prepareDeleteTenantWorkflow = (request, applicationInfo) =>
        {

            let workflow = null;
            let nextWorkflow = null;

            if (request.body.namespace != null)
            {

                workflow = new MTANamespaceWorkflow(applicationInfo);
                nextWorkflow = workflow;
                return { workflow, nextWorkflow };

            }
            
            const workflowInfo = prepareCommonWorkflows(request, applicationInfo,
                                                        workflow, nextWorkflow);
            return workflowInfo;                                            

        };

        _self.applicationInfo.routerInfo.put(_self.namespaceURL,
        (request, response) =>
        {

            const popTenantInfo = new MTATenantModel();
            let workflow = new MTANamespaceWorkflow(applicationInfo);
            workflow.executeCreateAsync(request, popTenantInfo, (tenantInfo, statusCode) =>
            {

                sendResponse(response, tenantInfo, statusCode);

            });
            
        });
        
        _self.applicationInfo.routerInfo.put(_self.commonURL,
        (request, response) =>
        {

            const popTenantInfo = new MTATenantModel();
            const workflowInfo = prepareCreateTenantWorkflow(
                                 request, _self.applicationInfo);
            workflowInfo.workflow.executeCreateAsync(request, popTenantInfo,
            (tenantInfo, statusCode) =>
            {

                sendResponse(response, tenantInfo, statusCode);

            });
        });

        _self.applicationInfo.routerInfo.patch(_self.commonURL,
        (request, response) =>
        {

            const popTenantInfo = new MTATenantModel();
            const workflowInfo = preparePatchTenantWorkflow(
                                 request, _self.applicationInfo);

            workflowInfo.workflow.executeUpdateAsync(request, popTenantInfo,
            (tenantInfo, statusCode) =>
            {

                sendResponse(response, tenantInfo, statusCode);

            });
        });    

        _self.applicationInfo.routerInfo.delete(_self.commonURL,
        (request, response) =>
        {

            const popTenantInfo = new MTATenantModel();
            const workflowInfo = prepareDeleteTenantWorkflow(request, _self.applicationInfo);            
            workflowInfo.workflow.executeDeleteAsync(request, popTenantInfo,
            (tenantInfo, statusCode) =>
            {

                sendResponse(response, tenantInfo, statusCode);

            });
        });
        
        _self.applicationInfo.routerInfo.delete(_self.namespaceURL,
        (request, response) =>
        {

            const popTenantInfo = new MTATenantModel();
            let workflow = new MTANamespaceWorkflow(applicationInfo);
            workflow.executeDeleteAsync(request, popTenantInfo, (tenantInfo, statusCode) =>
            {

                sendResponse(response, tenantInfo, statusCode);

            });
        });        
    }
}

module.exports = MTATenantController;


