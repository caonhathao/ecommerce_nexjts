import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { useTranslations } from 'next-intl';
import { LoginFormTab } from './login-form-tab';
import { RegisterFormTab } from './register-form-tab';

export function AuthForm() {
  const t = useTranslations('auth_login_page.auth_login_form');
  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">{t('t_sign_in_action')}</TabsTrigger>
          <TabsTrigger value="register">{t('t_sign_up_action')}</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginFormTab />
        </TabsContent>

        <TabsContent value="register">
          <RegisterFormTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
