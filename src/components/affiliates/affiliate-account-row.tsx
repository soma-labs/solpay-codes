import AffiliateAccount from "../../program/affiliate-accounts/affiliate-account";
import Link from "next/link";
import Image from "next/image";
import {useEffect, useState} from "react";
import {Box, CircularProgress, TableCell, TableRow, Link as MuiLink, Typography, Tooltip} from "@mui/material";
import useCandyMachineAccount from "../../hooks/useCandyMachineAccount";
import {SolTokenIcon} from "../../program/constants";
import InfoIcon from "@mui/icons-material/Info";

export type AffiliateAccountRowPropsType = {
    affiliateAccount: AffiliateAccount,
    actions: any[]
};

export default function AffiliateAccountRow({affiliateAccount, actions}: AffiliateAccountRowPropsType) {
    //const [allTimeMintCount, setAllTimeMintCount] = useState<null|number>(null);
    const [mintCount, setMintCount] = useState<null|number>(null);
    //const [mintsToTarget, setMintsToTarget] = useState<null|number>(null);
    const candyMachineAccount = useCandyMachineAccount(affiliateAccount.data.candy_machine_id.toString());

    useEffect(() => {
        (async () => {
            if (!candyMachineAccount || !candyMachineAccount.state.whitelistMintSettings) {
                return;
            }

            setMintCount(affiliateAccount.mintCount(candyMachineAccount.state.whitelistMintSettings.discountPrice));
            //setAllTimeMintCount(affiliateAccount.mintCount(candyMachineAccount.state.whitelistMintSettings.discountPrice, true));
            //setMintsToTarget(affiliateAccount.mintsToTarget(candyMachineAccount.state.whitelistMintSettings.discountPrice));
        })();
    }, [candyMachineAccount]);

    return (
        <TableRow hover>
            <TableCell>
                <Link key={0} href={affiliateAccount.getProjectLink()}>
                    <a target="_blank">
                        <Box component="span" display="flex" alignItems="center">
                            <Box sx={{width: 50, height: 50, position: 'relative', flex: '0 0 auto'}}>
                                <Image src={affiliateAccount.project?.projectData?.image_url as string} className="affiliate-accounts-table__image" alt="NFT project image" layout="fill"/>
                            </Box>
                            <Typography sx={{ml: 1}}>
                                <MuiLink component="span">
                                    {affiliateAccount.project?.projectAccount.data.title ?? affiliateAccount.data.candy_machine_id.toString()}
                                </MuiLink>
                            </Typography>
                        </Box>
                    </a>
                </Link>
            </TableCell>
            <TableCell>
                {mintCount !== null ?
                    <Typography>{mintCount}</Typography>
                    :
                    <CircularProgress size="1rem"/>
                }
            </TableCell>
            <TableCell>
                <Typography>
                    {affiliateAccount.data.total_redeemed_amount_in_sol} {SolTokenIcon}
                </Typography>
            </TableCell>
            <TableCell>
                <Box display="flex">
                    <Typography>
                        {affiliateAccount.getBalance().toFixed(2)} / {affiliateAccount.project?.projectAccount.data.affiliate_target_in_sol} {SolTokenIcon}
                    </Typography>
                    <Tooltip title={`You need to collect a minimum of
                        ${affiliateAccount.project?.projectAccount.data.affiliate_target_in_sol}
                        SOL to withdraw your earnings.
                        ${affiliateAccount.getSolToTarget() < affiliateAccount.project!.projectAccount.data.affiliate_target_in_sol ? `Good job, ` : ``}
                        ${affiliateAccount.getSolToTarget().toFixed(2)} SOL to go.
                    `}>
                        <InfoIcon fontSize="small" color="disabled" sx={{ml: 1}}/>
                    </Tooltip>
                </Box>
            </TableCell>
            <TableCell align="right">
                {actions.map((action: any, index: number) => <Box component="span" ml={1} key={index}>{action.call(null, affiliateAccount)}</Box>)}
            </TableCell>
        </TableRow>
    );
}
