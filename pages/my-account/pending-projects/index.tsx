import MyAccountLayout from "../../../src/components/layouts/my-account-layout";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../src/providers/auth-provider";
import ProjectData from "../../../src/models/project/project-data";
import LoadingIcon from "../../../src/components/loading-icon";
import Link from "next/link";
import {getOwnerProjectsData} from "../../../src/models/project/get-project-data";
import getProjectAccounts from "../../../src/program/project-accounts/get-project-accounts";
import {ErrorMessageContext} from "../../../src/providers/error-message-provider";
import ProjectCard from "../../../src/components/projects/project-card";

export default function PendingProjects() {
    const {setErrorMessage} = useContext(ErrorMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [pendingProjectsLoading, setPendingProjectsLoading] = useState<boolean>(true);
    const [pendingProjects, setPendingProjects] = useState<ProjectData[]>([]);

    useEffect(() => {
        (async () => {
            if (!wallet.publicKey) {
                setPendingProjectsLoading(false);
                return;
            }

            const pendingProjects: ProjectData[] = [];

            try {
                const ownerProjectsData = await getOwnerProjectsData(wallet.publicKey);
                const ownerProjectAccounts = await getProjectAccounts(connection, {
                    owner: wallet.publicKey,
                });

                ownerProjectsData.forEach(ownerProjectData => {
                    let isPendingProject = true;

                    for (let i = ownerProjectAccounts.length - 1; i >= 0; i--) {
                        const ownerProjectAccount = ownerProjectAccounts[i];
                        if (ownerProjectAccount.data.project_owner_pubkey.toString() === ownerProjectData.project_owner_pubkey.toString()
                            && ownerProjectAccount.data.candy_machine_id.toString() === ownerProjectData.candy_machine_id.toString()
                        ) {
                            isPendingProject = false;
                            break;
                        }
                    }

                    if (isPendingProject) {
                        pendingProjects.push(ownerProjectData);
                    }
                });
            } catch (e) {
                if (e instanceof Error) {
                    setErrorMessage(e.message);
                } else {
                    console.log(e);
                }
            }

            setPendingProjects(pendingProjects);
            setPendingProjectsLoading(false);
        })();
    }, [wallet.connected]);

    return (
        <MyAccountLayout>
            <section className="nft-projects d-flex">
                {pendingProjectsLoading ?
                    <LoadingIcon/>
                    :
                    pendingProjects.map((project, index) =>
                        <div key={index} className="nft-project-item col-12 col-md-3">
                            <ProjectCard
                                title={project?.title}
                                description={project?.description}
                                imageUrl={project?.image_url}
                                actions={[
                                    <Link key={0} href={`/my-account/pending-projects/${project.candy_machine_id.toString()}`}>
                                        <a className="button button--hollow">Finish registration</a>
                                    </Link>
                                ]}
                            />
                        </div>)
                }
            </section>
        </MyAccountLayout>
    );
}
