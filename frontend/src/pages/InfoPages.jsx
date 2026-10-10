import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
Droplets,
Target,
HeartHandshake,
ShieldCheck,
Truck,
Clock,
CreditCard,
Package,
MapPin,
Mail,
Phone,
MessageCircle,
ArrowLeft,
CheckCircle,
HelpCircle,
} from "lucide-react";

import "./InfoPages.css";

const pageContent = {
"/about": {
eyebrow: "GET TO KNOW US",
title: "About WaterFlow",
subtitle:
"Water delivery made simple, convenient, and reliable.",
description:
"WaterFlow is a water delivery and refill management platform designed to make ordering drinking water easier for households and businesses. Our platform brings water products, ordering, payments, and delivery management together in one convenient place.",
heading: "Making water ordering easier",
paragraphs: [
"We understand that keeping drinking water available at home or at work should not be complicated. WaterFlow provides a convenient way to explore available water products, place orders, and follow your orders through the delivery process.",
"Through our online platform, customers can manage their orders, review their order history, and explore recurring delivery subscriptions.",
"Our goal is to make the water ordering experience straightforward, transparent, and convenient from start to finish.",
],
icon: Droplets,
},

"/mission": {
eyebrow: "OUR PURPOSE",
title: "Our Mission",
subtitle:
"Making water ordering more accessible and convenient.",
description:
"Our mission is to simplify the way people order and manage drinking water by providing a convenient digital platform that connects customers with water products and delivery services.",
heading: "What guides our mission",
paragraphs: [
"Convenience: We make it easier for customers to browse products and place orders without unnecessary complications.",
"Reliability: We aim to provide a clear ordering and delivery process so customers can understand the progress of their orders.",
"Transparency: We want customers to have clear information about available products, prices, payments, and order status.",
"Continuous improvement: We aim to improve the customer experience through practical technology and useful service features.",
],
icon: Target,
},

"/why-waterflow": {
eyebrow: "THE WATERFLOW DIFFERENCE",
title: "Why Choose WaterFlow?",
subtitle:
"A simpler way to manage your water deliveries.",
description:
"WaterFlow brings the essential parts of water ordering into one platform, helping you manage your water needs with greater convenience.",
heading: "Designed around your needs",
paragraphs: [
"Easy online ordering: Browse available water products and place your order through our website.",
"Clear pricing: Review product prices before adding items to your cart.",
"Convenient payments: Our platform supports M-Pesa payment initiation for eligible orders.",
"Order visibility: Check your order history and view the status of your orders.",
"Recurring deliveries: Explore subscription options for customers who need water regularly.",
"Organised delivery management: Our system supports delivery assignments and delivery-status updates.",
],
icon: HeartHandshake,
},

"/contact": {
eyebrow: "WE ARE HERE TO HELP",
title: "Contact Us",
subtitle:
"Have a question about your order or using WaterFlow? Get in touch.",
description:
"For enquiries about products, orders, payments, deliveries, or subscriptions, use the contact details below or send us a message.",
heading: "Send us an enquiry",
icon: MessageCircle,
},

"/help-support": {
eyebrow: "CUSTOMER SUPPORT",
title: "Help & Support",
subtitle:
"Find answers to common questions about using WaterFlow.",
description:
"We've put together some helpful information to guide you through ordering water, making payments, and managing your account.",
heading: "Frequently asked questions",
icon: HelpCircle,
},
};

const faqs = [
{
question: "How do I order water?",
answer:
"Open the Products page, browse the available water products, add your chosen items to your cart, and proceed to checkout.",
},
{
question: "How do I pay for my order?",
answer:
"Follow the checkout and payment instructions. Where M-Pesa is available, enter the requested phone number and follow the payment prompt on your phone.",
},
{
question: "Where can I check my order?",
answer:
"Open My Orders from the website navigation to review your orders and check the available order-status information.",
},
{
question: "Can I schedule recurring deliveries?",
answer:
"Visit the Subscriptions page to explore the available recurring delivery options and manage your subscriptions.",
},
{
question: "What should I do if a payment or order has a problem?",
answer:
"Check your order status first. If the issue remains unresolved, contact the WaterFlow support team using the contact details on our Contact Us page.",
},
{
question: "How do I access my account?",
answer:
"Use the login page to access your account. If you do not have an account, visit the registration page to create one.",
},
];

