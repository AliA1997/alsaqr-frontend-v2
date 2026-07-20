
export interface PersonalInfoForm {
    username: string;
    avatar: string;
    bgThumbnail: string;
    bio: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    countryOfOrigin: string;
}

export interface PersonalizeAccountForm {
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    religion: string;
    hobbies?: string[];
}