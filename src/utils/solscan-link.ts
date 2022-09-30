export default function getSolscanLink(signature: string): string {
    return `https://solscan.io/tx/${signature}${process.env.NEXT_PUBLIC_CLUSTER_URL ? `?cluster=custom&customUrl=${process.env.NEXT_PUBLIC_CLUSTER_URL}` : `?cluster=devnet`}`;
}
