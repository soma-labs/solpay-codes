import ProjectAccount from "../../program/project-accounts/project-account";
import ProjectData from "./project-data";
import getUrlWithBase from "../../utils/base-url";

export default class Project {
    projectAccount: ProjectAccount;
    projectData: ProjectData | null;

    constructor(projectAccount: ProjectAccount, projectData: ProjectData | null = null) {
        this.projectAccount = projectAccount;
        this.projectData = projectData;
    }

    getTitle(): string {
        return this.projectAccount.data.title || `Candy Machine: ${this.projectAccount.data.candy_machine_id.toString()}`;
    }

    getLink(): string {
        return getUrlWithBase(`/projects/${this.projectAccount.data.project_owner_pubkey.toString()}/${this.projectAccount.data.candy_machine_id.toString()}`);
    }

    getMintLink(): string {
        return getUrlWithBase(`/mint/${this.projectAccount.data.project_owner_pubkey.toString()}/${this.projectAccount.data.candy_machine_id.toString()}`);
    }
}
