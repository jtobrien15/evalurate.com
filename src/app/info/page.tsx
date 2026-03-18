import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Waves,
  Monitor,
  Backpack,
  DollarSign,
  HelpCircle,
  Phone,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Information | YMCA Lifeguard Certification",
  description:
    "Everything you need to know about your YMCA Lifeguard Certification course — swim test, online session, what to bring, and more.",
};

const NAV_ITEMS = [
  { id: "overview", label: "Course Overview", icon: BookOpen },
  { id: "swim-test", label: "Swim Test", icon: Waves },
  { id: "online-session", label: "Online Session", icon: Monitor },
  { id: "what-to-bring", label: "What to Bring", icon: Backpack },
  { id: "cancellation", label: "Cancellation & Refunds", icon: DollarSign },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "contact", label: "Contact", icon: Phone },
];

const TIMELINE_STEPS = [
  {
    step: 1,
    title: "Prerequisite Swim Test",
    description: "Pass the swim test at your local YMCA before your class begins.",
  },
  {
    step: 2,
    title: "Online Session",
    description: "Complete the Red Cross online learning session (not the eBook).",
  },
  {
    step: 3,
    title: "In-Person Class",
    description: "Attend the scheduled in-person training at the YMCA.",
  },
  {
    step: 4,
    title: "Certification",
    description: "Receive your Red Cross Lifeguard Certification upon passing.",
  },
];

const FAQ_ITEMS = [
  {
    question: "What if I fail the swim test?",
    answer:
      "If there is no waitlist for your class, you have unlimited attempts to pass the swim test. However, if there is a waitlist, you will need to transfer to a future class session. The swim test must be completed at least 3 days before your class start date, so plan accordingly and give yourself time to practice.",
  },
  {
    question: "Can I reschedule my class?",
    answer:
      "Yes, you can reschedule your class by contacting the YMCA front desk or SGA. Transfers to a different session are subject to availability. Please try to notify us as early as possible so we can accommodate your request and open your spot for another student.",
  },
  {
    question: "What's the difference between the online session and the eBook?",
    answer:
      "The online session is an interactive learning module that includes videos, quizzes, and scenario-based activities. It takes approximately 2\u20133 hours to complete and is required before your in-person class. The eBook is a separate reference resource for studying \u2014 completing the eBook alone does NOT satisfy the online session requirement.",
  },
  {
    question: "Do I need to bring anything to the swim test?",
    answer:
      "You should bring a swimsuit, towel, and a photo ID. Goggles are optional. The swim test involves treading water and a distance swim, so come prepared for pool activity. No other equipment is needed.",
  },
  {
    question: "How long does the certification process take after the class?",
    answer:
      "Once you successfully complete the in-person class and all prerequisites, your certification is typically issued by the Red Cross within a few business days. You will receive an email with instructions to access and download your digital certification card.",
  },
  {
    question: "I registered my child \u2014 do they need their own email?",
    answer:
      "Yes, each student needs an email address to receive the Red Cross online session invitation and their certification. If your child does not have their own email, you can use a parent/guardian email during registration. Just make sure you can access it to complete the online session and receive certification materials.",
  },
];

