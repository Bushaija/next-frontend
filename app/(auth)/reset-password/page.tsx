import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
// import { resetPassword } from '@/lib/auth/actions/actions'

export default function ResetPasswordPage({
    searchParams,
}: {
    searchParams: { token?: string }
}) {
    const token = searchParams.token || '';

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                // action={resetPassword}
                className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            <LogoIcon />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Reset Password</h1>
                        <p className="text-sm">Please enter your new password</p>
                    </div>

                    <div className="mt-6 space-y-6">
                        {/* Hidden token field */}
                        <Input 
                            type="hidden" 
                            name="token" 
                            value={token} 
                        />

                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="block text-sm">
                                New Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="password"
                                id="password"
                                placeholder="New password"
                                minLength={8}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="confirmPassword"
                                className="block text-sm">
                                Confirm Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="confirmPassword"
                                id="confirmPassword"
                                placeholder="Confirm new password"
                                minLength={8}
                            />
                        </div>

                        <Button className="w-full">Reset Password</Button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            Make sure your password is secure and easy to remember.
                        </p>
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Remember your password?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/sign-in">Log in</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}
