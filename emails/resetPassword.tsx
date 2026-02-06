import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

import { Tailwind, pixelBasedPreset } from "@react-email/tailwind";

interface DropboxResetPasswordEmailProps {
  userFirstname?: string;
  resetPasswordLink?: string;
}

export const DropboxResetPasswordEmail = ({
  userFirstname,
  resetPasswordLink,
}: DropboxResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#007291",
              },
            },
          },
        }}
      >
        <Body className="bg-[#f6f9fc] font-sans py-2.5">
          <Preview>Dropbox reset your password</Preview>

          <Container className="bg-white border border-solid border-[#f0f0f0] p-[45px]">
            <Text className="text-2xl font-bold text-zinc-900">
              CrestInEnglish.
            </Text>

            <Section>
              <Text>Hi {userFirstname},</Text>

              <Text>
                Someone recently requested a password change for your Crest
                account.
              </Text>

              <Button
                className="bg-black flex items-center justify-center text-center gap-2  rounded-md text-white text-[15px] w-[210px] py-[14px]"
                href={resetPasswordLink}
              >
                Reset password
              </Button>

              <Text>If you didn&apos;t request this, ignore this email.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

DropboxResetPasswordEmail.PreviewProps = {
  userFirstname: "Alan",
  resetPasswordLink: "https://www.dropbox.com",
};

export default DropboxResetPasswordEmail;
