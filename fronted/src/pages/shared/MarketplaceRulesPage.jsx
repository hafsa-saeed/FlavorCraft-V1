import { Link } from "react-router-dom";
import { ArrowLeft, Scale, Users, ChefHat, ShoppingBag, Shield } from "lucide-react";

const sections = [
  {
    icon: Users,
    title: "For customers",
    blocks: [
      {
        h: "Orders & kitchens",
        p: "Every dish is prepared by an independent approved kitchen on FlavorCraft. When you place an order, you enter a direct fulfillment relationship with that kitchen for that order. Always check dish descriptions, allergens, spice levels, and customization notes before confirming checkout.",
      },
      {
        h: "Payments & pricing",
        p: "Listed prices include the dish as shown; add-ons and delivery/platform fees are shown at checkout before you pay. Promotional codes apply only when valid and displayed in the checkout summary. Cash on delivery and mobile-wallet options are offered for convenience; card details you enter in the app are for checkout flow only and are not stored as full card data on our servers.",
      },
      {
        h: "Cancellations & refunds",
        p: "Once a kitchen has started preparing your order, cancellation may not be possible. For late deliveries, wrong items, or quality issues, contact us through Contact with your order ID. We coordinate with the kitchen and may offer redelivery or account credit according to our investigation and platform policy.",
      },
      {
        h: "Reviews & conduct",
        p: "Be honest and respectful in feedback. Harassment, hate speech, or abuse toward kitchens or couriers is not allowed and may lead to account suspension.",
      },
      {
        h: "Account & data",
        p: "Keep your login secure. You are responsible for activity on your account. We use your profile information to deliver orders and communicate about your account; see Contact if you need changes or data questions.",
      },
    ],
  },
  {
    icon: ChefHat,
    title: "For vendor kitchens",
    blocks: [
      {
        h: "Approval & profile",
        p: "You may only sell after admin approval and completion of your kitchen profile (shop name, bio, city, contact). Information you provide must be truthful. Misrepresentation of location, hygiene, or licensing may result in removal from the platform.",
      },
      {
        h: "Menu accuracy",
        p: "Dishes, prices, ingredients, allergens, and availability must be kept accurate. Mark items unavailable when you cannot fulfill them. Repeated cancellations or no-shows after acceptance may affect your visibility on the marketplace.",
      },
      {
        h: "Order handling",
        p: "Accept only orders you can prepare within the stated preparation window. Update order status promptly (confirmed, preparing, out for delivery, delivered) so customers can track their meal. Use chef notes on each line item to honor customizations.",
      },
      {
        h: "Food safety & compliance",
        p: "You are responsible for local food-handling rules, packaging, and labeling. FlavorCraft does not replace regulatory inspections; we reserve the right to pause listings if we receive credible safety complaints.",
      },
      {
        h: "Fees & payouts",
        p: "Platform and delivery-related fees shown in your dashboard are part of the commercial terms you accept by selling here. Payout schedules and tax reporting are your responsibility; contact admin for disputes on recorded orders.",
      },
      {
        h: "Messaging & support",
        p: "Use in-app messaging for order-related communication with customers when enabled. For platform issues, payouts, or policy questions, use Dashboard → Contact admin so our team can track your ticket and reply with a status update.",
      },
    ],
  },
  {
    icon: Scale,
    title: "General marketplace rules",
    blocks: [
      {
        h: "Prohibited listings",
        p: "Illegal items, alcohol where restricted, unlicensed pharmaceuticals, or misleading health claims are prohibited. We may remove content without notice where required by law or safety.",
      },
      {
        h: "Disputes",
        p: "We encourage customers and kitchens to resolve small issues directly. Where that fails, FlavorCraft support may step in with a fair outcome based on order history and evidence provided by both sides.",
      },
      {
        h: "Changes to these rules",
        p: "We may update this document as the product evolves. Continued use of the platform after updates constitutes acceptance of the revised rules. Last updated: 2026.",
      },
    ],
  },
];

export default function MarketplaceRulesPage() {
  return (
    <div
      className="min-h-screen bg-[#09090b]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
            🔥
          </div>
          <span
            className="text-white font-black text-xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            FlavorCraft
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/about"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Contact
          </Link>
          <Link to="/" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Feed
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-400 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center">
            <Shield className="text-orange-400" size={22} />
          </div>
          <div>
            <h1
              className="text-3xl sm:text-4xl font-black text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Marketplace rules
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              How FlavorCraft works for customers and kitchens. Static reference —
              contact admin if anything is unclear for your situation.
            </p>
          </div>
        </div>

        <div className="space-y-12 mt-10">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section key={sec.title}>
                <div className="flex items-center gap-2 mb-6">
                  <Icon size={18} className="text-orange-400" />
                  <h2
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {sec.title}
                  </h2>
                </div>
                <div className="space-y-6">
                  {sec.blocks.map((b) => (
                    <div
                      key={b.h}
                      className="bg-[#111] border border-white/[0.06] rounded-2xl p-5"
                    >
                      <h3 className="text-white font-semibold text-sm mb-2">{b.h}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{b.p}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-14 flex items-start gap-3 bg-orange-500/[0.06] border border-orange-500/15 rounded-xl p-4">
          <ShoppingBag size={18} className="text-orange-400 shrink-0 mt-0.5" />
          <p className="text-gray-500 text-xs leading-relaxed">
            These rules are a living summary of how we expect the marketplace to
            behave. Your actual rights may also depend on local law. For
            complaints about the platform itself, use{" "}
            <Link to="/contact" className="text-orange-400 hover:underline">
              Contact
            </Link>{" "}
            (customers) or{" "}
            <span className="text-orange-400/90">Contact admin</span> from your
            vendor dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
