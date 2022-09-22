import {NextApiRequest, NextApiResponse} from "next";
import {PublicKey} from "@solana/web3.js";
import getProjectAccount from "../program/project-accounts/get-project-account";
import getProjectData from "../models/project/get-project-data";
import Project from "../models/project/project";
import * as Web3 from "@solana/web3.js";

const candyMachineDetailsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const connection = new Web3.Connection(
        process.env.NEXT_PUBLIC_CLUSTER_URL ? process.env.NEXT_PUBLIC_CLUSTER_URL : Web3.clusterApiUrl('devnet'),
        'confirmed'
    );
    const { owner, candyMachine } = req.query;
    const ownerPubkey = new PublicKey(owner as string);
    const candyMachinePubkey = new PublicKey(candyMachine as string);

    const projectAccount = await getProjectAccount(
        ownerPubkey,
        candyMachinePubkey,
        connection
    );

    if (!projectAccount) {
        res.status(404).end();

        return;
    }

    const projectData = await getProjectData(
        ownerPubkey,
        candyMachinePubkey,
    );

    const project = new Project(projectAccount, projectData);

    res.status(200).json({
        label: project.projectData?.title,
        icon: project.projectData?.image_url
    });
};

export default candyMachineDetailsHandler;
