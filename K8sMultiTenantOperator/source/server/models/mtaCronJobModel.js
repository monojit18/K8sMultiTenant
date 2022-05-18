/*jshint esversion: 6 */

class MTAJobModel
{

    constructor(cronjobInfo)
    {

        this.name = cronjobInfo.metadata.name;
        this.namespace = cronjobInfo.metadata.namespace;

        this.template = {};
        this.template.specs = {};
        this.template.specs.containers = {};
        this.template.specs.schedule = cronjobInfo.spec.schedule;
        this.template.specs.concurrencyPolicy = cronjobInfo.spec
                                                .concurrencyPolicy;
        this.template.specs.failedJobsHistoryLimit = cronjobInfo.spec
                                                     .failedJobsHistoryLimit;
        this.template.specs.startingDeadlineSeconds = cronjobInfo.spec
                                                      .startingDeadlineSeconds;
        this.template.specs.successfulJobsHistoryLimit = cronjobInfo.spec
                                                         .successfulJobsHistoryLimit;
        this.template.specs.suspend = cronjobInfo.spec.suspend;
        this.template.specs.containers.image = cronjobInfo.spec.jobTemplate
                                               .spec.template.spec
                                               .containers[0].image;
        this.template.specs.containers.imagePullPolicy = cronjobInfo.spec.jobTemplate
                                                         .spec.template.spec
                                                         .containers[0].imagePullPolicy;
        this.template.specs.containers.name = cronjobInfo.spec.jobTemplate
                                              .spec.template.spec
                                              .containers[0].name;
        this.template.specs.containers.command = cronjobInfo.spec.jobTemplate
                                                 .spec.template.spec
                                                 .containers[0].command;

    }
}

module.exports = MTAJobModel;