import Contact from '@/components/reusableComponents/contact'
import Footer from '@/components/reusableComponents/footer'
import { FooterCta } from '@/components/reusableComponents/footerCta'
import Navbar from '@/components/reusableComponents/navbar'
import React from 'react'


function Page() {

    return (
        <div>
            <Navbar/>
            <Contact/>
            <FooterCta/>
            <Footer/>
        </div>
    )
}

export default Page
