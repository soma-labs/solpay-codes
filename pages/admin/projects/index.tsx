import Link from "next/link";
import AdminLayout from "../../../src/components/layouts/admin-layout";
import useProjects from "../../../src/hooks/useProjects";
import LoadingIcon from "../../../src/components/loading-icon";
import closeProjectAccount from "../../../src/program/project-accounts/close-project-account";
import {AuthContext} from "../../../src/providers/auth-provider";
import {useContext, useState} from "react";
import {ErrorMessageContext} from "../../../src/providers/error-message-provider";
import ProjectCard from "../../../src/components/projects/project-card";
import Project from "../../../src/models/project/project";

export default function AdminProjects() {
    const {setErrorMessage} = useContext(ErrorMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const {projects, projectsLoading} = useProjects();
    const [_, setRefresh] = useState<number>(Date.now());

    const onCloseProjectAction = async (project: Project) => {
        try {
            await closeProjectAccount({
                owner: project.projectAccount.data.project_owner_pubkey,
                candyMachineId: project.projectAccount.data.candy_machine_id
            }, wallet, connection);

            setRefresh(Date.now());
        } catch (e) {
            if (e instanceof Error) {
                setErrorMessage(e.message);
            } else {
                console.log(e);
            }
        }
    };

    return (
        <AdminLayout>
            <section className="nft-projects d-flex">
                {projectsLoading ?
                    <LoadingIcon/>
                    :
                    projects.map((project, index) =>
                        <div key={index} className="nft-project-item col-12 col-md-3">
                            <ProjectCard
                                title={project.projectData?.title || project.projectAccount.data.candy_machine_id.toString()}
                                description={project.projectData?.description}
                                imageUrl={project.projectData?.image_url}
                                actions={[
                                    <Link key={0} href={`/admin/projects/${project.projectAccount.data.project_owner_pubkey.toString()}/${project.projectAccount.data.candy_machine_id.toString()}`}>
                                        <a className="button button--hollow">Edit project</a>
                                    </Link>,
                                    <button
                                        key={1}
                                        className="button button--hollow"
                                        onClick={onCloseProjectAction.bind(null, project)}
                                    >
                                        Close project
                                    </button>
                                ]}
                            />
                        </div>)
                }
            </section>
        </AdminLayout>
    );
}
