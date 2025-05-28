'use client'

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { login } from "@/components/actions/login-action"
import { useActionState } from "react"
import { FieldError } from '@/components/ui/FormError'

export default function SignInPage() {
    const [state, dispatch] = useActionState(login, undefined)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Handle success/error notifications
    useEffect(() => {
        if (state?.errors) {
            // Check if there are field-specific errors
            const hasFieldErrors = Object.keys(state.errors).some(
                key => state.errors[key] && state.errors[key].length > 0
            )
            
            if (hasFieldErrors) {
                // Show a general error toast for field validation errors
                toast.error('Please check your credentials and try again')
            }
        }
        
        if (state?.server_error) {
            toast.error(state.server_error)
        }
    }, [state])

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) return 'Email is required'
        if (!emailRegex.test(email)) return 'Please enter a valid email'
        return ''
    }

    const validatePassword = (password: string) => {
        if (!password) return 'Password is required'
        if (password.length < 6) return 'Password must be at least 6 characters'
        return ''
    }

    const handleSubmit = async (formData: FormData) => {
        // Client-side validation
        const emailValidation = validateEmail(email)
        const passwordValidation = validatePassword(password)
        
        if (emailValidation || passwordValidation) {
            toast.error('Please fix the validation errors')
            return
        }

        setIsSubmitting(true)
        
        try {
            // The dispatch will handle the server action
            await dispatch(formData)
        } catch (error) {
            console.error('Login error:', error)
            toast.error('An unexpected error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }
    
    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                action={handleSubmit}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
                aria-label="Sign in form">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="Go to home page">
                            <LogoIcon />
                        </Link>
                        <h1 className="text-title mb-1 mt-4 text-xl font-semibold">Sign in to your account</h1>
                        <p className="text-sm text-muted-foreground">Welcome back! Please enter your credentials</p>
                    </div>

                    <hr className="my-4 border-dashed" />

                    {/* Display server errors */}
                    {state?.server_error && (
                        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive" role="alert">
                            {state.server_error}
                        </div>
                    )}

                    {/* Display general authentication errors */}
                    {state?.errors && !state.errors.email && !state.errors.password && (
                        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive" role="alert">
                            Authentication failed. Please check your credentials.
                        </div>
                    )}

                    <div className="space-y-5">
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
                                    if (error && !state?.errors?.email) {
                                        // Only show validation toast if there's no server error
                                        toast.error(error)
                                    }
                                }}
                                className={state?.errors?.email ? "border-destructive" : ""}
                                disabled={isSubmitting}
                                aria-invalid={!!state?.errors?.email}
                                aria-describedby={state?.errors?.email ? "email-error" : undefined}
                                placeholder="Enter your email"
                            />
                            <FieldError state={state} field="email" />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-title text-sm font-medium">
                                Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={(e) => {
                                    const error = validatePassword(e.target.value)
                                    if (error && !state?.errors?.password) {
                                        // Only show validation toast if there's no server error
                                        toast.error(error)
                                    }
                                }}
                                className={`input sz-md variant-mixed ${state?.errors?.password ? "border-destructive" : ""}`}
                                disabled={isSubmitting}
                                aria-invalid={!!state?.errors?.password}
                                aria-describedby={state?.errors?.password ? "password-error" : undefined}
                                placeholder="Enter your password"
                            />
                            <FieldError state={state} field="password" />
                            <div className="text-right text-sm">
                                <Button
                                    asChild
                                    variant="link"
                                    className="h-auto p-0 text-sm">
                                    <Link href="/forgot-password">Forgot password?</Link>
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="mr-2">Signing in</span>
                                    <span className="animate-spin">⟳</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </div>
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        {"Don't have an account?"}
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/sign-up">Sign Up</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}