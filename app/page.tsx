import { Hand, Trees } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";

import { EventsSection } from "@/app/_components/events-section";
import { NotificationBanner } from "@/app/_components/notification-banner";
import { listUpcomingEvents } from "@/lib/homepage/events";
import { getNotification } from "@/lib/homepage/notification";

const UDISC_COURSE_MAPS_URL = "https://app.udisc.com/applink/course/2609";
const UDISC_CARD_ORANGE = "#e8743b";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default async function Home() {
  const [courseMapsQrSvg, notification, upcomingEvents] = await Promise.all([
    QRCode.toString(UDISC_COURSE_MAPS_URL, {
      color: { dark: "#ffffff", light: UDISC_CARD_ORANGE },
      margin: 0,
      type: "svg",
      width: 132,
    }),
    getNotification(),
    listUpcomingEvents(),
  ]);
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <NotificationBanner notification={notification} />

      {/* Hero Section */}
      <section className="relative min-h-[450px] lg:min-h-[550px] flex items-center px-6 lg:px-24 mb-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="View of Hole 1 at Beacon Glades"
            className="w-full h-full object-cover"
            src="/images/abandonedcamp.png"
          />
          <div className="absolute inset-0 bg-black/40 md:bg-gradient-to-r md:from-black/70 md:to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-headline font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-lg">
            Beacon Glades <br />
            Disc Golf Club
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-xl font-medium leading-relaxed mb-0 drop-shadow-md">
          Find your lines where volunteer hands have shaped a community course through the wild, hilly heart of an old abandoned summer camp at the base of Mount Beacon.
          </p>
        </div>
      </section>

      {/* Action cards + volunteering — shared width and spacing */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div
              className="@container block cursor-pointer overflow-hidden rounded-[1rem] bg-udisc shadow-none transition-shadow duration-300 hover:shadow-[0_0_36px_-10px_theme(colors.udisc/58)]"
            >
              <a
                className="flex flex-col gap-8 p-8 sm:p-10 @min-[32rem]:flex-row @min-[32rem]:items-center @min-[32rem]:justify-between"
                href={UDISC_COURSE_MAPS_URL}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="min-w-0 flex-1 text-left @min-[32rem]:pr-4">
                  <div className="flex items-center gap-3 mb-4 text-white">
                    <Image
                      alt="UDisc"
                      className="h-7 w-auto shrink-0"
                      height={500}
                      src="/udisc-wordmark.png"
                      width={653}
                    />
                    <h3 className="text-2xl font-headline font-bold">Course Maps</h3>
                  </div>
                  <p className="text-white/90 leading-relaxed">
                    Follow course maps with the UDisc app. Open the link or scan the code with your mobile device.
                  </p>
                </div>
                <div
                  aria-hidden
                  className="shrink-0 mx-auto @min-[32rem]:mx-0 [&_svg]:h-auto [&_svg]:w-[132px] [&_svg]:block [&_svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: courseMapsQrSvg }}
                />
              </a>
            </div>
            <div
              className="block cursor-pointer rounded-[1rem] bg-facebook p-8 sm:p-10 shadow-none transition-shadow duration-300 hover:shadow-[0_0_36px_-10px_theme(colors.facebook/58)]"
            >
              <a
                className="block text-left"
                href="https://www.facebook.com/groups/537520126335222"
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="flex items-center gap-3 mb-4 text-white">
                  <FacebookIcon className="h-7 w-7 shrink-0" />
                  <h3 className="text-2xl font-headline font-bold">Community</h3>
                </div>
                <p className="text-white/90 leading-relaxed">
                  Join the locals for weekly random doubles leagues and tag rounds. All skill levels welcome! All messaging is done through our facebook group.
                </p>
              </a>
            </div>
          </div>

          <div className="bg-primary text-on-primary rounded-[1rem] p-8 sm:p-10 flex flex-col md:flex-row md:items-start gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
            <div className="min-w-0 flex-[2] relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Hand className="w-8 h-8 shrink-0" aria-hidden />
                <h3 className="text-2xl font-headline font-bold">Volunteering</h3>
              </div>
              <div className="space-y-4 text-on-primary/90 leading-relaxed">
                <p>
                  Beacon Glades is a labor of love, maintained entirely by dedicated club members and local stewards. From clearing fallen limbs after mountain storms to painting tee signs, there is always a path for you to help.
                </p>
                <p>
                  Reach out to us at{" "}
                  <a
                    className="underline underline-offset-4 decoration-on-primary/40 hover:decoration-on-primary"
                    href="mailto:stewards@beaconglades.com"
                  >
                    stewards@beaconglades.com
                  </a>{" "}
                  for more.
                </p>
              </div>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-8 md:max-w-[11rem] md:shrink-0 md:border-l md:border-on-primary/15 md:pl-8 relative z-10">
              <div>
                <p className="text-2xl font-headline font-bold tracking-tight mb-1">24</p>
                <p className="text-sm text-on-primary/80 leading-relaxed">Holes maintained</p>
              </div>
              <div>
                <p className="text-2xl font-headline font-bold tracking-tight mb-1">100%</p>
                <p className="text-sm text-on-primary/80 leading-relaxed">Volunteer powered</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <EventsSection events={upcomingEvents} />

      {/* The Legacy of the Pines */}
      <section className="bg-surface-container-low py-24 mb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="flex flex-col items-start text-left">
                <div className="text-tertiary mb-6">
                  <Trees className="w-16 h-16 fill-current" />
                </div>
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface mb-8 tracking-tight">
                  The Legacy of the Pines
                </h2>
              </div>
              <div className="space-y-6 text-lg text-on-surface-variant font-body leading-relaxed">
                <p>
                  Before the sound of chains echoed through the trees, these mountains were home to Camp Beacon—a sanctuary for summer explorers in the late 1960s. When the camp closed its gates, the forest began to reclaim the wooden cabins and stone pathways.
                </p>
                <p>
                  Today, Beacon Glades Disc Golf Club honors that heritage. Our fairways follow the same trails once walked by campers, weaving through remnants of forgotten architecture and ancient hardwoods. Every shot is a journey through history, requiring the focus of an athlete and the heart of a wayfinder.
                </p>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="relative rounded-[1.5rem] overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  alt="Disc golf basket in a pine forest glade"
                  className="w-full h-full object-cover"
                  src="/images/pines.jpg"
                />
                <div className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-black/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-200 w-full mt-12">
        <div className="flex flex-col items-center gap-6 py-12 px-6 w-full text-center">
          <span className="text-emerald-900 font-headline font-bold text-xl tracking-tight">Beacon Glades</span>
          <p className="text-stone-600 font-body text-xs sm:text-sm uppercase tracking-widest max-w-lg leading-relaxed">
            © 2026 Beacon Glades Disc Golf Club.
          </p>
        </div>
      </footer>
    </main>
  );
}
