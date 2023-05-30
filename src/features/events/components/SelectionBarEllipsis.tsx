import { RootState } from 'core/store';
import { useMessages } from 'core/i18n';
import useModel from 'core/useModel';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import React, { useContext } from 'react';

import { EventsModel } from '../models/EventsModel';
import messageIds from '../../calendar/l10n/messageIds';
import { ZUIConfirmDialogContext } from 'zui/ZUIConfirmDialogProvider';
import ZUIEllipsisMenu from 'zui/ZUIEllipsisMenu';

const SelectionBarEllipsis = () => {
  const messages = useMessages(messageIds);
  const { showConfirmDialog } = useContext(ZUIConfirmDialogContext);

  const selectedEvents = useSelector(
    (state: RootState) => state.events.selectedEvents
  );

  const events = useSelector(
    (state: RootState) => state.events.eventList.items
  );

  const unpublishedEvents = events.filter((event) =>
    selectedEvents.some(
      (selectedEvent) =>
        selectedEvent == event.id && event.data?.published === null
    )
  );

  const publishedEvents = events.filter((event) =>
    selectedEvents.some(
      (selectedEvent) => selectedEvent == event.id && event.data?.published
    )
  );
  const router = useRouter();

  const orgId = router.query.orgId;
  const model = useModel(
    (env) => new EventsModel(env, parseInt(orgId as string))
  );

  const ellipsisMenuItems = [
    {
      label: messages.selectionBar.ellipsisMenu.delete(),
      onSelect: () => {
        showConfirmDialog({
          onSubmit: () => {
            model.deleteEvents(selectedEvents);
          },
          title: messages.selectionBar.ellipsisMenu.confirmDelete(),
          warningText: messages.selectionBar.ellipsisMenu.deleteWarning(),
        });
      },
      textColor: '#ed1c55',
    },
    {
      divider: true,
      // onSelect: () => {},
      label: messages.selectionBar.ellipsisMenu.cancel(),
      textColor: '#ed1c55',
    },
    {
      label:
        publishedEvents.length > 0
          ? messages.selectionBar.ellipsisMenu.unpublish()
          : '',
      // onSelect: () => {},
      textColor: '#f66000',
    },
    {
      label:
        unpublishedEvents.length > 0
          ? messages.selectionBar.ellipsisMenu.publish()
          : '',
      // onSelect: () => {},
    },
    {
      label: messages.selectionBar.ellipsisMenu.print(),
      //  onSelect: () => {}
    },
  ];
  return <ZUIEllipsisMenu items={ellipsisMenuItems} />;
};

export default SelectionBarEllipsis;
