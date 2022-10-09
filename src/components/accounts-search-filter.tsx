import {useEffect, useRef} from "react";
import {useRouter} from "next/router";

export default function AccountsSearchFilter({label, defaultSearch}: {label: string, defaultSearch?: string}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const onSearch = async (e: any) => {
        e.preventDefault();

        if (inputRef.current?.value.trim() === '') {
            delete router.query.search;
        } else {
            router.query.search = inputRef.current?.value;
        }

        await router.push({
            pathname: router.pathname,
            query: router.query
        }, undefined, {shallow: true});
    };
    const clearInput = () => inputRef.current && (inputRef.current.value = '');

    useEffect(() => {
        if (!defaultSearch) {
            clearInput();
        }
    }, [defaultSearch]);

    return (
        <form onSubmit={onSearch} className="form d-flex align-items-center">
            <input
                ref={inputRef}
                type="text"
                name="accounts_filter_search"
                className="accounts-filter-input form-control me-2"
                placeholder={label}
                defaultValue={defaultSearch}
            />
            <button className="button button--hollow">Search</button>
            <button className="button button--hollow ms-2" onClick={clearInput.bind(null)} title="Clear search">&times;</button>
        </form>
    );
}
