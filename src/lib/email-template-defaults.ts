/**
 * Default email templates and their variable definitions.
 * Used for seeding the database and for the template editor.
 */

export const TEMPLATE_VARIABLES: Record<string, string[]> = {
  E1: ["studentName", "courseType", "startDate", "endDate", "scheduleDetails", "location"],
  E2: ["studentName", "courseType", "startDate", "prereqDeadline"],
  E3: ["studentName", "courseType", "canRetry"],
  E4: ["studentName", "courseType", "availableClasses"],
  E7: ["studentName", "courseType", "startDate", "location", "daysBefore"],
  E14: ["studentName", "parentName", "courseType"],
};

export const SAMPLE_DATA: Record<string, Record<string, string>> = {
  E1: {
    studentName: "Jane Smith",
    courseType: "Lifeguarding",
    startDate: "Sat, Mar 28, 2026",
    endDate: "Sun, Mar 29, 2026",
    scheduleDetails: "Fri 5-9pm, Sat-Sun 8am-6pm",
    location: "Emilson YMCA",
  },
  E2: {
    studentName: "Jane Smith",
    courseType: "Lifeguarding",
    startDate: "Sat, Mar 28, 2026",
    prereqDeadline: "Wed, Mar 25, 2026",
  },
  E3: {
    studentName: "Jane Smith",
    courseType: "Lifeguarding",
    canRetry: "true",
  },
  E4: {
    studentName: "Jane Smith",
    courseType: "Lifeguarding",
    availableClasses: "• Apr 11-12 at Emilson YMCA (3 spots)\n• Apr 25-26 at Hale YMCA (5 spots)",
  },
  E7: {
    studentName: "Jane Smith",
    courseType: "Lifeguarding",
    startDate: "Sat, Mar 28, 2026",
    location: "Emilson YMCA",
    daysBefore: "3",
  },
  E14: {
    studentName: "Jane Smith",
    parentName: "John Smith",
    courseType: "Lifeguarding",
  },
};

export const DEFAULT_TEMPLATES = [
  {
    templateId: "E1",
    name: "Welcome / Registration Confirmed",
    subject: "Registration Confirmed — {{courseType}}",
    body: `Hi {{studentName}},

You have been successfully registered for {{courseType}}. Here are your class details:

Course: {{courseType}}
Dates: {{startDate}} – {{endDate}}
Schedule: {{scheduleDetails}}
Location: {{location}}

IMPORTANT: Prerequisite Swim Test
You must complete your prerequisite swim test at least 3 days before class starts. Please contact your local YMCA branch to schedule your swim test as soon as possible.

Online Session Reminder
This course includes an online learning component. You will receive a separate email with access to the Red Cross online session. Please complete all online modules before your first in-person class day.

IMPORTANT: The online session is NOT the eBook. The online session is a separate, required component that you must complete before class.

If you have any questions, please contact the Aquatics Department at your YMCA branch.`,
  },
  {
    templateId: "E2",
    name: "Prereq Reminder",
    subject: "Action Required: Schedule Your Swim Test — {{courseType}}",
    body: `Hi {{studentName}},

This is a reminder that you still need to schedule your prerequisite swim test for {{courseType}}.

Your class starts on {{startDate}} and the swim test must be completed by {{prereqDeadline}}.

What you need to do:
1. Contact your YMCA branch to schedule a swim test
2. Complete the test before the deadline
3. Results will be recorded automatically

The swim test includes:
• 300-yard continuous swim (front crawl and breaststroke)
• Treading water for 2 minutes using legs only
• Timed swim: 20 yards, surface dive to 7-10 feet, retrieve a 10 lb object, return, exit without a ladder

Please schedule your test as soon as possible to secure your spot in the class.`,
  },
  {
    templateId: "E3",
    name: "Prereq Failed",
    subject: "Prerequisite Update — {{courseType}}",
    body: `Hi {{studentName}},

We're writing to let you know about your prerequisite swim test results for {{courseType}}.

Unfortunately, you did not pass the prerequisite swim test at this time.

If you are able to retry, you can schedule another attempt. Contact your YMCA branch to reschedule.

If a retry is not available, our team will contact you with transfer options to a future class. We want to make sure you have every opportunity to succeed.

Practice tips:
• Focus on endurance for the 300-yard swim
• Practice treading water using only your legs
• Work on your surface diving technique

If you have any questions, please contact the Aquatics Department.`,
  },
  {
    templateId: "E4",
    name: "Transfer Options",
    subject: "Transfer Options Available — {{courseType}}",
    body: `Hi {{studentName}},

We have transfer options available for your {{courseType}} enrollment.

Available classes:
{{availableClasses}}

To transfer, please contact the Aquatics Department and let them know which class you'd like to join. Transfers are first-come, first-served based on availability.

Your prerequisite swim test results and any online coursework will carry over to your new class.

If none of these options work for you, please let us know and we can discuss other arrangements.`,
  },
  {
    templateId: "E7",
    name: "Class Reminder",
    subject: "Class Starts in {{daysBefore}} Days — {{courseType}}",
    body: `Hi {{studentName}},

Your {{courseType}} class is starting soon!

Date: {{startDate}}
Location: {{location}}

Checklist for class day:
✓ Bring a valid photo ID
✓ Arrive 15 minutes early
✓ Bring a swimsuit and towel
✓ Complete all online modules beforehand
✓ Bring any required course materials
✓ Stay hydrated — bring a water bottle

If you need to cancel or have any questions, please contact the Aquatics Department as soon as possible.

We look forward to seeing you!`,
  },
  {
    templateId: "E14",
    name: "Student Info Request",
    subject: "Action Needed: Confirm Student Information",
    body: `Hi {{parentName}},

We noticed that the registration information for {{studentName}}'s upcoming {{courseType}} class may need to be updated.

To ensure we have accurate records, please confirm or update the following:
• Student's legal first and last name
• Student's date of birth
• Student's email address
• Emergency contact information

Having accurate information is important for:
• Red Cross certification (must match a government-issued ID)
• Emergency contact during class
• Communication about class updates

Please reply to this email with any corrections, or let us know if the current information is correct.

Thank you!`,
  },
];
