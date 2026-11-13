// src/pages/other/PolicyPage.jsx
import { useLocation, Link } from "react-router-dom";
import LayoutOne from "../../layouts/LayoutOne";

const DARK = "#720E1E";
const GOLD = "#C59B27";
const MUTED = "#555";

const policies = {
  "shipping-policy": {
    title: "Shipping Policy",
    icon: "🚚",
    tagline: "Fast, safe, and reliable delivery across India",
    sections: [
      {
        heading: "Order Processing Time",
        content: `All orders placed on Vika Vasthra are processed within 1–2 business days of successful payment confirmation. Orders placed on weekends or public holidays will be processed on the next working business day. You will receive an email or SMS notification once your order has been confirmed and is being prepared for dispatch.`,
      },
      {
        heading: "Delivery Timeframe",
        content: `Standard delivery across Tamil Nadu takes 2 – 4 days and south India takes 3 - 5 days and north India 7 - 10 days from the date of dispatch. Delivery to remote or rural areas may take an additional 2–3 business days due to logistics limitations. During festive seasons such as Diwali, Pongal, and wedding season, delivery timelines may be slightly extended due to high order volumes.`,
      },
      {
        heading: "Shipping Charges",
        content: `We offer shipping chage for Tamil Nadu - 40 Rs and other states 70 Rs is applicable.For bulk or wholesale orders, customised shipping arrangements can be made by contacting our team directly at vikram.25feb@gmail.com or WhatsApp - +91 9482944552`,
      },
      {
        heading: "Packaging",
        content: `At Vika Vasthra, we believe that unboxing a saree should feel like receiving a gift. Every order is carefully folded or box depending on the product. Sarees are packed to prevent wrinkling, colour transfer, and damage during transit. We use eco-friendly packaging materials wherever possible as part of our commitment to sustainability.`,
      },
      {
        heading: "Order Tracking",
        content: `Once your order is shipped, you will receive a tracking number via SMS or email within 24 hours of dispatch. You can use the tracking number directly on the courier partner's website. If you have not received tracking details within 48 hours of your order being confirmed, please contact us.`,
      },
      {
        heading: "Delivery Partners",
        content: `We ship through India's most trusted courier partners including Tamil Nadu - Professional couriers and India Post depending on your location and order size. Our logistics team selects the most reliable carrier for your pin code to ensure timely delivery. And for other states we use India Post`,
      },
      {
        heading: "Cash on Delivery (COD)",
        content: `Temporary not available`,
      },
      {
        heading: "Undelivered & Returned Shipments",
        content: `If a delivery attempt is made and no one is available at the address, the courier partner will make up to 2 additional attempts on subsequent days. After 3 failed attempts, the parcel will be returned to our warehouse. In such cases, re-delivery charges will apply. If the product is returned to us due to an incorrect address provided by the customer, the customer will bear both the return and re-delivery shipping costs.`,
      },
      {
        heading: "Damaged in Transit",
        content: `In the rare event that your saree arrives damaged due to transit, please do not accept the package if the outer box or parcel is visibly torn or tampered with. If damage is noticed after opening, take clear photographs immediately and email us at support@Vika Vasthra2020@gmail.com within 24 hours of delivery with your order ID and photos. We will arrange a replacement or full refund at no additional cost.
        Note - Video of parcel opening is mandatory for return or exchange request`,
      },
      {
        heading: "International Shipping",
        content: `Currently, Vika Vasthra ships exclusively within India. We are actively working on enabling international shipping using whatsapp for worldwide shipment. If you are an international customer, please direct whatsapp message or support@support@vikavasthra.com`,
      },
    ],
  },

  "return-policy": {
    title: "Return & Exchange Policy",
    icon: "🔄",
    tagline: "Hassle-free returns and exchanges within 7 days",
    sections: [
      {
        heading: "Return Window",
        content: `We accept return requests within 7 days of the delivery date. To be eligible for a return if any damage or torn, the saree must be in its original, unused, and unwashed condition with all original tags, labels, and packaging intact. Products that show signs of use, alteration, dry cleaning, or washing will not be accepted for return under any circumstances. We recommend inspecting your saree immediately upon delivery.`,
      },
      {
        heading: "Eligible Return Reasons",
        content: `Returns are accepted for the following reasons only: (1) The product received is physically damaged or has a manufacturing defect such as torn fabric (2) A completely wrong product was delivered (3) Significant colour misrepresentation where the actual product differs noticeably from the online image under natural lighting. Minor variations in shade due to photography lighting or screen settings are not considered valid return reasons.`,
      },
      {
        heading: "How to Initiate a Return",
        content: `To initiate a return: (1) Log in to your Vika Vasthra account. (2) Go to "My Orders" and select the relevant order. (3) Click "Request Return" and provide the reason along with clear photographs of the product. (4) Our customer support team will review your request within 24–48 hours and provide approval along with a return pickup date. Do not ship the product back on your own without receiving prior approval from our team.`,
      },
      {
        heading: "Return Pickup",
        content: `Once your return is approved, we will provide return address for returning. Please ensure the product is repackaged securely in its original or similar packaging before booking in India Post (or) Nearest Courier`,
      },
      {
        heading: "Exchange Policy",
        content: `We exchange within 7 days of delivery, subject to stock availability. If you wish to exchange for a different colour, raise an exchange request through "My Orders".Exchange for a completely different product is treated as a return and new order placement.`,
      },
      {
        heading: "Non-Returnable Items",
        content: `The following items are strictly not eligible for return or exchange: (1) Customised, stitched, or altered sarees. (2) Items purchased during clearance, end-of-season, or final sale events marked as "non-returnable". (3) Products that have been worn, washed, dry-cleaned, or used. (4) Items returned without prior approval from our customer support team. (5) Products where original tags or packaging have been removed or tampered with.`,
      },
      {
        heading: "Cancellation Policy",
        content: `Orders can be cancelled free of charge within 30 Mins of placement by contacting us at supportVika Vasthra2020@gmail.com or through "My Orders". Once the order has been dispatched, cancellation is no longer possible.`,
      },
    ],
  },

  "privacy-policy": {
    title: "Privacy Policy",
    icon: "🔒",
    tagline: "Your data is safe with us — always",
    sections: [
      {
        heading: "Introduction",
        content: `At Vika Vasthra, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, store, and protect the data you provide when you visit our website or place an order. By using Vika Vasthra, you consent to the practices described in this policy. We encourage you to read this document carefully.`,
      },
      {
        heading: "Information We Collect",
        content: `We collect the following categories of information: (1) Personal identification information — your full name, email address, phone number, and date of birth if provided. (2) Delivery and billing information — shipping address, billing address, and pin code. (3) Payment information — we collect only the last 4 digits of cards for reference; full payment data is processed securely through our payment gateway. (4) Browsing data — pages visited, products viewed, time spent on pages, and device type, collected via cookies and analytics tools. (5) Order history — details of all past purchases, returns, and wishlist activity.`,
      },
      {
        heading: "How We Use Your Information",
        content: `Your information is used for the following purposes: (1) Processing and fulfilling your orders including dispatch, tracking, and delivery coordination. (2) Sending transactional communications such as order confirmations, shipping updates, and return notifications. (3) Customer support — resolving queries, complaints, and return/exchange requests. (4) Personalising your shopping experience, including product recommendations based on browsing history. (5) Sending promotional emails, offers, and new collection announcements — only if you have opted in to marketing communications. (6) Fraud detection, security monitoring, and prevention of unauthorised access. (7) Analysing website traffic and user behaviour to improve our platform.`,
      },
      {
        heading: "Data Storage & Retention",
        content: `Your personal data is stored on secure servers hosted in India. We retain your data for as long as your account is active or as required to provide our services. Order history is retained for a minimum of 3 years for legal and accounting purposes. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.`,
      },
      {
        heading: "Data Security",
        content: `We implement industry-standard security measures to protect your personal information from unauthorised access, disclosure, alteration, or destruction. All data transmission between your browser and our servers is encrypted using 256-bit SSL (Secure Socket Layer) technology. Our servers are protected by firewalls and undergo regular security audits. Payment transactions are processed through RBI-compliant, PCI-DSS certified payment gateways such as Razorpay. We do not store full card details on our servers.`,
      },
      {
        heading: "Cookies & Tracking",
        content: `We use first-party and third-party cookies to enhance your shopping experience. Types of cookies used include: (1) Essential cookies — required for basic website functionality such as your shopping cart and login sessions. (2) Analytics cookies — help us understand how visitors interact with our website (e.g., Google Analytics). (3) Marketing cookies — used to show you relevant advertisements on other platforms. You can manage cookie preferences through your browser settings. Disabling certain cookies may affect website functionality.`,
      },
      {
        heading: "Third-Party Sharing",
        content: `We do not sell, rent, or trade your personal data to third parties for commercial purposes. We share limited data only with trusted service providers who are contractually bound to maintain confidentiality: (1) Courier and logistics partners for delivery purposes. (2) Payment gateway providers for processing transactions. (3) SMS and email service providers for transactional notifications. (4) Analytics platforms to analyse website performance. All third-party partners are required to comply with applicable data protection laws.`,
      },
      {
        heading: "Your Rights",
        content: `As a user of Vika Vasthra, you have the following rights regarding your personal data: (1) Right to access — request a copy of the personal data we hold about you. (2) Right to correction — update or correct inaccurate information in your account settings. (3) Right to deletion — request that we delete your personal data, subject to legal obligations. (4) Right to opt out — unsubscribe from marketing communications at any time using the unsubscribe link in emails or by contacting us. (5) Right to data portability — request your data in a machine-readable format. To exercise any of these rights, contact us at supportVika Vasthra2020@gmail.com.`,
      },
      {
        heading: "Children's Privacy",
        content: `Vika Vasthra is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data without parental consent, we will delete that information immediately. Parents or guardians who believe their child has submitted personal information to us should contact us at supportVika Vasthra2020@gmail.com.`,
      },
      {
        heading: "Changes to This Policy",
        content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make significant changes, we will notify you via email or a prominent notice on our website. The date of the last update is always displayed at the top of this page. We encourage you to review this policy periodically to stay informed.`,
      },
    ],
  },

  "terms": {
    title: "Terms & Conditions",
    icon: "📋",
    tagline: "Please read these terms carefully before using our platform",
    sections: [
      {
        heading: "Acceptance of Terms",
        content: `By accessing, browsing, or using the Vika Vasthra website (vikavasthra.com) and mobile platform, or by placing an order with us, you acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions. If you do not accept any part of these terms, you must immediately discontinue the use of our platform and services. These terms apply to all visitors, registered users, and customers of Vika Vasthra.`,
      },
      {
        heading: "Eligibility",
        content: `You must be at least 18 years of age to create an account, place orders, or use our services. By using Vika Vasthra, you represent and warrant that you are 18 years or older and have the legal capacity to enter into a binding agreement. If you are accessing the platform on behalf of a business or organisation, you confirm that you have the authority to bind that entity to these terms.`,
      },
      {
        heading: "Account Registration",
        content: `To access personalised features such as order history, wishlist, and returns, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and up-to-date information during registration. Vika Vasthra reserves the right to suspend or terminate accounts that provide false information or violate these terms. Please notify us immediately at supportVika Vasthra2020@gmail.com if you suspect any unauthorised access to your account.`,
      },
      {
        heading: "Product Descriptions & Accuracy",
        content: `We make every reasonable effort to display saree colours, textures, weave patterns, and measurements as accurately as possible through high-quality photography. However, due to variations in monitor settings, screen resolution, and lighting conditions during photography, the actual product may differ slightly in colour from what appears online. These minor variations are not considered defects. We reserve the right to correct any errors in product descriptions, pricing, or availability at any time without prior notice.`,
      },
      {
        heading: "Pricing & Taxes",
        content: `All prices on Vika Vasthra are displayed in Indian Rupees (RS) and will applicable GST (Goods and Services Tax) as per Indian tax laws. The prices displayed at the time of checkout are the final prices. We reserve the right to change product prices at any time without prior notice. Price changes will not affect orders that have already been placed and confirmed. In the event of a pricing error, we will contact you before processing your order.`,
      },
      {
        heading: "Payment Terms",
        content: `Full payment must be completed at the time of placing the order through one of our accepted payment methods — credit/debit cards, UPI, net banking, wallets, or Cash on Delivery (where available). All online payments are processed through secure, encrypted payment gateways. Vika Vasthra does not store your complete card or payment details. If a payment is declined, your order will not be confirmed and you will be notified to retry.`,
      },
      {
        heading: "Order Confirmation & Acceptance",
        content: `Placing an order on Vika Vasthra constitutes an offer to purchase. Your order is confirmed only after you receive an official order confirmation email from us with a unique order ID. We reserve the right to cancel or refuse any order at our discretion — including cases of pricing errors, product unavailability, suspected fraud, or delivery constraints. In such cases, a full refund will be processed immediately.`,
      },
      {
        heading: "Intellectual Property",
        content: `All content on the Vika Vasthra platform — including but not limited to product photographs, saree descriptions, brand name, logo, website design, graphics, text, and UI elements — is the exclusive intellectual property of Vika Vasthra or its licensors and is protected under Indian and international copyright, trademark, and intellectual property laws. You may not reproduce, distribute, modify, sell, or use any content from this platform for commercial or non-commercial purposes without prior written permission from Vika Vasthra.`,
      },
      {
        heading: "User Conduct",
        content: `By using Vika Vasthra, you agree not to: (1) Use the platform for any unlawful, fraudulent, or abusive purpose. (2) Submit false, misleading, or defamatory product reviews. (3) Attempt to gain unauthorised access to our systems, servers, or databases. (4) Interfere with or disrupt the normal operation of the website. (5) Use automated bots, scrapers, or similar tools to extract data from our platform. (6) Impersonate another user, customer, or Vika Vasthra representative. Violation of these conduct rules may result in immediate account suspension and legal action.`,
      },
      {
        heading: "Reviews & User-Generated Content",
        content: `By submitting a product review, comment, or any other content on Vika Vasthra, you grant us a non-exclusive, royalty-free, perpetual licence to use, display, and reproduce that content on our platform and marketing materials. You confirm that your review is honest, based on your genuine experience, and does not contain offensive, defamatory, or copyrighted content. We reserve the right to moderate, edit, or remove any content that violates our community guidelines.`,
      },
      {
        heading: "Limitation of Liability",
        content: `To the fullest extent permitted by applicable law, Vika Vasthra shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from your use of our products or platform, including but not limited to loss of profit, loss of data, or business interruption. Our total liability to you for any claim arising out of or related to a purchase shall not exceed the total amount paid by you for that specific order. We are not liable for delays or failures caused by circumstances beyond our reasonable control including natural disasters, strikes, or courier failures.`,
      },
      {
        heading: "Governing Law & Jurisdiction",
        content: `These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes, claims, or controversies arising in connection with these terms or your use of Vika Vasthra shall be subject to the exclusive jurisdiction of the competent courts located in Chennai, Tamil Nadu, India. Before initiating any legal proceedings, we encourage you to contact us to resolve disputes amicably through our customer support team.`,
      },
      {
        heading: "Modifications to Terms",
        content: `Vika Vasthra reserves the right to update, modify, or replace these Terms and Conditions at any time. Material changes will be communicated via email or a notice on our website. Your continued use of the platform after changes are posted constitutes your acceptance of the revised terms. We recommend reviewing these terms periodically.`,
      },
      {
        heading: "Contact Information",
        content: `For any questions, concerns, or clarifications regarding these Terms and Conditions, please contact us at: Email: vikram.25feb@gmail.com | Phone: +91 9482944552 | Address: Vika Vasthra, Vikraman.k, Murari Enclave, Maragondanahalli, Electronic City phase 1, Bangalore - 560100, Karnataka. We aim to respond to all queries within 24–48 business hours.`,
      },
    ],
  },
};

const PolicyPage = ({ shop }) => {
  const location = useLocation();
  const slug = location.pathname.replace(/^\//, "");
  const policy = policies[slug];

  const allPolicies = [
    { label: "Shipping Policy",    to: "/shipping-policy" },
    { label: "Return Policy",      to: "/return-policy" },
    { label: "Privacy Policy",     to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms" },
  ];

  if (!policy) {
    return (
      <LayoutOne shop={shop} headerTop="visible">
        <div style={{ textAlign: "center", padding: "100px 20px", color: MUTED }}>
          <h2>Page not found</h2>
        </div>
      </LayoutOne>
    );
  }

  return (
    <LayoutOne shop={shop} headerTop="visible">
      <div style={{ background: "#faf7f2", minHeight: "100vh" }}>

        {/* Hero Banner */}
        <div style={{
          background: DARK,
          padding: "60px 24px 50px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{policy.icon}</div>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            color: "#F8F6F2",
            fontFamily: "'Playfair Display', serif",
            margin: "0 0 12px",
          }}>
            {policy.title}
          </h1>
          <p style={{
            fontSize: 14,
            color: "#c8b89a",
            margin: "0 auto",
            maxWidth: 480,
            fontFamily: "'Jost', sans-serif",
            fontWeight: 300,
          }}>
            {policy.tagline}
          </p>
          <div style={{
            width: 50, height: 2,
            background: GOLD,
            margin: "20px auto 0",
            borderRadius: 2,
          }} />
        </div>

        {/* Policy Nav Tabs */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid #e7dfd2",
          overflowX: "auto",
        }}>
          <div style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "flex",
            padding: "0 24px",
          }}>
            {allPolicies.map((p) => {
              const isActive = location.pathname === p.to || location.pathname === `/${p.to}`;
              return (
                <Link
                  key={p.to}
                  to={p.to}
                  style={{
                    padding: "14px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'Jost', sans-serif",
                    color: isActive ? GOLD : "#777",
                    textDecoration: "none",
                    borderBottom: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
                    whiteSpace: "nowrap",
                    transition: "color 0.2s",
                  }}
                >
                  {p.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 100px", display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Sidebar TOC */}
          <div style={{
            flex: "0 0 220px",
            position: "sticky",
            top: 24,
            background: "#fff",
            border: "1px solid #e7dfd2",
            borderRadius: 8,
            padding: "20px",
            display: "none",
          }}
            className="policy-sidebar"
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>
              Contents
            </p>
            {policy.sections.map((s, i) => (
              // ✅ FIX 1: restored missing opening <a tag
              <a
                key={i}
                href={`#section-${i}`}
                style={{
                  display: "block",
                  fontSize: 12,
                  color: MUTED,
                  textDecoration: "none",
                  marginBottom: 10,
                  lineHeight: 1.4,
                  paddingLeft: 10,
                  borderLeft: "2px solid #e7dfd2",
                }}
              >
                {s.heading}
              </a>
            ))}
          </div>

          {/* Policy Sections */}
          <div style={{ flex: 1, minWidth: 0 }}>

           

            {policy.sections.map((section, i) => (
              <div
                key={i}
                id={`section-${i}`}
                style={{
                  marginBottom: 36,
                  padding: "28px 28px",
                  background: "#fff",
                  borderRadius: 8,
                  border: "1px solid #e7dfd2",
                  borderLeft: `4px solid ${GOLD}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: GOLD,
                    color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2,
                  }}>
                    {i + 1}
                  </div>
                  <h2 style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: DARK,
                    margin: 0,
                    fontFamily: "'Jost', sans-serif",
                    lineHeight: 1.4,
                  }}>
                    {section.heading}
                  </h2>
                </div>
                <p style={{
                  fontSize: 14,
                  color: MUTED,
                  lineHeight: 1.9,
                  margin: 0,
                  paddingLeft: 42,
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                }}>
                  {section.content}
                </p>
              </div>
            ))}

            {/* Contact Card */}
            <div style={{
              marginTop: 48,
              padding: "28px 28px",
              background: DARK,
              borderRadius: 8,
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 32 }}>📬</div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: 16, fontWeight: 700,
                  color: "#F8F6F2", margin: "0 0 8px",
                  fontFamily: "'Jost', sans-serif",
                }}>
                  Still have questions?
                </h3>
                <p style={{
                  fontSize: 13, color: "#c8b89a",
                  margin: "0 0 16px", lineHeight: 1.7,
                  fontFamily: "'Jost', sans-serif", fontWeight: 300,
                }}>
                  Our customer support team is available Monday to Saturday, 9 AM – 7 PM IST.
                  We aim to respond to all queries within 24 hours.
                </p>
                {/* ✅ FIX 2: restored missing opening <a tag */}
                <a
                  href="mailto:supportVika Vasthra2020@gmail.com"
                  style={{
                    display: "inline-block",
                    padding: "10px 24px",
                    background: GOLD,
                    color: "#fff",
                    fontSize: 13, fontWeight: 700,
                    textDecoration: "none",
                    borderRadius: 4,
                    fontFamily: "'Jost', sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  supportVika Vasthra2020@gmail.com
                </a>
              </div>
            </div>

            {/* Other Policies */}
            <div style={{ marginTop: 40 }}>
              <p style={{
                fontSize: 12, fontWeight: 700, color: "#aaa",
                letterSpacing: "0.15em", textTransform: "uppercase",
                marginBottom: 16, fontFamily: "'Jost', sans-serif",
              }}>
                Other Policies
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {allPolicies.filter(p => p.to !== `/${slug}` && p.to !== slug).map((p) => (
                  <Link
                    key={p.to}
                    to={p.to}
                    style={{
                      padding: "10px 18px",
                      border: `1px solid ${GOLD}`,
                      borderRadius: 4,
                      fontSize: 13,
                      color: GOLD,
                      textDecoration: "none",
                      fontFamily: "'Jost', sans-serif",
                      fontWeight: 600,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = GOLD; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = GOLD; }}
                  >
                    {p.label} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutOne>
  );
};

export default PolicyPage;