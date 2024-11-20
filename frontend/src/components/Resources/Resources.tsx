import { Container, Grid, Card, Image, Text, Button, Group, Stack } from '@mantine/core';
import { IconPhone, IconWorld, IconBrandTelegram } from '@tabler/icons-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface Resource {
  id: number;
  name: string;
  description: string;
  logo: string;
  contacts: {
    phone?: string;
    website?: string;
    text?: string;
  };
  emergency: boolean;
}

const resources: Resource[] = [
  {
    id: 1,
    name: '911 Emergency Services',
    description: 'For immediate emergency assistance. Available 24/7 for life-threatening situations and severe mental health crises.',
    logo: '/images/911.png',
    contacts: {
      phone: '911'
    },
    emergency: true
  },
  {
    id: 2,
    name: '988 Suicide & Crisis Lifeline',
    description: '24/7 confidential support for anyone experiencing mental health-related distress or thoughts of suicide.',
    logo: '/images/988.png',
    contacts: {
      phone: '988',
      text: '988',
      website: 'https://988lifeline.org'
    },
    emergency: true
  },
  {
    id: 3,
    name: 'uOttawa Health and Wellness',
    description: 'Professional counselling and mental health support services for uOttawa students.',
    logo: '/images/uottawa.png',
    contacts: {
      phone: '613-562-5200',
      website: 'https://www.uottawa.ca/wellness'
    },
    emergency: false
  },
];

export function Resources() {
  const { t } = useLanguage();

  return (
    <Container size="lg" py="xl">
      <Text size="xl" fw={700} ta="center" mb="xl">
        {t('resources.title')}
      </Text>
  
      <Grid>
        {resources.map((resource) => (
          <Grid.Col key={resource.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src={resource.logo}
                  height={200}
                  alt={t(`resources.${resource.id}.name`)}
                  fit="contain"
                  width={"auto"}
                  style={{ margin: '1rem 0' }}
                />
              </Card.Section>
  
              <Stack mt="md" gap="sm">
                <Text fw={500} size="lg" c={resource.emergency ? 'red' : undefined}>
                  {t(`resources.${resource.id}.name`)}
                </Text>
  
                <Text size="sm" c="dimmed">
                  {t(`resources.${resource.id}.description`)}
                </Text>
  
                <Group gap="xs">
                  {resource.contacts.phone && (
                    <Button 
                      variant="light" 
                      color={resource.emergency ? 'red' : 'blue'} 
                      leftSection={<IconPhone size={16} />}
                      component="a"
                      href={`tel:${resource.contacts.phone}`}
                    >
                      {t('resources.callButton')} {resource.contacts.phone}
                    </Button>
                  )}
  
                  {resource.contacts.website && (
                    <Button 
                      variant="light"
                      leftSection={<IconWorld size={16} />}
                      component="a"
                      href={resource.contacts.website}
                      target="_blank"
                    >
                      {t('resources.websiteButton')}
                    </Button>
                  )}
  
                  {resource.contacts.text && (
                    <Button 
                      variant="light"
                      leftSection={<IconBrandTelegram size={16} />}
                      component="a"
                      href={`sms:${resource.contacts.text}`}
                    >
                      {t('resources.textButton')} {resource.contacts.text}
                    </Button>
                  )}
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
