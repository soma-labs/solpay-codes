import {PublicKey} from "@solana/web3.js";

export const CmaProgramId = new PublicKey(process.env.NEXT_PUBLIC_CMA_PROGRAM_ID as string);

export enum CmaProgramInstructions {
    RegisterProjectAccount = 0,
    UpdateProjectAccount = 1,
    CloseProjectAccount = 2,
    RegisterAffiliateAccount = 3,
    RedeemReward = 4,
    CloseAffiliateAccount = 5,
    IncrementAffiliateAccountMintCount = 6,
}

export const SolTokenIcon = '◎';

export const SolPayTreasuryAccount = new PublicKey(process.env.NEXT_PUBLIC_SOLPAY_TREASURY as string);
