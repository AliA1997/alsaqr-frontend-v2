
export enum ListItemType {
    Post = 'post',
    User = 'user',
    Community = 'community',
    CommunityDiscussion = 'community-discussion',
    CommunityDiscussionMessage = 'community-discussion-message',
    List = 'list'
}
// Relationship when posting is 
// list - [:SAVED_LIST_ITEM] -> list item
// listItem - [:SAVED_TO_LIST] -> list
export interface ListItem {
    id: string;
    savedUserId?: string;
    postId?: string;
    commmunityId?: string;
    communityDiscussionId?: string;
    communityDiscussionMessageId?: string;
    listId?: string;
    listItemType: ListItemType;
    savedAt: string;
}

export interface ListItemRecord extends ListItem {}

export interface ListItemToDisplay {
    listItemId: string;
    listId: string;
    itemType: string;
    savedAt: Date;
    //Post Fields
    postId?: string;
    postContent?: string;
    postType?: string;
    postTags?: string[];
    postCreatedAt?: Date;
    postUsername?: string;
    postAvatar?: string;
    postBannerImage?: string;

    // Community fields
    communityId?: string;
    communityName?: string;
    communityDescription?: string;
    communityAvatar?: string;
    communityBannerImage?: string;
    communityTags?: string[];
    communityFounderUsername?: string;
    communityFounderAvatar?: string;
    communityCreatedAt?: Date;
    communityTotalMembers?: number;


    // Saved User Fields
    savedUserId?: string;
    savedUserUsername?: string;
    savedUserAvatar?: string;
    savedUserBio?: string;
    
    // Saved Community Discussion Fields
    communityDiscussionId?: string;
    communityDiscussionTitle?: string;
    communityDiscussionContent?: string;
    communityDiscussionCreatedAt?: Date;
    communityDiscussionUsername?: string;
    communityDiscussionAvatar?: string;
    
    // Saved Community Discussion Message Fields
    communityDiscussionMessageId?: string;
    communityDiscussionMessageContent?: string;
    communityDiscussionMessageMedia?: string;
    communityDiscussionMessageCreatedAt?: Date;
    communityDiscussionMessageUsername?: string;
    communityDiscussionMessageAvatar?: string;
    label: "Post" | "Community" | "Community Discussion" | "Community Discussion Message" | "List" | "User";

    relatedEntity: object;
}