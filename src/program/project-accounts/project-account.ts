import * as borsh from '@project-serum/borsh';
import {Buffer} from "buffer";
import {PublicKey} from "@solana/web3.js";
import BN from "bn.js";

export const ProjectAccountDiscriminator = 'project_account';
export const ProjectTitleMaxLength = 50;

export type ProjectAccountPropsType = {
    discriminator: string;
    is_initialized: boolean;
    data_version: number;
    data: ProjectAccountDataType;
}

export type ProjectAccountDataType = {
    project_owner_pubkey: PublicKey,
    candy_machine_id: PublicKey,
    affiliate_fee_percentage: number,
    affiliate_target_in_sol: number,
    max_affiliate_count: number,
    affiliate_count: number,
    title: string,
    created_at: BN,
    updated_at: BN,
}

export default class ProjectAccount {
    discriminator: string;
    is_initialized: boolean;
    data_version: number;
    data: ProjectAccountDataType;

    static borshAccountSchema = borsh.struct([
        borsh.str('discriminator'),
        borsh.bool('is_initialized'),
        borsh.u8('data_version'),
        borsh.struct([
            borsh.publicKey('project_owner_pubkey'),
            borsh.publicKey('candy_machine_id'),
            borsh.f64('affiliate_fee_percentage'),
            borsh.u8('affiliate_target_in_sol'),
            borsh.u8('max_affiliate_count'),
            borsh.u8('affiliate_count'),
            borsh.str('title'),
            borsh.i64('created_at'),
            borsh.i64('updated_at'),
        ], 'data')
    ]);

    constructor({discriminator, is_initialized, data_version, data}: ProjectAccountPropsType) {
        this.discriminator = discriminator;
        this.is_initialized = is_initialized;
        this.data_version = data_version;
        this.data = data;
    }

    static deserialize(buffer?: Buffer): ProjectAccount | null {
        if (!buffer) {
            return null;
        }

        try {
            const {discriminator, is_initialized, data_version, data} = ProjectAccount.borshAccountSchema.decode(buffer);

            return new ProjectAccount({discriminator, is_initialized, data_version, data});
        } catch (e) {
            console.log(`Deserialization error`, e);

            return null;
        }
    }

    createdAt(): string {
        return (new Date(this.data.created_at.muln(1000).toNumber())).toISOString().split('T')[0];
    }

    updatedAt(): string {
        return (new Date(this.data.updated_at.muln(1000).toNumber())).toISOString().split('T')[0];
    }
}
