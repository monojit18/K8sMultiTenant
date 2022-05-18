/*jshint esversion: 6 */

class MTAJobModel
{

    constructor(jobInfo)
    {

        this.name = jobInfo.metadata.name;
        this.namespace = jobInfo.metadata.namespace;
        this.labels = jobInfo.metadata.labels;

        this.template = {};
        this.template.specs = {};
        this.template.specs.containers = {};
        this.template.specs.activeDeadlineSeconds = jobInfo.spec.activeDeadlineSeconds;
        this.template.specs.backoffLimit = jobInfo.spec.backoffLimit;
        this.template.specs.completions = jobInfo.spec.completions;
        this.template.specs.parallelism = jobInfo.spec.parallelism;
        this.template.specs.containers.image = jobInfo.spec.template.spec.containers[0].image;
        this.template.specs.containers.imagePullPolicy = jobInfo.spec.template.spec.containers[0].imagePullPolicy;
        this.template.specs.containers.name = jobInfo.spec.template.spec.containers[0].name;
        this.template.specs.containers.command = jobInfo.spec.template.spec.containers[0].command;

    }
}

module.exports = MTAJobModel;