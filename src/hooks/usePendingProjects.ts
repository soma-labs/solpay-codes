import {useContext, useEffect, useState} from "react";
import {PopupMessageContext, PopupMessageTypes} from "../providers/popup-message-provider";
import {AuthContext} from "../providers/auth-provider";
import ProjectData from "../models/project/project-data";
import {getOwnerProjectsData} from "../models/project/get-project-data";
import {WalletProjectsContext} from "../providers/wallet-projects-provider";

type PendingProjectsHookReturnType = {
    pendingProjectsLoading: boolean;
    pendingProjects: ProjectData[];
};

export default function usePendingProjects(refresh: number = 0): PendingProjectsHookReturnType {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const {walletProjects} = useContext(WalletProjectsContext);
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

                ownerProjectsData.forEach(ownerProjectData => {
                    let isPendingProject = true;

                    for (let i = walletProjects.length - 1; i >= 0; i--) {
                        const walletProject = walletProjects[i];

                        if (walletProject.projectAccount.data.project_owner_pubkey.equals(ownerProjectData.project_owner_pubkey)
                            && walletProject.projectAccount.data.candy_machine_id.equals(ownerProjectData.candy_machine_id)
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
    }, [wallet.connected, refresh, walletProjects]);

    return {
        pendingProjectsLoading,
        pendingProjects,
    };
}
