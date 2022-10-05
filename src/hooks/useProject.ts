import {PublicKey} from "@solana/web3.js";
import {useContext, useEffect, useState} from "react";
import {PopupMessageContext, PopupMessageTypes} from "../providers/popup-message-provider";
import {AuthContext} from "../providers/auth-provider";
import Project from "../models/project/project";
import AffiliateAccount from "../program/affiliate-accounts/affiliate-account";
import getProjectAccount from "../program/project-accounts/get-project-account";
import getProjectData from "../models/project/get-project-data";
import getAffiliateAccounts from "../program/affiliate-accounts/get-affiliate-accounts";

type ProjectHookReturnType = {
    projectLoading: boolean;
    project: Project | null;
    affiliateAccounts: AffiliateAccount[];
};

export default function useProject(owner: string, candyMachine: string, includeAffiliateAccounts: boolean = false): ProjectHookReturnType {
    const {setMessage} = useContext(PopupMessageContext);
    const {connection} = useContext(AuthContext);
    const [projectLoading, setProjectLoading] = useState<boolean>(true);
    const [project, setProject] = useState<Project|null>(null);
    const [affiliateAccounts, setAffiliateAccounts] = useState<AffiliateAccount[]>([]);

    useEffect(() => {
        (async () => {
            if (!owner || !candyMachine) {
                setProject(null);
                setProjectLoading(false);
                return;
            }

            const ownerPubkey = new PublicKey(owner as string);
            const candyMachinePubkey = new PublicKey(candyMachine as string);

            try {
                const projectAccount = await getProjectAccount(
                    ownerPubkey,
                    candyMachinePubkey,
                    connection
                );

                if (!projectAccount) {
                    return;
                }

                const projectData = await getProjectData(
                    ownerPubkey,
                    candyMachinePubkey,
                );
                const project = new Project(projectAccount, projectData);

                if (includeAffiliateAccounts) {
                    const affiliateAccounts = await getAffiliateAccounts(
                        connection,
                        {
                            owner: ownerPubkey,
                            candyMachineId: candyMachinePubkey,
                            // TODO: Implement pagination when list becomes too long
                            perPage: -1
                        }
                    );

                    affiliateAccounts.items.forEach(affiliateAccount => affiliateAccount.setAssociatedProject(project));
                    setAffiliateAccounts(affiliateAccounts.items);
                }

                setProject(project);
                setProjectLoading(false);
            } catch (e) {
                if (e instanceof Error) {
                    setMessage(e.message, PopupMessageTypes.Error);
                } else {
                    console.log(e);
                }
            }
        })();
    }, [owner, candyMachine]);

    return {
        projectLoading,
        project,
        affiliateAccounts,
    };
}
