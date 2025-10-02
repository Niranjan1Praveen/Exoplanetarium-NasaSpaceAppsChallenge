import Footer from '@/components/reusableComponents/footer'
import { FooterCta } from '@/components/reusableComponents/footerCta'
import Navbar from '@/components/reusableComponents/navbar'
import Team from '@/components/reusableComponents/team'
import React from 'react'


function Page() {

    return (
        <div>
            <Navbar/>
            <Team/>
            <FooterCta/>
            <Footer/>
        </div>
    )
}

export default Page
