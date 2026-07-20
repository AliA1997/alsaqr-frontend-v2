
export interface FollowUserFormDto {
    userToFollowId: string;
}

export interface UnFollowUserFormDto {
    userToUnFollowId: string;
}

export interface UpdateUserForm {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    bgThumbnail: string;
    dateOfBirth?: Date;
    username: string;
    bio: string;
    religion: string;
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    hobbies?: string[];
    countryOfOrigin?: string;
}

export interface UpdateUserFormDto extends UpdateUserForm {}