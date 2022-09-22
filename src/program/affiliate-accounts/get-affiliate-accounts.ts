import {AccountInfo, Connection, PublicKey} from "@solana/web3.js";
import AffiliateAccount, {AffiliateAccountDiscriminator} from "./affiliate-account";
import {CmaProgramId} from "../constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

const getAffiliateAccounts = async (
    connection: Connection,
    options?: {
        affiliate?: PublicKey,
        owner?: PublicKey,
        candyMachineId?: PublicKey,
    }
): Promise<AffiliateAccount[]> => {
    let filters = [
        {
            memcmp: {
                offset: 4,
                bytes: bs58.encode(Buffer.from(AffiliateAccountDiscriminator))
            }
        }
    ];

    if (options?.affiliate) {
        filters.push({
            memcmp: {
                offset: 4 + Buffer.from(AffiliateAccountDiscriminator).length
                    + 1
                    + 1,
                bytes: bs58.encode(options.affiliate.toBuffer())
            }
        });
    }

    if (options?.owner) {
        filters.push({
            memcmp: {
                offset: 4 + Buffer.from(AffiliateAccountDiscriminator).length
                    + 1
                    + 1
                    + 32,
                bytes: bs58.encode(options.owner.toBuffer())
            }
        });
    }

    if (options?.candyMachineId) {
        filters.push({
            memcmp: {
                offset: 4 + Buffer.from(AffiliateAccountDiscriminator).length
                    + 1
                    + 1
                    + 32
                    + 32,
                bytes: bs58.encode(options.candyMachineId.toBuffer())
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
        .map(account => AffiliateAccount.deserialize(account))
        .filter(affiliateAccount => affiliateAccount !== null) as AffiliateAccount[]);
};

export default getAffiliateAccounts;