export default function StudentInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex items-center gap-3 mb-3">
            <Waves className="h-8 w-8" />
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              YMCA Aquatics
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Lifeguard Certification
          </h1>
          <p className="mt-2 text-blue-100 text-lg">
            Everything you need to know before, during, and after your course.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {/* Table of Contents */}
        <Card className="mb-8 sticky top-4 z-10 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Quick Navigation
            </p>
            <nav className="flex flex-wrap gap-2">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Section 1: Course Overview */}
        <section id="overview" className="mb-8 scroll-mt-24">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <CardTitle>Course Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Your path to certification involves four steps. Complete each one
                in order to earn your Red Cross Lifeguard Certification.
              </p>

              {/* Timeline Stepper */}
              <div className="relative">
                {TIMELINE_STEPS.map((item, index) => (
                  <div key={item.step} className="flex gap-4 pb-8 last:pb-0">
                    {/* Connector line + circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                          "bg-blue-600 text-white"
                        )}
                      >
                        {item.step}
                      </div>
                      {index < TIMELINE_STEPS.length - 1 && (
                        <div className="w-0.5 grow bg-blue-200 mt-2" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pt-1.5">
                      <h3 className="font-semibold text-base">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Prerequisite Swim Test */}
        <section id="swim-test" className="mb-8 scroll-mt-24">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-blue-600" />
                <CardTitle>Prerequisite Swim Test</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Before your class begins, you must pass a prerequisite swim test
                to demonstrate water competency. This test is conducted at the
                YMCA pool.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Waves className="h-4 w-4 text-blue-600" />
                    What to Practice
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      Treading water
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                      Distance swim (continuous)
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    How to Schedule
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Contact the YMCA front desk to schedule your swim test
                    appointment. Walk-ins may be available but are not
                    guaranteed.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h4 className="font-semibold text-sm mb-2">Important Details</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0">Timing:</span>
                    Must be completed at least 3 days before your class start
                    date.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0">Validity:</span>
                    Swim test results are valid for up to 30 days.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0">Attempts:</span>
                    Unlimited attempts if there is no waitlist for your class.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-medium text-foreground shrink-0">Waitlist:</span>
                    If a waitlist exists, students who do not pass must transfer
                    to a future session.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Online Session — VISUALLY PROMINENT */}
        <section id="online-session" className="mb-8 scroll-mt-24">
          <Card className="border-amber-300 border-2">
            <CardHeader className="bg-amber-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-amber-600" />
                <CardTitle>The Online Session</CardTitle>
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 ml-auto">
                  Important
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Warning callout */}
              <div className="rounded-lg bg-amber-50 border-2 border-amber-400 p-4 flex gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    THIS IS NOT THE eBOOK
                  </p>
                  <p className="text-sm text-amber-800 mt-1">
                    A common mistake is completing the eBook instead of the
                    online session. These are two different things. The eBook is
                    a reference resource. The online session is the interactive
                    course you must complete before your in-person class.
                  </p>
                </div>
              </div>

              <h4 className="font-semibold text-sm">
                Step-by-step instructions:
              </h4>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    1
                  </span>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Look for an email from the Red Cross
                    </span>{" "}
                    after you register. This email contains your access link for
                    the online session.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    2
                  </span>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Log in and access the online session
                    </span>{" "}
                    (NOT the eBook). Make sure you select the correct course
                    module.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    3
                  </span>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Complete the entire online session.
                    </span>{" "}
                    It includes videos, quizzes, and scenario-based activities.
                    Estimated time: approximately 2&ndash;3 hours.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    4
                  </span>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Save your completion confirmation.
                    </span>{" "}
                    You may need to show proof of completion at the start of your
                    in-person class.
                  </p>
                </li>
              </ol>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                <p className="font-medium">
                  Common mistake: doing the eBook instead of the online session.
                </p>
                <p className="mt-1">
                  If you only completed the eBook, you have not fulfilled the
                  prerequisite. Go back to the Red Cross portal and locate the
                  interactive online session.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: What to Bring */}
        <section id="what-to-bring" className="mb-8 scroll-mt-24">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Backpack className="h-5 w-5 text-blue-600" />
                <CardTitle>What to Bring</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  { item: "Photo ID", note: "Government-issued or school ID" },
                  { item: "Swimsuit", note: "Athletic/practical swimwear" },
                  { item: "Towel", note: null },
                  {
                    item: "Course-specific materials",
                    note: "If any were listed in your registration confirmation",
                  },
                  {
                    item: "Water bottle",
                    note: "Stay hydrated throughout the day",
                  },
                ].map((entry) => (
                  <li key={entry.item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-sm">{entry.item}</span>
                      {entry.note && (
                        <span className="text-sm text-muted-foreground">
                          {" "}
                          &mdash; {entry.note}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-4 flex gap-3">
                <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Arrive 15 minutes early</span>{" "}
                  to check in, change, and get situated before class begins.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Cancellation & Refund Policy */}
        <section id="cancellation" className="mb-8 scroll-mt-24">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <CardTitle>Cancellation &amp; Refund Policy</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cancellation Deadline</p>
                    <p className="text-sm text-muted-foreground">
                      Cancellations must be made at least 7 days before your
                      class start date.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Refund Processing</p>
                    <p className="text-sm text-muted-foreground">
                      Contact the SGA office or the YMCA front desk to initiate
                      your refund. Refunds are processed through the original
                      payment method.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 6: FAQ (Accordion) */}
        <section id="faq" className="mb-8 scroll-mt-24">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <CardTitle>Frequently Asked Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {FAQ_ITEMS.map((faq, index) => (
                  <details
                    key={index}
                    className="group py-4 first:pt-0 last:pb-0"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-sm hover:text-blue-600 transition-colors list-none [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 7: Contact */}
        <section id="contact" className="mb-12 scroll-mt-24">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <CardTitle>Contact Us</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Have questions or need help? Reach out to the YMCA Aquatics
                department.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href="mailto:aquatics@ymca.org"
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-blue-600">aquatics@ymca.org</p>
                  </div>
                </a>
                <a
                  href="tel:+15551234567"
                  className="flex items-center gap-3 rounded-lg border p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-blue-600">(555) 123-4567</p>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pb-8">
          <p>YMCA Aquatics &mdash; Lifeguard Certification Program</p>
        </footer>
      </main>
    </div>
  );
}
