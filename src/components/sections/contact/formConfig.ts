export const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || ''

export const LIMITS = { nameMin: 2, messageMin: 20, messageMax: 2000 } as const

export const COPY = {
  name: { label: 'Your name', error: "I'd like to know who I'm talking to." },
  email: { label: 'Email', error: "That email doesn't look right." },
  message: {
    label: 'What are we building?',
    error: `A few more words, please (${LIMITS.messageMin}+ characters).`,
    tooLong: `That's a lot — keep it under ${LIMITS.messageMax} characters.`,
  },
} as const
