import { useRef } from "react";
import type { GroupRecord } from "@models/group";
import { ContentContainerWithRef } from "@common/Containers";
import { NoRecordsTitle } from "@common/Titles";
import GroupCard from "@components/group/GroupCard";

interface Props {
  groups: GroupRecord[];
}

// Displays the meetup groups the user is a member of.
function UserGroupsFeed({ groups }: Props) {
  const containerRef = useRef(null);

  return (
    <ContentContainerWithRef
      classNames="text-left grid w-full max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
      innerRef={containerRef}
      testId="usergroupsfeed"
    >
      {groups && groups.length ? (
        groups.map((group) => (
          <GroupCard key={group.id} group={group} showDistance />
        ))
      ) : (
        <NoRecordsTitle>Not a member of any group yet.</NoRecordsTitle>
      )}
    </ContentContainerWithRef>
  );
}

export default UserGroupsFeed;
