import {PublicKey, TransactionInstruction} from "@solana/web3.js";
import * as borsh from "@project-serum/borsh";
import {Buffer} from "buffer";
import {AffiliateAccountDiscriminator} from "./affiliate-account";
import {CmaProgramInstructions, CmaProgramId} from "../constants";

class AffiliateAccountMintCountIncrementData {
    // affiliate_pubkey: PublicKey;
    // project_owner_pubkey: PublicKey;
    // candy_machine_id: PublicKey;
    //
    borshInstructionSchema = borsh.struct([
        borsh.u8('variant'),
        // borsh.publicKey('affiliate_pubkey'),
        // borsh.publicKey('project_owner_pubkey'),
        // borsh.publicKey('candy_machine_id'),
    ]);

    // constructor(affiliate_pubkey: PublicKey, project_owner_pubkey: PublicKey, candy_machine_id: PublicKey) {
    //     this.affiliate_pubkey = affiliate_pubkey;
    //     this.project_owner_pubkey = project_owner_pubkey;
    //     this.candy_machine_id = candy_machine_id;
    // }

    serialize(): Buffer {
        const buffer = Buffer.alloc(1000);

        this.borshInstructionSchema.encode({...this, variant: CmaProgramInstructions.IncrementAffiliateAccountMintCount}, buffer);

        return buffer.slice(0, this.borshInstructionSchema.getSpan(buffer));
    }
}

const getAffiliateMintCountIncrementInstruction = async (
    data: {
        signerPubkey: PublicKey,
        affiliate: PublicKey,
        owner: PublicKey,
        candyMachineId: PublicKey,
    }
): Promise<TransactionInstruction> => {
    const [pda] = await PublicKey.findProgramAddress(
        [
            new Buffer(AffiliateAccountDiscriminator),
            data.affiliate.toBuffer(),
            data.owner.toBuffer(),
            data.candyMachineId.toBuffer()
        ],
        CmaProgramId
    );

    const mintCountIncrementData = new AffiliateAccountMintCountIncrementData(); // data.affiliate, data.owner, data.candyMachineId
    return new TransactionInstruction({
        programId: CmaProgramId,
        keys: [
            {
                pubkey: data.signerPubkey,
                isSigner: true,
                isWritable: false,
            },
            {
                pubkey: pda,
                isSigner: false,
                isWritable: true,
            },
        ],
        data: mintCountIncrementData.serialize()
    });
};

export default getAffiliateMintCountIncrementInstruction;
