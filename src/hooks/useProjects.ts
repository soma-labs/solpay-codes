import Project from "../models/project/project";
import {useContext, useEffect, useState} from "react";
import getProjectAccounts from "../program/project-accounts/get-project-accounts";
import {getBatchProjectData} from "../models/project/get-project-data";
import getProjects from "../models/project/get-projects";
import {AuthContext} from "../providers/auth-provider";
import { PublicKey } from "@solana/web3.js";
import {ErrorMessageContext} from "../providers/error-message-provider";

type ProjectsHookReturnType = {
    projects: Project[];
    projectsLoading: boolean;
};

export default function useProjects(forCurrentAccount: boolean = false): ProjectsHookReturnType {
    const {setErrorMessage} = useContext(ErrorMessageContext);
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
                    setProjectsLoading(false);
                    return;
                }

                projectAccountOptions.owner = wallet.publicKey;
            }

            try {
                const projectAccounts = await getProjectAccounts(connection, projectAccountOptions);

                if (!projectAccounts.length) {
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
                    setErrorMessage(e.message);
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
