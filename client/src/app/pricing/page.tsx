import Footer from '@/components/reusableComponents/footer'
import { FooterCta } from '@/components/reusableComponents/footerCta'
import Navbar from '@/components/reusableComponents/navbar'
import Pricing from '@/components/reusableComponents/pricing'
import React from 'react'


function Page() {

    return (
        <div>
            <Navbar/>
            <Pricing/>
            <FooterCta/>
            <Footer/>
        </div>
    )
}

export default Page
