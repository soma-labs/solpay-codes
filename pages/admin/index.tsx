import Link from "next/link";
import AdminLayout from "../../src/components/admin/admin-layout";
import LoadingIcon from "../../src/components/loading-icon";
import closeProjectAccount from "../../src/program/project-accounts/close-project-account";
import {AuthContext} from "../../src/providers/auth-provider";
import {useContext, useState} from "react";
import {PopupMessageContext, PopupMessageTypes} from "../../src/providers/popup-message-provider";
import Project from "../../src/models/project/project";
import ProjectsTable from "../../src/components/admin/projects/projects-table";
import {WalletProjectsContext} from "../../src/providers/wallet-projects-provider";
import useProjects from "../../src/hooks/useProjects";
import useQueryParamsPagination from "../../src/hooks/useQueryParamsPagination";
import SimplePagination from "../../src/components/simple-pagination";
import {sleep} from "@toruslabs/base-controllers";

export default function Admin() {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const {refreshWalletProjects} = useContext(WalletProjectsContext);
    const paginationOptions = useQueryParamsPagination();
    const [refreshProjects, setRefreshProjects] = useState<number>((new Date()).getTime());
    const {projects, projectsLoading, pagination} = useProjects(false, refreshProjects, paginationOptions);

    const onCloseProjectAction = async (project: Project) => {
        try {
            await closeProjectAccount({
                owner: project.projectAccount.data.project_owner_pubkey,
                candyMachineId: project.projectAccount.data.candy_machine_id
            }, wallet, connection);

            await sleep(1000);

            refreshWalletProjects();
            setRefreshProjects((new Date()).getTime());
        } catch (e) {
            if (e instanceof Error) {
                setMessage(e.message, PopupMessageTypes.Error);
            } else {
                console.log(e);
            }
        }
    };

    const renderActions = (project: Project) =>
        <>
            <Link href={`/admin/projects/${project.projectAccount.data.project_owner_pubkey.toString()}/${project.projectAccount.data.candy_machine_id.toString()}`}>
                <a className="button button--hollow">Edit project</a>
            </Link>
            <button
                className="button button--hollow ms-2"
                onClick={onCloseProjectAction.bind(null, project)}>
                Close project
            </button>
        </>;

    return (
        <AdminLayout>
            <section className="nft-projects">
                {projectsLoading ?
                    <LoadingIcon/>
                    :
                    <>
                        <ProjectsTable projects={projects} actions={renderActions}/>
                        <SimplePagination pagination={pagination} classVariation={`project-list`}/>
                    </>
                }
            </section>
        </AdminLayout>
    );
}
