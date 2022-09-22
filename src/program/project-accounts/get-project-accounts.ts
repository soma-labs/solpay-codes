import {AccountInfo, Connection, PublicKey} from "@solana/web3.js";
import {CmaProgramId} from "../constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import ProjectAccount, {ProjectAccountDiscriminator} from "./project-account";

const getProjectAccounts = async (
    connection: Connection,
    options?: {
        owner?: PublicKey
    }
): Promise<ProjectAccount[]> => {
    let filters = [
        {
            memcmp: {
                offset: 4,
                bytes: bs58.encode(Buffer.from(ProjectAccountDiscriminator))
            }
        }
    ];

    if (options?.owner) {
        filters.push({
            memcmp: {
                offset: 4 + Buffer.from(ProjectAccountDiscriminator).length
                    + 1
                    + 1,
                bytes: bs58.encode(options.owner.toBuffer())
            }
        });
    }

    const accountsWithoutData = await connection.getProgramAccounts(
        new PublicKey(CmaProgramId),
        {
            dataSlice: {
                offset: 0,
                length: 0,
            },
            filters: filters
        }
    );

    const accountKeys = accountsWithoutData.map(account => account.pubkey);
    // TODO: implement pagination
    const accounts = await connection.getMultipleAccountsInfo(accountKeys.slice(0, 100));

    return ((accounts
        .filter(account => account !== null) as AccountInfo<Buffer>[])
        .map(account => ProjectAccount.deserialize(account?.data))
        .filter(projectAccount => projectAccount !== null) as ProjectAccount[]);
};

export default getProjectAccounts;
