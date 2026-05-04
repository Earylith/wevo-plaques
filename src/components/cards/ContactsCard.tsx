"use client";

import { Phone, User, Warning, Wrench, ChatCircleDots, WhatsappLogo, EnvelopeSimple } from "@phosphor-icons/react";
import { ContactInfo } from "@/lib/types/accommodation";

interface ContactsCardProps {
  contacts: ContactInfo[];
}

export default function ContactsCard({ contacts }: ContactsCardProps) {
  if (!contacts || contacts.length === 0) return null;

  const getIcon = (type: ContactInfo["type"]) => {
    switch (type) {
      case "owner": return <User size={20} className="text-[#C4714A]" />;
      case "emergency": return <Warning size={20} className="text-red-500" />;
      case "service": return <Wrench size={20} className="text-[#2B5F75]" />;
      default: return <Phone size={20} className="text-[#6B5D4E]" />;
    }
  };

  const getBg = (type: ContactInfo["type"]) => {
    switch (type) {
      case "owner": return "bg-[#F7EBE4]";
      case "emergency": return "bg-red-50";
      case "service": return "bg-[#E4EEF3]";
      default: return "bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EDD9A3]/40">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#F7EBE4] flex items-center justify-center shrink-0">
          <Phone size={24} weight="duotone" color="#C4714A" />
        </div>
        <div>
          <h3 className="font-semibold text-[#2A2016]">Contacts utiles</h3>
          <p className="text-sm text-[#6B5D4E]">En cas de besoin</p>
        </div>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${getBg(contact.type)} flex items-center justify-center shrink-0`}>
                {getIcon(contact.type)}
              </div>
              <div>
                <p className="font-medium text-sm text-[#2A2016]">{contact.label}</p>
                <p className="text-xs text-[#6B5D4E]">{contact.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#EDD9A3]/40 text-[#C4714A] hover:bg-[#F7EBE4] transition-colors shadow-sm"
                title="Appeler"
              >
                <Phone size={16} weight="bold" />
              </a>
              <a 
                href={`sms:${contact.phone.replace(/\s+/g, '')}`}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#EDD9A3]/40 text-[#2B5F75] hover:bg-[#E4EEF3] transition-colors shadow-sm"
                title="Envoyer un SMS"
              >
                <ChatCircleDots size={16} weight="bold" />
              </a>
              {contact.whatsapp && (
                <a 
                  href={`https://wa.me/${contact.whatsapp.replace(/\s+/g, '').replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#EDD9A3]/40 text-[#5A7A4E] hover:bg-[#EBF0E6] transition-colors shadow-sm"
                  title="WhatsApp"
                >
                  <WhatsappLogo size={16} weight="bold" />
                </a>
              )}
              {contact.email && (
                <a 
                  href={`mailto:${contact.email}`}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#EDD9A3]/40 text-[#6B5D4E] hover:bg-gray-100 transition-colors shadow-sm"
                  title="Email"
                >
                  <EnvelopeSimple size={16} weight="bold" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
