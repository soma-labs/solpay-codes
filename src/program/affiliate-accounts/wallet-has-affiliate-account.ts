import {Connection, PublicKey} from "@solana/web3.js";
import {AffiliateAccountDiscriminator} from "./affiliate-account";
import {CmaProgramId} from "../constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {WalletAdapter} from "@solana/wallet-adapter-base";

const walletHasAffiliateAccounts = async (
    wallet: WalletAdapter,
    connection: Connection
): Promise<boolean> => {
    let filters = [
        {
            memcmp: {
                offset: 4,
                bytes: bs58.encode(Buffer.from(AffiliateAccountDiscriminator))
            }
        }
    ];

    if (!wallet.publicKey) {
        return false;
    }

    filters.push({
        memcmp: {
            offset: 4 + Buffer.from(AffiliateAccountDiscriminator).length
                + 1
                + 1,
            bytes: bs58.encode(wallet.publicKey.toBuffer())
        }
    });

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

    return accountsWithoutData.length !== 0;
};

export default walletHasAffiliateAccounts;
