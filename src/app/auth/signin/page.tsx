import { SignInForm } from '@/components/auth/sign-in-form'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Adaptrix
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            LoRa Adapter Marketplace
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}