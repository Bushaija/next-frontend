'use client'

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useLoginForm } from '@/lib/hooks/use-auth'

export default function SignInPage() {
    const router = useRouter()
    const { login, isLoading, reset } = useLoginForm()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    const checkCookies = () => {
        if (typeof window !== 'undefined') {
            console.log('🍪 All browser cookies:', document.cookie)
            
            // Check if auth_token is in localStorage (which our login sets)
            const localToken = localStorage.getItem('auth_token')
            console.log('💾 Token in localStorage:', localToken ? localToken.substring(0, 20) + '...' : 'None')
        }
    }

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Clear previous errors
        setErrors({})
        
        // Client-side validation
        const emailValidation = validateEmail(email)
        const passwordValidation = validatePassword(password)
        
        if (emailValidation || passwordValidation) {
            const newErrors: Record<string, string> = {}
            if (emailValidation) newErrors.email = emailValidation
            if (passwordValidation) newErrors.password = passwordValidation
            setErrors(newErrors)
            toast.error('Please fix the validation errors')
            return
        }

        try {
            const result = await login({ email, password })
            
            if (result.success) {
                toast.success('🎉 Login successful! Welcome back!')
                
                // Clear form
                setEmail('')
                setPassword('')
                reset()
                
                // Check cookies before redirecting
                checkCookies()
                
                // Add a small delay to ensure cookie is set before redirect
                console.log('🔄 Login successful, redirecting in 1000ms...')
                setTimeout(() => {
                    console.log('🚀 Redirecting to /dashboard/home')
                    
                    // Check cookies again just before redirect
                    checkCookies()
                    
                    // Try Next.js router first
                    router.push('/dashboard/home')
                    
                    // Fallback to window.location after a brief delay
                    setTimeout(() => {
                        if (typeof window !== 'undefined') {
                            console.log('🔄 Fallback: Using window.location.href')
                            window.location.href = '/dashboard/home'
                        }
                    }, 100)
                }, 1000) // Increased delay to 1 second
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
                    toast.error('Login failed. Please try again.')
                }
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error('An unexpected error occurred')
        }
    }
    
    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSubmit}
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
                                    if (error && !errors.email) {
                                        setErrors(prev => ({ ...prev, email: error }))
                                    }
                                }}
                                className={errors.email ? "border-destructive" : ""}
                                disabled={isLoading}
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p id="email-error" className="text-sm text-destructive" role="alert">
                                    {errors.email}
                                </p>
                            )}
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
                                    if (error && !errors.password) {
                                        setErrors(prev => ({ ...prev, password: error }))
                                    }
                                }}
                                className={`input sz-md variant-mixed ${errors.password ? "border-destructive" : ""}`}
                                disabled={isLoading}
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? "password-error" : undefined}
                                placeholder="Enter your password"
                            />
                            {errors.password && (
                                <p id="password-error" className="text-sm text-destructive" role="alert">
                                    {errors.password}
                                </p>
                            )}
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
                            disabled={isLoading}
                            aria-busy={isLoading}>
                            {isLoading ? (
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

                <div className="bg-muted rounded-[--radius] border p-3">
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