import Project from "../models/project/project";
import {useContext, useEffect, useState} from "react";
import getProjectAccounts from "../program/project-accounts/get-project-accounts";
import {getBatchProjectData} from "../models/project/get-project-data";
import getProjects from "../models/project/get-projects";
import {AuthContext} from "../providers/auth-provider";
import { PublicKey } from "@solana/web3.js";
import {PopupMessageContext, PopupMessageTypes} from "../providers/popup-message-provider";

type ProjectsHookReturnType = {
    projects: Project[];
    projectsLoading: boolean;
};

export default function useProjects(forCurrentAccount: boolean = false): ProjectsHookReturnType {
    const {setMessage} = useContext(PopupMessageContext);
    const {wallet, connection} = useContext(AuthContext);
    const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        (async () => {
            const projectAccountOptions: {
                owner?: PublicKey
            } = {};

            if (forCurrentAccount) {
                if (!wallet.publicKey) {
                    setProjects([]);
                    setProjectsLoading(false);
                    return;
                }

                projectAccountOptions.owner = wallet.publicKey;
            }

            try {
                const projectAccounts = await getProjectAccounts(connection, projectAccountOptions);

                if (!projectAccounts.length) {
                    setProjects([]);
                    setProjectsLoading(false);
                    return;
                }

                const projectsData = await getBatchProjectData(
                    projectAccounts.map(projectAccount => {
                        return {
                            owner: projectAccount.data.project_owner_pubkey.toString(),
                            candyMachineId: projectAccount.data.candy_machine_id.toString()
                        };
                    })
                );

                setProjects(getProjects(projectAccounts, projectsData));
                setProjectsLoading(false);
            } catch (e) {
                if (e instanceof Error) {
                    setMessage(e.message, PopupMessageTypes.Error);
                } else {
                    console.log(e);
                }

                setProjects([]);
                setProjectsLoading(false);
            }
        })();
    }, [wallet.connected]);

    return {
        projects,
        projectsLoading
    };
}
