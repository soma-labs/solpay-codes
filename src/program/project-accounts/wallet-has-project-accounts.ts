import {Connection, PublicKey} from "@solana/web3.js";
import {CmaProgramId} from "../constants";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {ProjectAccountDiscriminator} from "./project-account";
import {WalletAdapter} from "@solana/wallet-adapter-base";

const walletHasProjectAccounts = async (
    wallet: WalletAdapter,
    connection: Connection,
): Promise<boolean> => {
    let filters = [
        {
            memcmp: {
                offset: 4,
                bytes: bs58.encode(Buffer.from(ProjectAccountDiscriminator))
            }
        }
    ];

    if (!wallet.publicKey) {
        return false;
    }

    filters.push({
        memcmp: {
            offset: 4 + Buffer.from(ProjectAccountDiscriminator).length
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

export default walletHasProjectAccounts;
