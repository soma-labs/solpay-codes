import {NextApiRequest, NextApiResponse} from "next";
import {Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import getProjectAccount from "../program/project-accounts/get-project-account";
import getProjectData from "../models/project/get-project-data";
import Project from "../models/project/project";
import * as Web3 from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import {getCandyMachineAccount, mintOneToken} from "./candy-machine";
import getAffiliateAccountAddress from "../program/affiliate-accounts/get-affiliate-account-address";
import {
    createAssociatedTokenAccountInstruction,
    createMintToCheckedInstruction,
    createMintToInstruction,
    getAccount,
    getAssociatedTokenAddress, TokenAccountNotFoundError
} from "@solana/spl-token";

const SOLPAY_TREASURY = process.env.NEXT_PUBLIC_SOLPAY_TREASURY as string;
const SOLPAY_FEE_NORMAL_MINT_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_SOLPAY_FEE_NORMAL_MINT_PERCENTAGE as string);
const SOLPAY_FEE_AFFILIATE_MINT_PERCENTAGE = parseFloat(process.env.NEXT_PUBLIC_SOLPAY_FEE_AFFILIATE_MINT_PERCENTAGE as string);
const WHITELIST_TOKEN_MINT = new PublicKey(process.env.WHITELIST_TOKEN_MINT as string);
const WHITELIST_AUTHORITY_KEYPAIR = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.WHITELIST_TOKEN_MINT_AUTHORITY as string))
);

const candyMachineTransactionHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    const {owner, candyMachine, affiliate} = req.query;

    if (!owner || !candyMachine || !req.body.account) {
        res.status(400).end();

        return;
    }

    const connection = new Web3.Connection(
        process.env.NEXT_PUBLIC_CLUSTER_URL ? process.env.NEXT_PUBLIC_CLUSTER_URL : Web3.clusterApiUrl('devnet'),
        'confirmed'
    );
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

    let [instructions, signers, nftPrice] = await mintOneToken(
        candyMachineAccount,
        walletPublicKey,
    );

    let solpayFee = SOLPAY_FEE_NORMAL_MINT_PERCENTAGE * parseInt(nftPrice.toString()) / 100;

    if (affiliate
        && candyMachineAccount.state.whitelistMintSettings !== null
        && candyMachineAccount.state.whitelistMintSettings.discountPrice !== null
    ) {
        const affiliatePubkey = new PublicKey(affiliate);
        const affiliateAccountAddress = await getAffiliateAccountAddress(
            affiliatePubkey,
            ownerPubkey,
            candyMachinePubkey,
            connection
        );

        if (affiliateAccountAddress !== null) {
            const whitelistNftPrice = candyMachineAccount.state.whitelistMintSettings.discountPrice.toNumber();
            solpayFee = SOLPAY_FEE_AFFILIATE_MINT_PERCENTAGE * whitelistNftPrice / 100;

            let walletWhitelistTokenAccountInitialized = false;
            let walletWhitelistAta = await getAssociatedTokenAddress(
                WHITELIST_TOKEN_MINT,
                walletPublicKey,
            );

            try {
                await getAccount(connection, walletWhitelistAta);
                walletWhitelistTokenAccountInitialized = true;
            } catch (e) {
                if (e instanceof TokenAccountNotFoundError) {
                    console.log(e.message);
                }
            }

            const whitelistTokenTransferInstruction = await createMintToInstruction(
                WHITELIST_TOKEN_MINT, // mint
                walletWhitelistAta, // receiver (should be a token account)
                WHITELIST_AUTHORITY_KEYPAIR.publicKey, // mint authority
                1, // amount. if your decimals is 8, you mint 10^8 for 1 token.
                //9 // decimals
            );

            instructions.unshift(whitelistTokenTransferInstruction);

            if (!walletWhitelistTokenAccountInitialized) {
                const createWhitelistAtaInstruction = createAssociatedTokenAccountInstruction(
                    walletPublicKey, // payer
                    walletWhitelistAta, // ata
                    walletPublicKey, // owner
                    WHITELIST_TOKEN_MINT // mint
                );

                instructions.unshift(createWhitelistAtaInstruction);
            }

            const affiliateWalletFeeInstruction = SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: affiliateAccountAddress,
                lamports: project.projectAccount.data.affiliate_fee_percentage * whitelistNftPrice / 100,
            });

            instructions.unshift(affiliateWalletFeeInstruction);

            signers = [WHITELIST_AUTHORITY_KEYPAIR, ...signers];
        }
    }

    if (solpayFee !== 0) {
        const solpayFeeInstruction = SystemProgram.transfer({
            fromPubkey: walletPublicKey,
            toPubkey: new PublicKey(SOLPAY_TREASURY),
            lamports: solpayFee,
        });

        instructions.unshift(solpayFeeInstruction);
    }

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
