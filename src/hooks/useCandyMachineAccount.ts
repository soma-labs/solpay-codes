import {CandyMachineAccount, getCandyMachineAccount} from "../candy-machine/candy-machine";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../providers/auth-provider";
import {PublicKey} from "@solana/web3.js";

export default function useCandyMachineAccount(candyMachineId: string | null): CandyMachineAccount | null {
    const [candyMachineAccount, setCandyMachineAccount] = useState<CandyMachineAccount | null>(null);
    const {wallet, connection} = useContext(AuthContext);

    useEffect(() => {
        (async () => {
            if (!candyMachineId) {
                return;
            }

            let publicKey = null;

            if (!wallet.publicKey) {
                publicKey = new PublicKey(process.env.NEXT_PUBLIC_SOLPAY_ADMIN as string);
            } else {
                publicKey = wallet.publicKey;
            }

            const candyMachineAccount = await getCandyMachineAccount(connection, publicKey, candyMachineId);

            if (!candyMachineAccount || !candyMachineAccount.state.whitelistMintSettings) {
                return;
            }

            setCandyMachineAccount(candyMachineAccount);
        })();
    }, [wallet.publicKey, candyMachineId, connection]);

    return candyMachineAccount;
}
