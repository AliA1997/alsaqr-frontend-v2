import { useRef } from "react";
import type { EventRecord } from "@models/event";
import { ContentContainerWithRef } from "@common/Containers";
import { NoRecordsTitle } from "@common/Titles";
import EventCard from "@components/event/EventCard";

interface Props {
  events: EventRecord[];
}

// Displays the meetup events the user has attended.
function UserEventsFeed({ events }: Props) {
  const containerRef = useRef(null);

  return (
    <ContentContainerWithRef
      classNames="text-left grid w-full max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      innerRef={containerRef}
      testId="usereventsfeed"
    >
      {events && events.length ? (
        events.map((event) => (
          <EventCard key={event.id} event={event} showDistance />
        ))
      ) : (
        <NoRecordsTitle>No events attended yet.</NoRecordsTitle>
      )}
    </ContentContainerWithRef>
  );
}

export default UserEventsFeed;
