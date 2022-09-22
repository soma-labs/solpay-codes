import ProjectAccount from "../../program/project-accounts/project-account";
import ProjectData from "./project-data";
import Project from "./project";

export default function getProjects(projectAccounts: ProjectAccount[], projectsData: ProjectData[]): Project[] {
    let projects: Project[] = [];

    projectAccounts.forEach(projectAccount => {
        projects.push(
            new Project(
                projectAccount,
                projectsData.find(projectData =>
                    projectData.project_owner_pubkey.equals(projectAccount.data.project_owner_pubkey)
                    && projectData.candy_machine_id.equals(projectAccount.data.candy_machine_id)
                )
            )
        );
    });

    return projects;
}
