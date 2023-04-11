import { useEffect, useMemo, useState } from "react";

import {
	tableEvents,
	ActionsFormatter,
	GravatarFormatter,
	IDFormatter,
	TableFilter,
	TableLayout,
	TablePagination,
	TableSortBy,
	TextFilter,
	UpstreamStatusFormatter,
} from "components";
import { intl } from "locale";
import { UpstreamEditModal, UpstreamNginxConfigModal } from "modals";
import { FiEdit, FiHardDrive } from "react-icons/fi";
import { useSortBy, useFilters, useTable, usePagination } from "react-table";

export interface TableProps {
	data: any;
	pagination: TablePagination;
	sortBy: TableSortBy[];
	filters: TableFilter[];
	onTableEvent: any;
}
function Table({
	data,
	pagination,
	onTableEvent,
	sortBy,
	filters,
}: TableProps) {
	const [editId, setEditId] = useState(0);
	const [configId, setConfigId] = useState(0);
	const [columns, tableData] = useMemo(() => {
		const columns: any = [
			{
				accessor: "user.gravatarUrl",
				Cell: GravatarFormatter(),
				className: "w-80",
			},
			{
				Header: intl.formatMessage({ id: "column.id" }),
				accessor: "id",
				Cell: IDFormatter(),
				className: "w-80",
			},
			{
				Header: intl.formatMessage({ id: "name" }),
				accessor: "name",
				sortable: true,
				Filter: TextFilter,
			},
			{
				Header: intl.formatMessage({ id: "column.servers" }),
				accessor: "servers.length",
			},
			{
				Header: intl.formatMessage({ id: "column.status" }),
				accessor: "status",
				Cell: UpstreamStatusFormatter(),
				sortable: true,
			},
			{
				id: "actions",
				accessor: "id",
				className: "w-80",
				Cell: ActionsFormatter([
					{
						title: intl.formatMessage({ id: "action.edit" }),
						onClick: (e: any, { id }: any) => setEditId(id),
						icon: <FiEdit />,
					},
					{
						title: intl.formatMessage({ id: "action.nginx-config" }),
						onClick: (e: any, { id }: any) => setConfigId(id),
						icon: <FiHardDrive />,
					},
				]),
			},
		];
		return [columns, data];
	}, [data]);

	const tableInstance = useTable(
		{
			columns,
			data: tableData,
			initialState: {
				pageIndex: Math.floor(pagination.offset / pagination.limit),
				pageSize: pagination.limit,
				sortBy,
				filters,
			},
			// Tell the usePagination
			// hook that we'll handle our own data fetching
			// This means we'll also have to provide our own
			// pageCount.
			pageCount: Math.ceil(pagination.total / pagination.limit),
			manualPagination: true,
			// Sorting options
			manualSortBy: true,
			disableMultiSort: true,
			disableSortRemove: true,
			autoResetSortBy: false,
			// Filter options
			manualFilters: true,
			autoResetFilters: false,
		},
		useFilters,
		useSortBy,
		usePagination,
	);

	const gotoPage = tableInstance.gotoPage;

	useEffect(() => {
		onTableEvent({
			type: tableEvents.PAGE_CHANGED,
			payload: tableInstance.state.pageIndex,
		});
	}, [onTableEvent, tableInstance.state.pageIndex]);

	useEffect(() => {
		onTableEvent({
			type: tableEvents.PAGE_SIZE_CHANGED,
			payload: tableInstance.state.pageSize,
		});
		gotoPage(0);
	}, [gotoPage, onTableEvent, tableInstance.state.pageSize]);

	useEffect(() => {
		if (pagination.total) {
			onTableEvent({
				type: tableEvents.TOTAL_COUNT_CHANGED,
				payload: pagination.total,
			});
		}
	}, [pagination.total, onTableEvent]);

	useEffect(() => {
		onTableEvent({
			type: tableEvents.SORT_CHANGED,
			payload: tableInstance.state.sortBy,
		});
	}, [onTableEvent, tableInstance.state.sortBy]);

	useEffect(() => {
		onTableEvent({
			type: tableEvents.FILTERS_CHANGED,
			payload: tableInstance.state.filters,
		});
	}, [onTableEvent, tableInstance.state.filters]);

	return (
		<>
			<TableLayout pagination={pagination} {...tableInstance} />
			{editId ? (
				<UpstreamEditModal
					isOpen
					editId={editId}
					onClose={() => setEditId(0)}
				/>
			) : null}
			{configId ? (
				<UpstreamNginxConfigModal
					isOpen
					upstreamId={configId}
					onClose={() => setConfigId(0)}
				/>
			) : null}
		</>
	);
}

export default Table;