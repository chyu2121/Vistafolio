import Navbar from "@/components/main/navbar"
import Hero from "@/components/main/hero"

export default function LandingPage() {
    return (
        <main className="flex min-h-screen flex-col items-center bg-[#111] text-white overflow-hidden">
            <Navbar />
            <Hero />
        </main>
    )
}
