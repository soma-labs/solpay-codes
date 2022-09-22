import {AccountInfo, Connection, PublicKey} from "@solana/web3.js";
import {CmaProgramId} from "../constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import ProjectAccount, {ProjectAccountDiscriminator} from "./project-account";

const getProjectAccount = async (
    owner: PublicKey,
    candyMachineId: PublicKey,
    connection: Connection
): Promise<ProjectAccount|null> => {
    const accountsWithoutData = await connection.getProgramAccounts(
        new PublicKey(CmaProgramId),
        {
            dataSlice: {
                offset: 0,
                length: 0,
            },
            filters: [
                {
                    memcmp: {
                        offset: 4,
                        bytes: bs58.encode(Buffer.from(ProjectAccountDiscriminator))
                    }
                },
                {
                    memcmp: {
                        offset: 4 + Buffer.from(ProjectAccountDiscriminator).length
                            + 1
                            + 1,
                        bytes: bs58.encode(owner.toBuffer())
                    }
                },
                {
                    memcmp: {
                        offset: 4 + Buffer.from(ProjectAccountDiscriminator).length
                            + 1
                            + 1
                            + 32,
                        bytes: bs58.encode(candyMachineId.toBuffer())
                    }
                }
            ]
        }
    );

    const accountKeys = accountsWithoutData.map(account => account.pubkey);
    const accounts = await connection.getMultipleAccountsInfo(accountKeys.slice(0, 1));

    const account = ((accounts
        .filter(account => account !== null) as AccountInfo<Buffer>[])
        .map(account => ProjectAccount.deserialize(account?.data))
        .filter(movie => movie !== null) as ProjectAccount[]).pop();

    return account ?? null;
};

export default getProjectAccount;
