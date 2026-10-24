export type Role = "visitor" | "ai" | "owner";

export type Card =
  | { type: "cv"; url: string; label: string }
  | { type: "booking"; url: string; label: string }
  | {
      type: "project";
      slug: string;
      title: string;
      category: string;
      image?: string;
      url: string;
    };

export type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  at: number;
  cards?: Card[];
};

/**
 * ai        – the digital Joshua is handling the chat.
 * escalated – Joshua has been pinged; the AI keeps holding the fort.
 * human     – Joshua took over; the AI stays silent.
 * closed    – chat ended by Joshua.
 */
export type ConversationStatus = "ai" | "escalated" | "human" | "closed";

export type Escalation = {
  reason: string;
  summary: string;
  urgency: "normal" | "urgent";
  at: number;
};

export type Conversation = {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: ConversationStatus;
  visitor: { name?: string; email?: string };
  page?: string;
  messages: ChatMessage[];
  escalation?: Escalation;
  /** Owner has unread visitor activity. */
  unread: boolean;
  /** Last time the owner was pinged, used to throttle notifications. */
  notifiedAt?: number;
};

export type StreamEvent =
  | { type: "meta"; conversationId: string }
  | { type: "delta"; text: string }
  | { type: "card"; card: Card }
  | { type: "status"; status: ConversationStatus }
  | { type: "done"; messageId: string | null; status: ConversationStatus }
  | { type: "error"; code: string; message: string };
