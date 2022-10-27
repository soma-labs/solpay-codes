import {LAMPORTS_PER_SOL} from "@solana/web3.js";

const SolpayAffiliateMintFee = parseInt(process.env.NEXT_PUBLIC_SOLPAY_FEE_AFFILIATE_MINT_PERCENTAGE as string);

export default function getDiscountedNftPrice(nftPriceInLamports: number, affiliateFee: number): number {
    const nftPriceInSol =  nftPriceInLamports / LAMPORTS_PER_SOL;

    return (nftPriceInSol
        + SolpayAffiliateMintFee * nftPriceInSol / 100
        + affiliateFee * nftPriceInSol / 100);
}
