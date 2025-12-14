import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Envelope, CheckCircle } from '@phosphor-icons/react'
import { Logo } from '@/components/Logo'
import SEOHead from '@/components/SEOHead'
import { toast } from 'sonner'

interface FormData {
  name: string
  email: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setIsSuccess(true)
      setFormData({ name: '', email: '', message: '' })
      toast.success('Thank you! We\'ll be in touch soon.')
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <SEOHead
        title="Contact Us - LornuAI"
        description="Get in touch with LornuAI. Contact our team for enterprise AI solutions, custom development, and business inquiries."
        canonical="/contact"
      />
      <div className="min-h-screen bg-background">
        <nav className="bg-card/80 backdrop-blur-lg shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-2xl font-bold gradient-text" aria-label="LornuAI home">
                <Logo width={120} height={40} />
              </Link>
              <Link to="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft weight="bold" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 gradient-text">Contact Us</h1>
              <p className="text-muted-foreground text-lg">
                Have a question or want to discuss how we can help your business? Get in touch with our team.
              </p>
            </div>

            {isSuccess ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" weight="bold" />
                    <h2 className="text-2xl font-semibold mb-2">Message Sent!</h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline">
                      Send Another Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange('name')}
                        className={errors.name ? 'border-destructive' : ''}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-sm text-destructive" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange('email')}
                        className={errors.email ? 'border-destructive' : ''}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-sm text-destructive" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your project, questions, or how we can help..."
                        value={formData.message}
                        onChange={handleChange('message')}
                        className={`min-h-32 resize-none ${errors.message ? 'border-destructive' : ''}`}
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p id="message-error" className="text-sm text-destructive" role="alert">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gradient-bg hover:opacity-90 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Envelope weight="bold" className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <p className="text-muted-foreground">
                You can also reach us directly at{' '}
                <a
                  href="mailto:contact@lornu.ai"
                  className="text-accent hover:underline font-medium"
                >
                  contact@lornu.ai
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