export default function InfoPages() {
const location = useLocation();
const page = pageContent[location.pathname];
const PageIcon = page?.icon;

if (!page) {
return ( <main className="info-page"> <div className="info-not-found"> <h1>Page not found</h1> <p>Sorry, we couldn't find the page you requested.</p> <Link to="/products" className="info-primary-button">
Explore Products </Link> </div> <CustomerFooter /> </main>
);
}

return ( <main className="info-page"> <section className="info-hero"> <div className="info-hero-inner">  
       <div className="info-hero-content">
        <div className="info-hero-icon">
          <PageIcon size={32} />
        </div>

        <span className="info-eyebrow">{page.eyebrow}</span>

        <h1>{page.title}</h1>

        <p className="info-hero-subtitle">{page.subtitle}</p>

        <p className="info-hero-description">{page.description}</p>

        {location.pathname !== "/contact" &&
          location.pathname !== "/help-support" && (
            <Link to="/products" className="info-primary-button">
              Explore Our Products
            </Link>
          )}
      </div>
    </div>
  </section>

  {location.pathname === "/about" && (
    <section className="info-content-section">
      <div className="info-content-inner">
        <div className="info-section-heading">
          <span className="info-eyebrow">WHO WE ARE</span>
          <h2>{page.heading}</h2>
        </div>

        <div className="info-paragraphs">
          {page.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="info-highlight">
          <Droplets size={30} />
          <div>
            <h3>Water delivery made simple</h3>
            <p>
              Discover a convenient way to order water and manage your
              deliveries with WaterFlow.
            </p>
          </div>
        </div>
      </div>
    </section>
  )}

  {location.pathname === "/mission" && (
    <section className="info-content-section">
      <div className="info-content-inner">
        <div className="info-section-heading">
          <span className="info-eyebrow">OUR COMMITMENT</span>
          <h2>{page.heading}</h2>
        </div>

        <div className="info-feature-grid">
          {[
            {
              icon: Target,
              title: "Convenience",
              text: "Make browsing products and placing orders straightforward.",
            },
            {
              icon: ShieldCheck,
              title: "Transparency",
              text: "Provide clear product prices and order-status information.",
            },
            {
              icon: HeartHandshake,
              title: "Customer Focus",
              text: "Build a service experience around customers' everyday water needs.",
            },
            {
              icon: CheckCircle,
              title: "Improvement",
              text: "Keep improving the platform to make ordering easier.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article className="info-feature-card" key={item.title}>
                <div className="info-card-icon">
                  <Icon size={24} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  )}

  {location.pathname === "/why-waterflow" && (
    <section className="info-content-section">
      <div className="info-content-inner">
        <div className="info-section-heading">
          <span className="info-eyebrow">BUILT FOR CONVENIENCE</span>
          <h2>{page.heading}</h2>
        </div>

        <div className="info-feature-grid">
          {[
            {
              icon: Package,
              title: "Easy Ordering",
              text: "Browse available products and order from one place.",
            },
            {
              icon: CreditCard,
              title: "M-Pesa Payments",
              text: "Follow the available payment process directly from your order.",
            },
            {
              icon: Truck,
              title: "Delivery Updates",
              text: "View the order and delivery-status information available to you.",
            },
            {
              icon: Clock,
              title: "Recurring Orders",
              text: "Explore subscriptions to help manage regular water deliveries.",
            },
            {
              icon: ShieldCheck,
              title: "Clear Information",
              text: "Review product prices and your order details before proceeding.",
            },
            {
              icon: HeartHandshake,
              title: "Customer Convenience",
              text: "Access your orders and key customer features from one platform.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article className="info-feature-card" key={item.title}>
                <div className="info-card-icon">
                  <Icon size={24} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>

        <div className="info-center-action">
          <Link to="/products" className="info-primary-button">
            Start Shopping
          </Link>
        </div>
      </div>
    </section>
  )}

  {location.pathname === "/contact" && (
    <section className="info-content-section">
      <div className="info-content-inner">
        <div className="info-section-heading">
          <span className="info-eyebrow">GET IN TOUCH</span>
          <h2>How can we help?</h2>
          <p>
            Choose a contact option or send your enquiry using the form.
          </p>
        </div>

        <div className="info-contact-grid">
          <article className="info-contact-card">
            <div className="info-card-icon">
              <Mail size={24} />
            </div>
            <h3>Email Support</h3>
            <p>Send us an email about your enquiry.</p>
            <a href="mailto:support@waterflow.co.ke">
              support@waterflow.co.ke
            </a>
          </article>

          <article className="info-contact-card">
            <div className="info-card-icon">
              <Phone size={24} />
            </div>
            <h3>Phone Support</h3>
            <p>Use the phone contact currently listed by WaterFlow.</p>
            <a href="tel:+254700000000">+254 700 000 000</a>
          </article>

          <article className="info-contact-card">
            <div className="info-card-icon">
              <MapPin size={24} />
            </div>
            <h3>Delivery Enquiries</h3>
            <p>
              Contact us if you need assistance understanding your order
              or delivery status.
            </p>
            <Link to="/orders">View My Orders</Link>
          </article>
        </div>

        <div className="info-contact-form-wrapper">
          <h2>Send us a message</h2>
          <p>
            Complete the form to prepare an enquiry using your email
            application.
          </p>

          <form
            className="info-contact-form"
            onSubmit={(event) => {
              event.preventDefault();

              const form = event.currentTarget;
              const data = new FormData(form);

              const name = data.get("name");
              const email = data.get("email");
              const topic = data.get("topic");
              const message = data.get("message");

              const subject = encodeURIComponent(
                `WaterFlow Enquiry: ${topic}`
              );

              const body = encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\nMessage:\n${message}`
              );

              window.location.href =
                `mailto:support@waterflow.co.ke?subject=${subject}&body=${body}`;
            }}
          >
            <div className="info-form-row">
              <label>
                Full Name
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>

            <label>
              Enquiry Type
              <select name="topic" defaultValue="General Enquiry" required>
                <option>General Enquiry</option>
                <option>Product Enquiry</option>
                <option>Order or Delivery</option>
                <option>M-Pesa Payment</option>
                <option>Subscription</option>
                <option>Account Support</option>
              </select>
            </label>

            <label>
              Your Message
              <textarea
                name="message"
                rows="5"
                placeholder="Tell us how we can help..."
                required
              />
            </label>

            <button type="submit" className="info-primary-button">
              <Mail size={17} />
              Prepare Email
            </button>
          </form>

          <p className="info-form-note">
            Submitting this form opens your email application. It does
            not send a message directly through the WaterFlow website.
          </p>
        </div>
      </div>
    </section>
  )}

  {location.pathname === "/help-support" && (
    <section className="info-content-section">
      <div className="info-content-inner">
        <div className="info-section-heading">
          <span className="info-eyebrow">QUICK ANSWERS</span>
          <h2>{page.heading}</h2>
          <p>
            Select a question to see the answer.
          </p>
        </div>

        <div className="info-faq-list">
          {faqs.map((faq, index) => (
            <details className="info-faq-item" key={faq.question}>
              <summary>
                <span className="info-faq-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{faq.question}</span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="info-highlight info-support-highlight">
          <MessageCircle size={30} />
          <div>
            <h3>Still need help?</h3>
            <p>
              If your question is not answered here, contact our support
              team for further assistance.
            </p>
            <Link to="/contact" className="info-text-link">
              Contact WaterFlow Support
            </Link>
          </div>
        </div>
      </div>
    </section>
  )}

   
</main>
 
);
}
