import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PasswordResetSentPage() {
    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            <LogoIcon />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Check Your Email</h1>
                        <p className="text-sm">We've sent a password reset link to your email address</p>
                    </div>

                    <div className="mt-6 text-center">
                        <div className="flex justify-center my-8">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-emerald-500">
                                <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-4.5" />
                                <path d="m22 10.5-8.4 3.5a2 2 0 0 1-1.6 0L2 10" />
                                <path d="M2 10v10c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2V10" />
                            </svg>
                        </div>
                        <p className="text-muted-foreground text-sm mb-6">
                            Please check your email inbox and click on the link we've sent to reset your password.
                            If you don't see it, check your spam folder.
                        </p>
                        <Button
                            asChild
                            className="w-full">
                            <Link href="/sign-in">Return to Login</Link>
                        </Button>
                    </div>
                </div>

                <div className="p-3 text-center">
                    <p className="text-accent-foreground text-sm">
                        Didn't receive the email?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/forgot-password">Try again</Link>
                        </Button>
                    </p>
                </div>
            </div>
        </section>
    )
} 