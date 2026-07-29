import Footer from '@/components/reusableComponents/footer'
import { FooterCta } from '@/components/reusableComponents/footerCta'
import Team from '@/components/reusableComponents/team'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
    title: 'Team',
    description:
        'The engineers behind Exoplanetarium, building AI-assisted exoplanet research and interactive 3D learning tools.',
    alternates: { canonical: '/team' },
}

function Page() {
    return (
        <div className="overflow-x-clip">
            <Team/>
            <FooterCta/>
            <Footer/>
        </div>
    )
}

export default Page
