import AffiliateAccount from "../../program/affiliate-accounts/affiliate-account";
import Link from "next/link";
import Image from "next/image";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../providers/auth-provider";
import {getCandyMachineAccount} from "../../candy-machine/candy-machine";
import {Box, CircularProgress, TableCell, TableRow, Link as MuiLink, Typography} from "@mui/material";

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
        <TableRow hover>
            <TableCell>
                <Link key={0} href={`/projects/${affiliateAccount.data.project_owner_pubkey.toString()}/${affiliateAccount.data.candy_machine_id.toString()}`}>
                    <a target="_blank">
                        <Box sx={{width: 50, height: 50, position: 'relative'}}>
                            <Image src={affiliateAccount.project?.projectData?.image_url as string} className="affiliate-accounts-table__image" alt="NFT project image" layout="fill"/>
                        </Box>
                    </a>
                </Link>
            </TableCell>
            <TableCell>
                <Link key={0} href={`/projects/${affiliateAccount.data.project_owner_pubkey.toString()}/${affiliateAccount.data.candy_machine_id.toString()}`}>
                    <a target="_blank">
                        <Typography>
                            <MuiLink component="span">
                                {affiliateAccount.project?.projectAccount.data.title ?? affiliateAccount.data.candy_machine_id.toString()}
                            </MuiLink>
                        </Typography>
                    </a>
                </Link>
            </TableCell>
            <TableCell>
                {mintCount ? <Typography>{mintCount}</Typography> : <CircularProgress size="1rem"/>}
            </TableCell>
            <TableCell>
                <Typography>
                    {affiliateAccount.targetProgress()}%
                </Typography>
            </TableCell>
            <TableCell align="right">
                {actions.map((action: any, index: number) => <span key={index}>{action.call(null, affiliateAccount)}</span>)}
            </TableCell>
        </TableRow>
    );
}
