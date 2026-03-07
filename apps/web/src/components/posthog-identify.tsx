'use client'

import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export default function PostHogIdentify() {
    const posthog = usePostHog()
    const { data: session } = authClient.useSession()

    useEffect(() => {
        if (posthog && session?.user) {
            posthog.identify(session.user.id, {
                email: session.user.email,
                name: session.user.name,
            })
        } else if (posthog && !session) {
            posthog.reset()
        }
    }, [posthog, session])

    return null
}
