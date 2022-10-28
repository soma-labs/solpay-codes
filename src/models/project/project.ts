import ProjectAccount from "../../program/project-accounts/project-account";
import ProjectData from "./project-data";

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
        return `${process.env.NEXT_PUBLIC_VERCEL_ENV ? 'https://' : ''}${process.env.NEXT_PUBLIC_VERCEL_URL}/projects/${this.projectAccount.data.project_owner_pubkey.toString()}/${this.projectAccount.data.candy_machine_id.toString()}`;
    }

    getMintLink(): string {
        return `${process.env.NEXT_PUBLIC_VERCEL_ENV ? 'https://' : ''}${process.env.NEXT_PUBLIC_VERCEL_URL}/mint/${this.projectAccount.data.project_owner_pubkey.toString()}/${this.projectAccount.data.candy_machine_id.toString()}`;
    }
}
