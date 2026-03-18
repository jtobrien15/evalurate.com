import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface StudentInfoRequestEmailProps {
  parentName: string;
  studentFirstName: string;
  studentLastName: string;
  courseName: string;
  startDate: string;
  location: string;
}

export default function StudentInfoRequestEmail({
  parentName,
  studentFirstName,
  studentLastName,
  courseName,
  startDate,
  location,
}: StudentInfoRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Action Needed: Student Information for {courseName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={h1}>Action Needed: Student Information</Heading>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>Hi {parentName},</Text>

            <Text style={text}>
              We noticed the registration for <strong>{courseName}</strong> on{" "}
              <strong>{startDate}</strong> at <strong>{location}</strong> may be
              under your name rather than the student&apos;s name.
            </Text>

            <Heading as="h2" style={h2}>
              Why This Matters
            </Heading>
            <Text style={text}>
              We need the actual student&apos;s information because:
            </Text>
            <Section style={reasonsBox}>
              <Text style={reasonItem}>
                1. The Red Cross online session invitation will be sent to this
                email
              </Text>
              <Text style={reasonItem}>
                2. The certification will be issued in this name
              </Text>
              <Text style={reasonItem}>
                3. The student needs to bring matching photo ID to class
              </Text>
            </Section>

            <Hr style={hr} />

            <Heading as="h2" style={h2}>
              Please Reply With the Following
            </Heading>
            <Text style={text}>
              Please reply to this email with the following information for the
              student who will be attending:
            </Text>
            <Section style={fieldsBox}>
              <Text style={fieldItem}>Student First Name:</Text>
              <Text style={fieldItem}>Student Last Name:</Text>
              <Text style={fieldItem}>Student Email Address:</Text>
              <Text style={fieldItem}>Student Date of Birth:</Text>
              <Text style={fieldItem}>Student Phone Number (optional):</Text>
            </Section>

            <Hr style={hr} />

            <Text style={noteText}>
              If <strong>{studentFirstName} {studentLastName}</strong> IS the
              student attending, no action is needed — you can ignore this email.
            </Text>

            <Hr style={hr} />

            <Text style={muted}>YMCA Aquatics Department</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
};

const headerSection: React.CSSProperties = {
  backgroundColor: "#2563eb",
  padding: "32px 40px",
};

const h1: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const h2: React.CSSProperties = {
  color: "#1e293b",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const contentSection: React.CSSProperties = {
  padding: "32px 40px",
};

const text: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const reasonsBox: React.CSSProperties = {
  backgroundColor: "#fef3c7",
  borderRadius: "6px",
  padding: "16px 24px",
  margin: "8px 0 16px 0",
};

const reasonItem: React.CSSProperties = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 4px 0",
};

const fieldsBox: React.CSSProperties = {
  backgroundColor: "#f0f7ff",
  borderRadius: "6px",
  padding: "20px 24px",
  margin: "8px 0 16px 0",
};

const fieldItem: React.CSSProperties = {
  color: "#1e293b",
  fontSize: "15px",
  fontWeight: "500",
  margin: "0 0 8px 0",
};

const noteText: React.CSSProperties = {
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
  backgroundColor: "#f0fdf4",
  borderRadius: "6px",
  padding: "16px 24px",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const muted: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0",
};
