import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FlexpriceTable, { ColumnData, TooltipCell } from '../Table';
import { formatDateWithMilliseconds } from '@/utils/common/format_date';
import EventPropertiesDrawer from './EventPropertiesDrawer';
import { Event } from '@/models/Event';

interface Props {
	data: Event[];
}

const EventsTable: FC<Props> = ({ data }) => {
	const { t } = useTranslation('common');
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const columns: ColumnData[] = [
		{
			title: 'Event Id',
			render(rowData) {
				return <TooltipCell tooltipContent={rowData.id} tooltipText={rowData.id} />;
			},
		},
		{
			title: 'Events name',
			render(rowData) {
				return <span>{rowData.event_name || t('labels.na')}</span>;
			},
		},
		{
			title: 'External Customer ID',
			fieldName: 'external_customer_id',
		},
		{
			title: 'Source',
			render(rowData) {
				return <span>{rowData.source || t('labels.na')}</span>;
			},
		},
		{
			title: 'Timestamp',
			render(rowData) {
				return <span>{formatDateWithMilliseconds(rowData.timestamp)}</span>;
			},
		},
	];

	const handleRowClick = (event: Event) => {
		setSelectedEvent(event);
		setIsDrawerOpen(true);
	};

	return (
		<div>
			<FlexpriceTable showEmptyRow columns={columns} data={data} onRowClick={handleRowClick} />
			<EventPropertiesDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} event={selectedEvent} />
		</div>
	);
};

export default EventsTable;
