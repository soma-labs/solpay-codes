import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip} from "@mui/material";
import AffiliateAccount from "../../program/affiliate-accounts/affiliate-account";
import AffiliateAccountRow from "./affiliate-account-row";
import InfoIcon from '@mui/icons-material/Info';

export type AffiliateAccountsTablePropsType = {
    affiliateAccounts: AffiliateAccount[],
    actions: any[],
};

export default function AffiliateAccountsTable({affiliateAccounts,  actions}: AffiliateAccountsTablePropsType) {
    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{width: '13rem'}}>Project</TableCell>
                        <TableCell>NFT Mints</TableCell>
                        <TableCell>Your Earnings</TableCell>
                        <TableCell>Unclaimed Earnings</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        affiliateAccounts.map(
                            (affiliateAccount, index) =>
                                <AffiliateAccountRow
                                    key={index}
                                    affiliateAccount={affiliateAccount}
                                    actions={actions}
                                />
                        )
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
}
