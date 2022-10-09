import {Connection, PublicKey} from "@solana/web3.js";
import {CmaProgramId} from "../constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {ProjectAccountDiscriminator} from "./project-account";

const getProjectAccountAddress = async (
    owner: PublicKey,
    candyMachineId: PublicKey,
    connection: Connection
): Promise<PublicKey|null> => {
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

    if (accountsWithoutData.length !== 1) {
        return null;
    }

    return accountsWithoutData[0].pubkey;
};

export default getProjectAccountAddress;
