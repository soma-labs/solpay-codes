import {CandyMachineAccount, getCandyMachineAccount} from "../candy-machine/candy-machine";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../providers/auth-provider";

export default function useCandyMachineAccount(candyMachineId: string | null): CandyMachineAccount | null {
    const [candyMachineAccount, setCandyMachineAccount] = useState<CandyMachineAccount | null>(null);
    const {wallet, connection} = useContext(AuthContext);

    useEffect(() => {
        (async () => {
            if (!wallet.publicKey || !candyMachineId) {
                return;
            }

            const candyMachineAccount = await getCandyMachineAccount(connection, wallet.publicKey, candyMachineId);

            if (!candyMachineAccount || !candyMachineAccount.state.whitelistMintSettings) {
                return;
            }

            setCandyMachineAccount(candyMachineAccount);
        })();
    }, [wallet.publicKey, candyMachineId, connection]);

    return candyMachineAccount;
}
