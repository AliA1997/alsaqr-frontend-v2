import { observer } from "mobx-react-lite";
import { CommunityToDisplay, RelationshipType } from "@typings";
import { convertDateToDisplay, stopPropagationOnClick } from "@utils/index";
import { InfoCardContainer } from "@common/Containers";
import { TagOrLabel } from "@common/Titles";
import { OptimizedImage } from "@common/Image";
import { useNavigate } from "react-router";

type Props = {
    communityInfo: CommunityToDisplay;
}

function CommunityNonAdminView({
    communityInfo
}: Props) {
    const navigate = useNavigate();

    const navigateToUser = () => {
        navigate(`users/${communityInfo.founderUsername}`);
    };
    
    if (communityInfo)
        return (
            <>
                <div className='relative flex'>
                    <img
                        className="p-1 h-[5rem] w-[5rem] rounded-full object-cover "
                        src={communityInfo.communityAvatar}
                        alt={communityInfo.communityName}
                    />
                    <InfoCardContainer>
                        <h6 className='text-3xl'>
                            {`Welcome to ${communityInfo.communityName}`}
                        </h6>
                    </InfoCardContainer>
                    <div className="absolute bottom-0 right-0 flex">
                        <TagOrLabel
                            color={communityInfo.isPrivate ? 'danger' : 'info'}
                            size='sm'
                        >
                            {communityInfo.isPrivate ? 'Private' : 'Public'}
                        </TagOrLabel>
                        <TagOrLabel
                            color={
                                (communityInfo.relationshipType as RelationshipType) === RelationshipType.Founder ? 'gold'
                                : (communityInfo.relationshipType as RelationshipType) === RelationshipType.Invited ? 'success'
                                    : (communityInfo.relationshipType as RelationshipType) === RelationshipType.Member ? 'primary'
                                    : (communityInfo.relationshipType as RelationshipType) === RelationshipType.Invited ? 'secondary'
                                        : 'neutral'
                            }
                            size='sm'
                        >
                            {communityInfo.relationshipType?.toUpperCase()}
                        </TagOrLabel>
                    </div>
                </div>
                <div className="relative flex flex-5">
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Members:</p>
                        <h6 className='w-full text-center text-3xl'>
                            {communityInfo.totalMembers}
                        </h6>
                    </InfoCardContainer>
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Created on: </p>
                        <h6 className='w-full text-center mt-2'>
                            {new Date(convertDateToDisplay(communityInfo.communityCreatedAt)).toLocaleString('default', { dateStyle: 'short' })}
                        </h6>
                    </InfoCardContainer>
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Founder: </p>
                        <div className="flex flex-col justify-self-stretch grow justify-start h-full space-x-3">
                            <div className="flex justify-items-start items-end align-items-end space-x-2 text-gray-900 dark:text-gray-50 cursor-pointer">
                                <OptimizedImage
                                    classNames="h-10 w-10 rounded-full object-cover"
                                    src={communityInfo.founderAvatar ?? ""}
                                    alt={communityInfo.founderUsername ?? ""}
                                    onClick={(e) => stopPropagationOnClick(e, navigateToUser)}
                                />
                                <div className="flex flex-col items-start hover:underline">
                                    <h6>{communityInfo.founderUsername}</h6>
                                </div>
                            </div>
                        </div>
                    </InfoCardContainer>
                </div>
            </>
        );

    return <></>
}

export default observer(CommunityNonAdminView);
