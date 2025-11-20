import { motion } from 'framer-motion';
import React from 'react';
import { User } from 'typings';
import { OptimizedImage } from '@common/Image';

export const ContentContainerWithRef = ({ innerRef, children, classNames, testId, ...otherProps }: React.PropsWithChildren<any>) => {
  return (
    <div 
      ref={innerRef}
      className={`max-w-4xl mx-auto bg-white dark:bg-[#0e1517] rounded-lg mt-10 ${classNames && classNames}`} 
      data-testid={testId ?? ""}
      {...otherProps}
    >
      {children}
    </div>    
  );
};

export function ContentContainer({ children, ...otherProps }: React.PropsWithChildren<any>) {
  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-[#0e1517] shadow-md rounded-lg mt-10" {...otherProps}>
      {children}
    </div>
  );
}

type ProfileImagePreviewProps = {
  avatar: string;
  username: string;
  bgThumbnail: string;
}

export function ProfileImagePreview({ username, bgThumbnail, avatar }:ProfileImagePreviewProps) {
  return (
    <motion.div 
        className="flex justify-center items-center bg-gray-100 w-full h-[10em] relative" 
        style={bgThumbnail ? { 
            backgroundImage: `url('${bgThumbnail}')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
        } : {}}
    >
        <img 
            className='h-20 w-20 bottom-10 rounded-full'
            src={avatar}
            alt={username}
            height={50}
            width={50}
        />
    </motion.div>
  );
}

type MessagesImagePreviewProps = {
  user: User;
  index: number;
};

export function MessagesImagePreview({user, index}: MessagesImagePreviewProps) {
  return (
    <OptimizedImage
      key={user.id}
      src={user.avatar}
      alt={user.username}
      classNames={`
        w-10 h-10 rounded-full border-2 border-white dark:border-gray-800
        relative  /* Enables z-index */
        ${index === 0 ? 'z-0' : index === 1 ? 'z-10' : 'z-20'} 
        ${index > 0 ? 'ml-[-1rem]' : ''}
        /* Stacking order */`}
    />
  );
}

export function InfoCardContainer({ children, classNames }: React.PropsWithChildren<any>){
  return (
    <div className={`
      relative flex flex-1 flex-col border-y border-gray-100 p-5 
      hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] 
      dark:text-gray-50
      ${classNames && classNames}
    `}>
      {children}
    </div>
  );
}