import ProfileForm from './ProfileForm';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { User } from 'lib/database/UserManage';

type ProfileDialogProps = {
  user?: User;
  isOpen: boolean;
  onExit: () => void;
};

export default function ProfileDialog({ user, isOpen, onExit }: ProfileDialogProps) {
  let [show, setShow] = useState(false);
  const router = useRouter();
  const closeDialog = () => {
    setShow(false);
    if (onExit) {
      onExit();
    }
  };
  const saveDialog = async () => {
    setShow(false);
    if (onExit) {
      onExit();
    }
    await router.push(router.pathname);
  };
  useEffect(() => setShow(isOpen), [isOpen]);
  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as='div' className='relative z-10' onClose={closeDialog}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        </Transition.Child>
        <div className='fixed z-10 inset-0 overflow-y-auto'>
          <div className='flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
              enterTo='opacity-100 translate-y-0 sm:scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 translate-y-0 sm:scale-100'
              leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            >
              <Dialog.Panel className='relative bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6'>
                <div className='mt-3 text-center sm:mt-5'>
                  <div className='mt-2'>
                    <ProfileForm user={user} onSave={saveDialog} onCancel={closeDialog} />
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
