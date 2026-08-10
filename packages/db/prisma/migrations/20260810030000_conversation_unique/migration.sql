-- Conversa unica por contato+canal (suporte ao upsert do pull de chats do Evolution)
CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_contact_channel_key" ON "Conversation" ("contact", "channel");
