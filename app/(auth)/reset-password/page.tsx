'use client'

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useResetPasswordForm } from '@/lib/hooks/use-auth'

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { resetPassword, isLoading, reset } = useResetPasswordForm()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [token, setToken] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token')
        if (tokenFromUrl) {
            setToken(tokenFromUrl)
        } else {
            toast.error('Invalid reset link. Please request a new password reset.')
            router.push('/forgot-password')
        }
    }, [searchParams, router])

    const validatePassword = (password: string) => {
        if (!password) return 'Password is required'
        if (password.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }
        return ''
    }

    const validateConfirmPassword = (confirmPassword: string, password: string) => {
        if (!confirmPassword) return 'Please confirm your password'
        if (confirmPassword !== password) return 'Passwords do not match'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Clear previous errors
        setErrors({})
        
        // Client-side validation
        const passwordValidation = validatePassword(password)
        const confirmPasswordValidation = validateConfirmPassword(confirmPassword, password)
        
        if (passwordValidation || confirmPasswordValidation) {
            const newErrors: Record<string, string> = {}
            if (passwordValidation) newErrors.password = passwordValidation
            if (confirmPasswordValidation) newErrors.confirmPassword = confirmPasswordValidation
            setErrors(newErrors)
            toast.error('Please fix the validation errors')
            return
        }

        if (!token) {
            toast.error('Invalid reset token. Please request a new password reset.')
            router.push('/forgot-password')
            return
        }

        try {
            const result = await resetPassword({ token, password, confirmPassword })
            
            if (result.success) {
                setIsSubmitted(true)
                toast.success('🎉 Password reset successful!')
                
                // Clear form
                setPassword('')
                setConfirmPassword('')
                reset()
                
                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push('/sign-in')
                }, 2000)
            } else {
                // Handle API errors
                if (result.errors) {
                    const formErrors: Record<string, string> = {}
                    
                    Object.entries(result.errors).forEach(([field, errorArray]) => {
                        if (Array.isArray(errorArray) && errorArray.length > 0) {
                            formErrors[field] = errorArray[0]
                        }
                    })
                    
                    setErrors(formErrors)
                    
                    // Show toast for first error
                    const firstError = Object.values(formErrors)[0]
                    if (firstError) {
                        toast.error(firstError)
                    }
                } else if (result.serverError) {
                    toast.error(result.serverError)
                } else {
                    toast.error('Password reset failed. Please try again.')
                }
            }
        } catch (error) {
            console.error('Reset password error:', error)
            toast.error('An unexpected error occurred')
        }
    }

    if (!token) {
        return (
            <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
                <div className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                    <div className="p-8 pb-6">
                        <div>
                            <LogoIcon />
                            <h1 className="text-title mb-1 mt-4 text-xl font-semibold">Invalid Reset Link</h1>
                            <p className="text-sm text-muted-foreground">
                                This password reset link is invalid or has expired.
                            </p>
                        </div>
                        <hr className="my-4 border-dashed" />
                        <Button
                            onClick={() => router.push('/forgot-password')}
                            className="w-full">
                            Request New Reset Link
                        </Button>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <div className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="Go to home page">
                            <LogoIcon />
                        </Link>
                        <h1 className="text-title mb-1 mt-4 text-xl font-semibold">
                            {isSubmitted ? 'Password reset successful!' : 'Reset your password'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isSubmitted 
                                ? 'Your password has been successfully reset. You can now sign in with your new password.'
                                : 'Please enter your new password below.'
                            }
                        </p>
                    </div>

                    <hr className="my-4 border-dashed" />

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                    className="block text-sm font-medium">
                                New Password
                            </Label>
                                <div className="relative">
                            <Input
                                        type={showPassword ? "text" : "password"}
                                required
                                name="password"
                                id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={(e) => {
                                            const error = validatePassword(e.target.value)
                                            if (error && !errors.password) {
                                                setErrors(prev => ({ ...prev, password: error }))
                                            }
                                        }}
                                        className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                                        disabled={isLoading}
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? "password-error" : undefined}
                                        placeholder="Enter your new password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}>
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p id="password-error" className="text-sm text-destructive" role="alert">
                                        {errors.password}
                                    </p>
                                )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="confirmPassword"
                                    className="block text-sm font-medium">
                                    Confirm New Password
                            </Label>
                                <div className="relative">
                            <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                required
                                name="confirmPassword"
                                id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onBlur={(e) => {
                                            const error = validateConfirmPassword(e.target.value, password)
                                            if (error && !errors.confirmPassword) {
                                                setErrors(prev => ({ ...prev, confirmPassword: error }))
                                            }
                                        }}
                                        className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                                        disabled={isLoading}
                                        aria-invalid={!!errors.confirmPassword}
                                        aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                                        placeholder="Confirm your new password"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {errors.confirmPassword && (
                                    <p id="confirm-password-error" className="text-sm text-destructive" role="alert">
                                        {errors.confirmPassword}
                                    </p>
                                )}
                        </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                                aria-busy={isLoading}>
                                {isLoading ? (
                                    <>
                                        <span className="mr-2">Resetting password</span>
                                        <span className="animate-spin">⟳</span>
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-5">
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Redirecting you to the sign in page...
                                </p>
                    </div>

                            <Button
                                onClick={() => router.push('/sign-in')}
                                className="w-full">
                                Continue to Sign In
                            </Button>
                    </div>
                    )}
                </div>

                <div className="bg-muted rounded-[--radius] border p-3">
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            asChild
                            variant="link"
                            className="h-auto p-0 text-sm">
                            <Link href="/sign-in" className="flex items-center gap-1">
                                <ArrowLeft className="h-3 w-3" />
                                Back to sign in
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
