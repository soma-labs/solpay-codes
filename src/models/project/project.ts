import ProjectAccount from "../../program/project-accounts/project-account";
import ProjectData from "./project-data";

export default class Project {
    projectAccount: ProjectAccount;
    projectData: ProjectData | null;

    constructor(projectAccount: ProjectAccount, projectData: ProjectData | null = null) {
        this.projectAccount = projectAccount;
        this.projectData = projectData;
    }
}
