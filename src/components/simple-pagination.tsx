import {PaginationType} from "../program/utils/pagination";
import Link from "next/link";

export default function SimplePagination({pagination, classVariation}: {pagination: PaginationType, classVariation?: string}) {
    const getPaginationLink = (page: number | null, text: string, classVariation?: string) => {
        if (!page) {
            return null;
        }

        let queryParams = new URLSearchParams(window.location.search);
        queryParams.set('page', page.toString());

        return (
            <Link href={`${window.location.pathname}?${queryParams.toString()}`}>
                <a className={`pagination__link ${classVariation ? `pagination__link--${classVariation}` : ''} link`}>
                    {text}
                </a>
            </Link>
        );
    };

    return (
        <>
            {pagination.pageCount && pagination.pageCount <= 1 ? null :
                <div className={`pagination ${classVariation ? `pagination--${classVariation}` : ''} d-flex justify-content-center`}>
                    {getPaginationLink(pagination.prevPage, `Prev`, 'prev-page')}
                    <span className="mx-2">{pagination.currentPage}</span>
                    {getPaginationLink(pagination.nextPage, `Next`, 'next-page')}
                </div>
            }
        </>
    );
}
