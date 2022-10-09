import Image from "next/image";

type ProjectCardPropsType = {
    title?: string,
    description?: string,
    imageUrl?: string,
    actions: any[],
};

export default function ProjectCard(props: ProjectCardPropsType) {
    return (
        <article className="nft-project nft-project--loop d-flex flex-column justify-content-between">
            <header className="nft-project__header mb-3">
                {props.imageUrl &&
                    <div className="nft-project__image-container d-flex justify-content-center align-items-center mb-3">
                        <Image src={props.imageUrl} className="nft-project__image" alt="NFT project image" layout="fill"/>
                    </div>
                }
                {props.title &&
                    <h3 className="nft-project__title text-center">
                        {props.title}
                    </h3>
                }
                {props.description &&
                    <div className="nft-project__description">
                        {props.description}
                    </div>
                }
            </header>
            {props.actions.length &&
                <div className="nft-project__actions d-flex justify-content-between">
                    {props.actions}
                </div>
            }
        </article>
    );
}
