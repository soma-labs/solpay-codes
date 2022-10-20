import AffiliateAccount from "../../program/affiliate-accounts/affiliate-account";
import Link from "next/link";
import Image from "next/image";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../providers/auth-provider";
import {getCandyMachineAccount} from "../../candy-machine/candy-machine";

export type AffiliateAccountRowPropsType = {
    rowIndex: number,
    affiliateAccount: AffiliateAccount,
    actions: any[]
};

export default function AffiliateAccountRow({rowIndex, affiliateAccount, actions}: AffiliateAccountRowPropsType) {
    const {wallet, connection} = useContext(AuthContext);
    const [mintCount, setMintCount] = useState<null|number>(null);

    useEffect(() => {
        (async () => {
            const candyMachineAccount = await getCandyMachineAccount(connection, wallet.publicKey!, affiliateAccount.data.candy_machine_id.toString());

            if (!candyMachineAccount) {
                return;
            }

            setMintCount(affiliateAccount.mintCount(candyMachineAccount.state.whitelistMintSettings!.discountPrice));
        })();
    }, []);

    return (
        <tr>
            <td>{rowIndex + 1}</td>
            <td>
                <Link key={0} href={`/projects/${affiliateAccount.data.project_owner_pubkey.toString()}/${affiliateAccount.data.candy_machine_id.toString()}`}>
                    <a>
                        <Image src={affiliateAccount.project?.projectData?.image_url as string} className="affiliate-accounts-table__image" alt="NFT project image" width="50" height="50"/>
                    </a>
                </Link>
            </td>
            <td>
                <Link key={0} href={`/projects/${affiliateAccount.data.project_owner_pubkey.toString()}/${affiliateAccount.data.candy_machine_id.toString()}`}>
                    <a className="link">
                        {affiliateAccount.project?.projectAccount.data.title ?? affiliateAccount.data.candy_machine_id.toString()}
                    </a>
                </Link>
            </td>
            <td>
                {mintCount ?? 'loading...'}
            </td>
            <td>
                {affiliateAccount.targetProgress()}%
            </td>
            <td>
                {actions.map((action: any, index: number) => <span key={index}>{action.call(null, affiliateAccount)}</span>)}
            </td>
        </tr>
    );
}
