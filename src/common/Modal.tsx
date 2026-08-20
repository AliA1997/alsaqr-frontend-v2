import { useStore } from '@stores/index';
import { observer } from 'mobx-react-lite';
import React, { CSSProperties, useState } from 'react';
import { createPortal } from 'react-dom';
import { ButtonLoader } from "@common/CustomLoader";

interface ModalBodyProps {
  onClose: () => void;
  children: React.ReactNode;
  canCloseLoginModal?: boolean;
  headerChildren?: React.ReactNode;
  classNames?: string;
  bodyClassNames?: string;
  style?: CSSProperties;
}

const ModalBody = ({ onClose, canCloseLoginModal, headerChildren, children, classNames, bodyClassNames, ...otherProps }: ModalBodyProps) => {

  return (
    <div 
      className={`
        fixed inset-0 z-[999] flex items-center justify-center bg-black/75 h-screen ${classNames ?? ""}
      `}
      {...otherProps}
    >
      <div className={`relative bg-white dark:bg-[#000000] rounded-lg shadow-lg w-11/12 mx-auto ${bodyClassNames ?? "max-w-lg"}`}>
        <div className="relative p-4">
          {headerChildren
            ? headerChildren
            : canCloseLoginModal 
              ? null 
              : (
                <button
                  onClick={onClose}
                  className="absolute right-5 top-3 text-gray-400 hover:text-gray-600 block float-right cursor-pointer"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

        </div>
        <div className="flex flex-col align-center justify-center p-4">
          {children}
        </div>
        {/* <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

const ModalPortal = ({ children }: React.PropsWithChildren<any>) => {
  const [mounted, setMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
}

interface ConfirmModalProps {
  title: string;
  confirmMessage: string;
  onClose: () => void;
  confirmFunc: () => Promise<void>;
  declineButtonText: string;
  confirmButtonClassNames: string;
  confirmButtonText: string;
}

const ConfirmModal = observer(({
  title,
  confirmMessage,
  children,
  onClose,
  confirmFunc,
  declineButtonText,
  confirmButtonClassNames,
  confirmButtonText
}: React.PropsWithChildren<ConfirmModalProps>) => {
  const { feedStore } = useStore();
  const { loadingUpsert } = feedStore;
  const [submitting, setSubmitting] = useState<boolean>(false)
  return (
  <ModalPortal>
    <ModalBody
      headerChildren={
        <h2>{title}</h2>
      }
      onClose={onClose}
    >
      <div className='flex flex-col w-full h-full'>
        {children ? children : null}
        <p>{confirmMessage}</p>
        <div className='flex px-2 justify-between'>
          <button
            onClick={onClose}
            className={`
                  rounded-full bg-gray-100 px-5 py-2 font-bold text-gray-900 
                  disabled:opacity-40 cursor-pointer
                `}
            type="button"
          >
            {declineButtonText}
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              setSubmitting(true);
              try {
                await confirmFunc();
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={(submitting ?? false) || loadingUpsert}
            className={`
                  rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white ${confirmButtonClassNames && confirmButtonClassNames} 
                  disabled:opacity-40 cursor-pointer
                `}
            type="button"
          >
            {loadingUpsert || (submitting ?? false) ? (
              <ButtonLoader />
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </ModalBody>
  </ModalPortal>
)
});

export { ModalBody, ModalPortal, ConfirmModal };
