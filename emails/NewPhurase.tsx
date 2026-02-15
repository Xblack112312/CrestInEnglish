import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface LinearLoginCodeEmailProps {
  validationCode?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const LinearLoginCodeEmail = ({
  validationCode,
}: LinearLoginCodeEmailProps) => (
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
      <Body className="bg-white font-sans font-linear">
        <Preview>New Enrollment</Preview>
        <Container className="mx-auto my-0 max-w-[560px] px-0 pt-5 pb-12">
          <Text className="text-[45px] font-semibold text-black ">
            Crest in English.
          </Text>
          <Heading className="text-[24px] tracking-[-0.5px] leading-[1.3] font-normal text-[#484848] pt-[17px] px-0 pb-0">
            Tasko+ Service Detected A New Order of new Enrollment
          </Heading>
          <Section className="py-[27px] px-0">
            <Button
              className="bg-[#5e6ad2] rounded font-semibold text-white text-[15px] no-underline text-center block py-[11px] px-[23px]"
              href={`${baseUrl}/dashboard/enrollments`}
            >
               Enrollments
            </Button>
          </Section>
          <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px] text-[#3c4149]">
            Please Go To Enrollment Dashboard page to see all details you need to know about this sale before accept it or reject it focus before do any action. Powered By Tasko+ Service.
          </Text>
          <code className="font-mono font-bold px-1 py-px bg-[#dfe1e4] text-[#3c4149] text-[21px] tracking-[-0.3px] rounded">
            {validationCode}
          </code>
          <Hr className="border-[#dfe1e4] mt-[42px] mb-[26px]" />
          <Link
            href={baseUrl}
            className="text-[#b4becc] text-[14px]"
          >
            Crest In English.
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

LinearLoginCodeEmail.PreviewProps = {
  validationCode: "tt226-5398x",
} as LinearLoginCodeEmailProps;

export default LinearLoginCodeEmail;
