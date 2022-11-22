import {NextApiRequest, NextApiResponse} from "next";
import {Buffer} from "buffer";
import ProjectAccount, {ProjectAccountDiscriminator} from "../../src/program/project-accounts/project-account";
import {AffiliateAccountDiscriminator} from "../../src/program/affiliate-accounts/affiliate-account";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import * as Web3 from "@solana/web3.js";
import {CmaProgramId} from "../../src/program/constants";
import {CandyMachine} from "@metaplex-foundation/mpl-candy-machine";
import {bs58} from "@project-serum/anchor/dist/cjs/utils/bytes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const connection = new Web3.Connection(
        process.env.NEXT_PUBLIC_CLUSTER_URL ? process.env.NEXT_PUBLIC_CLUSTER_URL : Web3.clusterApiUrl('devnet'),
        'confirmed'
    );

    const projectAccounts = await connection.getProgramAccounts(
        new PublicKey(CmaProgramId),
        {
            filters: [{
                memcmp: {
                    offset: 4,
                    bytes: bs58.encode(Buffer.from(ProjectAccountDiscriminator))
                }
            }]
        }
    );

    const affiliateAccounts = await connection.getProgramAccounts(
        new PublicKey(CmaProgramId),
        {
            filters: [{
                memcmp: {
                    offset: 4,
                    bytes: bs58.encode(Buffer.from(AffiliateAccountDiscriminator))
                }
            }]
        }
    );

    let affiliateFeesTotal: number = 0;

    const projectAccountsInfo = await connection.getMultipleAccountsInfo(projectAccounts.map(projectAccount => projectAccount.pubkey));
    const cmaProjectAccounts = projectAccountsInfo
        .filter(projectAccountInfo => projectAccountInfo !== null)
        .map(projectAccountInfo => ProjectAccount.deserialize(projectAccountInfo!.data));
    const candyMachinePubkeys = cmaProjectAccounts.map(cmaProjectAccount => cmaProjectAccount!.data.candy_machine_id);
    const candyMachineAccountInfos = await connection.getMultipleAccountsInfo(candyMachinePubkeys);

    for (let index = candyMachineAccountInfos.length - 1; index >= 0; index --) {
        const candyMachineAccountInfo = candyMachineAccountInfos[index];

        if (!candyMachineAccountInfo) {
            continue;
        }

        const [candyMachineAccount] = CandyMachine.fromAccountInfo(candyMachineAccountInfo);
        const itemsRemaining = (candyMachineAccount.data.itemsAvailable as number) - (candyMachineAccount.itemsRedeemed as number);

        if (!candyMachineAccount || itemsRemaining === 0) {
            continue;
        }

        affiliateFeesTotal += itemsRemaining
            * ((candyMachineAccount.data.whitelistMintSettings!.discountPrice!.valueOf().valueOf() as number) / LAMPORTS_PER_SOL)
            * cmaProjectAccounts[index]!.data.affiliate_fee_percentage / 100;
    }

    return res
        .setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=900')
        .json({
            projectAccounts: projectAccounts.length,
            affiliateAccounts: affiliateAccounts.length,
            solInAffiliateFeesAvailable: affiliateFeesTotal,
        });
}
