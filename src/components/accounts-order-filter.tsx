import {OrderDirType, OrderDirOptions} from "../program/utils/ordering";
import {useRouter} from "next/router";

export default function AccountsOrderFilter({columns, defaultOrderBy, defaultOrderDir}: {columns: any, defaultOrderBy?: string, defaultOrderDir?: string}) {
    const router = useRouter();
    const columnValues = Object.keys(columns);

    if (columnValues.length === 0) {
        return null;
    }

    const getOptionValue = (orderBy: string, orderDir: string) => `${orderBy}-${orderDir}`;
    const updateOrder = async (e: any) => {
        e.preventDefault();

        const [column, orderDir] = e.target.value.split('-');

        router.query.orderBy = column;
        router.query.orderDir = orderDir;

        await router.push({
            pathname: router.pathname,
            query: router.query
        }, undefined, {shallow: true});
    };
    const orderDirValues = Object.keys(OrderDirOptions);

    let defaultOrderValue = getOptionValue(columnValues[0], orderDirValues[1]);

    if (defaultOrderBy && defaultOrderDir) {
        // TODO: Validate values
        defaultOrderValue = getOptionValue(defaultOrderBy, defaultOrderDir);
    }

    return (
        <div className="d-flex align-items-center">
            <label className="accounts-filter__order accounts-filter-label form-label m-0 me-2">
                <strong>Order:</strong>
            </label>
            <select
                name="accounts_filter_order"
                className="accounts-filter-input form-control"
                onChange={updateOrder}
                defaultValue={defaultOrderValue}
            >
                {
                    columnValues.map(
                        (columnKey, columnIndex) => orderDirValues.map(
                            (orderKey, orderIndex) =>
                                <option
                                    key={`${columnIndex}-${orderIndex}`}
                                    value={getOptionValue(columnKey, orderKey)}
                                    dangerouslySetInnerHTML={{__html: `${columns[columnKey]} (${OrderDirOptions[orderKey as OrderDirType]})`}}
                                >

                                </option>
                        )
                    )
                }
            </select>
        </div>
    );
}
