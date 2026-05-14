import { useTranslation } from 'react-i18next';

const UserProfile = () => {
	const { t } = useTranslation('common');
	return (
		<div className={`h-6 flex w-full rounded-[6px] items-center gap-2 bg-contain ${!open ? 'hidden' : ''}`}>
			<img
				src={'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=mail@ashallendesign.co.uk'}
				className='size-8 bg-contain rounded-[6px]'
				alt={t('labels.companyLogo')}
			/>
			{/* eslint-disable-next-line i18next/no-literal-string */}
			<p className='font-semibold text-[14px]'>Simplismart</p>
		</div>
	);
};
export default UserProfile;
