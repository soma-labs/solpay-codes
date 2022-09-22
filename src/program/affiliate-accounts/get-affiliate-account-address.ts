import {Connection, PublicKey} from "@solana/web3.js";
import {AffiliateAccountDiscriminator} from "./affiliate-account";
import {CmaProgramId} from "../constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

const getAffiliateAccountAddress = async (
    affiliate: PublicKey,
    owner: PublicKey,
    candyMachineId: PublicKey,
    connection: Connection,
): Promise<PublicKey | null> => {
    let filters = [
        {
            memcmp: {
                offset: 4,
                bytes: bs58.encode(Buffer.from(AffiliateAccountDiscriminator))
            }
        },
        {
            memcmp: {
                offset: 4 + Buffer.from(AffiliateAccountDiscriminator).length
                    + 1
                    + 1,
                bytes: bs58.encode(affiliate.toBuffer())
            }
        },
        {
            memcmp: {
                offset: 4 + Buffer.from(AffiliateAccountDiscriminator).length
                    + 1
                    + 1
                    + 32,
                bytes: bs58.encode(owner.toBuffer())
            }
        },
        {
            memcmp: {
                offset: 4 + Buffer.from(AffiliateAccountDiscriminator).length
                    + 1
                    + 1
                    + 32
                    + 32,
                bytes: bs58.encode(candyMachineId.toBuffer())
            }
        }
    ];

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

    if (accountsWithoutData.length !== 1) {
        return null;
    }

    return accountsWithoutData[0].pubkey;
};

export default getAffiliateAccountAddress;
