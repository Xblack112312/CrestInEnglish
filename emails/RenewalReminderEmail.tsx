import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Button,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface RenewalReminderEmailProps {
  userName?: string;
  courseName?: string;
  renewUrl: string;
  subscriptionStartDate?: string;
}

export default function RenewalReminderEmail({
  userName,
  courseName,
  renewUrl,
  subscriptionStartDate,
}: RenewalReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            Subscription Reminder
          </Heading>

          <Text style={text}>
            Hi {userName ?? "there"},
          </Text>

          <Text style={text}>
            This is a friendly reminder that your subscription
            {courseName ? ` for ${courseName}` : ""} started on{" "}
            {subscriptionStartDate
              ? new Date(subscriptionStartDate).toDateString()
              : "last month"}.
          </Text>

          <Text style={text}>
            To continue your access without interruption, please repeat
            the process by clicking the button below.
          </Text>

          <Button style={button} href={renewUrl}>
            Renew / Repeat Process
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            If you’ve already completed the renewal, you can safely ignore
            this email.
          </Text>

          <Text style={footer}>
            — Crest in English Support Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/* ===================== styles ===================== */

const main: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "32px",
  borderRadius: "8px",
  maxWidth: "520px",
};

const heading: React.CSSProperties = {
  fontSize: "22px",
  marginBottom: "16px",
};

const text: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#333",
};

const button: React.CSSProperties = {
  display: "inline-block",
  marginTop: "20px",
  marginBottom: "20px",
  padding: "12px 20px",
  backgroundColor: "#000",
  color: "#fff",
  fontSize: "14px",
  borderRadius: "6px",
  textDecoration: "none",
};

const hr: React.CSSProperties = {
  margin: "24px 0",
};

const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#666",
};
