import {PublicKey} from "@solana/web3.js";

type ProjectDataPropsType = {
    owner: string,
    candy_machine_id: string,
    title: string,
    description?: string,
    url?: string,
    discord_url?: string,
    twitter_url?: string,
    image_url?: string
};

export default class ProjectData {
    project_owner_pubkey: PublicKey;
    candy_machine_id: PublicKey;
    title: string;
    description?: string;
    url?: string;
    discord_url?: string;
    twitter_url?: string;
    image_url?: string;

    constructor(data: ProjectDataPropsType) {
        this.project_owner_pubkey = new PublicKey(data.owner);
        this.candy_machine_id = new PublicKey(data.candy_machine_id);
        this.title = data.title;
        this.description = data.description;
        this.url = data.url;
        this.discord_url = data.discord_url;
        this.twitter_url = data.twitter_url;
        this.image_url = data.image_url;
    }
}
