// src/pages/auth/templates/Template1/Template1.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBrand } from '@/config/branding';
import { Template1Config } from '@/config/authTemplates';
import { AuthTab } from '../../authTabs';
import LandingSection from './LandingSection';
import RegionSelector from '@/components/molecules/RegionSelector/RegionSelector';
import LocaleSelector from '@/components/molecules/LocaleSelector/LocaleSelector';
import LoginForm from '../../LoginForm';
import SignupForm from '../../SignupForm';
import ForgotPasswordForm from '../../ForgotPasswordForm';
import ResetPasswordForm from '../../ResetPasswordForm';

interface Template1Props {
	config: Template1Config;
	currentTab: AuthTab;
	switchTab: (tab: AuthTab) => void;
}

const Template1: React.FC<Template1Props> = ({ config, currentTab, switchTab }) => {
	const { t } = useTranslation('auth');
	const { logo } = useBrand();

	const renderForm = () => {
		switch (currentTab) {
			case AuthTab.SIGNUP:
				return <SignupForm switchTab={switchTab} />;
			case AuthTab.FORGOT_PASSWORD:
				return <ForgotPasswordForm switchTab={switchTab} />;
			case AuthTab.RESET_PASSWORD:
				return <ResetPasswordForm switchTab={switchTab} />;
			default:
				return <LoginForm switchTab={switchTab} />;
		}
	};

	return (
		<div className='flex w-full min-h-screen bg-white page !p-0 !flex-row'>
			<div className='w-[45%] flex flex-col'>
				{config.slackCommunityUrl && (
					<a
						href={config.slackCommunityUrl}
						target='_blank'
						rel='noopener noreferrer'
						className='w-full h-[48px] flex items-center justify-center gap-2.5 cursor-pointer border-y border-gray-100 hover:opacity-90 transition-opacity'
						style={{ background: 'linear-gradient(to right, #F7F7F7, #EDEDED, #F7F7F7)' }}>
						<span className='text-[15px] font-medium text-gray-700'>{t('slackBanner', { brandName: name })}</span>
						<img src='/assets/logo/slack-logo.png' alt='Slack Logo' className='h-4 w-auto' />
					</a>
				)}
				<div className='flex-1 flex justify-center items-center pt-[10px]'>
					<div className='flex flex-col justify-center max-w-xl w-[55%] mx-auto'>
						<div className='flex justify-center mb-4'>
							<img src={logo} alt={`${name} Logo`} className='h-12' />
						</div>
						{currentTab === AuthTab.SIGNUP && (
							<>
								<h2 className='text-3xl font-medium text-center text-gray-800 mb-2'>{t('createAccount.heading')}</h2>
								<p className='text-center text-gray-600 mb-10'>{t('createAccount.subheading', { brandName: name })}</p>
								<div className='mb-6'>
									<RegionSelector />
								</div>
							</>
						)}
						{currentTab === AuthTab.LOGIN && (
							<>
								<h2 className='text-3xl font-medium text-center text-gray-800 mb-3'>{t('login.heading')}</h2>
								<p className='text-center text-gray-600 mb-10'>{t('login.subheading')}</p>
								<div className='mb-6'>
									<RegionSelector />
								</div>
							</>
						)}
						{currentTab === AuthTab.FORGOT_PASSWORD && (
							<>
								<h2 className='text-3xl font-medium text-center text-gray-800 mb-2'>{t('forgotPassword.heading')}</h2>
								<p className='text-center text-gray-600 mb-8'>{t('forgotPassword.subheading')}</p>
							</>
						)}
						{currentTab === AuthTab.RESET_PASSWORD && (
							<>
								<h2 className='text-3xl font-medium text-center text-gray-800 mb-2'>{t('resetPassword.heading')}</h2>
								<p className='text-center text-gray-600 mb-8'>{t('resetPassword.subheading')}</p>
							</>
						)}
						{renderForm()}
						<div className='mt-6 flex justify-start'>
							<LocaleSelector />
						</div>
					</div>
				</div>
			</div>
			<div className='w-[55%] min-h-screen flex'>
				<LandingSection config={config} />
			</div>
		</div>
	);
};

export default Template1;
