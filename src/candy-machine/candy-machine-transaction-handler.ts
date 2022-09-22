import {NextApiRequest, NextApiResponse} from "next";
import {PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import getProjectAccount from "../program/project-accounts/get-project-account";
import getProjectData from "../models/project/get-project-data";
import Project from "../models/project/project";
import * as Web3 from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import {getCandyMachineAccount, mintOneToken} from "./candy-machine";
import getAffiliateAccountAddress from "../program/affiliate-accounts/get-affiliate-account-address";

const SOLPAY_TREASURY = process.env.NEXT_PUBLIC_SOLPAY_TREASURY as string;
const SOLPAY_FEE_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_SOLPAY_FEE_PERCENTAGE as string);
const SOLPAY_FEE_AFFILIATE_LINK_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_SOLPAY_FEE_AFFILIATE_LINK_PERCENTAGE as string);

const candyMachineTransactionHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const connection = new Web3.Connection(
        process.env.NEXT_PUBLIC_CLUSTER_URL ? process.env.NEXT_PUBLIC_CLUSTER_URL : Web3.clusterApiUrl('devnet'),
        'confirmed'
    );
    const { owner, candyMachine, affiliate } = req.query;
    const ownerPubkey = new PublicKey(owner as string);
    const candyMachinePubkey = new PublicKey(candyMachine as string);
    const walletPublicKey = new anchor.web3.PublicKey(req.body.account);
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
    const candyMachineAccount = await getCandyMachineAccount(
        connection,
        walletPublicKey,
        candyMachine as string
    );

    if (candyMachineAccount === null) {
        res.status(400).end();

        return;
    }

    const [instructions, signers, nftPrice] = await mintOneToken(
        candyMachineAccount,
        walletPublicKey,
    );

    let solpayFeePercentage = SOLPAY_FEE_PERCENTAGE;

    if (affiliate) {
        const affiliateAccountAddress = await getAffiliateAccountAddress(
            new PublicKey(affiliate),
            ownerPubkey,
            candyMachinePubkey,
            connection
        );

        if (affiliateAccountAddress !== null) {
            solpayFeePercentage = SOLPAY_FEE_AFFILIATE_LINK_PERCENTAGE;

            const affiliateWalletFeeInstruction = SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: affiliateAccountAddress,
                lamports: project.projectAccount.data.affiliate_fee_percentage * parseInt(nftPrice.toString()) / 100,
            });

            instructions.unshift(affiliateWalletFeeInstruction);
        }
    }

    const solpayFeeInstruction = SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: new PublicKey(SOLPAY_TREASURY),
        lamports: solpayFeePercentage * parseInt(nftPrice.toString()) / 100,
    });

    instructions.unshift(solpayFeeInstruction);

    const transaction = new Transaction({feePayer: walletPublicKey});

    transaction.recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash;
    transaction.add(...instructions);
    transaction.sign(...signers);

    res.status(200).json({
        transaction: transaction.serialize({
            verifySignatures: false,
            requireAllSignatures: false,
        }).toString('base64'),
    });
};

export default candyMachineTransactionHandler;
