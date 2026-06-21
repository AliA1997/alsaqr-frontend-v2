import { OptimizedPostImage } from "@common/Image";
import type { EventRecord } from "@models/event";
import { useNavigate } from "react-router-dom";

// Ported from alsaqr-meetup (https://github.com/AliA1997/alsaqr-meetup)
interface EventCardProps {
  event: EventRecord;
  classNames?: string;
  imageClassNames?: string;
  showDistance?: boolean;
  testId?: string;
}

export default function EventCard({
  event,
  classNames,
  imageClassNames,
  showDistance,
  testId,
}: EventCardProps) {
  const navigate = useNavigate();

  const imageUrl =
    event.images && event.images.length > 0
      ? event.images[0]
      : "https://via.placeholder.com/300x200";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/events/${event.slug}`);
  };

  const hostedCities =
    event.citiesHosted && event.citiesHosted.length > 0
      ? event.citiesHosted.map((c: any) => c.name).join(", ")
      : "Online";

  return (
    <a
      data-testid={testId ?? "eventcard"}
      href={`/events/${event.slug}`}
      onClick={handleClick}
      className={`block transition-transform duration-200 hover:scale-[1.02] ${classNames ?? ""}`}
    >
      <div className="flex h-full w-fit flex-col justify-around rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1517]">
        <div className="relative flex items-center justify-center p-1">
          <OptimizedPostImage
            src={imageUrl}
            alt={event.name}
            classNames={`rounded-md object-cover ${imageClassNames ? imageClassNames : ""}`}
          />
        </div>

        <div className="p-2 pt-0">
          <h3
            data-testid="eventtext"
            className="line-clamp-2 max-w-[180px] text-sm font-medium leading-tight sm:text-base"
          >
            {event.name}
          </h3>
          <p data-testid="eventhostedcities" className="text-sm text-gray-500">
            {hostedCities}
          </p>
          <p data-testid="eventgroupname" className="text-xs text-gray-400 mt-1">
            Hosted by {event.groupName}
          </p>
          {showDistance && (
            <p className="text-xs text-gray-400 mt-1">
              {event.distanceKm?.toFixed(1)} km away
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
