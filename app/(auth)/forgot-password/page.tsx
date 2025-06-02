'use client'

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useForgotPasswordForm } from '@/lib/hooks/use-auth'

export default function ForgotPasswordPage() {
    const { forgotPassword, isLoading, reset } = useForgotPasswordForm()
    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitted, setIsSubmitted] = useState(false)

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) return 'Email is required'
        if (!emailRegex.test(email)) return 'Please enter a valid email address'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Clear previous errors
        setErrors({})
        
        // Client-side validation
        const emailValidation = validateEmail(email)
        
        if (emailValidation) {
            setErrors({ email: emailValidation })
            toast.error(emailValidation)
            return
        }

        try {
            const result = await forgotPassword({ email })
            
            if (result.success) {
                setIsSubmitted(true)
                toast.success('Password reset instructions sent!')
                
                // Clear form
                setEmail('')
                reset()
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
                    toast.error('Something went wrong. Please try again.')
                }
            }
        } catch (error) {
            console.error('Forgot password error:', error)
            toast.error('An unexpected error occurred')
        }
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
                            {isSubmitted ? 'Check your email' : 'Forgot password?'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isSubmitted 
                                ? 'We\'ve sent password reset instructions to your email address.'
                                : 'Enter your email address and we\'ll send you a link to reset your password.'
                            }
                        </p>
                    </div>

                    <hr className="my-4 border-dashed" />

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="block text-sm font-medium">
                                    Email
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    name="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={(e) => {
                                        const error = validateEmail(e.target.value)
                                        if (error && !errors.email) {
                                            setErrors(prev => ({ ...prev, email: error }))
                                        }
                                    }}
                                    className={errors.email ? "border-destructive" : ""}
                                    disabled={isLoading}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                    placeholder="Enter your email address"
                                />
                                {errors.email && (
                                    <p id="email-error" className="text-sm text-destructive" role="alert">
                                        {errors.email}
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
                                        <span className="mr-2">Sending</span>
                                        <span className="animate-spin">⟳</span>
                                    </>
                                ) : (
                                    'Send reset instructions'
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
                                    If an account with that email exists, you'll receive an email with reset instructions.
                                </p>
                            </div>
                            
                            <Button
                                onClick={() => {
                                    setIsSubmitted(false)
                                    setEmail('')
                                    setErrors({})
                                    reset()
                                }}
                                variant="outline"
                                className="w-full">
                                Send another email
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
