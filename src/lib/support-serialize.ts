import type { SupportConversationDTO, SupportMessageDTO } from "lib/strapi-support";

export function serializeMessage(m: SupportMessageDTO) {
  return {
    id: m.id,
    author: m.author,
    body: m.body,
    authorLabel: m.authorLabel,
    createdAt: m.createdAt,
  };
}

export function serializeConversationCustomer(c: SupportConversationDTO) {
  const msgs = c.messages || [];
  const last = msgs.length ? msgs[msgs.length - 1] : null;
  return {
    id: c.id,
    subject: c.subject,
    status: c.status,
    lastActivityAt: c.lastActivityAt,
    messageCount: msgs.length,
    lastPreview: last ? last.body.slice(0, 140) + (last.body.length > 140 ? "…" : "") : null,
  };
}

export function serializeConversationAdmin(c: SupportConversationDTO) {
  return {
    ...serializeConversationCustomer(c),
    userEmail: c.userEmail,
    strapiUserId: c.strapiUserId,
    needsReply:
      c.messages?.length > 0 && c.messages[c.messages.length - 1].author === "customer",
  };
}

export function serializeConversationFullCustomer(c: SupportConversationDTO) {
  return {
    id: c.id,
    subject: c.subject,
    status: c.status,
    lastActivityAt: c.lastActivityAt,
    messages: (c.messages || []).map(serializeMessage),
  };
}

export function serializeConversationFullAdmin(c: SupportConversationDTO) {
  return {
    ...serializeConversationFullCustomer(c),
    userEmail: c.userEmail,
    strapiUserId: c.strapiUserId,
  };
}
