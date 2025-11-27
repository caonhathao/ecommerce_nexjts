'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabsContent } from '@radix-ui/react-tabs';
import { LoginFormTab } from './login-form-tab';
import { RegisterFormTab } from './register-form-tab';

export function AuthForm() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="register">Sign Up</TabsTrigger>
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
