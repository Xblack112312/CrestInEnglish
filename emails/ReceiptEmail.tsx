import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  pixelBasedPreset,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export const NikeReceiptEmail = ({ orderId, orderdate }: { orderId: string; orderdate: string }) => (
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
      <Body className="bg-white font-sans font-nike">
        <Preview>
          Get your Enrollment Summary
        </Preview>
        <Container className="my-[10px] mx-auto w-[600px] max-w-full border border-[#E5E5E5]">
          <Section className="py-[22px] px-10 bg-[#F7F7F7]">
            <Row>
              <Column>
                <Text className="m-0 text-[14px] leading-[2] font-bold">
                  Tracking Number
                </Text>
                <Text className="mt-3 mb-0 font-medium text-[14px] leading-[1.4] text-[#6F6F6F]">
                  1ZV218970300071628
                </Text>
              </Column>
              <Column align="right">
                <Link className="border border-solid border-[#929292] text-[16px] no-underline py-[10px] px-0 w-[220px] block text-center font-medium text-black">
                  Track Status
                </Link>
              </Column>
            </Row>
          </Section>
          <Hr className="border-[#E5E5E5] m-0" />
          <Section className="py-10 px-[74px] text-center">
            <Text className="text-[45px] font-semibold text-black ">
              Crest in English.
            </Text>
            <Heading className="text-[32px] leading-[1.3] font-bold text-center -tracking-[1px]">
              It's Under Review.
            </Heading>
            <Text className="m-0 text-[14px] leading-[2] text-[#747474] font-medium">
              Your enrollment is under review we'll let you know when everything done
            </Text>
            <Text className="m-0 text-[14px] leading-[2] text-[#747474] font-medium mt-6">
              Now, We're Checking on your payment see if there is any problem, and also We're checking on your information, don't worry when we finish you'll know.
            </Text>
          </Section>
          <Hr className="border-[#E5E5E5] m-0" />
          <Section className="py-[22px] px-10">
            <Text className="m-0 text-[15px] leading-[2] font-bold">
              Checking in: Payment
            </Text>
            <Text className="m-0 text-[14px] leading-[2] text-[#747474] font-medium">
              Payment Method, Vodafone cash
            </Text>
          </Section>
          <Hr className="border-[#E5E5E5] m-0" />
          <Section className="py-[22px] px-10">
            <Row className="inline-flex mb-10">
              <Column className="w-[170px]">
                <Text className="m-0 text-[14px] leading-[2] font-bold">
                 Enrollment Number
                </Text>
                <Text className="mt-3 mb-0 font-medium text-[14px] leading-[1.4] text-[#6F6F6F]">
                  C0106373851
                </Text>
              </Column>
              <Column>
                <Text className="m-0 text-[14px] leading-[2] font-bold">
                  Order Date
                </Text>
                <Text className="mt-3 mb-0 font-medium text-[14px] leading-[1.4] text-[#6F6F6F]">
                  Sep 22, 2022
                </Text>
              </Column>
            </Row>
            <Row>
              <Column align="center">
                <Link className="border border-[#929292] no-underline py-[10px] px-0 w-[220px] text-[16px] block text-center font-medium text-black">
                  Order Status
                </Link>
              </Column>
            </Row>
          </Section>

          <Hr className="border-[#E5E5E5] m-0" />
          <Section className="py-[22px]">
            <Row>
              <Text className="text-[32px] leading-[1.3] font-bold text-center -tracking-[1px]">
                crestinenglish.vercel.app{" "}
              </Text>
            </Row>
          </Section>
          <Hr className="border-[#E5E5E5] m-0 mt-3" />
          <Section className="py-[22px]">
            <Row className="w-[166px] mx-auto">
              <Column>
                <Text className="m-0 text-[#AFAFAF] text-[13px] text-center">
                  Web Version
                </Text>
              </Column>
              <Column>
                <Text className="m-0 text-[#AFAFAF] text-[13px] text-center">
                  Privacy Policy
                </Text>
              </Column>
            </Row>
            <Row>
              <Text className="m-0 text-[#AFAFAF] text-[13px] text-center py-[30px]">
                Please contact us if you have any questions. (If you reply to
                this email, we won't be able to see it.)
              </Text>
            </Row>
            <Row>
              <Text className="m-0 text-[#AFAFAF] text-[13px] text-center">
                © {new Date().getFullYear()} Nike, Inc. All Rights Reserved.
              </Text>
            </Row>
            <Row>
              <Text className="m-0 text-[#AFAFAF] text-[13px] text-center">
                Crest In English, Egypt - Cairo & 11742
              </Text>
            </Row>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default NikeReceiptEmail;
