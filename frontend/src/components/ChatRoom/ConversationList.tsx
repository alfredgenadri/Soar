import { Stack, Text, Button, ScrollArea, UnstyledButton } from '@mantine/core';
import { IconPlus, IconMessage } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConversationListProps {
  conversations: Array<{
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
  }>;
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
}

export const ConversationList = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewConversation,
}: ConversationListProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <Stack h="100%" gap="xs">
      <Button 
        leftSection={<IconPlus size={20} />}
        onClick={onNewConversation}
        fullWidth
      >
        {t('chat.newChat')}
      </Button>

      <ScrollArea h="calc(100vh - 180px)">
        <Stack gap="xs">
          {conversations.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center">
              {t('chat.startConversation')}
            </Text>
          ) : (
            conversations.map((conv) => (
              <UnstyledButton
                key={conv.id}
                onClick={() => onConversationSelect(conv.id)}
                p="md"
                style={{
                  backgroundColor: activeConversationId === conv.id ? '#f1f3f5' : 'transparent',
                  borderRadius: '8px',
                  width: '100%',
                }}
              >
                <Stack gap="xs">
                  <Text size="sm" lineClamp={1} fw={500}>
                    {conv.title}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {conv.lastMessage}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(conv.timestamp).toLocaleDateString()}
                  </Text>
                </Stack>
              </UnstyledButton>
            ))
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
};
