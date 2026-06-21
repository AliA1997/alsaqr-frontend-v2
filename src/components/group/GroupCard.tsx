import { OptimizedPostImage } from "@common/Image";
import type { GroupRecord } from "@models/group";
import { useNavigate } from "react-router-dom";

// Ported from alsaqr-meetup (https://github.com/AliA1997/alsaqr-meetup)
interface GroupCardProps {
  group: GroupRecord;
  classNames?: string;
  imageClassNames?: string;
  showDistance?: boolean;
  testId?: string;
}

export default function GroupCard({
  group,
  classNames,
  imageClassNames,
  showDistance,
  testId,
}: GroupCardProps) {
  const navigate = useNavigate();

  const imageUrl =
    group.images && group.images.length > 0
      ? group.images[0]
      : "https://via.placeholder.com/300x200";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/groups/${group.slug}`);
  };

  const topicNames =
    group.topics && group.topics.length > 0
      ? group.topics.map((t: any) => t.name).join(", ")
      : "No topics listed";

  return (
    <a
      data-testid={testId ?? "groupcard"}
      href={`/groups/${group.slug}`}
      onClick={handleClick}
      className={`block transition-transform duration-200 hover:scale-[1.02] ${classNames ?? ""}`}
    >
      <div className="flex h-full w-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1517]">
        <div className="relative flex items-center justify-center p-1">
          <OptimizedPostImage
            src={imageUrl}
            alt={group.name}
            classNames={`h-40 w-full rounded-md object-cover ${imageClassNames ? imageClassNames : ""}`}
          />
        </div>

        <div className="p-2 pt-0">
          <h3
            data-testid="grouptext"
            className="line-clamp-2 w-full text-sm font-medium leading-tight sm:text-base"
          >
            {group.name}
          </h3>
          <p data-testid="groupcardlocation" className="text-sm text-gray-500">
            {group.city}, {group.country}
          </p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{topicNames}</p>
          {showDistance && (
            <p className="text-xs text-gray-400 mt-1">
              {group.distanceKm?.toFixed(1)} km away
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
