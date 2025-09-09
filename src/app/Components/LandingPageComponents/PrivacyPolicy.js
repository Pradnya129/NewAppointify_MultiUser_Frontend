import React from 'react';

const PrivacyPolicy = () => {
  return (
    <section id="privacy-policy" className="container my-5">
      <h2 className="mb-3">Privacy Policy</h2>
      <p><strong>Last updated on Jul 19th, 2025</strong></p>

      <p>
        This privacy policy sets out how <strong>AURA ENTERPRISES</strong> uses and protects any information that you give AURA ENTERPRISES when you visit their website and/or agree to purchase from them.
      </p>

      <p>
        AURA ENTERPRISES is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, you can be assured that it will only be used in accordance with this privacy statement.
      </p>

      <p>
        AURA ENTERPRISES may change this policy from time to time by updating this page. You should check this page periodically to stay informed of any changes.
      </p>

      <h4>Information We May Collect</h4>
      <ul className="ps-3">
        <li>Name</li>
        <li>Contact information including email address</li>
        <li>Demographic information such as postcode, preferences and interests</li>
        <li>Other information relevant to customer surveys and/or offers</li>
      </ul>

      <h4>What We Do With the Information</h4>
      <ul className="ps-3">
        <li>Internal record keeping</li>
        <li>Improving our products and services</li>
        <li>Sending promotional emails about new products, offers, or updates</li>
        <li>Conducting market research via email, phone, fax, or mail</li>
        <li>Customizing the website based on your interests</li>
      </ul>

      <p>
        We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure, we have implemented suitable safeguards.
      </p>

      <h4>How We Use Cookies</h4>
      <p>
        {`A cookie is a small file placed on your computer's hard drive with your permission. Cookies help analyze web traffic and personalize your online experience.`}
      </p>

      <p>
        {`We use traffic log cookies to identify which pages are being visited. This helps us improve our website and tailor it to user needs. The information is used only for statistical analysis and is then removed from the system.`}
      </p>

      <p>
        {`Cookies do not give us access to your computer or any information other than what you choose to share. You can choose to accept or decline cookies in your browser settings.`}
      </p>

      <h4>Controlling Your Personal Information</h4>
      <ul className="ps-3">
        <li>{`You may choose to restrict the use of your information for direct marketing purposes by checking opt-out options on forms.`}</li>
        <li>{`You can revoke your consent at any time by contacting us.`}</li>
        <li>{`We will not sell or lease your personal information to third parties unless required by law or with your permission.`}</li>
        <li>{`We may send you promotional information about third parties if you've agreed to it.`}</li>
        <li>{`If you believe any information we hold is incorrect, contact us and we’ll correct it promptly.`}</li>
      </ul>

      <p>
        Address for correction: Flat No. 202, Chintamani Building, Prasoon Dham Society, Near Aditya Birla Hospital, Chinchwad, Pune, Maharashtra 411033.
      </p>

      <p className="text-muted">
        <strong>Disclaimer:</strong> {`The above content is created at AURA ENTERPRISES's sole discretion. Razorpay shall not be liable for any content provided here and shall not be responsible for any claims or liability arising from the merchant’s non-adherence to it.`}
      </p>
    </section>
  );
};

export default PrivacyPolicy;
