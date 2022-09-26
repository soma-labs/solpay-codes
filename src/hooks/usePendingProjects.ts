import {useContext, useEffect, useState} from "react";
import {PopupMessageContext, PopupMessageTypes} from "../providers/popup-message-provider";
import {AuthContext} from "../providers/auth-provider";
import ProjectData from "../models/project/project-data";
import {getOwnerProjectsData} from "../models/project/get-project-data";
import getProjectAccounts from "../program/project-accounts/get-project-accounts";

type PendingProjectsHookReturnType = {
    pendingProjectsLoading: boolean;
    pendingProjects: ProjectData[];
};

export default function usePendingProjects(): PendingProjectsHookReturnType {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [pendingProjectsLoading, setPendingProjectsLoading] = useState<boolean>(true);
    const [pendingProjects, setPendingProjects] = useState<ProjectData[]>([]);

    useEffect(() => {
        (async () => {
            if (!wallet.publicKey) {
                setPendingProjects([]);
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
                    setMessage(e.message, PopupMessageTypes.Error);
                } else {
                    console.log(e);
                }
            }

            setPendingProjects(pendingProjects);
            setPendingProjectsLoading(false);
        })();
    }, [wallet.connected]);

    return {
        pendingProjectsLoading,
        pendingProjects,
    };
}
